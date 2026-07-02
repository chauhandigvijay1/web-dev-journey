import { useEffect, useState } from 'react'
import StorageUsageBar from '../../components/common/StorageUsageBar'
import WorkspaceRequiredState from '../../components/common/WorkspaceRequiredState'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import {
  cancelBillingThunk,
  fetchBillingCurrentThunk,
  fetchBillingHistoryThunk,
  resumeBillingThunk,
} from '../../store/billingSlice'
import { pushToast } from '../../store/toastSlice'
import type { BillingConfig, SubscriptionPlan } from '../../types/billing'
import { getApiErrorMessage } from '../../utils/errors'
import { billingApi } from '../../services/billingApi'

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void
    }
  }
}

const loadRazorpayScript = async () =>
  new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

const appName = import.meta.env.VITE_APP_NAME || 'DsSync Hub'

const PLAN_FEATURES: { key: SubscriptionPlan; title: string; price: string; features: { label: string; free: boolean | string; pro: boolean | string }[] }[] = [
  {
    key: 'free',
    title: 'Free',
    price: '₹0',
    features: [
      { label: 'Workspaces', free: '1', pro: 'Unlimited' },
      { label: 'Members per workspace', free: '3', pro: 'Unlimited' },
      { label: 'Storage', free: '512 MB', pro: '25 GB' },
      { label: 'AI queries / day', free: '10', pro: '500' },
      { label: 'File upload max size', free: '5 MB', pro: '100 MB' },
      { label: 'Channels', free: 'Basic', pro: 'Advanced' },
      { label: 'Priority support', free: '—', pro: 'Email & Priority' },
      { label: 'Custom branding', free: '—', pro: '✓' },
      { label: 'API access', free: '—', pro: '✓' },
    ],
  },
  {
    key: 'pro_monthly',
    title: 'Pro Monthly',
    price: '₹999/mo',
    features: [
      { label: 'Workspaces', free: '1', pro: 'Unlimited' },
      { label: 'Members per workspace', free: '3', pro: 'Unlimited' },
      { label: 'Storage', free: '512 MB', pro: '10 GB' },
      { label: 'AI queries / day', free: '10', pro: '300' },
      { label: 'File upload max size', free: '5 MB', pro: '50 MB' },
      { label: 'Channels', free: 'Basic', pro: 'Advanced' },
      { label: 'Priority support', free: '—', pro: 'Email' },
      { label: 'Custom branding', free: '—', pro: '✓' },
      { label: 'API access', free: '—', pro: '✓' },
    ],
  },
  {
    key: 'pro_yearly',
    title: 'Pro Yearly',
    price: '₹9,999/yr',
    features: [
      { label: 'Workspaces', free: '1', pro: 'Unlimited' },
      { label: 'Members per workspace', free: '3', pro: 'Unlimited' },
      { label: 'Storage', free: '512 MB', pro: '25 GB' },
      { label: 'AI queries / day', free: '10', pro: '500' },
      { label: 'File upload max size', free: '5 MB', pro: '100 MB' },
      { label: 'Channels', free: 'Basic', pro: 'Advanced' },
      { label: 'Priority support', free: '—', pro: 'Priority' },
      { label: 'Custom branding', free: '—', pro: '✓' },
      { label: 'API access', free: '—', pro: '✓' },
    ],
  },
]

