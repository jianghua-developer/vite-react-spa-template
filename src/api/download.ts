import { httpInstance } from './http'
import type { DownloadOptions } from './types/download'
import type { AppRequestConfig } from './types/http'

/**
 * 从 Content-Disposition 响应头解析文件名：
 * 兼容 `filename*=UTF-8''编码名` 与 `filename="普通名"` 两种格式，前者优先。
 */
export function parseFilename(disposition: string | undefined, fallback: string): string {
  if (!disposition) return fallback
  const star = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(disposition)
  if (star?.[1]) return decodeURIComponent(star[1].trim().replace(/^["']|["']$/g, ''))
  const plain = /filename="?([^";]+)"?/i.exec(disposition)
  if (plain?.[1]) return plain[1].trim()
  return fallback
}

/**
 * 文件下载：Blob 请求 + Content-Disposition 文件名解析 + `<a>` 标签触发下载。
 * 使用 httpInstance 以保留完整 response（读取 Content-Disposition 头）；
 * 常规数据请求仍走 requestEndpoint / http。
 */
export async function downloadFile(url: string, options: DownloadOptions = {}): Promise<void> {
  const response = await httpInstance.get<Blob>(url, {
    params: options.params,
    signal: options.signal,
    responseType: 'blob',
    authRequired: options.authRequired,
  } as AppRequestConfig)

  const disposition = response.headers['content-disposition'] as string | undefined
  const filename = parseFilename(disposition, options.fileName ?? 'download')

  // 创建 <a> 触发下载（appendChild 兼容 Firefox；延迟回收以兼容异步 click）
  const link = document.createElement('a')
  link.href = URL.createObjectURL(response.data)
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }, 150)
}
