/// <reference types="vite/client" />

// 应用级运行配置统一走 VITE_APP_CONFIG_* 前缀，由 vite 插件挂载到 window.__APP_CONFIG__，
// 经 getAppConfigValue() 读取（见 src/config/appConfig.ts），无需在此声明 ImportMetaEnv 具体键。
