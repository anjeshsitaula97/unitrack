import { createHmac, timingSafeEqual } from "crypto";
import { getAppBaseUrl, getEsewaConfig } from "./config";

const REQUEST_SIGNED_FIELDS = "total_amount,transaction_uuid,product_code";

export interface EsewaForm {
  formUrl: string;
  fields: Record<string, string>;
}

function hmacBase64(message: string, secret: string): string {
  return createHmac("sha256", secret).update(message).digest("base64");
}

function signaturesMatch(expected: string, received: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

/** Signed ePay v2 form fields — the browser POSTs these to eSewa. */
export function buildEsewaForm(order: { reference: string; amount: number }): EsewaForm {
  const config = getEsewaConfig();
  if (!config.enabled) throw new Error("eSewa is not configured");

  const amount = String(order.amount);
  const message = `total_amount=${amount},transaction_uuid=${order.reference},product_code=${config.productCode}`;
  const baseUrl = getAppBaseUrl();

  return {
    formUrl: config.formUrl,
    fields: {
      amount,
      tax_amount: "0",
      total_amount: amount,
      transaction_uuid: order.reference,
      product_code: config.productCode,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: `${baseUrl}/api/checkout/esewa/success`,
      // eSewa redirects here for FAILURE *and* PENDING (e.g. expired session),
      // so the order reference travels in the path to identify the order reliably.
      failure_url: `${baseUrl}/api/checkout/esewa/failure/${order.reference}`,
      signed_field_names: REQUEST_SIGNED_FIELDS,
      signature: hmacBase64(message, config.secretKey),
    },
  };
}

/** Decodes the base64 JSON payload appended to the success redirect. */
export function decodeEsewaPayload(encoded: string): Record<string, string> {
  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  const parsed = JSON.parse(decoded) as Record<string, unknown>;
  const payload: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed)) {
    payload[key] = value == null ? "" : String(value);
  }
  return payload;
}

/** Re-generates the HMAC signature over the redirect fields and compares. */
export function verifyEsewaSignature(payload: Record<string, string>): boolean {
  const config = getEsewaConfig();
  const signedFields = (payload.signed_field_names || REQUEST_SIGNED_FIELDS).split(",");
  const message = signedFields.map((name) => `${name}=${payload[name] ?? ""}`).join(",");
  return signaturesMatch(hmacBase64(message, config.secretKey), payload.signature || "");
}

export interface EsewaStatusResult {
  status: string;
  refId: string | null;
  totalAmount: number | null;
}

/** Server-to-server status check used to confirm a transaction is genuine. */
export async function fetchEsewaTransactionStatus(
  reference: string,
  amount: number
): Promise<EsewaStatusResult | null> {
  const config = getEsewaConfig();
  const url =
    `${config.statusUrl}?product_code=${encodeURIComponent(config.productCode)}` +
    `&total_amount=${amount}&transaction_uuid=${encodeURIComponent(reference)}`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;

    const data = (await response.json()) as {
      status?: string;
      ref_id?: string | null;
      total_amount?: number | null;
    };
    if (!data.status) return null;

    return {
      status: data.status,
      refId: data.ref_id ?? null,
      totalAmount: data.total_amount ?? null,
    };
  } catch {
    return null;
  }
}

export type CheckoutOutcome = "success" | "pending" | "failed";

/**
 * eSewa transaction statuses → checkout outcome.
 * COMPLETE = paid; PENDING/AMBIGUOUS = not settled yet (the failure_url also
 * receives these); CANCELED/NOT_FOUND and refunds count as failed.
 */
export function mapEsewaStatus(status: string): CheckoutOutcome {
  switch (status.toUpperCase()) {
    case "COMPLETE":
      return "success";
    case "PENDING":
    case "AMBIGUOUS":
      return "pending";
    default:
      return "failed";
  }
}

export interface EsewaReconciliation {
  outcome: CheckoutOutcome;
  refId: string | null;
  totalAmount: number | null;
}

/** Server-to-server reconciliation. Returns null when the status API is unreachable. */
export async function reconcileEsewaStatus(
  reference: string,
  amount: number
): Promise<EsewaReconciliation | null> {
  const status = await fetchEsewaTransactionStatus(reference, amount);
  if (!status) return null;
  return {
    outcome: mapEsewaStatus(status.status),
    refId: status.refId,
    totalAmount: status.totalAmount,
  };
}
