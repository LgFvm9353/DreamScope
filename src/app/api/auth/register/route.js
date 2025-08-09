import { NextResponse } from 'next/server';
import User from '@/models/User';
import { generateJWT } from '@/utils/auth';
import { withDatabase } from '@/utils/apiWrapper';

async function registerHandler(request) {
  const body = await request.json();
  const { username, password, email } = body;

  // 验证请求数据
  if (!username || !password || !email) {
    return NextResponse.json(
      { message: '用户名、密码和邮箱不能为空' },
      { status: 400 }
    );
  }

  // 验证密码长度
  if (password.length < 6) {
    return NextResponse.json(
      { message: '密码长度不能少于6位' },
      { status: 400 }
    );
  }

  // 检查用户名是否已存在
  const existingUser = await User.findOne({
    where: { username }
  });

  if (existingUser) {
    return NextResponse.json(
      { message: '用户名已存在' },
      { status: 400 }
    );
  }

  // 检查邮箱是否已存在
  const existingEmail = await User.findOne({
    where: { email }
  });

  if (existingEmail) {
    return NextResponse.json(
      { message: '邮箱已被注册' },
      { status: 400 }
    );
  }

  // 创建用户
  const user = await User.create({
    username,
    password,
    email
  });

  // 生成JWT令牌
  const token = generateJWT({
    id: user.id,
    username: user.username
  });

  return NextResponse.json({
    message: '注册成功',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  }, { status: 201 });
}

export const POST = withDatabase(registerHandler);