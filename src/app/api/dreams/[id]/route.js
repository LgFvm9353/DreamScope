import { NextResponse } from 'next/server';
import Dream from '@/models/Dream';
import { initDatabase } from '@/config/initDb';
import { verifyJWT, withAuth } from '@/utils/auth';

// 确保数据库已初始化
initDatabase().catch(console.error);

// 获取单个梦境 - 使用装饰器方式
export const GET = withAuth(async (request, { params, userId }) => {
  try {
    console.log('开始获取梦境详情，ID:', params.id);
    console.log('用户ID:', userId);
    
    const { id } = params;
    
    // 添加查询超时控制
    const queryTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('查询超时')), 8000);
    });
    
    // 使用Sequelize查询
    const queryPromise = Dream.findOne({
      where: {
        id: parseInt(id),
        ...(userId ? { userId: userId } : {})
      },
      raw: false,
      nest: true,
    });
    
    console.log('开始数据库查询...');
    const dream = await Promise.race([queryPromise, queryTimeout]);
    console.log('数据库查询完成:', dream ? '找到梦境' : '未找到梦境');
    
    if (!dream) {
      return NextResponse.json({ error: '梦境不存在' }, { status: 404 });
    }

    // 格式化返回数据
    const dreamData = dream.toJSON();
    const formattedDream = {
      id: dreamData.id,
      content: dreamData.content,
      emotion: dreamData.emotion,
      type: dreamData.type,
      tags: dreamData.tags ? dreamData.tags.split(',').filter(tag => tag.trim()) : [],
      isFavorite: dreamData.isFavorite || false,
      image: dreamData.image,
      analysisStatus: dreamData.analysisStatus,
      createdAt: dreamData.createdAt
    };
    
    console.log('返回梦境数据');
    return NextResponse.json(formattedDream);
  } catch (error) {
    console.error('获取梦境详情失败:', error);
    
    if (error.message === '查询超时') {
      return NextResponse.json({ error: '数据库查询超时，请稍后重试' }, { status: 408 });
    } else if (error.name === 'SequelizeConnectionError') {
      return NextResponse.json({ error: '数据库连接失败' }, { status: 503 });
    } else if (error.name === 'SequelizeTimeoutError') {
      return NextResponse.json({ error: '数据库操作超时' }, { status: 408 });
    }
    
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}, false); // false表示JWT验证不是必须的

// 更新梦境 - 使用装饰器方式，必须验证
export const PUT = withAuth(async (request, { params, userId }) => {
  try {
    const { id } = params;
    
    // 解析请求体
    const body = await request.json();
    const { content, emotion, type, tags } = body;

    // 验证必填字段
    if (!content || !content.trim()) {
      return NextResponse.json(
        { message: '梦境内容不能为空' },
        { status: 400 }
      );
    }

    if (!emotion) {
      return NextResponse.json(
        { message: '请选择情绪' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { message: '请选择梦境类型' },
        { status: 400 }
      );
    }

    // 查找并更新梦境
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

    // 更新梦境数据
    await dream.update({
      content: content.trim(),
      emotion: emotion,
      type: type,
      tags: tags || '',
      updatedAt: new Date()
    });

    // 返回更新后的梦境数据
    const updatedDreamData = dream.toJSON();
    const formattedDream = {
      id: updatedDreamData.id,
      title: updatedDreamData.title || updatedDreamData.content.substring(0, 20) + '...',
      content: updatedDreamData.content,
      date: new Date(updatedDreamData.createdAt).toLocaleDateString('zh-CN'),
      emotion: updatedDreamData.emotion,
      type: updatedDreamData.type,
      tags: updatedDreamData.tags ? updatedDreamData.tags.split(',').filter(tag => tag.trim()) : [],
      isFavorite: updatedDreamData.isFavorite || false,
      image: updatedDreamData.image,
      analysisStatus: updatedDreamData.analysisStatus,
      createdAt: updatedDreamData.createdAt,
      updatedAt: updatedDreamData.updatedAt
    };

    return NextResponse.json({
      success: true,
      message: '更新成功',
      data: formattedDream
    });

  } catch (error) {
    console.error('更新梦境失败:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}, true); // true表示必须验证JWT

// 删除梦境 - 使用装饰器方式
export const DELETE = withAuth(async (request, { params, userId }) => {
  try {
    const { id } = params;
    
    // 查找梦境
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

    // 删除梦境
    await dream.destroy();

    return NextResponse.json({
      success: true,
      message: '删除成功'
    });

  } catch (error) {
    console.error('删除梦境失败:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}, true);