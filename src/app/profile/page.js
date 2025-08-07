'use client'
import { useState, useEffect, useRef } from 'react'
import { Uploader, Image, Button, Dialog } from 'react-vant'
import useUserStore from '@/store/useUserStore'
import { uploadAPI } from '@/services/api'
import { cozeWorkflowAPI } from '@/services/cozeApi'
import { useRouter } from 'next/navigation'
import LoginForm from '@/components/LoginForm'
import LoginButton from '@/components/LoginButton'
import styles from './profile.module.css'
import useTitle from '@/hooks/useTitle'
export default function ProfilePage() {
  const router = useRouter()
  const { user, setUser, logout } = useUserStore()
  const [showActionSheet, setShowActionSheet] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [avatar, setAvatar] = useState('https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg')
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  useTitle('我的')
  // 使用 useRef 来引用上传组件
  const uploaderRef = useRef(null)
  
  useEffect(() => {
    if (user?.avatar) {
      setAvatar(user.avatar)
    }
  }, [user])

  // 处理文件上传
  const handleAfterRead = async (file) => {
    try {
      const result = await uploadAPI.uploadImage(file.file)
      
      // 更新用户头像
      if (result.url) {
        const updatedUser = { ...user, avatar: result.url }
        await uploadAPI.updateUser(updatedUser)
        setUser(updatedUser)
        setAvatar(result.url)
      }
    } catch (error) {
      console.error('上传失败:', error)
    }
  }

  // 处理AI生成头像
  const handleGenerateAvatar = async () => {
    setShowActionSheet(false)
    try {
      setLoadingMessage('AI正在生成头像，请稍候...')
      setLoading(true)
      
      const signature = user?.signature || '保持热爱，奔赴山海。'
      const result = await cozeWorkflowAPI.generateAvatar(signature)
      
      setLoading(false)
      
      if (result && result.imageUrl) {
        const updatedUser = { ...user, avatar: result.imageUrl }
        await uploadAPI.updateUser(updatedUser)
        setUser(updatedUser)
        setAvatar(result.imageUrl)
        
      } else {
        throw new Error('未获取到头像URL')
      }
    } catch (error) {
      console.error('AI生成头像失败:', error)
      setLoading(false)
    }
  }
  
  // 处理退出登录
  const handleLogout = () => {
    logout()
    router.push('/profile')
  }
  
  // 处理上传头像 - 使用 ref 触发
  const handleUploadAvatar = () => {
    setShowActionSheet(false)
    // 使用 ref 来触发文件选择
    if (uploaderRef.current) {
      const input = uploaderRef.current.querySelector('input[type="file"]')
      if (input) {
        input.click()
      }
    }
  }

  // 显示登录表单
  const handleShowLoginForm = () => {
    setShowLoginForm(true)
  }

  // 登录成功后的回调
  const handleLoginSuccess = () => {
    setShowLoginForm(false)
  }

  // 跳转到梦境库
  const handleLibraryClick = () => {
    router.push('/library')
  }

  // 跳转到设置
  const handleSettingsClick = () => {
    router.push('/settings')
  }

  // 跳转到关于
  const handleAboutClick = () => {
    console.log('关于')
    // TODO: 实现关于页面
  }

  // 登录表单弹窗
  const renderLoginDialog = () => {
    return (
      <Dialog
        visible={showLoginForm}
        title=""
        showConfirmButton={false}
        closeOnClickOverlay
        onClose={() => setShowLoginForm(false)}
        style={{ borderRadius: '12px', overflow: 'hidden' }}
      >
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </Dialog>
    )
  }

  // 自定义加载状态组件
  const renderLoading = () => {
    if (!loading) return null
    
    return (
      <div className={styles.loadingOverlay} onClick={(e) => e.stopPropagation()}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <div className={styles.loadingTitle}>AI生成头像</div>
          <div className={styles.loadingMessage}>{loadingMessage}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* 用户信息区域 */}
        {user ? (
          <div className={styles.userInfoSection}>
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
                <div className={styles.userItem}>签名：{user?.signature || '保持热爱，奔赴山海。'}</div>
              </div>
            </div>
          </div>
        ) : (
          <LoginButton onClick={handleShowLoginForm} />
        )}
        
        {/* 功能菜单列表 */}
        <div className={styles.menuList}>
          <div className={styles.menuItem} onClick={handleLibraryClick}>
            <div className={styles.menuText}>梦境库</div>
            <div className={styles.menuArrow}>›</div>
          </div>
          <div className={styles.menuItem} onClick={handleSettingsClick}>
            <div className={styles.menuText}>设置</div>
            <div className={styles.menuArrow}>›</div>
          </div>
          <div className={styles.menuItem} onClick={handleAboutClick}>
            <div className={styles.menuText}>关于</div>
            <div className={styles.menuArrow}>›</div>
          </div>
        </div>
        
        {/* 退出登录按钮 - 仅登录用户显示 */}
        {user && (
          <div className={styles.logoutButton}>
            <Button block color="#ff6b6b" onClick={handleLogout}>退出登录</Button>
          </div>
        )}
      </div>
      
      {/* 隐藏的文件上传组件 - 使用 ref */}
      <div ref={uploaderRef} style={{ display: 'none' }}>
        <Uploader
          maxCount={1}
          afterRead={handleAfterRead}
          accept="image/*"
        />
      </div>
      
      {/* 自定义头像选择弹窗 */}
      {showActionSheet && (
        <div className={styles.customActionSheet} onClick={() => setShowActionSheet(false)}>
          <div className={styles.actionSheetContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.actionButton} onClick={handleUploadAvatar}>上传头像</div>
            <div className={styles.actionButton} onClick={handleGenerateAvatar}>AI生成头像</div>
            <div className={styles.actionCancel} onClick={() => setShowActionSheet(false)}>取消</div>
          </div>
        </div>
      )}
      
      {/* 登录表单弹窗 */}
      {renderLoginDialog()}
      
      {/* 自定义加载状态 */}
      {renderLoading()}
    </div>
  )
}