import { describe, expect, it } from 'vitest'
import { isEmail, isRequired } from '@/utils/validation'

describe('isEmail', () => {
  it('合法邮箱通过', () => {
    expect(isEmail('a@b.com')).toBe(true)
    expect(isEmail('user.name+tag@example.co')).toBe(true)
  })

  it('非法邮箱拒绝', () => {
    expect(isEmail('not-an-email')).toBe(false)
    expect(isEmail('a@b')).toBe(false)
    expect(isEmail('@b.com')).toBe(false)
    expect(isEmail('a@b.')).toBe(false)
  })
})

describe('isRequired', () => {
  it('字符串去空格后判断非空', () => {
    expect(isRequired(' x ')).toBe(true)
    expect(isRequired('   ')).toBe(false)
    expect(isRequired('')).toBe(false)
  })

  it('非字符串：非 null / undefined 即通过', () => {
    expect(isRequired(0)).toBe(true)
    expect(isRequired(false)).toBe(true)
    expect(isRequired(null)).toBe(false)
    expect(isRequired(undefined)).toBe(false)
  })
})
