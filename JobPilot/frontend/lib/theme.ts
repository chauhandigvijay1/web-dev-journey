export const THEME_STORAGE_KEY = "jobpilot_theme";
export const ACCENT_STORAGE_KEY = "jobpilot_accent";

const legacyThemeAliases = {
  "gradient-blue": "midnight-blue",
  "gradient-mint": "forest-green",
  "gradient-sunset": "sunset-gradient",
  pilgrimism: "minimal-pilgrimism",
} as const;

export const themeOptions = [
  {
    id: "light",
    label: "Light",
    description: "Bright neutral surfaces with clean contrast.",
    previewClass: "bg-[linear-gradient(135deg,#ffffff,#e2e8f0)]",
  },
  {
    id: "dark",
    label: "Dark",
    description: "Classic dark mode with balanced contrast.",
    previewClass: "bg-[linear-gradient(135deg,#020617,#111827)]",
  },
  {
    id: "midnight-blue",
    label: "Blue",
    description: "Deep blue surfaces with cool contrast across the workspace.",
    previewClass: "bg-[linear-gradient(135deg,#0f172a,#1d4ed8_58%,#93c5fd)]",
  },
  {
    id: "forest-green",
    label: "Green",
    description: "Fresh green panels with calm, readable contrast.",
    previewClass: "bg-[linear-gradient(135deg,#ecfdf5,#14532d_58%,#86efac)]",
  },
  {
    id: "sunset-gradient",
    label: "Gradient",
    description: "Warm blended surfaces with coral and amber highlights.",
    previewClass: "bg-[linear-gradient(135deg,#fff7ed,#fb7185_58%,#fdba74)]",
  },
  {
    id: "purple-neon",
    label: "Purple",
    description: "High-contrast violet surfaces with a richer dark glow.",
    previewClass: "bg-[linear-gradient(135deg,#0f0720,#7c3aed_52%,#e879f9)]",
  },
  {
    id: "minimal-pilgrimism",
    label: "Minimal",
    description: "Soft paper tones with restrained contrast and a polished feel.",
    previewClass: "bg-[linear-gradient(135deg,#faf7f0,#d6d3d1_58%,#f5f5f4)]",
  },
] as const;

export const accentOptions = [
  {
    id: "blue",
    label: "Blue",
    primary: "221 83% 53%",
    primaryForeground: "210 40% 98%",
    ring: "221 83% 53%",
    previewClass: "bg-[#2563eb]",
  },
  {
    id: "emerald",
    label: "Emerald",
    primary: "160 84% 39%",
    primaryForeground: "210 40% 98%",
    ring: "160 84% 39%",
    previewClass: "bg-[#10b981]",
  },
  {
    id: "violet",
    label: "Violet",
    primary: "262 83% 58%",
    primaryForeground: "210 40% 98%",
    ring: "262 83% 58%",
    previewClass: "bg-[#7c3aed]",
  },
  {
    id: "rose",
    label: "Rose",
    primary: "343 82% 54%",
    primaryForeground: "210 40% 98%",
    ring: "343 82% 54%",
    previewClass: "bg-[#f43f5e]",
  },
  {
    id: "amber",
    label: "Amber",
    primary: "38 92% 50%",
    primaryForeground: "24 10% 10%",
    ring: "38 92% 50%",
    previewClass: "bg-[#f59e0b]",
  },
  {
    id: "slate",
    label: "Slate",
    primary: "215 19% 35%",
    primaryForeground: "210 40% 98%",
    ring: "215 19% 35%",
    previewClass: "bg-[#475569]",
  },
] as const;

export type ThemeId = (typeof themeOptions)[number]["id"];
export type AccentId = (typeof accentOptions)[number]["id"];

const themeIds = new Set<ThemeId>(themeOptions.map((theme) => theme.id));
const accentIds = new Set<AccentId>(accentOptions.map((accent) => accent.id));
const darkThemeIds = new Set<ThemeId>(["dark", "midnight-blue", "purple-neon"]);

export const defaultTheme: ThemeId = "light";
export const defaultAccent: AccentId = "blue";

