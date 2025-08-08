import { create } from 'zustand';
import { chatAPI } from '@/services/chatApi';

const useChatStore = create((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,
  currentStreamingMessage: '', // 新增：当前流式消息内容
  
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
  }, // ← 这里添加了缺失的逗号
  
  // 设置流式消息内容
  setStreamingMessage: (content) => set({ currentStreamingMessage: content }),
  
  // 清空流式消息
  clearStreamingMessage: () => set({ currentStreamingMessage: '' }),
  
  // 流式发送消息
  sendMessageStream: async (content) => {
    try {
      // 添加用户消息
      const userMessage = {
        id: Date.now().toString(),
        content,
        type: 'user',
        timestamp: new Date()
      };
      
      get().addMessage(userMessage);
      set({ isLoading: true, error: null, currentStreamingMessage: '' });
      
      // 创建AI消息占位符
      const aiMessageId = (Date.now() + 1).toString();
      const aiMessage = {
        id: aiMessageId,
        content: '',
        type: 'ai',
        timestamp: new Date(),
        isStreaming: true
      };
      
      get().addMessage(aiMessage);
      
      let fullContent = '';
      
      // 调用流式API
      await chatAPI.sendMessageStream(content, (chunk) => {
        fullContent += chunk;
        
        // 更新流式消息内容
        set({ currentStreamingMessage: fullContent });
        
        // 更新消息列表中的AI消息
        set((state) => ({
          messages: state.messages.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, content: fullContent }
              : msg
          )
        }));
      });
      
      // 流式完成，标记消息为非流式状态
      set((state) => ({
        messages: state.messages.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, isStreaming: false }
            : msg
        ),
        currentStreamingMessage: ''
      }));
      
    } catch (error) {
      console.error('流式发送消息失败:', error);
      set({ error: '发送消息失败，请稍后重试' });
    } finally {
      set({ isLoading: false });
    }
  }
}));

export default useChatStore;