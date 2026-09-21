import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment Result — UniTrack",
  description: "Status of your UniTrack subscription payment.",
};

type ResultStatus = "success" | "pending" | "failed";

const RESULT_COPY: Record<
  ResultStatus,
  { icon: string; eyebrow: string; title: string; message: string; badge: string }
> = {
  success: {
    icon: "check_circle",
    eyebrow: "Payment complete",
    title: "You're all set!",
    message:
      "We received your payment and your plan is being activated. A confirmation email is on its way.",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  pending: {
    icon: "hourglass_top",
    eyebrow: "Verification pending",
    title: "Payment is being verified",
    message:
      "The gateway has not confirmed the transaction yet. This usually takes a few minutes — your order will update as soon as the bank or wallet confirms it.",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  failed: {
    icon: "cancel",
    eyebrow: "Payment not completed",
    title: "The payment did not go through",
    message:
      "No amount was charged. You can try again with the same or a different payment method.",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

function isResultStatus(value: string): value is ResultStatus {
  return value === "success" || value === "pending" || value === "failed";
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 bg-white px-5 py-3">
      <dt className="font-body-sm text-body-sm text-slate-500">{label}</dt>
      <dd
        className={`text-right font-body-sm text-body-sm text-slate-900 ${
          mono ? "font-mono tracking-tight" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

export default async function CheckoutResultPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; status?: string }>;
}) {
  const params = await searchParams;
  const reference = typeof params.ref === "string" ? params.ref : "";
  const statusParam = typeof params.status === "string" ? params.status : "";
  const status: ResultStatus = isResultStatus(statusParam) ? statusParam : "failed";
  const copy = RESULT_COPY[status];

  let order = null;
  if (reference) {
    try {
      order = await db.checkoutOrder.findUnique({ where: { reference } });
    } catch {
      order = null;
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16">
      <div className="w-full max-w-xl space-y-6">
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-label-pill text-label-pill uppercase ${copy.badge}`}
          >
            <span className="material-symbols-outlined text-[16px]">{copy.icon}</span>
            {copy.eyebrow}
          </div>

          <div className="space-y-3">
            <h1 className="font-headline-lg text-headline-lg-mobile text-slate-900 md:text-headline-lg">
              {copy.title}
            </h1>
            <p className="font-body-md text-body-md text-slate-600">{copy.message}</p>
          </div>

          {order ? (
            <dl className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 text-left">
              <Row label="Reference" mono value={order.reference} />
              <Row label="Plan" value={order.planName} />
              <Row
                label="Billing cycle"
                value={order.billingCycle === "yearly" ? "Yearly" : "Monthly"}
              />
              <Row
                label="Amount"
                value={`${order.currency} ${order.amount.toLocaleString("en-IN")}`}
              />
              <Row
                label="Payment method"
                value={order.gateway === "esewa" ? "eSewa" : "connectIPS"}
              />
              <Row label="Order status" value={order.status} />
              <Row label="Contact email" value={order.customerEmail} />
            </dl>
          ) : reference ? (
            <p className="font-body-sm text-body-sm text-slate-500">
              Reference <span className="font-mono text-slate-700">{reference}</span> was not found
              in our records.
            </p>
          ) : null}

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 font-label-btn text-label-btn text-white shadow-lg shadow-indigo-600/30 transition-colors hover:bg-indigo-700"
              href="/#pricing"
            >
              Back to pricing
            </Link>
            <a
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 px-6 py-2.5 font-label-btn text-label-btn text-slate-900 transition-colors hover:bg-slate-200"
              href="mailto:support@unitrack.app"
            >
              Contact support
            </a>
          </div>
        </div>

        <p className="text-center font-body-sm text-body-sm text-slate-500">
          Keep your reference number handy — it helps us locate your payment instantly.
        </p>
      </div>
    </main>
  );
}
