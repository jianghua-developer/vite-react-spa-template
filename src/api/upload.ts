import { http } from './http'
import type { UploadOptions } from './types/upload'

/**
 * 文件上传：FormData + 进度回调 + 取消信号。
 * 响应按标准包络解包（{ code, data, msg }），返回业务数据 T。
 */
export async function uploadFile<T = unknown>(url: string, file: File, options: UploadOptions = {}): Promise<T> {
  const formData = new FormData()
  formData.append(options.fieldName ?? 'file', file, options.fileName ?? file.name)

  return http<T>(url, {
    method: 'POST',
    body: formData,
    signal: options.signal,
    onUploadProgress: options.onProgress,
  })
}
