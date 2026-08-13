# 开发文档

> 本文面向本项目开发人员与 AI 协作代理，是**操作手册**：新增页面 / 接口 / store / 配置怎么做，约定与测试怎么跟。

## 1. 开发环境与命令

| 命令 | 说明 |
|---|---|
| `pnpm install` | 安装依赖 |
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 类型检查（tsc -b）+ 生产构建（含 legacy 包） |
| `pnpm preview` | 预览生产构建 |
| `pnpm typecheck` | 仅类型检查 |
| `pnpm lint` | ESLint 检查 |
| `pnpm test` | 运行测试 |
| `pnpm test:watch` | 监听模式 |
| `pnpm test:coverage` | 覆盖率报告 |

### 开发调试：React Query Devtools

开发模式下应用右下角有一个悬浮按钮，点击展开 **React Query Devtools** 面板（`src/main.tsx` 中仅 `import.meta.env.DEV` 时挂载），用于调试服务端数据：

- 查看查询缓存：每个 `queryKey` 的状态（pending / success / error）、staleness、最后请求时间
- 手动操作：触发 `refetch` / `invalidateQueries` / `setQueryData`，观察缓存变化
- 定位问题：确认 `queryFn` 是否真的把 `signal` 透传给 API 层（取消时请求应被中止，见 §3 契约）

该包通过构建时的 `production` condition 解析为空实现，**不会进入生产 bundle**，不影响产物体积。

## 2. 新增页面与路由

> 骨架已提供（均无样式极简实现，在其上扩展或替换即可）：布局壳 `RootLayout`（`src/layouts/`）、首页占位 `HomeView`、404 页 `NotFoundView`（`src/pages/`）。

### 步骤

1. 在 `src/pages/` 下按路由层级建目录（**目录结构 = 路由结构**）
2. 编写页面组件，样式放同级 `css/X.module.css`；**视觉组件（页头 / 加载 / 错误）按自己风格自实现**（见下方契约与示例）
3. 在 `src/router/routes.tsx` 注册路由（支持任意深度嵌套与动态段）

### 视觉组件契约与示例

本项目**不预设品牌化视觉成品**（仅提供极简无样式骨架，见架构文档 ADR-5），以下给出常用状态组件的**接口契约**与**参考实现**，开发人员按项目风格 / 设计 token 实现即可（样式值建议走全局 CSS 变量，见 §8）：

| 组件 | 接口契约 | 语义 |
|---|---|---|
| 页头 PageHeader | `{ title: string; description?: string }` | 页面标题 + 描述 |
| 加载态 Spinner | 无 props | `role="status"` + `aria-label` |
| 数据错误态 ErrorState | `{ message: string; onRetry?: () => void }` | `isError` 分支展示，含重试 |
| 渲染崩溃兜底页 | `useRouteError()` 取错误 | 路由 `errorElement`，兜底不白屏 |

```tsx
// 参考实现（结构示例，样式自定）：
function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
    </div>
  )
}

function Spinner() {
  return <div role="status" aria-label="加载中" />
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert">
      <p>{message}</p>
      {onRetry ? <button onClick={onRetry}>重试</button> : null}
    </div>
  )
}
```

### 示例：动态段页面

```tsx
// src/pages/user/[id]/UserDetailPage.tsx
import { useParams } from 'react-router'
import { useUserDetail } from '@/hooks'
// 自实现的视觉组件（见上方契约与示例）
import { ErrorState, PageHeader, Spinner } from '@/components'
import styles from './css/UserDetailPage.module.css'

export function UserDetailPage() {
  const { id } = useParams()
  const { data, isPending, isError, error, refetch } = useUserDetail(id)
  return (
    <div className={styles.root}>
      <PageHeader title="详情" description={`/user/:id = ${id ?? '（未提供）'}`} />
      {isPending ? <Spinner /> : null}
      {isError ? <ErrorState message={error instanceof Error ? error.message : '加载失败'} onRetry={() => refetch()} /> : null}
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : null}
    </div>
  )
}
```

