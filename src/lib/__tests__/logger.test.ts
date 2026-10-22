/**
 * Logger tests — verifies that the structured JSON logger sanitises secrets,
 * respects the configured log level, and produces parseable output.
 *
 * The logger is silenced during test runs (NODE_ENV=test guard in emit()),
 * so these tests call the internal helpers directly via re-exports, or spy on
 * console.error/console.info to capture output.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Next.js types `process.env.NODE_ENV` as a readonly property (it is inlined at
// build time), so tests that need to flip the environment write through a
// mutable view of process.env instead of assigning the readonly member.
const setNodeEnv = (value: string) => {
  (process.env as Record<string, string | undefined>).NODE_ENV = value;
};

// We need to test with a non-test NODE_ENV so the guard is bypassed.
// Spy on the console methods to capture JSON output.
describe("logger — sanitisation and output format", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    // Override NODE_ENV so the test guard is lifted
    setNodeEnv("production");
    process.env.LOG_LEVEL = "debug";
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    setNodeEnv("test");
    delete process.env.LOG_LEVEL;
  });

  it("logError emits a parseable JSON line to stderr", async () => {
    const { logError } = await import("../logger");
    logError("Test error context", new Error("Something went wrong"));
    expect(consoleErrorSpy).toHaveBeenCalledOnce();
    const line = consoleErrorSpy.mock.calls[0][0] as string;
    const obj = JSON.parse(line);
    expect(obj.level).toBe("error");
    expect(obj.context).toBe("Test error context");
    expect(typeof obj.ts).toBe("string");
  });

  it("logInfo emits a parseable JSON line to stdout", async () => {
    const { logInfo } = await import("../logger");
    logInfo("Request served", { path: "/api/students", status: 200 });
    expect(consoleInfoSpy).toHaveBeenCalledOnce();
    const line = consoleInfoSpy.mock.calls[0][0] as string;
    const obj = JSON.parse(line);
    expect(obj.level).toBe("info");
    expect(obj.context).toBe("Request served");
    expect(obj.path).toBe("/api/students");
    expect(obj.status).toBe(200);
  });

  it("logWarn emits to console.warn", async () => {
    const { logWarn } = await import("../logger");
    logWarn("Deprecation notice", "old field used");
    expect(consoleWarnSpy).toHaveBeenCalledOnce();
    const line = consoleWarnSpy.mock.calls[0][0] as string;
    const obj = JSON.parse(line);
    expect(obj.level).toBe("warn");
  });

  it("redacts the word 'password' from error messages", async () => {
    const { logError } = await import("../logger");
    logError("Auth check", new Error("password mismatch for user"));
    const line = consoleErrorSpy.mock.calls[0][0] as string;
    expect(line).not.toContain("password mismatch");
    expect(line).toContain("[REDACTED]");
  });

  it("redacts 'token' from object fields", async () => {
    const { logError } = await import("../logger");
    logError("Token error", { token: "secret-jwt-token", userId: 1 });
    const line = consoleErrorSpy.mock.calls[0][0] as string;
    expect(line).not.toContain("secret-jwt-token");
    expect(line).toContain("[REDACTED]");
  });

  it("redacts 'secret' from nested objects", async () => {
    const { logError } = await import("../logger");
    logError("Config error", { config: { jwtSecret: "my-secret-value" } });
    const line = consoleErrorSpy.mock.calls[0][0] as string;
    expect(line).not.toContain("my-secret-value");
    expect(line).toContain("[REDACTED]");
  });

  it("log entry always includes ts, level, and context fields", async () => {
    const { logInfo } = await import("../logger");
    logInfo("Health check");
    const line = consoleInfoSpy.mock.calls[0][0] as string;
    const obj = JSON.parse(line);
    expect(typeof obj.ts).toBe("string");
    expect(Date.parse(obj.ts)).not.toBeNaN();
    expect(obj.level).toBe("info");
    expect(obj.context).toBe("Health check");
  });

  it("respects LOG_LEVEL — debug is suppressed when level is warn", async () => {
    process.env.LOG_LEVEL = "warn";
    // Re-import to pick up the new env
    vi.resetModules();
    const { logDebug } = await import("../logger");
    setNodeEnv("production");
    logDebug("Should be suppressed");
    expect(consoleInfoSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("error level is always emitted regardless of LOG_LEVEL=warn", async () => {
    process.env.LOG_LEVEL = "warn";
    vi.resetModules();
    const { logError } = await import("../logger");
    setNodeEnv("production");
    logError("Always surfaced", "error detail");
    expect(consoleErrorSpy).toHaveBeenCalledOnce();
  });
});
