import { describe, expect, it } from "vitest";
import {
  normalizeUsernameInput,
  isValidEmailAddress,
  getUsernameValidationMessage,
  getPasswordValidationMessage,
} from "@/lib/auth-validation";

describe("normalizeUsernameInput", () => {
  it("lowercases and trims", () => {
    expect(normalizeUsernameInput("  JohnDoe  ")).toBe("johndoe");
  });

  it("replaces spaces with hyphens", () => {
    expect(normalizeUsernameInput("john doe")).toBe("john-doe");
  });

  it("removes special characters", () => {
    expect(normalizeUsernameInput("john@doe!")).toBe("johndoe");
  });

  it("allows dots, hyphens, underscores", () => {
    expect(normalizeUsernameInput("john.doe_23")).toBe("john.doe_23");
  });

  it("strips leading/trailing dots, hyphens, underscores", () => {
    expect(normalizeUsernameInput("...john...")).toBe("john");
  });

  it("collapses consecutive separators", () => {
    expect(normalizeUsernameInput("john--doe__test")).toBe("john-doe-test");
  });

  it("limits to 30 characters", () => {
    expect(normalizeUsernameInput("a".repeat(50))).toHaveLength(30);
  });

  it("returns empty for whitespace-only", () => {
    expect(normalizeUsernameInput("   ")).toBe("");
  });

  it("handles empty string", () => {
    expect(normalizeUsernameInput("")).toBe("");
  });
});

describe("isValidEmailAddress", () => {
  it("accepts valid emails", () => {
    expect(isValidEmailAddress("user@example.com")).toBe(true);
    expect(isValidEmailAddress("test.user@domain.co")).toBe(true);
    expect(isValidEmailAddress("user+tag@example.org")).toBe(true);
  });

  it("rejects emails without @", () => {
    expect(isValidEmailAddress("userexample.com")).toBe(false);
  });

  it("rejects emails without domain", () => {
    expect(isValidEmailAddress("user@")).toBe(false);
  });

  it("rejects emails without tld", () => {
    expect(isValidEmailAddress("user@example")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidEmailAddress("")).toBe(false);
  });

  it("trims input before validating", () => {
    expect(isValidEmailAddress("  user@example.com  ")).toBe(true);
  });
});

describe("getUsernameValidationMessage", () => {
  it("prompts for empty input", () => {
    expect(getUsernameValidationMessage("")).toBe("Choose a username to continue.");
  });

  it("returns null for valid input", () => {
    expect(getUsernameValidationMessage("johndoe")).toBeNull();
    expect(getUsernameValidationMessage("john.doe_23")).toBeNull();
  });

  it("rejects too short input", () => {
    expect(getUsernameValidationMessage("ab")).toBe("Use 3-30 characters with letters, numbers, dots, dashes, or underscores.");
  });

  it("rejects when normalized result is too short", () => {
    expect(getUsernameValidationMessage("ab")).toBe("Use 3-30 characters with letters, numbers, dots, dashes, or underscores.");
  });
});

describe("getPasswordValidationMessage", () => {
  it("prompts for empty password", () => {
    expect(getPasswordValidationMessage("")).toBe("Create a password to continue.");
    expect(getPasswordValidationMessage("   ")).toBe("Create a password to continue.");
  });

  it("requires at least 8 characters", () => {
    expect(getPasswordValidationMessage("Ab1!")).toBe("Use at least 8 characters.");
  });

  it("requires lowercase letter", () => {
    expect(getPasswordValidationMessage("ABCD1234!")).toBe("Add at least one lowercase letter.");
  });

  it("requires uppercase letter", () => {
    expect(getPasswordValidationMessage("abcd1234!")).toBe("Add at least one uppercase letter.");
  });

  it("requires a number", () => {
    expect(getPasswordValidationMessage("Abcdefgh!")).toBe("Add at least one number.");
  });

  it("requires a special character", () => {
    expect(getPasswordValidationMessage("Abcdefgh1")).toBe("Add at least one special character.");
  });

  it("returns null for a strong password", () => {
    expect(getPasswordValidationMessage("StrongP@ss1")).toBeNull();
  });

  it("returns first failure only", () => {
    expect(getPasswordValidationMessage("short")).toBe("Use at least 8 characters.");
  });
});
