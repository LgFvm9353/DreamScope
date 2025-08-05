'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  NavBar, 
  Search, 
  Tabs, 
  Card, 
  Tag, 
  Button, 
  Skeleton,
  Empty,
  PullRefresh,
  List,
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
import WaterfallLayout from '../../components/WaterfallLayout';
import { dreamAPI } from '../../services/api';
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

  // 删除梦境
  const handleDeleteDream = useCallback(async (dream) => {
    try {
      await Dialog.confirm({
        title: '确认删除',
        message: '删除后无法恢复，确定要删除这个梦境吗？',
      });

      const response = await dreamAPI.deleteDream(dream.id);
      if (response && response.success) {
        setDreams(prev => prev.filter(item => item.id !== dream.id));
        // 使用简单的状态更新而不是 Toast
        setError('');
      } else {
        setError(response?.message || '删除失败');
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除梦境失败:', error);
        setError('删除失败，请重试');
      }
    }
  }, []);

  // 显示操作菜单
  const handleShowActions = useCallback((dream) => {
    setSelectedDream(dream);
    setActionSheetVisible(true);
  }, []);

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
      callback: () => handleDeleteDream(selectedDream)
    }
  ];

  // 渲染梦境卡片 - 添加安全检查
  const renderDreamCard = useCallback((dream, index) => {
    // 添加安全检查
    if (!dream || typeof dream !== 'object') {
      console.warn('Invalid dream object:', dream);
      return null;
    }

    return (
      <Card
        key={dream.id || index}
        className={styles.dreamCard}
        onClick={() => handleDreamDetail(dream)}
      >
        {dream.image && (
          <div className={styles.dreamImage}>
            <Image
              src={dream.image}
              alt="梦境图片"
              fit="cover"
              lazy
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

  return (
    <div className={styles.container}>
      {/* 导航栏 */}
      <NavBar
        leftIcon={<ArrowLeft />}
        onClickLeft={() => router.back()}
        className={styles.navbar}
        style={{ height: '25px' }}
      />

      {/* 搜索栏 */}
      {/* <div className={styles.searchSection}>
        <Search
          value={searchValue}
          onChange={setSearchValue}
          onSearch={handleSearch}
          placeholder="搜索梦境内容..."
          leftIcon={<SearchIcon />}
          className={styles.searchInput}
        />
      </div> */}

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
              gap={16}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              loading={loading}
              className={styles.waterfallContainer}
            />
          ) : (
            !loading && !error && (
              <Empty
                description="暂无梦境记录"
                image="search"
              />
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