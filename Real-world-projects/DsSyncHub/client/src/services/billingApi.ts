import type { BillingConfig, BillingCurrent, BillingHistoryItem, CouponResult, SubscriptionPlan } from '../types/billing'
import { api } from './api'

export const billingApi = {
  current: async (workspaceId: string) => {
    const response = await api.get<{ success: boolean; current: BillingCurrent }>('/billing/current', {
      params: { workspace: workspaceId },
    })
    return response.data
  },
  history: async (workspaceId: string) => {
    const response = await api.get<{ success: boolean; history: BillingHistoryItem[] }>('/billing/history', {
      params: { workspace: workspaceId },
    })
    return response.data
  },
  checkout: async (workspaceId: string, plan: SubscriptionPlan, coupon?: string) => {
    const response = await api.post<{
      success: boolean
      checkout: {
        provider: 'razorpay'
        keyId: string
        orderId: string
        amount: number
        currency: string
        workspaceId: string
        plan: SubscriptionPlan
      }
    }>('/billing/checkout', { workspace: workspaceId, plan, ...(coupon ? { coupon } : {}) })
    return response.data
  },
  verifyPayment: async (payload: {
    workspaceId: string
    plan: SubscriptionPlan
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature: string
  }) => {
    const response = await api.post('/billing/verify-payment', {
      workspace: payload.workspaceId,
      plan: payload.plan,
      razorpayOrderId: payload.razorpayOrderId,
      razorpayPaymentId: payload.razorpayPaymentId,
      razorpaySignature: payload.razorpaySignature,
    })
    return response.data
  },
  applyCoupon: async (workspaceId: string, code: string) => {
    const response = await api.post<CouponResult>('/billing/apply-coupon', { workspace: workspaceId, code })
    return response.data
  },
  cancel: async (workspaceId: string) => {
    const response = await api.patch('/billing/cancel', { workspace: workspaceId })
    return response.data
  },
  resume: async (workspaceId: string) => {
    const response = await api.patch('/billing/resume', { workspace: workspaceId })
    return response.data
  },
  config: async () => {
    const response = await api.get<BillingConfig>('/billing/config')
    return response.data
  },
}
