'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  NavBar, 
  Button, 
  Field, 
  CellGroup, 
  Toast,
  DropdownMenu
} from 'react-vant';
import { ArrowLeft, Checked } from '@react-vant/icons';
import { useDreamRecord } from '@/hooks/useDreamRecord';
import { EMOTION_OPTIONS, DREAM_TYPE_OPTIONS, SAVE_OPTIONS } from '@/config/dreamConfig';
import styles from './page.module.css';
import useTitle from '@/hooks/useTitle';

const RecordPage = () => {
  const router = useRouter();
  useTitle('梦境记录'); // 使用自定义hook设置页面标题
  
  const {
    dreamData,
    saveOption,
    loading,
    hasDraft,
    isEmpty,
    handleContentChange,
    handleEmotionChange,
    handleTypeChange,
    handleTagsChange,
    handleSaveOptionChange,
    handleSave,
    handleLoadDraft,
    handleClearDraft,
  } = useDreamRecord();

  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // 检查草稿
  useEffect(() => {
    if (hasDraft && isEmpty) {
      setShowDraftDialog(true);
    }
  }, [hasDraft, isEmpty]);

  // 处理保存点击
  const handleSaveClick = async () => {
    try {
      await handleSave();
      Toast.success('保存成功');
      
      if (saveOption === 'save_and_analyze') {
        router.push('/analysis');
      } else {
        router.push('/');
      }
    } catch (error) {
      Toast.fail(error.message || '保存失败');
    }
  };

  // 处理标签输入
  const handleTagInputChange = (value) => {
    setTagInput(value);
  };

  const handleTagInputConfirm = () => {
    if (tagInput.trim()) {
      const newTags = [...dreamData.tags, tagInput.trim()];
      handleTagsChange(newTags);
      setTagInput('');
    }
  };

  const handleTagDelete = (index) => {
    const newTags = dreamData.tags.filter((_, i) => i !== index);
    handleTagsChange(newTags);
  };

  // 草稿对话框
  const showDraftDialogContent = () => (
    showDraftDialog && (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <h3>发现草稿</h3>
          <p>您有未完成的梦境记录，是否要恢复？</p>
          <div className={styles.modalButtons}>
            <Button 
              type="primary" 
              onClick={() => {
                handleLoadDraft();
                setShowDraftDialog(false);
              }}
            >
              恢复草稿
            </Button>
            <Button 
              onClick={() => {
                handleClearDraft();
                setShowDraftDialog(false);
              }}
            >
              清除草稿
            </Button>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className={styles.container}>
      {/* 草稿对话框 */}
      {showDraftDialogContent()}

      {/* 导航栏 */}
      <NavBar
        title="梦境记录"
        leftArrow={<ArrowLeft />}
        onClickLeft={() => router.back()}
        fixed
        placeholder
      />

      {/* 主要内容 */}
      <div className={styles.content}>
        {/* 梦境内容 */}
        <CellGroup title="梦境内容">
          <div className={styles.textareaWrapper}>
            <textarea
              value={dreamData.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="请详细描述您的梦境内容..."
              rows={6}
              maxLength={2000}
              className={styles.textArea}
            />
            <div className={styles.charCount}>
              {dreamData.content.length}/2000
            </div>
          </div>
        </CellGroup>

        {/* 情绪选择 */}
        <CellGroup title="选择情绪">
          <div className={styles.emotionGrid}>
            {EMOTION_OPTIONS.map((emotion) => (
              <div
                key={emotion.value}
                className={`${styles.emotionItem} ${
                  dreamData.emotion === emotion.value ? styles.selected : ''
                }`}
                onClick={() => handleEmotionChange(emotion.value)}
              >
                <span className={styles.emotionIcon}>{emotion.icon}</span>
                <span className={styles.emotionLabel}>{emotion.label}</span>
              </div>
            ))}
          </div>
        </CellGroup>

        {/* 梦境类型 */}
        <CellGroup title="梦境类型">
          <div className={styles.typeGrid}>
            {DREAM_TYPE_OPTIONS.map((type) => (
              <div
                key={type.value}
                className={`${styles.typeItem} ${
                  dreamData.type === type.value ? styles.selected : ''
                }`}
                onClick={() => handleTypeChange(type.value)}
              >
                <span className={styles.typeIcon}>{type.icon}</span>
                <span className={styles.typeLabel}>{type.label}</span>
              </div>
            ))}
          </div>
        </CellGroup>

        {/* 标签 */}
        <CellGroup title="标签" description="添加关键词标签，帮助分类和搜索您的梦境记录">
          <div className={styles.tagsContainer}>
            {dreamData.tags.map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
                <button 
                  onClick={() => handleTagDelete(index)}
                  className={styles.tagClose}
                >
                  ×
                </button>
              </span>
            ))}
            <Field
              value={tagInput}
              onChange={handleTagInputChange}
              placeholder="输入标签后按回车添加"
              onPressEnter={handleTagInputConfirm}
              className={styles.tagInput}
            />
          </div>
        </CellGroup>

        {/* 保存选项 - 简化实现 */}
        <CellGroup title="保存方式">
          <div className={styles.saveOptions}>
            {SAVE_OPTIONS.map((option) => (
              <div
                key={option.id}
                className={`${styles.saveOption} ${saveOption === option.id ? styles.selected : ''}`}
                onClick={() => handleSaveOptionChange(option.id)}
              >
                <span className={styles.optionIcon}>{option.icon}</span>
                <div className={styles.optionText}>
                  <div className={styles.optionLabel}>{option.label}</div>
                  <div className={styles.optionDesc}>{option.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CellGroup>

        {/* 保存按钮 */}
        <div className={styles.actions}>
          <Button
            type="primary"
            size="large"
            loading={loading}
            disabled={isEmpty}
            onClick={handleSaveClick}
            className={styles.saveButton}
            block
          >
            {loading ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}>保存中...</div>
        </div>
      )}
    </div>
  );
};

export default RecordPage;