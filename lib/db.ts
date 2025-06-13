import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/forum-db";
const options = {};

// Define interface for global with MongoDB client
interface GlobalWithMongo {
  _mongoClientPromise?: Promise<MongoClient>;
}

// Extend the global object with our custom type
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  console.warn('请在.env.local文件中设置MONGODB_URI环境变量。目前使用默认本地连接。');
}

if (process.env.NODE_ENV === 'development') {
  // 在开发模式下使用全局变量以保持热重载期间的连接
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // 在生产环境中为每个请求创建新的连接
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * 连接到MongoDB数据库
 * @returns {Promise<Db>} 返回数据库实例
 */
export async function connectDB(): Promise<Db> {
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || 'forum-db');
}

// Export a searchDB object with recordSearch method
export const searchDB = {
  async recordSearch(chain: string, address: string): Promise<void> {
    try {
      const db = await connectDB();
      await db.collection('searches').insertOne({
        chain,
        address,
        timestamp: new Date()
      });
      console.log(`Recorded search for ${chain}:${address}`);
    } catch (error) {
      console.error('Error recording search:', error);
    }
  }
};

export default clientPromise; 