function isDateInputValue(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function parseFollowUpDate(value?: string | null): Date | null {
  if (!value) return null;

  if (isDateInputValue(value)) {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0, 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function serializeFollowUpDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const date = parseFollowUpDate(trimmed);
  return date ? date.toISOString() : null;
}

export function followUpDateInputValue(value?: string | null): string {
  const date = parseFollowUpDate(value);
  if (!date) return "";

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
