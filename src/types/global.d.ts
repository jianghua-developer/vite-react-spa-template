import type { AppConfig } from './app-config'

declare global {
  interface Window {
    /** 运行时可覆盖的应用配置（AppConfig 类型见 ./app-config） */
    __APP_CONFIG__?: AppConfig
  }
}

export {}
