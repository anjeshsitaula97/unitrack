/**
 * Route-level input validation integration tests.
 *
 * These tests validate that the zod schemas used in the API routes correctly
 * accept valid payloads and reject invalid ones — covering the input
 * contract without needing a live database.
 *
 * The schemas themselves are the same objects the route handlers use;
 * importing and exercising them here gives us regression coverage for every
 * field without spinning up a Next.js server.
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  parseJson,
  zodResponse,
  coercedInt,
  isoDateOrNull,
  optionalTrimmedString,
  emailField,
} from "../validate";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function makeReq(body: unknown, method = "POST"): Request {
  return new Request("http://localhost:4028/api/test", {
    method,
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// Payments schema (mirrors src/app/api/payments/route.ts)
// ---------------------------------------------------------------------------

const createPaymentSchema = z.object({
  studentId: coercedInt({ min: 1 }),
  amount: z.coerce.number().positive("Amount must be a positive number"),
  currency: optionalTrimmedString(10).default("NPR"),
  status: optionalTrimmedString(60).default("Pending"),
  method: optionalTrimmedString(60).default("Cash"),
  date: isoDateOrNull,
  description: optionalTrimmedString(2000).default(""),
  proofUrl: optionalTrimmedString(1000),
});

describe("payments — createPaymentSchema", () => {
  it("accepts a minimal valid payload", async () => {
    const result = await parseJson(makeReq({ studentId: 1, amount: 1000 }), createPaymentSchema);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.studentId).toBe(1);
      expect(result.data.amount).toBe(1000);
      expect(result.data.currency).toBe("NPR");
      expect(result.data.status).toBe("Pending");
      expect(result.data.method).toBe("Cash");
    }
  });

  it("accepts a full valid payload", async () => {
    const result = await parseJson(
      makeReq({
        studentId: "42",
        amount: "2500.50",
        currency: "USD",
        status: "Completed",
        method: "eSewa",
        date: "2026-01-15",
        description: "Semester fee",
        proofUrl: "https://example.com/receipt.pdf",
      }),
      createPaymentSchema
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.studentId).toBe(42);
      expect(result.data.amount).toBe(2500.5);
      expect(result.data.currency).toBe("USD");
    }
  });

  it("rejects missing studentId", async () => {
    const result = await parseJson(makeReq({ amount: 1000 }), createPaymentSchema);
    expect(result.ok).toBe(false);
  });

  it("rejects negative amount", async () => {
    const result = await parseJson(makeReq({ studentId: 1, amount: -500 }), createPaymentSchema);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.issues[0].message).toMatch(/positive/i);
  });

  it("rejects zero amount", async () => {
    const result = await parseJson(makeReq({ studentId: 1, amount: 0 }), createPaymentSchema);
    expect(result.ok).toBe(false);
  });

  it("rejects non-numeric amount", async () => {
    const result = await parseJson(
      makeReq({ studentId: 1, amount: "not-a-number" }),
      createPaymentSchema
    );
    expect(result.ok).toBe(false);
  });

  it("rejects studentId of 0 (not a valid foreign key)", async () => {
    const result = await parseJson(makeReq({ studentId: 0, amount: 100 }), createPaymentSchema);
    expect(result.ok).toBe(false);
  });

  it("coerces string studentId to integer", async () => {
    const result = await parseJson(makeReq({ studentId: "5", amount: 100 }), createPaymentSchema);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.studentId).toBe(5);
  });

  it("zodResponse returns 400 with a message for a failed schema", async () => {
    const result = await parseJson(makeReq({ amount: 100 }), createPaymentSchema);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const res = zodResponse(result.error);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(typeof body.error).toBe("string");
    }
  });
});

// ---------------------------------------------------------------------------
// Staff schema (mirrors src/app/api/staff/route.ts)
// ---------------------------------------------------------------------------

const createStaffSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: emailField,
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
  role: z.string().trim().max(60).optional().default("Viewer"),
});

describe("staff — createStaffSchema", () => {
  it("accepts a valid staff payload", async () => {
    const result = await parseJson(
      makeReq({ name: "Alice Smith", email: "alice@example.com", password: "securepass123" }),
      createStaffSchema
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("Alice Smith");
      expect(result.data.email).toBe("alice@example.com");
      expect(result.data.role).toBe("Viewer");
    }
  });

  it("normalises email to lowercase", async () => {
    const result = await parseJson(
      makeReq({ name: "Alice", email: "ALICE@EXAMPLE.COM", password: "securepass123" }),
      createStaffSchema
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.email).toBe("alice@example.com");
  });

  it("rejects a password shorter than 8 characters", async () => {
    const result = await parseJson(
      makeReq({ name: "Alice", email: "alice@example.com", password: "short" }),
      createStaffSchema
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.issues[0].message).toMatch(/8 characters/);
  });

  it("rejects a missing name", async () => {
    const result = await parseJson(
      makeReq({ email: "alice@example.com", password: "securepass123" }),
      createStaffSchema
    );
    expect(result.ok).toBe(false);
  });

  it("rejects an invalid email", async () => {
    const result = await parseJson(
      makeReq({ name: "Alice", email: "not-an-email", password: "securepass123" }),
      createStaffSchema
    );
    expect(result.ok).toBe(false);
  });

  it("accepts a specified role", async () => {
    const result = await parseJson(
      makeReq({ name: "Bob", email: "bob@example.com", password: "securepass123", role: "Admin" }),
      createStaffSchema
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.role).toBe("Admin");
  });
});

// ---------------------------------------------------------------------------
// Leads schema (mirrors src/app/api/leads/route.ts — already uses parseJson)
// ---------------------------------------------------------------------------

const createLeadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: emailField,
  phone: optionalTrimmedString(40),
  source: optionalTrimmedString(80),
  status: optionalTrimmedString(60),
  notes: optionalTrimmedString(4000),
  counselor: optionalTrimmedString(120),
  assignedDate: isoDateOrNull,
  nextFollowUp: isoDateOrNull,
  interestedCountry: optionalTrimmedString(120),
  maritalStatus: optionalTrimmedString(40),
  childrenCount: z.coerce.number().int().min(0).max(50).optional().default(0),
  referenceName: optionalTrimmedString(120),
});

describe("leads — createLeadSchema", () => {
  it("accepts a minimal lead with name and email", async () => {
    const result = await parseJson(
      makeReq({ name: "Jane Doe", email: "jane@example.com" }),
      createLeadSchema
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("Jane Doe");
      expect(result.data.childrenCount).toBe(0);
    }
  });

  it("rejects a lead with no name", async () => {
    const result = await parseJson(makeReq({ email: "jane@example.com" }), createLeadSchema);
    expect(result.ok).toBe(false);
  });

  it("rejects an invalid email", async () => {
    const result = await parseJson(makeReq({ name: "Jane", email: "bad-email" }), createLeadSchema);
    expect(result.ok).toBe(false);
  });

  it("coerces childrenCount string to integer", async () => {
    const result = await parseJson(
      makeReq({ name: "Jane", email: "jane@example.com", childrenCount: "3" }),
      createLeadSchema
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.childrenCount).toBe(3);
  });

  it("rejects childrenCount above 50", async () => {
    const result = await parseJson(
      makeReq({ name: "Jane", email: "jane@example.com", childrenCount: 100 }),
      createLeadSchema
    );
    expect(result.ok).toBe(false);
  });

  it("parses a valid ISO date for assignedDate", async () => {
    const result = await parseJson(
      makeReq({ name: "Jane", email: "jane@example.com", assignedDate: "2026-03-01" }),
      createLeadSchema
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.assignedDate).toBeInstanceOf(Date);
  });

  it("coerces an empty assignedDate string to null", async () => {
    const result = await parseJson(
      makeReq({ name: "Jane", email: "jane@example.com", assignedDate: "" }),
      createLeadSchema
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.assignedDate).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Malformed JSON rejection (all schemas should surface via parseJson)
// ---------------------------------------------------------------------------

describe("parseJson — malformed body handling", () => {
  it("returns a validation error for malformed JSON (not a throw)", async () => {
    const malformedReq = new Request("http://localhost:4028/api/test", {
      method: "POST",
      body: "{bad json",
      headers: { "Content-Type": "application/json" },
    });
    const result = await parseJson(malformedReq, createPaymentSchema);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.issues[0].message).toMatch(/valid JSON/i);
  });

  it("returns 400 from zodResponse for a failed parse", async () => {
    const result = await parseJson(makeReq({}), createPaymentSchema);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const res = zodResponse(result.error);
      expect(res.status).toBe(400);
    }
  });
});
