'use client';

import { Toast as VantToast } from 'react-vant';
import { useEffect, useState } from 'react';

// 创建一个客户端专用的 Toast 包装器
const ClientToast = {
  // 成功提示
  success: (content, options) => {
    try {
      return VantToast.success(content, options);
    } catch (error) {
      console.error('Toast error:', error);
      if (typeof window !== 'undefined') {
        alert(content);
      }
      return null;
    }
  },
  
  // 失败提示
  fail: (content, options) => {
    try {
      return VantToast.fail(content, options);
    } catch (error) {
      console.error('Toast error:', error);
      if (typeof window !== 'undefined') {
        alert(content);
      }
      return null;
    }
  },
  
  // 加载提示
  loading: (content, options) => {
    try {
      return VantToast.loading(content, options);
    } catch (error) {
      console.error('Toast error:', error);
      return null;
    }
  },
  
  // 清除所有提示
  clear: () => {
    try {
      return VantToast.clear();
    } catch (error) {
      console.error('Toast clear error:', error);
      return null;
    }
  }
};

export default ClientToast;