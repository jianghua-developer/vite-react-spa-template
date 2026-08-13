# 架构文档

> 本文从本项目的实现出发，说明**架构分层、目录职责、核心机制与关键设计决策**。
> 阅读顺序：定位与原则 → 目录结构 → 分层与数据流 → 核心机制 → 设计决策。

## 1. 项目定位与原则

本项目以一套**约定 + 骨架**起步，让团队（含 AI agent）从一开始就在清晰的边界内协作：

- **约定**：目录职责、命名、类型 / 样式 / 数据流边界，让多人（含 AI agent）协作时不跑偏
- **骨架**：工具链、HTTP 层、数据层、并发原语开箱即用，业务直接往骨架上长

贯穿全局的五条原则：

1. **三层隔离**：工具链（`config/`）、类型（`src/types/` 与模块内 `types/`）、样式（模块内 `css/` 与 `src/assets/styles/`）与业务文件物理分离
2. **业务文件零类型定义**：类型只存在于 `.d.ts`，业务文件只 import / 再导出
3. **配置可运行时覆盖**：构建期默认值经 `window.__APP_CONFIG__` 暴露，运维可免打包覆盖
4. **服务端数据不进客户端状态**：服务端数据只走 TanStack Query，Zustand 只放纯客户端状态
5. **不预设品牌化视觉成品**：视觉呈现（组件 / 错误页等）由开发人员按项目风格自行实现，架构提供**机制 + 接口契约 + 文档示例**；仅保留极简无样式骨架（布局壳 / 首页 / 404）保证可运行（见 ADR-5）

## 2. 技术栈总览

| 类别 | 选型 | 用途 |
|---|---|---|
| 语言 / 构建 | TypeScript + Vite | 编译目标统一 ESNext；旧浏览器由 `@vitejs/plugin-legacy` 在生产构建兜底 |
| 框架 | React | 组件 / Hooks |
| 路由 | React Router | 声明式嵌套路由，`pages/` 目录镜像路由树 |
| 服务端数据 | TanStack Query | useQuery / useMutation，缓存 / 失效 / 取消 |
| HTTP | axios | 请求封装、拦截器、AbortSignal 透传 |
| 客户端状态 | Zustand | 纯客户端全局状态（不存服务端数据） |
| 样式 | CSS Modules | 模块化样式；全局三件套做 reset 与变量 |
| 测试 | Vitest + Testing Library | 单元测试（`tests/` 镜像结构） |
| 静态检查 | ESLint（flat config） | React hooks 规则、类型相关检查 |

## 3. 目录结构全景

```text
├── config/                          # 工具链配置（业务代码不可 import）
│   ├── tsconfig.{base,app,test,node}.json   # TS 分层：app/test 隔离 node 类型
│   ├── eslint.config.mjs            # ESLint flat config
│   ├── vitest.config.ts / vitest.setup.ts
│   ├── postcss.config.mjs           # PostCSS（插件留空，业务按需配置）
│   └── plugin/appConfigPlugin.ts    # VITE_APP_CONFIG_* → window.__APP_CONFIG__
├── docs/                            # 架构与开发文档（本文档）
├── public/
│   ├── config.js                    # 运维运行时覆盖 window.__APP_CONFIG__
│   └── favicon.svg
├── src/
│   ├── api/                         # HTTP 层：axios 封装 + apiPath 注册表 + errors + 类型契约
│   ├── assets/                      # 静态资源
│   │   └── styles/                  # 全局样式三件套：reset / variables / main
│   ├── components/                  # .gitkeep · 通用组件（业务自建）
│   ├── config/                      # 应用配置读取：apiBaseUrl / 常量 / 运行时配置访问
│   ├── hooks/                       # .gitkeep · React Query 数据 hooks（业务自建）
│   ├── layouts/                     # 布局壳：RootLayout（极简 Outlet 挂载点）
│   ├── pages/                       # 页面：HomeView / NotFoundView（极简占位，镜像路由树）
│   ├── router/                      # 路由声明（routes.tsx，极简骨架 + 404 catch-all）
│   ├── store/                       # .gitkeep · Zustand 纯客户端状态（业务自建）
│   ├── types/                       # 全局共享类型：common / api / env / global
│   └── utils/                       # 通用工具（cx / format / validation / lockGate）
├── tests/                           # 测试（镜像 src/ 结构）
└── vite.config.ts                   # Vite 入口配置（base 规范化 / 插件 / 代理）
```

