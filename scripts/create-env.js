const fs = require('fs');
const path = require('path');

// .env.local文件内容
const envContent = `# 数据库配置
MONGODB_URI=mongodb://localhost:27017/forum-db
MONGODB_DB=forum-db

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