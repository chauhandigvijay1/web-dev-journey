import { describe, expect, it } from 'vitest'
import { getApiErrorCode, getApiErrorMessage } from './errors'

describe('errors utils', () => {
  it('returns error.message for native errors', () => {
    expect(getApiErrorMessage(new Error('boom'))).toBe('boom')
  })

  it('returns fallback for unknown errors', () => {
    expect(getApiErrorMessage({ nope: true }, 'fallback')).toBe('fallback')
  })

  it('returns null code for non axios errors', () => {
    expect(getApiErrorCode(new Error('no-code'))).toBeNull()
  })
})
