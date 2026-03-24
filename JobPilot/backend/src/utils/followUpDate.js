function isDateOnlyValue(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

export function parseFollowUpDate(value) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  if (isDateOnlyValue(value)) {
    const [year, month, day] = value.trim().split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function getFollowUpDateKey(value) {
  const date = parseFollowUpDate(value);
  if (!date) return "";

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatFollowUpDate(value, locale = "en-US") {
  const date = parseFollowUpDate(value);
  if (!date) return "";

  return new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(date);
}
