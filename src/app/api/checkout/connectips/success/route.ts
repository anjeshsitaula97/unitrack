import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getAppBaseUrl } from "@/lib/checkout/config";
import { validateConnectIpsTransaction } from "@/lib/checkout/connectips";

export const dynamic = "force-dynamic";

type ResultStatus = "success" | "failed" | "pending";

/**
 * connectIPS redirects here after the payment. NCHL only appends
 * ?TXNID=<reference> to this registered URL, so the final status must be
 * confirmed with the server-to-server validation API before completion.
 */
export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("TXNID") || "";
  const redirect = (status: ResultStatus) => {
    const ref = reference ? `ref=${encodeURIComponent(reference)}&` : "";
    return NextResponse.redirect(`${getAppBaseUrl()}/checkout/result?${ref}status=${status}`);
  };

  if (!reference) return redirect("failed");

  try {
    const order = await db.checkoutOrder.findUnique({ where: { reference } });
    if (!order) return redirect("failed");

    if (order.status === "COMPLETED") return redirect("success");

    const validation = await validateConnectIpsTransaction({
      reference,
      amount: order.amount,
    });

    if (validation?.status === "SUCCESS") {
      await db.checkoutOrder.update({
        where: { reference },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          gatewayRef: reference,
          gatewayTxnId: reference,
          gatewayPayload: JSON.stringify(validation),
        },
      });
      return redirect("success");
    }

    if (validation) {
      await db.checkoutOrder.update({
        where: { reference },
        data: {
          status: "FAILED",
          gatewayRef: reference,
          gatewayPayload: JSON.stringify(validation),
        },
      });
      return redirect("failed");
    }

    // Validation API unreachable — keep the order PENDING for reconciliation.
    await db.checkoutOrder.update({
      where: { reference },
      data: { gatewayRef: reference },
    });
    return redirect("pending");
  } catch (error) {
    logError("checkout/connectips/success", error);
    return redirect("pending");
  }
}
