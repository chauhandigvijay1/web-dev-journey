import Link from "next/link";
import { ArrowRight, BarChart3, BellRing, Sparkles, Puzzle, Brain, Columns3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Columns3,
    title: "Kanban Pipeline",
    description: "Drag jobs through Saved → Applied → Interview → Offer → Rejected with a visual board that keeps your entire search organized.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Tools",
    description: "Generate cover letters, tailor resumes, draft follow-up emails, and analyze skill gaps using Groq Llama 3.",
  },
  {
    icon: Puzzle,
    title: "Browser Extension",
    description: "Save jobs from 50+ boards (LinkedIn, Indeed, Naukri, Glassdoor) with one click. Press Alt+Shift+J to open.",
  },
  {
    icon: BellRing,
    title: "Smart Reminders",
    description: "Automated follow-up email reminders with configurable timing. Never lose track of a recruiter connection.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Pipeline funnel, weekly trends, status distribution, and follow-up queue to spot momentum and blockers.",
  },
  {
    icon: Brain,
    title: "Resume Parsing",
    description: "Upload PDF or DOCX resumes — AI extracts skills, experience, and qualifications to match against job descriptions.",
  },
];

const stats = [
  { value: "50+", label: "Job boards supported" },
  { value: "7d", label: "Access token TTL" },
  { value: "162", label: "Automated tests" },
  { value: "100%", label: "Free & open source" },
];

export default function HomePage() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.15),transparent_35%),radial-gradient(circle_at_bottom_right,hsl(var(--primary)/0.08),transparent_35%)]" />

      <nav className="relative flex items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-md">
            JP
          </div>
          <span className="text-base font-semibold tracking-tight">JobPilot</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </nav>

      <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-16 sm:px-10 lg:px-16 lg:pb-24 lg:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/65 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
            Your AI Career Operating System
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Track every application with less clutter and more confidence.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground lg:text-lg">
            Build a calmer workflow for your job search with Kanban boards, AI-powered tools,
            automated reminders, and a browser extension that saves jobs from 50+ portals in one click.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start tracking free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-16 sm:px-10 lg:px-16 lg:pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-[28px] border border-border/70 bg-card/80 p-6 shadow-[0_24px_50px_-30px_hsl(var(--foreground)/0.3)] backdrop-blur-sm"
            >
              <div className="mb-4 inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-base font-semibold text-foreground">{title}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-16 sm:px-10 lg:px-16 lg:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Trusted by job seekers who stay organized
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map(({ value, label }) => (
            <div key={label} className="rounded-2xl border border-border/70 bg-card/60 p-5 text-center backdrop-blur-sm">
              <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-16 sm:px-10 lg:px-16 lg:pb-24">
        <div className="rounded-[28px] border border-border/70 bg-card/80 p-8 text-center shadow-[0_24px_50px_-30px_hsl(var(--foreground)/0.3)] backdrop-blur-sm sm:p-12">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready to take control of your job search?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
            No credit card. No hidden limits. Just a clean, organized way to manage applications, follow-ups, and offers.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">
                Get started free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-border/70 px-6 py-8 text-center text-sm text-muted-foreground">
        <p>JobPilot — MIT License. Built by Digvijay Kumar Singh.</p>
      </footer>
    </main>
  );
}
