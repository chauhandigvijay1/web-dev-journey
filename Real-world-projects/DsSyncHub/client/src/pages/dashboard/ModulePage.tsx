type ModulePageProps = {
  title: string
  description?: string
}

const ModulePage = ({ title, description }: ModulePageProps) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {description || `${title} module is ready in the new dashboard foundation.`}
      </p>
    </section>
  )
}

export default ModulePage
