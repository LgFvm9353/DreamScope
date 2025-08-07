'use client'

import { NavBar, Button, Card, Cell, CellGroup, PullRefresh, Skeleton, Toast } from 'react-vant'
import Link from 'next/link'
import { useRouter } from 'next/navigation'  // 添加这一行导入 useRouter
import styles from './page.module.css'
import { useState, useEffect } from 'react'
import useDreamStore from '@/store/useDreamStore'
import useTitle from '@/hooks/useTitle'
export default function HomePage() {
  const router = useRouter()  // 添加这一行初始化 router
  const [currentTime, setCurrentTime] = useState('')
  const [greeting, setGreeting] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { getDreams } = useDreamStore()
  const [dreams, setDreams] = useState([])
  const [error, setError] = useState(null);
  useTitle('首页')
  // 获取当前时间和问候语
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = now.getHours()
      
      // 设置问候语
      if (hours < 6) {
        setGreeting('夜深了，记得记录梦境哦')
      } else if (hours < 12) {
        setGreeting('早上好！记录今天的梦境吧')
      } else if (hours < 18) {
        setGreeting('下午好！回顾一下梦境')
      } else {
        setGreeting('晚上好！准备记录梦境')
      }
      
      // 设置时间
      setCurrentTime(now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }))
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    
    // 加载数据
    fetchDreams()
    
    return () => clearInterval(interval)
  }, [])

  // 获取梦境数据
  const fetchDreams = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const dreamsData = await getDreams({ _t: Date.now() });
      setDreams(dreamsData || []);
    } catch (error) {
      console.error('获取梦境数据失败:', error);
      setError('获取数据失败，请下拉刷新重试');
      // 如果API获取失败，使用模拟数据
      setDreams(recentDreams);
    } finally {
      setIsLoading(false);
    }
  };

  // 统计数据
  const stats = {
    total: dreams.length || 12,
    thisWeek: 3,
    thisMonth: 8
  }

  // 处理梦境点击
  const handleDreamClick = (dream) => {
    console.log('查看梦境详情:', dream)
    router.push(`/dream/${dream.id}`)
  }

  // 跳转到梦境库
  const handleGoToLibrary = () => {
    router.push('/library')
  }

  // 骨架屏组件
  const DreamSkeleton = () => (
    <div className={styles.container}>

      {/* 主要内容 */}
      <div className={styles.main}>
        {/* 记录按钮 */}
        <Skeleton style={{ height: 60, borderRadius: 16, marginBottom: 32 }} />

        {/* 统计卡片 */}
        <Card round className={styles.statsCard}>
          <Card.Header>
            <Skeleton title titleWidth="40%" />
          </Card.Header>
          <Card.Body>
            <div className={styles.statsGrid}>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} row={2} rowWidth={['60%', '40%']} />
              ))}
            </div>
          </Card.Body>
        </Card>

        {/* 梦境列表 */}
        <Card round className={styles.dreamsCard}>
          <Card.Header>
            <Skeleton title titleWidth="40%" />
          </Card.Header>
          <Card.Body>
            <CellGroup>
              {[...Array(3)].map((_, i) => (
                <Cell 
                  key={i} 
                  title={<Skeleton title titleWidth="70%" />}
                  label={<Skeleton row={1} rowWidth="40%" />}
                  rightIcon={<Skeleton style={{ width: 60, height: 30, borderRadius: 16 }} />}
                />
              ))}
            </CellGroup>
          </Card.Body>
        </Card>
      </div>
    </div>
  )

  // 使用骨架屏替代原来的加载中提示
  if (isLoading) {
    return <DreamSkeleton />
  }
  
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // 直接获取数据，不使用fetchDreams避免触发isLoading
      const dreamsData = await getDreams({ _t: Date.now() });
      setDreams(dreamsData || []);
      // 短暂延迟
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('刷新失败:', error);
    } finally {
      setRefreshing(false);
    }
    return;
  };
  
  return (
    <PullRefresh
      className={`${styles.container} scroll-container`}
      successText='刷新成功'
      onRefresh={onRefresh}
    >
      {/* <Head>
        <title>首页</title>
      </Head> */}
      {/* 头部区域 */}
      <NavBar 
        title={<>
          {currentTime}
          <div className={styles.subtitle}>{greeting}</div>
        </>} 
        className={styles.header}
        fixed={false}
        leftArrow={false}
      />
      
      {/* 主要内容区域 */}
      <div className={styles.main}>
        {/* 快速记录按钮 */}
        <Link href="/record">
          <Button 
            type="primary" 
            block 
            round 
            color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            className={styles.recordButtonWrapper}
          >
            快速记录梦境
          </Button>
        </Link>
        
        {/* 统计概览 */}
        <Card round className={styles.statsCard}>
          <Card.Header>梦境统计</Card.Header>
          <Card.Body>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>{stats.total}</div>
                <div className={styles.statLabel}>总记录</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>{stats.thisWeek}</div>
                <div className={styles.statLabel}>本周</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>{stats.thisMonth}</div>
                <div className={styles.statLabel}>本月</div>
              </div>
            </div>
          </Card.Body>
        </Card>
        
        {/* 最近梦境 */}
        <Card round className={styles.dreamsCard}>
          <Card.Header>
            <div className={styles.cardHeaderWithButton}>
              <span>最近梦境</span>
              <Button 
                size="small" 
                type="primary" 
                plain
                onClick={handleGoToLibrary}
                className={styles.moreButton}
              >
                更多
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            {dreams.length > 0 ? (
              <CellGroup>
                {dreams.slice(0, 5).map(dream => (
                  <Cell 
                    key={dream.id} 
                    title={dream.title}
                    label={dream.date}
                    clickable
                    onClick={() => handleDreamClick(dream)}
                    rightIcon={
                      <span className={styles.dreamEmotionText}>
                        {dream.emotionText}
                      </span>
                    }
                  />
                ))}
              </CellGroup>
            ) : (
              <div className={styles.emptyText}>
                {error || '暂无梦境记录，点击上方按钮开始记录'}
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </PullRefresh>
  )
}
