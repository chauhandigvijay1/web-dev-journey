import { ArrowRight, CheckCircle2, ChevronDown, Menu, Moon, Sparkles, Sun, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import heroPreview from '../assets/hero.png'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { setTheme } from '../store/uiSlice'

const features = [
  {
    title: 'Shared execution, not scattered updates',
    description: 'Tasks, chat, notes, files, and meetings all stay anchored to the same workspace context.',
  },
  {
    title: 'AI that actually helps managers ship',
    description: 'Turn notes into task lists, summarize noisy threads, and generate clear sprint plans in seconds.',
  },
  {
    title: 'Built for real client and team visibility',
    description: 'Invite teammates fast, control roles cleanly, and keep every handoff traceable in one timeline.',
  },
  {
    title: 'Storage, activity, and billing in one place',
    description: 'Operational details are surfaced clearly so growing teams trust the product day to day.',
  },
] as const

const howItWorks = [
  {
    title: 'Create your workspace',
    description: 'Start with one workspace, define your scope, and invite the right people from day one.',
  },
  {
    title: 'Run daily operations',
    description: 'Plan in tasks, capture decisions in notes, and keep discussion in chat without switching tools.',
  },
  {
    title: 'Scale with confidence',
    description: 'Track usage, update billing when needed, and keep every project handoff documented.',
  },
] as const

const pricing = [
  {
    name: 'Starter',
    price: 'Free',
    summary: 'For lean teams setting up one shared workspace.',
    features: ['1 workspace', '3 members included', 'Core tasks, notes, chat, and files', 'Daily AI usage limits'],
    cta: 'Start free',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: 'Rs. 999/mo',
    summary: 'For teams that need more members, storage, and AI depth.',
    features: ['Unlimited workspaces', 'Unlimited members', '10 GB workspace storage', 'Advanced AI automations'],
    cta: 'Choose Growth',
    highlighted: true,
  },
  {
    name: 'Annual Pro',
    price: 'Rs. 9,999/yr',
    summary: 'For scaling teams that want more runway and more usage headroom.',
    features: ['Everything in Growth', 'Higher AI limits', '25 GB storage', 'Best value for annual planning'],
    cta: 'Talk to sales',
    highlighted: false,
  },
] as const

const testimonials = [
  {
    quote: 'DsSync Hub finally gave us one operating surface for delivery, communication, and follow-through.',
    name: 'Anika Sharma',
    role: 'Founder, Northlane Studio',
  },
  {
    quote: 'The dashboard feels like a real operating system for our sprint rhythm, not another disconnected tool.',
    name: 'Rahul Mehta',
    role: 'Product Lead, Interval Labs',
  },
  {
    quote: 'We replaced three spreadsheets, our internal notes doc, and half our chat check-ins in two weeks.',
    name: 'Mira Kapoor',
    role: 'Ops Manager, Cloudframe',
  },
] as const

const faqs = [
  {
    question: 'Is DsSync Hub meant for internal teams or client workspaces?',
    answer: 'Both. Teams can run their own execution cadence internally or spin up separate workspaces for clients, departments, and pods.',
  },
  {
    question: 'Do I need to connect external tools first?',
    answer: 'No. The core workspace is usable immediately with tasks, notes, chat, files, meetings, and AI assistance built in.',
  },
  {
    question: 'How does the free plan differ from Pro?',
    answer: 'Free is sized for early validation. Pro removes workspace and member limits, expands storage, and increases AI usage substantially.',
  },
  {
    question: 'Can non-admin members still use the workspace fully?',
    answer: 'Yes. Members can collaborate across the product, while billing and certain management controls stay limited to admins.',
  },
] as const

const trustSignals = [
  'Northlane Studio',
  'Interval Labs',
  'Cloudframe',
  'Signal Foundry',
  'Atlas Ops',
] as const

const navItems = [
  { label: 'Features', href: '#features', id: 'features' },
  { label: 'Preview', href: '#preview', id: 'preview' },
  { label: 'Pricing', href: '#pricing', id: 'pricing' },
  { label: 'Testimonials', href: '#testimonials', id: 'testimonials' },
  { label: 'FAQ', href: '#faq', id: 'faq' },
] as const

const HomePage = () => {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.ui.theme)
  const [openFaq, setOpenFaq] = useState(0)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const resolvedTheme = useMemo(() => {
    if (theme !== 'system') {
      return theme
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }, [theme])

  return (
    <div className="w-full">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/75 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <Link className="flex items-center gap-3" to="/">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[linear-gradient(135deg,#0f172a,#4338ca)] text-white shadow-lg shadow-indigo-500/25">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Workspace OS</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">DsSync Hub</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-slate-200/80 bg-white/75 p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 md:flex">
            {navItems.map((item) => (
              <a
                className="rounded-full px-4 py-2 text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                href={item.href}
                key={item.id}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
              onClick={() => setMobileNavOpen((current) => !current)}
              type="button"
            >
              {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <button
              className="hidden rounded-full border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 md:inline-flex"
              onClick={() => dispatch(setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'))}
              type="button"
            >
              {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white sm:inline-flex" to="/login">
              Log in
            </Link>
            <Link className="inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100" to="/signup">
              Get started
            </Link>
          </div>
        </div>
        {mobileNavOpen && (
          <div className="border-t border-slate-200/80 px-6 py-4 md:hidden dark:border-slate-800/80">
            <div className="space-y-3 rounded-[28px] border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
              <div className="grid gap-2">
                {navItems.map((item) => (
                  <a
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300"
                    href={item.href}
                    key={item.id}
                    onClick={() => setMobileNavOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  onClick={() => dispatch(setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'))}
                  type="button"
                >
                  {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <Link className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200" onClick={() => setMobileNavOpen(false)} to="/login">
                  Log in
                </Link>
                <Link className="flex-1 rounded-full bg-slate-900 px-4 py-2.5 text-center text-sm font-medium text-white dark:bg-white dark:text-slate-900" onClick={() => setMobileNavOpen(false)} to="/signup">
                  Get started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.2),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,250,252,0.95))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_26%),linear-gradient(180deg,rgba(2,6,23,0.92),rgba(2,6,23,0.98))]" />
          <div className="absolute inset-0 -z-10 ambient-grid opacity-70" />
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-18 lg:grid-cols-[1fr,0.95fr] lg:items-center lg:py-24">
            <div className="animate-fade-rise">
              <p className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700 shadow-sm dark:border-sky-500/20 dark:bg-slate-900/80 dark:text-sky-300">Modern team workspace SaaS</p>
              <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 md:text-6xl dark:text-white">
                Turn scattered team work into one clear operating system.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                DsSync Hub brings tasks, notes, conversations, meetings, files, and AI workflows into one realistic SaaS experience built for fast-moving teams.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3.5 text-sm font-medium text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100" to="/signup">
                  Get Started
                  <ArrowRight className="ml-2" size={16} />
                </Link>
                <Link className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 px-6 py-3.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-white dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-900" to="/signup">
                  Continue with Google
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                {trustSignals.map((item) => (
                  <span className="rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative animate-fade-rise">
              <div className="animate-float-card relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_30px_80px_rgba(15,23,42,0.15)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
                <img alt="DsSync Hub dashboard preview" className="h-full w-full rounded-[24px] object-cover" src={heroPreview} />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-4">
          <div className="rounded-[28px] border border-slate-200/80 bg-white/75 p-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/75">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">Trusted by teams</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {trustSignals.map((item) => (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16" id="features">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600 dark:text-sky-300">Features</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Everything your team needs to execute in one place.</h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              The product is designed to feel like a real collaborative workspace from day one, not a stitched-together prototype.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900" key={feature.title}>
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                  <CheckCircle2 size={18} />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-950 dark:text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-slate-950/[0.03] py-16 dark:bg-white/[0.02]" id="preview">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-300">How it works</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">From onboarding to execution in three clear steps.</h2>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                DsSync Hub keeps planning, execution, and collaboration under one product surface that stays easy to maintain.
              </p>
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {howItWorks.map((item, index) => (
                <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900" key={item.title}>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">{index + 1}</span>
                  <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.description}</p>
                </article>
              ))}
            </div>
            <div className="mt-8 overflow-hidden rounded-[30px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <img alt="Clean dashboard preview" className="w-full rounded-[20px] object-cover" src={heroPreview} />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16" id="pricing">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-600 dark:text-violet-300">Pricing</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Transparent plans that match real team maturity.</h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Start free, upgrade when workspace count, member count, storage, or AI usage becomes a real operational need.
            </p>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {pricing.map((plan) => (
              <article className={`rounded-[30px] border p-6 shadow-sm ${
                plan.highlighted
                  ? 'border-violet-500 bg-slate-950 text-white shadow-violet-500/15'
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
              }`} key={plan.name}>
                <p className={`text-sm font-semibold uppercase tracking-[0.24em] ${plan.highlighted ? 'text-violet-200' : 'text-slate-500 dark:text-slate-400'}`}>{plan.name}</p>
                <p className={`mt-4 text-4xl font-semibold ${plan.highlighted ? 'text-white' : 'text-slate-950 dark:text-white'}`}>{plan.price}</p>
                <p className={`mt-3 text-sm leading-6 ${plan.highlighted ? 'text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>{plan.summary}</p>
                <div className="mt-6 space-y-3">
                  {plan.features.map((item) => (
                    <div className="flex items-start gap-3 text-sm" key={item}>
                      <CheckCircle2 className={plan.highlighted ? 'text-violet-300' : 'text-emerald-500'} size={16} />
                      <span className={plan.highlighted ? 'text-slate-100' : 'text-slate-600 dark:text-slate-300'}>{item}</span>
                    </div>
                  ))}
                </div>
                <Link className={`mt-8 inline-flex rounded-full px-5 py-3 text-sm font-medium ${
                  plan.highlighted
                    ? 'bg-white text-slate-950 hover:bg-slate-100'
                    : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
                }`} to="/signup">
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-slate-950/[0.03] py-16 dark:bg-white/[0.02]" id="testimonials">
          <div className="mx-auto max-w-7xl px-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-600 dark:text-amber-300">Testimonials</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Teams use it because the workflow feels grounded in real operations.</h2>
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {testimonials.map((item) => (
                <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900" key={item.name}>
                  <p className="text-base leading-7 text-slate-700 dark:text-slate-200">&ldquo;{item.quote}&rdquo;</p>
                  <div className="mt-6">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">{item.name}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{item.role}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16" id="faq">
          <div className="grid gap-8 lg:grid-cols-[0.85fr,1.15fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600 dark:text-sky-300">FAQ</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Questions teams ask before switching their workflow.</h2>
              <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
                The product is meant to replace fragmented execution habits, so teams usually want clarity on structure, limits, and rollout.
              </p>
            </div>
            <div className="space-y-3">
              {faqs.map((item, index) => (
                <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900" key={item.question}>
                  <button
                    className="flex w-full items-center justify-between gap-4 text-left"
                    onClick={() => setOpenFaq((current) => (current === index ? -1 : index))}
                    type="button"
                  >
                    <span className="text-base font-semibold text-slate-950 dark:text-white">{item.question}</span>
                    <ChevronDown className={`shrink-0 text-slate-400 transition ${openFaq === index ? 'rotate-180' : ''}`} size={18} />
                  </button>
                  {openFaq === index && (
                    <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.answer}</p>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="overflow-hidden rounded-[36px] border border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,#0f172a,#1e293b)] p-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] md:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-100">Final call to action</p>
              <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Launch your next workspace with a product that already feels trustworthy.</h2>
                  <p className="mt-4 text-sm leading-7 text-slate-200">
                    Set up a workspace, invite your team, and move from planning to shipping without juggling five separate tools.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 hover:bg-slate-100" to="/signup">
                    Create workspace
                  </Link>
                  <Link className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white hover:bg-white/10" to="/signup">
                    Continue with Google
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default HomePage
