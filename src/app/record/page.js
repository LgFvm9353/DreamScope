'use client'

import { NavBar, Button } from 'react-vant'
import { useRouter } from 'next/navigation'
import { getRouteByPath } from '@/config/routes'

export default function RecordPage() {
  const router = useRouter()
  const route = getRouteByPath('/record')

  return (
    <div className="min-h-screen bg-background">
      <NavBar title={route.title} />
      
      <div className="p-md">
        <div className="text-center py-xl">
          <div className="text-lg mb-md">记录梦境页面</div>
          <Button 
            type="primary" 
            size="large"
            onClick={() => {
              console.log('保存梦境')
              router.push('/')
            }}
          >
            保存并返回首页
          </Button>
        </div>
      </div>
    </div>
  )
} 