import { zodResolver } from '@hookform/resolvers/zod'
import { GoogleLogin } from '@react-oauth/google'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
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
      <section className="grid w-full gap-8 rounded-3xl glass-panel p-6 shadow-2xl md:grid-cols-2 md:p-10 text-zinc-200">
        <div className="hidden rounded-2xl glass-card border border-brand-500/20 p-10 text-white md:flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_60%)] pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold tracking-tight text-white">Welcome to DsSync Hub</h2>
            <p className="mt-4 text-base text-brand-100 font-light leading-relaxed">
              Manage workspaces, tasks, notes, and collaboration in one beautifully connected flow.
            </p>
          </div>
          <div className="relative z-10 mt-12 rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur-md">
            <p className="text-sm font-medium text-brand-300">"The fastest way to orchestrate your team's best work."</p>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Login to your account</h1>
          <p className="mt-2 text-sm text-zinc-400">
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
            <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-300" htmlFor="login-identifier">Email, phone, or username</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder-zinc-500"
              id="login-identifier"
              placeholder="you@company.com or @workspace-handle"
              {...register('identifier')}
            />
            {errors.identifier && (
              <p className="mt-1 text-xs text-rose-500">{errors.identifier.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-300" htmlFor="login-password">Password</label>
            <div className="relative">
              <input
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 pr-11 text-sm text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder-zinc-500"
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                {...register('password')}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-3 text-zinc-400 hover:text-white transition-colors"
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2 text-zinc-300 cursor-pointer" htmlFor="login-remember-me">
              <input id="login-remember-me" type="checkbox" className="accent-brand-500" {...register('rememberMe')} />
              Keep me signed in on this device
            </label>
            <Link className="text-brand-400 hover:text-brand-300 transition-colors" to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          {apiError && <p className="text-sm text-red-500">{apiError}</p>}

          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3.5 text-sm font-bold text-zinc-950 hover:bg-brand-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            {loading ? 'Logging in...' : 'Login to Workspace'}
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

            <p className="text-center text-sm text-zinc-400">
              No account yet?{' '}
              <Link className="font-semibold text-brand-400 hover:text-brand-300 transition-colors" to="/signup">
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
