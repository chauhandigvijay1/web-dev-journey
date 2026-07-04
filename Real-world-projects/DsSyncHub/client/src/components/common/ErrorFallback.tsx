import { useEffect, useState } from 'react'

const ErrorFallback = () => {
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    if (countdown <= 0) {
      window.location.href = '/login'
      return
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold text-red-500">Something went wrong</h1>
      <p className="max-w-md text-zinc-400">
        An unexpected error occurred. Redirecting to login in {countdown} seconds.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
      >
        Reload page
      </button>
    </section>
  )
}

export default ErrorFallback
