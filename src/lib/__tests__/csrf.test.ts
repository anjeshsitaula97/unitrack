import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { validateCsrfHeaders } from "../csrf";

const req = (headers: Record<string, string>, method = "POST") =>
  new NextRequest("http://localhost:4028/api/access", { method, headers });

describe("validateCsrfHeaders", () => {
  it("allows safe methods regardless of headers", () => {
    expect(validateCsrfHeaders(req({}, "GET")).valid).toBe(true);
    expect(validateCsrfHeaders(req({}, "HEAD")).valid).toBe(true);
    expect(validateCsrfHeaders(req({}, "OPTIONS")).valid).toBe(true);
  });

  it("rejects a cross-site origin", () => {
    const r = validateCsrfHeaders(req({ host: "localhost:4028", origin: "https://evil.example" }));
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/invalid origin/);
  });

  it("rejects a cross-site referer", () => {
    const r = validateCsrfHeaders(
      req({ host: "localhost:4028", referer: "https://evil.example/x" })
    );
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/invalid referer/);
  });

  it("rejects a malformed origin", () => {
    expect(validateCsrfHeaders(req({ host: "localhost:4028", origin: "not-a-url" })).valid).toBe(
      false
    );
  });

  it("accepts an origin matching the request host", () => {
    const r = validateCsrfHeaders(
      req({
        host: "app.example.com",
        "x-forwarded-proto": "https",
        origin: "https://app.example.com",
      })
    );
    expect(r.valid).toBe(true);
  });

  it("accepts the configured local origin", () => {
    const r = validateCsrfHeaders(req({ host: "localhost:4028", origin: "http://localhost:4028" }));
    expect(r.valid).toBe(true);
  });

  it("no longer allows a request with neither origin nor referer", () => {
    const r = validateCsrfHeaders(req({ host: "localhost:4028" }));
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/missing origin/);
  });

  it("allows a non-browser caller that presents a bearer token", () => {
    const r = validateCsrfHeaders(
      req({ host: "localhost:4028", authorization: "Bearer some-service-token" })
    );
    expect(r.valid).toBe(true);
  });
});
