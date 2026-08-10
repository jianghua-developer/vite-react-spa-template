import axios from 'axios'
import type { AxiosError } from 'axios'
import { apiBaseUrl, API_SUCCESS_CODE, DEFAULT_API_TIMEOUT, getAppConfigValue } from '@/config'
import type { ApiResponse } from '@/types'
import type { ApiEndpoint, EndpointRequest, EndpointResponse } from './types/apiPath'
import type { AppRequestConfig, HttpOptions, QueryParams } from './types/http'

/** HTTP 错误（HTTP 状态异常或业务码非成功时抛出） */
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

/** axios 实例：baseURL、超时（均可经 VITE_APP_CONFIG_* 运行时覆盖） */
const instance = axios.create({
  baseURL: apiBaseUrl,
  timeout: Number(getAppConfigValue('TIMEOUT') ?? DEFAULT_API_TIMEOUT),
})

/**
 * 原始 axios 实例（复用同一拦截器与超时）。
 * 常规请求推荐走 requestEndpoint / http；仅文件下载（需读取 response.headers，如 Content-Disposition）
 * 或需要原始 response 控制的场景使用本实例。
 */
export const httpInstance = instance

// ============ 请求拦截器：鉴权 / 凭证注入（模板，具体逻辑留空） ============
instance.interceptors.request.use(
  (config) => {
    // authRequired 端点在此注入鉴权凭证（如 token）；公开端点跳过
    if ((config as AppRequestConfig).authRequired) {
      // TODO: const token = getToken()  // 接入鉴权存储后启用
      // config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

// ============ 响应拦截器：全局跨页面关注点（模板，具体逻辑留空） ============
// 原则：拦截器只承载全局副作用（超时提示 / 无感刷新 / 权限跳转），绝不吞错，
// 错误一律 Promise.reject 抛给 React Query，由页面组件经 useQuery/useMutation 的 error 状态自行展示。
instance.interceptors.response.use(
  // 成功响应（HTTP 2xx）：可在此统一处理（如记录刷新时机），留空
  (response) => response,
  // 失败响应
  (error: AxiosError) => {
    // 请求取消（AbortController / React Query 卸载中止）：静默透传，不进入错误处理
    if (axios.isCancel(error)) {
      return Promise.reject(error)
    }

    const status = error.response?.status
    const isTimeout = error.code === 'ECONNABORTED' || /timeout/i.test(error.message ?? '')

    if (isTimeout) {
      // 全局超时：提示 / 可选重试（跨页面通用）
      // TODO: 具体逻辑留空
    } else if (status === 401) {
      // 需要"拿锁 + 等锁队列"的场景（如无感刷新）可用 src/utils/lockGate 的 createLockGate 实现：
      //   critical = 刷新动作、task = 带新 token 重试；具体业务由消费端决定
      // TODO: 全局鉴权：无感刷新 token（透明）；刷新失败继续向下抛，页面据此跳登录
    } else if (status === 403) {
      // 全局权限：跳转无权限页或提示
      // TODO: 具体逻辑留空
    } else if (status === 400) {
      // 400 参数错误：统一提示（如按后端 msg）
      // TODO: 具体逻辑留空
    }
    // 其余错误（5xx 服务端错误、其他状态码等）不在此处理，
    // 直接抛给 React Query，由页面组件展示

    return Promise.reject(error)
  },
)

/** 判断是否为约定响应包络 { code, data, msg }（以 code 为 string 作为标记） */
function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  return typeof value === 'object' && value !== null && typeof (value as { code?: unknown }).code === 'string'
}

/**
 * 解包约定响应包络 { code, data, msg }：
 * - code === API_SUCCESS_CODE → 返回 data（业务数据）
 * - code 非成功 → 抛业务 ApiError（含 code / msg）
 * - 非包络（如文件流 / 原始数据）→ 原样返回
 */
export function unwrapEnvelope<T>(body: unknown, httpStatus: number): T {
  if (isApiResponse(body)) {
    if (body.code === API_SUCCESS_CODE) {
      return body.data as T
    }
    throw new ApiError(httpStatus, body.msg || `业务失败：${body.code}`, body, body.code)
  }
  return body as T
}

/** 统一请求核心：axios 封装，非 2xx 归一化为 ApiError、支持 AbortSignal。 */
async function request<T>(path: string, options: HttpOptions = {}): Promise<T> {
  const method = options.method ?? (options.body !== undefined ? 'POST' : 'GET')
  const params: QueryParams | undefined = options.params
    ? Object.fromEntries(Object.entries(options.params).filter(([, value]) => value !== undefined))
    : undefined

  try {
    const axiosConfig: AppRequestConfig = {
      url: path,
      method,
      params,
      data: options.body,
      signal: options.signal,
      authRequired: options.authRequired,
      onUploadProgress: options.onUploadProgress,
    }
    const response = await instance.request<unknown>(axiosConfig)
    return unwrapEnvelope<T>(response.data, response.status)
  } catch (error) {
    // 取消的请求透传（React Query 卸载中止时不应归一化为业务错误）
    if (axios.isCancel(error)) {
      throw error
    }
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.status ?? 0, error.message, error.response?.data)
    }
    throw error
  }
}

/**
 * 统一入口：通用请求（path + options）。
 * 服务端请求推荐经 requestEndpoint（apiPath 注册表）统一路径/方法/鉴权与 DTO；
 * 本函数用于注册表外的兜底请求（或消费端需要原始控制时）。
 */
export const http = request

/**
 * 按端点注册表调用：路径/方法/鉴权标记取自 apiPath，入参绑定到端点入参 DTO、返回值推导自出参 DTO。
 * 所有服务端请求经 React Query 包装后，走本函数（或 http 便捷方法）。
 */
export async function requestEndpoint<E extends ApiEndpoint<unknown, unknown>>(
  endpoint: E,
  options: Omit<HttpOptions, 'method'> & { body?: EndpointRequest<E> } = {},
): Promise<EndpointResponse<E>> {
  return request<EndpointResponse<E>>(endpoint.path, {
    ...options,
    method: endpoint.method,
    authRequired: endpoint.authRequired,
  })
}