```tsx
// src/router/routes.tsx（节选）
{
  path: 'user',
  children: [
    { index: true, element: <UserListPage /> },
    { path: ':id', element: <UserDetailPage /> },
  ],
},
```

### 懒加载（路由代码分割）

页面多起来后用 `React.lazy` + `Suspense` 按路由分割，减少首屏 JS（本项目组件均为具名导出，需映射 `default`）：

```tsx
import { lazy, Suspense } from 'react'
import { Spinner } from '@/components' // 自实现的加载组件

const UserListPage = lazy(() =>
  import('@/pages/user/UserListPage').then((m) => ({ default: m.UserListPage })),
)

// 路由里：
{ path: 'user', element: <Suspense fallback={<Spinner />}><UserListPage /></Suspense> }
```

> 注意：`@/` 路径别名指向 `src/`（`vite.config.ts` 的 `resolve.alias` + `config/tsconfig.app.json` 的 `paths`）。

### 错误兜底（errorElement）

React Router 自带默认 `errorElement`：**即使不配置，任一子路由渲染崩溃**（组件 render 抛错、懒加载 chunk 加载失败）也不会白屏。**预期内数据错误不走这里** —— 那是 `useQuery` 的 `isError` + 自实现的错误展示组件（见上方契约）的职责（见 §3）。

需要品牌化兜底页时自实现，并在路由配置接入：

```tsx
// src/components/ErrorFallback.tsx（自实现示例）
import { useRouteError } from 'react-router'

export function ErrorFallback() {
  const error = useRouteError()
  const message = error instanceof Error ? error.message : '页面渲染异常'
  return (
    <div role="alert">
      <p>页面出错了</p>
      <p>{message}</p>
      <button onClick={() => window.location.reload()}>刷新页面</button>
    </div>
  )
}

// src/router/routes.tsx：接入根路由
{ element: <RootLayout />, errorElement: <ErrorFallback />, children: [...] }
```

### 页面标题

页面组件调用 `usePageTitle('列表页')`（`src/router/pageTitle.ts`）同步 `document.title`——内部状态 → 外部系统（`useEffect`），符合 §5 hooks 约束，标题后缀自动带应用名：

```tsx
import { usePageTitle } from '@/router'

export function UserListPage() {
  usePageTitle('用户列表')   // document.title = "用户列表 | 应用名"
  // ...
}
```

### 404 兜底（catch-all）

`routes.tsx` 已配 catch-all 路由（`{ path: '*', element: <NotFoundView /> }`，**根路由兄弟，不放进 children**）：未匹配路径渲染极简 404 页（`src/pages/NotFoundView.tsx`）。按风格替换或品牌化即可：

```tsx
// src/pages/NotFoundView.tsx（替换为品牌化 404 页）
export function NotFoundView() {
  return <div>404 - 页面未找到</div>
}
```

## 3. 新增服务端接口（完整链路）

新增一个接口涉及 4 层，按以下顺序：

### Step 1：定义 DTO 类型

```ts
// src/types/api/user.d.ts（全局共享；模块私有则放模块内 types/）
export interface UserListDto {
  items: UserDto[]
  total: number
}
```

> 分页接口建议复用通用类型（`src/types/api/common.d.ts`）：请求参数 `PageParams`（page / page_size）、响应 `Paginated<T>`（list / total / page / page_size），字段为 snake_case，对齐服务端分页约定，避免手写分页字段。

### Step 2：注册端点

```ts
// src/api/apiPath.ts
export const apiPath = {
  // ...
  userList: endpoint<undefined, UserListDto>('/users', 'GET', { authRequired: true }),
}
```

- 泛型 `<Req, Res>`：`Req` = 入参 DTO（无入参则为 `undefined`），`Res` = 出参 DTO
- `authRequired: true`：请求拦截器据此注入凭证（需鉴权时开启）

