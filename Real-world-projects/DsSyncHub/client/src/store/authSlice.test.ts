import { describe, expect, it } from 'vitest'
import authReducer, { clearCredentials, setCredentials } from './authSlice'

describe('authSlice reducer', () => {
  it('sets credentials and authenticates user', () => {
    const state = authReducer(undefined, setCredentials({
      id: 'u1',
      fullName: 'Test User',
      username: 'test',
      email: 'test@example.com',
      phone: null,
      role: 'user',
      provider: 'local',
      avatarUrl: '',
      emailVerified: false,
    }))

    expect(state.isAuthenticated).toBe(true)
    expect(state.user?.email).toBe('test@example.com')
  })

  it('clears credentials on logout', () => {
    const authenticated = authReducer(undefined, setCredentials({
      id: 'u1',
      fullName: 'Test User',
      username: 'test',
      email: 'test@example.com',
      phone: null,
      role: 'user',
      provider: 'local',
      avatarUrl: '',
      emailVerified: false,
    }))
    const cleared = authReducer(authenticated, clearCredentials())

    expect(cleared.isAuthenticated).toBe(false)
    expect(cleared.user).toBeNull()
  })
})
