import { zodResolver } from '@hookform/resolvers/zod'
import { GoogleLogin } from '@react-oauth/google'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { googleLoginThunk, loginThunk } from '../store/authSlice'
import { getApiErrorMessage } from '../utils/errors'

const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Email, phone, or username is required'),
  password: z.string().trim().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

const LoginPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading } = useAppSelector((state) => state.auth)
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState('')
  const resetCompleted = new URLSearchParams(location.search).get('reset') === '1'
  const logoutAllCompleted = new URLSearchParams(location.search).get('logoutAll') === '1'
  const nextPath =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard'
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: true,
    },
  })

  const onSubmit = async (values: LoginFormData) => {
    setApiError('')
    try {
      await dispatch(
        loginThunk({
          identifier: values.identifier,
          password: values.password,
          rememberMe: values.rememberMe,
        }),
      ).unwrap()
      navigate(nextPath, { replace: true })
    } catch (error: unknown) {
      setApiError(getApiErrorMessage(error, 'Login failed. Please try again.'))
    }
  }

  const handleGoogleLogin = async () => {
    setApiError('Google Sign-In response was invalid. Please try again.')
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12">
      <section className="grid w-full gap-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2 md:p-10">
        <div className="hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-8 text-white md:block">
          <h2 className="text-3xl font-semibold">Welcome to DsSync Hub</h2>
          <p className="mt-3 text-sm text-blue-100">
            Manage workspaces, tasks, notes, and collaboration in one connected flow.
          </p>
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Login to your account</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Continue where your team left off.
          </p>
          {resetCompleted && (
            <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
              Password updated successfully. Sign in with your new credentials.
            </p>
          )}
          {logoutAllCompleted && (
            <p className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200">
              Every active session has been signed out. Continue with a fresh sign-in on this device.
            </p>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1 block text-sm font-medium">Email, phone, or username</label>
            <input
              className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm outline-none focus:border-slate-500 dark:border-slate-700"
              placeholder="you@company.com or @workspace-handle"
              {...register('identifier')}
            />
            {errors.identifier && (
              <p className="mt-1 text-xs text-red-500">{errors.identifier.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <div className="relative">
              <input
                className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 pr-11 text-sm outline-none focus:border-slate-500 dark:border-slate-700"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                {...register('password')}
              />
              <button
                className="absolute inset-y-0 right-3 text-slate-500"
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" {...register('rememberMe')} />
              Keep me signed in on this device
            </label>
            <Link className="text-blue-600 hover:text-blue-500" to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          {apiError && <p className="text-sm text-red-500">{apiError}</p>}

          <button
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="flex justify-center">
            {googleClientId ? (
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  const idToken = credentialResponse.credential
                  if (!idToken) {
                    handleGoogleLogin()
                    return
                  }
                  setApiError('')
                  try {
                    await dispatch(googleLoginThunk({ idToken })).unwrap()
                    navigate(nextPath, { replace: true })
                  } catch (error: unknown) {
                    setApiError(getApiErrorMessage(error, 'Google login failed. Please try again.'))
                  }
                }}
                onError={handleGoogleLogin}
                useOneTap={false}
              />
            ) : (
              <p className="text-xs text-amber-600">Google sign-in is unavailable. Set `VITE_GOOGLE_CLIENT_ID`.</p>
            )}
          </div>

            <p className="text-center text-sm text-slate-600 dark:text-slate-300">
              No account yet?{' '}
              <Link className="font-medium text-blue-600 hover:text-blue-500" to="/signup">
                Create Account
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
