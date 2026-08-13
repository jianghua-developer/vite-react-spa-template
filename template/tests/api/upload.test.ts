// @vitest-environment node
// 上传测试需要 node 原生 FormData / File（jsdom 实现与 node 不兼容，append File 会丢失）
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { uploadFile } from '@/api/upload'
import { http } from '@/api/http'

// 完整替换 http 模块：不 importOriginal，避免加载真实 http.ts（其依赖链触达 window，node 环境无 window）
vi.mock('@/api/http', () => ({ http: vi.fn() }))

describe('uploadFile（文件上传）', () => {
  beforeEach(() => {
    vi.mocked(http).mockClear()
    vi.mocked(http).mockResolvedValue('ok')
  })

  it('构建 FormData 并走 http（POST + 默认字段名）', async () => {
    const file = new File(['content'], 'a.txt', { type: 'text/plain' })
    await uploadFile('/files/upload', file)

    expect(http).toHaveBeenCalledWith('/files/upload', expect.objectContaining({ method: 'POST' }))
    const opts = vi.mocked(http).mock.calls[0]![1]!
    expect(opts.method).toBe('POST')
    expect(opts.body).toBeInstanceOf(FormData)
    const fd = opts.body as FormData
    expect(fd.has('file')).toBe(true)
    expect(fd.get('file')).toMatchObject({ name: 'a.txt', size: 7 })
  })

  it('支持自定义字段名 / 进度回调 / 取消信号透传', async () => {
    const file = new File(['x'], 'a.txt', { type: 'text/plain' })
    const onProgress = vi.fn()
    const controller = new AbortController()

    await uploadFile('/files/upload', file, {
      fieldName: 'avatar',
      onProgress,
      signal: controller.signal,
    })

    const opts = vi.mocked(http).mock.calls[0]![1]!
    expect(opts.body).toBeInstanceOf(FormData)
    expect((opts.body as FormData).has('avatar')).toBe(true)
    expect(opts.onUploadProgress).toBe(onProgress)
    expect(opts.signal).toBe(controller.signal)
  })
})
