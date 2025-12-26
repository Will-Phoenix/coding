const define = {
  baseURL: window.location.origin + process.env.VUE_APP_BASE_API,
  timeout: process.env.NODE_ENV === 'development' ? 1000000 : 1000000,
  webSocketUrl: 'wss://flow.gantangtech.cn/websocket/',
  enableWebSocket: process.env.VUE_APP_ENABLE_WEBSOCKET === 'true',
  comUploadUrl: `${process.env.VUE_APP_BASE_API}/api/file/Uploader`,
  comUrl: process.env.VUE_APP_BASE_API,
  // 本地文件预览
  filePreviewServer: `${process.env.VUE_APP_BASE_API}/FileServer`,
  // 大屏应用前端路径
  dataV: `${process.env.VUE_APP_PUBLIC_PATH}DataV`,
  // 数据报表接口-java boot
  reportServer: `${process.env.VUE_APP_REPORT_API_PATH}`,
  // 报表前端
  report: `${process.env.VUE_APP_REPORT_APP_PATH}`,
  // # 是否允许修改SlideClass
  enableSlideClassSet: process.env.VUE_APP_ENABLE_SLIDECLASS_SET === 'true',
  // # 是否允许修改Theme
  enableThemeSet: process.env.VUE_APP_ENABLE_THEME_SET === 'true'
}
console.log(`***define***${JSON.stringify(define)}`)
module.exports = define
