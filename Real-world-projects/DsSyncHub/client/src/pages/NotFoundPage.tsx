import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <section className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-medium uppercase tracking-wider text-slate-500">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        The page you requested does not exist yet in this module.
      </p>
      <Link className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200" to="/">
        Back to home
      </Link>
    </section>
  )
}

export default NotFoundPage
