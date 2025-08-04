'use client';

import React, { useState, useEffect } from 'react';
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

  // 获取梦境详情
  useEffect(() => {
    const fetchDreamDetail = async () => {
      if (!params.id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const dreamData = await dreamAPI.getDream(params.id);
        setDream(dreamData);
      } catch (error) {
        console.error('获取梦境详情失败:', error);
        setError('获取梦境详情失败，请返回重试');
        showToast('获取梦境详情失败', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDreamDetail();
  }, [params.id]);

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
    router.back();
  };

  // 分析梦境
  const handleAnalyze = async () => {
    if (!dream) return;
    
    try {
      showToast('正在分析...', 'info');
      await dreamAPI.analyzeDream(dream.id);
      showToast('分析完成', 'success');
      router.push('/analysis');
    } catch (error) {
      console.error('分析失败:', error);
      showToast('分析失败，请重试', 'error');
    }
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
  const emotionOption = getEmotionOption(dream.emotion);
  const typeOption = getDreamTypeOption(dream.type);

  return (
    <div className={styles.container}>
      {/* 导航栏 */}
      <div className={styles.navbar}>
        <button onClick={handleBack} className={styles.backBtn}>
          ← 返回
        </button>
        <h1 className={styles.title}>梦境详情</h1>
      </div>

      {/* 内容区域 */}
      <div className={styles.content}>
        <div className={styles.dreamCard}>
          {/* 梦境标题和元信息 */}
          <div className={styles.dreamHeader}>
            <h2 className={styles.dreamTitle}>{dream.title}</h2>
            <div className={styles.dreamMeta}>
              <span className={styles.dreamDate}>
                🕐 {dream.date}
              </span>
              <span 
                className={`${styles.dreamEmotion} ${styles[dream.emotion]}`}
              >
                {emotionOption.icon} {emotionOption.label}
              </span>
            </div>
          </div>

          {/* 梦境内容 */}
          <div className={styles.dreamContent}>
            {dream.content}
          </div>

          {/* 梦境类型和标签 */}
          <div className={styles.dreamFooter}>
            <div className={styles.dreamType}>
              <span className={styles.typeLabel}>梦境类型：</span>
              <span className={styles.typeValue}>
                {typeOption.icon} {typeOption.label}
              </span>
            </div>
            
            {dream.tags && dream.tags.length > 0 && (
              <div className={styles.dreamTags}>
                <span className={styles.tagsLabel}>🏷️ 标签：</span>
                <div className={styles.tagsList}>
                  {dream.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className={styles.actions}>
          <button 
            onClick={handleAnalyze}
            className={styles.analyzeButton}
          >
            🤖 AI分析梦境
          </button>
        </div>
      </div>
    </div>
  );
};

export default DreamDetailPage;