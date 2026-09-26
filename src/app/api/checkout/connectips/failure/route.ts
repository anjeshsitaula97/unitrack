import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getAppBaseUrl } from "@/lib/checkout/config";

export const dynamic = "force-dynamic";

/** connectIPS redirects here when the payment fails or is cancelled. */
// react-doctor-disable-next-line react-doctor/nextjs-no-side-effect-in-get-handler
export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("TXNID") || "";

  if (reference) {
    try {
      const order = await db.checkoutOrder.findUnique({ where: { reference } });
      if (order && order.status !== "COMPLETED") {
        await db.checkoutOrder.update({
          where: { reference },
          data: { status: "FAILED", gatewayRef: reference },
        });
      }
    } catch (error) {
      logError("checkout/connectips/failure", error);
    }
  }

  const ref = reference ? `ref=${encodeURIComponent(reference)}&` : "";
  return NextResponse.redirect(`${getAppBaseUrl()}/checkout/result?${ref}status=failed`);
}
