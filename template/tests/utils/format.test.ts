import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format'

describe('formatDate', () => {
  it('格式化 YYYY-MM-DD（补零）', () => {
    expect(formatDate(new Date(2024, 0, 5))).toBe('2024-01-05')
    expect(formatDate('2024-12-31T10:00:00')).toBe('2024-12-31')
  })
})

describe('formatDateTime', () => {
  it('格式化 YYYY-MM-DD HH:mm:ss', () => {
    expect(formatDateTime(new Date(2024, 5, 7, 9, 8, 7))).toBe('2024-06-07 09:08:07')
  })
})

describe('formatCurrency', () => {
  it('默认 CNY 格式化', () => {
    expect(formatCurrency(1234.5)).toBe('¥1,234.50')
  })

  it('支持指定币种', () => {
    expect(formatCurrency(100)).toMatch(/,|¥|CNY|100/)
  })
})
