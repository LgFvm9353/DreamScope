'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  NavBar, 
  Tabs, 
  Card, 
  Tag, 
  Button, 
  Skeleton,
  Empty,
  PullRefresh,
  Image,
  ActionSheet,
  Dialog
} from 'react-vant';
import { 
  ArrowLeft, 
  Search as SearchIcon, 
  Edit, 
  Delete,
  More
} from '@react-vant/icons';
import WaterfallLayout from '@/components/WaterfallLayout';
import { dreamAPI } from '@/services/api';
import useUserStore from '@/store/useUserStore';
import styles from './page.module.css';

// 情绪选项
const EMOTION_OPTIONS = [
  { value: 'happy', label: '快乐', icon: '😊' },
  { value: 'sad', label: '悲伤', icon: '😢' },
  { value: 'anxious', label: '焦虑', icon: '😰' },
  { value: 'peaceful', label: '平静', icon: '😌' },
  { value: 'excited', label: '兴奋', icon: '🤩' },
  { value: 'confused', label: '困惑', icon: '😕' },
  { value: 'angry', label: '愤怒', icon: '😠' },
  { value: 'nostalgic', label: '怀念', icon: '🥺' }
];

export default function LibraryPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedDream, setSelectedDream] = useState(null);
  const [error, setError] = useState('');
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [dreamToDelete, setDreamToDelete] = useState(null);

  // 检查用户登录状态
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      router.push('/login');
      return;
    }
  }, [router]);

  // 获取梦境列表
  const fetchDreams = useCallback(async (reset = false, search = '', category = 'all') => {
    try {
      setLoading(true);
      setError('');
      
      const currentPage = reset ? 1 : page;
      const params = {
        page: currentPage,
        limit: 20,
        search: search || undefined,
        emotion: category !== 'all' ? category : undefined
      };

      console.log('Fetching dreams with params:', params);
      const response = await dreamAPI.getDreams(params);
      console.log('API Response:', response);
      
      if (response && response.success) {
        // 确保 dreams 是数组
        const newDreams = Array.isArray(response.data?.dreams) ? response.data.dreams : [];
        
        if (reset) {
          setDreams(newDreams);
          setPage(2);
        } else {
          setDreams(prev => [...prev, ...newDreams]);
          setPage(prev => prev + 1);
        }
        
        setHasMore(response.data?.pagination?.hasMore || newDreams.length === 20);
      } else {
        setError(response?.message || '获取梦境列表失败');
        // 如果失败，确保dreams是空数组
        if (reset) {
          setDreams([]);
        }
      }
    } catch (error) {
      console.error('获取梦境列表失败:', error);
      setError('网络错误，请检查网络连接');
      // 如果失败，确保dreams是空数组
      if (reset) {
        setDreams([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page]);

  // 初始加载
  useEffect(() => {
    fetchDreams(true, searchValue, activeTab);
  }, [activeTab]);

  // 搜索处理
  const handleSearch = useCallback((value) => {
    setSearchValue(value);
    setPage(1);
    fetchDreams(true, value, activeTab);
  }, [activeTab]);

  // 下拉刷新
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchDreams(true, searchValue, activeTab);
  }, [searchValue, activeTab]);

  // 加载更多
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchDreams(false, searchValue, activeTab);
    }
  }, [loading, hasMore, searchValue, activeTab, fetchDreams]);

  // 标签切换
  const handleTabChange = useCallback((name) => {
    setActiveTab(name);
    setPage(1);
  }, []);

  // 梦境详情
  const handleDreamDetail = useCallback((dream) => {
    router.push(`/dream/${dream.id}`);
  }, [router]);

  // 编辑梦境
  const handleEditDream = useCallback((dream) => {
    router.push(`/record?edit=${dream.id}`);
  }, [router]);

  // 显示操作菜单
  const handleShowActions = useCallback((dream) => {
    setSelectedDream(dream);
    setActionSheetVisible(true);
  }, []);

  // 显示删除确认对话框
  const showDeleteConfirm = useCallback((dream) => {
    setDreamToDelete(dream);
    
    // 使用 Dialog.confirm 显示更丰富的删除确认
    Dialog.confirm({
      title: '⚠️ 删除梦境',
      message: `确定要删除梦境"${dream.title || '未命名梦境'}"吗？\n\n内容预览：${dream.content?.substring(0, 50)}${dream.content?.length > 50 ? '...' : ''}\n\n⚠️ 删除后无法恢复`,
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      confirmButtonColor: '#ee0a24',
    })
    .then(() => {
      confirmDeleteDream();
    })
    .catch(() => {
      // 用户取消删除
      setDreamToDelete(null);
    });
  }, []);

  // 确认删除梦境
  const confirmDeleteDream = useCallback(async () => {
    if (!dreamToDelete) return;

    try {
      // 检查用户登录状态
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setError('请先登录');
        router.push('/login');
        return;
      }

      console.log('开始删除梦境:', dreamToDelete.id);
      console.log('当前用户:', user);
      console.log('Token存在:', !!token);
      
      const response = await dreamAPI.deleteDream(dreamToDelete.id);
      console.log('删除响应:', response);
      
      if (response && response.success) {
        setDreams(prev => prev.filter(item => item.id !== dreamToDelete.id));
        setError('');
        console.log('删除成功，更新列表');
      } else {
        console.error('删除失败:', response);
        setError(response?.message || '删除失败');
      }
    } catch (error) {
      console.error('删除梦境失败:', error);
      
      // 处理超时错误
      if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
        setError('请求超时，请检查网络连接或稍后重试');
        return;
      }
      
      // 更详细的错误处理
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        
        if (status === 404) {
          setError('梦境不存在或已被删除');
        } else if (status === 401) {
          setError('登录已过期，请重新登录');
          localStorage.removeItem('jwt_token');
          router.push('/login');
        } else if (status === 403) {
          setError('无权删除此梦境');
        } else {
          setError(message || '删除失败，请重试');
        }
      } else if (error.request) {
        setError('网络连接失败，请检查网络');
      } else {
        setError('删除失败，请重试');
      }
    } finally {
      setDeleteConfirmVisible(false);
      setDreamToDelete(null);
    }
  }, [dreamToDelete, user, router]);

  // 取消删除
  const cancelDelete = useCallback(() => {
    setDeleteConfirmVisible(false);
    setDreamToDelete(null);
  }, []);

  // 渲染梦境卡片 - 优化图片显示和间距
  const renderDreamCard = useCallback((dream, index) => {
    // 添加安全检查
    if (!dream || typeof dream !== 'object') {
      console.warn('Invalid dream object:', dream);
      return null;
    }

    // 判断是否有图片
    const hasImage = dream.image && dream.image.trim() !== '';

    return (
      <Card
        key={dream.id || index}
        className={`${styles.dreamCard} ${hasImage ? styles.hasImage : styles.noImage}`}
        onClick={() => handleDreamDetail(dream)}
      >
        {/* 只有当图片存在且有效时才显示图片区域 */}
        {hasImage && (
          <div className={styles.dreamImage}>
            <Image
              src={dream.image}
              alt="梦境图片"
              fit="cover"
              lazy
              onError={(e) => {
                // 图片加载失败时隐藏图片容器
                e.target.parentElement.style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className={styles.dreamContent}>
          <div className={styles.dreamTitle}>
            {dream.title || '未命名梦境'}
          </div>
          
          <div className={styles.dreamDescription}>
            {dream.content?.substring(0, 100)}
            {dream.content?.length > 100 && '...'}
          </div>
          
          <div className={styles.dreamMeta}>
            <div className={styles.dreamTags}>
              {dream.emotion && (
                <Tag size="small" color="#f0f0f0">
                  {EMOTION_OPTIONS.find(opt => opt.value === dream.emotion)?.icon} 
                  {EMOTION_OPTIONS.find(opt => opt.value === dream.emotion)?.label}
                </Tag>
              )}
              {dream.category && (
                <Tag size="small" color="#e8f4ff">
                  {dream.category}
                </Tag>
              )}
            </div>
            
            <div className={styles.dreamActions}>
              <Button
                size="small"
                icon={<More />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleShowActions(dream);
                }}
              />
            </div>
          </div>
          
          <div className={styles.dreamDate}>
            {dream.createdAt ? new Date(dream.createdAt).toLocaleDateString() : ''}
          </div>
        </div>
      </Card>
    );
  }, [handleDreamDetail, handleShowActions]);

  // 操作菜单选项
  const actionSheetActions = [
    {
      name: '编辑',
      icon: <Edit />,
      callback: () => handleEditDream(selectedDream)
    },
    {
      name: '删除',
      icon: <Delete />,
      color: '#ee0a24',
      callback: () => showDeleteConfirm(selectedDream)
    }
  ];

  return (
    <div className={styles.container}>
      {/* 导航栏 */}
      <NavBar
        leftIcon={<ArrowLeft />}
        onClickLeft={() => router.back()}
        className={styles.navbar}
        style={{ height: '25px' }}
      />

      {/* 分类标签 */}
      <div className={styles.tabsSection}>
        <Tabs 
          active={activeTab} 
          onChange={handleTabChange} 
          className={styles.tabs}
        >
          <Tabs.TabPane name="all" title="全部" />
          {EMOTION_OPTIONS.slice(0, 6).map(emotion => (
            <Tabs.TabPane 
              key={emotion.value}
              name={emotion.value}
              title={`${emotion.icon} ${emotion.label}`}
            />
          ))}
        </Tabs>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className={styles.errorMessage}>
          {error}
          <Button 
            size="small" 
            type="primary" 
            onClick={() => {
              setError('');
              fetchDreams(true, searchValue, activeTab);
            }}
          >
            重试
          </Button>
        </div>
      )}

      {/* 梦境列表 */}
      <div className={styles.content}>
        <PullRefresh
          loading={refreshing}
          onRefresh={handleRefresh}
        >
          {Array.isArray(dreams) && dreams.length > 0 ? (
            <WaterfallLayout
              items={dreams}
              renderItem={renderDreamCard}
              columns={2}
              gap={10} // 减少间距从16到10
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              loading={loading}
              className={styles.waterfallContainer}
            />
          ) : (
            !loading && !error && (
              <div className={styles.emptyContainer}>
                <Empty
                  description="暂无梦境记录"
                  image="search"
                />
              </div>
            )
          )}
          
          {loading && (!Array.isArray(dreams) || dreams.length === 0) && !error && (
            <div className={styles.skeletonContainer}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className={styles.skeletonCard} />
              ))}
            </div>
          )}
        </PullRefresh>
      </div>

      {/* 操作菜单 */}
      <ActionSheet
        visible={actionSheetVisible}
        actions={actionSheetActions}
        onCancel={() => setActionSheetVisible(false)}
        onSelect={(action) => {
          action.callback();
          setActionSheetVisible(false);
        }}
      />

    </div>
  );
}