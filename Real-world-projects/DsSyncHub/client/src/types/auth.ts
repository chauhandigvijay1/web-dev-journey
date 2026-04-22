export type AuthUser = {
  id: string
  fullName: string
  username: string
  email: string
  phone: string | null
  role: 'user' | 'admin'
  provider: 'local' | 'google'
  avatarUrl: string
  emailVerified: boolean
  bio?: string
  timezone?: string
  backupEmail?: string
  appearance?: {
    theme: 'light' | 'dark' | 'system'
    accentColor: string
    compactMode: boolean
  }
}

export type AuthResponse = {
  success: boolean
  message: string
  user: AuthUser
}

export type PasswordResetRequestResponse = {
  success: boolean
  message: string
}

export type PasswordResetResponse = {
  success: boolean
  message: string
}
