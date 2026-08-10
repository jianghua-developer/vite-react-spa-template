import { useEffect } from 'react'
import { APP_NAME } from '@/config'

/**
 * 页面标题：useEffect 同步 document.title（React 内部状态 → 外部系统，符合 hooks 约束）。
 * 页面组件调用 `usePageTitle('列表页')` 即可；不传 title 时重置为应用名。
 */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME
  }, [title])
}
