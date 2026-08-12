/**
 * 通用响应包络（服务端统一约定）：
 *   { code: 业务码, data: 业务数据, msg: 提示信息 }
 * 业务数据经 src/api/http.ts 的 unwrapEnvelope 解包后直接使用。
 */
export interface ApiResponse<T = unknown> {
  /** 业务码（string；与 API_SUCCESS_CODE 比较判定成功） */
  code: string
  /** 业务数据 */
  data: T
  /** 提示信息 */
  msg: string
}

/** 分页请求参数（snake_case，对齐服务端分页字段约定） */
export interface PageParams {
  page: number
  page_size: number
}

/** 分页数据（snake_case） */
export interface Paginated<T> {
  list: T[]
  total: number
  page: number
  page_size: number
}

/** 接口错误载荷 */
export interface ApiErrorPayload {
  code: number
  message: string
  errors?: Record<string, string[]>
}
