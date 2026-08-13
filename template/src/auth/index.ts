import { MutationCache, QueryCache } from '@tanstack/react-query'

import { httpInstance } from '@/api/http'

import { attachAuth, isAuthExpired } from './attachAuth'
import { redirectToLogin } from './redirect'

/**
 * 认证模块入口（auth_mode=opaque 时由 main.tsx import 激活）：
 * 挂认证拦截器；并提供「认证失效跳转」给外层（QueryCache/MutationCache 全局错误回调）。
 */
export function initAuth(): void {
  attachAuth(httpInstance)
}

/** 外层拦截特殊错误码（40103）跳登录——导航在外层，拦截器只做 token 生命周期 */
function onAuthError(error: unknown): void {
  if (isAuthExpired(error)) redirectToLogin()
}

export const authQueryCache = new QueryCache({ onError: onAuthError })
export const authMutationCache = new MutationCache({ onError: onAuthError })
