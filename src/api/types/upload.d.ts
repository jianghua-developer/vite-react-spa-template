import type { AxiosProgressEvent } from 'axios'

/** 文件上传选项 */
export interface UploadOptions {
  /** FormData 字段名（默认 `file`） */
  fieldName?: string
  /** 上传文件名（默认取 File 原名） */
  fileName?: string
  /** 取消信号 */
  signal?: AbortSignal
  /** 上传进度回调（透传 axios onUploadProgress） */
  onProgress?: (event: AxiosProgressEvent) => void
}
