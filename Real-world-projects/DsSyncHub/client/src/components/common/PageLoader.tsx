type PageLoaderProps = {
  label?: string
  fullscreen?: boolean
}

const PageLoader = ({ label = 'Loading workspace...', fullscreen = false }: PageLoaderProps) => {
  return (
    <div
      className={`grid place-items-center rounded-[28px] border border-white/10 glass-card/90 p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 ${
        fullscreen ? 'min-h-screen' : 'min-h-[40vh]'
      }`}
    >
      <div>
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-violet-600 dark:border-zinc-700 dark:border-t-violet-400" />
        <p className="mt-4 text-sm text-zinc-400">{label}</p>
      </div>
    </div>
  )
}

export default PageLoader
