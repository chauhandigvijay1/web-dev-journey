import { api } from './api'
import type {
  AuthResponse,
  PasswordResetRequestResponse,
  PasswordResetResponse,
} from '../types/auth'

type RegisterPayload = {
  fullName: string
  username: string
  email: string
  phone?: string
  password: string
  confirmPassword: string
}

type LoginPayload = {
  identifier: string
  password: string
  rememberMe?: boolean
}

type GoogleLoginPayload = {
  idToken: string
}

export const authApi = {
  register: async (payload: RegisterPayload) => {
    const response = await api.post<AuthResponse>('/auth/register', payload)
    return response.data
  },
  login: async (payload: LoginPayload) => {
    const response = await api.post<AuthResponse>('/auth/login', payload)
    return response.data
  },
  logout: async () => {
    const response = await api.post<{ success: boolean; message: string }>('/auth/logout')
    return response.data
  },
  getMe: async () => {
    const response = await api.get<{ success: boolean; user: AuthResponse['user'] }>('/auth/me')
    return response.data
  },
  googleLogin: async (payload: GoogleLoginPayload) => {
    const response = await api.post<AuthResponse>('/auth/google', payload)
    return response.data
  },
  requestPasswordReset: async (payload: { email: string }) => {
    const response = await api.post<PasswordResetRequestResponse>('/auth/forgot-password', payload)
    return response.data
  },
  resetPassword: async (payload: { token: string; password: string; confirmPassword: string }) => {
    const response = await api.post<PasswordResetResponse>('/auth/reset-password', payload)
    return response.data
  },
}
