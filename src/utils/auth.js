import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * JWT验证中间件
 * @param {Request} request - 请求对象
 * @param {boolean} required - 是否必须验证（默认true）
 * @returns {Object} { success: boolean, userId?: number, error?: NextResponse }
 */
export function verifyJWT(request, required = true) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    // 如果没有Authorization头
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (required) {
        return {
          success: false,
          error: NextResponse.json(
            { message: '未授权，请先登录' },
            { status: 401 }
          )
        };
      }
      // 如果不是必须的，返回成功但没有用户ID
      return { success: true, userId: null };
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return {
        success: true,
        userId: decoded.id,
        user: decoded
      };
    } catch (jwtError) {
      console.error('JWT验证失败:', jwtError);
      
      let message = '无效的令牌';
      if (jwtError.name === 'TokenExpiredError') {
        message = '令牌已过期，请重新登录';
      } else if (jwtError.name === 'JsonWebTokenError') {
        message = '无效的令牌格式';
      }
      
      return {
        success: false,
        error: NextResponse.json(
          { message },
          { status: 401 }
        )
      };
    }
  } catch (error) {
    console.error('验证过程出错:', error);
    return {
      success: false,
      error: NextResponse.json(
        { message: '服务器内部错误' },
        { status: 500 }
      )
    };
  }
}

/**
 * 生成JWT令牌
 * @param {Object} payload - 要编码的数据
 * @param {string} expiresIn - 过期时间（默认7天）
 * @returns {string} JWT令牌
 */
export function generateJWT(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * 验证并获取用户ID的装饰器函数
 * @param {Function} handler - API处理函数
 * @param {boolean} required - 是否必须验证
 * @returns {Function} 包装后的处理函数
 */
export function withAuth(handler, required = true) {
  return async (request, context) => {
    const authResult = verifyJWT(request, required);
    
    if (!authResult.success) {
      return authResult.error;
    }
    
    // 将用户信息添加到context中
    const enhancedContext = {
      ...context,
      userId: authResult.userId,
      user: authResult.user
    };
    
    return handler(request, enhancedContext);
  };
}