# MongoDB 到 Supabase 迁移总结

本文档记录了将论坛应用从 MongoDB 迁移到 Supabase 的过程和更改内容。

## 1. 已完成的更改

### 代码结构更改

- 移除了所有 MongoDB 依赖和引用
- 创建了 Supabase 客户端和辅助函数
- 更新了所有 API 路由以使用 Supabase
- 更新了身份验证逻辑以使用 Supabase
- 修改了管理员权限验证方式

### 数据库架构转换

- 将 MongoDB 集合转换为 Supabase 表格
- 修改了字段名称（从驼峰命名法改为下划线命名法）
- 为 Supabase 创建了行级安全策略
- 设置了适当的索引

### 工具脚本更新

- 更新了 `create-admin.js` 以使用 Supabase
- 更新了 `setup-indexes.js` 以生成 Supabase 索引 SQL
- 更新了 `.env.local` 模板

## 2. 数据库架构

### Posts 表

```sql
CREATE TABLE posts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT '匿名用户',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_pinned BOOLEAN DEFAULT FALSE,
  likes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0
);
```

### Comments 表

```sql
CREATE TABLE comments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT '匿名用户',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Users 表

```sql
CREATE TABLE users (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 3. 环境变量

迁移后，需要以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ADMIN_TOKEN=your-admin-token
```

## 4. 功能变更

### 身份验证
- 现在使用 Supabase 身份验证 + NextAuth
- 管理员功能现在基于环境变量中的管理员令牌

### 数据访问
- 所有的数据访问现在通过 Supabase API
- 增加了对 RLS 的支持，提供更好的安全性

## 5. 后续步骤

1. 创建 Supabase 项目
2. 在 Supabase 中运行 SQL 创建表和索引
3. 配置 `.env.local` 文件
4. 运行 `npm run dev` 测试应用
5. 部署到 Vercel 并配置环境变量 