# Vercel + Supabase 部署指南

本文档指导如何将论坛应用部署到 Vercel，并与 Supabase 集成。

## 准备工作

1. 创建 [Supabase](https://supabase.com) 账户并创建一个新项目
2. 创建 [Vercel](https://vercel.com) 账户

## Supabase 设置

1. 在 Supabase 控制面板中，进入 SQL 编辑器，创建必要的表和函数：

### 创建帖子表

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

### 创建评论表

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

### 创建评论计数函数

```sql
CREATE OR REPLACE FUNCTION increment_comment_count(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET comment_count = comment_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;
```

### 创建用户表 (用于身份验证)

```sql
CREATE TABLE users (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 只允许用户读取自己的数据
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid() = id);
```

### 设置访问权限

```sql
-- 启用行级安全
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 创建访问策略
CREATE POLICY "Anyone can read posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Anyone can create posts" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Anyone can create comments" ON comments FOR INSERT WITH CHECK (true);
```

2. 在 Supabase 项目设置中，获取 URL 和匿名密钥 (anon key)

## Vercel 部署

1. 使用 GitHub 导入您的项目到 Vercel

2. 在部署设置中添加以下环境变量：

- `NEXT_PUBLIC_SUPABASE_URL`: 您的 Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 您的 Supabase 匿名密钥
- `NEXT_PUBLIC_ADMIN_TOKEN`: 管理员令牌（自定义一个安全的字符串）

3. 完成部署

## 管理员访问设置

要设置管理员访问权限：

1. 打开浏览器开发者控制台
2. 运行以下命令，将 'your-admin-token' 替换为您设置的管理员令牌：

```javascript
localStorage.setItem('admin_token', 'your-admin-token')
```

刷新页面后，您将拥有管理员权限，可以置顶或删除帖子。

## 本地开发

对于本地开发，创建 `.env.local` 文件：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ADMIN_TOKEN=your-admin-token
```

## 故障排除

- 如果遇到数据库连接问题，请确保您的 Supabase URL 和匿名密钥正确
- 如果管理员功能不工作，请确保 localStorage 中的令牌与环境变量中的令牌匹配
- 如果遇到 CORS 问题，请在 Supabase 项目设置中配置适当的 CORS 策略 