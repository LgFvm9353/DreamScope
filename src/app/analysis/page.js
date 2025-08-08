'use client'
import { useState, useRef, useEffect } from 'react'
import { Button, Input, Loading, Empty } from 'react-vant'
import { useRouter } from 'next/navigation'
import useChatStore from '@/store/useChatStore'
import styles from './page.module.css'
import {
  ChatO,
  UserO,
  Cross,
  Plus
}from '@react-vant/icons'
import useTitle from '@/hooks/useTitle'

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
  const { messages, isLoading, sendMessage, sendMessageStream, clearMessages } = useChatStore()
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef(null)
  
  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  useTitle('智能对话')
  
  // 消息列表变化时滚动到底部
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  // 发送消息
  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const message = inputValue.trim();
    setInputValue('');
    
    // 使用流式发送（如果可用），否则使用普通发送
    if (sendMessageStream) {
      await sendMessageStream(message);
    } else {
      await sendMessage(message);
    }
  };
  
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

  // 新增对话 - 清除所有消息
  const handleNewChat = () => {
    clearMessages()
    setInputValue('')
  }

  // 检查是否有正在流式输出的消息
  const hasStreamingMessage = messages.some(msg => msg.isStreaming)
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 顶部导航栏 */}
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>AI 梦境分析</h1>
        {messages.length > 0 && (
          <button 
            className={styles.newChatButton}
            onClick={handleNewChat}
            title="新增对话"
          >
            <Plus size={20} />
          </button>
        )}
      </div>

      <div className={`${styles.chatContainer} scroll-container`}>
        {messages.length === 0 ? (
          <div className={styles.emptyContainer}>
            <Empty 
              description="开始与AI助手对话，分析你的梦境" 
              className={styles.emptyState}
            />
          </div>
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
                  />
                  <div className={styles.messageBubble}>
                    {/* 如果是空的AI消息且正在流式输出，显示等待提示 */}
                    {message.type === 'ai' && message.content === '' && message.isStreaming ? (
                      <div className={styles.streamingPlaceholder}>
                        <Loading type="spinner" size="14px" />
                        <span>AI正在回复...</span>
                      </div>
                    ) : (
                      <>
                        {message.content}
                        {/* 流式输出光标 */}
                        {message.isStreaming && message.content && (
                          <span className={styles.streamingCursor}>▊</span>
                        )}
                      </>
                    )}
                    <div className={styles.messageTime}>
                      {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* 只在非流式模式下且正在加载时显示"正在思考" */}
            {isLoading && !hasStreamingMessage && (
              <div className={`${styles.messageItem} ${styles.aiMessage}`}>
                <div className={styles.messageContent}>
                  <CustomAvatar className={styles.avatar} icon={<ChatO/>} />
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
      
      {/* 输入容器 */}
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