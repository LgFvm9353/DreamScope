import { NextResponse } from 'next/server';
import Dream from '@/models/Dream';
import { initDatabase } from '@/config/initDb';
import { withAuth } from '@/utils/auth';
import { Op, Sequelize } from 'sequelize';

// 确保数据库已初始化
initDatabase().catch(console.error);

// 获取梦境统计数据
export const GET = withAuth(async (request, { userId }) => {
  try {
    // 获取总数
    const totalCount = await Dream.count({
      where: { userId }
    });

    // 获取本月数量
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const monthlyCount = await Dream.count({
      where: {
        userId,
        createdAt: {
          [Op.gte]: currentMonth
        }
      }
    });

    // 获取情绪分布
    const emotionStats = await Dream.findAll({
      where: { userId },
      attributes: [
        'emotion',
        [Sequelize.fn('COUNT', Sequelize.col('emotion')), 'count']
      ],
      group: ['emotion'],
      raw: true
    });

    // 获取类型分布
    const typeStats = await Dream.findAll({
      where: { userId },
      attributes: [
        'type',
        [Sequelize.fn('COUNT', Sequelize.col('type')), 'count']
      ],
      group: ['type'],
      raw: true
    });

    // 获取最近7天的数据
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentDreams = await Dream.findAll({
      where: {
        userId,
        createdAt: {
          [Op.gte]: sevenDaysAgo
        }
      },
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: [Sequelize.fn('DATE', Sequelize.col('createdAt'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    return NextResponse.json({
      success: true,
      data: {
        total: totalCount,
        monthly: monthlyCount,
        emotions: emotionStats,
        types: typeStats,
        recent: recentDreams
      }
    });

  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}, true); // 必须验证JWT