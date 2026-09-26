import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getAppBaseUrl } from "@/lib/checkout/config";
import {
  decodeEsewaPayload,
  reconcileEsewaStatus,
  verifyEsewaSignature,
} from "@/lib/checkout/esewa";

export const dynamic = "force-dynamic";

type ResultStatus = "success" | "failed" | "pending";

function resultUrl(reference: string, status: ResultStatus): string {
  const ref = reference ? `ref=${encodeURIComponent(reference)}&` : "";
  return `${getAppBaseUrl()}/checkout/result?${ref}status=${status}`;
}

/**
 * eSewa redirects the browser here (GET) with a base64 `data` payload.
 * The signature is re-generated locally, then the transaction is confirmed
 * against eSewa's server-to-server status API before it is marked COMPLETED.
 */
// react-doctor-disable-next-line react-doctor/nextjs-no-side-effect-in-get-handler
export async function GET(req: NextRequest) {
  const encoded = req.nextUrl.searchParams.get("data");
  if (!encoded) return NextResponse.redirect(resultUrl("", "failed"));

  let payload: Record<string, string>;
  try {
    payload = decodeEsewaPayload(encoded);
  } catch {
    return NextResponse.redirect(resultUrl("", "failed"));
  }

  const reference = payload.transaction_uuid || "";
  if (!reference || payload.status !== "COMPLETE" || !verifyEsewaSignature(payload)) {
    logError(
      "checkout/esewa/success",
      `Signature or status mismatch for ${reference || "unknown"}`
    );
    return NextResponse.redirect(resultUrl(reference, "failed"));
  }

  try {
    const order = await db.checkoutOrder.findUnique({ where: { reference } });
    if (!order) return NextResponse.redirect(resultUrl(reference, "failed"));

    if (Number(payload.total_amount) !== order.amount) {
      await db.checkoutOrder.update({
        where: { reference },
        data: { status: "FAILED", gatewayPayload: JSON.stringify(payload) },
      });
      return NextResponse.redirect(resultUrl(reference, "failed"));
    }

    const reconciliation = await reconcileEsewaStatus(reference, order.amount);

    if (reconciliation?.outcome === "success") {
      if (reconciliation.totalAmount !== null && reconciliation.totalAmount !== order.amount) {
        await db.checkoutOrder.update({
          where: { reference },
          data: { status: "FAILED", gatewayPayload: JSON.stringify(payload) },
        });
        return NextResponse.redirect(resultUrl(reference, "failed"));
      }

      await db.checkoutOrder.update({
        where: { reference },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          gatewayRef: reconciliation.refId,
          gatewayTxnId: payload.transaction_code || null,
          gatewayPayload: JSON.stringify(payload),
        },
      });
      return NextResponse.redirect(resultUrl(reference, "success"));
    }

    if (reconciliation?.outcome === "failed") {
      await db.checkoutOrder.update({
        where: { reference },
        data: { status: "FAILED", gatewayPayload: JSON.stringify(payload) },
      });
      return NextResponse.redirect(resultUrl(reference, "failed"));
    }

    // PENDING / AMBIGUOUS, or the status API is unreachable — record the
    // redirect payload and leave the order PENDING instead of losing a payment.
    await db.checkoutOrder.update({
      where: { reference },
      data: {
        gatewayTxnId: payload.transaction_code || null,
        gatewayPayload: JSON.stringify(payload),
      },
    });
    return NextResponse.redirect(resultUrl(reference, "pending"));
  } catch (error) {
    logError("checkout/esewa/success", error);
    return NextResponse.redirect(resultUrl(reference, "pending"));
  }
}
