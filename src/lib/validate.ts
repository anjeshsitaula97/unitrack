import { z, type ZodType } from "zod";
import { NextResponse } from "next/server";

/**
 * Shared request-input validation built on zod.
 *
 * Most route handlers previously destructure `await req.json()` directly and
 * hand-check one or two fields, which leaves every other field untyped and
 * coerced (`parseInt` of arbitrary strings, dates that may be Invalid Date,
 * etc). Routes adopted to this helper fail fast with a 400 and a readable
 * message instead of writing bad data.
 *
 * Usage inside a handler:
 *
 *   const parsed = await parseJson(req, createLeadSchema);
 *   if (!parsed.ok) return zodResponse(parsed.error);
 *   const data = parsed.data; // fully typed + coerced
 */

export type ParseOk<T> = { ok: true; data: T };
export type ParseFail = { ok: false; error: z.ZodError };
export type Parsed<T> = ParseOk<T> | ParseFail;

/** Reads a request body as JSON, returning a typed result instead of throwing. */
export async function parseJson<T extends ZodType>(
  req: Request,
  schema: T
): Promise<Parsed<z.infer<T>>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return {
      ok: false,
      error: new z.ZodError([
        { code: z.ZodIssueCode.custom, path: [], message: "Request body must be valid JSON." },
      ]),
    };
  }
  const result = schema.safeParse(raw);
  if (!result.success) return { ok: false, error: result.error };
  return { ok: true, data: result.data };
}

/** Validates an already-parsed query string (URLSearchParams or plain object). */
export function parseQuery<T extends ZodType>(
  params: URLSearchParams | Record<string, string | null | undefined> | undefined | null,
  schema: T
): Parsed<z.infer<T>> {
  const obj: Record<string, string> = {};
  if (params instanceof URLSearchParams) {
    for (const key of [...new Set(params.keys())]) obj[key] = params.get(key) ?? "";
  } else {
    for (const [key, value] of Object.entries(params ?? {})) obj[key] = value ?? "";
  }
  const result = schema.safeParse(obj);
  if (!result.success) return { ok: false, error: result.error };
  return { ok: true, data: result.data };
}

/** Builds a 400 response carrying the first validation message. */
export function zodResponse(error: z.ZodError): NextResponse {
  const first = error.issues[0];
  let message = first?.message ?? "Invalid input.";
  // A missing required field surfaces from zod as a type error
  // ("expected string, received undefined"), which is a poor message for an
  // API consumer. Rewrite it to name the field instead.
  const asCode = first as unknown as { code?: string } | undefined;
  if (first && asCode?.code === "invalid_type" && /undefined/i.test(first.message)) {
    const field = first.path.join(".") || "field";
    message = `${field} is required.`;
  }
  return NextResponse.json({ error: message, issues: error.issues }, { status: 400 });
}

/** Reusable coercion helpers so routes stop hand-rolling unsafe conversions. */
export const coercedInt = (opts?: { min?: number; max?: number }) => {
  let schema = z.coerce.number().int();
  if (opts?.min !== undefined) schema = schema.min(opts.min);
  if (opts?.max !== undefined) schema = schema.max(opts.max);
  return schema;
};

export const optionalTrimmedString = (max = 500) => z.string().trim().max(max).optional();

export const isoDateOrNull = z
  .string()
  .optional()
  .transform((v) => (v && v.length > 0 && !Number.isNaN(Date.parse(v)) ? new Date(v) : null));

/** Emails are validated loosely on purpose: the app also accepts institutional addresses. */
export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .email("Enter a valid email address.");
