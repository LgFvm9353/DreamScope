import { create } from 'zustand';
import { chatAPI } from '@/services/chatApi';

const useChatStore = create((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,
  
  // 添加消息
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  // 设置加载状态
  setLoading: (isLoading) => set({ isLoading }),
  
  // 设置错误
  setError: (error) => set({ error }),
  
  // 清空消息
  clearMessages: () => set({ messages: [] }),
  
  // 发送消息到AI
  sendMessage: async (content) => {
    try {
      // 添加用户消息
      const userMessage = {
        id: Date.now().toString(),
        content,
        type: 'user',
        timestamp: new Date()
      };
      
      get().addMessage(userMessage);
      set({ isLoading: true, error: null });
      
      // 调用API获取AI回复
      const response = await chatAPI.sendMessage(content);
      
      // 添加AI回复消息
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        type: 'ai',
        timestamp: new Date()
      };
      
      get().addMessage(aiMessage);
    } catch (error) {
      console.error('发送消息失败:', error);
      set({ error: '发送消息失败，请稍后重试' });
    } finally {
      set({ isLoading: false });
    }
  }
}));

export default useChatStore;