import { NextResponse } from 'next/server';
import Dream from '@/models/Dream';
import { initDatabase } from '@/config/initDb';
import jwt from 'jsonwebtoken';

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 确保数据库已初始化
initDatabase().catch(console.error);

// 获取单个梦境
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // 从请求头中获取令牌
    const authHeader = request.headers.get('Authorization');
    let userId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        // 验证令牌
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (error) {
        console.error('令牌验证失败:', error);
        return NextResponse.json(
          { message: '未授权' },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }
    
    // 查询梦境
    const dream = await Dream.findOne({
      where: {
        id: id,
        userId: userId
      }
    });
    
    if (!dream) {
      return NextResponse.json(
        { message: '梦境不存在或无权访问' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(dream);
  } catch (error) {
    console.error('获取梦境详情失败:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}