### Step 3：API 层包装

```ts
// src/api/user/userApi.ts
import { apiPath } from '@/api/apiPath'
import { requestEndpoint } from '@/api/http'

export function fetchUserList(signal?: AbortSignal) {
  return requestEndpoint(apiPath.userList, { signal })
}
```

### Step 4：hooks 层用 React Query 包装

```ts
// src/hooks/user/useUserList.ts
import { useQuery } from '@tanstack/react-query'
import { fetchUserList, toUserList } from '@/api'

export function useUserList() {
  return useQuery({
    queryKey: ['user', 'list'],
    // queryFn 自动收到 context（内含 signal），透传给 API 层实现真正取消
    queryFn: ({ signal }) => fetchUserList(signal).then((dto) => toUserList(dto.items)),
  })
}
```

写入操作用 `useMutation`，成功后失效相关查询：

```ts
// src/hooks/user/useCreateUser.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createUser } from '@/api'
import type { UserCreateDto } from '@/types'

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UserCreateDto) => createUser(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user', 'list'] }),
  })
}
```

### React Query 使用契约

#### ① queryFn 必须透传 signal（自动取消契约）

`useQuery` 的 `queryFn` 自动收到 context 参数（内含 `signal`：AbortSignal）。组件卸载、查询被替换、`cancelQueries` 等取消场景下该 signal 会 abort。**queryFn 必须把 `signal` 透传给 API 层**，请求才会被真正中止；不透传只是"表面取消"，HTTP 请求仍会发出：

```ts
// ✅ 透传 signal：取消时 axios 真正中断请求
queryFn: ({ signal }) => fetchUserList(signal).then((dto) => toUserList(dto.items)),

// ❌ 不透传：只停止 React Query 的等待，HTTP 请求照常发出
queryFn: async () => toUserList((await fetchUserList()).items),
```

`fetchUserList(signal?)` 继续把 signal 传给 `requestEndpoint(endpoint, { signal })` → axios（HTTP 层已支持 AbortSignal）。

#### ② 禁止 mutation 成功后用 setState 刷新

服务端数据只走 React Query。**不要**在 `onSuccess` 里 `setState` 手动刷新 —— 那会把服务端数据搬进组件状态，与查询缓存脱节、出现双数据源。正确做法：`invalidateQueries` 失效相关查询触发重新拉取，或 `setQueryData` 乐观更新：

```ts
// ✅ 失效相关查询，触发重新拉取
onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user', 'list'] }),

// ❌ 反模式：setState 手动刷新（与缓存脱节、双份数据源）
const [items, setItems] = useState<User[]>([])
onSuccess: (data) => setItems(data),
```

### Step 5：页面消费

```tsx
const { data, isPending, isError, error, refetch } = useUserList()
// isPending → <Spinner />；isError → <ErrorState />；data → 渲染
```

### 文件下载 / 上传

HTTP 层提供文件下载与上传的通用机制（`src/api/download.ts` / `src/api/upload.ts`），不经 React Query（命令式操作，非查询缓存）：

**下载 `downloadFile(url, options)`**：Blob 请求 + `Content-Disposition` 文件名解析（兼容 `filename*=UTF-8''` 与 `filename=` 双格式），`<a>` 标签触发下载：

```ts
import { downloadFile } from '@/api'

// Content-Disposition 提供文件名时自动采用；否则用 fileName 兜底
await downloadFile('/files/export', { params: { type: 'xlsx' }, fileName: 'export.xlsx' })
```

**上传 `uploadFile<T>(url, file, options)`**：FormData + 进度回调 + 取消信号，响应按标准包络解包返回业务数据：

