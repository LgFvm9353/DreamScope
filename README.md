# DreamJournal - 梦境日记移动端应用

## 项目简介

DreamJournal是一个基于React18+Next.js的移动端梦境记录应用，用户可以在早上醒来时记录梦境，AI会自动分析梦境的关键词、情绪和象征意义，并生成相应的梦境插画。

## 技术栈

- **前端框架**: React 18 + Next.js 15 (App Router)
- **UI组件库**: React Vant + @react-vant/icons
- **HTTP客户端**: Axios
- **移动端适配**: lib-flexible + postcss-px-to-viewport
- **样式**: CSS原子化类
- **路由**: 懒加载 + 路径别名
- **状态管理**: 待定

## 项目架构

### 目录结构

```
src/
├── app/                    # Next.js App Router
│   ├── page.js            # 首页
│   ├── record/page.js     # 记录梦境页面
│   ├── analysis/page.js   # AI分析页面
│   ├── profile/page.js    # 我的页面
│   ├── globals.css        # 全局样式 + CSS原子化类
│   └── layout.js          # 根布局
├── components/            # 组件
│   └── LazyRoute.js       # 懒加载路由组件
├── config/                # 配置文件
│   └── routes.js          # 路由配置
├── hooks/                 # 自定义Hooks
│   └── useLazyRoute.js    # 懒加载路由Hook
├── lib/                   # 工具库 (待开发)
├── store/                 # 状态管理 (待开发)
├── services/              # API服务 (待开发)
└── utils/                 # 工具函数 (待开发)
```

### 路径别名配置

```javascript
// jsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 路由配置

```javascript
// src/config/routes.js
export const routes = [
  {
    path: '/',
    name: '首页',
    icon: HomeO,
    title: 'DreamJournal',
    component: () => import('@/app/page')
  },
  // ... 其他路由
]
```

### 页面规划

#### 1. 首页 (Home) - `/`
- 快速记录梦境入口
- 最近梦境预览
- 快捷功能入口

#### 2. 记录梦境 (Record) - `/record`
- 梦境内容输入
- 情绪选择
- 标签管理
- 保存功能

#### 3. AI分析 (Analysis) - `/analysis`
- 梦境关键词提取
- 情绪分析
- 象征意义解读
- 心理学建议

#### 4. 我的 (Profile) - `/profile`
- 用户信息
- 梦境库
- 统计分析
- 设置选项

## 路由懒加载

### 实现方式
- 使用 `React.lazy()` 和 `Suspense`
- 路由组件按需加载
- 预加载相邻路由，提升用户体验

### 懒加载组件
```javascript
// src/components/LazyRoute.js
const LazyRoute = ({ importFunc, fallback = <Loading /> }) => {
  const Component = lazy(importFunc)
  
  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  )
}
```

### 预加载策略
- **当前路由**: 立即加载
- **相邻路由**: 自动预加载
- **目标路由**: 点击时预加载

## 路由跳转

### 基本路由结构
```javascript
/                    // 首页
/record             // 记录梦境页面
/analysis           // AI分析页面
/profile            // 我的页面
```

### 导航方式
- 使用 Next.js App Router
- 通过 `useRouter` 进行编程式导航
- 使用 `Link` 组件进行声明式导航
- React Vant Tabbar 底部导航

## 开发规范

### 代码风格
- 使用ESLint + Prettier
- 遵循React最佳实践
- 组件命名使用PascalCase
- 文件命名使用kebab-case

### 组件开发
- 使用React Vant组件库
- 保持组件简洁，单一职责
- 优先使用函数式组件
- 合理使用Hooks

### 路径引用
- 使用 `@/` 别名引用src目录
- 避免使用相对路径
- 保持导入路径的一致性

## 项目亮点和难点
- 路由懒加载

