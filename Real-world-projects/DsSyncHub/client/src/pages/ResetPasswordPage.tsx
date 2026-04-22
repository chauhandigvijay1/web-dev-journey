import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, KeyRound } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { authApi } from '../services/authApi'
import { getApiErrorMessage } from '../utils/errors'

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .trim()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[a-z]/, 'Include at least one lowercase letter')
      .regex(/\d/, 'Include at least one number')
      .regex(/[^A-Za-z0-9]/, 'Include at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const { token = '' } = useParams()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form
  const password = useWatch({ control, name: 'password' }) || ''

  const strength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length

  const onSubmit = async (values: ResetPasswordForm) => {
    setSubmitting(true)
    setApiError('')

    try {
      await authApi.resetPassword({
        token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      })
      navigate('/login?reset=1', { replace: true })
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'The reset link is invalid or has expired.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12">
      <section className="grid w-full max-w-5xl gap-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[0.95fr,1.05fr] md:p-10">
        <div className="rounded-[28px] bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.22),_transparent_32%),linear-gradient(155deg,#111827,#1f2937)] p-8 text-white">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-amber-100">
          <KeyRound size={14} />
          Secure reset
        </p>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">Choose a strong new password.</h1>
        <p className="mt-4 text-sm leading-6 text-slate-200">
          Once saved, every previously issued session token is invalidated automatically.
        </p>
        <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Strength checklist</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-100">
            <li>At least 8 characters</li>
            <li>Uppercase and lowercase letters</li>
            <li>At least one number</li>
            <li>At least one special character</li>
          </ul>
        </div>
      </div>

        <div className="flex flex-col justify-center">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Reset your password</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Enter a fresh password for your account and sign back in securely.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">New password</label>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
              <input
                className="w-full bg-transparent text-sm outline-none"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
              />
              <button className="text-slate-500" onClick={() => setShowPassword((prev) => !prev)} type="button">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${(strength / 5) * 100}%` }} />
            </div>
            {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Confirm password</label>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
              <input
                className="w-full bg-transparent text-sm outline-none"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
              />
              <button className="text-slate-500" onClick={() => setShowConfirmPassword((prev) => !prev)} type="button">
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-rose-500">{errors.confirmPassword.message}</p>}
          </div>

          {apiError && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">{apiError}</p>}

          <button
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            disabled={submitting || !token}
            type="submit"
          >
            {submitting ? 'Updating password...' : 'Update password'}
          </button>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Need a fresh link?{' '}
            <Link className="font-medium text-violet-600 hover:text-violet-500" to="/forgot-password">
              Request another reset email
            </Link>
          </p>
        </form>
        </div>
      </section>
    </main>
  )
}

export default ResetPasswordPage
