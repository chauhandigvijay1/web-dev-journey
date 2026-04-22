import type { AIAction } from '../types/ai'
import { api } from './api'

const postAI = async (endpoint: string, payload: Record<string, unknown>) => {
  const response = await api.post<{ success: boolean; output: string; usage?: { used: number; limit: number } }>(
    `/ai/${endpoint}`,
    payload,
  )
  return response.data
}

export const aiApi = {
  run: (action: AIAction, payload: Record<string, unknown>) => postAI(action, payload),
}
