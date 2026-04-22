import { apiBaseUrl } from '../services/api'

export const resolveAssetUrl = (value?: string | null) => {
  if (!value) {
    return ''
  }

  if (/^(?:https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value
  }

  const baseUrl = apiBaseUrl.replace(/\/api$/, '')
  return `${baseUrl}${value.startsWith('/') ? '' : '/'}${value}`
}
