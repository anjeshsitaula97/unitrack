import { describe, it, expect } from "vitest";
import {
  parseJson,
  parseQuery,
  zodResponse,
  coercedInt,
  isoDateOrNull,
  emailField,
} from "../validate";
import { checkEnv } from "../env";
import { UNSCOPED_MODELS } from "../consultancy";
import { z } from "zod";

/**
 * Hardening tests.
 *
 * These lock in the operational-safety fixes so they cannot regress silently:
 * input validation, environment fail-fast, and the tenancy scoping allow-list.
 */

describe("validate", () => {
  it("parses and coerces a valid JSON body", async () => {
    const schema = z.object({ id: coercedInt({ min: 1 }), name: z.string().trim().min(1) });
    const req = new Request("http://localhost/api/x", {
      method: "POST",
      body: JSON.stringify({ id: "42", name: "  Ada  " }),
    });
    const result = await parseJson(req, schema);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.id).toBe(42);
      expect(result.data.name).toBe("Ada");
    }
  });

  it("rejects a body that fails validation with a typed error", async () => {
    const schema = z.object({ id: coercedInt({ min: 1 }) });
    const req = new Request("http://localhost/api/x", {
      method: "POST",
      body: JSON.stringify({ id: -5 }),
    });
    const result = await parseJson(req, schema);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.issues.length).toBeGreaterThan(0);
  });

  it("treats malformed JSON as a validation failure, not a throw", async () => {
    const schema = z.object({ a: z.string() });
    const req = new Request("http://localhost/api/x", { method: "POST", body: "{not json" });
    const result = await parseJson(req, schema);
    expect(result.ok).toBe(false);
  });

  it("coercedInt rejects non-numeric strings (NaN never reaches Prisma)", () => {
    const schema = z.object({ id: coercedInt({ min: 1 }) });
    expect(schema.safeParse({ id: "abc" }).success).toBe(false);
    expect(schema.safeParse({ id: "12" }).success).toBe(true);
  });

  it("isoDateOrNull returns null for absent or invalid dates", () => {
    const schema = z.object({ d: isoDateOrNull });
    expect(schema.parse({}).d).toBeNull();
    expect(schema.parse({ d: "" }).d).toBeNull();
    expect(schema.parse({ d: "not-a-date" }).d).toBeNull();
    expect(schema.parse({ d: "2026-01-01" }).d).toBeInstanceOf(Date);
  });

  it("emailField normalises case and rejects malformed addresses", () => {
    expect(emailField.parse("  USER@Example.COM ")).toBe("user@example.com");
    expect(emailField.safeParse("not-an-email").success).toBe(false);
  });

  it("parseQuery validates a URLSearchParams query", () => {
    const result = parseQuery(
      new URLSearchParams("page=2&perPage=50"),
      z.object({ page: z.string() })
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.page).toBe("2");
  });

  it("zodResponse returns HTTP 400 for a missing required field", async () => {
    const parsed = z.object({ name: z.string().min(1, "Name is required") }).safeParse({});
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const res = zodResponse(parsed.error);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(typeof body.error).toBe("string");
      expect(body.error.length).toBeGreaterThan(0);
      expect(Array.isArray(body.issues)).toBe(true);
    }
  });

  it("zodResponse surfaces a custom validation message", async () => {
    const schema = z.object({ name: z.string().trim().min(1, "Name is required") });
    const parsed = schema.safeParse({ name: "   " });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const res = zodResponse(parsed.error);
      expect(res.status).toBe(400);
      expect((await res.json()).error).toBe("Name is required");
    }
  });
});

describe("env validation", () => {
  const good = {
    DATABASE_URL: "mysql://u:p@localhost/db",
    JWT_SECRET: "a".repeat(40),
  } as unknown as NodeJS.ProcessEnv;

  it("accepts a complete configuration", () => {
    expect(checkEnv(good).ok).toBe(true);
  });

  it("requires DATABASE_URL and JWT_SECRET (blocking)", () => {
    const { ok, errors } = checkEnv({} as unknown as NodeJS.ProcessEnv);
    expect(ok).toBe(false);
    const vars = errors.map((i) => i.variable);
    expect(vars).toContain("DATABASE_URL");
    expect(vars).toContain("JWT_SECRET");
  });

  it("treats a short JWT_SECRET as blocking", () => {
    const { ok, errors } = checkEnv({
      ...good,
      JWT_SECRET: "short",
    } as unknown as NodeJS.ProcessEnv);
    expect(ok).toBe(false);
    expect(errors.some((i) => i.variable === "JWT_SECRET")).toBe(true);
  });

  it("ignores a leftover ENCRYPTION_KEY (dead config, no longer validated)", () => {
    // The AES helpers it belonged to (src/lib/encryption*.ts) were insecure
    // dead code and have been deleted, so nothing reads the variable. A stale
    // entry must neither fail readiness nor emit advisories — it just needs to
    // be deleted from the environment.
    const { ok, issues, warnings } = checkEnv({
      ...good,
      ENCRYPTION_KEY: good.JWT_SECRET,
    } as unknown as NodeJS.ProcessEnv);
    expect(ok).toBe(true);
    expect(issues).toHaveLength(0);
    expect(warnings).toHaveLength(0);
  });

  it("produces no advisories for a complete configuration", () => {
    const { issues, warnings } = checkEnv(good);
    expect(issues).toHaveLength(0);
    expect(warnings).toHaveLength(0);
  });
});

describe("tenancy scoping guardrail", () => {
  // Tenant-owned models MUST stay scoped to a consultancy (the db.ts extension
  // injects consultancyId for anything not in this set). If one of these ever
  // lands in UNSCOPED_MODELS, every tenant's rows become globally readable —
  // so this test fails loudly if the allow-list is widened by mistake.
  const mustStayScoped = [
    "Student",
    "Lead",
    "Application",
    "User",
    "University",
    "Course",
    "EmailTemplate",
    "File",
  ];

  it.each(mustStayScoped)("%s is NOT in UNSCOPED_MODELS", (model) => {
    expect(UNSCOPED_MODELS.has(model)).toBe(false);
  });

  it("only contains the intended platform-level models", () => {
    expect([...UNSCOPED_MODELS].sort()).toEqual(
      ["CheckoutOrder", "Consultancy", "PasswordResetToken", "RateLimitLog"].sort()
    );
  });
});
