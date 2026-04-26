"use client";

import { useEffect, useState } from "react";
import { Mail, Radar } from "lucide-react";
import type { AutoHunterOverview, JobHunterPreferences } from "@/lib/auto-hunter-types";
import { getApiErrorMessage } from "@/lib/httpError";
import { api } from "@/services/api";
import { useAppSelector } from "@/store/hooks";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function AutoHunterAlertsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [preferences, setPreferences] = useState<JobHunterPreferences | null>(null);
  const [profileStatus, setProfileStatus] = useState<{ lastScanAt: string | null; lastScanStatus: string; lastScanSummary: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [immediateAlertsEnabled, setImmediateAlertsEnabled] = useState(true);
  const [dailyDigestEnabled, setDailyDigestEnabled] = useState(false);
  const [minimumMatchScore, setMinimumMatchScore] = useState("72");
  const [dailyDigestHour, setDailyDigestHour] = useState("18");
  const [maxAlertsPerDay, setMaxAlertsPerDay] = useState("5");

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ success: boolean; data?: AutoHunterOverview; message?: string }>(
        "/auto-hunter/overview"
      );
      if (!data.success || !data.data) {
        setError(data.message ?? "Could not load alert settings");
        return;
      }

      setPreferences(data.data.preferences);
      setProfileStatus(
        data.data.profile
          ? {
              lastScanAt: data.data.profile.lastScanAt,
              lastScanStatus: data.data.profile.lastScanStatus,
              lastScanSummary: data.data.profile.lastScanSummary,
            }
          : null
      );

      const settings = data.data.preferences.alertSettings;
      setEmailEnabled(settings.emailEnabled);
      setImmediateAlertsEnabled(settings.immediateAlertsEnabled);
      setDailyDigestEnabled(settings.dailyDigestEnabled);
      setMinimumMatchScore(String(settings.minimumMatchScore));
      setDailyDigestHour(String(settings.dailyDigestHour));
      setMaxAlertsPerDay(String(settings.maxAlertsPerDay));
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load alert settings"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function saveAlertSettings() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const { data } = await api.patch<{ success: boolean; data?: { preferences: JobHunterPreferences }; message?: string }>(
        "/auto-hunter/preferences",
        {
          alertSettings: {
            emailEnabled,
            immediateAlertsEnabled,
            dailyDigestEnabled,
            minimumMatchScore: Number(minimumMatchScore),
            dailyDigestHour: Number(dailyDigestHour),
            maxAlertsPerDay: Number(maxAlertsPerDay),
          },
        }
      );

      if (!data.success || !data.data?.preferences) {
        setError(data.message ?? "Could not save alert settings");
        return;
      }

      setPreferences(data.data.preferences);
      setMessage("Alert settings saved.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not save alert settings"));
    } finally {
      setSaving(false);
    }
  }

  async function runManualScan() {
    setScanning(true);
    setError(null);
    setMessage(null);
    try {
      const { data } = await api.post<{
        success: boolean;
        data?: { matchesStored: number; alertsSent: number; newMatches: number };
        message?: string;
      }>("/auto-hunter/scan");

      if (!data.success || !data.data) {
        setError(data.message ?? "Could not run manual scan");
        return;
      }

      setMessage(
        `Manual scan stored ${data.data.matchesStored} matches, found ${data.data.newMatches} new ones, and sent ${data.data.alertsSent} alerts.`
      );
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not run manual scan"));
    } finally {
      setScanning(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 rounded-[28px]" />
        <Skeleton className="h-56 rounded-[28px]" />
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

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Alert delivery rules</CardTitle>
            <CardDescription>
              Strong matches use the same email pipeline as the rest of JobPilot. Your global account email setting is currently{" "}
              <span className="font-medium text-foreground">{user?.emailNotifications ? "enabled" : "disabled"}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <label className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm">
              <Checkbox checked={emailEnabled} onCheckedChange={(checked) => setEmailEnabled(checked === true)} />
              <div>
                <p className="font-medium text-foreground">Send match emails</p>
                <p className="text-xs text-muted-foreground">Only high-quality matches should land in your inbox.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm">
              <Checkbox
                checked={immediateAlertsEnabled}
                onCheckedChange={(checked) => setImmediateAlertsEnabled(checked === true)}
              />
              <div>
                <p className="font-medium text-foreground">Immediate alerts</p>
                <p className="text-xs text-muted-foreground">Email as soon as a strong new posting is discovered.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm">
              <Checkbox
                checked={dailyDigestEnabled}
                onCheckedChange={(checked) => setDailyDigestEnabled(checked === true)}
              />
              <div>
                <p className="font-medium text-foreground">Daily digest</p>
                <p className="text-xs text-muted-foreground">Reserved for future roll-up emails alongside instant alerts.</p>
              </div>
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="min-match-score">Minimum match score</Label>
                <Input
                  id="min-match-score"
                  type="number"
                  min={0}
                  max={100}
                  value={minimumMatchScore}
                  onChange={(event) => setMinimumMatchScore(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="digest-hour">Digest hour</Label>
                <Input
                  id="digest-hour"
                  type="number"
                  min={0}
                  max={23}
                  value={dailyDigestHour}
                  onChange={(event) => setDailyDigestHour(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-alerts">Max alerts / day</Label>
                <Input
                  id="max-alerts"
                  type="number"
                  min={1}
                  max={100}
                  value={maxAlertsPerDay}
                  onChange={(event) => setMaxAlertsPerDay(event.target.value)}
                />
              </div>
            </div>

            <Button onClick={() => void saveAlertSettings()} disabled={saving}>
              {saving ? "Saving..." : "Save alert settings"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Manual scan control</CardTitle>
            <CardDescription>Use this when you want a fresh discovery run right now instead of waiting for the scheduler.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                <Radar className="h-4 w-4 text-primary" />
                Last sweep status
              </div>
              <p className="mt-3 text-lg font-semibold capitalize">
                {profileStatus?.lastScanStatus || "No resume profile yet"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {profileStatus?.lastScanSummary || "Upload a resume and configure preferences before the first scan."}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Last scan at {profileStatus?.lastScanAt ? new Date(profileStatus.lastScanAt).toLocaleString() : "—"}
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                <Mail className="h-4 w-4 text-primary" />
                Current thresholds
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Alerts begin at <span className="font-medium text-foreground">{preferences?.alertSettings.minimumMatchScore ?? 0}%</span>, up to{" "}
                <span className="font-medium text-foreground">{preferences?.alertSettings.maxAlertsPerDay ?? 0}</span> emails per day.
              </p>
            </div>

            <Button onClick={() => void runManualScan()} disabled={scanning}>
              {scanning ? "Scanning..." : "Run manual scan"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
