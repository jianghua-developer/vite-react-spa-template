import type { AxiosProgressEvent, AxiosRequestConfig } from 'axios'

/** HTTP 方法 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/** query 参数字典 */
export type QueryParams = Record<string, string | number | boolean | undefined>

/** HTTP 请求配置 */
export interface HttpOptions {
  method?: HttpMethod
  params?: QueryParams
  body?: unknown
  signal?: AbortSignal
  /** 是否需鉴权（请求拦截器据此注入 token；由 ApiEndpoint.authRequired 自动注入或手动指定） */
  authRequired?: boolean
  /** 上传进度回调（FormData 上传时透传给 axios） */
  onUploadProgress?: (event: AxiosProgressEvent) => void
}

/** axios 请求配置扩展：携带 authRequired（局部类型，避免全局增强 axios 类型） */
export type AppRequestConfig = AxiosRequestConfig & { authRequired?: boolean }