> 标注 `.gitkeep` 的目录为**业务自建**：项目只保留目录约定（空占位），组件 / 数据 hooks / store 由开发人员按本文档与开发文档建立；布局与页面提供极简骨架（见 ADR-5）。

### 模块职责明细

| 模块 | 放什么 | 不放什么 |
|---|---|---|
| `src/api/` | axios 实例、拦截器、`apiPath` 端点注册表、DTO ↔ 领域映射 | 业务逻辑、组件 |
| `src/hooks/` | useQuery / useMutation 包装（服务端数据唯一入口，业务自建） | 页面组件、HTTP 细节 |
| `src/pages/` | 页面组件（路由叶子），内置极简占位（HomeView / NotFoundView），业务在其上扩展 | 通用组件、数据请求细节 |
| `src/layouts/` | 布局壳（内置极简 RootLayout 挂载点，业务扩展） | 页面、业务逻辑 |
| `src/components/` | 页面无关的通用组件（业务自建） | 具体业务页面 |
| `src/store/` | 纯客户端全局状态（Zustand，业务自建） | 服务端数据 |
| `src/types/` | 全局共享类型（DTO / 领域 / 枚举 / 响应包络） | 模块私有类型（应放模块内 `types/`） |
| `src/utils/` | 零依赖通用工具 | 业务逻辑、组件 |

## 4. 分层与数据流

### 单向数据流

```text
                useQuery / useMutation
┌──────────┐  ─────────────────────────▶  ┌──────────┐
│ UI 层    │                              │ hooks    │
│（业务自建）                             │ (React Query)
│ pages →  │  ◀─────────────────────────  │  服务端数据唯一入口
│ components│      data / error /         └────┬─────┘
└──────────┘       isPending / refetch         │ queryFn / mutationFn
      │                                          ▼
      │ zustand（纯客户端状态）              ┌──────────┐
      │                                    │ api 层   │
      │                                    │ requestEndpoint(endpoint)
      │                                    │ apiPath · DTO · envelope
      │                                    └────┬─────┘
      │                                          │ axios + 拦截器
      │                                          ▼
      │                                    ┌──────────┐
      └──────── 无服务端依赖 ◀────────────  │ 服务端接口│
                                          └──────────┘
```

要点：

- **服务端数据**：UI → `hooks/`（useQuery / useMutation）→ `api/`（`requestEndpoint`）→ axios → 服务端；返回的 DTO 在 hooks 内映射为领域模型
- **客户端状态**：UI 直接读 Zustand store，与服务端数据解耦
- **错误处理**（两层）：**预期内数据错误**——拦截器只做全局副作用，**绝不吞错**；错误经 `Promise.reject` 交给 React Query，页面用 `isError` + 自实现的错误展示组件呈现；**预期外渲染崩溃**——React Router 默认 `errorElement` 兜底（不白屏），品牌化错误页由开发人员自实现并配置

## 5. 核心机制

### 5.1 运行时配置链路

```text
构建期 .env                        vite 插件(appConfigPlugin)
VITE_APP_CONFIG_API_BASE_URL ──▶ window.__APP_CONFIG__ ──▶ public/config.js 运维覆盖
        ▲                                                      │
        │ 经 getAppConfigValue() 读取                           ▼
   src/config/appConfig.ts                           应用消费（apiBaseUrl / timeout）
```

- 构建期：`VITE_APP_CONFIG_*` 环境变量由 `config/plugin/appConfigPlugin.ts` 在 `transformIndexHtml` 内联到 `window.__APP_CONFIG__`（dev 与 build 均生效）
- 运行时：`public/config.js` 先于 bundle 执行，`Object.assign` 合并运维覆盖（无需重新打包）
- 读取：`getAppConfigValue('API_BASE_URL')` 等（见 `src/config/appConfig.ts`）

### 5.2 类型体系

```text
src/types/                            全局共享类型（跨模块复用）
  api/common.d.ts                    响应包络 ApiResponse / 分页（PageParams / Paginated）/ 错误载荷
  app-config.d.ts                    AppConfig 类型（VITE_APP_CONFIG_* 挂载形状）
  common/index.d.ts                  通用标识类型（ID / Nullable / PartialDeep）
  env.d.ts / global.d.ts             环境声明 / 全局 window.__APP_CONFIG__ 增强
  domain/ · enums/                   业务 DTO / 领域模型 / 枚举（.gitkeep 占位，业务按需建立）

各模块内 types/X.d.ts                 模块私有类型（如 api/types/http.d.ts、utils/types/lockGate.d.ts）
```

