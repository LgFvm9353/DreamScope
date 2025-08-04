import { NextResponse } from 'next/server';
import Dream from '@/models/Dream';
import { initDatabase } from '@/config/initDb';
import jwt from 'jsonwebtoken';

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 确保数据库已初始化
initDatabase().catch(console.error);

// 获取梦境列表
export async function GET(request) {
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
        console.error('令牌验证失败:', error);
        // 继续执行，但不设置 userId，将返回公共梦境
      }
    }

    // 获取查询参数
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '3'); // 默认获取3条记录
    
    // 构建查询条件
    const query = {};
    if (userId) {
      query.userId = userId;
    }
    
    // 查询梦境列表
    const dreams = await Dream.findAll({
      where: query,
      limit: limit,
      order: [['createdAt', 'DESC']], // 按创建时间降序排序
      attributes: ['id', 'title', 'content', 'emotion', 'type', 'tags', 'createdAt']
    });
    
    // 格式化数据
    const formattedDreams = dreams.map(dream => {
      const dreamData = dream.toJSON();
      return {
        id: dreamData.id,
        title: dreamData.title || dreamData.content.substring(0, 20) + '...', // 如果没有标题，使用内容前20个字符
        date: new Date(dreamData.createdAt).toLocaleDateString('zh-CN'),
        emotion: dreamData.emotion,
        emotionText: getEmotionText(dreamData.emotion),
        description: dreamData.content.substring(0, 50) + '...',
        type: dreamData.type,
        tags: dreamData.tags
      };
    });
    
    return NextResponse.json(formattedDreams);
  } catch (error) {
    console.error('获取梦境列表失败:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}

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
    'anxious': '焦虑'
  };
  
  return emotionMap[emotion] || emotion;
}