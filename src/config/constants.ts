/** 应用名（`{{name}}` 占位，copier 复制时替换为项目名） */
export const APP_NAME = '{{name}}'

/** React Query 默认 staleTime（毫秒） */
export const QUERY_STALE_TIME = 60_000

/** axios 默认超时（毫秒），可用 VITE_APP_CONFIG_TIMEOUT 运行时覆盖 */
export const DEFAULT_API_TIMEOUT = 15_000

/** 服务端业务成功码（响应包络约定，见 types/api/common.d.ts；后端约定不同时改这里） */
export const API_SUCCESS_CODE = '00000'
