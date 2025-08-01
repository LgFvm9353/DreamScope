/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    autoprefixer: {},
    'postcss-px-to-viewport': {
      viewportWidth: 375, // 设计稿宽度
      viewportHeight: 667, // 设计稿高度
      unitPrecision: 5, // 转换后的精度
      viewportUnit: 'vw', // 转换成的视窗单位
      selectorBlackList: ['.ignore', '.hairlines'], // 不转换的类名
      minPixelValue: 1, // 小于或等于1px不转换为视窗单位
      mediaQuery: false, // 是否在媒体查询中转换px
      exclude: [/node_modules/], // 排除node_modules目录下的文件
    },
  },
}

export default config
