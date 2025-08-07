import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dreamAPI, uploadAPI } from '@/services/api'; 

const useDreamStore = create(
  persist(
    (set, get) => ({
      // 梦境数据
      dreamData: {
        content: '',
        emotion: '',
        type: '',
        tags: [],
        image: null, // 改为单张图片
        timestamp: null,
      },
      
      // 加载状态
      loading: false,
      
      // 梦境列表
      dreams: [],
      
      // 更新梦境内容
      updateDreamContent: (content) => {
        set((state) => ({
          dreamData: {
            ...state.dreamData,
            content,
            timestamp: Date.now(),
          },
        }));
      },
      
      // 更新情绪
      updateEmotion: (emotion) => {
        set((state) => ({
          dreamData: {
            ...state.dreamData,
            emotion,
          },
        }));
      },
      
      // 更新梦境类型
      updateType: (type) => {
        set((state) => ({
          dreamData: {
            ...state.dreamData,
            type,
          },
        }));
      },
      
      // 更新标签
      updateTags: (tags) => {
        set((state) => ({
          dreamData: {
            ...state.dreamData,
            tags,
          },
        }));
      },
      
      // 更新图片（单张）
      updateImage: (image) => {
        set((state) => ({
          dreamData: {
            ...state.dreamData,
            image,
          },
        }));
      },
      
      // 重置梦境数据
      resetDreamData: () => {
        set({
          dreamData: {
            content: '',
            emotion: '',
            type: '',
            tags: [],
            image: null, // 重置时也要包含图片字段
            timestamp: null,
          },
        });
      },
      
      // 设置加载状态
      setLoading: (loading) => {
        set({ loading });
      },
      
      // 保存梦境记录
      saveDream: async () => {
        const { dreamData } = get();
        
        if (!dreamData.content.trim()) {
          throw new Error('梦境内容不能为空');
        }
        
        set({ loading: true });
        
        try {
          // 先上传图片
          let uploadedImageUrl = null;
          if (dreamData.image && dreamData.image.file) {
            try {
              const uploadResult = await uploadAPI.uploadImage(dreamData.image.file);
              if (uploadResult && uploadResult.success) {
                uploadedImageUrl = uploadResult.url;
              }
            } catch (uploadError) {
              console.error('图片上传失败:', uploadError);
              // 继续保存，不中断整个保存流程
            }
          }
          
          const dreamRecord = {
            ...dreamData,
            // 将标签数组转换为逗号分隔的字符串
            tags: Array.isArray(dreamData.tags) 
              ? dreamData.tags.filter(tag => tag.trim()).join(',')
              : dreamData.tags || '',
            image: uploadedImageUrl, // 使用上传后的图片URL
            createdAt: new Date().toISOString(),
            analysisStatus: 'pending',
          };
          
          // 调用API保存梦境
          const result = await dreamAPI.createDream(dreamRecord);
          
          // 重置数据
          get().resetDreamData();
          
          return { success: true, data: result };
        } catch (error) {
          console.error('保存梦境失败:', error);
          throw new Error(error.response?.data?.message || '保存失败，请重试');
        } finally {
          set({ loading: false });
        }
      },
      
      // 获取用户梦境列表
      getDreams: async (params = {}) => {
        try {
          const response = await dreamAPI.getDreams(params);
          if (response && response.success) {
            const dreams = response.data?.dreams || [];
            set({ dreams });
            return dreams;
          } else {
            throw new Error(response?.message || '获取梦境列表失败');
          }
        } catch (error) {
          console.error('获取梦境列表失败:', error);
          throw error;
        }
      },
      
      // 删除梦境
      deleteDream: async (dreamId) => {
        try {
          await dreamAPI.deleteDream(dreamId);
          // 更新本地列表
          const { dreams } = get();
          set({ dreams: dreams.filter(dream => dream.id !== dreamId) });
          return { success: true };
        } catch (error) {
          console.error('删除梦境失败:', error);
          throw error;
        }
      },
      
      // 分析梦境
      analyzeDream: async (dreamId) => {
        try {
          const result = await dreamAPI.analyzeDream(dreamId);
          return result;
        } catch (error) {
          console.error('分析梦境失败:', error);
          throw error;
        }
      }
     
    }),
    {
      name: 'dream-store',
      partialize: () => ({}), // 不再持久化任何数据
    }
  )
);

export default useDreamStore;