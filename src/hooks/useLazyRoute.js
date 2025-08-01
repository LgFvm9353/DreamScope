import { 
  useState, 
  useEffect 
} from 'react'
import { routes } from '@/config/routes'

export const useLazyRoute = (pathname) => {
  const [currentRoute, setCurrentRoute] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const route = routes.find(r => r.path === pathname)
    if (route) {
      setLoading(true)
      // 预加载组件
      route.component().then(() => {
        setCurrentRoute(route)
        setLoading(false)
      })
    }
  }, [pathname])

  return { currentRoute, loading }
}

// 预加载路由组件
export const preloadRoute = (path) => {
  const route = routes.find(r => r.path === path)
  if (route) {
    return route.component()
  }
  return Promise.resolve()
}

// 预加载所有路由
export const preloadAllRoutes = () => {
  return Promise.all(routes.map(route => route.component()))
} 