'use client'

import { Suspense, lazy } from 'react'
import { Loading } from 'react-vant'

// 懒加载组件包装器
const LazyRoute = ({ importFunc, fallback = <Loading /> }) => {
  const Component = lazy(importFunc)
  
  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  )
}

export default LazyRoute 