export const themeAccentDefaults: Record<ThemeId, AccentId> = {
  light: "blue",
  dark: "slate",
  "midnight-blue": "blue",
  "forest-green": "emerald",
  "sunset-gradient": "rose",
  "purple-neon": "violet",
  "minimal-pilgrimism": "slate",
};

function themeClassName(theme: ThemeId): string {
  return `theme-${theme}`;
}

export const themeClassNames = themeOptions.map((theme) => themeClassName(theme.id));

function resolveThemeAlias(value: string | null | undefined): string | null | undefined {
  if (value == null) return value;
  return legacyThemeAliases[value as keyof typeof legacyThemeAliases] || value;
}

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return value != null && themeIds.has(value as ThemeId);
}

export function isAccentId(value: string | null | undefined): value is AccentId {
  return value != null && accentIds.has(value as AccentId);
}

export function isDarkTheme(theme: ThemeId): boolean {
  return darkThemeIds.has(theme);
}

export function normalizeTheme(value: string | null | undefined): ThemeId {
  const resolved = resolveThemeAlias(value);
  return isThemeId(resolved) ? resolved : defaultTheme;
}

export function normalizeAccent(value: string | null | undefined): AccentId {
  return isAccentId(value) ? value : defaultAccent;
}

export function readStoredTheme(): ThemeId {
  if (typeof window === "undefined") return defaultTheme;
  return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
}

export function readStoredAccent(): AccentId {
  if (typeof window === "undefined") return defaultAccent;
  return normalizeAccent(window.localStorage.getItem(ACCENT_STORAGE_KEY));
}

export function persistTheme(theme: ThemeId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function persistAccent(accent: AccentId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCENT_STORAGE_KEY, accent);
}

export function applyThemeToDocument(
  theme: ThemeId,
  root: HTMLElement | null = typeof document === "undefined" ? null : document.documentElement
) {
  if (!root) return;
  root.classList.remove(...themeClassNames);
  root.classList.remove("dark");
  root.classList.add(themeClassName(theme));
  if (isDarkTheme(theme)) {
    root.classList.add("dark");
  }
  root.dataset.theme = theme;
}

export function applyAccentToDocument(
  accent: AccentId,
  root: HTMLElement | null = typeof document === "undefined" ? null : document.documentElement
) {
  if (!root) return;
  root.dataset.accent = accent;
}

export function getThemeInitScript(): string {
  return `
    (function () {
      var themeStorageKey = ${JSON.stringify(THEME_STORAGE_KEY)};
      var accentStorageKey = ${JSON.stringify(ACCENT_STORAGE_KEY)};
      var fallbackTheme = ${JSON.stringify(defaultTheme)};
      var fallbackAccent = ${JSON.stringify(defaultAccent)};
      var validThemes = ${JSON.stringify(themeOptions.map((theme) => theme.id))};
      var validAccents = ${JSON.stringify(accentOptions.map((accent) => accent.id))};
      var darkThemes = ${JSON.stringify(Array.from(darkThemeIds))};
      var legacyAliases = ${JSON.stringify(legacyThemeAliases)};
      var root = document.documentElement;
      var storedTheme = null;
      var storedAccent = null;
      try {
        storedTheme = window.localStorage.getItem(themeStorageKey);
        storedAccent = window.localStorage.getItem(accentStorageKey);
      } catch (error) {}
      var resolvedTheme = legacyAliases[storedTheme] || storedTheme;
      var theme = validThemes.indexOf(resolvedTheme) >= 0 ? resolvedTheme : fallbackTheme;
      var accent = validAccents.indexOf(storedAccent) >= 0 ? storedAccent : fallbackAccent;
      for (var i = 0; i < validThemes.length; i += 1) {
        root.classList.remove("theme-" + validThemes[i]);
      }
      root.classList.remove("dark");
      root.classList.add("theme-" + theme);
      if (darkThemes.indexOf(theme) >= 0) root.classList.add("dark");
      root.dataset.theme = theme;
      root.dataset.accent = accent;
    })();
  `;
}
