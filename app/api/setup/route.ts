import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'

// 创建专用的服务端Supabase客户端（使用service_role密钥）
// 注意：在实际生产环境中，应该使用环境变量来存储这些密钥
const supabase = createClient(
  'https://etokvaxubxdtdrkxbusf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0b2t2YXh1YnhkdGRya3hidXNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzI1ODQ5MCwiZXhwIjoyMDYyODM0NDkwfQ.xsN__jMNuPrqepKvin1e9iMSdZOEynBkLMKZXuf57gs'
)

/**
 * 初始化数据库、创建表和添加测试数据
 * 本API仅用于初始化应用，生产环境中应该限制访问
 */
export async function GET() {
  try {
    // 创建数据库表
    await createTables()
    
    // 创建管理员账户
    await createAdminUser()
    
    // 添加测试数据
    await addSampleData()
    
    return NextResponse.json({ success: true, message: '数据库初始化成功' });
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return NextResponse.json({ success: false, error: `数据库初始化失败: ${error}` }, { status: 500 });
  }
}

/**
 * 创建数据库表
 */
async function createTables() {
  try {
    console.log('开始创建数据表...');
    
    // 创建profiles表
    const createProfilesSQL = `
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        username TEXT NOT NULL,
        email TEXT,
        avatar_url TEXT,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      -- 添加必要的索引
      CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);
      
      -- 设置行级安全策略
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      
      -- 创建安全策略
      DROP POLICY IF EXISTS "允许用户查看所有资料" ON profiles;
      CREATE POLICY "允许用户查看所有资料" 
        ON profiles FOR SELECT 
        USING (true);
        
      DROP POLICY IF EXISTS "允许用户更新自己的资料" ON profiles;
      CREATE POLICY "允许用户更新自己的资料" 
        ON profiles FOR UPDATE 
        USING (auth.uid() = id);
    `;
    
    // 创建posts表
    const createPostsSQL = `
      CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        author_name TEXT NOT NULL,
        author_avatar TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_pinned BOOLEAN DEFAULT FALSE,
        likes INTEGER DEFAULT 0,
        comment_count INTEGER DEFAULT 0
      );
      
      -- 添加必要的索引
      CREATE INDEX IF NOT EXISTS posts_author_id_idx ON posts(author_id);
      CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at);
      CREATE INDEX IF NOT EXISTS posts_is_pinned_idx ON posts(is_pinned);
      
      -- 设置行级安全策略
      ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
      
      -- 创建安全策略
      DROP POLICY IF EXISTS "允许查看所有帖子" ON posts;
      CREATE POLICY "允许查看所有帖子" 
        ON posts FOR SELECT 
        USING (true);
        
      DROP POLICY IF EXISTS "允许用户创建帖子" ON posts;
      CREATE POLICY "允许用户创建帖子" 
        ON posts FOR INSERT 
        WITH CHECK (
          -- 允许匿名发帖(author_id为null)或用户发帖
          (author_id IS NULL) OR (auth.uid() = author_id)
        );
        
      DROP POLICY IF EXISTS "允许作者或管理员更新帖子" ON posts;
      CREATE POLICY "允许作者或管理员更新帖子" 
        ON posts FOR UPDATE 
        USING (
          auth.uid() = author_id OR 
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
          )
        );
        
      DROP POLICY IF EXISTS "允许作者或管理员删除帖子" ON posts;
      CREATE POLICY "允许作者或管理员删除帖子" 
        ON posts FOR DELETE 
        USING (
          auth.uid() = author_id OR 
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
          )
        );
    `;
    
    // 创建comments表
    const createCommentsSQL = `
      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        author_name TEXT NOT NULL,
        author_avatar TEXT,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      -- 添加必要的索引
      CREATE INDEX IF NOT EXISTS comments_post_id_idx ON comments(post_id);
      CREATE INDEX IF NOT EXISTS comments_author_id_idx ON comments(author_id);
      CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at);
      
      -- 设置行级安全策略
      ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
      
      -- 创建安全策略
      DROP POLICY IF EXISTS "允许查看所有评论" ON comments;
      CREATE POLICY "允许查看所有评论" 
        ON comments FOR SELECT 
        USING (true);
        
      DROP POLICY IF EXISTS "允许用户创建评论" ON comments;
      CREATE POLICY "允许用户创建评论" 
        ON comments FOR INSERT 
        WITH CHECK (
          -- 允许匿名评论(author_id为null)或用户评论
          (author_id IS NULL) OR (auth.uid() = author_id)
        );
        
      DROP POLICY IF EXISTS "允许作者或管理员更新评论" ON comments;
      CREATE POLICY "允许作者或管理员更新评论" 
        ON comments FOR UPDATE 
        USING (
          auth.uid() = author_id OR 
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
          )
        );
        
      DROP POLICY IF EXISTS "允许作者或管理员删除评论" ON comments;
      CREATE POLICY "允许作者或管理员删除评论" 
        ON comments FOR DELETE 
        USING (
          auth.uid() = author_id OR 
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
          )
        );
    `;
    
    // 执行SQL创建表
    await supabase.rpc('exec_sql', { sql: createProfilesSQL });
    await supabase.rpc('exec_sql', { sql: createPostsSQL });
    await supabase.rpc('exec_sql', { sql: createCommentsSQL });
    
    console.log('数据表创建完成');
    
    return true;
  } catch (error) {
    console.error('创建数据表失败:', error);
    throw error;
  }
}

