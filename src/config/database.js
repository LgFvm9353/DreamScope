import { Sequelize } from 'sequelize';
import 'dotenv/config';
import mysql2 from 'mysql2';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectModule: mysql2,
    logging: console.log, // 临时开启日志，用于调试
    
    // 连接池配置
    pool: {
      max: 10,          // 最大连接数
      min: 0,           // 最小连接数
      acquire: 30000,   // 获取连接的最大时间(毫秒)
      idle: 10000,      // 连接空闲的最大时间(毫秒)
    },
    
    // 查询超时设置
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
      connectTimeout: 10000,    // 连接超时 10秒
    },
    
    // 重试配置
    retry: {
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /TIMEOUT/,
      ],
      max: 3, // 最大重试次数
    },
    
    timezone: '+08:00',
  }
);

// 测试数据库连接
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error);
    return false;
  }
};

export default sequelize;