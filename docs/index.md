# {{name}}

{{description}}

> 本文档面向本项目开发人员与 AI 协作代理：**架构文档**说明"为什么这么架构"，**开发文档**说明"怎么做"。

## 技术栈

| 类别 | 选型 |
|---|---|
| 构建 | Vite + TypeScript（编译目标 ESNext，旧浏览器由 legacy 插件在生产构建兜底） |
| 框架 | React |
| 路由 | React Router（声明式嵌套路由） |
| 服务端数据 | TanStack Query（useQuery / useMutation）+ axios |
| 客户端状态 | Zustand |
| 样式 | CSS Modules + 全局样式三件套 |
| 测试 / 质量 | Vitest + ESLint（flat config） |
| 包管理 | pnpm |

## 快速开始

```bash
pnpm install
pnpm dev          # 开发服务器
pnpm build        # 类型检查 + 生产构建（含 legacy 包）
pnpm preview      # 预览生产构建
```

> 本项目提供**机制 + 契约 + 文档示例**：页面 / 组件 / 视觉样式由业务自行建立（目录已留 `.gitkeep` 占位），复制后即可从开发文档起步。

## 文档导航

- [架构文档](./architecture.md) —— 项目分层、目录职责、核心机制与设计决策
- [开发文档](./development.md) —— 日常开发操作手册：新增页面 / 接口 / store / 配置、约定与测试

## 关键路径速查

| 路径 | 职责 |
|---|---|
| `config/` | 工具链配置（tsconfig / eslint / vitest / postcss / vite 插件） |
| `src/api/` | HTTP 层：axios 封装、`apiPath` 端点注册表（空，按业务登记）、DTO ↔ 领域映射 |
| `src/hooks/` | React Query 数据 hooks（服务端数据唯一入口，业务自建） |
| `src/pages/` / `src/components/` | UI 层（页面 / 通用组件，业务自建） |
| `src/store/` | Zustand 纯客户端状态（业务自建） |
| `src/types/` | 全局共享类型（DTO / 领域 / 枚举 / 响应包络） |
| `src/assets/styles/` | 全局样式（reset / variables / main） |
| `src/router/` | 路由声明（当前为极简占位骨架，业务页面替换） |
| `tests/` | 测试（镜像 `src/` 结构） |
| `public/` | 静态资源 + `config.js`（运行时配置免打包覆盖） |