约定：

- 类型只存在于 `.d.ts`；业务文件（`.ts` / `.tsx`）**零类型定义**，只 import / 经 barrel 再导出
- 全局共享类型放 `src/types/`；模块私有类型放 `模块/types/`
- `verbatimModuleSyntax` 开启，类型导入必须用 `import type`

### 5.3 样式体系

```text
src/assets/styles/                  全局样式：main.css（引 reset + variables）/ reset.css / variables.css
各模块 css/X.module.css             CSS Modules（模块化、作用域隔离）
```

- 全局变量 / reset 放 `assets/styles/variables.css`、`reset.css`；业务模块样式一律 CSS Modules
- 组件 / 页面的模块化样式放**同级目录的 `css/`** 下

### 5.4 HTTP 层

- **端点注册表 `apiPath`**（`src/api/apiPath.ts`）：逻辑名 → 路径 / 方法 / 鉴权标记 / 出入参 DTO，集中登记。**不预设业务端点，注册表为空**，由开发人员按业务用 `endpoint` 助手登记（见开发文档 §3）
- **统一调用 `requestEndpoint`**：按端点调用，方法 / 鉴权自动注入，出入参类型自动推导
- **响应包络**：服务端约定 `{ code, data, msg }`；`unwrapEnvelope` 解包，非成功码抛 `ApiError`（`src/api/errors.ts`，独立于 HTTP 层，非 HTTP 场景也可复用）
- **拦截器**：请求拦截器按 `authRequired` 注入凭证（逻辑预留，待接入）；响应拦截器统一处理超时 / 401 / 403 / 400（分支预留），**不吞错**
- **取消**：AbortSignal 透传（React Query 卸载自动中止请求）

### 5.5 并发原语 lockGate

`src/utils/lockGate.ts` 提供**拿锁 + 等锁队列 + 限流消费**的通用机制：

- `createLockGate({ critical, maxConcurrency })`：首个调用触发临界区（仅一次），其余进入等锁队列；临界区完成后按并发上限消费
- 每个等待者可独立取消（AbortSignal）；critical 失败则全部 reject
- 典型用途：无感刷新（critical=刷新、task=带新 token 重试）、并发预热、单飞数据加载等

### 5.6 构建与部署

- 编译目标 ESNext；`mode=production` 时加载 `plugin-legacy`，旧浏览器输出 legacy 包
- `base` 自适应嵌套子路径：从 `process.env.BASE_URL` 读取并规范化（保证以 `/` 开头、结尾）
- 开发代理示例（默认注释）在 `vite.config.ts` 的 `server.proxy`

### 5.7 路由守卫

`src/router/guards.ts` 提供**守卫骨架** `requireAuth`（loader + redirect 模式），为需鉴权的路由预留"鉴权分支"：

- 用法：受保护路由配 `loader: requireAuth`；未授权时 `throw redirect('/login')`
- 与拦截器同理，**只保留逻辑分支，不写具体鉴权逻辑**（token / 登录态 / 权限判断由业务补全）
- 未接入鉴权时骨架放行（`return null`），不阻塞开发

### 5.8 页面标题

`src/router/pageTitle.ts` 提供 `usePageTitle(title?)`：`useEffect` 同步 `document.title`（内部 → 外部系统），标题后缀自动带应用名。页面组件调用即生效。

### 5.9 404 兜底

`routes.tsx` 已配 catch-all 路由（`{ path: '*', element: <NotFoundView /> }`，根路由兄弟）：未匹配路径渲染极简 404 页（`src/pages/NotFoundView.tsx`），开发人员可按风格替换或品牌化。

## 6. 设计决策记录（ADR）

### ADR-1：为什么 ESNext + legacy 而非直接设置 build.target？

统一 `target: ESNext` 保证源码与现代浏览器的原生能力一致；旧浏览器兼容**只**由生产构建的 legacy 插件承担，开发环境零构建开销，也无需维护一份旧语法产物。

