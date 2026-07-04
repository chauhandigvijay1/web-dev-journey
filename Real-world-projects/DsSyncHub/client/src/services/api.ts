import axios from 'axios'

export const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 15000,
})

const getToken = (): string | null => {
  try {
    return localStorage.getItem('dssync-token')
  } catch {
    return null
  }
}

api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dssync-token')
      localStorage.removeItem('dssync-active-workspace')
      window.location.href = '/login'
      return Promise.reject(error)
    }
    if (!error.response) {
      error.response = { 
        data: { message: 'Network error or backend is unreachable.' },
        status: 503
      }
    }
    return Promise.reject(error)
  },
)
