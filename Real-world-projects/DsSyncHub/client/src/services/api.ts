import axios from 'axios'

export const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 15000,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.response = { 
        data: { message: 'Network error or backend is unreachable.' },
        status: 503
      }
    }
    return Promise.reject(error)
  },
)
