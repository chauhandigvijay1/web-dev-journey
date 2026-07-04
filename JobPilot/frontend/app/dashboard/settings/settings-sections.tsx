"use client";

import Image from "next/image";
import { RefreshCcw, Download, LogOut, Palette, Save, ShieldCheck, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { accentOptions, themeOptions } from "@/lib/theme";
import { useTheme } from "@/components/theme/theme-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const followUpOptions = [
  { value: 0, label: "No default reminder" },
  { value: 3, label: "3 days" },
  { value: 5, label: "5 days" },
  { value: 7, label: "7 days" },
  { value: 14, label: "14 days" },
];

export const ghostedOptions = [
  { value: 0, label: "Never auto-mark" },
  { value: 14, label: "14 days" },
  { value: 21, label: "21 days" },
  { value: 30, label: "30 days" },
  { value: 45, label: "45 days" },
];

export function SettingSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function escapeCsv(value: unknown): string {
  if (value == null) return "";
  const normalized = Array.isArray(value) ? value.join(" | ") : String(value);
  const stringValue = normalized.replace(/\r?\n/g, " ").trim();
  if (stringValue.includes(",") || stringValue.includes('"')) return `"${stringValue.replace(/"/g, '""')}"`;
  return stringValue;
}

function createJobsCsv(rows: Array<Record<string, unknown>>): string {
  const headers = rows.length > 0 ? Object.keys(rows[0]) : ["_id","title","company","location","jobType","salary","status","expectedSalary","offeredSalary","companyType","confidenceScore","notes","locations","skills","qualification","applyDeadline","workMode","descriptionSummary","originalApplyLink","source","followUpDate","resumeUrl","createdAt","updatedAt"];
  const lines = [headers.join(",")];
  for (const row of rows) lines.push(headers.map((header) => escapeCsv(row[header])).join(","));
  return lines.join("\n");
}

