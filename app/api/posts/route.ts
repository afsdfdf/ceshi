import { NextResponse } from 'next/server';
import { getPosts, createPost } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const posts = await getPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: '获取帖子失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { title, content, author_name } = data;
    
    if (!title || !content) {
      return NextResponse.json({ error: '标题和内容不能为空' }, { status: 400 });
    }

    const post = {
      title,
      content,
      author_name: author_name || '匿名用户',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_pinned: false,
      likes: 0,
      comment_count: 0
    };

    const createdPost = await createPost(post);
    return NextResponse.json({ id: createdPost.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: '创建帖子失败' }, { status: 500 });
  }
} 