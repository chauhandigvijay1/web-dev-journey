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
      <section className="grid w-full gap-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2 md:p-10">
        <div className="hidden rounded-2xl bg-gradient-to-br from-indigo-700/90 via-violet-700/85 to-sky-700/90 p-10 text-white md:flex md:flex-col md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold leading-tight">Build your team workspace in minutes</h2>
            <p className="mt-4 text-sm text-indigo-100">
              Keep tasks, notes, chat, and files in one place with clean onboarding from day one.
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-indigo-100">
            Invite teammates, assign ownership, and move from planning to delivery with one connected flow.
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Start your workspace in under two minutes.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1 block text-sm font-medium">Full Name</label>
            <input className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm outline-none focus:border-slate-500 dark:border-slate-700" {...register('fullName')} />
            {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Username</label>
            <input className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm outline-none focus:border-slate-500 dark:border-slate-700" {...register('username')} />
            {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm outline-none focus:border-slate-500 dark:border-slate-700" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Phone (optional)</label>
            <input className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm outline-none focus:border-slate-500 dark:border-slate-700" {...register('phone')} />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <div className="relative">
              <input
                className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 pr-11 text-sm outline-none focus:border-slate-500 dark:border-slate-700"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
              />
              <button className="absolute inset-y-0 right-3 text-slate-500" type="button" onClick={() => setShowPassword((prev) => !prev)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-2 rounded-full bg-emerald-500 transition-all"
                style={{ width: `${(passwordStrength / 5) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">Strength: {strengthLabel}</p>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Confirm Password</label>
            <div className="relative">
              <input
                className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 pr-11 text-sm outline-none focus:border-slate-500 dark:border-slate-700"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
              />
              <button
                className="absolute inset-y-0 right-3 text-slate-500"
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <label className="inline-flex items-start gap-2 text-sm">
            <input className="mt-1" type="checkbox" {...register('terms')} />
            <span>I agree to the Terms and Privacy Policy.</span>
          </label>
          {errors.terms && <p className="text-xs text-red-500">{errors.terms.message}</p>}

          {apiError && <p className="text-sm text-red-500">{apiError}</p>}

          <button
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 hover:bg-blue-500"
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

            <p className="text-center text-sm text-slate-600 dark:text-slate-300">
              Already have an account?{' '}
              <Link className="font-medium text-blue-600 hover:text-blue-500" to="/login">
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
