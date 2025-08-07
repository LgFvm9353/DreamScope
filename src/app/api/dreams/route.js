import { NextResponse } from 'next/server';
import Dream from '@/models/Dream';
import { initDatabase } from '@/config/initDb';
import { verifyJWT, withAuth } from '@/utils/auth';
import { Op } from 'sequelize';

// 确保数据库已初始化
initDatabase().catch(console.error);

// 获取梦境列表 - 可选验证
export const GET = withAuth(async (request, { userId }) => {
  try {
    // 获取查询参数
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const category = url.searchParams.get('category');
    const emotion = url.searchParams.get('emotion');
    const search = url.searchParams.get('q');
    const favorite = url.searchParams.get('favorite');
    
    const offset = (page - 1) * limit;
    
    // 构建查询条件
    const where = {};
    if (userId) {
      where.userId = userId;
    }
    
    // 分类筛选
    if (category && category !== 'all') {
      if (category === 'favorite') {
        where.isFavorite = true;
      } else {
        where.type = category;
      }
    }
    
    // 情绪筛选
    if (emotion && emotion !== 'all') {
      where.emotion = emotion;
    }
    
    // 收藏筛选
    if (favorite === 'true') {
      where.isFavorite = true;
    }
    
    // 搜索功能
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
        { tags: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // 查询梦境列表和总数
    const { count, rows: dreams } = await Dream.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: [
        'id', 'title', 'content', 'emotion', 'type', 'tags', 
        'createdAt', 'isFavorite', 'image', 'analysisStatus'
      ]
    });
    
    // 格式化数据
    const formattedDreams = dreams.map(dream => {
      const dreamData = dream.toJSON();
      return {
        id: dreamData.id,
        title: dreamData.title || dreamData.content.substring(0, 20) + '...', 
        content: dreamData.content,
        date: new Date(dreamData.createdAt).toLocaleDateString('zh-CN'),
        emotion: dreamData.emotion,
        emotionText: getEmotionText(dreamData.emotion),
        description: dreamData.content.substring(0, 100) + (dreamData.content.length > 100 ? '...' : ''),
        type: dreamData.type,
        tags: dreamData.tags ? dreamData.tags.split(',').filter(tag => tag.trim()) : [],
        isFavorite: dreamData.isFavorite || false,
        image: dreamData.image, // 直接返回单张图片URL
        analysisStatus: dreamData.analysisStatus
      };
    });
    
    // 计算是否还有更多数据
    const hasMore = offset + limit < count;
    
    return NextResponse.json({
      success: true,
      data: {
        dreams: formattedDreams,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
          hasMore
        }
      },
      hasMore
    });
  } catch (error) {
    console.error('获取梦境列表失败:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}, false); // false表示JWT验证不是必须的

// 创建梦境 - 必须验证
export const POST = withAuth(async (request, { userId }) => {
  try {
    const body = await request.json();
    const { title, content, emotion, type, tags, image } = body;

    // 验证必填字段
    if (!content) {
      return NextResponse.json(
        { message: '梦境内容不能为空' },
        { status: 400 }
      );
    }

    // 创建梦境记录
    const dream = await Dream.create({
      userId,
      title: title || content.substring(0, 20) + '...',
      content,
      emotion: emotion || 'neutral',
      type: type || 'normal',
      tags: Array.isArray(tags) ? tags.join(',') : tags || '',
      image: image || null, // 直接存储单张图片URL
      isFavorite: false,
      analysisStatus: 'pending'
    });

    return NextResponse.json({
      message: '梦境记录创建成功',
      dream: {
        id: dream.id,
        title: dream.title,
        content: dream.content,
        emotion: dream.emotion,
        type: dream.type,
        tags: dream.tags ? dream.tags.split(',').filter(tag => tag.trim()) : [],
        date: new Date(dream.createdAt).toLocaleDateString('zh-CN'),
        isFavorite: dream.isFavorite,
        image: dream.image // 直接返回单张图片URL
      }
    }, { status: 201 });

  } catch (error) {
    console.error('创建梦境失败:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}, true); // true表示必须验证JWT

// 获取情绪文本
function getEmotionText(emotion) {
  const emotionMap = {
    'happy': '开心',
    'sad': '悲伤',
    'angry': '愤怒',
    'fear': '恐惧',
    'surprise': '惊讶',
    'disgust': '厌恶',
    'calm': '平静',
    'confused': '困惑',
    'excited': '兴奋',
    'anxious': '焦虑',
    'neutral': '中性'
  };
  
  return emotionMap[emotion] || emotion;
}