import { useEffect, useCallback, useRef } from 'react';
import useDreamStore from '@/store/dreamStore';

export const useDreamRecord = () => {
  const {
    dreamData,
    saveOption,
    loading,
    draft,
    updateDreamContent,
    updateEmotion,
    updateType,
    updateTags,
    updateSaveOption,
    saveDraft,
    loadDraft,
    clearDraft,
    resetDreamData,
    setLoading,
    saveDream,
  } = useDreamStore();

  const autoSaveTimeoutRef = useRef(null);

  // 自动保存功能
  const autoSave = useCallback((content) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (content.trim()) {
        saveDraft();
      }
    }, 2000); // 2秒后自动保存
  }, [saveDraft]);

  // 处理内容变化
  const handleContentChange = useCallback((content) => {
    updateDreamContent(content);
    autoSave(content);
  }, [updateDreamContent, autoSave]);

  // 处理情绪选择
  const handleEmotionChange = useCallback((emotion) => {
    updateEmotion(emotion);
  }, [updateEmotion]);

  // 处理类型选择
  const handleTypeChange = useCallback((type) => {
    updateType(type);
  }, [updateType]);

  // 处理标签变化
  const handleTagsChange = useCallback((tags) => {
    updateTags(tags);
  }, [updateTags]);

  // 处理保存选项变化
  const handleSaveOptionChange = useCallback((option) => {
    updateSaveOption(option);
  }, [updateSaveOption]);

  // 验证表单
  const validateForm = useCallback(() => {
    const errors = [];

    if (!dreamData.content.trim()) {
      errors.push('梦境内容不能为空');
    }

    if (!dreamData.emotion) {
      errors.push('请选择情绪');
    }

    if (!dreamData.type) {
      errors.push('请选择梦境类型');
    }

    return errors;
  }, [dreamData]);

  // 保存梦境
  const handleSave = useCallback(async () => {
    const errors = validateForm();
    
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    try {
      const result = await saveDream();
      return result;
    } catch (error) {
      throw error;
    }
  }, [validateForm, saveDream]);

  // 加载草稿
  const handleLoadDraft = useCallback(() => {
    return loadDraft();
  }, [loadDraft]);

  // 清除草稿
  const handleClearDraft = useCallback(() => {
    clearDraft();
    resetDreamData();
  }, [clearDraft, resetDreamData]);

  // 检查是否有草稿
  const hasDraft = draft !== null;

  // 检查内容是否为空
  const isEmpty = !dreamData.content.trim();

  // 清理定时器
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    // 数据
    dreamData,
    saveOption,
    loading,
    hasDraft,
    isEmpty,
    
    // 事件处理
    handleContentChange,
    handleEmotionChange,
    handleTypeChange,
    handleTagsChange,
    handleSaveOptionChange,
    handleSave,
    handleLoadDraft,
    handleClearDraft,
    
    // 验证
    validateForm,
  };
}; 