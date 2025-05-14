# Supabase Integration Guide

This document explains how to set up Supabase for the forum application.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project
3. Note your project URL and anon key (public API key)

## 2. Database Setup

Create the necessary tables in Supabase:

### Posts Table

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

### Comments Table

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

### Comment Count Function

Create a function to increment comment count:

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

### Users Table (For Authentication)

```sql
CREATE TABLE users (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Only allow users to read their own data
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid() = id);
```

## 3. Environment Setup

Create a `.env.local` file with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_ADMIN_TOKEN=your-admin-token
```

## 4. Row Level Security (Optional)

For better security, you can set up Row Level Security policies in Supabase:

```sql
-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Anyone can create posts" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Anyone can create comments" ON comments FOR INSERT WITH CHECK (true);
```

## 5. Vercel Integration

When deploying to Vercel, add the following environment variables in your Vercel project settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_ADMIN_TOKEN`

## 6. Admin Access

To become an admin:

1. Open your browser's developer console
2. Run: `localStorage.setItem('admin_token', 'your-admin-token')`
   
Replace 'your-admin-token' with the value of `NEXT_PUBLIC_ADMIN_TOKEN` from your environment variables. 