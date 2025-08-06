import { NextResponse } from 'next/server';
import Dream from '@/models/Dream';
import { initDatabase } from '@/config/initDb';
import jwt from 'jsonwebtoken';

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 确保数据库已初始化
initDatabase().catch(console.error);

// 获取单个梦境
export async function GET(request, { params }) {
  try {
    // 从请求头中获取令牌
    const authHeader = request.headers.get('Authorization');
    let userId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        // 验证令牌
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (error) {
        return NextResponse.json({ error: '无效的令牌' }, { status: 401 });
      }
    }

    const { id } = params;
    
    // 添加查询超时控制
    const queryTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 8000);
    });
    
    // 优化数据库查询
    const queryPromise = db.prepare(`
      SELECT * FROM dreams 
      WHERE id = ? AND (userId = ? OR userId IS NULL)
    `).get(id, userId);
    
    const dreamData = await Promise.race([queryPromise, queryTimeout]);
    
    if (!dreamData) {
      return NextResponse.json({ error: '梦境不存在' }, { status: 404 });
    }

    // 格式化返回数据
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
    
    return NextResponse.json(formattedDream);
  } catch (error) {
    console.error('获取梦境详情失败:', error);
    
    if (error.message === 'Database query timeout') {
      return NextResponse.json({ error: '数据库查询超时' }, { status: 408 });
    }
    
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// 更新梦境
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    // 验证用户身份
    const authHeader = request.headers.get('Authorization');
    let userId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (error) {
        console.error('令牌验证失败:', error);
        return NextResponse.json(
          { message: '未授权' },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

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
}

// 删除梦境
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // JWT验证逻辑（与GET方法相同）
    const authHeader = request.headers.get('Authorization');
    let userId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (error) {
        return NextResponse.json({ message: '未授权' }, { status: 401 });
      }
    } else {
      return NextResponse.json({ message: '未授权' }, { status: 401 });
    }
    
    // 删除梦境
    const result = await Dream.destroy({
      where: {
        id: id,
        userId: userId
      }
    });
    
    if (result === 0) {
      return NextResponse.json({ message: '梦境不存在或无权删除' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除梦境失败:', error);
    return NextResponse.json({ message: '服务器错误' }, { status: 500 });
  }
}