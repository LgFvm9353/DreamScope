import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { initDatabase } from '@/config/initDb';
import { existsSync } from 'fs';

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 确保数据库已初始化
initDatabase().catch(console.error);

export async function POST(request) {
  try {
    // 验证用户身份
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: '未授权访问' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let userId;
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    } catch (error) {
      return NextResponse.json(
        { message: '令牌无效' },
        { status: 401 }
      );
    }

    // 处理文件上传
    const formData = await request.formData();
    const file = formData.get('image');
    
    if (!file) {
      return NextResponse.json(
        { message: '未找到上传的图片' },
        { status: 400 }
      );
    }

    // 获取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 生成唯一文件名
    const fileExt = file.name.split('.').pop().toLowerCase();
    const fileName = `${uuidv4()}.${fileExt}`;
    
    // 确保上传目录存在
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // 如果目录不存在，创建它
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    // 保存文件到public/uploads目录
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    
    console.log(`文件已保存到: ${filePath}`);
    
    // 构建文件URL
    const fileUrl = `/uploads/${fileName}`;
    
    return NextResponse.json({
      message: '图片上传成功',
      url: fileUrl
    });
  } catch (error) {
    console.error('图片上传错误:', error);
    return NextResponse.json(
      { message: '服务器错误', error: error.message },
      { status: 500 }
    );
  }
}