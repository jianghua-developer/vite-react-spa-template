/** 运行时可覆盖的应用配置（VITE_APP_CONFIG_* 默认值 + public/config.js 运维覆盖）。
 *  键 = 去掉 `VITE_APP_CONFIG_` 前缀后的原名；经 getAppConfigValue() 读取。 */
export interface AppConfig {
  /** API 基础地址（VITE_APP_CONFIG_API_BASE_URL） */
  API_BASE_URL?: string
  /** 请求超时（毫秒，VITE_APP_CONFIG_TIMEOUT） */
  TIMEOUT?: number
  /** 其余自定义配置项（VITE_APP_CONFIG_* 任意键） */
  [key: string]: unknown
}
