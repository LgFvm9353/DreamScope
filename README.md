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
- **状态管理**: zustand

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

## 移动端适配问题及解决方案

### 滚动条在标签栏上显示问题

在移动端开发中，我们遇到了页面滚动条被底部标签栏遮挡的问题，特别是在iOS设备上更为明显。这是由于安全区域（Safe Area）和视口（Viewport）设置不正确导致的。

#### 问题原因

1. **安全区域（Safe Area）机制**：
   - iOS设备（特别是全面屏iPhone）有一个底部安全区域，用于避免内容被底部手势条遮挡
   - React Vant的Tabbar组件使用了`safeAreaInsetBottom`属性，这个属性会在底部添加额外的padding，使内容不被系统UI元素遮挡

2. **视口设置**：
   - 视口设置中缺少了`viewport-fit=cover`参数，这个参数允许内容延伸到安全区域，从而启用安全区域插入的使用

3. **CSS中的安全区域处理**：
   - 当Tabbar使用`safeAreaInsetBottom`属性时，它会自动添加底部padding，但这可能与页面的滚动区域计算不匹配

#### 解决方案

1. **添加viewport-fit=cover**：
   在`layout.js`的meta标签中添加viewport-fit=cover：

   ```jsx
   <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
   ```

2. **统一处理安全区域**：
   在`globals.css`中添加全局滚动容器样式：

   ```css
   /* 滚动容器通用样式 */
   .scroll-container {
     height: 100vh;
     overflow-y: auto;
     padding-bottom: calc(60px + env(safe-area-inset-bottom));
   }
   ```

3. **修改各页面容器类**：
   为首页、记录页和分析页的容器添加统一的类名：

   ```jsx
   <div className={`${styles.container} scroll-container`}>
   ```

4. **确保Tabbar组件正确使用safeAreaInsetBottom属性**：
   ```jsx
   <Tabbar 
     value={active} 
     onChange={handleChange}
     className="fixed bottom-0 left-0 right-0 z-50"
     border={false}
     safeAreaInsetBottom={true}
   >
   ```

通过以上修改，我们确保了：

- 视口设置允许内容延伸到安全区域
- 所有滚动容器有统一的底部padding，考虑了标签栏高度和安全区域
- Tabbar组件正确处理底部安全区域

这样，滚动条将始终显示在标签栏上方，不会被标签栏遮挡，同时在iOS设备上也能正确处理底部安全区域。

## 项目亮点和难点
- 路由懒加载