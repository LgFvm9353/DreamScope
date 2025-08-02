import axios from 'axios';

// DeepSeek API配置
const DEEPSEEK_API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API ;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 创建axios实例
const deepseekApi = axios.create({
  baseURL: DEEPSEEK_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
  }
});

// 聊天相关API
export const chatAPI = {
  // 发送消息到DeepSeek API
  sendMessage: async (content) => {
    try {
      const response = await deepseekApi.post('', {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的梦境分析助手，擅长解读梦境的象征意义、心理暗示和潜在含义。请用专业但易懂的语言回答用户关于梦境的问题。'
          },
          {
            role: 'user',
            content
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });
      
      return {
        content: response.data.choices[0].message.content,
        model: response.data.model
      };
    } catch (error) {
      console.error('DeepSeek API调用失败:', error);
      throw error;
    }
  }
};