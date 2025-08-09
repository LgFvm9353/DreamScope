import axios from 'axios';

// Coze API配置
const COZE_PAT_TOKEN = process.env.NEXT_PUBLIC_COZE_PAT_TOKEN;
const COZE_WORKFLOW_ID = process.env.NEXT_PUBLIC_COZE_WORKFLOW_ID;

// Coze工作流API
export const cozeWorkflowAPI = {
  // 生成头像 - 只接收用户签名作为参数
  generateAvatar: async (signature) => {
    try {
      // 检查API配置
      if (!COZE_PAT_TOKEN || !COZE_WORKFLOW_ID) {
        throw new Error('Coze API配置缺失');
      }
      
      // 准备请求参数 - 根据最新的Coze API文档
      const requestData = {
        workflow_id: COZE_WORKFLOW_ID,
        inputs: {
          prompt: signature // 将用户签名作为提示词传递给工作流
        }
      };
      
      // 发送请求到Coze工作流API
      const response = await axios.post('https://api.coze.cn/v1/workflow/run', requestData, {
        headers: {
          'Authorization': `Bearer ${COZE_PAT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      // 检查响应
      if (response.data.code !== 0) {
        console.error('工作流调用失败:', response.data);
        throw new Error(response.data.message || '工作流调用失败');
      }
      
      // 从响应中提取图片URL
      // 注意：这里的路径可能需要根据实际API响应结构调整
      let imageUrl = null;
      const responseData = response.data;
      
      // 检查data字段是否为字符串，如果是则尝试解析JSON
      if (responseData.data && typeof responseData.data === 'string') {
        try {
          // 解析JSON字符串
          const parsedData = JSON.parse(responseData.data);
          
          // 尝试从解析后的数据中提取URL
          if (parsedData.output && typeof parsedData.output === 'string') {
            // 清理可能包含的反引号
            imageUrl = parsedData.output.replace(/`/g, '').trim();
          }
        } catch (parseError) {
          console.error('解析响应数据失败:', parseError);
          // 如果解析失败，尝试直接从字符串中提取URL
          const urlMatch = responseData.data.match(/https?:\/\/[^\s`"']+/g);
          if (urlMatch && urlMatch.length > 0) {
            imageUrl = urlMatch[0];
          }
        }
      }
      
      // 如果上面的方法都失败，尝试其他可能的位置
      if (!imageUrl) {
        // 尝试从debug_url中提取
        if (responseData.debug_url && typeof responseData.debug_url === 'string') {
          const urlMatch = responseData.debug_url.match(/https?:\/\/[^\s`"']+/g);
          if (urlMatch && urlMatch.length > 0) {
            imageUrl = urlMatch[0];
          }
        }
      }
      
      if (!imageUrl) {
        throw new Error('未获取到图片URL');
      }
      
      
      return {
        imageUrl: imageUrl
      };
    } catch (error) {
      throw error;
    }
  }
};

export default cozeWorkflowAPI;