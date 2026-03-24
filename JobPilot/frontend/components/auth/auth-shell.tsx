"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, BellRing, Sparkles } from "lucide-react";

type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  eyebrow: string;
};

const highlights = [
  {
    icon: BellRing,
    title: "Stay on follow-ups",
    description: "Reminders, resume links, and job notes stay attached to every application.",
  },
  {
    icon: BarChart3,
    title: "See the pipeline clearly",
    description: "Kanban and analytics make it easier to spot momentum and blockers quickly.",
  },
  {
    icon: Sparkles,
    title: "Use AI where it helps",
    description: "Draft follow-up emails and summarize roles without leaving your tracker.",
  },
];

export function AuthShell({ title, description, children, footer, eyebrow }: AuthShellProps) {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_30%),radial-gradient(circle_at_bottom_right,hsl(var(--primary)/0.1),transparent_32%)]" />

      <div className="relative grid min-h-dvh lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden flex-col justify-between px-8 py-10 lg:flex lg:px-14 lg:py-12">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg"
            >
              JP
            </Link>
            <div className="space-y-0.5">
              <p className="text-base font-semibold tracking-tight text-foreground">JobPilot</p>
              <p className="text-sm text-muted-foreground">Career tracking that feels organized.</p>
            </div>
          </div>

          <div className="max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/65 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground backdrop-blur">
              {eyebrow}
            </div>

            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground xl:text-5xl">
                Track every application with less clutter and more confidence.
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground xl:text-lg">
                Build a calmer workflow for your search with reminders, analytics, AI follow-ups,
                and a board that keeps the whole process in one place.
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {highlights.map(({ icon: Icon, title: highlightTitle, description: highlightDescription }) => (
                <div
                  key={highlightTitle}
                  className="rounded-[28px] border border-border/70 bg-card/80 p-5 shadow-[0_24px_50px_-30px_hsl(var(--foreground)/0.3)] backdrop-blur-sm"
                >
                  <div className="mb-4 inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{highlightTitle}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{highlightDescription}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Built for applications, interviews, offers, and follow-ups.</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-6 sm:px-6 lg:px-10">
          <div className="w-full max-w-lg overflow-hidden rounded-[30px] border border-border/70 bg-card/88 shadow-[0_32px_80px_-36px_hsl(var(--foreground)/0.45)] backdrop-blur-xl">
            <div className="border-b border-border/70 px-6 py-6 sm:px-8">
              <p className="text-sm font-medium text-primary">JobPilot</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>

            <div className="px-6 py-6 sm:px-8 sm:py-8">{children}</div>

            <div className="border-t border-border/70 bg-background/55 px-6 py-4 text-sm text-muted-foreground sm:px-8">
              {footer}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
