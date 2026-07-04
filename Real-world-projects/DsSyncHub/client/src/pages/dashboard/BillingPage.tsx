import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle, Clock, Copy, CreditCard, Gift, Ticket, XCircle } from 'lucide-react'
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
import { formatPrice } from '../../utils/currency'
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

const BillingPage = () => {
  const dispatch = useAppDispatch()
  const { activeWorkspaceId, items: workspaces } = useAppSelector((state) => state.workspace)
  const { current, history, loading } = useAppSelector((state) => state.billing)
  const [checkoutPlan, setCheckoutPlan] = useState<SubscriptionPlan | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [applyResult, setApplyResult] = useState<{ success: boolean; message: string; requiresCheckout?: boolean; discountedPlan?: SubscriptionPlan } | null>(null)
  const [billingConfig, setBillingConfig] = useState<BillingConfig | null>(null)
  const [showCouponGuide, setShowCouponGuide] = useState(false)

  const currency = billingConfig?.currency || 'INR'

  const PLAN_FEATURES = useMemo(() => {
    const fmt = (amount: number, suffix: string) => formatPrice(amount, currency, suffix)
    return [
      {
        key: 'free' as SubscriptionPlan,
        title: 'Free',
        price: fmt(0, ''),
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
        key: 'pro_monthly' as SubscriptionPlan,
        title: 'Pro Monthly',
        price: fmt(999, '/mo'),
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
        key: 'pro_yearly' as SubscriptionPlan,
        title: 'Pro Yearly',
        price: fmt(9999, '/yr'),
        yearlyEquivalent: `≈ ${fmt(833, '/mo')}`,
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
  }, [currency])

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId)
  const userRole = activeWorkspace?.role
  const canManageBilling = userRole === 'owner' || userRole === 'admin'
  const isOnFreePlan = Boolean(current && current.subscription.plan === 'free')
  const isOnProPlan = Boolean(current && current.subscription.plan !== 'free')
  const isCancelled = current?.subscription.status === 'cancelled'
  const isExpired = current?.subscription.status === 'expired'
  const hasActiveCoupon = Boolean(current?.activeCoupon?.code)

  useEffect(() => {
    if (!activeWorkspaceId) return
    dispatch(fetchBillingCurrentThunk(activeWorkspaceId))
    dispatch(fetchBillingHistoryThunk(activeWorkspaceId))
    billingApi.config().then(setBillingConfig).catch(() => {})
  }, [dispatch, activeWorkspaceId])

  const availableCoupons = useMemo(() => {
    if (!billingConfig?.coupons) return []
    return billingConfig.coupons
  }, [billingConfig])

  const handleCopyCode = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      dispatch(pushToast({ title: 'Copied', description: `Coupon code "${code}" copied to clipboard.`, tone: 'success' }))
    } catch {
      dispatch(pushToast({ title: 'Failed to copy', description: 'Could not copy to clipboard.', tone: 'error' }))
    }
  }, [dispatch])

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !activeWorkspaceId) return
    setApplyingCoupon(true)
    setApplyResult(null)
    try {
      const result = await billingApi.applyCoupon(activeWorkspaceId, couponCode.trim())
      setApplyResult({ success: result.success, message: result.message, requiresCheckout: result.requiresCheckout, discountedPlan: result.discountedPlan })
      if (result.success) {
        if (!result.requiresCheckout) {
          dispatch(pushToast({ title: 'Coupon applied', description: result.message, tone: 'success' }))
          dispatch(fetchBillingCurrentThunk(activeWorkspaceId))
        } else {
          dispatch(pushToast({ title: 'Coupon matched', description: 'Proceed with checkout to apply the discount.', tone: 'info' }))
        }
      } else {
        dispatch(pushToast({ title: 'Coupon failed', description: result.message, tone: 'error' }))
      }
    } catch (error) {
      const msg = getApiErrorMessage(error, 'Invalid coupon code.')
      setApplyResult({ success: false, message: msg })
      dispatch(pushToast({ title: 'Coupon failed', description: msg, tone: 'error' }))
    } finally {
      setApplyingCoupon(false)
    }
  }

  const handleCheckout = async (plan: SubscriptionPlan, couponOverride?: string) => {
    if (!activeWorkspaceId || plan === 'free') return
    setCheckoutPlan(plan)
    try {
      const scriptReady = await loadRazorpayScript()
      if (!scriptReady || !window.Razorpay) {
        throw new Error('Razorpay checkout failed to load.')
      }

      const activeCoupon = couponOverride || (applyResult?.requiresCheckout ? couponCode.trim() : undefined)
      const checkoutResponse = await billingApi.checkout(activeWorkspaceId, plan, activeCoupon)
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
            couponCode: activeCoupon,
          })
          setApplyResult(null)
          await dispatch(fetchBillingCurrentThunk(activeWorkspaceId))
          await dispatch(fetchBillingHistoryThunk(activeWorkspaceId))
          dispatch(pushToast({ title: 'Subscription updated', description: 'Payment completed and your plan is now active.', tone: 'success' }))
        },
      })
      razorpay.open()
    } catch (error) {
      dispatch(pushToast({ title: 'Checkout failed', description: getApiErrorMessage(error, 'Unable to start checkout right now.'), tone: 'error' }))
    } finally {
      setCheckoutPlan(null)
    }
  }

  const handleCancel = async () => {
    if (!activeWorkspaceId) return
    try {
      await dispatch(cancelBillingThunk(activeWorkspaceId)).unwrap()
      dispatch(pushToast({ title: 'Plan cancelled', description: 'Your subscription has been cancelled. Pro features will remain active until the end of the billing period.', tone: 'success' }))
    } catch (error) {
      dispatch(pushToast({ title: 'Cancel failed', description: getApiErrorMessage(error, 'Unable to cancel subscription.'), tone: 'error' }))
    }
  }

  const handleResume = async () => {
    if (!activeWorkspaceId) return
    try {
      await dispatch(resumeBillingThunk(activeWorkspaceId)).unwrap()
      dispatch(pushToast({ title: 'Plan resumed', description: 'Your subscription has been reactivated.', tone: 'success' }))
    } catch (error) {
      dispatch(pushToast({ title: 'Resume failed', description: getApiErrorMessage(error, 'Unable to resume subscription.'), tone: 'error' }))
    }
  }

  if (!activeWorkspaceId) {
    return <WorkspaceRequiredState description="Billing and storage usage are tracked per workspace plan, so select a workspace before reviewing subscription details." />
  }

  return (
    <section className="space-y-4 pb-5">
      {!canManageBilling && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
          <AlertTriangle className="mr-2 inline-block size-4" />
          Only workspace admins and owners can manage billing and apply coupons.
          Contact your workspace owner to upgrade the plan.
        </div>
      )}

      <article className="rounded-2xl border border-white/10 glass-panel p-5">
        <h1 className="text-2xl font-semibold">Billing & Subscription</h1>
        {loading || !current ? (
          <p className="mt-2 text-sm text-zinc-500">Loading billing details...</p>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 p-3 dark:border-zinc-700">
              <p className="text-sm text-zinc-500">Current plan</p>
              <p className="text-lg font-semibold capitalize">{current.subscription.plan.replace('_', ' ')}</p>
              <p className="text-xs text-zinc-500">
                Status:{' '}
                <span className={`${current.subscription.status === 'active' ? 'text-emerald-400' : current.subscription.status === 'cancelled' ? 'text-rose-400' : current.subscription.status === 'expired' ? 'text-zinc-500' : 'text-amber-400'}`}>
                  {current.subscription.status}
                </span>
              </p>
              {isOnProPlan && (
                <p className="text-xs text-zinc-500">
                  {isCancelled ? 'Ends' : 'Renews'}: {new Date(current.subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
              {hasActiveCoupon && (
                <p className="mt-1 text-xs text-emerald-400">
                  <Gift className="mr-1 inline-block size-3" />
                  Coupon: {current.activeCoupon!.code}
                  {current.activeCoupon!.benefitExpiresAt && (
                    <span className="text-zinc-500"> (until {new Date(current.activeCoupon!.benefitExpiresAt).toLocaleDateString()})</span>
                  )}
                </p>
              )}
              {canManageBilling && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {isOnProPlan && !isCancelled && !isExpired && (
                    <button className="rounded-xl border border-rose-500/30 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 disabled:opacity-60" disabled={loading} onClick={handleCancel} type="button">
                      <XCircle className="mr-1 inline-block size-3" />
                      Cancel Plan
                    </button>
                  )}
                  {(isCancelled || isExpired) && (
                    <button className="rounded-xl border border-emerald-500/30 px-3 py-2 text-xs text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-60" disabled={loading} onClick={handleResume} type="button">
                      <CheckCircle className="mr-1 inline-block size-3" />
                      Resume Plan
                    </button>
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
              {!isOnFreePlan && (
                <p className="mt-2 text-xs text-zinc-500">
                  <Clock className="mr-1 inline-block size-3" />
                  Period: {new Date(current.subscription.currentPeriodStart).toLocaleDateString()} &ndash; {new Date(current.subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>

            {canManageBilling && (
              <div className="rounded-xl border border-white/10 p-3 dark:border-zinc-700">
                <p className="text-sm text-zinc-500">
                  <Ticket className="mr-1 inline-block size-3" />
                  Apply coupon
                </p>
                <div className="mt-2 flex gap-2">
                  <label className="sr-only" htmlFor="billing-coupon-code">Coupon code</label>
                  <input
                    className="flex-1 rounded-lg border border-white/10 bg-transparent px-3 py-2 text-xs outline-none focus:border-brand-500 dark:border-zinc-700"
                    id="billing-coupon-code"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); setApplyResult(null) }}
                    disabled={applyingCoupon}
                  />
                  <button
                    className="rounded-lg bg-brand-500 px-3 py-2 text-xs text-white disabled:opacity-60"
                    disabled={applyingCoupon || !couponCode.trim()}
                    onClick={handleApplyCoupon}
                    type="button"
                  >
                    {applyingCoupon ? 'Applying...' : 'Apply'}
                  </button>
                </div>
                {applyResult && (
                  <p className={`mt-1 text-xs ${applyResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {applyResult.message}
                  </p>
                )}
                {applyResult?.requiresCheckout && applyResult.discountedPlan && (
                  <button
                    className="mt-2 w-full rounded-lg bg-brand-500 px-3 py-2 text-xs text-white disabled:opacity-60"
                    disabled={checkoutPlan !== null}
                    onClick={() => handleCheckout(applyResult.discountedPlan!, couponCode.trim())}
                    type="button"
                  >
                    <CreditCard className="mr-1 inline-block size-3" />
                    Proceed to checkout (discounted)
                  </button>
                )}
                <button
                  className="mt-2 text-xs text-brand-500 hover:underline"
                  onClick={() => setShowCouponGuide(!showCouponGuide)}
                  type="button"
                >
                  {showCouponGuide ? 'Hide available coupons' : 'Show available coupons'}
                </button>
              </div>
            )}
          </div>
        )}

        {showCouponGuide && availableCoupons.length > 0 && (
          <div className="mt-4 rounded-xl border border-brand-500/20 bg-brand-500/5 p-4">
            <p className="mb-2 text-sm font-semibold text-brand-400">Available coupon codes</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {availableCoupons.map((coupon) => (
                <div className="rounded-lg border border-white/10 p-3 dark:border-zinc-700" key={coupon.code}>
                  <div className="flex items-center justify-between">
                    <code className="rounded bg-zinc-800 px-2 py-0.5 text-sm font-mono text-brand-300">{coupon.code}</code>
                    <button
                      aria-label={`Copy coupon code ${coupon.code}`}
                      className="text-zinc-500 hover:text-zinc-300"
                      onClick={() => handleCopyCode(coupon.code)}
                      title="Copy code"
                      type="button"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">{coupon.description}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Valid for: {coupon.applicablePlans.map((p) => p.replace('_', ' ')).join(', ')}
                  </p>
                  {coupon.type === 'percentage' && (
                    <p className="text-xs text-emerald-400">{coupon.value}% off &bull; {coupon.durationMonths} month(s)</p>
                  )}
                  {coupon.type === 'free_trial' && (
                    <p className="text-xs text-amber-400">{coupon.durationMonths} month(s) free trial</p>
                  )}
                </div>
              ))}
            </div>
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
                    {plan.yearlyEquivalent && (
                      <p className="text-xs text-emerald-400">{plan.yearlyEquivalent}</p>
                    )}
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
                {PLAN_FEATURES.map((plan) => {
                  const isCurrentPlan = current?.subscription.plan === plan.key || (plan.key === 'free' && isOnFreePlan)
                  const isDisabled = !canManageBilling && plan.key !== 'free'
                  const needsPayment = plan.key !== 'free' && !billingConfig?.razorpayConfigured
                  const isOwnerCouponActive = hasActiveCoupon && current?.activeCoupon?.type === 'owner'

                  let buttonLabel = 'Choose Plan'
                  if (isCurrentPlan && !isCancelled && !isExpired) {
                    buttonLabel = 'Current Plan'
                  } else if (isCurrentPlan && (isCancelled || isExpired)) {
                    buttonLabel = 'Resume Plan'
                  } else if (plan.key === 'free') {
                    buttonLabel = 'Free'
                  } else if (needsPayment) {
                    buttonLabel = 'Payment not configured'
                  } else if (isOwnerCouponActive) {
                    buttonLabel = 'Unavailable'
                  }

                  return (
                    <td key={plan.key} className="p-3 text-center">
                      <button
                        className="rounded-lg border border-white/10 px-4 py-2 text-xs dark:border-zinc-700 disabled:opacity-60"
                        disabled={isDisabled || checkoutPlan !== null || (plan.key !== 'free' && needsPayment) || (isCurrentPlan && !isCancelled && !isExpired) || (isOwnerCouponActive && plan.key !== 'free')}
                        onClick={() => {
                          if (plan.key === 'free') return
                          if (isCurrentPlan && (isCancelled || isExpired)) {
                            handleResume()
                            return
                          }
                          handleCheckout(plan.key as 'pro_monthly' | 'pro_yearly')
                        }}
                        type="button"
                      >
                        {buttonLabel}
                      </button>
                    </td>
                  )
                })}
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
                <span>{formatPrice(item.amount, item.currency)}</span>
                <span className="capitalize">{item.status}</span>
                <a
                  className="text-xs text-brand-500 hover:underline"
                  download
                  href={item.invoiceUrl || '#'}
                  rel="noreferrer"
                  target="_blank"
                >
                  {item.invoiceUrl ? 'Download' : 'N/A'}
                </a>
              </div>
            ))
          )}
        </div>
      </article>
    </section>
  )
}

export default BillingPage
