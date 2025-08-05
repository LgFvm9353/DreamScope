'use client'
import { useState, useEffect } from 'react'
import { NavBar, Cell, Switch, Dialog, Button, Field, Form } from 'react-vant'
import { ArrowLeft } from '@react-vant/icons'
import { useRouter } from 'next/navigation'
import useUserStore from '@/store/useUserStore'
import { userAPI } from '@/services/api'
import styles from './settings.module.css'

export default function SettingsPage() {
  const router = useRouter()
  const { user, setUser } = useUserStore()
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [dreamReminder, setDreamReminder] = useState(true)
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    signature: '',
    phone: ''
  })
  const [editField, setEditField] = useState('')
  // 添加消息状态
  const [message, setMessage] = useState({ text: '', type: 'success', visible: false })
  
  // 添加显示消息的函数
  const showMessage = (text, type = 'success') => {
    setMessage({ text, type, visible: true })
    // 3秒后自动关闭
    setTimeout(() => {
      setMessage(prev => ({ ...prev, visible: false }))
    }, 3000)
  }
  
  useEffect(() => {
    // 如果用户未登录，跳转到个人资料页面
    if (!user) {
      router.push('/profile')
    } else {
      // 初始化个人资料数据
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        signature: user.signature || '',
        phone: user.phone || ''
      })
    }
  }, [user, router])
  
  // 返回个人资料页面
  const handleBack = () => {
    router.push('/profile')
  }
  
  
  // 切换通知设置
  const handleNotificationsChange = (checked) => {
    setNotifications(checked)
    showMessage(checked ? '已开启通知' : '已关闭通知')
  }
  
  // 切换梦境提醒
  const handleDreamReminderChange = (checked) => {
    setDreamReminder(checked)
    showMessage(checked ? '已开启梦境记录提醒' : '已关闭梦境记录提醒')
  }
  
  // 显示修改密码对话框
  const handleChangePassword = () => {
    setShowChangePasswordDialog(true)
  }
  
  // 显示个人资料对话框
  const handleShowProfile = () => {
    setShowProfileDialog(true)
  }
  
  // 处理双击编辑字段
  const handleDoubleClick = (field) => {
    setEditField(field)
  }
  
  // 处理字段值变更
  const handleFieldChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  // 保存个人资料
  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      // 更新用户信息
      const updatedUser = { ...user, ...profileData }
      await userAPI.updateUser(updatedUser)
      setUser(updatedUser)
      
      showMessage('个人资料已更新')
      setShowProfileDialog(false)
      setEditField('')
    } catch (error) {
      console.error('更新个人资料失败:', error)
      showMessage('更新个人资料失败', 'error')
    } finally {
      setLoading(false)
    }
  }
  
  // 提交修改密码
  const handleSubmitPassword = async () => {
    if (!newPassword) {
      showMessage('请输入新密码', 'error')
      return
    }
    
    if (newPassword !== confirmPassword) {
      showMessage('两次密码输入不一致', 'error')
      return
    }
    
    setLoading(true)
    try {
      // 实际API调用
      await userAPI.updatePassword({ newPassword })
      
      showMessage('密码修改成功')
      setShowChangePasswordDialog(false)
      setNewPassword('')
      setConfirmPassword('')
      
      // 密码修改成功后，登出并跳转到登录页面
      setTimeout(() => {
        useUserStore.getState().logout()
        router.push('/login')
      }, 1500) // 延迟1.5秒以便用户看到成功消息
    } catch (error) {
      console.error('修改密码失败:', error)
      showMessage('修改密码失败', 'error')
    } finally {
      setLoading(false)
    }
  }
  
  // 清除缓存
  const handleClearCache = async () => {
    Dialog.confirm({
      title: '清除缓存',
      message: '确定要清除应用缓存吗？',
    })
      .then(async () => {
        setLoading(true)
        try {
          // 模拟清除缓存
          await new Promise(resolve => setTimeout(resolve, 1500))
          showMessage('缓存已清除')
        } catch (error) {
          console.error('清除缓存失败:', error)
          showMessage('清除缓存失败', 'error')
        } finally {
          setLoading(false)
        }
      })
      .catch(() => {
        // 取消操作
      })
  }
  
  // 渲染个人资料字段
