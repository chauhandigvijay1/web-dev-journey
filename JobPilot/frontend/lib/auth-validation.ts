export const USERNAME_PATTERN = /^(?=.{3,30}$)[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/;

export function normalizeUsernameInput(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/^[._-]+|[._-]+$/g, "")
    .replace(/[._-]{2,}/g, "-")
    .slice(0, 30);
}

export function isValidEmailAddress(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());
}

export function getUsernameValidationMessage(value: string) {
  const normalized = normalizeUsernameInput(value);
  if (!normalized) return "Choose a username to continue.";
  if (!USERNAME_PATTERN.test(normalized)) {
    return "Use 3-30 characters with letters, numbers, dots, dashes, or underscores.";
  }
  return null;
}

export function getPasswordValidationMessage(password: string) {
  if (!password.trim()) {
    return "Create a password to continue.";
  }
  if (password.length < 8) {
    return "Use at least 8 characters.";
  }
  if (!/[a-z]/.test(password)) {
    return "Add at least one lowercase letter.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Add at least one uppercase letter.";
  }
  if (!/\d/.test(password)) {
    return "Add at least one number.";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Add at least one special character.";
  }
  return null;
}
