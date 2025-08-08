import axios from 'axios';

const DEEPSEEK_API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 创建axios实例
const deepseekApi = axios.create({
  baseURL: DEEPSEEK_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
  }
});

export const chatAPI = {
  // 原有的非流式方法保留
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
  },

  // 新增：流式发送消息
  sendMessageStream: async (content, onChunk) => {
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
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
          max_tokens: 1000,
          stream: true // 启用流式输出
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // 保留不完整的行

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                onChunk(content); // 调用回调函数处理每个chunk
              }
            } catch (e) {
              console.warn('解析SSE数据失败:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('流式API调用失败:', error);
      throw error;
    }
  }
};