import { describe, expect, it } from "vitest";
import {
  parseFollowUpDate,
  serializeFollowUpDate,
  followUpDateInputValue,
} from "@/lib/follow-up-date";

describe("parseFollowUpDate", () => {
  it("parses date-input format (yyyy-mm-dd) as local time noon", () => {
    const date = parseFollowUpDate("2026-06-15");
    expect(date).not.toBeNull();
    expect(date!.getFullYear()).toBe(2026);
    expect(date!.getMonth()).toBe(5);
    expect(date!.getDate()).toBe(15);
    expect(date!.getHours()).toBe(12);
  });

  it("parses ISO string", () => {
    const date = parseFollowUpDate("2026-06-15T10:00:00.000Z");
    expect(date).not.toBeNull();
    expect(date!.getTime()).toBeGreaterThan(0);
  });

  it("returns null for null", () => {
    expect(parseFollowUpDate(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(parseFollowUpDate(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseFollowUpDate("")).toBeNull();
  });

  it("returns null for invalid date string", () => {
    expect(parseFollowUpDate("not-a-date")).toBeNull();
  });

  it("parses edge date like leap year", () => {
    const date = parseFollowUpDate("2024-02-29");
    expect(date).not.toBeNull();
    expect(date!.getMonth()).toBe(1);
    expect(date!.getDate()).toBe(29);
  });
});

describe("serializeFollowUpDate", () => {
  it("serializes a valid date string to ISO", () => {
    const result = serializeFollowUpDate("2026-06-15");
    expect(result).not.toBeNull();
    expect(result).toMatch(/^2026-06-1\dT/);
  });

  it("returns null for empty input", () => {
    expect(serializeFollowUpDate("")).toBeNull();
    expect(serializeFollowUpDate("   ")).toBeNull();
  });

  it("returns null for invalid input", () => {
    expect(serializeFollowUpDate("invalid")).toBeNull();
  });
});

describe("followUpDateInputValue", () => {
  it("formats a date string to yyyy-mm-dd", () => {
    expect(followUpDateInputValue("2026-06-15")).toBe("2026-06-15");
  });

  it("formats an ISO string to yyyy-mm-dd", () => {
    const result = followUpDateInputValue("2026-06-15T10:00:00.000Z");
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns empty for null", () => {
    expect(followUpDateInputValue(null)).toBe("");
  });

  it("returns empty for undefined", () => {
    expect(followUpDateInputValue(undefined)).toBe("");
  });

  it("returns empty for invalid date", () => {
    expect(followUpDateInputValue("bad-date")).toBe("");
  });
});
