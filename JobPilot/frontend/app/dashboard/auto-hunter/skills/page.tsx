"use client";

import { useEffect, useState } from "react";
import type { AutoHunterSkillInsights } from "@/lib/auto-hunter-types";
import { getApiErrorMessage } from "@/lib/httpError";
import { api } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AutoHunterSkillsPage() {
  const [insights, setInsights] = useState<AutoHunterSkillInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadInsights() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ success: boolean; data?: AutoHunterSkillInsights; message?: string }>(
        "/auto-hunter/skills"
      );
      if (!data.success || !data.data) {
        setError(data.message ?? "Could not load skill insights");
        setInsights(null);
        return;
      }
      setInsights(data.data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load skill insights"));
      setInsights(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadInsights();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-72 rounded-[28px]" />
        <Skeleton className="h-72 rounded-[28px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Missing skills suggestions</CardTitle>
            <CardDescription>
              These are the most repeated gaps across your better matches, useful for learning plans and resume tuning.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights?.missingSkills.length ? (
              insights.missingSkills.map((item) => (
                <div key={item.skill} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
                  <span className="text-sm font-medium text-foreground">{item.skill}</span>
                  <Badge variant="secondary">{item.count} jobs</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No repeated gaps found yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Current parsed skills</CardTitle>
            <CardDescription>What the auto hunter is using today as your baseline capability map.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {insights?.currentSkills.length ? (
                insights.currentSkills.map((skill) => (
                  <Badge key={skill} variant="outline" className="rounded-full px-3 py-1 text-[11px]">
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No parsed skills available yet.</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recommended resume improvements</CardTitle>
            <CardDescription>Short actions to improve ATS fit and match confidence.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights?.recommendedImprovements.length ? (
              insights.recommendedImprovements.map((item) => (
                <div key={item} className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                  {item}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recommendations yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Where demand is clustering</CardTitle>
            <CardDescription>Repeated titles and companies from your current match pool.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="mb-3 text-sm font-medium text-foreground">Roles showing up most often</p>
              <div className="space-y-2">
                {insights?.topRoles.length ? (
                  insights.topRoles.map((role) => (
                    <div key={role.role} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
                      <span className="text-sm">{role.role}</span>
                      <Badge variant="secondary">{role.count}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No role distribution yet.</p>
                )}
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-medium text-foreground">Companies repeating in matches</p>
              <div className="space-y-2">
                {insights?.topCompanies.length ? (
                  insights.topCompanies.map((company) => (
                    <div key={company.company} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
                      <span className="text-sm">{company.company}</span>
                      <Badge variant="secondary">{company.count}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No company clustering yet.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
