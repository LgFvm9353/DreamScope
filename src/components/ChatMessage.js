import { useState, useEffect } from 'react';

const ChatMessage = ({ message }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // 打字机效果（可选）
  useEffect(() => {
    if (message.isStreaming) {
      // 流式消息直接显示
      setDisplayedContent(message.content);
    } else if (message.type === 'ai' && !message.isStreaming) {
      // 非流式AI消息可以添加打字机效果
      const timer = setInterval(() => {
        if (currentIndex < message.content.length) {
          setDisplayedContent(prev => prev + message.content[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        } else {
          clearInterval(timer);
        }
      }, 30);

      return () => clearInterval(timer);
    } else {
      // 用户消息直接显示
      setDisplayedContent(message.content);
    }
  }, [message.content, message.isStreaming, currentIndex]);

  return (
    <div className={`message ${message.type}`}>
      <div className="message-content">
        {displayedContent}
        {message.isStreaming && (
          <span className="streaming-cursor">▊</span>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;