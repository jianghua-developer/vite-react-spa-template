import { fileURLToPath, URL } from 'node:url'
import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { appConfigPlugin } from './config/plugin/appConfigPlugin'

/**
 * 规范化部署子路径：确保以 `/` 开头、以 `/` 结尾。
 * 防止 BASE_URL 配置成 `/app`（缺结尾 `/`）或 `app/`（缺开头 `/`）导致资源路径错误。
 */
function normalizeBaseUrl(raw: string | undefined): string {
  const value = (raw ?? '').trim()
  if (!value) return '/'
  const withLeading = value.startsWith('/') ? value : `/${value}`
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`
}

export default defineConfig(({ mode }) => ({
  base: normalizeBaseUrl(process.env.BASE_URL),
  plugins: [
    react(),
    appConfigPlugin(),
    // 仅生产构建加载 legacy：现代/旧浏览器分别输出（plugin-legacy 接管 build.target），dev 无构建开销
    ...(mode === 'production' ? [legacy({ targets: ['defaults', 'not IE 11'] })] : []),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    // PostCSS 配置统一收纳在 config/，显式指定（PostCSS 默认只从根目录自动发现）
    postcss: './config/postcss.config.mjs',
  },
  server: {
    proxy: {
      // 开发环境代理示例：接口与前端分离部署时启用
      // '/api': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
}))

