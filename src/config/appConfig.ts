/**
 * 运行时配置访问器。
 * window.__APP_CONFIG__ 由 vite 插件挂载 VITE_APP_CONFIG_* 默认值，
 * 再由 public/config.js 合并运维覆盖（无需重新打包）。此处仅读取。
 */

/** 读取合并后的运行时配置 */
export function getAppConfig(): AppConfig {
  return window.__APP_CONFIG__ ?? {}
}

/** 读取单个配置项，未命中返回 fallback */
export function getAppConfigValue<T>(key: string, fallback?: T): T | undefined {
  const value = getAppConfig()[key]
  return (value as T | undefined) ?? fallback
}
