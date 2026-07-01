import { CheckCircle, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { authApi } from '../services/authApi'

const VerifyEmailPage = () => {
  const { token } = useParams<{ token: string }>()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided.')
      return
    }
    authApi
      .verifyEmail(token)
      .then(() => {
        setStatus('success')
        setMessage('Your email has been verified successfully!')
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err?.response?.data?.message || 'Verification link is invalid or has expired.')
      })
  }, [token])

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-950 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 glass-card p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        {status === 'loading' && (
          <div className="py-8">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            <p className="text-zinc-400">Verifying your email...</p>
          </div>
        )}
        {status === 'success' && (
          <div className="py-8">
            <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
            <h1 className="mb-2 text-xl font-semibold">Email Verified</h1>
            <p className="mb-6 text-zinc-400">{message}</p>
            <Link
              className="inline-block rounded-xl bg-brand-500 px-6 py-3 text-sm font-medium text-white"
              to="/login"
            >
              Go to Login
            </Link>
          </div>
        )}
        {status === 'error' && (
          <div className="py-8">
            <XCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h1 className="mb-2 text-xl font-semibold">Verification Failed</h1>
            <p className="mb-6 text-zinc-400">{message}</p>
            <Link
              className="inline-block rounded-xl bg-brand-500 px-6 py-3 text-sm font-medium text-white"
              to="/login"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}

export default VerifyEmailPage