```tsx
import { uploadFile } from '@/api'

const controller = new AbortController()
const result = await uploadFile<{ url: string }>('/files/upload', file, {
  fieldName: 'file',                     // FormData 字段名，默认 file
  onProgress: (e) => {
    if (e.total) setProgress(Math.round((e.loaded / e.total) * 100))  // 进度是 UI 状态，用 useState
  },
  signal: controller.signal,             // 可取消
})
```

## 4. 新增 / 使用 store（Zustand）

```ts
// src/store/user/useUserStore.ts
import { create } from 'zustand'
import type { UserStore } from './types/useUserStore'

export const useUserStore = create<UserStore>()((set) => ({
  selectedId: null,
  setSelected: (id) => set({ selectedId: id }),
}))
```

约定：

- Zustand v5 双括号写法 `create<T>()(...)`；store 类型定义放模块内 `types/useUserStore.d.ts`
- 组件用 selector 局部订阅，避免整树渲染；选择器返回对象 / 数组时用 `useShallow`
- **服务端数据不进 store**（走 React Query）

```ts
import { useShallow } from 'zustand/react/shallow'
const selectedId = useUserStore(useShallow((s) => s.selectedId))
```

## 5. React Hooks 约束

React 状态与外部系统的对齐遵循**方向性约定**，一条数据只有一种合法手段，避免各自为政：

| 对齐方向 | 方案 |
|---|---|
| React 内部状态 → 外部系统 | `useEffect`（把状态"推"给外部） |
| 外部系统 → React 内部状态 | `useSyncExternalStore`（把外部状态"拉"进渲染） |

### 5.1 useEffect 只做"内部 → 外部"

`useEffect` 是 React 对外部系统（DOM、浏览器 API、第三方订阅、网络、定时器）**写回**的唯一通道，**不是状态派生工具**。

```ts
// ✅ 内部状态 → 外部系统：本地存储持久化
useEffect(() => {
  localStorage.setItem('draft', draft)
}, [draft])
```

禁止：

- ❌ `useEffect` + `setState` 派生状态 → 渲染期直接计算或用 `useMemo`
- ❌ `useEffect` 里 fetch 数据 → 服务端数据一律走 TanStack Query
- ❌ `useEffect` 把 props 同步成 state 副本 → 渲染期直接使用 props
- ❌ `useEffect` 手动订阅外部 store 再 `setState` → 改用 `useSyncExternalStore`

```ts
// ❌ 反模式：effect 订阅外部状态并 setState（应使用 useSyncExternalStore）
const [online, setOnline] = useState(false)
useEffect(() => {
  const on = () => setOnline(true)
  window.addEventListener('online', on)
  return () => window.removeEventListener('online', on)
}, [])
```

### 5.2 外部 → 内部用 useSyncExternalStore

浏览器 API / 第三方全局 store / 自定义外部 store 进入 React，用 `useSyncExternalStore(subscribe, getSnapshot)`：

```ts
// ✅ 订阅浏览器 API：在线状态
const useOnlineStatus = () =>
  useSyncExternalStore(
    (onChange) => {
      window.addEventListener('online', onChange)
      window.addEventListener('offline', onChange)
      return () => {
        window.removeEventListener('online', onChange)
        window.removeEventListener('offline', onChange)
      }
    },
    () => navigator.onLine,
  )
```

- 相比 `useEffect` + `setState`：并发安全、无 tearing（撕裂）、快照一致
- 项目内 Zustand 内部已基于 `useSyncExternalStore`，业务组件直接 `useUserStore(selector)`，无需手写订阅
- 服务端数据不属于此类：走 TanStack Query（已内置缓存 / 失效 / 取消）

### 5.3 useCallback / useMemo：保持句柄稳定

函数句柄（函数引用）与缓存值句柄（对象 / 数组引用）若在每次渲染时**不必要地变化**，会传导给两处：

- 传给 `React.memo` 子组件的 props → 子组件**白白重渲染**（memo 只做浅比较，引用变了就重渲）
- 进入其它 hook 的依赖数组 → effect / 派生值**白白重执行**

