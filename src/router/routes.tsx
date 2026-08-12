import { createBrowserRouter } from 'react-router'
import { RootLayout } from '@/layouts'
import { HomeView } from '@/pages/HomeView'
import { NotFoundView } from '@/pages/NotFoundView'

/** 极简路由骨架：布局壳 + 首页占位 + 404 兜底（均为无样式极简实现）。
 *  消费方按 docs/development.md §2 建立真实页面后扩展本文件（替换 HomeView / 增加子路由）。
 *  需鉴权的路由配 loader: requireAuth（见 src/router/guards.ts）。 */
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [{ index: true, element: <HomeView /> }],
  },
  { path: '*', element: <NotFoundView /> },
])
