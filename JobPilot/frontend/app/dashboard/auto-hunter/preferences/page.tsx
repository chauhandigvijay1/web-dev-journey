"use client";

import { useEffect, useState } from "react";
import {
  AUTO_HUNTER_JOB_TYPE_OPTIONS,
  AUTO_HUNTER_SOURCE_OPTIONS,
  AUTO_HUNTER_WORK_MODE_OPTIONS,
  type JobHunterPreferences,
} from "@/lib/auto-hunter-types";
import { getApiErrorMessage } from "@/lib/httpError";
import { api } from "@/services/api";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

function toggleItem(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export default function AutoHunterPreferencesPage() {
  const [preferences, setPreferences] = useState<JobHunterPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [preferredRoles, setPreferredRoles] = useState("");
  const [countries, setCountries] = useState("");
  const [companyPreferences, setCompanyPreferences] = useState("");
  const [workModes, setWorkModes] = useState<string[]>([]);
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [searchSources, setSearchSources] = useState<string[]>([]);
  const [salaryLabel, setSalaryLabel] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryCurrency, setSalaryCurrency] = useState("");
  const [searchEnabled, setSearchEnabled] = useState(true);

  async function loadPreferences() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ success: boolean; data?: { preferences: JobHunterPreferences }; message?: string }>(
        "/auto-hunter/preferences"
      );
      if (!data.success || !data.data?.preferences) {
        setError(data.message ?? "Could not load preferences");
        return;
      }
      const next = data.data.preferences;
      setPreferences(next);
      setPreferredRoles(next.preferredRoles.join("\n"));
      setCountries(next.countries.join("\n"));
      setCompanyPreferences(next.companyPreferences.join("\n"));
      setWorkModes(next.workModes);
      setJobTypes(next.jobTypes);
      setSearchSources(next.searchSources);
      setSalaryLabel(next.salaryExpectation.label || "");
      setSalaryMin(next.salaryExpectation.min != null ? String(next.salaryExpectation.min) : "");
      setSalaryMax(next.salaryExpectation.max != null ? String(next.salaryExpectation.max) : "");
      setSalaryCurrency(next.salaryExpectation.currency || "");
      setSearchEnabled(next.searchEnabled);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load preferences"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPreferences();
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const { data } = await api.patch<{ success: boolean; data?: { preferences: JobHunterPreferences }; message?: string }>(
        "/auto-hunter/preferences",
        {
          preferredRoles,
          countries,
          companyPreferences,
          workModes,
          jobTypes,
          searchSources,
          salaryExpectation: {
            label: salaryLabel,
            min: salaryMin ? Number(salaryMin) : null,
            max: salaryMax ? Number(salaryMax) : null,
            currency: salaryCurrency,
          },
          searchEnabled,
        }
      );

      if (!data.success || !data.data?.preferences) {
        setError(data.message ?? "Could not save preferences");
        return;
      }

      setMessage("Preferences saved.");
      setPreferences(data.data.preferences);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not save preferences"));
    } finally {
      setSaving(false);
    }
  }

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
      {message ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-200">
          {message}
        </div>
      ) : null}

      <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Search targeting</CardTitle>
          <CardDescription>
            Manual preferences override resume-only inference and control what the auto hunter searches for next.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="preferred-roles">Preferred job roles</Label>
            <Textarea
              id="preferred-roles"
              rows={5}
              value={preferredRoles}
              onChange={(event) => setPreferredRoles(event.target.value)}
              placeholder="Backend Engineer&#10;Full Stack Developer&#10;Platform Engineer"
            />
            <p className="text-xs text-muted-foreground">Use one role per line for the strongest matching.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="countries">Countries or location targets</Label>
            <Textarea
              id="countries"
              rows={5}
              value={countries}
              onChange={(event) => setCountries(event.target.value)}
              placeholder="India&#10;United States&#10;Germany"
            />
            <p className="text-xs text-muted-foreground">These are used in search queries and location scoring.</p>
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="company-preferences">Preferred companies</Label>
            <Textarea
              id="company-preferences"
              rows={4}
              value={companyPreferences}
              onChange={(event) => setCompanyPreferences(event.target.value)}
              placeholder="Google&#10;Atlassian&#10;Microsoft"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Choose the work styles and job types that should score higher.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Work mode</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {AUTO_HUNTER_WORK_MODE_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm">
                    <Checkbox
                      checked={workModes.includes(option.value)}
                      onCheckedChange={() => setWorkModes((current) => toggleItem(current, option.value))}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Job type</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {AUTO_HUNTER_JOB_TYPE_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm">
                    <Checkbox
                      checked={jobTypes.includes(option.value)}
                      onCheckedChange={() => setJobTypes((current) => toggleItem(current, option.value))}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Discovery sources</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {AUTO_HUNTER_SOURCE_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm">
                    <Checkbox
                      checked={searchSources.includes(option.value)}
                      onCheckedChange={() => setSearchSources((current) => toggleItem(current, option.value))}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Compensation and automation</CardTitle>
            <CardDescription>Guide scoring around salary fit and whether discovery should keep running.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="salary-label">Salary expectation label</Label>
              <Input
                id="salary-label"
                value={salaryLabel}
                onChange={(event) => setSalaryLabel(event.target.value)}
                placeholder="18-28 LPA / $120k-$160k"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="salary-min">Min</Label>
                <Input
                  id="salary-min"
                  type="number"
                  value={salaryMin}
                  onChange={(event) => setSalaryMin(event.target.value)}
                  placeholder="1800000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary-max">Max</Label>
                <Input
                  id="salary-max"
                  type="number"
                  value={salaryMax}
                  onChange={(event) => setSalaryMax(event.target.value)}
                  placeholder="2800000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary-currency">Currency</Label>
                <Input
                  id="salary-currency"
                  value={salaryCurrency}
                  onChange={(event) => setSalaryCurrency(event.target.value.toUpperCase())}
                  placeholder="INR"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm">
              <Checkbox checked={searchEnabled} onCheckedChange={(checked) => setSearchEnabled(checked === true)} />
              <div>
                <p className="font-medium text-foreground">Keep auto discovery enabled</p>
                <p className="text-xs text-muted-foreground">
                  If turned off, your resume stays parsed but scans and alerts stop.
                </p>
              </div>
            </label>

            <Button onClick={() => void handleSave()} disabled={saving}>
              {saving ? "Saving..." : "Save preferences"}
            </Button>

            {preferences ? (
              <p className="text-xs text-muted-foreground">
                Last updated {preferences.updatedAt ? new Date(preferences.updatedAt).toLocaleString() : "just now"}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
