import { Outlet } from 'react-router'

/** 极简布局壳：仅提供 <Outlet/> 挂载点（无导航、无样式）。
 *  消费方按需扩展（导航 / 布局视觉），或替换为自己的布局壳。 */
export function RootLayout() {
  return (
    <div>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
