-- 创建profiles表（如果不存在）
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建posts表（如果不存在）
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id),
  author_name TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建comments表（如果不存在）
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id),
  author_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为profiles表启用RLS并设置策略
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 允许所有人查看所有用户资料
CREATE POLICY "公开查看用户资料" ON public.profiles
  FOR SELECT USING (true);

-- 允许用户插入自己的资料
CREATE POLICY "用户可以插入自己的资料" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 允许用户更新自己的资料
CREATE POLICY "用户可以更新自己的资料" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 为posts表启用RLS并设置策略
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 允许所有人查看所有帖子
CREATE POLICY "公开查看所有帖子" ON public.posts
  FOR SELECT USING (true);

-- 允许已验证用户创建帖子
CREATE POLICY "已验证用户可以创建帖子" ON public.posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 允许作者更新自己的帖子
CREATE POLICY "作者可以更新自己的帖子" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

-- 允许作者删除自己的帖子
CREATE POLICY "作者可以删除自己的帖子" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

-- 为comments表启用RLS并设置策略
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 允许所有人查看评论
CREATE POLICY "公开查看所有评论" ON public.comments
  FOR SELECT USING (true);

-- 允许已验证用户创建评论
CREATE POLICY "已验证用户可以创建评论" ON public.comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 允许作者删除自己的评论
CREATE POLICY "作者可以删除自己的评论" ON public.comments
  FOR DELETE USING (auth.uid() = author_id);

-- 创建触发器函数来更新帖子的评论数
CREATE OR REPLACE FUNCTION public.update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 添加触发器
DROP TRIGGER IF EXISTS update_post_comment_count ON public.comments;
CREATE TRIGGER update_post_comment_count
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.update_comment_count(); 