export type SubscriptionPlan = 'free' | 'pro_monthly' | 'pro_yearly'
export type SubscriptionStatus = 'active' | 'trialing' | 'cancelled' | 'expired' | 'pending'

export type BillingCurrent = {
  subscription: {
    id: string
    workspace: string
    plan: SubscriptionPlan
    status: SubscriptionStatus
    provider: 'razorpay' | 'stripe' | 'manual'
    currentPeriodStart: string
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
  }
  limits: {
    plan: SubscriptionPlan
    workspaceLimit: number
    memberLimit: number
    aiDailyLimit: number
  }
  usage: {
    membersUsed: number
    aiUsed: number
    storageUsedMb: number
    storageLimitMb: number
  }
}

export type BillingHistoryItem = {
  id: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed'
  invoiceUrl: string
  billedAt: string
}
