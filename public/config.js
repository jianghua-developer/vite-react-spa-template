/**
 * 运行时配置覆盖（无需重新打包）。
 *
 * 只写需要覆盖的键，未覆盖的键沿用构建期 VITE_APP_CONFIG_* 环境变量默认值。
 * 该脚本先于应用 bundle 执行，Object.assign 将覆盖值合并到 window.__APP_CONFIG__。
 */
window.__APP_CONFIG__ = Object.assign(window.__APP_CONFIG__ || {}, {
  // 示例：window.__APP_CONFIG__ 由构建期 VITE_APP_CONFIG_* 挂载，这里可覆盖任意键
  // apiBaseUrl: 'https://prod-api.example.com',
})
