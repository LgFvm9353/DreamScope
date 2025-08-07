import { NextResponse } from 'next/server';
import User from '@/models/User';
import { withAuth } from '@/utils/auth';

// 更新密码
export const POST = withAuth(async (request, { userId }) => {
  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // 验证输入
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: '当前密码和新密码不能为空' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: '新密码长度不能少于6位' },
        { status: 400 }
      );
    }

    // 获取用户信息
    const user = await User.findByPk(userId);
    if (!user) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      );
    }

    // 验证当前密码 - 使用bcrypt比较
    const isCurrentPasswordValid = await user.validatePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { message: '当前密码错误' },
        { status: 400 }
      );
    }

    // 更新密码（bcrypt加密会在beforeUpdate hook中自动处理）
    await user.update({
      password: newPassword
    });

    return NextResponse.json({
      success: true,
      message: '密码更新成功'
    });

  } catch (error) {
    console.error('更新密码失败:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}, true);