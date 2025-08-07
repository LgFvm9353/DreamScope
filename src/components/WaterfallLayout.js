'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './WaterfallLayout.module.css';

const WaterfallLayout = ({ 
  items = [], 
  renderItem, 
  columns = 2, 
  gap = 12,
  className = '' 
}) => {
  const containerRef = useRef(null);
  const itemRefs = useRef(new Map());
  const [columnHeights, setColumnHeights] = useState([]);
  const [itemPositions, setItemPositions] = useState([]);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  // 初始化列高度
  useEffect(() => {
    setColumnHeights(new Array(columns).fill(0));
    setIsLayoutReady(false);
  }, [columns]);

  // 获取或创建项目引用
  const getItemRef = useCallback((index) => {
    if (!itemRefs.current.has(index)) {
      itemRefs.current.set(index, React.createRef());
    }
    return itemRefs.current.get(index);
  }, []);

  // 更精确的高度估算函数
  const estimateItemHeight = useCallback((item, width) => {
    // 基础高度（卡片内边距 + 边框等）
    let height = 20; // 卡片基础高度
    
    // 图片高度
    if (item.image && item.image.trim() !== '') {
      height += 140; // 图片区域高度
    }
    
    // 标题高度（假设单行）
    height += 24; // 标题行高
    
    // 内容高度估算
    const contentLength = item.content?.length || 0;
    const charsPerLine = Math.floor(width / 14); // 假设字符宽度14px
    const contentLines = Math.ceil(contentLength / charsPerLine);
    const maxLines = 3; // 最多显示3行
    height += Math.min(contentLines, maxLines) * 20; // 每行20px
    
    // 标签区域高度
    if (item.emotion || item.category) {
      height += 35; // 标签区域高度
    }
    
    // 日期和操作按钮区域
    height += 30;
    
    // 内边距
    height += 24; // 上下内边距
    
    return Math.max(height, 150); // 最小高度150px
  }, []);

  // 计算布局
  const calculateLayout = useCallback(async () => {
    if (!items.length || !containerRef.current) {
      setItemPositions([]);
      setColumnHeights(new Array(columns).fill(0));
      return;
    }

    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    
    if (containerWidth === 0) return; // 容器还没有宽度
    
    const columnWidth = (containerWidth - gap * (columns - 1)) / columns;
    const heights = new Array(columns).fill(0);
    const positions = [];

    // 先进行初始布局
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      
      // 找到最短的列
      const shortestColumnIndex = heights.indexOf(Math.min(...heights));
      
      // 计算位置
      const left = shortestColumnIndex * (columnWidth + gap);
      const top = heights[shortestColumnIndex];
      
      positions.push({
        left,
        top,
        width: columnWidth,
        index,
        height: 0 // 初始高度为0，后续会更新
      });

      // 使用估算高度
      const estimatedHeight = estimateItemHeight(item, columnWidth);
      heights[shortestColumnIndex] += estimatedHeight + gap;
    }

    setItemPositions(positions);
    setColumnHeights(heights);
    setIsLayoutReady(true);

    // 延迟测量实际高度并调整布局
    setTimeout(() => {
      adjustLayoutWithActualHeights(positions, columnWidth);
    }, 100);
  }, [items, columns, gap, estimateItemHeight]);

  // 使用实际DOM高度调整布局
  const adjustLayoutWithActualHeights = useCallback((initialPositions, columnWidth) => {
    const heights = new Array(columns).fill(0);
    const adjustedPositions = [];

    initialPositions.forEach((position, index) => {
      const itemRef = itemRefs.current.get(index);
      let actualHeight = 0;

      if (itemRef?.current) {
        actualHeight = itemRef.current.offsetHeight;
      }

      // 如果无法获取实际高度，使用估算高度
      if (actualHeight === 0) {
        actualHeight = estimateItemHeight(items[position.index], columnWidth);
      }

      // 重新计算位置
      const shortestColumnIndex = heights.indexOf(Math.min(...heights));
      const left = shortestColumnIndex * (columnWidth + gap);
      const top = heights[shortestColumnIndex];

      adjustedPositions.push({
        ...position,
        left,
        top,
        height: actualHeight
      });

      heights[shortestColumnIndex] += actualHeight + gap;
    });

    setItemPositions(adjustedPositions);
    setColumnHeights(heights);
  }, [columns, gap, estimateItemHeight, items]);

  // 监听容器大小变化和数据变化
  useEffect(() => {
    calculateLayout();
  }, [calculateLayout]);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setTimeout(calculateLayout, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateLayout]);

  // 计算容器高度，避免 Infinity 值
  const getContainerHeight = () => {
    if (!columnHeights.length) return 0;
    const maxHeight = Math.max(...columnHeights);
    return isFinite(maxHeight) ? Math.max(maxHeight - gap, 0) : 0;
  };

  return (
    <div 
      ref={containerRef}
      className={`${styles.waterfallContainer} ${className}`}
      style={{ 
        height: getContainerHeight(),
        position: 'relative',
        opacity: isLayoutReady ? 1 : 0.7,
        transition: 'opacity 0.3s ease'
      }}
    >
      {itemPositions.map((position, index) => {
        const item = items[position.index];
        if (!item) {
          console.warn('Item not found at index:', position.index);
          return null;
        }
        
        return (
          <div
            key={item.id || `item-${position.index}`}
            ref={getItemRef(index)}
            className={styles.waterfallItem}
            style={{
              position: 'absolute',
              left: position.left,
              top: position.top,
              width: position.width,
              transform: 'translateZ(0)',
              transition: isLayoutReady ? 'all 0.3s ease' : 'none',
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