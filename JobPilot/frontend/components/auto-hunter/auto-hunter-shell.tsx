"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, History, Radar, Settings2, Sparkles, UploadCloud, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/auto-hunter", label: "Matches", icon: Radar },
  { href: "/dashboard/auto-hunter/resume", label: "Resume", icon: UploadCloud },
  { href: "/dashboard/auto-hunter/preferences", label: "Preferences", icon: Settings2 },
  { href: "/dashboard/auto-hunter/alerts", label: "Alerts", icon: BriefcaseBusiness },
  { href: "/dashboard/auto-hunter/history", label: "History", icon: History },
  { href: "/dashboard/auto-hunter/skills", label: "Skill Gaps", icon: Wrench },
];

export function AutoHunterShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-border/70 bg-card/85 p-5 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              AI Resume Auto Job Hunter
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Automated matching built into JobPilot</h1>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
                Upload your resume, tune preferences, track fresh matches, and push strong opportunities straight into your existing board.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors",
                    active
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border/70 bg-background/70 text-muted-foreground hover:border-primary/25 hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
