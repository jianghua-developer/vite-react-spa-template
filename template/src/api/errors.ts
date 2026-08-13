/**
 * HTTP 错误（HTTP 状态异常或业务码非成功时抛出）。
 * 独立成模块：非 HTTP 层（如 WebSocket / 定时任务）也可复用同一业务错误类型。
 * 业务成功码等常量统一在 src/config/constants.ts（见 API_SUCCESS_CODE）。
 */
export class ApiError extends Error {
  status: number
  /** 业务码（HTTP 错误时无） */
  code?: string
  data: unknown

  constructor(status: number, message: string, data?: unknown, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.data = data
  }
}
