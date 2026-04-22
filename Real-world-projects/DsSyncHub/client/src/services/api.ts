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
    return Promise.reject(error)
  },
)
