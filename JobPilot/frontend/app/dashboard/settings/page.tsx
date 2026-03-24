"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  Download,
  LogOut,
  Palette,
  RefreshCcw,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import {
  type StoredUser,
  defaultStoredUserSettings,
} from "@/lib/authStorage";
import { getPasswordValidationMessage } from "@/lib/auth-validation";
import { getApiErrorMessage } from "@/lib/httpError";
import { accentOptions, themeOptions } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/theme-provider";
import { api } from "@/services/api";
import { logout, setUser } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
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

type UserResponse = {
  success: boolean;
  data?: { user: StoredUser };
  message?: string;
};

type JobsResponse = {
  success: boolean;
  data?: {
    jobs: Array<Record<string, unknown>>;
    deletedCount?: number;
  };
  message?: string;
};

const followUpOptions = [
  { value: 0, label: "No default reminder" },
  { value: 3, label: "3 days" },
  { value: 5, label: "5 days" },
  { value: 7, label: "7 days" },
  { value: 14, label: "14 days" },
];

const ghostedOptions = [
  { value: 0, label: "Never auto-mark" },
  { value: 14, label: "14 days" },
  { value: 21, label: "21 days" },
  { value: 30, label: "30 days" },
  { value: 45, label: "45 days" },
];

function SettingSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
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
  const stringValue = String(value).replace(/\r?\n/g, " ").trim();
  if (stringValue.includes(",") || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function createJobsCsv(rows: Array<Record<string, unknown>>): string {
  const headers = [
    "_id",
    "title",
    "company",
    "location",
    "jobType",
    "salary",
    "status",
    "expectedSalary",
    "offeredSalary",
    "companyType",
    "confidenceScore",
    "notes",
    "source",
    "followUpDate",
    "resumeUrl",
    "createdAt",
    "updatedAt",
  ];

  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => escapeCsv(row[header])).join(","));
  }
  return lines.join("\n");
}

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { theme, accent, setTheme, setAccent } = useTheme();
  const authProviders = user?.authProviders ?? { password: true, google: false };

  const settings = useMemo(
    () => user?.settings ?? defaultStoredUserSettings,
    [user?.settings]
  );

  const [name, setName] = useState(user?.name ?? "");
  const [email] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [profilePic, setProfilePic] = useState(user?.profilePic ?? "");
  const [emailNotifications, setEmailNotifications] = useState(Boolean(user?.emailNotifications));
  const [preferredJobType, setPreferredJobType] = useState(settings.jobPreferences.preferredJobType);
  const [preferredLocation, setPreferredLocation] = useState(settings.jobPreferences.preferredLocation);
  const [expectedSalaryRange, setExpectedSalaryRange] = useState(
    settings.jobPreferences.expectedSalaryRange
  );
  const [defaultFollowUpDays, setDefaultFollowUpDays] = useState(
    settings.productivity.defaultFollowUpDays
  );
  const [autoMarkGhostedDays, setAutoMarkGhostedDays] = useState(
    settings.productivity.autoMarkGhostedDays
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [clearingJobs, setClearingJobs] = useState(false);
  const [clearJobsOpen, setClearJobsOpen] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [preferencesMessage, setPreferencesMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [dataMessage, setDataMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const passwordValidationMessage = useMemo(
    () => getPasswordValidationMessage(newPassword),
    [newPassword]
  );

  useEffect(() => {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
    setBio(user?.bio ?? "");
    setProfilePic(user?.profilePic ?? "");
    setEmailNotifications(Boolean(user?.emailNotifications));
    setPreferredJobType(settings.jobPreferences.preferredJobType);
    setPreferredLocation(settings.jobPreferences.preferredLocation);
    setExpectedSalaryRange(settings.jobPreferences.expectedSalaryRange);
    setDefaultFollowUpDays(settings.productivity.defaultFollowUpDays);
    setAutoMarkGhostedDays(settings.productivity.autoMarkGhostedDays);
  }, [settings, user]);

  const initials = useMemo(() => {
    const value = name.trim() || user?.name || user?.email || "?";
    return value.charAt(0).toUpperCase();
  }, [name, user?.email, user?.name]);

  async function saveProfile() {
    setError(null);
    setProfileMessage(null);
    setSavingProfile(true);
    try {
      const { data } = await api.patch<UserResponse>("/auth/me", {
        name: name.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        profilePic,
      });
      if (!data.success || !data.data?.user) {
        setError(data.message ?? "Could not update profile");
        return;
      }
      dispatch(setUser(data.data.user));
      setProfileMessage("Profile updated.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not update profile"));
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePreferences() {
    setError(null);
    setPreferencesMessage(null);
    setSavingPreferences(true);
    try {
      const { data } = await api.patch<UserResponse>("/auth/me", {
        emailNotifications,
        settings: {
          jobPreferences: {
            preferredJobType: preferredJobType.trim(),
            preferredLocation: preferredLocation.trim(),
            expectedSalaryRange: expectedSalaryRange.trim(),
          },
          productivity: {
            defaultFollowUpDays,
            autoMarkGhostedDays,
          },
        },
      });
      if (!data.success || !data.data?.user) {
        setError(data.message ?? "Could not save preferences");
        return;
      }
      dispatch(setUser(data.data.user));
      setPreferencesMessage("Preferences saved.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not save preferences"));
    } finally {
      setSavingPreferences(false);
    }
  }

  async function onProfileImageChange(file: File | null) {
    if (!file) return;
    setError(null);
    setProfileMessage(null);
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const uploadResponse = await api.post<{ success: boolean; data?: { url: string }; message?: string }>(
        "/upload/profile-image",
        formData
      );
      if (!uploadResponse.data.success || !uploadResponse.data.data?.url) {
        setError(uploadResponse.data.message ?? "Could not upload image");
        return;
      }
      const imageUrl = uploadResponse.data.data.url;
      setProfilePic(imageUrl);
      const { data } = await api.patch<UserResponse>("/auth/me", {
        profilePic: imageUrl,
      });
      if (!data.success || !data.data?.user) {
        setError(data.message ?? "Could not save profile image");
        return;
      }
      dispatch(setUser(data.data.user));
      setProfileMessage("Profile image updated.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not upload image"));
    } finally {
      setUploadingImage(false);
    }
  }

  async function changePassword() {
    setError(null);
    setPasswordMessage(null);

    if (!authProviders.password) {
      setError("Password sign-in is not enabled for this account.");
      return;
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Fill in all password fields.");
      return;
    }
    if (passwordValidationMessage) {
      setError(passwordValidationMessage);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password confirmation does not match.");
      return;
    }

    setSavingPassword(true);
    try {
      const { data } = await api.post<{ success: boolean; message?: string }>("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      if (!data.success) {
        setError(data.message ?? "Could not change password");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage(data.message ?? "Password changed successfully.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not change password"));
    } finally {
      setSavingPassword(false);
    }
  }

  async function exportJobs() {
    setError(null);
    setDataMessage(null);
    setExporting(true);
    try {
      const { data } = await api.get<JobsResponse>("/jobs");
      if (!data.success || !data.data?.jobs) {
        setError(data.message ?? "Could not export jobs");
        return;
      }
      const csv = createJobsCsv(data.data.jobs);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `jobpilot-jobs-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setDataMessage(`Exported ${data.data.jobs.length} jobs.`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not export jobs"));
    } finally {
      setExporting(false);
    }
  }

  async function clearAllJobs() {
    setError(null);
    setDataMessage(null);
    setClearingJobs(true);
    try {
      const { data } = await api.delete<JobsResponse>("/jobs");
      if (!data.success) {
        setError(data.message ?? "Could not clear jobs");
        return;
      }
      setClearJobsOpen(false);
      setDataMessage(
        `${data.data?.deletedCount ?? 0} ${data.data?.deletedCount === 1 ? "job" : "jobs"} cleared.`
      );
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not clear jobs"));
    } finally {
      setClearingJobs(false);
    }
  }

  function handleLogout() {
    dispatch(logout());
    window.location.assign("/login");
  }

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Profile, defaults, appearance, and data controls for your job search workflow.
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.85fr]">
          <div className="space-y-6">
            <SettingSection title="Profile management" description="Personalize how your account appears across JobPilot.">
              <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {profilePic ? (
                    <Image
                      src={profilePic}
                      alt={name || "Profile"}
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded-3xl border border-border/70 object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary text-2xl font-semibold text-primary-foreground shadow-sm">
                      {initials}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="profile-image" className="text-sm font-medium">
                      Profile picture
                    </Label>
                    <Input
                      id="profile-image"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/avif"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        void onProfileImageChange(file);
                        event.target.value = "";
                      }}
                      disabled={uploadingImage}
                    />
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
                    <Input
                      id="settings-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-phone">Phone number</Label>
                    <Input
                      id="settings-phone"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+1 555 123 4567"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="settings-email">Email</Label>
                    <Input id="settings-email" value={email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-username">Username</Label>
                    <Input id="settings-username" value={user?.username ?? ""} disabled />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settings-bio">Short bio</Label>
                  <Textarea
                    id="settings-bio"
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    rows={4}
                    maxLength={280}
                    placeholder="What kind of roles are you targeting and how do you want to present yourself?"
                  />
                  <div className="text-right text-xs text-muted-foreground">{bio.trim().length}/280</div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={() => void saveProfile()} disabled={savingProfile || !name.trim()}>
                    <Save className="h-4 w-4" />
                    {savingProfile ? "Saving..." : "Save profile"}
                  </Button>
                  {profileMessage ? <p className="text-sm text-muted-foreground">{profileMessage}</p> : null}
                </div>
              </div>
            </SettingSection>

            <SettingSection
              title="Account preferences"
              description="Save your notification and default job preferences so new entries start with better defaults."
            >
              <div className="space-y-6">
                <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Email notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Keep reminder emails on for automatic follow-up emails and job tracking updates.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="email-notifications"
                      checked={emailNotifications}
                      disabled={savingPreferences}
                      onCheckedChange={(checked) => setEmailNotifications(checked === true)}
                    />
                    <Label htmlFor="email-notifications" className="cursor-pointer">
                      {emailNotifications ? "Enabled" : "Disabled"}
                    </Label>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="preferred-job-type">Preferred job type</Label>
                    <Input
                      id="preferred-job-type"
                      value={preferredJobType}
                      onChange={(event) => setPreferredJobType(event.target.value)}
                      placeholder="Full-time, contract, hybrid..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferred-location">Preferred location</Label>
                    <Input
                      id="preferred-location"
                      value={preferredLocation}
                      onChange={(event) => setPreferredLocation(event.target.value)}
                      placeholder="Remote, Bengaluru, New York..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expected-salary-range">Expected salary range</Label>
                  <Input
                    id="expected-salary-range"
                    value={expectedSalaryRange}
                    onChange={(event) => setExpectedSalaryRange(event.target.value)}
                    placeholder="$120k - $150k / 18-25 LPA"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="default-follow-up">Default follow-up reminder</Label>
                    <select
                      id="default-follow-up"
                      value={defaultFollowUpDays}
                      onChange={(event) => setDefaultFollowUpDays(Number(event.target.value))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {followUpOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Used to pre-fill follow-up dates for new jobs.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auto-ghosted">Auto-mark ghosted after</Label>
                    <select
                      id="auto-ghosted"
                      value={autoMarkGhostedDays}
                      onChange={(event) => setAutoMarkGhostedDays(Number(event.target.value))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {ghostedOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Old inactive jobs fade visually on the board based on this setting.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={() => void savePreferences()} disabled={savingPreferences}>
                    <Save className="h-4 w-4" />
                    {savingPreferences ? "Saving..." : "Save preferences"}
                  </Button>
                  {preferencesMessage ? <p className="text-sm text-muted-foreground">{preferencesMessage}</p> : null}
                </div>
              </div>
            </SettingSection>

            <SettingSection title="Security" description="Change your password and manage access to your account.">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={authProviders.password ? "secondary" : "outline"}>
                    {authProviders.password ? "Password sign-in enabled" : "Password sign-in unavailable"}
                  </Badge>
                  <Badge variant={authProviders.google ? "secondary" : "outline"}>
                    {authProviders.google ? "Google connected" : "Google not connected"}
                  </Badge>
                </div>
                {!authProviders.password ? (
                  <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3 text-sm text-muted-foreground">
                    This account signs in with Google. Password changes stay disabled until a password is added.
                  </div>
                ) : null}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      disabled={!authProviders.password}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      disabled={!authProviders.password}
                    />
                    {newPassword ? (
                      <p
                        className={cn(
                          "text-xs",
                          passwordValidationMessage ? "text-destructive" : "text-muted-foreground"
                        )}
                      >
                        {passwordValidationMessage ?? "Strong password."}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm new password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      disabled={!authProviders.password}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => void changePassword()}
                    disabled={savingPassword || !authProviders.password}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {savingPassword ? "Updating..." : "Change password"}
                  </Button>
                  {passwordMessage ? <p className="text-sm text-muted-foreground">{passwordMessage}</p> : null}
                </div>
              </div>
            </SettingSection>
          </div>

          <div className="space-y-6">
            <SettingSection
              title="Theme customization"
              description="Choose your workspace mood and accent color. Changes apply instantly across the app."
            >
              <div className="space-y-6">
                <div className="space-y-3">
                  {themeOptions.map((option) => {
                    const active = option.id === theme;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setTheme(option.id)}
                        className={cn(
                          "w-full rounded-2xl border p-3 text-left transition-all",
                          active
                            ? "border-primary bg-primary/8 shadow-sm ring-2 ring-primary/20"
                            : "border-border/70 bg-background/75 hover:border-primary/35 hover:bg-accent/50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "h-14 w-14 rounded-2xl border border-border/60 shadow-sm",
                              option.previewClass
                            )}
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">{option.label}</span>
                              {active ? (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                                  Active
                                </span>
                              ) : null}
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
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setAccent(option.id)}
                          className={cn(
                            "flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors",
                            active
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/70 bg-background/75 text-muted-foreground hover:border-primary/35 hover:text-foreground"
                          )}
                        >
                          <span className={cn("h-3 w-3 rounded-full", option.previewClass)} />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Theme and accent choices are saved locally in this browser.
                  </p>
                </div>
              </div>
            </SettingSection>

            <SettingSection title="Data management" description="Export your board or reset it when you need a clean slate.">
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-center" onClick={() => void exportJobs()} disabled={exporting}>
                  <Download className="h-4 w-4" />
                  {exporting ? "Exporting..." : "Export all jobs (CSV)"}
                </Button>
                <Button
                  variant="destructive"
                  className="w-full justify-center"
                  onClick={() => setClearJobsOpen(true)}
                  disabled={clearingJobs}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear all jobs
                </Button>
                {dataMessage ? <p className="text-sm text-muted-foreground">{dataMessage}</p> : null}
              </div>
            </SettingSection>

            <SettingSection title="Session" description="Sign out when you are done or switching devices.">
              <Button variant="secondary" className="w-full justify-center" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Log out
              </Button>
            </SettingSection>
          </div>
        </div>
      </div>

      <AlertDialog open={clearJobsOpen} onOpenChange={(open) => !clearingJobs && setClearJobsOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all jobs?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes every job from your board. Export a CSV first if you might need the data later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearingJobs}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={clearingJobs}
              onClick={() => void clearAllJobs()}
            >
              {clearingJobs ? (
                <>
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                  Clearing...
                </>
              ) : (
                "Clear all jobs"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
