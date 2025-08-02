'use client'
import { useState, useEffect } from 'react'
import { Uploader, Toast, Image, Button } from 'react-vant'
import useDreamStore from '@/store/dreamStore'
import { uploadAPI } from '@/services/api'
import { useRouter } from 'next/navigation'
import styles from './profile.module.css'

export default function ProfilePage() {
  const router = useRouter()
  const { user, setUser, logout } = useDreamStore()
  const [showActionSheet, setShowActionSheet] = useState(false)
  const [avatar, setAvatar] = useState('https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg')
  
  useEffect(() => {
    if (user?.avatar) {
      setAvatar(user.avatar)
    }
  }, [user])
  
  // 处理文件上传
  const handleAfterRead = async (file) => {
    try {
      Toast.loading({
        message: '上传中...',
        forbidClick: true,
        duration: 0
      })
      
      const result = await uploadAPI.uploadImage(file.file)
      
      // 更新用户头像
      if (result.url) {
        const updatedUser = { ...user, avatar: result.url }
        await useDreamStore.getState().userAPI.updateUser(updatedUser)
        setUser(updatedUser)
        setAvatar(result.url)
        Toast.clear()
        Toast.success('头像上传成功')
      }
    } catch (error) {
      console.error('上传失败:', error)
      Toast.clear()
      Toast.fail('上传失败，请重试')
    }
  }
  
  // 处理AI生成头像
  const handleGenerateAvatar = () => {
    setShowActionSheet(false)
    Toast('AI生成头像功能开发中...')
  }
  
  // 处理退出登录
  const handleLogout = () => {
    logout()
    Toast.success('退出登录成功')
    router.push('/')
  }
  
  // 处理上传头像
  const handleUploadAvatar = () => {
    setShowActionSheet(false)
    document.getElementById('avatar-upload').click()
  }
  
  return (
    <div className={styles.container}>
      
      <div className={styles.content}>
        {/* 用户信息卡片 */}
        <div className={styles.userCard}>
          <div className={styles.userInfo}>
            <div className={styles.avatarWrapper} onClick={() => setShowActionSheet(true)}>
              <Image
                width="80px"
                height="80px"
                fit="cover"
                round
                src={avatar}
              />
              <div className={styles.avatarOverlay}>点击更换</div>
            </div>
            <div className={styles.userDetails}>
              <div className={styles.userItem}>昵称：{user?.username || '奶龙'}</div>
              <div className={styles.userItem}>等级：{user?.level || '5级'}</div>
              <div className={styles.userItem}>签名：{user?.signature || '保持热爱，奔赴山海。'}</div>
            </div>
          </div>
        </div>
        
        
        {/* 功能菜单列表 */}
        <div className={styles.menuList}>
          <div className={styles.menuItem} onClick={() => console.log('梦境库')}>
            <div className={styles.menuText}>梦境库</div>
            <div className={styles.menuArrow}>›</div>
          </div>
          <div className={styles.menuItem} onClick={() => console.log('统计分析')}>
            <div className={styles.menuText}>统计分析</div>
            <div className={styles.menuArrow}>›</div>
          </div>
          <div className={styles.menuItem} onClick={() => console.log('设置')}>
            <div className={styles.menuText}>设置</div>
            <div className={styles.menuArrow}>›</div>
          </div>
          <div className={styles.menuItem} onClick={() => console.log('关于')}>
            <div className={styles.menuText}>关于</div>
            <div className={styles.menuArrow}>›</div>
          </div>
        </div>
        
        {/* 退出登录按钮 */}
        <div className={styles.logoutButton}>
          <Button block color="#ff6b6b" onClick={handleLogout}>退出登录</Button>
        </div>
      </div>
      
      {/* 隐藏的文件上传组件 */}
      <Uploader
        id="avatar-upload"
        style={{ display: 'none' }}
        maxCount={1}
        afterRead={handleAfterRead}
        accept="image/*"
      />
      
      {/* 自定义头像选择弹窗 - 上下排列 */}
      {showActionSheet && (
        <div className={styles.customActionSheet} onClick={() => setShowActionSheet(false)}>
          <div className={styles.actionSheetContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.actionButton} onClick={handleUploadAvatar}>上传头像</div>
            <div className={styles.actionButton} onClick={handleGenerateAvatar}>AI生成头像</div>
            <div className={styles.actionCancel} onClick={() => setShowActionSheet(false)}>取消</div>
          </div>
        </div>
      )}
    </div>
  )
}