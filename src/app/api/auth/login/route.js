import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User';

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 验证请求数据
    if (!username || !password) {
      return NextResponse.json(
        { message: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await User.findOne({
      where: { username },
    });

    // 用户不存在
    if (!user) {
      return NextResponse.json(
        { message: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 验证密码
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 返回用户信息和令牌（不包含密码）
    const userResponse = user.toJSON();
    delete userResponse.password;

    return NextResponse.json({
      message: '登录成功',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}