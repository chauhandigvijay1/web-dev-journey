type ModulePageProps = {
  title: string
  description?: string
}

const ModulePage = ({ title, description }: ModulePageProps) => {
  return (
    <section className="rounded-2xl border border-white/10 glass-card p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-2xl font-semibold tracking-tight text-white font-semibold drop-shadow-md">{title}</h1>
      <p className="mt-2 text-sm text-zinc-300">
        {description || `${title} module is ready in the new dashboard foundation.`}
      </p>
    </section>
  )
}

export default ModulePage
