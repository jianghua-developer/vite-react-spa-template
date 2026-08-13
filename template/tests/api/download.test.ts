import { describe, expect, it } from 'vitest'
import { parseFilename } from '@/api/download'

describe('parseFilename（Content-Disposition 文件名解析）', () => {
  it('无 Content-Disposition 时返回 fallback', () => {
    expect(parseFilename(undefined, 'download')).toBe('download')
  })

  it('filename*=（UTF-8 编码）解析并解码', () => {
    expect(parseFilename("attachment; filename*=UTF-8''%E6%96%87%E4%BB%B6.xlsx", 'x')).toBe('文件.xlsx')
  })

  it('filename="普通名" 解析', () => {
    expect(parseFilename('attachment; filename="report.pdf"', 'x')).toBe('report.pdf')
  })

  it('双格式并存时 filename* 优先', () => {
    expect(parseFilename("attachment; filename=\"a.pdf\"; filename*=UTF-8''b.pdf", 'x')).toBe('b.pdf')
  })

  it('无 filename 字段时返回 fallback', () => {
    expect(parseFilename('attachment', 'fallback.txt')).toBe('fallback.txt')
  })
})
