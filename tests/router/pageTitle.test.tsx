import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { usePageTitle } from '@/router'
import { APP_NAME } from '@/config'

describe('usePageTitle（页面标题）', () => {
  it('设置 document.title（带应用名后缀）', () => {
    renderHook(() => usePageTitle('列表页'))
    expect(document.title).toBe(`列表页 | ${APP_NAME}`)
  })

  it('title 变化时更新', () => {
    const { rerender } = renderHook(({ t }: { t?: string }) => usePageTitle(t), {
      initialProps: { t: '详情' },
    })
    expect(document.title).toBe(`详情 | ${APP_NAME}`)

    rerender({ t: '编辑' })
    expect(document.title).toBe(`编辑 | ${APP_NAME}`)
  })

  it('不传 title 时重置为应用名', () => {
    const { rerender } = renderHook<ReturnType<typeof usePageTitle>, { t?: string }>(
      ({ t }) => usePageTitle(t),
      { initialProps: { t: '详情' } },
    )
    rerender({ t: undefined })
    expect(document.title).toBe(APP_NAME)
  })
})
