import { describe, expect, it } from 'vitest'
import { cx } from '@/utils/cx'

describe('cx', () => {
  it('合并字符串与数字', () => {
    expect(cx('a', 1)).toBe('a 1')
  })

  it('过滤假值与嵌套数组', () => {
    expect(cx('a', false, null, undefined, ['b', 2, ''])).toBe('a b 2')
  })

  it('空参返回空串', () => {
    expect(cx()).toBe('')
  })
})