export function ProfileSection({
  name, phone, bio, email, username, profilePic, initials, uploadingImage, savingProfile, profileMessage,
  onNameChange, onPhoneChange, onBioChange, onProfileImageChange, onSave,
}: {
  name: string; phone: string; bio: string; email: string; username: string; profilePic: string;
  initials: string; uploadingImage: boolean; savingProfile: boolean; profileMessage: string | null;
  onNameChange: (v: string) => void; onPhoneChange: (v: string) => void; onBioChange: (v: string) => void;
  onProfileImageChange: (file: File | null) => void; onSave: () => void;
}) {
  return (
    <SettingSection title="Profile management" description="Personalize how your account appears across JobPilot.">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {profilePic ? (
            <Image src={profilePic} alt={name || "Profile"} width={96} height={96} className="h-24 w-24 rounded-3xl border border-border/70 object-cover shadow-sm" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary text-2xl font-semibold text-primary-foreground shadow-sm">{initials}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="profile-image" className="text-sm font-medium">Profile picture</Label>
            <Input id="profile-image" type="file" accept="image/png,image/jpeg,image/webp,image/avif"
              onChange={(e) => { onProfileImageChange(e.target.files?.[0] ?? null); e.target.value = ""; }}
              disabled={uploadingImage} />
            <p className="text-xs text-muted-foreground">JPG, PNG, WEBP, or AVIF up to 5MB.</p>
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Upload className="h-3.5 w-3.5" />
              {uploadingImage ? "Uploading image..." : "Your profile photo updates everywhere in JobPilot."}
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="settings-name">Name</Label>
            <Input id="settings-name" value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-phone">Phone number</Label>
            <Input id="settings-phone" value={phone} onChange={(e) => onPhoneChange(e.target.value)} placeholder="+1 555 123 4567" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="settings-email">Email</Label>
            <Input id="settings-email" value={email} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-username">Username</Label>
            <Input id="settings-username" value={username} disabled />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="settings-bio">Short bio</Label>
          <Textarea id="settings-bio" value={bio} onChange={(e) => onBioChange(e.target.value)} rows={4} maxLength={280}
            placeholder="What kind of roles are you targeting and how do you want to present yourself?" />
          <div className="text-right text-xs text-muted-foreground">{bio.trim().length}/280</div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={onSave} disabled={savingProfile || !name.trim()}>
            <Save className="h-4 w-4" />
            {savingProfile ? "Saving..." : "Save profile"}
          </Button>
          {profileMessage ? <p className="text-sm text-muted-foreground">{profileMessage}</p> : null}
        </div>
      </div>
    </SettingSection>
  );
}

export function PreferencesSection({
  emailNotifications, preferredJobType, preferredLocation, expectedSalaryRange,
  defaultFollowUpDays, autoMarkGhostedDays, timezone, reminderHour, weeklySummaryEnabled,
  savingPreferences, preferencesMessage, browserTimezone,
  onEmailNotificationsChange, onPreferredJobTypeChange, onPreferredLocationChange,
  onExpectedSalaryRangeChange, onDefaultFollowUpDaysChange, onAutoMarkGhostedDaysChange,
  onTimezoneChange, onReminderHourChange, onWeeklySummaryEnabledChange, onSave,
}: {
  emailNotifications: boolean; preferredJobType: string; preferredLocation: string; expectedSalaryRange: string;
  defaultFollowUpDays: number; autoMarkGhostedDays: number; timezone: string; reminderHour: number;
  weeklySummaryEnabled: boolean; savingPreferences: boolean; preferencesMessage: string | null; browserTimezone: string;
  onEmailNotificationsChange: (v: boolean) => void; onPreferredJobTypeChange: (v: string) => void;
  onPreferredLocationChange: (v: string) => void; onExpectedSalaryRangeChange: (v: string) => void;
  onDefaultFollowUpDaysChange: (v: number) => void; onAutoMarkGhostedDaysChange: (v: number) => void;
  onTimezoneChange: (v: string) => void; onReminderHourChange: (v: number) => void;
  onWeeklySummaryEnabledChange: (v: boolean) => void; onSave: () => void;
}) {
  return (
    <SettingSection title="Account preferences" description="Save your notification and default job preferences so new entries start with better defaults.">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Email notifications</p>
            <p className="text-sm text-muted-foreground">Keep reminder emails on for follow-ups, deadline reminders, and weekly summaries.</p>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="email-notifications" checked={emailNotifications} disabled={savingPreferences}
              onCheckedChange={(checked) => onEmailNotificationsChange(checked === true)} />
            <Label htmlFor="email-notifications" className="cursor-pointer">{emailNotifications ? "Enabled" : "Disabled"}</Label>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="preferred-job-type">Preferred job type</Label>
            <Input id="preferred-job-type" value={preferredJobType} onChange={(e) => onPreferredJobTypeChange(e.target.value)} placeholder="Full-time, contract, hybrid..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferred-location">Preferred location</Label>
            <Input id="preferred-location" value={preferredLocation} onChange={(e) => onPreferredLocationChange(e.target.value)} placeholder="Remote, Bengaluru, New York..." />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="expected-salary-range">Expected salary range</Label>
          <Input id="expected-salary-range" value={expectedSalaryRange} onChange={(e) => onExpectedSalaryRangeChange(e.target.value)} placeholder="$120k - $150k / 18-25 LPA" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="default-follow-up">Default follow-up reminder</Label>
            <select id="default-follow-up" value={defaultFollowUpDays} onChange={(e) => onDefaultFollowUpDaysChange(Number(e.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring">
              {followUpOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <p className="text-xs text-muted-foreground">Used to pre-fill follow-up dates for new jobs.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="auto-ghosted">Auto-mark ghosted after</Label>
            <select id="auto-ghosted" value={autoMarkGhostedDays} onChange={(e) => onAutoMarkGhostedDaysChange(Number(e.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring">
              {ghostedOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <p className="text-xs text-muted-foreground">Old inactive jobs fade visually on the board based on this setting.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input id="timezone" value={timezone} onChange={(e) => onTimezoneChange(e.target.value)} placeholder="Asia/Kolkata" />
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Used for reminder delivery timing.</span>
              <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-[11px]" onClick={() => onTimezoneChange(browserTimezone)}>Use browser timezone</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reminder-hour">Reminder send hour</Label>
            <select id="reminder-hour" value={reminderHour} onChange={(e) => onReminderHourChange(Number(e.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring">
              {Array.from({ length: 24 }, (_, hour) => <option key={hour} value={hour}>{hour.toString().padStart(2, "0")}:00</option>)}
            </select>
            <p className="text-xs text-muted-foreground">Follow-up and deadline emails are queued at this local hour.</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Weekly summary email</p>
            <p className="text-sm text-muted-foreground">Receive one weekly pipeline summary with highlights and upcoming follow-ups.</p>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="weekly-summary" checked={weeklySummaryEnabled} disabled={savingPreferences}
              onCheckedChange={(checked) => onWeeklySummaryEnabledChange(checked === true)} />
            <Label htmlFor="weekly-summary" className="cursor-pointer">{weeklySummaryEnabled ? "Enabled" : "Disabled"}</Label>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={onSave} disabled={savingPreferences}>
            <Save className="h-4 w-4" />
            {savingPreferences ? "Saving..." : "Save preferences"}
          </Button>
          {preferencesMessage ? <p className="text-sm text-muted-foreground">{preferencesMessage}</p> : null}
        </div>
      </div>
    </SettingSection>
  );
}

export function SecuritySection({
  authProviders, currentPassword, newPassword, confirmPassword,
  savingPassword, passwordMessage, passwordValidationMessage,
  onCurrentPasswordChange, onNewPasswordChange, onConfirmPasswordChange, onChangePassword,
}: {
  authProviders: { password: boolean; google: boolean };
  currentPassword: string; newPassword: string; confirmPassword: string;
  savingPassword: boolean; passwordMessage: string | null; passwordValidationMessage: string | null;
  onCurrentPasswordChange: (v: string) => void; onNewPasswordChange: (v: string) => void;
  onConfirmPasswordChange: (v: string) => void; onChangePassword: () => void;
}) {
  return (
    <SettingSection title="Security" description="Change your password and manage access to your account.">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={authProviders.password ? "secondary" : "outline"}>{authProviders.password ? "Password sign-in enabled" : "Password sign-in unavailable"}</Badge>
          <Badge variant={authProviders.google ? "secondary" : "outline"}>{authProviders.google ? "Google connected" : "Google not connected"}</Badge>
        </div>
        {!authProviders.password ? (
          <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3 text-sm text-muted-foreground">
            This account signs in with Google. Password changes stay disabled until a password is added.
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current password</Label>
            <Input id="current-password" type="password" value={currentPassword} onChange={(e) => onCurrentPasswordChange(e.target.value)} disabled={!authProviders.password} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input id="new-password" type="password" value={newPassword} onChange={(e) => onNewPasswordChange(e.target.value)} disabled={!authProviders.password} />
            {newPassword ? <p className={cn("text-xs", passwordValidationMessage ? "text-destructive" : "text-muted-foreground")}>{passwordValidationMessage ?? "Strong password."}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => onConfirmPasswordChange(e.target.value)} disabled={!authProviders.password} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={onChangePassword} disabled={savingPassword || !authProviders.password}>
            <ShieldCheck className="h-4 w-4" />
            {savingPassword ? "Updating..." : "Change password"}
          </Button>
          {passwordMessage ? <p className="text-sm text-muted-foreground">{passwordMessage}</p> : null}
        </div>
      </div>
    </SettingSection>
  );
}

export function ThemeSection() {
  const { theme, accent, setTheme, setAccent } = useTheme();
  return (
    <SettingSection title="Theme customization" description="Choose your workspace mood and accent color. Changes apply instantly across the app.">
      <div className="space-y-6">
        <div className="space-y-3">
          {themeOptions.map((option) => {
            const active = option.id === theme;
            return (
              <button key={option.id} type="button" onClick={() => setTheme(option.id)}
                className={cn("w-full rounded-2xl border p-3 text-left transition-all",
                  active ? "border-primary bg-primary/8 shadow-sm ring-2 ring-primary/20" : "border-border/70 bg-background/75 hover:border-primary/35 hover:bg-accent/50")}>
                <div className="flex items-start gap-3">
                  <div className={cn("h-14 w-14 rounded-2xl border border-border/60 shadow-sm", option.previewClass)} />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{option.label}</span>
                      {active ? <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">Active</span> : null}
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Accent color</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {accentOptions.map((option) => {
              const active = option.id === accent;
              return (
                <button key={option.id} type="button" onClick={() => setAccent(option.id)}
                  className={cn("flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors",
                    active ? "border-primary bg-primary/10 text-primary" : "border-border/70 bg-background/75 text-muted-foreground hover:border-primary/35 hover:text-foreground")}>
                  <span className={cn("h-3 w-3 rounded-full", option.previewClass)} />
                  {option.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">Theme and accent choices are saved locally in this browser.</p>
        </div>
      </div>
    </SettingSection>
  );
}

export function DataSection({
  exporting, clearingJobs, dataMessage, onExport, onClearOpen,
}: {
  exporting: boolean; clearingJobs: boolean; dataMessage: string | null;
  onExport: () => void; onClearOpen: () => void;
}) {
  return (
    <SettingSection title="Data management" description="Export your board or reset it when you need a clean slate.">
      <div className="space-y-4">
        <Button variant="outline" className="w-full justify-center" onClick={onExport} disabled={exporting}>
          <Download className="h-4 w-4" />
          {exporting ? "Exporting..." : "Export all jobs (CSV)"}
        </Button>
        <Button variant="destructive" className="w-full justify-center" onClick={onClearOpen} disabled={clearingJobs}>
          <Trash2 className="h-4 w-4" />
          Clear all jobs
        </Button>
        {dataMessage ? <p className="text-sm text-muted-foreground">{dataMessage}</p> : null}
      </div>
    </SettingSection>
  );
}

export function SessionSection({ onLogout }: { onLogout: () => void }) {
  return (
    <SettingSection title="Session" description="Sign out when you are done or switching devices.">
      <Button variant="secondary" className="w-full justify-center" onClick={onLogout}>
        <LogOut className="h-4 w-4" />
        Log out
      </Button>
    </SettingSection>
  );
}

export function ClearJobsDialog({
  open, clearingJobs, onOpenChange, onConfirm,
}: {
  open: boolean; clearingJobs: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !clearingJobs && onOpenChange(o)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear all jobs?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes every job from your board. Export a CSV first if you might need the data later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={clearingJobs}>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={clearingJobs} onClick={onConfirm}>
            {clearingJobs ? <><RefreshCcw className="h-4 w-4 animate-spin" /> Clearing...</> : "Clear all jobs"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { createJobsCsv };
