"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type StoredUser,
  defaultStoredUserSettings,
} from "@/lib/authStorage";
import { getPasswordValidationMessage } from "@/lib/auth-validation";
import { getApiErrorMessage } from "@/lib/httpError";
import { api } from "@/services/api";
import { logout, setUser } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  ProfileSection,
  PreferencesSection,
  SecuritySection,
  ThemeSection,
  DataSection,
  SessionSection,
  ClearJobsDialog,
  createJobsCsv,
} from "./settings-sections";

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

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
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
  const [timezone, setTimezone] = useState(settings.notifications.timezone);
  const [reminderHour, setReminderHour] = useState(settings.notifications.reminderHour);
  const [weeklySummaryEnabled, setWeeklySummaryEnabled] = useState(
    settings.notifications.weeklySummaryEnabled
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
    setTimezone(settings.notifications.timezone);
    setReminderHour(settings.notifications.reminderHour);
    setWeeklySummaryEnabled(settings.notifications.weeklySummaryEnabled);
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
          notifications: {
            timezone: timezone.trim() || browserTimezone,
            reminderHour,
            weeklySummaryEnabled,
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
    void api.post("/auth/logout").catch(() => undefined);
    dispatch(logout());
    window.location.assign("/login");
  }

  const browserTimezone =
    typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";

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
            <ProfileSection
              name={name} phone={phone} bio={bio} email={email} username={user?.username ?? ""}
              profilePic={profilePic} initials={initials} uploadingImage={uploadingImage}
              savingProfile={savingProfile} profileMessage={profileMessage}
              onNameChange={setName} onPhoneChange={setPhone} onBioChange={setBio}
              onProfileImageChange={onProfileImageChange} onSave={saveProfile}
            />
            <PreferencesSection
              emailNotifications={emailNotifications} preferredJobType={preferredJobType}
              preferredLocation={preferredLocation} expectedSalaryRange={expectedSalaryRange}
              defaultFollowUpDays={defaultFollowUpDays} autoMarkGhostedDays={autoMarkGhostedDays}
              timezone={timezone} reminderHour={reminderHour}
              weeklySummaryEnabled={weeklySummaryEnabled} savingPreferences={savingPreferences}
              preferencesMessage={preferencesMessage} browserTimezone={browserTimezone}
              onEmailNotificationsChange={setEmailNotifications}
              onPreferredJobTypeChange={setPreferredJobType}
              onPreferredLocationChange={setPreferredLocation}
              onExpectedSalaryRangeChange={setExpectedSalaryRange}
              onDefaultFollowUpDaysChange={setDefaultFollowUpDays}
              onAutoMarkGhostedDaysChange={setAutoMarkGhostedDays}
              onTimezoneChange={setTimezone} onReminderHourChange={setReminderHour}
              onWeeklySummaryEnabledChange={setWeeklySummaryEnabled} onSave={savePreferences}
            />
            <SecuritySection
              authProviders={authProviders} currentPassword={currentPassword}
              newPassword={newPassword} confirmPassword={confirmPassword}
              savingPassword={savingPassword} passwordMessage={passwordMessage}
              passwordValidationMessage={passwordValidationMessage}
              onCurrentPasswordChange={setCurrentPassword}
              onNewPasswordChange={setNewPassword}
              onConfirmPasswordChange={setConfirmPassword} onChangePassword={changePassword}
            />
          </div>

          <div className="space-y-6">
            <ThemeSection />
            <DataSection
              exporting={exporting} clearingJobs={clearingJobs} dataMessage={dataMessage}
              onExport={exportJobs} onClearOpen={() => setClearJobsOpen(true)}
            />
            <SessionSection onLogout={handleLogout} />
          </div>
        </div>
      </div>

      <ClearJobsDialog
        open={clearJobsOpen} clearingJobs={clearingJobs}
        onOpenChange={setClearJobsOpen} onConfirm={clearAllJobs}
      />
    </>
  );
}
