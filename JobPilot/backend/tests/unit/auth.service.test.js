import { describe, expect, it } from "vitest";
import { normalizeSettings, publicUser } from "../../src/services/auth.service.js";

describe("auth.service", () => {
  it("normalizes settings with defaults and bounds", () => {
    const settings = normalizeSettings({
      productivity: {
        defaultFollowUpDays: 99,
        autoMarkGhostedDays: 10,
      },
      notifications: {
        timezone: "Invalid/Zone",
        reminderHour: -4,
        weeklySummaryEnabled: true,
      },
    });

    expect(settings.productivity.defaultFollowUpDays).toBe(5);
    expect(settings.productivity.autoMarkGhostedDays).toBe(10);
    expect(settings.notifications.timezone).toBe("UTC");
    expect(settings.notifications.reminderHour).toBe(9);
    expect(settings.notifications.weeklySummaryEnabled).toBe(true);
  });

  it("normalizes settings with null and empty input", () => {
    expect(normalizeSettings(null)).toBeTruthy();
    expect(normalizeSettings(undefined)).toBeTruthy();
    expect(normalizeSettings({})).toBeTruthy();
    const s = normalizeSettings({});
    expect(s.productivity.defaultFollowUpDays).toBe(5);
    expect(s.notifications.timezone).toBe("UTC");
  });

  it("builds a safe public user payload", () => {
    const user = {
      _id: "user-1",
      name: "Asha",
      username: "asha",
      email: "asha@example.com",
      profilePic: "",
      phone: "",
      bio: "",
      emailNotifications: true,
      hasPassword: true,
      googleId: "",
      settings: {},
      createdAt: "2026-01-01T00:00:00.000Z",
    };

    expect(publicUser(user)).toMatchObject({
      id: "user-1",
      name: "Asha",
      username: "asha",
      email: "asha@example.com",
      authProviders: {
        password: true,
        google: false,
      },
    });
  });
});
