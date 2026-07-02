export type SubscriptionPlan = 'free' | 'pro_monthly' | 'pro_yearly'
export type SubscriptionStatus = 'active' | 'trialing' | 'cancelled' | 'expired' | 'pending'
export type CouponType = 'percentage' | 'free_trial' | 'owner'

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
    couponCode?: string | null
    couponType?: string | null
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
  activeCoupon?: {
    code: string
    type: string
    benefitExpiresAt: string
  } | null
}

export type BillingHistoryItem = {
  id: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed'
  invoiceUrl: string
  billedAt: string
}

export type CouponResult = {
  success: boolean
  message: string
  subscription?: BillingCurrent['subscription']
  requiresCheckout?: boolean
  discountedPlan?: SubscriptionPlan
}

export type CouponInfo = {
  code: string
  type: CouponType
  value: number
  durationMonths: number
  description: string
  applicablePlans: SubscriptionPlan[]
}

export type BillingConfig = {
  success: boolean
  currency: string
  razorpayConfigured: boolean
  hasRazorpayKeyId: boolean
  hasRazorpayKeySecret: boolean
  hasOwnerCoupon: boolean
  provider: 'razorpay' | 'none'
  coupons: CouponInfo[]
}
