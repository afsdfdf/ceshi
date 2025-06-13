const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// 默认本地连接，如果没有设置环境变量
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/forum-db";

// 管理员账户信息
const adminUser = {
  name: process.env.ADMIN_NAME || 'Admin',
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  password: process.env.ADMIN_PASSWORD || 'admin123',
  isAdmin: true,
  createdAt: new Date()
};

async function createAdmin() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('已连接到MongoDB');
    
    const db = client.db(process.env.MONGODB_DB || 'forum-db');
    
    // 检查是否已存在管理员用户
    const existingAdmin = await db.collection('users').findOne({ email: adminUser.email });
    
    if (existingAdmin) {
      console.log('管理员用户已存在，无需重新创建');
      console.log(`管理员邮箱: ${existingAdmin.email}`);
      return;
    }
    
    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminUser.password, salt);
    
    // 创建管理员账户
    const result = await db.collection('users').insertOne({
      ...adminUser,
      password: hashedPassword
    });
    
    console.log('管理员用户创建成功!');
    console.log(`ID: ${result.insertedId}`);
    console.log(`名称: ${adminUser.name}`);
    console.log(`邮箱: ${adminUser.email}`);
    console.log(`密码: ${adminUser.password} (明文密码仅显示一次，请记住)`);
    
  } catch (error) {
    console.error('创建管理员用户时出错:', error);
  } finally {
    await client.close();
    console.log('MongoDB连接已关闭');
  }
}

createAdmin().catch(console.error); 