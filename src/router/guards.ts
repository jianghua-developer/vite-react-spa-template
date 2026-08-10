import type { LoaderFunction } from 'react-router'

/**
 * 路由守卫 loader（模板，具体鉴权逻辑留空 —— 与 http.ts 拦截器同理，只保留逻辑分支）：
 * 为需鉴权的路由提供守卫骨架。未登录 / 未授权时 throw redirect 到登录页。
 *
 * 用法：受保护路由配 loader: requireAuth
 *   { path: 'settings', loader: requireAuth, element: <SettingsPage /> }
 *
 * 业务补全点（见 docs/development.md §7）：
 *   const token = getToken()              // ← 从鉴权存储读取
 *   if (!token) throw redirect('/login')  // ← 未登录跳登录页
 */
export const requireAuth: LoaderFunction = () => {
  // TODO: 鉴权判断（token / 登录态 / 权限），未授权 throw redirect('/login')
  return null
}
