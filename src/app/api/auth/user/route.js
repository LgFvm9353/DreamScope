import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// 引用模拟数据库中的用户
import { users } from '../register/route';

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request) {
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
    
    // 查找用户
    const user = users.find(user => user.id === decoded.id);
    if (!user) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      );
    }

    // 返回用户信息（不包含密码）
    const userResponse = { ...user };
    delete userResponse.password;

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error('获取用户信息错误:', error);
    
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

export async function PUT(request) {
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
    
    // 查找并更新用户
    const userIndex = users.findIndex(user => user.id === decoded.id);
    if (userIndex === -1) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 更新用户信息（不允许更新密码）
    const { password, ...updateData } = body;
    users[userIndex] = { ...users[userIndex], ...updateData };
    
    // 返回更新后的用户信息（不包含密码）
    const userResponse = { ...users[userIndex] };
    delete userResponse.password;
    
    return NextResponse.json({
      message: '用户信息更新成功',
      user: userResponse
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    
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