import { NextResponse } from 'next/server';
import User from '@/models/User';
import { generateJWT } from '@/utils/auth';

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
      where: { username }
    });

    if (!user) {
      return NextResponse.json(
        { message: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 验证密码 - 使用bcrypt比较
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 生成JWT令牌
    const token = generateJWT({
      id: user.id,
      username: user.username
    });

    return NextResponse.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}