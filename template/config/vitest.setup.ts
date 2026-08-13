import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// 每个用例后清理 RTL 挂载的 DOM
afterEach(() => {
  cleanup()
})
