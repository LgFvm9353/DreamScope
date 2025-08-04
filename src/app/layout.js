'use client'

import './globals.css'
import { Tabbar, TabbarItem } from 'react-vant'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { routes, getRouteIndex } from '@/config/routes'

export default function RootLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [active, setActive] = useState(0)

  // 检查是否是登录或注册页面
  const isAuthPage = pathname === '/login' || pathname === '/register'

  // 根据当前路径设置激活的标签
  useEffect(() => {
    // 如果是登录或注册页面，不更新active状态
    if (isAuthPage) return
    
    const currentIndex = getRouteIndex(pathname)
    setActive(currentIndex >= 0 ? currentIndex : 0)
  }, [pathname, isAuthPage])

  const handleChange = (value) => {
    setActive(value)
    router.push(routes[value].path)
  }

  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
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
          <div className="pb-20"> 
            {children}
          </div>
          
          {/* 底部标签栏 */}
          <Tabbar 
            value={active} 
            onChange={handleChange}
            className="fixed bottom-0 left-0 right-0 z-50"
            border={false}
            safeAreaInsetBottom={true}
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