import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { validateCsrfHeaders } from "@/lib/csrf";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { CHECKOUT_CURRENCY, getChargeAmount, getPlanById, isBillingCycle } from "@/lib/pricing";
import type { BillingCycle } from "@/lib/pricing";
import { getGatewayAvailability, type CheckoutGatewayId } from "@/lib/checkout/config";
import { buildConnectIpsForm } from "@/lib/checkout/connectips";
import { buildEsewaForm } from "@/lib/checkout/esewa";
import { generateReference } from "@/lib/checkout/reference";

export const dynamic = "force-dynamic";

const MAX_REFERENCE_ATTEMPTS = 5;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface InitiatePayload {
  planId: string;
  cycle: BillingCycle;
  gateway: CheckoutGatewayId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  agencyName: string;
}

function readString(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function parsePayload(body: unknown): InitiatePayload | null {
  if (typeof body !== "object" || body === null) return null;

  const raw = body as Record<string, unknown>;
  const gateway: CheckoutGatewayId | null =
    raw.gateway === "esewa" ? "esewa" : raw.gateway === "connectips" ? "connectips" : null;
  const cycle = readString(raw.cycle, 10);

  const planId = readString(raw.planId, 40);
  const customerName = readString(raw.customerName, 120);
  const customerEmail = readString(raw.customerEmail, 200);
  const customerPhone = readString(raw.customerPhone, 30);
  const agencyName = readString(raw.agencyName, 160);

  if (!planId || !gateway || !isBillingCycle(cycle)) return null;
  if (!customerName || !EMAIL_PATTERN.test(customerEmail) || !customerPhone || !agencyName) {
    return null;
  }

  return { planId, cycle, gateway, customerName, customerEmail, customerPhone, agencyName };
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" && error !== null && (error as { code?: unknown }).code === "P2002"
  );
}

/**
 * Public checkout entry point. Creates a PENDING CheckoutOrder and returns the
 * signed gateway form the browser must POST (eSewa ePay v2 / connectIPS login page).
 */
export async function POST(req: NextRequest) {
  try {
    const csrf = validateCsrfHeaders(req);
    if (!csrf.valid) {
      return NextResponse.json({ ok: false, error: csrf.error }, { status: 403 });
    }

    const limit = await checkRateLimit(`checkout:initiate:${getClientIp(req)}`, 10, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many payment attempts. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
    }

    const payload = parsePayload(body);
    if (!payload) {
      return NextResponse.json(
        { ok: false, error: "Please check the form details and try again." },
        { status: 400 }
      );
    }

    const plan = getPlanById(payload.planId);
    if (!plan) {
      return NextResponse.json({ ok: false, error: "Unknown plan selected." }, { status: 400 });
    }

    if (!getGatewayAvailability()[payload.gateway].enabled) {
      return NextResponse.json(
        { ok: false, error: "This payment method is not configured yet." },
        { status: 400 }
      );
    }

    const amount = getChargeAmount(plan, payload.cycle);

    let order = null;
    for (let attempt = 0; attempt < MAX_REFERENCE_ATTEMPTS && !order; attempt += 1) {
      try {
        order = await db.checkoutOrder.create({
          data: {
            reference: generateReference(),
            planId: plan.id,
            planName: plan.name,
            billingCycle: payload.cycle,
            amount,
            currency: CHECKOUT_CURRENCY,
            gateway: payload.gateway,
            status: "PENDING",
            customerName: payload.customerName,
            customerEmail: payload.customerEmail,
            customerPhone: payload.customerPhone,
            agencyName: payload.agencyName,
          },
        });
      } catch (error) {
        if (!isUniqueViolation(error)) throw error;
      }
    }
    if (!order) throw new Error("Could not allocate a unique checkout reference");

    const form =
      payload.gateway === "esewa"
        ? buildEsewaForm({ reference: order.reference, amount: order.amount })
        : buildConnectIpsForm({
            reference: order.reference,
            amount: order.amount,
            planName: order.planName,
            customerName: order.customerName,
            agencyName: order.agencyName,
          });

    return NextResponse.json({
      ok: true,
      reference: order.reference,
      gateway: payload.gateway,
      amount: order.amount,
      currency: order.currency,
      formUrl: form.formUrl,
      fields: form.fields,
    });
  } catch (error) {
    logError("checkout/initiate", error);
    return NextResponse.json(
      { ok: false, error: "We could not start the payment. Please try again." },
      { status: 500 }
    );
  }
}
