// 轻量级数据库管理器，避免重复初始化
let dbInitPromise = null;
let isInitialized = false;

export const ensureDbConnection = async () => {
  // 如果已经初始化，直接返回
  if (isInitialized) {
    return true;
  }
  
  // 如果正在初始化，等待完成
  if (dbInitPromise) {
    return await dbInitPromise;
  }
  
  // 开始初始化
  dbInitPromise = (async () => {
    try {
      const { initDatabase } = await import('./initDb');
      const success = await initDatabase();
      if (success) {
        isInitialized = true;
      }
      return success;
    } catch (error) {
      console.error('数据库初始化失败:', error);
      dbInitPromise = null; // 重置，允许重试
      return false;
    }
  })();
  
  return await dbInitPromise;
};