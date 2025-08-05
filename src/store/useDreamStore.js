import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dreamAPI } from '@/services/api';

const useDreamStore = create(
  persist(
    (set, get) => ({
      // 梦境数据
      dreamData: {
        content: '',
        emotion: '',
        type: '',
        tags: [],
        timestamp: null,
      },
      
      // 保存选项
      saveOption: 'save_only',
      
      // 加载状态
      loading: false,
      
      // 草稿数据
      draft: null,
      
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
        get().saveDraft();
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
      
      // 更新保存选项
      updateSaveOption: (option) => {
        set({ saveOption: option });
      },
      
      // 保存草稿
      saveDraft: () => {
        const { dreamData } = get();
        if (dreamData.content.trim()) {
          set({ draft: { ...dreamData, savedAt: Date.now() } });
        }
      },
      
      // 加载草稿
      loadDraft: () => {
        const { draft } = get();
        if (draft) {
          set({ dreamData: draft });
          return true;
        }
        return false;
      },
      
      // 清除草稿
      clearDraft: () => {
        set({ draft: null });
      },
      
      // 重置梦境数据
      resetDreamData: () => {
        set({
          dreamData: {
            content: '',
            emotion: '',
            type: '',
            tags: [],
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
        const { dreamData, saveOption } = get();
        
        if (!dreamData.content.trim()) {
          throw new Error('梦境内容不能为空');
        }
        
        set({ loading: true });
        
        try {
          const dreamRecord = {
            ...dreamData,
            createdAt: new Date().toISOString(),
            analysisStatus: saveOption === 'save_only' ? 'skipped' : 'pending',
          };
          
          // 调用API保存梦境
          const result = await dreamAPI.createDream(dreamRecord);
          
          // 清除草稿
          get().clearDraft();
          
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
      partialize: (state) => ({
        draft: state.draft,
        saveOption: state.saveOption,
      }),
    }
  )
);

export default useDreamStore;