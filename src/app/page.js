'use client'

import { NavBar, Button, Card, Cell, CellGroup } from 'react-vant'
import Link from 'next/link'
import { getRouteByPath } from '@/config/routes'
import styles from './page.module.css'
import { useState, useEffect } from 'react'
import useTitle from '@/hooks/useTitle'
export default function HomePage() {
  const route = getRouteByPath('/')
  const [currentTime, setCurrentTime] = useState('')
  const [greeting, setGreeting] = useState('')
  const [isLoading, setIsLoading] = useState(true)
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
    
    // 模拟加载完成
    setTimeout(() => setIsLoading(false), 500)
    
    return () => clearInterval(interval)
  }, [])

  // 模拟梦境数据
  const recentDreams = [
    {
      id: 1,
      title: '梦见飞翔',
      date: '2024-01-15',
      emotion: 'happy',
      emotionText: '开心',
      description: '在天空中自由翱翔，感觉无比轻松'
    },
    {
      id: 2,
      title: '海边散步',
      date: '2024-01-14',
      emotion: 'calm',
      emotionText: '平静',
      description: '在海边漫步，听着海浪声'
    },
    {
      id: 3,
      title: '追逐游戏',
      date: '2024-01-13',
      emotion: 'fear',
      emotionText: '恐惧',
      description: '被什么东西追赶，感觉很紧张'
    }
  ]

  // 统计数据
  const stats = {
    total: 12,
    thisWeek: 3,
    thisMonth: 8
  }

  // 处理梦境点击
  const handleDreamClick = (dream) => {
    console.log('查看梦境详情:', dream)
    // 这里可以跳转到梦境详情页面
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <NavBar title={route.title} />
        <div className={styles.loading}>
          <div className="text-lg">加载中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.container} scroll-container`}>
      
      {/* 头部区域 */}
      <div className={`${styles.header} ${styles.fadeInUp}`}>
        <div className={styles.title}>{greeting}</div>
        <div className={styles.subtitle}>{currentTime}</div>
      </div>
      
      {/* 主要内容 */}
      <div className={styles.main}>
        {/* 快速记录按钮 */}
        <Link href="/record">
          <button className={`${styles.recordButton} ${styles.fadeInUp}`}>
            ✨ 记录今日梦境
          </button>
        </Link>
        
        {/* 统计概览 */}
        <div className={`${styles.statsOverview} ${styles.fadeInUp}`}>
          <div className={styles.statsTitle}>梦境统计</div>
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
        </div>
        
        {/* 最近梦境 */}
        <div className={`${styles.recentDreams} ${styles.fadeInUp}`}>
          <div className={styles.recentDreamsTitle}>最近梦境</div>
          {recentDreams.length > 0 ? (
            recentDreams.map((dream) => (
              <div 
                key={dream.id} 
                className={styles.dreamItem}
                onClick={() => handleDreamClick(dream)}
              >
                <div className={styles.dreamInfo}>
                  <div className={styles.dreamTitle}>{dream.title}</div>
                  <div className={styles.dreamMeta}>{dream.date}</div>
                </div>
                <span className={`${styles.dreamEmotion} ${styles.dreamEmotion[dream.emotion]}`}>
                  {dream.emotionText}
                </span>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🌙</div>
              <div className={styles.emptyText}>还没有记录梦境</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
