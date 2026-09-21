import { NextResponse } from "next/server";
import { getGatewayAvailability } from "@/lib/checkout/config";
import { CHECKOUT_CURRENCY } from "@/lib/pricing";

export const dynamic = "force-dynamic";

/** Public endpoint: which payment gateways are usable in this environment. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    currency: CHECKOUT_CURRENCY,
    gateways: getGatewayAvailability(),
  });
}
