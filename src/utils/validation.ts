/** 邮箱格式校验 */
export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/** 必填校验：字符串去空格后非空；其他值非 null / undefined 即通过 */
export function isRequired(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0
  return value !== null && value !== undefined
}
