import type { Plugin } from 'vite'

const PREFIX = 'VITE_APP_CONFIG_'

/** 从当前 mode 加载的 env 中收集 VITE_APP_CONFIG_* 变量，剥离前缀 */
function collectAppConfig(env: Record<string, unknown>): Record<string, unknown> {
  const config: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith(PREFIX)) {
      config[key.slice(PREFIX.length)] = value
    }
  }
  return config
}

/**
 * 把当前 mode 的 VITE_APP_CONFIG_* 环境变量内联到 window.__APP_CONFIG__。
 *
 * dev 与 build 均生效：Vite 按 mode 合并 `.env` + `.env.{mode}`（`.env.{mode}` 优先）。
 * 内联脚本经 transformIndexHtml 注入 head 最前，先于 public/config.js 执行，
 * 后者可用 Object.assign 合并运维覆盖（无需重新打包）。
 */
export function appConfigPlugin(): Plugin {
  let appConfig: Record<string, unknown> = {}

  return {
    name: 'vite-app-config',
    configResolved(config) {
      appConfig = collectAppConfig(config.env)
    },
    transformIndexHtml() {
      if (Object.keys(appConfig).length === 0) return []
      // 转义 `<` 防止值内容意外闭合 script 标签
      const code = `window.__APP_CONFIG__=${JSON.stringify(appConfig).replace(/</g, '\\u003c')}`
      return [
        {
          tag: 'script',
          children: code,
          injectTo: 'head-prepend',
        },
      ]
    },
  }
}
