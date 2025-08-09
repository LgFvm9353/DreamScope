import { NextResponse } from 'next/server';
import Dream from '@/models/Dream';
import { withAuth } from '@/utils/auth';

// 获取单个梦境 - 优化版本
export const GET = withAuth(async (request, { params, userId }) => {
  const startTime = Date.now();
  
  try {
    console.log('开始获取梦境详情，ID:', params.id, '用户ID:', userId);
    
    const { id } = params;
    
    // 验证ID格式
    const dreamId = parseInt(id);
    if (isNaN(dreamId) || dreamId <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: '无效的梦境ID' 
      }, { status: 400 });
    }
    
    // 优化的数据库查询 - 只查询需要的字段，使用索引
    const dream = await Dream.findOne({
      where: {
        id: dreamId,
        ...(userId ? { userId: userId } : {})
      },
      attributes: [
        'id', 'content', 'emotion', 'type', 'tags', 
        'isFavorite', 'image', 'analysisStatus', 'createdAt'
      ],
      raw: true, // 直接返回原始数据，避免实例化开销
    });
    
    const queryTime = Date.now() - startTime;
    console.log(`数据库查询完成，耗时: ${queryTime}ms`);
    
    if (!dream) {
      return NextResponse.json({ 
        success: false, 
        error: '梦境不存在' 
      }, { status: 404 });
    }

    // 快速格式化返回数据
    const formattedDream = {
      id: dream.id,
      content: dream.content,
      emotion: dream.emotion,
      type: dream.type,
      tags: dream.tags ? dream.tags.split(',').filter(tag => tag.trim()) : [],
      isFavorite: Boolean(dream.isFavorite),
      image: dream.image,
      analysisStatus: dream.analysisStatus || 'pending',
      createdAt: dream.createdAt
    };
    
    const totalTime = Date.now() - startTime;
    console.log(`请求完成，总耗时: ${totalTime}ms`);
    
    return NextResponse.json({
      success: true,
      data: formattedDream
    });
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`获取梦境详情失败，耗时: ${totalTime}ms`, error);
    
    // 根据错误类型返回不同的响应
    if (error.name === 'SequelizeConnectionError') {
      return NextResponse.json({ 
        success: false, 
        error: '数据库连接失败，请稍后重试' 
      }, { status: 503 });
    } else if (error.name === 'SequelizeTimeoutError') {
      return NextResponse.json({ 
        success: false, 
        error: '数据库查询超时，请稍后重试' 
      }, { status: 408 });
    } else if (error.name === 'SequelizeValidationError') {
      return NextResponse.json({ 
        success: false, 
        error: '数据验证失败' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: '服务器内部错误' 
    }, { status: 500 });
  }
}, false); // JWT验证不是必须的

// 更新梦境 - 优化版本
export const PUT = withAuth(async (request, { params, userId }) => {
  const startTime = Date.now();
  
  try {
    const { id } = params;
    const dreamId = parseInt(id);
    
    if (isNaN(dreamId) || dreamId <= 0) {
      return NextResponse.json({
        success: false,
        message: '无效的梦境ID'
      }, { status: 400 });
    }
    
    // 解析请求体
    const body = await request.json();
    const { content, emotion, type, tags } = body;

    // 验证必填字段
    if (!content || !content.trim()) {
      return NextResponse.json({
        success: false,
        message: '梦境内容不能为空'
      }, { status: 400 });
    }

    if (!emotion) {
      return NextResponse.json({
        success: false,
        message: '请选择情绪'
      }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({
        success: false,
        message: '请选择梦境类型'
      }, { status: 400 });
    }

    // 优化的查询和更新
    const [updatedCount] = await Dream.update({
      content: content.trim(),
      emotion: emotion,
      type: type,
      tags: tags || '',
      updatedAt: new Date()
    }, {
      where: {
        id: dreamId,
        userId: userId
      }
    });

    if (updatedCount === 0) {
      return NextResponse.json({
        success: false,
        message: '梦境不存在或无权访问'
      }, { status: 404 });
    }

    // 获取更新后的数据
    const updatedDream = await Dream.findOne({
      where: { id: dreamId, userId: userId },
      attributes: [
        'id', 'content', 'emotion', 'type', 'tags', 
        'isFavorite', 'image', 'analysisStatus', 'createdAt', 'updatedAt'
      ],
      raw: true
    });

    const formattedDream = {
      id: updatedDream.id,
      title: updatedDream.content.substring(0, 20) + '...',
      content: updatedDream.content,
      date: new Date(updatedDream.createdAt).toLocaleDateString('zh-CN'),
      emotion: updatedDream.emotion,
      type: updatedDream.type,
      tags: updatedDream.tags ? updatedDream.tags.split(',').filter(tag => tag.trim()) : [],
      isFavorite: Boolean(updatedDream.isFavorite),
      image: updatedDream.image,
      analysisStatus: updatedDream.analysisStatus,
      createdAt: updatedDream.createdAt,
      updatedAt: updatedDream.updatedAt
    };

    const totalTime = Date.now() - startTime;
    console.log(`更新完成，耗时: ${totalTime}ms`);

    return NextResponse.json({
      success: true,
      message: '更新成功',
      data: formattedDream
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`更新梦境失败，耗时: ${totalTime}ms`, error);
    
    return NextResponse.json({
      success: false,
      message: '服务器错误'
    }, { status: 500 });
  }
}, true); // 必须验证JWT

// 删除梦境 - 优化版本
export const DELETE = withAuth(async (request, { params, userId }) => {
  const startTime = Date.now();
  
  try {
    console.log('删除梦境请求，参数:', params);
    console.log('用户ID:', userId);
    
    const { id } = params;
    const dreamId = parseInt(id);
    
    if (isNaN(dreamId) || dreamId <= 0) {
      return NextResponse.json({
        success: false,
        message: '无效的梦境ID'
      }, { status: 400 });
    }
    
    console.log('查找并删除梦境，ID:', dreamId, '用户ID:', userId);
    
    // 直接删除，不需要先查询
    const deletedCount = await Dream.destroy({
      where: {
        id: dreamId,
        userId: userId
      }
    });

    console.log('删除结果:', deletedCount > 0 ? '删除成功' : '未找到梦境');

    if (deletedCount === 0) {
      return NextResponse.json({
        success: false,
        message: '梦境不存在或无权访问'
      }, { status: 404 });
    }

    const totalTime = Date.now() - startTime;
    console.log(`删除完成，耗时: ${totalTime}ms`);

    return NextResponse.json({
      success: true,
      message: '删除成功'
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`删除梦境失败，耗时: ${totalTime}ms`, error);
    
    return NextResponse.json({
      success: false,
      message: '服务器错误'
    }, { status: 500 });
  }
}, true);