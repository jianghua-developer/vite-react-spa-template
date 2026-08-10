import { createBrowserRouter } from 'react-router'
import { APP_NAME } from '@/config'

/** 极简骨架：仅一个无样式占位首页，保证 dev / build 链路可运行。
 *  不提供视觉成品与演示页面，开发人员按 docs/development.md §2 建立真实页面后替换本文件。 */
export const router = createBrowserRouter([{ index: true, element: <p>{APP_NAME}</p> }])