const renderProfileField = (label, field) => {
  return (
    <div className={styles.profileField}>
      <div className={styles.fieldLabel}>{label}：</div>
      <div className={styles.fieldValue}>
        {editField === field ? (
          <Field
            value={profileData[field]}
            onChange={(val) => handleFieldChange(field, val)}
            autoFocus
            onBlur={() => setEditField('')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setEditField('');
              }
            }}
          />
        ) : (
          <div 
            onClick={() => setEditField(field)}
            style={{ 
              cursor: 'pointer',
              padding: '8px',
              border: '1px dashed transparent',
              borderRadius: '4px',
              minHeight: '36px',
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseOver={(e) => e.currentTarget.style.border = '1px dashed #ccc'}
            onMouseOut={(e) => e.currentTarget.style.border = '1px dashed transparent'}
          >
            {profileData[field] || '未设置'}
          </div>
        )}
      </div>
    </div>
  )
}
  
  return (
    <div className={styles.container}>
      <NavBar 
        leftArrow={<ArrowLeft />}
        onClickLeft={handleBack}
        fixed
        // placeholder
        // className={styles.navbar}
      />
      
      <div className={styles.content}>
        {/* 账户设置 */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>账户设置</div>
          <div className={styles.sectionContent}>
            <Cell title="个人资料" isLink onClick={handleShowProfile} />
            <Cell title="修改密码" isLink onClick={handleChangePassword} />
          </div>
        </div>
        
        {/* 应用设置 */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>应用设置</div>
          <div className={styles.sectionContent}>
            <Cell 
              title="通知" 
              rightIcon={<Switch checked={notifications} onChange={handleNotificationsChange} />}
            />
            <Cell 
              title="梦境记录提醒" 
              rightIcon={<Switch checked={dreamReminder} onChange={handleDreamReminderChange} />}
            />
            <Cell title="清除缓存" isLink onClick={handleClearCache} />
          </div>
        </div>
        
        {/* 关于应用 */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>关于应用</div>
          <div className={styles.sectionContent}>
            <Cell title="版本信息" value="v1.0.0" />
            <Cell title="隐私政策" isLink onClick={() => console.log('隐私政策')} />
            <Cell title="用户协议" isLink onClick={() => console.log('用户协议')} />
          </div>
        </div>
      </div>
      
      {/* 修改密码对话框 */}
      <Dialog
        visible={showChangePasswordDialog}
        title="修改密码"
        showCancelButton
        confirmButtonText="确认修改"
        onConfirm={handleSubmitPassword}
        onCancel={() => setShowChangePasswordDialog(false)}
        className={styles.dialog}
      >
        <div className={styles.dialogContent}>
          <Field
            label="新密码"
            type="password"
            placeholder="请输入新密码"
            value={newPassword}
            onChange={setNewPassword}
          />
          <Field
            label="确认密码"
            type="password"
            placeholder="请再次输入新密码"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
        </div>
      </Dialog>
      
      {/* 个人资料对话框 */}
      <Dialog
        visible={showProfileDialog}
        title="个人资料"
        showCancelButton
        confirmButtonText="保存"
        onConfirm={handleSaveProfile}
        onCancel={() => {
          setShowProfileDialog(false)
          setEditField('')
        }}
        className={styles.dialog}
      >
        <div className={styles.dialogContent}>
          <div className={styles.profileInfo}>
            {renderProfileField('用户名', 'username')}
            {renderProfileField('邮箱', 'email')}
            {renderProfileField('个性签名', 'signature')}
            <div className={styles.editHint}>双击任意字段可编辑</div>
          </div>
        </div>
      </Dialog>
      
      {/* 消息提示 */}
      {message.visible && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}
    </div>
  )
}