import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <section className="mx-auto w-full max-w-xl rounded-3xl border border-white/10 glass-card p-10 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 text-zinc-300">
        The page you requested does not exist yet in this module.
      </p>
      <Link className="mt-6 inline-flex rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-700 dark:glass-card dark:text-white dark:hover:bg-zinc-200" to="/">
        Back to home
      </Link>
    </section>
  )
}

export default NotFoundPage
