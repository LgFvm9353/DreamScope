import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { withAuth } from '@/utils/auth';
import { existsSync } from 'fs';

// 上传图片
export const POST = withAuth(async (request, { userId }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json(
        { message: '请选择要上传的图片' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: '只支持 JPEG、PNG 和 GIF 格式的图片' },
        { status: 400 }
      );
    }

    // 验证文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: '图片大小不能超过 5MB' },
        { status: 400 }
      );
    }

    // 生成唯一文件名
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    
    // 创建上传目录
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 保存文件
    const filePath = join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);

    // 返回文件URL
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      message: '图片上传成功',
      url: fileUrl
    });

  } catch (error) {
    console.error('图片上传失败:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}, true);