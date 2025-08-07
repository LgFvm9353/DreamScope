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

    // 获取本周数量
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);
    
    const weeklyCount = await Dream.count({
      where: {
        userId,
        createdAt: {
          [Op.gte]: oneWeekAgo
        }
      }
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

    // 获取本年数量
    const currentYear = new Date();
    currentYear.setMonth(0, 1);
    currentYear.setHours(0, 0, 0, 0);
    
    const yearlyCount = await Dream.count({
      where: {
        userId,
        createdAt: {
          [Op.gte]: currentYear
        }
      }
    });

    // 获取收藏数量
    const favoriteCount = await Dream.count({
      where: { 
        userId,
        isFavorite: true 
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

    // 获取分析状态分布
    const analysisStatusStats = await Dream.findAll({
      where: { userId },
      attributes: [
        'analysisStatus',
        [Sequelize.fn('COUNT', Sequelize.col('analysisStatus')), 'count']
      ],
      group: ['analysisStatus'],
      raw: true
    });

    // 获取最近12个月的月度趋势数据
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);
    
    const monthlyTrends = await Dream.findAll({
      where: {
        userId,
        createdAt: {
          [Op.gte]: twelveMonthsAgo
        }
      },
      attributes: [
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('createdAt'), '%Y-%m'), 'yearMonth'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: [Sequelize.fn('DATE_FORMAT', Sequelize.col('createdAt'), '%Y-%m')],
      order: [[Sequelize.fn('DATE_FORMAT', Sequelize.col('createdAt'), '%Y-%m'), 'ASC']],
      raw: true
    });

    // 格式化月度趋势数据
    const formattedMonthlyTrends = monthlyTrends.map(item => {
      const [year, month] = item.yearMonth.split('-');
      const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
      return {
        month: monthNames[parseInt(month) - 1],
        count: parseInt(item.count)
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          total: totalCount,
          weekly: weeklyCount,
          monthly: monthlyCount,
          yearly: yearlyCount,
          favorite: favoriteCount
        },
        distributions: {
          emotions: emotionStats.map(item => ({
            emotion: item.emotion,
            count: item.count.toString()
          })),
          types: typeStats.map(item => ({
            type: item.type,
            count: item.count.toString()
          })),
          analysisStatus: analysisStatusStats.map(item => ({
            analysisStatus: item.analysisStatus || 'pending',
            count: item.count.toString()
          }))
        },
        trends: {
          monthly: formattedMonthlyTrends
        }
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