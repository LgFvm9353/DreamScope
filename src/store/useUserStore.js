import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { userAPI } from '@/services/api';

const useUserStore = create(
  persist(
    (set, get) => ({
      // 用户信息
      user: null,
      
      // 验证码相关状态
      captcha: '',
      captchaExpiry: null,
      
      // 生成验证码
      generateCaptcha: () => {
        const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
        const expiry = Date.now() + 5 * 60 * 1000; // 5分钟有效期
        set({ captcha: randomCode, captchaExpiry: expiry });
        return randomCode;
      },
      
      // 验证验证码
      validateCaptcha: (inputCaptcha) => {
        const { captcha, captchaExpiry } = get();
        if (!captcha || !captchaExpiry) return false;
        if (Date.now() > captchaExpiry) return false;
        return inputCaptcha === captcha;
      },
      
      // 用户登录
      login: async (credentials) => {
        try {
          const result = await userAPI.login(credentials);
          localStorage.setItem('jwt_token', result.token);
          set({ user: result.user });
          return result;
        } catch (error) {
          console.error('登录失败:', error);
          throw error;
        }
      },
      
      // 用户注册
      register: async (userData) => {
        try {
          const result = await userAPI.register(userData);
          localStorage.setItem('jwt_token', result.token);
          set({ user: result.user });
          return result;
        } catch (error) {
          console.error('注册失败:', error);
          throw error;
        }
      },
      
      // 获取用户信息
      getUser: async () => {
        try {
          const user = await userAPI.getUser();
          set({ user });
          return user;
        } catch (error) {
          console.error('获取用户信息失败:', error);
          throw error;
        }
      },
      
      // 设置用户信息
      setUser: (user) => {
        set({ user });
      },
      
      // 登出
      logout: () => {
        localStorage.removeItem('jwt_token');
        set({ user: null });
      },
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);

export default useUserStore;