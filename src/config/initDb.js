import sequelize from './database';
import User from '../models/User';
import Dream from '../models/Dream';

// 同步所有模型到数据库
export const syncDatabase = async () => {
  try {
    // force: true 会先删除表再创建（谨慎使用）
    // alter: true 会根据模型更新表结构
    await sequelize.sync({ alter: true });
    console.log('数据库同步完成');
    return true;
  } catch (error) {
    console.error('数据库同步失败:', error);
    return false;
  }
};

// 初始化数据库
export const initDatabase = async () => {
  try {
    // 测试连接
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 同步模型
    await syncDatabase();
    
    return true;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return false;
  }
};

export default { syncDatabase, initDatabase };