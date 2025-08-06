'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { dreamAPI } from '@/services/api';
import { EMOTION_OPTIONS, DREAM_TYPE_OPTIONS } from '@/config/dreamConfig';
import styles from './page.module.css';

const DreamDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [dream, setDream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // 编辑状态的表单数据
  const [editForm, setEditForm] = useState({
    content: '',
    emotion: '',
    type: '',
    tags: []
  });

  // 获取梦境详情
  const fetchDreamDetail = useCallback(async () => {
    if (!params.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching dream detail for ID:', params.id);
      const response = await dreamAPI.getDream(params.id);
      console.log('Dream detail response:', response);
      
      if (response && response.success) {
        // 处理新的API响应格式
        setDream(response.data);
        setEditForm({
          content: response.data.content || '',
          emotion: response.data.emotion || '',
          type: response.data.type || '',
          tags: response.data.tags || []
        });
      } else if (response) {
        // 处理旧的API响应格式（直接返回梦境数据）
        setDream(response);
        setEditForm({
          content: response.content || '',
          emotion: response.emotion || '',
          type: response.type || '',
          tags: response.tags || []
        });
      } else {
        setError('获取梦境详情失败');
        showToast('获取梦境详情失败', 'error');
      }
    } catch (error) {
      console.error('获取梦境详情失败:', error);
      if (error.code === 'ECONNABORTED') {
        setError('请求超时，请检查网络连接');
      } else {
        setError('获取梦境详情失败，请返回重试');
      }
      showToast('获取梦境详情失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [params.id]);
  
  // 初始加载时获取梦境详情
  useEffect(() => {
    fetchDreamDetail();
  }, [fetchDreamDetail]);

  // 简单的Toast提示函数
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: ${type === 'error' ? '#ff4d4f' : '#52c41a'};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 9999;
      font-size: 14px;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 2000);
  };

  // 获取情绪对象
  const getEmotionOption = (emotionValue) => {
    return EMOTION_OPTIONS.find(option => option.value === emotionValue) || {
      value: emotionValue,
      label: emotionValue,
      icon: '😐',
      color: '#d9d9d9'
    };
  };

  // 获取梦境类型对象
  const getDreamTypeOption = (typeValue) => {
    return DREAM_TYPE_OPTIONS.find(option => option.value === typeValue) || {
      value: typeValue,
      label: typeValue,
      icon: '❓'
    };
  };

  // 返回首页
  const handleBack = () => {
    if (isEditing) {
      if (window.confirm('编辑内容尚未保存，确定要离开吗？')) {
        setIsEditing(false);
        router.back();
      }
    } else {
      router.back();
    }
  };

  // 开始编辑
  const handleEdit = () => {
    setIsEditing(true);
  };

  // 取消编辑
  const handleCancel = () => {
    if (window.confirm('确定要取消编辑吗？未保存的更改将丢失。')) {
      setIsEditing(false);
      // 重置表单数据
      setEditForm({
        content: dream.content || '',
        emotion: dream.emotion || '',
        type: dream.type || '',
        tags: dream.tags || []
      });
    }
  };

  // 保存编辑
  const handleSave = async () => {
    if (!editForm.content.trim()) {
      showToast('梦境内容不能为空', 'error');
      return;
    }

    if (!editForm.emotion) {
      showToast('请选择情绪', 'error');
      return;
    }

    if (!editForm.type) {
      showToast('请选择梦境类型', 'error');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        content: editForm.content.trim(),
        emotion: editForm.emotion,
        type: editForm.type,
        tags: editForm.tags.filter(tag => tag.trim()).join(',')
      };

      const response = await dreamAPI.updateDream(params.id, updateData);
      
      if (response && (response.success || response.id)) {
        // 更新本地状态
        const updatedDream = {
          ...dream,
          ...updateData,
          tags: editForm.tags.filter(tag => tag.trim())
        };
        setDream(updatedDream);
        setIsEditing(false);
        showToast('保存成功', 'success');
      } else {
        showToast('保存失败，请重试', 'error');
      }
    } catch (error) {
      console.error('保存失败:', error);
      showToast('保存失败，请重试', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 更新表单数据
  const updateEditForm = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 添加标签
  const addTag = (tag) => {
    if (tag.trim() && !editForm.tags.includes(tag.trim())) {
      updateEditForm('tags', [...editForm.tags, tag.trim()]);
    }
  };

  // 删除标签
  const removeTag = (index) => {
    updateEditForm('tags', editForm.tags.filter((_, i) => i !== index));
  };

  // 加载状态
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.navbar}>
          <button onClick={handleBack} className={styles.backBtn}>
            ← 返回
          </button>
          <h1 className={styles.title}>梦境详情</h1>
        </div>
        <div className={styles.content}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.navbar}>
          <button onClick={handleBack} className={styles.backBtn}>
            ← 返回
          </button>
          <h1 className={styles.title}>梦境详情</h1>
        </div>
        <div className={styles.content}>
          <div className={styles.error}>
            <p>😔 {error}</p>
            <button onClick={handleBack} className={styles.primaryBtn}>
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dream) {
    return null;
  }

  // 获取情绪和类型信息
  const emotionOption = getEmotionOption(isEditing ? editForm.emotion : dream.emotion);
  const typeOption = getDreamTypeOption(isEditing ? editForm.type : dream.type);

  return (
    <div className={styles.container}>
      {/* 导航栏 */}
      <div className={styles.navbar}>
        <button onClick={handleBack} className={styles.backBtn}>
          ← 返回
        </button>
        <h1 className={styles.title}>
          {isEditing ? '编辑梦境' : '梦境详情'}
        </h1>
        <div className={styles.navActions}>
          {isEditing ? (
            <>
              <button 
                onClick={handleCancel} 
                className={styles.cancelBtn}
                disabled={saving}
              >
                取消
              </button>
              <button 
                onClick={handleSave} 
                className={styles.saveBtn}
                disabled={saving}
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </>
          ) : (
            <button onClick={handleEdit} className={styles.editBtn}>
              ✏️ 编辑
            </button>
          )}
        </div>
      </div>

      {/* 内容区域 */}
      <div className={styles.content}>
        <div className={styles.dreamCard}>
          {/* 梦境标题和元信息 */}
          <div className={styles.dreamHeader}>
            <h2 className={styles.dreamTitle}>
              {dream.title || '梦境记录'}
            </h2>
            <div className={styles.dreamMeta}>
              <span className={styles.dreamDate}>
                🕐 {dream.date}
              </span>
              {!isEditing && (
                <span 
                  className={`${styles.dreamEmotion} ${styles[dream.emotion]}`}
                >
                  {emotionOption.icon} {emotionOption.label}
                </span>
              )}
            </div>
          </div>

          {/* 梦境内容 */}
          <div className={styles.dreamContentSection}>
            <label className={styles.fieldLabel}>梦境内容：</label>
            {isEditing ? (
              <textarea
                value={editForm.content}
                onChange={(e) => updateEditForm('content', e.target.value)}
                className={styles.contentTextarea}
                placeholder="请描述你的梦境..."
                rows={8}
              />
            ) : (
              <div className={styles.dreamContent}>
                {dream.content}
              </div>
            )}
          </div>

          {/* 情绪选择 */}
          {isEditing && (
            <div className={styles.emotionSection}>
              <label className={styles.fieldLabel}>情绪：</label>
              <div className={styles.emotionOptions}>
                {EMOTION_OPTIONS.map((emotion) => (
                  <button
                    key={emotion.value}
                    onClick={() => updateEditForm('emotion', emotion.value)}
                    className={`${styles.emotionOption} ${
                      editForm.emotion === emotion.value ? styles.selected : ''
                    }`}
                  >
                    {emotion.icon} {emotion.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 梦境类型选择 */}
          {isEditing && (
            <div className={styles.typeSection}>
              <label className={styles.fieldLabel}>梦境类型：</label>
              <div className={styles.typeOptions}>
                {DREAM_TYPE_OPTIONS.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => updateEditForm('type', type.value)}
                    className={`${styles.typeOption} ${
                      editForm.type === type.value ? styles.selected : ''
                    }`}
                  >
                    {type.icon} {type.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 标签 */}
          <div className={styles.tagsSection}>
            <label className={styles.fieldLabel}>🏷️ 标签：</label>
            {isEditing ? (
              <div className={styles.tagsEdit}>
                <div className={styles.tagsList}>
                  {editForm.tags.map((tag, index) => (
                    <span key={index} className={styles.editableTag}>
                      {tag}
                      <button
                        onClick={() => removeTag(index)}
                        className={styles.removeTagBtn}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="输入标签后按回车添加"
                  className={styles.tagInput}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            ) : (
              dream.tags && dream.tags.length > 0 && (
                <div className={styles.tagsList}>
                  {dream.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )
            )}
          </div>

          {/* 梦境类型显示（非编辑状态） */}
          {!isEditing && (
            <div className={styles.dreamFooter}>
              <div className={styles.dreamType}>
                <span className={styles.typeLabel}>梦境类型：</span>
                <span className={styles.typeValue}>
                  {typeOption.icon} {typeOption.label}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DreamDetailPage;