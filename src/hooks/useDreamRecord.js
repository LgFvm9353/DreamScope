import { useCallback } from 'react';
import useDreamStore from '@/store/useDreamStore';

export const useDreamRecord = () => {
  const {
    dreamData,
    loading,
    updateDreamContent,
    updateEmotion,
    updateType,
    updateTags,
    updateImage, 
    resetDreamData,
    setLoading,
    saveDream,
  } = useDreamStore();

  // 处理内容变化
  const handleContentChange = useCallback((content) => {
    updateDreamContent(content);
  }, [updateDreamContent]);

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

  // 处理图片变化（单张）
  const handleImageChange = useCallback((image) => {
    updateImage(image);
  }, [updateImage]);

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

  // 检查内容是否为空
  const isEmpty = !dreamData.content.trim();

  return {
    // 数据
    dreamData,
    loading,
    isEmpty,
    
    // 事件处理
    handleContentChange,
    handleEmotionChange,
    handleTypeChange,
    handleTagsChange,
    handleImageChange, // 改为单张图片
    handleSave,
    
    // 验证
    validateForm,
  };
};