const fs = require('fs');
const path = require('path');

// .env.local文件内容
const envContent = `# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Admin权限配置
NEXT_PUBLIC_ADMIN_TOKEN=admin123

# NextAuth配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production

# 管理员账户配置 (首次运行后可以移除这些配置)
ADMIN_NAME=管理员
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123`;

// 文件路径
const envPath = path.join(__dirname, '..', '.env.local');

// 写入文件
fs.writeFileSync(envPath, envContent);

console.log('.env.local文件已创建!');
console.log(`路径: ${envPath}`);
console.log('请替换Supabase URL和匿名密钥为您的实际项目值'); 