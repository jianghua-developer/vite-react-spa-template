/** 运行时可覆盖的应用配置（VITE_APP_CONFIG_* 默认值 + public/config.js 运维覆盖） */
interface AppConfig {
  [key: string]: unknown
}

interface Window {
  __APP_CONFIG__?: AppConfig
}
