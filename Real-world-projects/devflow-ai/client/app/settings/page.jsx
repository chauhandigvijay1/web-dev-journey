"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/protected-route";
import DashboardShell from "@/components/layout/dashboard-shell";
import ThemeToggle from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

const regionOptions = [
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Africa",
  "Oceania",
];

const languageOptions = ["English", "Hindi", "Spanish", "French", "German"];
const countryOptions = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
];
const timezoneOptions = ["UTC+5:30", "UTC+0", "UTC-5", "UTC+1", "UTC+8", "UTC+9"];
const startPageOptions = ["Dashboard", "Chat", "Account", "Settings"];

function SettingsTile({ id, title, subtitle, activeTile, setActiveTile, children }) {
  const open = activeTile === id;
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-900">
      <button
        type="button"
        onClick={() => setActiveTile(open ? "" : id)}
        className="flex w-full items-center justify-between px-6 py-5 text-left"
      >
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-zinc-500">{subtitle}</p>
        </div>
        <span className="text-sm text-zinc-500">{open ? "Close" : "Open"}</span>
      </button>
      {open && <div className="border-t border-zinc-200 px-6 py-5 dark:border-zinc-800">{children}</div>}
    </div>
  );
}

export default function SettingsPage() {
  const [userKey, setUserKey] = useState("anonymous");
  const [nickname, setNickname] = useState("");
  const [interests, setInterests] = useState("");
  const [region, setRegion] = useState("Asia");
  const [language, setLanguage] = useState("English");
  const [country, setCountry] = useState("India");
  const [timezone, setTimezone] = useState("UTC+5:30");
  const [startPage, setStartPage] = useState("Dashboard");
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [activeTile, setActiveTile] = useState("personalization");
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [messageByTile, setMessageByTile] = useState({
    personalization: "",
    preferences: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const { data: meData } = await api.get("/api/auth/me");
        const userId = meData?.data?._id || meData?.data?.id || "anonymous";
        const key = `devflow_settings_${userId}`;
        setUserKey(key);

        // Load from server first
        try {
          const { data: settingsData } = await api.get("/api/auth/settings");
          const s = settingsData?.data || {};
          if (Object.keys(s).length > 0) {
            setNickname(s.nickname || "");
            setInterests(s.interests || "");
            setRegion(s.region || "Asia");
            setLanguage(s.language || "English");
            setCountry(s.country || "India");
            setTimezone(s.timezone || "UTC+5:30");
            setStartPage(s.startPage || "Dashboard");
            setEmailUpdates(s.emailUpdates ?? true);
            setCompactMode(s.compactMode ?? false);
            return;
          }
        } catch {
          // fall through to localStorage
        }

        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          setNickname(parsed.nickname || "");
          setInterests(parsed.interests || "");
          setRegion(parsed.region || "Asia");
          setLanguage(parsed.language || "English");
          setCountry(parsed.country || "India");
          setTimezone(parsed.timezone || "UTC+5:30");
          setStartPage(parsed.startPage || "Dashboard");
          setEmailUpdates(parsed.emailUpdates ?? true);
          setCompactMode(parsed.compactMode ?? false);
        }
      } catch {
        const fallbackKey = "devflow_settings_anonymous";
        setUserKey(fallbackKey);
        const raw = localStorage.getItem(fallbackKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          setNickname(parsed.nickname || "");
          setInterests(parsed.interests || "");
          setRegion(parsed.region || "Asia");
          setLanguage(parsed.language || "English");
          setCountry(parsed.country || "India");
          setTimezone(parsed.timezone || "UTC+5:30");
          setStartPage(parsed.startPage || "Dashboard");
          setEmailUpdates(parsed.emailUpdates ?? true);
          setCompactMode(parsed.compactMode ?? false);
        }
      }
    };
    load();
  }, []);

  const persistAllSettings = async () => {
    const payload = {
      nickname: nickname.trim(),
      interests: interests.trim(),
      region,
      language,
      country,
      timezone,
      startPage,
      emailUpdates,
      compactMode,
    };
    localStorage.setItem(userKey, JSON.stringify(payload));
    try {
      await api.put("/api/auth/settings", payload);
    } catch {
      // server sync is best-effort
    }
  };

  const savePersonalization = () => {
    persistAllSettings();
    setMessageByTile((prev) => ({ ...prev, personalization: "Personalization saved." }));
    setTimeout(
      () => setMessageByTile((prev) => ({ ...prev, personalization: "" })),
      1200
    );
  };

  const savePreferences = () => {
    persistAllSettings();
    setMessageByTile((prev) => ({ ...prev, preferences: "Preferences saved." }));
    setTimeout(() => setMessageByTile((prev) => ({ ...prev, preferences: "" })), 1200);
  };

  const onDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      setDeleteError("Please type DELETE to confirm.");
      return;
    }
    if (deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await api.delete("/api/auth/me");
      localStorage.removeItem("devflow_token");
      window.location.href = "/login";
    } catch (error) {
      setDeleteError(error?.response?.data?.message || "Failed to delete account.");
      setDeleting(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardShell>
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="mt-1 text-sm text-zinc-500">Manage your preferences and app information.</p>
          </div>

          <SettingsTile
            id="personalization"
            title="Personalization"
            subtitle="Nickname, interests, language and regional preferences."
            activeTile={activeTile}
            setActiveTile={setActiveTile}
          >
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Nickname</label>
                <Input
                  placeholder="Add your nickname"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Interests</label>
                <Input
                  placeholder="e.g. AI, React, Node.js"
                  value={interests}
                  onChange={(event) => setInterests(event.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Region</label>
                  <select
                    value={region}
                    onChange={(event) => setRegion(event.target.value)}
                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:ring-cyan-400"
                  >
                    {regionOptions.map((item) => (
                      <option key={item} value={item} className="bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50">
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Language</label>
                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:ring-cyan-400"
                  >
                    {languageOptions.map((item) => (
                      <option key={item} value={item} className="bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50">
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Country</label>
                  <select
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:ring-cyan-400"
                  >
                    {countryOptions.map((item) => (
                      <option key={item} value={item} className="bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50">
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(event) => setTimezone(event.target.value)}
                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:ring-cyan-400"
                  >
                    {timezoneOptions.map((item) => (
                      <option key={item} value={item} className="bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50">
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={savePersonalization}>Save Personalization</Button>
                {messageByTile.personalization && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    {messageByTile.personalization}
                  </p>
                )}
              </div>
            </div>
          </SettingsTile>

          <SettingsTile
            id="preferences"
            title="Preferences"
            subtitle="Appearance and product behavior preferences."
            activeTile={activeTile}
            setActiveTile={setActiveTile}
          >
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Appearance</label>
                <p className="mb-2 text-sm text-zinc-500">Toggle between light and dark mode.</p>
                <ThemeToggle />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Start Page</label>
                <select
                  value={startPage}
                  onChange={(event) => setStartPage(event.target.value)}
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:ring-cyan-400"
                >
                  {startPageOptions.map((item) => (
                    <option key={item} value={item} className="bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50">
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={emailUpdates}
                  onChange={(event) => setEmailUpdates(event.target.checked)}
                />
                Receive product updates by email
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={compactMode}
                  onChange={(event) => setCompactMode(event.target.checked)}
                />
                Enable compact layout mode
              </label>

              <div className="flex items-center gap-3">
                <Button onClick={savePreferences}>Save Preferences</Button>
                {messageByTile.preferences && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    {messageByTile.preferences}
                  </p>
                )}
              </div>
            </div>
          </SettingsTile>

          <SettingsTile
            id="about"
            title="About"
            subtitle="Developer profile and app details."
            activeTile={activeTile}
            setActiveTile={setActiveTile}
          >
            <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
              <p><span className="font-medium">Name:</span> Digvijay Singh</p>
              <p><span className="font-medium">Role:</span> Full stack Developer</p>
              <p>
                DevFlow AI is a MERN + Next.js AI SaaS platform designed for modern developer
                workflows. It helps users create chat sessions, interact with AI for coding
                support, manage account settings, and personalize experience in a dashboard-style
                interface.
              </p>
              <p>
                The app focuses on productivity, clean UI, and practical AI assistance for writing,
                debugging, learning, and maintaining code with a smooth real-world experience.
              </p>
            </div>
          </SettingsTile>

          <SettingsTile
            id="help"
            title="Help"
            subtitle="Support and contact information."
            activeTile={activeTile}
            setActiveTile={setActiveTile}
          >
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Send your query to:{" "}
              <a className="underline" href="mailto:chauhandigvijay669@gmail.com">
                chauhandigvijay669@gmail.com
              </a>
            </p>
          </SettingsTile>
          <SettingsTile
            id="danger"
            title="Danger Zone"
            subtitle="Permanently delete your account and data."
            activeTile={activeTile}
            setActiveTile={setActiveTile}
          >
            <div className="space-y-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button variant="destructive" onClick={() => setShowDeletePrompt(true)}>
                Delete Account
              </Button>
            </div>
          </SettingsTile>
        </div>

        {showDeletePrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-xl border bg-white p-5 dark:bg-zinc-900">
              <h3 className="text-lg font-semibold text-red-600">Delete Account?</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                This action cannot be undone. Your account access will be removed. Type <strong>DELETE</strong> below to confirm.
              </p>
              <Input
                className="mt-4"
                placeholder="DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
              />
              {deleteError && <p className="mt-2 text-sm text-red-500">{deleteError}</p>}
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" disabled={deleting} onClick={() => { setShowDeletePrompt(false); setDeleteConfirmText(""); setDeleteError(""); }}>
                  Keep Account
                </Button>
                <Button
                  variant="destructive"
                  disabled={deleting || deleteConfirmText !== "DELETE"}
                  onClick={onDeleteAccount}
                >
                  {deleting ? "Deleting..." : "Delete Account"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
