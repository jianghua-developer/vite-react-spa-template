import type { QueryParams } from './http'

/** 文件下载选项 */
export interface DownloadOptions {
  /** 查询参数 */
  params?: QueryParams
  /** 取消信号 */
  signal?: AbortSignal
  /** 是否需鉴权（走请求拦截器注入凭证） */
  authRequired?: boolean
  /** 兜底文件名（服务端 Content-Disposition 未提供时使用） */
  fileName?: string
}
