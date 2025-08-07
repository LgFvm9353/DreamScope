import { NextResponse } from 'next/server';
import User from '@/models/User';
import { withAuth } from '@/utils/auth';
import { Op } from 'sequelize'; // 添加了缺少的导入

// 获取用户信息
export const GET = withAuth(async (request, { userId }) => {
  try {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email', 'avatar', 'createdAt'] // 添加avatar字段
    });

    if (!user) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar, // 添加头像字段
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}, true);

// 更新用户信息
export const PUT = withAuth(async (request, { userId }) => {
  try {
    const body = await request.json();
    const { username, email, avatar } = body; // 添加avatar参数

    // 验证输入
    if (!username || !email) {
      return NextResponse.json(
        { message: '用户名和邮箱不能为空' },
        { status: 400 }
      );
    }

    // 检查用户名是否已存在（排除当前用户）
    const existingUser = await User.findOne({
      where: {
        username,
        id: { [Op.ne]: userId }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: '用户名已存在' },
        { status: 400 }
      );
    }

    // 检查邮箱是否重复
    const existingEmail = await User.findOne({
      where: {
        email,
        id: { [Op.ne]: userId }
      }
    });

    if (existingEmail) {
      return NextResponse.json(
        { message: '邮箱重复' },
        { status: 400 }
      );
    }

    // 更新用户信息
    const user = await User.findByPk(userId);
    if (!user) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      );
    }

    // 准备更新数据
    const updateData = {
      username,
      email
    };

    // 如果提供了头像，则更新头像
    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }

    await user.update(updateData);

    return NextResponse.json({
      success: true,
      message: '用户信息更新成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar // 返回头像字段
      }
    });

  } catch (error) {
    console.error('更新用户信息失败:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}, true);