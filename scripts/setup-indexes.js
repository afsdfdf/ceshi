const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('环境变量不完整: 请在 .env.local 文件中设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupIndexes() {
  try {
    console.log('正在连接到 Supabase...');
    
    // 在 Supabase 中，我们可以使用 RPC 调用运行自定义 SQL
    // 注意：创建索引需要在 Supabase 的 SQL 编辑器中执行，或者通过服务端 API
    // 以下是生成 SQL 语句以便您在 SQL 编辑器中执行
    
    console.log('\n====== 请在 Supabase SQL 编辑器中执行以下 SQL 语句 ======\n');
    
    // Posts 表索引
    console.log('-- Posts 表索引');
    console.log('CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC);');
    console.log('CREATE INDEX IF NOT EXISTS idx_posts_is_pinned_created_at ON posts (is_pinned DESC, created_at DESC);');
    console.log('CREATE INDEX IF NOT EXISTS idx_posts_title_content ON posts USING GIN (to_tsvector(\'simple\', title || \' \' || content));');
    
    // Comments 表索引
    console.log('\n-- Comments 表索引');
    console.log('CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments (post_id);');
    console.log('CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments (created_at DESC);');
    
    // Users 表索引 - email 已经是唯一约束
    console.log('\n-- Users 表索引 (email 已经是唯一约束)');
    console.log('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);');
    
    console.log('\n====== 请在 Supabase SQL 编辑器中执行以上 SQL 语句 ======\n');
    
    console.log('\n索引设置指南已生成。由于安全限制，您需要在 Supabase 控制面板的 SQL 编辑器中手动执行这些命令。');
  } catch (error) {
    console.error('生成索引设置时出错:', error);
  }
}

setupIndexes().catch(console.error); 