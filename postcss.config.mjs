/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    autoprefixer: {},
    // 更新 postcss-px-to-viewport 配置以兼容 PostCSS 8
    'postcss-px-to-viewport': {
      viewportWidth: 375,
      viewportHeight: 667,
      unitPrecision: 3,
      viewportUnit: 'vw',
      selectorBlackList: ['.ignore', '.rv-'],
      minPixelValue: 1,
      mediaQuery: false,
      exclude: [/node_modules/],
    },
  },
}

export default config
