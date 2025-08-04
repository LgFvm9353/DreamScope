import { Sequelize } from 'sequelize';
import 'dotenv/config';
import mysql2 from 'mysql2'; // 确保导入 mysql2

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectModule: mysql2, // 显式指定使用 mysql2 模块
    logging: false, // 设置为 true 可以在控制台看到 SQL 查询
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
    },
    timezone: '+08:00', // 设置时区
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