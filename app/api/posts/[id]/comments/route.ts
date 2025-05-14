import { NextResponse } from 'next/server';
import { getPostById, getCommentsByPostId, createComment } from '@/lib/supabase';

export async function GET(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    // Verify post exists
    const post = await getPostById(params.id);
    if (!post) {
      return NextResponse.json({ error: '帖子不存在' }, { status: 404 });
    }
    
    // Get comments for this post
    const comments = await getCommentsByPostId(params.id);
    
    return NextResponse.json(comments);
  } catch (error) {
    console.error('获取评论失败:', error);
    return NextResponse.json({ error: '获取评论失败' }, { status: 500 });
  }
}

export async function POST(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { content, author_name } = data;
    
    if (!content || !content.trim()) {
      return NextResponse.json({ error: '评论内容不能为空' }, { status: 400 });
    }
    
    // Verify post exists
    const post = await getPostById(params.id);
    if (!post) {
      return NextResponse.json({ error: '帖子不存在' }, { status: 404 });
    }
    
    // Create comment
    const comment = {
      post_id: params.id,
      author_name: author_name || '匿名用户',
      content: content.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const createdComment = await createComment(comment);
    
    return NextResponse.json(createdComment, { status: 201 });
  } catch (error) {
    console.error('发表评论失败:', error);
    return NextResponse.json({ error: '发表评论失败' }, { status: 500 });
  }
} 