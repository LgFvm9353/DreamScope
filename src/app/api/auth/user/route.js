// 修改导入部分
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User'; // 导入User模型

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
    
    // 查找用户 - 使用Sequelize模型
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      );
    }

    // 返回用户信息（不包含密码）
    const userResponse = user.toJSON();
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
    
    // 查找用户 - 使用Sequelize模型
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 更新用户信息（不允许更新密码）
    const { password, ...updateData } = body;
    await user.update(updateData);
    
    // 返回更新后的用户信息（不包含密码）
    const userResponse = user.toJSON();
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