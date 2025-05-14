const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('环境变量不完整: 请在 .env.local 文件中设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 管理员账户信息
const adminUser = {
  name: process.env.ADMIN_NAME || 'Admin',
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  password: process.env.ADMIN_PASSWORD || 'admin123',
  is_admin: true,
  created_at: new Date().toISOString()
};

async function createAdmin() {
  try {
    console.log('正在连接到 Supabase...');
    
    // 检查是否已存在管理员用户
    const { data: existingAdmin, error: searchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', adminUser.email)
      .single();
    
    if (searchError && searchError.code !== 'PGRST116') {
      // PGRST116是"没有找到结果"的错误，其他错误需要处理
      console.error('查询用户时出错:', searchError);
      return;
    }
    
    if (existingAdmin) {
      console.log('管理员用户已存在，无需重新创建');
      console.log(`管理员邮箱: ${existingAdmin.email}`);
      return;
    }
    
    // 密码加密
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);
    
    // 创建管理员账户
    const { data: newAdmin, error: insertError } = await supabase
      .from('users')
      .insert([{
        ...adminUser,
        password: hashedPassword
      }])
      .select()
      .single();
    
    if (insertError) {
      console.error('创建管理员用户时出错:', insertError);
      return;
    }
    
    console.log('管理员用户创建成功!');
    console.log(`ID: ${newAdmin.id}`);
    console.log(`名称: ${adminUser.name}`);
    console.log(`邮箱: ${adminUser.email}`);
    console.log(`密码: ${adminUser.password} (明文密码仅显示一次，请记住)`);
    
  } catch (error) {
    console.error('创建管理员用户时出错:', error);
  }
}

createAdmin().catch(console.error); 