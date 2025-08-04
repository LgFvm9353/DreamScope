import { 
    HomeO, 
    Edit, 
    ChartTrendingO, 
    UserO 
} from '@react-vant/icons'

// 路由配置
export const routes = [
  {
    path: '/',
    name: '首页',
    icon: HomeO,
    title: 'DreamJournal',
    component: () => import('@/app/page').then(mod => mod.default)
  },
  {
    path: '/record',
    name: '记录',
    icon: Edit,
    title: '记录梦境',
    component: () => import('@/app/record/page').then(mod => mod.default)
  },
  {
    path: '/analysis',
    name: '分析',
    icon: ChartTrendingO,
    title: 'AI分析',
    component: () => import('@/app/analysis/page').then(mod => mod.default)
  },
  {
    path: '/profile',
    name: '我的',
    icon: UserO,
    title: '我的',
    component: () => import('@/app/profile/page').then(mod => mod.default)
  },
  // 添加梦境详情页路由（不在导航栏显示）
  {
    path: '/dream/[id]',
    name: '梦境详情',
    title: '梦境详情',
    component: () => import('@/components/DynamicDreamPage').then(mod => mod.default),
    hideInNav: true
  }
]

// 获取路由信息
export const getRouteByPath = (path) => {
  return routes.find(route => route.path === path) || routes[0]
}

// 获取路由索引
export const getRouteIndex = (path) => {
  return routes.findIndex(route => route.path === path)
}

// 懒加载组件
export const lazyLoadComponent = (importFunc) => {
  return importFunc().then(module => module.default)
}