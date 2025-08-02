'use client'
import { useState, useRef, useEffect } from 'react'
import { Button, Input, Loading, Empty } from 'react-vant'
import { useRouter } from 'next/navigation'
import useChatStore from '@/store/chatStore'
import styles from './page.module.css'
import {
  ChatO,
  UserO,
  Cross
}from '@react-vant/icons'

// 自定义头像组件替代react-vant的Avatar
const CustomAvatar = ({ className, children, icon }) => {
  return (
    <div className={`${styles.customAvatar} ${className || ''}`}>
      {icon}
      {children && <div className={styles.avatarText}>{children}</div>}
    </div>
  )
}

export default function AnalysisPage() {
  const router = useRouter()
  const { messages, isLoading, sendMessage, clearMessages } = useChatStore()
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef(null)
  
  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  // 消息列表变化时滚动到底部
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  // 发送消息
  const handleSend = () => {
    if (!inputValue.trim()) return
    sendMessage(inputValue.trim())
    setInputValue('')
  }
  
  // 按Enter发送
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 清空输入框
  const handleClearInput = () => {
    setInputValue('')
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className={`flex-1 ${styles.chatContainer}`}>
        {/* 移除 overflow-y-auto，已在CSS中设置 */}
        {messages.length === 0 ? (
          <Empty description="开始与AI助手对话，分析你的梦境" />
        ) : (
          <div className={styles.messageList}>
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`${styles.messageItem} ${message.type === 'user' ? styles.userMessage : styles.aiMessage}`}
              >
                <div className={styles.messageContent}>
                  <CustomAvatar 
                    className={styles.avatar}
                    icon={message.type === 'user' ? <UserO/> : <ChatO/>}
                  >
                    {/* {message.type === 'user' ? '我' : 'AI'} */}
                  </CustomAvatar>
                  <div className={styles.messageBubble}>
                    {message.content}
                    <div className={styles.messageTime}>
                      {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.messageItem} ${styles.aiMessage}`}>
                <div className={styles.messageContent}>
                  <CustomAvatar className={styles.avatar} icon={<ChatO/>}>AI</CustomAvatar>
                  <div className={`${styles.messageBubble} ${styles.loadingBubble}`}>
                    <Loading type="spinner" /> 正在思考...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* 输入容器保持不变 */}
      <div className={styles.inputContainer}>
        <div className={styles.inputWrapper}>
          <Input.TextArea
            value={inputValue}
            onChange={setInputValue}
            onKeyPress={handleKeyPress}
            placeholder="描述你的梦境或提问..."
            rows={1}
            className={styles.input}
            autoSize={{ minRows: 1, maxRows: 4 }}
          />
          {inputValue.trim() && (
            <div className={styles.clearButton} onClick={handleClearInput}>
              <Cross />
            </div>
          )}
        </div>
        <Button 
          type="primary" 
          size="small"
          disabled={!inputValue.trim() || isLoading}
          loading={isLoading}
          onClick={handleSend}
          className={styles.sendButton}
        >
          发送
        </Button>
      </div>
    </div>
  )
}