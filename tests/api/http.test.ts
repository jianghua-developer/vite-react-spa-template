import { describe, expect, it } from 'vitest'
import { ApiError, unwrapEnvelope } from '@/api/http'
import { API_SUCCESS_CODE } from '@/config'

describe('unwrapEnvelope', () => {
  it('成功码返回业务 data', () => {
    expect(unwrapEnvelope({ code: API_SUCCESS_CODE, data: { id: '1' }, msg: 'ok' }, 200)).toEqual({ id: '1' })
  })

  it('业务失败抛 ApiError（含 code / msg）', () => {
    let caught: unknown
    try {
      unwrapEnvelope({ code: '1001', data: null, msg: '参数错误' }, 200)
    } catch (error) {
      caught = error
    }
    expect(caught).toBeInstanceOf(ApiError)
    if (caught instanceof ApiError) {
      expect(caught.code).toBe('1001')
      expect(caught.message).toBe('参数错误')
    }
  })

  it('非包络数据原样返回', () => {
    expect(unwrapEnvelope('plain', 200)).toBe('plain')
    expect(unwrapEnvelope({ list: [1, 2] }, 200)).toEqual({ list: [1, 2] })
  })
})
