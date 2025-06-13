import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// 配置Cloudinary
cloudinary.config({
  cloud_name: 'dhmdi4wm4',
  api_key: '448497671135489',
  api_secret: 'iL68AlrLPgO1c-r22a2apRwTvYw',
  secure: true
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.image) {
      return NextResponse.json({ error: '未提供图片数据' }, { status: 400 });
    }
    
    // 从base64数据上传图片
    const result = await cloudinary.uploader.upload(data.image, {
      folder: 'xai-chat',
      resource_type: 'image',
    });
    
    // 返回图片URL
    return NextResponse.json({ 
      url: result.secure_url,
      success: true 
    });
    
  } catch (error: any) {
    console.error('图片上传失败:', error);
    return NextResponse.json({ 
      error: '图片上传失败', 
      details: error.message 
    }, { status: 500 });
  }
} 