'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import RegisterForm from '@/components/RegisterForm'
import useUserStore from '@/store/useUserStore'
import styles from './register.module.css'

export default function RegisterPage() {
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

  // 注册成功后的回调
  const handleRegisterSuccess = () => {
    // 注册成功后跳转到个人资料页面
    router.push('/profile')
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
      </div>
    </div>
  )
}