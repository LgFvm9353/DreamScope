'use client'

import { NavBar, Button } from 'react-vant'
import { useRouter } from 'next/navigation'
import { getRouteByPath } from '@/config/routes'

export default function AnalysisPage() {
  const router = useRouter()
  const route = getRouteByPath('/analysis')

  return (
    <div className="min-h-screen bg-background">
      <NavBar title={route.title} />
      
      <div className="p-md">
        <div className="text-center py-xl">
          <div className="text-lg mb-md">AI分析页面</div>
          <Button 
            type="primary" 
            size="large"
            onClick={() => {
              console.log('开始AI分析')
              router.push('/')
            }}
          >
            开始分析并返回首页
          </Button>
        </div>
      </div>
    </div>
  )
} 