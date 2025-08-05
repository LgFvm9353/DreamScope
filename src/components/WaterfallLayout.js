'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './WaterfallLayout.module.css';

const WaterfallLayout = ({ 
  items = [], 
  renderItem, 
  columns = 2, 
  gap = 12,
  className = '' 
}) => {
  const containerRef = useRef(null);
  const [columnHeights, setColumnHeights] = useState([]);
  const [itemPositions, setItemPositions] = useState([]);

  // 初始化列高度
  useEffect(() => {
    setColumnHeights(new Array(columns).fill(0));
  }, [columns]);

  // 计算每个项目的位置
  useEffect(() => {
    if (!items.length || !containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const columnWidth = (containerWidth - gap * (columns - 1)) / columns;
    
    const heights = new Array(columns).fill(0);
    const positions = [];

    items.forEach((item, index) => {
      // 找到最短的列
      const shortestColumnIndex = heights.indexOf(Math.min(...heights));
      
      // 计算位置
      const left = shortestColumnIndex * (columnWidth + gap);
      const top = heights[shortestColumnIndex];
      
      positions.push({
        left,
        top,
        width: columnWidth,
        index
      });

      // 估算项目高度（这里需要根据实际内容调整）
      const estimatedHeight = estimateItemHeight(item, columnWidth);
      heights[shortestColumnIndex] += estimatedHeight + gap;
    });

    setItemPositions(positions);
    setColumnHeights(heights);
  }, [items, columns, gap]);

  // 估算项目高度的函数
  const estimateItemHeight = (item, width) => {
    // 基础高度
    let height = 120; // 基础内容高度
    
    // 如果有图片，增加图片高度
    if (item.image) {
      height += 200; // 图片高度
    }
    
    // 根据内容长度调整高度
    const contentLength = item.content?.length || 0;
    const extraHeight = Math.floor(contentLength / 50) * 20; // 每50个字符增加20px
    height += extraHeight;
    
    // 如果有标签，增加标签高度
    if (item.tags && item.tags.length > 0) {
      height += 30; // 标签区域高度
    }
    
    return height;
  };

  return (
    <div 
      ref={containerRef}
      className={`${styles.waterfallContainer} ${className}`}
      style={{ 
        height: Math.max(...columnHeights),
        position: 'relative'
      }}
    >
      {itemPositions.map((position, index) => {
        const item = items[position.index];
        // 添加安全检查
        if (!item) {
          console.warn('Item not found at index:', position.index);
          return null;
        }
        
        return (
          <div
            key={item.id || index}
            className={styles.waterfallItem}
            style={{
              position: 'absolute',
              left: position.left,
              top: position.top,
              width: position.width,
              transform: 'translateZ(0)', // 启用硬件加速
            }}
          >
            {renderItem(item, position.index)}
          </div>
        );
      })}
    </div>
  );
};

export default WaterfallLayout;