### ADR-2：为什么 apiPath 注册表 + requestEndpoint 而非 http.get/post 便捷方法？

端点集中登记带来三件事：路径 / 方法 / 鉴权标记一处维护、出入参 DTO 类型自动推导、`authRequired` 自动注入。便捷方法会分散端点信息、丢失类型关联，业务膨胀后难以维护。

### ADR-3：为什么响应拦截器不吞错？

错误是页面关心的事：全局拦截器只做跨页面副作用（超时提示 / 无感刷新 / 权限跳转），错误一律 reject 交给 React Query，由页面组件经 `isError` 自行展示。拦截器吞错会让错误无处体现、排查困难。

### ADR-4：为什么 lockGate 是通用原语而非无感刷新专用？

无感刷新只是"拿锁 + 等锁 + 限流"的一个用例。本项目提供通用原语，具体业务（刷新、预热、单飞）由业务层自行组装，避免把 token 概念与基础代码耦合。

### ADR-5：为什么不预设品牌化视觉成品（但保留极简骨架）？

架构的价值在**机制 + 接口契约 + 文档示例**，而非替业务做视觉决策：

- **品牌化视觉成品注定被替换**：每个项目都有自己的风格 / 品牌 / 目标用户，预置任何组件样式（加载、错误、页头）都会以高概率被替换，预置即维护负担
- **演示业务注定被删除**：演示业务（页面 / 接口 / store）在正式业务中没有引用、必然被删除，预置即"延迟暴露的坑"
- **避免名义锚定**：源码里只要存在默认实现，AI agent 与开发者就会默认沿用而非按项目风格生成，抑制风格沉淀

因此架构只保留**机制**（HTTP 层、数据流、错误兜底接线、并发原语）与**文档示例**（视觉组件的接口形状 + 参考实现），UI 风格由开发人员自行建立，沉淀后按风格族蒸馏成组件库。

**例外——极简无样式骨架**：布局壳（`RootLayout`）、首页占位（`HomeView`）、404 页（`NotFoundView`）提供**单行文本 / 结构 div 级**的无样式骨架（无导航、无品牌、无 CSS）。它们承载的是"可运行结构"而非视觉风格：复用成本几乎为零（最多改一行内容），并避免项目初始化后白屏 / 缺 404 兜底。

## 7. 给 AI Agent 的架构要点

读架构文档时重点关注：

- 三层隔离边界（`config/` 工具链不可被业务 import）
- 数据流单向性（服务端数据只走 hooks → api，不进 store）
- 类型只进 `.d.ts`（共享放 `src/types/`，模块私有放模块内 `types/`）
- 新增接口必须走 `apiPath` 注册 + `requestEndpoint`，不新写裸 axios
- 路由守卫用 `requireAuth` 骨架（`loader` + `redirect`），鉴权判断由业务补全，不写死具体凭证逻辑
- 视觉组件 / 页面 / 错误页一律**按项目风格自行实现**，参照开发文档的契约与示例
- 错误分两层：预期内数据错误走 `isError` 自实现展示，渲染崩溃由 React Router `errorElement` 兜底，不新增第三种机制

## 8. 快速定位指南

| 想做什么 | 动哪里 |
|---|---|
| 加一个页面 / 路由 | `src/pages/` 建目录 + `src/router/routes.tsx` 注册 |
| 加一个服务端接口 | `src/types/` 定义 DTO → `src/api/apiPath.ts` 登记 → api 层包装 → hooks 层 useQuery |
| 加一个 store | `src/store/`（业务自建，Zustand） |
| 加一个运行时配置项 | `.env` 加 `VITE_APP_CONFIG_*` + 代码 `getAppConfigValue()` 读取 + `public/config.js` 覆盖 |
| 加一个通用组件 | `src/components/`（业务自建） |
| 文件下载 / 上传 | `src/api/download.ts` / `upload.ts` |
| 页面标题 | `usePageTitle(title)` |
| 路由鉴权 | 受保护路由配 `loader: requireAuth` |
| 改样式变量 / reset | `src/assets/styles/{variables,reset}.css` |
| 改构建 / 工具链配置 | `vite.config.ts` / `config/` |
| 改 HTTP 逻辑（拦截器 / 解包） | `src/api/http.ts` |
| 表单校验 | `src/utils/validation.ts` |
| 改并发原语 | `src/utils/lockGate.ts` |
