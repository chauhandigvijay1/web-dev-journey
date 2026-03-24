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
    },
  };
}

export function readStoredAuth(): { token: string | null; user: StoredUser | null } {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!token || !raw) return { token: null, user: null };
    const user = normalizeStoredUser(JSON.parse(raw) as StoredUser);
    if (!user?.id) return { token: null, user: null };
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export function writeStoredAuth(token: string, user: StoredUser) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(normalizeStoredUser(user)));
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}
