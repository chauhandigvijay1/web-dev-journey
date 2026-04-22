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
import type { SubscriptionPlan } from '../../types/billing'
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
const razorpayPublicKey = import.meta.env.VITE_RAZORPAY_KEY_ID || ''

const BillingPage = () => {
  const dispatch = useAppDispatch()
  const { activeWorkspaceId } = useAppSelector((state) => state.workspace)
  const { current, history, loading } = useAppSelector((state) => state.billing)
  const [checkoutPlan, setCheckoutPlan] = useState<SubscriptionPlan | null>(null)

  useEffect(() => {
    if (!activeWorkspaceId) return
    dispatch(fetchBillingCurrentThunk(activeWorkspaceId))
    dispatch(fetchBillingHistoryThunk(activeWorkspaceId))
  }, [dispatch, activeWorkspaceId])

  if (!activeWorkspaceId) {
    return <WorkspaceRequiredState description="Billing and storage usage are tracked per workspace plan, so select a workspace before reviewing subscription details." />
  }

  const handleCheckout = async (plan: SubscriptionPlan) => {
    if (!activeWorkspaceId || plan === 'free') return
    setCheckoutPlan(plan)
    try {
      const scriptReady = await loadRazorpayScript()
      if (!scriptReady || !window.Razorpay) {
        throw new Error('Razorpay checkout failed to load.')
      }

      const checkoutResponse = await billingApi.checkout(activeWorkspaceId, plan)
      const checkout = checkoutResponse.checkout

      const razorpay = new window.Razorpay({
        key: checkout.keyId || razorpayPublicKey,
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
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-semibold">Billing</h1>
        {loading || !current ? (
          <p className="mt-2 text-sm text-slate-500">Loading billing details...</p>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <p className="text-sm text-slate-500">Current plan</p>
              <p className="text-lg font-semibold">{current.subscription.plan.replace('_', ' ')}</p>
              <p className="text-xs text-slate-500">Status: {current.subscription.status}</p>
              <p className="text-xs text-slate-500">Renews: {new Date(current.subscription.currentPeriodEnd).toLocaleDateString()}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="rounded-xl bg-violet-600 px-3 py-2 text-xs text-white disabled:opacity-60" disabled={checkoutPlan === 'pro_monthly'} onClick={() => handleCheckout('pro_monthly')} type="button">{checkoutPlan === 'pro_monthly' ? 'Opening checkout...' : 'Upgrade Plan'}</button>
                <button className="rounded-xl border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 disabled:opacity-60" disabled={loading} onClick={() => activeWorkspaceId && dispatch(cancelBillingThunk(activeWorkspaceId))} type="button">Cancel Plan</button>
                <button className="rounded-xl border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 disabled:opacity-60" disabled={loading} onClick={() => activeWorkspaceId && dispatch(resumeBillingThunk(activeWorkspaceId))} type="button">Resume Plan</button>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <p className="text-sm text-slate-500">Usage</p>
              <p className="text-sm">Members: {current.usage.membersUsed}</p>
              <p className="text-sm">AI used today: {current.usage.aiUsed}</p>
              <p className="text-sm">Storage: {current.usage.storageUsedMb}MB / {current.usage.storageLimitMb}MB</p>
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

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Pricing</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {[
            { key: 'free', title: 'Free', desc: '1 workspace, 3 members, 512MB storage, basic AI' },
            { key: 'pro_monthly', title: 'Pro Monthly', desc: 'Unlimited workspaces, members, 10GB storage, advanced AI' },
            { key: 'pro_yearly', title: 'Pro Yearly', desc: 'Yearly savings, premium AI, 25GB storage' },
          ].map((item) => (
            <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700" key={item.key}>
              <p className="font-semibold">{item.title}</p>
              <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
              <button className="mt-3 rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 disabled:opacity-60" disabled={checkoutPlan === item.key} onClick={() => item.key !== 'free' && handleCheckout(item.key as 'pro_monthly' | 'pro_yearly')} type="button">
                {current?.subscription.plan === item.key ? 'Current Plan' : 'Choose Plan'}
              </button>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Billing History</h2>
        <div className="mt-3 space-y-2">
          {!history.length ? (
            <p className="text-sm text-slate-500">No invoices yet.</p>
          ) : (
            history.map((item) => (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700" key={item.id}>
                <span>{new Date(item.billedAt).toLocaleDateString()}</span>
                <span>{item.currency} {item.amount}</span>
                <span className="capitalize">{item.status}</span>
                <button className="text-xs text-violet-600" type="button">Download</button>
              </div>
            ))
          )}
        </div>
      </article>
    </section>
  )
}

export default BillingPage