const BillingPage = () => {
  const dispatch = useAppDispatch()
  const { activeWorkspaceId, items: workspaces } = useAppSelector((state) => state.workspace)
  const { current, history, loading } = useAppSelector((state) => state.billing)
  const [checkoutPlan, setCheckoutPlan] = useState<SubscriptionPlan | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [billingConfig, setBillingConfig] = useState<BillingConfig | null>(null)

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId)
  const userRole = activeWorkspace?.role
  const canManageBilling = userRole === 'owner' || userRole === 'admin'
  const isOnProPlan = current && current.subscription.plan !== 'free'
  const isCancelled = current?.subscription.status === 'cancelled'

  useEffect(() => {
    if (!activeWorkspaceId) return
    dispatch(fetchBillingCurrentThunk(activeWorkspaceId))
    dispatch(fetchBillingHistoryThunk(activeWorkspaceId))
    billingApi.config().then(setBillingConfig).catch(() => {})
  }, [dispatch, activeWorkspaceId])

  if (!activeWorkspaceId) {
    return <WorkspaceRequiredState description="Billing and storage usage are tracked per workspace plan, so select a workspace before reviewing subscription details." />
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !activeWorkspaceId) return
    setApplyingCoupon(true)
    try {
      const result = await billingApi.applyCoupon(activeWorkspaceId, couponCode.trim())
      if (result.success) {
        setCouponApplied(true)
        dispatch(pushToast({ title: 'Coupon applied', description: result.message, tone: 'success' }))
        dispatch(fetchBillingCurrentThunk(activeWorkspaceId))
      }
    } catch (error) {
      dispatch(pushToast({ title: 'Coupon failed', description: getApiErrorMessage(error, 'Invalid coupon code.'), tone: 'error' }))
    } finally {
      setApplyingCoupon(false)
    }
  }

  const handleCheckout = async (plan: SubscriptionPlan) => {
    if (!activeWorkspaceId || plan === 'free') return
    setCheckoutPlan(plan)
    try {
      const scriptReady = await loadRazorpayScript()
      if (!scriptReady || !window.Razorpay) {
        throw new Error('Razorpay checkout failed to load.')
      }

      const checkoutResponse = await billingApi.checkout(activeWorkspaceId, plan, couponApplied ? couponCode.trim() : undefined)
      const checkout = checkoutResponse.checkout

      const razorpay = new window.Razorpay({
        key: checkout.keyId,
        amount: checkout.amount,
        currency: checkout.currency,
        name: appName,
        description: plan === 'pro_yearly' ? 'Pro Yearly Plan' : 'Pro Monthly Plan',
        order_id: checkout.orderId,
        handler: async (paymentResponse: Record<string, string>) => {
          await billingApi.verifyPayment({
            workspaceId: activeWorkspaceId,
            plan,
            razorpayOrderId: paymentResponse.razorpay_order_id,
            razorpayPaymentId: paymentResponse.razorpay_payment_id,
            razorpaySignature: paymentResponse.razorpay_signature,
          })
          await dispatch(fetchBillingCurrentThunk(activeWorkspaceId))
          await dispatch(fetchBillingHistoryThunk(activeWorkspaceId))
          dispatch(
            pushToast({
              title: 'Subscription updated',
              description: 'Payment completed and your plan is now active.',
              tone: 'success',
            }),
          )
        },
      })
      razorpay.open()
    } catch (error) {
      dispatch(
        pushToast({
          title: 'Checkout failed',
          description: getApiErrorMessage(error, 'Unable to start checkout right now.'),
          tone: 'error',
        }),
      )
    } finally {
      setCheckoutPlan(null)
    }
  }

  return (
    <section className="space-y-4 pb-5">
      {!canManageBilling && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
          Only workspace admins and owners can manage billing and apply coupons.
          Contact your workspace owner to upgrade the plan.
        </div>
      )}

      <article className="rounded-2xl border border-white/10 glass-panel p-5">
        <h1 className="text-2xl font-semibold">Billing</h1>
        {loading || !current ? (
          <p className="mt-2 text-sm text-zinc-500">Loading billing details...</p>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 p-3 dark:border-zinc-700">
              <p className="text-sm text-zinc-500">Current plan</p>
              <p className="text-lg font-semibold capitalize">{current.subscription.plan.replace('_', ' ')}</p>
              <p className="text-xs text-zinc-500">
                Status:{' '}
                <span className={`${current.subscription.status === 'active' ? 'text-emerald-400' : current.subscription.status === 'cancelled' ? 'text-rose-400' : 'text-zinc-400'}`}>
                  {current.subscription.status}
                </span>
              </p>
              <p className="text-xs text-zinc-500">
                {isOnProPlan
                  ? `Renews: ${new Date(current.subscription.currentPeriodEnd).toLocaleDateString()}`
                  : 'No renewal needed'}
              </p>
              {canManageBilling && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {isOnProPlan && !isCancelled && (
                    <button className="rounded-xl border border-white/10 px-3 py-2 text-xs dark:border-zinc-700 disabled:opacity-60" disabled={loading} onClick={() => activeWorkspaceId && dispatch(cancelBillingThunk(activeWorkspaceId))} type="button">Cancel Plan</button>
                  )}
                  {isCancelled && (
                    <button className="rounded-xl border border-white/10 px-3 py-2 text-xs dark:border-zinc-700 disabled:opacity-60" disabled={loading} onClick={() => activeWorkspaceId && dispatch(resumeBillingThunk(activeWorkspaceId))} type="button">Resume Plan</button>
                  )}
                  {!isOnProPlan && billingConfig?.razorpayConfigured && (
                    <button className="rounded-xl bg-brand-500 px-3 py-2 text-xs text-white disabled:opacity-60" disabled={checkoutPlan !== null} onClick={() => handleCheckout('pro_monthly')} type="button">Upgrade to Pro</button>
                  )}
                  {!isOnProPlan && !billingConfig?.razorpayConfigured && (
                    <span className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">Razorpay not configured</span>
                  )}
                </div>
              )}
            </div>
            <div className="rounded-xl border border-white/10 p-3 dark:border-zinc-700">
              <p className="text-sm text-zinc-500">Usage</p>
              <p className="text-sm">
                Members: {current.usage.membersUsed}
                {current.limits.memberLimit < Number.POSITIVE_INFINITY && (
                  <span className="text-xs text-zinc-500"> / {current.limits.memberLimit}</span>
                )}
              </p>
              <p className="text-sm">
                AI used today: {current.usage.aiUsed}
                <span className="text-xs text-zinc-500"> / {current.limits.aiDailyLimit}</span>
              </p>
              <p className="text-sm">
                Storage: {current.usage.storageUsedMb.toFixed(1)}MB
                <span className="text-xs text-zinc-500"> / {current.usage.storageLimitMb}MB</span>
              </p>
            </div>
            {canManageBilling && (
              <div className="rounded-xl border border-amber-500/30 p-3 dark:border-zinc-700">
                <p className="text-sm text-zinc-500">Coupon code</p>
                <div className="mt-2 flex gap-2">
                  <input
                    className="flex-1 rounded-lg border border-white/10 bg-transparent px-3 py-2 text-xs outline-none focus:border-brand-500 dark:border-zinc-700"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); setCouponApplied(false) }}
                    disabled={applyingCoupon}
                  />
                  <button
                    className="rounded-lg bg-brand-500 px-3 py-2 text-xs text-white disabled:opacity-60"
                    disabled={applyingCoupon || !couponCode.trim() || couponApplied}
                    onClick={handleApplyCoupon}
                    type="button"
                  >
                    {applyingCoupon ? 'Applying...' : couponApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>
                {couponApplied && <p className="mt-1 text-xs text-emerald-400">Coupon applied successfully!</p>}
              </div>
            )}
          </div>
        )}
      </article>

      {current && (
        <StorageUsageBar
          usage={{
            usedMb: current.usage.storageUsedMb,
            limitMb: current.usage.storageLimitMb,
            percentUsed: Math.min(100, Math.round((current.usage.storageUsedMb / current.usage.storageLimitMb) * 100)),
          }}
        />
      )}

      <article className="rounded-2xl border border-white/10 glass-panel p-5">
        <h2 className="mb-4 text-lg font-semibold">Compare plans</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-3 font-medium text-zinc-400">Feature</th>
                {PLAN_FEATURES.map((plan) => (
                  <th key={plan.key} className="p-3 text-center font-semibold">
                    {plan.title}
                    <p className="text-xs font-normal text-zinc-500">{plan.price}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PLAN_FEATURES[0].features.map((feature) => (
                <tr key={feature.label} className="border-b border-white/5">
                  <td className="p-3 text-zinc-300">{feature.label}</td>
                  {PLAN_FEATURES.map((plan) => {
                    const isPro = plan.key !== 'free'
                    const value = isPro ? feature.pro : feature.free
                    return (
                      <td key={plan.key} className="p-3 text-center text-zinc-400">
                        {value === '✓' ? (
                          <span className="text-emerald-400">✓</span>
                        ) : value === '—' ? (
                          <span className="text-zinc-600">—</span>
                        ) : (
                          value
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
              <tr>
                <td className="p-3" />
                {PLAN_FEATURES.map((plan) => (
                  <td key={plan.key} className="p-3 text-center">
                    <button
                      className="rounded-lg border border-white/10 px-4 py-2 text-xs dark:border-zinc-700 disabled:opacity-60"
                      disabled={checkoutPlan === plan.key || (!canManageBilling && plan.key !== 'free') || (plan.key !== 'free' && !billingConfig?.razorpayConfigured)}
                      onClick={() => plan.key !== 'free' && handleCheckout(plan.key as 'pro_monthly' | 'pro_yearly')}
                      type="button"
                    >
                      {current?.subscription.plan === plan.key
                        ? 'Current Plan'
                        : plan.key === 'free'
                          ? 'Free'
                          : !billingConfig?.razorpayConfigured
                            ? 'Payment not configured'
                            : 'Choose Plan'}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <article className="rounded-2xl border border-white/10 glass-panel p-5">
        <h2 className="text-lg font-semibold">Billing History</h2>
        <div className="mt-3 space-y-2">
          {!history.length ? (
            <p className="text-sm text-zinc-500">No invoices yet.</p>
          ) : (
            history.map((item) => (
              <div className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-sm dark:border-zinc-700" key={item.id}>
                <span>{new Date(item.billedAt).toLocaleDateString()}</span>
                <span>{item.currency} {item.amount}</span>
                <span className="capitalize">{item.status}</span>
                <button className="text-xs text-brand-500" type="button">Download</button>
              </div>
            ))
          )}
        </div>
      </article>
    </section>
  )
}

export default BillingPage