import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { initDatabase } from '@/config/initDb';

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 确保数据库已初始化
initDatabase().catch(console.error);

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password, email } = body;

    // 验证请求数据
    if (!username || !password || !email) {
      return NextResponse.json(
        { message: '用户名、密码和邮箱不能为空' },
        { status: 400 }
      );
    }

    // 检查用户名是否已存在
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return NextResponse.json(
        { message: '用户名已存在' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return NextResponse.json(
        { message: '邮箱已被注册' },
        { status: 400 }
      );
    }

    // 创建新用户
    const newUser = await User.create({
      username,
      password, // 密码会在模型的钩子中自动加密
      email,
      level: '1级',
      signature: '新用户',
      avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    });

    // 生成JWT令牌
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 返回用户信息和令牌（不包含密码）
    const userResponse = newUser.toJSON();
    delete userResponse.password;

    return NextResponse.json({
      message: '注册成功',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('注册错误:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}