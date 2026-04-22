import axios from 'axios'

export const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong.') => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback
  }
  if (error instanceof Error) {
    return error.message
  }
  return fallback
}

export const getApiErrorCode = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.code || null
  }
  return null
}