/**
 * 创建管理员账户
 */
async function createAdminUser() {
  try {
    console.log('开始创建管理员用户...');
    
    // 检查是否已存在管理员账户
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_admin', true)
      .limit(1);
    
    if (admins && admins.length > 0) {
      console.log('已存在管理员账户，跳过创建');
      return;
    }
    
    // 创建管理员用户
    const adminEmail = 'admin@example.com';
    const adminPassword = 'Admin@123'; // 实际应用中应使用安全密码
    
    // 先检查用户是否已存在
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const adminExists = existingUser?.users.some(user => user.email === adminEmail);
    
    if (!adminExists) {
      // 创建管理员用户
      const { data, error } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.user) {
        // 创建管理员资料
        await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: 'Admin',
            email: adminEmail,
            is_admin: true,
            created_at: new Date().toISOString()
          });
          
        console.log('管理员用户创建成功');
      }
    } else {
      console.log('管理员邮箱已存在，跳过创建');
    }
    
    return true;
  } catch (error) {
    console.error('创建管理员用户失败:', error);
    throw error;
  }
}

/**
 * 添加测试数据
 */
async function addSampleData() {
  try {
    console.log('开始添加示例数据...');
    
    // 检查是否已存在帖子
    const { data: existingPosts } = await supabase
      .from('posts')
      .select('id')
      .limit(1);
    
    if (existingPosts && existingPosts.length > 0) {
      console.log('已存在帖子数据，跳过创建');
      return;
    }
    
    // 创建示例帖子
    const samplePosts = [
      {
        title: '欢迎来到XAI社区',
        content: '这是一个分享加密货币知识、讨论投资策略的社区。欢迎所有对Web3和加密货币感兴趣的朋友加入交流！',
        author_name: '管理员',
        is_pinned: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        likes: 5,
        comment_count: 1
      },
      {
        title: '加密货币投资指南',
        content: '本帖将分享一些加密货币投资的基本原则和风险管理策略。记住：不要投资超过你能承受损失的金额。',
        author_name: '加密专家',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 一天前
        updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        likes: 3,
        comment_count: 0
      },
      {
        title: 'XAI代币未来展望',
        content: 'XAI代币作为一个创新项目，未来有很大的发展空间。大家对XAI的前景有什么看法？',
        author_name: '区块链爱好者',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 两天前
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        likes: 8,
        comment_count: 2
      }
    ];
    
    // 插入示例帖子
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .insert(samplePosts)
      .select();
    
    if (postsError) {
      throw postsError;
    }
    
    // 如果有帖子数据，添加示例评论
    if (posts && posts.length > 0) {
      const welcomePostId = posts[0].id;
      const xaiPostId = posts[2].id;
      
      const sampleComments = [
        {
          post_id: welcomePostId,
          author_name: '新用户',
          content: '感谢创建这个社区！希望能和大家一起学习交流。',
          created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12小时前
        },
        {
          post_id: xaiPostId,
          author_name: '币圈老兵',
          content: 'XAI的技术方案非常创新，解决了很多现有问题，看好其未来发展。',
          created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString() // 36小时前
        },
        {
          post_id: xaiPostId,
          author_name: '谨慎投资者',
          content: '任何投资都有风险，建议大家做好风险控制，适度参与。',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 24小时前
        }
      ];
      
      await supabase
        .from('comments')
        .insert(sampleComments);
    }
    
    console.log('示例数据添加完成');
    
    return true;
  } catch (error) {
    console.error('添加示例数据失败:', error);
    throw error;
  }
} 