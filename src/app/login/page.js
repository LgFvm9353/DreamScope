'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoginForm from '@/components/LoginForm'
import useUserStore from '@/store/useUserStore'
import styles from './login.module.css'

export default function LoginPage() {
  const router = useRouter()
  const { user } = useUserStore()
  
  // 使用 useEffect 处理重定向，避免渲染时的状态更新错误
  useEffect(() => {
    if (user) {
      router.push('/profile')
    }
  }, [user, router])

  // 如果用户已登录，显示加载状态而不是立即返回 null
  if (user) {
    return <div>正在跳转...</div>
  }

  // 登录成功后的回调
  const handleLoginSuccess = () => {
    // 登录成功后跳转到个人资料页面
    router.push('/profile')
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
        
        <div className={styles.registerLink}>
          没有账号？<span onClick={() => router.push('/register')}>立即注册</span>
        </div>
      </div>
    </div>
  )
}