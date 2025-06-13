const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

// 默认本地连接，如果没有设置环境变量
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/forum-db";

async function setupIndexes() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('已连接到MongoDB');
    
    const db = client.db(process.env.MONGODB_DB || 'forum-db');
    
    console.log('正在创建集合与索引...');
    
    // 确保集合存在
    const collections = ['posts', 'comments', 'users'];
    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName);
        console.log(`集合 ${collectionName} 已创建或已存在`);
      } catch (error) {
        if (error.code !== 48) { // 忽略"集合已存在"错误
          console.error(`创建集合 ${collectionName} 时出错:`, error);
        }
      }
    }
    
    // Posts 集合索引
    await db.collection('posts').createIndex({ createdAt: -1 });
    await db.collection('posts').createIndex({ isPinned: -1, createdAt: -1 });
    await db.collection('posts').createIndex({ authorId: 1 });
    await db.collection('posts').createIndex({ title: "text", content: "text" });
    console.log('Posts集合索引已创建');
    
    // Comments 集合索引
    await db.collection('comments').createIndex({ postId: 1 });
    await db.collection('comments').createIndex({ createdAt: -1 });
    await db.collection('comments').createIndex({ authorId: 1 });
    console.log('Comments集合索引已创建');
    
    // Users 集合索引
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('Users集合索引已创建');
    
    console.log('所有索引创建成功!');
  } catch (error) {
    console.error('创建索引时出错:', error);
  } finally {
    await client.close();
    console.log('MongoDB连接已关闭');
  }
}

setupIndexes().catch(console.error); 