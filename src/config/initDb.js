import sequelize from './database';
import User from '../models/User';
import Dream from '../models/Dream';

// 添加一个全局标志来避免重复同步
let isDbSynced = false;
let syncPromise = null;

// 同步所有模型到数据库
export const syncDatabase = async () => {
  // 如果已经同步过，直接返回
  if (isDbSynced) {
    return true;
  }
  
  // 如果正在同步，等待同步完成
  if (syncPromise) {
    return await syncPromise;
  }
  
  syncPromise = (async () => {
    try {
      // 只检查表是否存在，不强制同步
      await sequelize.sync({ 
        force: false,  // 不删除已存在的表
        alter: false   // 不修改表结构，避免重复创建索引
      });
      console.log('数据库同步完成');
      isDbSynced = true;
      return true;
    } catch (error) {
      console.error('数据库同步失败:', error);
      isDbSynced = false;
      syncPromise = null;
      return false;
    }
  })();
  
  return await syncPromise;
};

// 初始化数据库
export const initDatabase = async () => {
  try {
    // 测试连接
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 同步模型（只在第一次调用时执行）
    await syncDatabase();
    
    return true;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return false;
  }
};

export default { syncDatabase, initDatabase };