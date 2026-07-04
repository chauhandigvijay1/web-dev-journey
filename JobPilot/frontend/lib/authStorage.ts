const memoryStorage = new Map<string, string>();

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return memoryStorage.get(key) ?? null;
  }
}

function safeSetItem(key: string, value: string): void {
  const old = safeGetItem(key);
  try {
    localStorage.setItem(key, value);
  } catch {
    memoryStorage.set(key, value);
  }
  if (value !== old && typeof window !== "undefined") {
    window.dispatchEvent(new Event("jobpilot:auth-updated"));
  }
}

function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    memoryStorage.delete(key);
  }
}

export const AUTH_TOKEN_KEY = "jobpilot_token";
export const AUTH_USER_KEY = "jobpilot_user";

export type StoredUserSettings = {
  jobPreferences: {
    preferredJobType: string;
    preferredLocation: string;
    expectedSalaryRange: string;
  };
  productivity: {
    defaultFollowUpDays: number;
    autoMarkGhostedDays: number;
  };
  notifications: {
    timezone: string;
    reminderHour: number;
    weeklySummaryEnabled: boolean;
  };
};

export const defaultStoredUserSettings: StoredUserSettings = {
  jobPreferences: {
    preferredJobType: "",
    preferredLocation: "",
    expectedSalaryRange: "",
  },
  productivity: {
    defaultFollowUpDays: 5,
    autoMarkGhostedDays: 21,
  },
  notifications: {
    timezone: "UTC",
    reminderHour: 9,
    weeklySummaryEnabled: false,
  },
};

export type StoredUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  profilePic?: string;
  phone?: string;
  bio?: string;
  emailNotifications: boolean;
  authProviders?: {
    password: boolean;
    google: boolean;
  };
  settings?: StoredUserSettings;
  createdAt?: string;
};

export function normalizeStoredUser(user: StoredUser): StoredUser {
  return {
    ...user,
    username: user.username ?? "",
    profilePic: user.profilePic ?? "",
    phone: user.phone ?? "",
    bio: user.bio ?? "",
    authProviders: {
      password: user.authProviders?.password ?? true,
      google: user.authProviders?.google ?? false,
    },
    settings: {
      jobPreferences: {
        preferredJobType: user.settings?.jobPreferences?.preferredJobType ?? "",
        preferredLocation: user.settings?.jobPreferences?.preferredLocation ?? "",
        expectedSalaryRange: user.settings?.jobPreferences?.expectedSalaryRange ?? "",
      },
      productivity: {
        defaultFollowUpDays:
          user.settings?.productivity?.defaultFollowUpDays ??
          defaultStoredUserSettings.productivity.defaultFollowUpDays,
        autoMarkGhostedDays:
          user.settings?.productivity?.autoMarkGhostedDays ??
          defaultStoredUserSettings.productivity.autoMarkGhostedDays,
      },
      notifications: {
        timezone:
          user.settings?.notifications?.timezone ??
          defaultStoredUserSettings.notifications.timezone,
        reminderHour:
          user.settings?.notifications?.reminderHour ??
          defaultStoredUserSettings.notifications.reminderHour,
        weeklySummaryEnabled:
          user.settings?.notifications?.weeklySummaryEnabled ??
          defaultStoredUserSettings.notifications.weeklySummaryEnabled,
      },
    },
  };
}

export function readStoredAuth(): { token: string | null; user: StoredUser | null } {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }
  try {
    const token = safeGetItem(AUTH_TOKEN_KEY);
    const raw = safeGetItem(AUTH_USER_KEY);
    if (!token || !raw) return { token: null, user: null };
    const user = normalizeStoredUser(JSON.parse(raw) as StoredUser);
    if (!user?.id) return { token: null, user: null };
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export function writeStoredAuth(token: string, user: StoredUser) {
  safeSetItem(AUTH_TOKEN_KEY, token);
  safeSetItem(AUTH_USER_KEY, JSON.stringify(normalizeStoredUser(user)));
}

export function clearStoredAuth() {
  safeRemoveItem(AUTH_TOKEN_KEY);
  safeRemoveItem(AUTH_USER_KEY);
}