**useCallback** 固定函数句柄，**useMemo** 缓存派生值 / 对象字面量：

```tsx
// ✅ useCallback：稳定回调，memo 子组件才能真正跳过渲染
const handleSelect = useCallback((id: string) => setSelected(id), [setSelected])

// ✅ useMemo：缓存昂贵派生 / 稳定对象引用
const sortedItems = useMemo(() => [...items].sort(byName), [items])
```

前提与边界：

- 只对 **memo 子组件** 或 **重渲染 / 重计算代价高**的依赖有收益；子组件未 memo、代价低时裸内联即可，**不要无脑包裹**（useMemo 本身有缓存开销与失效风险）
- 依赖数组必须完整（hooks 规则），否则句柄可能失效仍引发重渲
- 对象 / 数组字面量若为常量（不依赖 state / props），直接提为**模块级常量**，比 useMemo 更优

```tsx
// ❌ 反模式：内联回调传给 memo 子组件，每次渲染都是新引用 → 子组件无法跳过
<MemoItem onSelect={(id) => setSelected(id)} />

// ✅ 应改为 useCallback 稳定句柄；或子组件未 memo 时直接内联
```

### 5.4 速查

| 数据 / 状态 | 正确方案 |
|---|---|
| 服务端数据 | TanStack Query（useQuery / useMutation） |
| 客户端全局状态 | Zustand（内部已用 useSyncExternalStore） |
| 浏览器 API / 自定义外部 store | `useSyncExternalStore` |
| 派生状态（由 props / state 计算） | 渲染期直接计算 / `useMemo` |
| 传给 memo 子组件的回调 | `useCallback` |
| 传给 memo 子组件的对象 / 数组 / 昂贵派生 | `useMemo`（常量可提模块级） |
| 内部状态 → 外部系统（写入 / 订阅 / 定时器） | `useEffect` |
| 用户交互触发的副作用 | 事件处理函数（非 useEffect） |

## 6. 运行时配置接入（可运维覆盖项）

新增一个"免打包可改"的配置项，三步：

1. 加环境变量（所有环境生效放 `.env`，按环境区分放 `.env.development` / `.env.production`）：

```text
VITE_APP_CONFIG_FEATURE_FLAG=true
```

2. 代码里读取：

```ts
import { getAppConfigValue } from '@/config'
const flag = getAppConfigValue('FEATURE_FLAG', false)
```

3. （运维）在部署环境覆盖 `public/config.js`：

```js
window.__APP_CONFIG__ = Object.assign(window.__APP_CONFIG__ || {}, {
  FEATURE_FLAG: false,
})
```

> 挂载键 = 去掉 `VITE_APP_CONFIG_` 前缀；`config.js` 先于 bundle 执行，无需重新打包。

## 7. 鉴权接入指南

拦截器为预留给业务的接入口，具体凭证逻辑由本项目补全：

### 请求拦截器注入 token

```ts
// src/api/http.ts 请求拦截器（TODO 处）
if ((config as AppRequestConfig).authRequired) {
  // config.headers.Authorization = `Bearer ${getToken()}`
}
```

### 401 无感刷新（用 lockGate）

```ts
import { createLockGate } from '@/utils'

const gate = createLockGate({
  critical: () => refreshAccessToken(), // 独立裸请求，勿走带 401 拦截的 instance（防死锁）
  maxConcurrency: 4,
})
// 响应拦截器 401 分支（示意）：
// gate.run(() => 以新 token 重放原请求, config.signal)
//   成功 → 原请求以重放结果返回；失败 → reject，页面跳登录
```

### 路由守卫（loader + redirect）

需鉴权的页面在**路由层**守卫：给受保护路由配 `loader: requireAuth`（`src/router/guards.ts` 提供的骨架）。与拦截器同理，守卫**只保留逻辑分支**，具体鉴权判断由业务补全（不写死凭证逻辑）：

