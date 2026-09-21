import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getAppBaseUrl } from "@/lib/checkout/config";
import { decodeEsewaPayload, mapEsewaStatus, reconcileEsewaStatus } from "@/lib/checkout/esewa";

export const dynamic = "force-dynamic";

type ResultStatus = "success" | "failed" | "pending";

function resultUrl(reference: string, status: ResultStatus): string {
  const ref = reference ? `ref=${encodeURIComponent(reference)}&` : "";
  return `${getAppBaseUrl()}/checkout/result?${ref}status=${status}`;
}

/**
 * eSewa redirects here for FAILURE *and* PENDING transactions (the docs use
 * failure_url for both, e.g. when the 5-minute session expires). The order
 * reference travels in the path; ?data= may also be appended. The real status
 * is reconciled through the status-check API before anything is marked FAILED,
 * so a pending payment is never reported as failed.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reference?: string[] }> }
) {
  const { reference: segments } = await params;

  let payload: Record<string, string> | null = null;
  const encoded = req.nextUrl.searchParams.get("data");
  if (encoded) {
    try {
      payload = decodeEsewaPayload(encoded);
    } catch {
      payload = null;
    }
  }

  const reference =
    segments?.[0] ||
    payload?.transaction_uuid ||
    req.nextUrl.searchParams.get("transaction_uuid") ||
    req.nextUrl.searchParams.get("ref") ||
    "";

  if (!reference) return NextResponse.redirect(resultUrl("", "failed"));

  try {
    const order = await db.checkoutOrder.findUnique({ where: { reference } });
    if (!order) return NextResponse.redirect(resultUrl(reference, "failed"));

    // Already settled — keep the result idempotent on refresh/back navigation.
    if (order.status === "COMPLETED") return NextResponse.redirect(resultUrl(reference, "success"));

    const reconciliation = await reconcileEsewaStatus(reference, order.amount);

    if (reconciliation?.outcome === "success") {
      await db.checkoutOrder.update({
        where: { reference },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          gatewayRef: reconciliation.refId,
          gatewayTxnId: payload?.transaction_code || null,
          gatewayPayload: payload ? JSON.stringify(payload) : null,
        },
      });
      return NextResponse.redirect(resultUrl(reference, "success"));
    }

    if (reconciliation?.outcome === "failed") {
      await db.checkoutOrder.update({
        where: { reference },
        data: { status: "FAILED", gatewayPayload: payload ? JSON.stringify(payload) : null },
      });
      return NextResponse.redirect(resultUrl(reference, "failed"));
    }

    // PENDING / AMBIGUOUS, or the status API is unreachable: keep the order
    // PENDING for reconciliation, but trust a decisive ?data= status if present.
    if (!reconciliation && payload?.status && mapEsewaStatus(payload.status) === "failed") {
      await db.checkoutOrder.update({
        where: { reference },
        data: { status: "FAILED", gatewayPayload: JSON.stringify(payload) },
      });
      return NextResponse.redirect(resultUrl(reference, "failed"));
    }

    return NextResponse.redirect(resultUrl(reference, "pending"));
  } catch (error) {
    logError("checkout/esewa/failure", error);
    return NextResponse.redirect(resultUrl(reference, "pending"));
  }
}
