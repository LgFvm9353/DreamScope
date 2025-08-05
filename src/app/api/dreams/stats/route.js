import { NextResponse } from 'next/server';
import Dream from '@/models/Dream';
import { initDatabase } from '@/config/initDb';
import jwt from 'jsonwebtoken';
import { Op, Sequelize } from 'sequelize';

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 确保数据库已初始化
initDatabase().catch(console.error);

// 获取梦境统计数据
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
    
    // 获取当前日期
    const now = new Date();
    
    // 计算一周前的日期
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // 计算一个月前的日期
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    // 计算一年前的日期
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    // 基本统计：总数、本周、本月、本年
    const totalCount = await Dream.count({ where: { userId } });
    const weeklyCount = await Dream.count({ 
      where: { 
        userId,
        createdAt: { [Op.gte]: oneWeekAgo }
      } 
    });
    const monthlyCount = await Dream.count({ 
      where: { 
        userId,
        createdAt: { [Op.gte]: oneMonthAgo }
      } 
    });
    const yearlyCount = await Dream.count({ 
      where: { 
        userId,
        createdAt: { [Op.gte]: oneYearAgo }
      } 
    });
    
    // 情绪分布统计
    const emotionStats = await Dream.findAll({
      attributes: [
        'emotion',
        [Sequelize.fn('COUNT', Sequelize.col('emotion')), 'count']
      ],
      where: { userId },
      group: ['emotion'],
      raw: true
    });
    
    // 梦境类型分布统计
    const typeStats = await Dream.findAll({
      attributes: [
        'type',
        [Sequelize.fn('COUNT', Sequelize.col('type')), 'count']
      ],
      where: { userId },
      group: ['type'],
      raw: true
    });
    
    // 按月统计梦境数量（最近12个月）
    const monthlyTrend = [];
    for (let i = 11; i >= 0; i--) {
      const startDate = new Date(now);
      startDate.setMonth(now.getMonth() - i);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
      
      const count = await Dream.count({
        where: {
          userId,
          createdAt: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
          }
        }
      });
      
      const monthName = startDate.toLocaleString('zh-CN', { month: 'short' });
      monthlyTrend.push({
        month: monthName,
        count
      });
    }
    
    // 收藏比例
    const favoriteCount = await Dream.count({
      where: {
        userId,
        isFavorite: true
      }
    });
    
    // 分析状态分布
    const analysisStatusStats = await Dream.findAll({
      attributes: [
        'analysisStatus',
        [Sequelize.fn('COUNT', Sequelize.col('analysisStatus')), 'count']
      ],
      where: { userId },
      group: ['analysisStatus'],
      raw: true
    });
    
    // 返回统计数据
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
          emotions: emotionStats,
          types: typeStats,
          analysisStatus: analysisStatusStats
        },
        trends: {
          monthly: monthlyTrend
        }
      }
    });
  } catch (error) {
    console.error('获取梦境统计数据失败:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}