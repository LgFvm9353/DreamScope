import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User';

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request) {
  try {
    // 从请求头中获取令牌
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // 验证令牌
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 获取请求体
    const body = await request.json();
    const { newPassword } = body;
    
    if (!newPassword) {
      return NextResponse.json(
        { message: '新密码不能为空' },
        { status: 400 }
      );
    }
    
    // 查找用户
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 更新密码
    user.password = newPassword;
    await user.save();
    
    return NextResponse.json({
      message: '密码更新成功'
    });
  } catch (error) {
    console.error('更新密码错误:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { message: '无效的令牌' },
        { status: 401 }
      );
    }
    
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { message: '令牌已过期' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}