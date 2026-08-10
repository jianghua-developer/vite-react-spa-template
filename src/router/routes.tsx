import { createBrowserRouter } from 'react-router'
import { APP_NAME } from '@/config'

/** 极简骨架：仅一个无样式占位首页，保证 dev / build 链路可运行。
 *  不提供视觉成品与演示页面，开发人员按 docs/development.md §2 建立真实页面后替换本文件。
 *
 *  404 兜底：消费方自实现 NotFound 组件后添加 catch-all 路由（见 docs/development.md §2）：
 *    { path: '*', element: <NotFound /> }   // 注意放 children 之外、作为根路由兄弟 */
export const router = createBrowserRouter([{ index: true, element: <p>{APP_NAME}</p> }])
