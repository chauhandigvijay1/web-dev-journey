import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { authApi } from '../services/authApi'
import { getApiErrorMessage } from '../utils/errors'

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid work email'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

const ForgotPasswordPage = () => {
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (values: ForgotPasswordForm) => {
    setSubmitting(true)
    setApiError('')
    setSuccessMessage('')

    try {
      const response = await authApi.requestPasswordReset({ email: values.email })
      setSuccessMessage(response.message)
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'We could not start the reset flow right now.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12">
      <section className="grid w-full max-w-5xl gap-8 rounded-[32px] border border-white/10 glass-card p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-[0.95fr,1.05fr] md:p-10">
        <div className="rounded-[28px] bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.28),_transparent_34%),linear-gradient(155deg,#0f172a,#1e293b)] p-8 text-white">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 glass-card/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-sky-100">
          <ShieldCheck size={14} />
          Account recovery
        </p>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">Reset access without leaving your team waiting.</h1>
        <p className="mt-4 text-sm leading-6 text-zinc-200">
          We&apos;ll prepare a secure reset link so you can get back to tasks, notes, and conversations quickly.
        </p>
        <div className="mt-8 space-y-3 rounded-[24px] border border-white/10 glass-card/5 p-5">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/25 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-300">Security checks</p>
            <p className="mt-2 text-sm text-zinc-100">Reset links expire automatically and replace every active session after a password update.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-950/25 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-300">Delivery</p>
            <p className="mt-2 text-sm text-zinc-100">A real reset link is emailed to your inbox if an account exists for this address.</p>
          </div>
        </div>
      </div>

        <div className="flex flex-col justify-center">
        <Link className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white dark:text-zinc-400 dark:hover:text-white" to="/login">
          <ArrowLeft size={16} />
          Back to sign in
        </Link>
        <h2 className="mt-6 text-2xl font-semibold tracking-tight text-white font-semibold drop-shadow-md">Forgot your password?</h2>
        <p className="mt-2 text-sm text-zinc-300">
          Enter the email tied to your account and we&apos;ll generate a reset link.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-200">Work email</label>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 dark:border-zinc-700 bg-black/20">
              <Mail className="text-zinc-400" size={18} />
              <input
                className="w-full bg-transparent text-sm outline-none"
                placeholder="you@company.com"
                type="email"
                {...register('email')}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
          </div>

          {apiError && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">{apiError}</p>}

          {successMessage && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100">
              <p className="font-medium">{successMessage}</p>
            </div>
          )}

          <button
            className="w-full rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:glass-card dark:text-white dark:hover:glass-card/10"
            disabled={submitting}
            type="submit"
          >
            {submitting ? 'Preparing reset link...' : 'Send reset link'}
          </button>
        </form>
        </div>
      </section>
    </main>
  )
}

export default ForgotPasswordPage
