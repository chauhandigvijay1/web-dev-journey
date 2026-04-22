import type { AuthUser } from '../types/auth'
import { api } from './api'

export const userApi = {
  me: async () => {
    const response = await api.get<{ success: boolean; user: AuthUser }>('/users/me')
    return response.data
  },
  updateProfile: async (payload: Partial<AuthUser>) => {
    const response = await api.patch<{ success: boolean; user: AuthUser }>('/users/profile', payload)
    return response.data
  },
  updateAccount: async (payload: { email?: string; phone?: string; backupEmail?: string }) => {
    const response = await api.patch<{ success: boolean; user: AuthUser }>('/users/account', payload)
    return response.data
  },
  updatePassword: async (payload: { currentPassword: string; newPassword: string }) => {
    const response = await api.patch<{ success: boolean; message: string; forceLogout?: boolean }>(
      '/users/security/password',
      payload,
    )
    return response.data
  },
  updateAppearance: async (payload: {
    theme: 'light' | 'dark' | 'system'
    accentColor: string
    compactMode: boolean
  }) => {
    const response = await api.patch<{ success: boolean; appearance: AuthUser['appearance'] }>(
      '/users/appearance',
      payload,
    )
    return response.data
  },
  logoutAll: async () => {
    const response = await api.post<{ success: boolean; message: string }>('/users/logout-all')
    return response.data
  },
}
