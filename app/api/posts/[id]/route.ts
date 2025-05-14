import { NextResponse } from 'next/server';
import { getPostById, updatePost, deletePost } from '@/lib/supabase';

// Admin token for validation (in production, use a proper secret)
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN || "admin123";

export async function GET(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const post = await getPostById(params.id);
    
    if (!post) {
      return NextResponse.json({ error: '帖子不存在' }, { status: 404 });
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('获取帖子详情失败:', error);
    return NextResponse.json({ error: '获取帖子详情失败' }, { status: 500 });
  }
}

export async function PUT(
  request: Request, 
  { params }: { params: { id: string } }
) {
  // Get token from URL parameter
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  
  // Validate admin token
  if (!token || token !== ADMIN_TOKEN) {
    return NextResponse.json({ error: '无权限操作' }, { status: 403 });
  }
  
  try {
    const data = await request.json();
    const post = await getPostById(params.id);
    
    if (!post) {
      return NextResponse.json({ error: '帖子不存在' }, { status: 404 });
    }
    
    // Update pinned status
    if (data.isPinned !== undefined) {
      const updatedPost = await updatePost(params.id, {
        is_pinned: data.isPinned,
        updated_at: new Date().toISOString()
      });
      
      return NextResponse.json(updatedPost);
    }
    
    return NextResponse.json({ error: '无效的请求' }, { status: 400 });
  } catch (error) {
    console.error('更新帖子失败:', error);
    return NextResponse.json({ error: '更新帖子失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request, 
  { params }: { params: { id: string } }
) {
  // Get token from URL parameter
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  
  // Validate admin token
  if (!token || token !== ADMIN_TOKEN) {
    return NextResponse.json({ error: '无权限操作' }, { status: 403 });
  }
  
  try {
    // Check if post exists
    const post = await getPostById(params.id);
    
    if (!post) {
      return NextResponse.json({ error: '帖子不存在' }, { status: 404 });
    }
    
    // Delete post and its comments
    await deletePost(params.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除帖子失败:', error);
    return NextResponse.json({ error: '删除帖子失败' }, { status: 500 });
  }
} 