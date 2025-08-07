import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api', // 修正为3000端口
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 梦境相关API
export const dreamAPI = {
  // 获取梦境列表
  getDreams: (params = {}) => api.get('/dreams', { params }),
  
  // 获取单个梦境
  getDream: (id) => api.get(`/dreams/${id}`),
  
  // 创建梦境
  createDream: (data) => api.post('/dreams', data),
  
  // 更新梦境
  updateDream: (id, data) => api.put(`/dreams/${id}`, data),
  
  // 删除梦境
  deleteDream: (id) => api.delete(`/dreams/${id}`),
  
  // 分析梦境
  analyzeDream: (id) => api.post(`/dreams/${id}/analyze`),
  
  // 收藏/取消收藏梦境
  toggleFavorite: (id) => api.post(`/dreams/${id}/favorite`),
  
  // 搜索梦境
  searchDreams: (query, params = {}) => api.get('/dreams/search', { 
    params: { q: query, ...params } 
  }),
  
  // 按分类获取梦境
  getDreamsByCategory: (category, params = {}) => api.get('/dreams/category', { 
    params: { category, ...params } 
  }),
  
  // 获取梦境统计
  getDreamStats: () => api.get('/dreams/stats'),
  
  // 批量操作梦境
  batchOperation: (operation, dreamIds) => api.post('/dreams/batch', {
    operation,
    dreamIds
  }),
};

// 用户相关API
export const userAPI = {
  // 登录
  login: (credentials) => api.post('/auth/login', credentials),
  
  // 注册
  register: (userData) => api.post('/auth/register', userData),
  
  // 获取用户信息
  getUser: () => api.get('/auth/user'),
  
  // 更新用户信息
  updateUser: (data) => api.put('/auth/user', data),
  
  // 更新密码
  updatePassword: (data) => api.post('/auth/password', data),
  
  // 登出
  logout: () => api.post('/auth/logout'),
};

// 分析相关API
export const analysisAPI = {
  // 获取分析结果
  getAnalysis: (dreamId) => api.get(`/analysis/${dreamId}`),
  
  // 重新分析
  reanalyze: (dreamId) => api.post(`/analysis/${dreamId}/reanalyze`),
  
  // 获取分析历史
  getAnalysisHistory: (params = {}) => api.get('/analysis/history', { params }),
};

// 文件上传API
export const uploadAPI = {
  // 上传图片
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // 上传音频
  uploadAudio: (file) => {
    const formData = new FormData();
    formData.append('audio', file);
    return api.post('/upload/audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // 更新用户信息（包含头像）
  updateUser: (data) => api.put('/auth/user', data),
};

export default api;