```ts
// src/router/guards.ts（骨架，TODO 处业务补全）
import type { LoaderFunction } from 'react-router'

export const requireAuth: LoaderFunction = () => {
  // TODO: const token = getToken()              // 从鉴权存储读取
  // if (!token) throw redirect('/login')        // 未登录跳登录页
  return null
}
```

```tsx
// src/router/routes.tsx：受保护路由配 loader
{ path: 'settings', loader: requireAuth, element: <SettingsPage /> }
```

- 未接入鉴权时骨架放行（`return null`），不会阻塞开发
- 需要拿当前 URL 做"登录后回跳"时，loader 可接收 `LoaderFunctionArgs`（含 `request.url`）

## 8. 样式与命名约定速查

| 场景 | 约定 |
|---|---|
| 组件 / 页面模块化样式 | 同级 `css/X.module.css`，`import styles from './css/X.module.css'` |
| 全局变量 / reset | `src/assets/styles/{variables,reset}.css` |
| 类型定义 | 只进 `.d.ts`；共享放 `src/types/`，模块私有放 `模块/types/` |
| 业务文件 | 零类型定义，只 import / 经 barrel 再导出 |
| 新业务目录 | 一个 index barrel + 业务文件 + `css/` + `types/` |
| 通用组件 | 业务自建，放 `src/components/`，经 `@/components` 导出 |
| 视觉组件 | 不预设成品，按 §2 契约与示例自实现 |

## 9. 测试规范

- 测试统一放根 `tests/`，结构镜像 `src/`
- 优先覆盖：纯函数 / 工具（cx、format、lockGate）、API 层解包逻辑（http）
- 组件测试由开发人员为自己实现的组件补充（`@testing-library/react` + `jsdom`，`config/vitest.setup.ts` 已配置 jest-dom 断言）
- 异步控制模式（lockGate 测试示例）：

```ts
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function flush() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0))
}
```

## 10. 约定清单（AI Agent 协作要点）

新增代码前逐条核对：

- [ ] 新增类型一定进 `.d.ts`（共享放 `src/types/`，模块私有放模块内 `types/`），业务文件不写类型定义
- [ ] 新增接口一定走 `apiPath` 注册 + `requestEndpoint`，不新写裸 axios
- [ ] 服务端数据只走 hooks（React Query），不进 Zustand
- [ ] 派生状态在渲染期计算 / `useMemo`，不用 `useEffect` + `setState`
- [ ] 外部状态同步用 `useSyncExternalStore`（服务端数据走 TanStack Query），不在 `useEffect` 手写订阅 / fetch
- [ ] 传给 `React.memo` 子组件的回调用 `useCallback`、对象 / 数组用 `useMemo` 稳定句柄；不无脑包裹、不过度优化
- [ ] `useQuery` 的 `queryFn` 透传 `{ signal }` 给 API 层（取消时真正中止请求）
- [ ] mutation 成功后用 `invalidateQueries` / `setQueryData` 刷新，不用 `setState` 手动刷服务端数据
- [ ] 响应拦截器不吞错，错误交给 React Query / 页面
- [ ] 路由守卫用 `requireAuth` 骨架（`loader` + `redirect`），只保留逻辑分支，鉴权判断由业务补全
- [ ] 错误分两层不混用：预期内数据错误走 `isError` 自实现展示，渲染崩溃由 React Router `errorElement` 兜底
- [ ] 视觉组件 / 页面 / 错误页一律**自实现**，不沿用任何默认成品；不引入 demo / 演示业务
- [ ] 模块化样式放同级 `css/`，全局样式放 `assets/styles/`
- [ ] 组件 / 页面 / 接口的 barrel 在各自 index 导出，统一从模块入口 import
- [ ] 类型导入用 `import type`（`verbatimModuleSyntax`）
- [ ] 修改 API / 类型相关逻辑后跑 `pnpm typecheck && pnpm lint && pnpm test`
