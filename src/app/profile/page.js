'use client'
import { NavBar, CellGroup, Cell } from 'react-vant'
import { getRouteByPath } from '@/config/routes'

export default function ProfilePage() {
  const route = getRouteByPath('/profile')
  
  return (
    <div className="min-h-screen bg-background">
      <NavBar title={route.title} />
      <div className="p-md">
        <CellGroup>
          <Cell title="梦境库" isLink onClick={() => console.log('梦境库')} />
          <Cell title="统计分析" isLink onClick={() => console.log('统计分析')} />
          <Cell title="设置" isLink onClick={() => console.log('设置')} />
          <Cell title="关于" isLink onClick={() => console.log('关于')} />
        </CellGroup>
      </div>
    </div>
  )
} 