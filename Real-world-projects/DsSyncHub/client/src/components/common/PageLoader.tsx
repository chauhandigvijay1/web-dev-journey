type PageLoaderProps = {
  label?: string
  fullscreen?: boolean
}

const PageLoader = ({ label = 'Loading workspace...', fullscreen = false }: PageLoaderProps) => {
  return (
    <div
      className={`grid place-items-center rounded-[28px] border border-slate-200 bg-white/90 p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/90 ${
        fullscreen ? 'min-h-screen' : 'min-h-[40vh]'
      }`}
    >
      <div>
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-violet-600 dark:border-slate-700 dark:border-t-violet-400" />
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  )
}

export default PageLoader
