'use client'

import { 
  NavBar, 
  Button, 
  Card, 
  Cell, 
  CellGroup 
} from 'react-vant'
import Link from 'next/link'
import { getRouteByPath } from '@/config/routes'

export default function HomePage() {
  const route = getRouteByPath('/')

  return (
    <div className="min-h-screen bg-background">
      {/* 头部导航 */}
      <NavBar title={route.title} />
      
      {/* 主要内容 */}
      <div className="p-md">
        {/* 快速记录按钮 */}
        <Link href="/record">
          <Button block type="primary" size="large" className="mb-lg">
            ✨ 记录今日梦境
          </Button>
        </Link>
        
        {/* 最近梦境 */}
        <Card title="最近梦境" className="mb-md">
          <CellGroup>
            <Cell 
              title="梦见飞翔" 
              label="2024-01-15 • 开心"
              isLink
              onClick={() => console.log('查看梦境详情')}
            />
            <Cell 
              title="海边散步" 
              label="2024-01-14 • 平静"
              isLink
              onClick={() => console.log('查看梦境详情')}
            />
          </CellGroup>
        </Card>
        
        {/* 快捷功能 */}
        <div className="grid grid-cols-2 gap-md">
          <Link href="/analysis">
            <Card className="text-center">
              <div className="text-2xl mb-sm">🤖</div>
              <div className="text-sm">AI分析</div>
            </Card>
          </Link>
          
          <Link href="/profile">
            <Card className="text-center">
              <div className="text-2xl mb-sm">👤</div>
              <div className="text-sm">我的</div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
