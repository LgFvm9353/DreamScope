'use client'

import './globals.css'
import { Tabbar, TabbarItem } from 'react-vant'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { routes, getRouteIndex } from '@/config/routes'
import { preloadRoute } from '@/hooks/useLazyRoute'

export default function RootLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [active, setActive] = useState(0)

  // 根据当前路径设置激活的标签
  useEffect(() => {
    const currentIndex = getRouteIndex(pathname)
    setActive(currentIndex >= 0 ? currentIndex : 0)
  }, [pathname])

  const handleChange = (value) => {
    setActive(value)
    const targetPath = routes[value].path
    
    // 预加载目标路由
    preloadRoute(targetPath).then(() => {
      router.push(targetPath)
    })
  }

  // 预加载相邻路由
  useEffect(() => {
    const currentIndex = getRouteIndex(pathname)
    if (currentIndex >= 0) {
      // 预加载下一个路由
      const nextIndex = (currentIndex + 1) % routes.length
      preloadRoute(routes[nextIndex].path)
      
      // 预加载上一个路由
      const prevIndex = currentIndex === 0 ? routes.length - 1 : currentIndex - 1
      preloadRoute(routes[prevIndex].path)
    }
  }, [pathname])

  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DreamJournal" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <div className="safe-area">
          {/* 主要内容区域 */}
          <div className="pb-16">
            {children}
          </div>
          
          {/* 底部标签栏 */}
          <Tabbar 
            value={active} 
            onChange={handleChange}
            className="fixed bottom-0 left-0 right-0 z-50"
            border={false}
            safeAreaInsetBottom
          >
            {routes.map((route, index) => {
              const IconComponent = route.icon
              return (
                <TabbarItem 
                  key={route.path}
                  icon={<IconComponent />} 
                  name={index}
                >
                  {route.name}
                </TabbarItem>
              )
            })}
          </Tabbar>
        </div>
      </body>
    </html>
  )
}
