import { zodResolver } from '@hookform/resolvers/zod'
import { GoogleLogin } from '@react-oauth/google'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { googleLoginThunk, registerThunk } from '../store/authSlice'
import { getApiErrorMessage } from '../utils/errors'

const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters')
      .regex(/^[a-zA-Z0-9._-]+$/, 'Only letters, numbers, . _ - are allowed'),
    email: z.string().trim().email('Enter a valid email'),
    phone: z
      .string()
      .trim()
      .optional()
      .refine((value) => !value || /^\+?[1-9]\d{7,14}$/.test(value), {
        message: 'Enter a valid phone number',
      }),
    password: z
      .string()
      .trim()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[a-z]/, 'Include at least one lowercase letter')
      .regex(/\d/, 'Include at least one number')
      .regex(/[^A-Za-z0-9]/, 'Include at least one special character'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((value) => value, {
      message: 'You must accept terms to continue',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type SignupFormData = z.infer<typeof signupSchema>

const SignupPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading } = useAppSelector((state) => state.auth)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [apiError, setApiError] = useState('')
  const nextPath =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard'
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  })

  const { register, handleSubmit, control, formState: { errors } } = form
  const password = useWatch({ control, name: 'password' }) || ''
  let passwordStrength = 0
  if (password.length >= 8) passwordStrength += 1
  if (/[A-Z]/.test(password)) passwordStrength += 1
  if (/[a-z]/.test(password)) passwordStrength += 1
  if (/\d/.test(password)) passwordStrength += 1
  if (/[^A-Za-z0-9]/.test(password)) passwordStrength += 1

  const strengthLabel = ['Very weak', 'Weak', 'Okay', 'Good', 'Strong', 'Excellent'][
    passwordStrength
  ]

  const onSubmit = async (values: SignupFormData) => {
    setApiError('')
    try {
      await dispatch(
        registerThunk({
          fullName: values.fullName,
          username: values.username,
          email: values.email,
          phone: values.phone || undefined,
          password: values.password,
          confirmPassword: values.confirmPassword,
        }),
      ).unwrap()
      navigate(nextPath, { replace: true })
    } catch (error: unknown) {
      setApiError(getApiErrorMessage(error, 'Registration failed. Please try again.'))
    }
  }

  const handleGoogleSignup = async () => {
    setApiError('Google Sign-In response was invalid. Please try again.')
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12">
      <section className="grid w-full gap-8 rounded-3xl glass-panel p-6 shadow-2xl md:grid-cols-2 md:p-10 text-zinc-200">
        <div className="hidden rounded-2xl glass-card border border-brand-500/20 p-10 text-white md:flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-[-50%] right-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_60%)] pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold leading-tight tracking-tight">Build your team workspace in minutes</h2>
            <p className="mt-4 text-base text-brand-100 font-light">
              Keep tasks, notes, chat, and files in one place with clean onboarding from day one.
            </p>
          </div>
          <div className="relative z-10 mt-12 rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur-md shadow-lg">
            <p className="text-sm font-medium text-brand-300">Invite teammates, assign ownership, and move from planning to delivery with one connected flow.</p>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Create account</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Start your workspace in under two minutes.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Full Name</label>
            <input className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder-zinc-500" {...register('fullName')} />
            {errors.fullName && <p className="mt-1 text-xs text-rose-500">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Username</label>
            <input className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder-zinc-500" {...register('username')} />
            {errors.username && <p className="mt-1 text-xs text-rose-500">{errors.username.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Email</label>
            <input className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder-zinc-500" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Phone (optional)</label>
            <input className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder-zinc-500" {...register('phone')} />
            {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Password</label>
            <div className="relative">
              <input
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 pr-11 text-sm text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder-zinc-500"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
              />
              <button className="absolute inset-y-0 right-3 text-zinc-400 hover:text-white transition-colors" type="button" onClick={() => setShowPassword((prev) => !prev)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="mt-2 h-2 rounded-full glass-card/10">
              <div
                className="h-2 rounded-full bg-brand-500 transition-all shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                style={{ width: `${(passwordStrength / 5) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-zinc-400">Strength: {strengthLabel}</p>
            {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Confirm Password</label>
            <div className="relative">
              <input
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 pr-11 text-sm text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder-zinc-500"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
              />
              <button
                className="absolute inset-y-0 right-3 text-zinc-400 hover:text-white transition-colors"
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-rose-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <label className="inline-flex items-start gap-2 text-sm text-zinc-300 cursor-pointer">
            <input className="mt-1 accent-brand-500" type="checkbox" {...register('terms')} />
            <span>I agree to the Terms and Privacy Policy.</span>
          </label>
          {errors.terms && <p className="text-xs text-rose-500">{errors.terms.message}</p>}

          {apiError && <p className="text-sm text-rose-500">{apiError}</p>}

          <button
            className="w-full rounded-xl bg-brand-500 px-4 py-3.5 text-sm font-bold text-dark-950 hover:bg-brand-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <div className="flex justify-center">
            {googleClientId ? (
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  const idToken = credentialResponse.credential
                  if (!idToken) {
                    handleGoogleSignup()
                    return
                  }
                  setApiError('')
                  try {
                    await dispatch(googleLoginThunk({ idToken })).unwrap()
                    navigate(nextPath, { replace: true })
                  } catch (error: unknown) {
                    setApiError(getApiErrorMessage(error, 'Google sign up failed.'))
                  }
                }}
                onError={handleGoogleSignup}
                useOneTap={false}
              />
            ) : (
              <p className="text-xs text-amber-600">Google sign-up is unavailable. Set `VITE_GOOGLE_CLIENT_ID`.</p>
            )}
          </div>

            <p className="text-center text-sm text-zinc-400">
              Already have an account?{' '}
              <Link className="font-semibold text-brand-400 hover:text-brand-300 transition-colors" to="/login">
                Login
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}

export default SignupPage
