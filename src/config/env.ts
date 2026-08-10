import { getAppConfigValue } from './appConfig'

/** 运行时 API 基础地址（VITE_APP_CONFIG_API_BASE_URL + config.js 覆盖），去尾部斜杠便于拼接 */
export const apiBaseUrl = (getAppConfigValue<string>('API_BASE_URL') ?? '/api').replace(/\/+$/, '')

/** 当前构建 mode（development / production / ...） */
export const mode = import.meta.env.MODE

/** 是否开发模式 */
export const isDev = import.meta.env.DEV

