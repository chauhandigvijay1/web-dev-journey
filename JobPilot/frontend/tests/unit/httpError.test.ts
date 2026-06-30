import { describe, expect, it, vi } from "vitest";
import { getApiErrorMessage } from "@/lib/httpError";
import axios from "axios";

function makeAxiosError(overrides: Partial<import("axios").AxiosError> = {}): import("axios").AxiosError {
  return {
    name: "AxiosError",
    message: "Request failed with status code 400",
    isAxiosError: true,
    toJSON: () => ({}),
    ...overrides,
  } as unknown as import("axios").AxiosError;
}

describe("getApiErrorMessage", () => {
  it("returns fallback for non-axios errors", () => {
    expect(getApiErrorMessage(new Error("generic"), "fallback")).toBe("fallback");
  });

  it("returns fallback for null errors", () => {
    expect(getApiErrorMessage(null, "fallback")).toBe("fallback");
  });

  it("returns message from response.data.message", () => {
    const error = makeAxiosError({
      response: { status: 400, data: { message: "Email already exists" }, headers: {}, statusText: "Bad Request", config: {} as any },
    });
    expect(getApiErrorMessage(error, "fallback")).toBe("Email already exists");
  });

  it("returns message from response.data.error for express-style errors", () => {
    const error = makeAxiosError({
      response: { status: 500, data: { error: "Internal server error" }, headers: {}, statusText: "Internal Server Error", config: {} as any },
    });
    expect(getApiErrorMessage(error, "fallback")).toBe("Internal server error");
  });

  it("returns message from nested error.message", () => {
    const error = makeAxiosError({
      response: {
        status: 400,
        data: { error: { message: "Validation failed" } },
        headers: {},
        statusText: "Bad Request",
        config: {} as any,
      },
    });
    expect(getApiErrorMessage(error, "fallback")).toBe("Validation failed");
  });

  it("returns network error message for ERR_NETWORK", () => {
    const error = makeAxiosError({ code: "ERR_NETWORK", message: "Network Error" });
    expect(getApiErrorMessage(error, "fallback")).toBe("Cannot reach the API. Start the backend and set NEXT_PUBLIC_API_URL (e.g. http://localhost:5051).");
  });

  it("returns timeout message for ECONNABORTED", () => {
    const error = makeAxiosError({ code: "ECONNABORTED", message: "timeout" });
    expect(getApiErrorMessage(error, "fallback")).toBe("Request timed out. Try again.");
  });

  it("returns generic message when no response", () => {
    const error = makeAxiosError({ response: undefined });
    expect(getApiErrorMessage(error, "fallback")).toBe("Cannot reach the API. Check that the server is running and the URL is correct.");
  });

  it("extracts message from string response body", () => {
    const error = makeAxiosError({
      response: { status: 400, data: "Bad request body", headers: {}, statusText: "Bad Request", config: {} as any },
    });
    expect(getApiErrorMessage(error, "fallback")).toBe("Bad request body");
  });

  it("ignores string body longer than 500 chars", () => {
    const error = makeAxiosError({
      response: { status: 500, data: "x".repeat(501), headers: {}, statusText: "Internal Server Error", config: {} as any },
    });
    expect(getApiErrorMessage(error, "fallback")).toBe("fallback");
  });

  it("returns fallback when response has no useful data", () => {
    const error = makeAxiosError({
      response: { status: 500, data: {}, headers: {}, statusText: "Internal Server Error", config: {} as any },
    });
    expect(getApiErrorMessage(error, "fallback")).toBe("fallback");
  });

  it("handles response.data being null", () => {
    const error = makeAxiosError({
      response: { status: 500, data: null, headers: {}, statusText: "Internal Server Error", config: {} as any },
    });
    expect(getApiErrorMessage(error, "fallback")).toBe("fallback");
  });
});
