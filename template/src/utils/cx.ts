import type { ClassValue } from './types/cx'

/** 合并 className（零依赖替代 clsx）：过滤假值并拼接 */
export function cx(...args: Array<ClassValue | ClassValue[]>): string {
  const flat = args.flat()
  return flat
    .filter((value): value is string | number => typeof value === 'string' || typeof value === 'number')
    .map(String)
    .join(' ')
    .trim()
}
