import { NextResponse } from 'next/server';
import { ensureDbConnection } from '@/config/dbManager';

// API 路由包装器，确保数据库连接
export const withDatabase = (handler) => {
  return async (request, context) => {
    try {
      // 确保数据库连接
      const dbConnected = await ensureDbConnection();
      if (!dbConnected) {
        return NextResponse.json(
          { message: '数据库连接失败' },
          { status: 500 }
        );
      }
      
      // 执行原始处理器
      return await handler(request, context);
    } catch (error) {
      console.error('API 错误:', error);
      return NextResponse.json(
        { message: '服务器内部错误' },
        { status: 500 }
      );
    }
  };
};