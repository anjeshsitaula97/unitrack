"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ANNUAL_DISCOUNT,
  CHECKOUT_CURRENCY,
  formatPrice,
  getChargeAmount,
  getMonthlyEquivalent,
  type BillingCycle,
  type PricingPlan,
} from "@/lib/pricing";

type GatewayId = "esewa" | "connectips";
type Step = "details" | "payment";

interface GatewayOption {
  id: GatewayId;
  name: string;
  description: string;
  icon: string;
}

interface GatewayAvailability {
  enabled: boolean;
}

interface InitiateResponse {
  ok: boolean;
  error?: string;
  formUrl?: string;
  fields?: Record<string, string>;
}

const GATEWAY_OPTIONS: GatewayOption[] = [
  {
    id: "esewa",
    name: "eSewa",
    description: "Pay instantly with your eSewa wallet or linked bank account.",
    icon: "account_balance_wallet",
  },
  {
    id: "connectips",
    name: "connectIPS",
    description: "NCHL connectIPS — direct payment from Nepali bank accounts.",
    icon: "account_balance",
  },
];

const INPUT_CLASS =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-body-sm text-body-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500";

/** Navigates the browser to the gateway by POSTing a hidden signed form. */
function submitGatewayForm(action: string, fields: Record<string, string>) {
  const gatewayForm = document.createElement("form");
  gatewayForm.method = "POST";
  gatewayForm.action = action;
  gatewayForm.style.display = "none";

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    gatewayForm.appendChild(input);
  }

  document.body.appendChild(gatewayForm);
  gatewayForm.submit();
}

interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  pattern?: string;
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  pattern,
}: FieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="font-label-pill text-label-pill uppercase text-slate-500">{label}</span>
      <input
        autoComplete={autoComplete}
        className={INPUT_CLASS}
        name={name}
        onChange={(event) => onChange(event.target.value)}
        pattern={pattern}
        placeholder={placeholder}
        required
        type={type}
        value={value}
      />
    </label>
  );
}

export default function CheckoutModal({
  plan,
  cycle,
  onClose,
}: {
  plan: PricingPlan;
  cycle: BillingCycle;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>("details");
  const [availability, setAvailability] = useState<Record<GatewayId, GatewayAvailability> | null>(
    null
  );
  const [gateway, setGateway] = useState<GatewayId>("esewa");
  const [form, setForm] = useState({ name: "", email: "", phone: "", agencyName: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isYearly = cycle === "yearly";
  const discountPercent = Math.round(ANNUAL_DISCOUNT * 100);
  const monthlyEquivalent = getMonthlyEquivalent(plan, cycle);
  const chargeAmount = getChargeAmount(plan, cycle);
  const gatewayOption = GATEWAY_OPTIONS.find((option) => option.id === gateway);
  const gatewayReady = availability?.[gateway].enabled ?? false;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;

    async function loadAvailability() {
      try {
        const response = await fetch("/api/checkout/config");
        const data = (await response.json()) as {
          gateways?: Partial<Record<GatewayId, { enabled?: boolean }>>;
        };
        if (cancelled) return;

        const esewaEnabled = Boolean(data.gateways?.esewa?.enabled);
        const connectipsEnabled = Boolean(data.gateways?.connectips?.enabled);
        setAvailability({
          esewa: { enabled: esewaEnabled },
          connectips: { enabled: connectipsEnabled },
        });
        if (!esewaEnabled && connectipsEnabled) setGateway("connectips");
      } catch {
        if (!cancelled) {
          setAvailability({ esewa: { enabled: false }, connectips: { enabled: false } });
        }
      }
    }

    loadAvailability();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/checkout/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          cycle,
          gateway,
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          agencyName: form.agencyName,
        }),
      });
      const data = (await response.json()) as InitiateResponse;

      if (!response.ok || !data.ok || !data.formUrl || !data.fields) {
        setError(data.error || "We could not start the payment. Please try again.");
        setSubmitting(false);
        return;
      }

      submitGatewayForm(data.formUrl, data.fields);
    } catch {
      setError("Network error — please check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        aria-label="Close checkout"
        className="absolute inset-0 cursor-default bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />

      <div
        aria-label={`Checkout — ${plan.name}`}
        aria-modal="true"
        className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl"
        role="dialog"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white">
              <span className="material-symbols-outlined text-[20px]">
                {step === "details" ? "rocket_launch" : "lock"}
              </span>
            </div>
            <div>
              <p className="font-label-pill text-label-pill uppercase text-indigo-600">
                {step === "details" ? "Plan details" : "Secure payment"}
              </p>
              <h3 className="font-headline-sm text-headline-sm text-slate-900">{plan.name}</h3>
            </div>
          </div>
          <button
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {step === "details" ? (
          <>
            <div className="space-y-6 px-6 py-6">
              <div className="space-y-2">
                <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 font-label-pill text-label-pill uppercase text-indigo-700">
                  {plan.tag}
                </span>
                <p className="font-body-md text-body-md text-slate-600">{plan.blurb}</p>
              </div>

              <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-baseline gap-2">
                  <span className="font-metric-display text-metric-display text-slate-900">
                    {formatPrice(monthlyEquivalent)}
                  </span>
                  <span className="font-body-md text-body-md text-slate-500">/ month</span>
                </div>
                {isYearly ? (
                  <p className="font-body-sm text-body-sm text-indigo-600">
                    {formatPrice(chargeAmount)} billed annually — save {discountPercent}%
                  </p>
                ) : (
                  <p className="font-body-sm text-body-sm text-slate-500">
                    Billed monthly. Cancel or change plans at any time.
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <p className="font-label-pill text-label-pill uppercase text-slate-500">
                  What&apos;s included
                </p>
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {plan.features.map((feature) => (
                    <li
                      className="flex items-start gap-2 font-body-sm text-body-sm text-slate-600"
                      key={feature}
                    >
                      <span className="material-symbols-outlined text-[18px] text-indigo-600">
                        check_circle
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <footer className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                className="rounded-full px-5 py-2.5 font-label-btn text-label-btn text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                onClick={onClose}
                type="button"
              >
                Back to plans
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 font-label-btn text-label-btn text-white shadow-lg shadow-indigo-600/30 transition-colors hover:bg-indigo-700"
                onClick={() => setStep("payment")}
                type="button"
              >
                Continue to payment
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </footer>
          </>
        ) : (
          <form className="space-y-6 px-6 py-6" onSubmit={handleSubmit}>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 p-5 text-white">
              <div>
                <p className="font-label-pill text-label-pill uppercase text-indigo-300">
                  {isYearly ? "Yearly plan" : "Monthly plan"}
                </p>
                <p className="font-headline-sm text-headline-sm">{plan.name}</p>
              </div>
              <div className="text-right">
                <p className="font-label-pill text-label-pill uppercase text-slate-400">
                  Total due
                </p>
                <p className="font-headline-sm text-headline-sm">{formatPrice(chargeAmount)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="font-label-pill text-label-pill uppercase text-slate-500">
                Choose payment method
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {GATEWAY_OPTIONS.map((option) => {
                  const enabled = availability?.[option.id].enabled ?? false;
                  const selected = gateway === option.id;

                  return (
                    <button
                      aria-pressed={selected}
                      className={`flex flex-col gap-1 rounded-2xl border p-4 text-left transition-colors ${
                        selected
                          ? "border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/30"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      } ${enabled ? "" : "cursor-not-allowed opacity-60"}`}
                      disabled={!enabled}
                      key={option.id}
                      onClick={() => setGateway(option.id)}
                      type="button"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`material-symbols-outlined text-[20px] ${
                            selected ? "text-indigo-600" : "text-slate-500"
                          }`}
                        >
                          {option.icon}
                        </span>
                        <span className="font-label-btn text-label-btn text-slate-900">
                          {option.name}
                        </span>
                        {selected && (
                          <span className="material-symbols-outlined ml-auto text-[18px] text-indigo-600">
                            check_circle
                          </span>
                        )}
                      </span>
                      <span className="font-body-sm text-body-sm text-slate-500">
                        {availability === null
                          ? "Checking availability…"
                          : enabled
                            ? option.description
                            : "Not configured yet — add gateway credentials."}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <p className="font-label-pill text-label-pill uppercase text-slate-500">
                Billing contact
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  autoComplete="name"
                  label="Full name"
                  name="name"
                  onChange={(value) => setForm((current) => ({ ...current, name: value }))}
                  placeholder="Aarav Sharma"
                  value={form.name}
                />
                <Field
                  autoComplete="email"
                  label="Work email"
                  name="email"
                  onChange={(value) => setForm((current) => ({ ...current, email: value }))}
                  placeholder="you@agency.com"
                  type="email"
                  value={form.email}
                />
                <Field
                  autoComplete="tel"
                  label="Phone"
                  name="phone"
                  onChange={(value) => setForm((current) => ({ ...current, phone: value }))}
                  pattern="[0-9+\-\s]{7,20}"
                  placeholder="+977 98XXXXXXXX"
                  type="tel"
                  value={form.phone}
                />
                <Field
                  autoComplete="organization"
                  label="Agency name"
                  name="agencyName"
                  onChange={(value) => setForm((current) => ({ ...current, agencyName: value }))}
                  placeholder="Global Study Consultancy"
                  value={form.agencyName}
                />
              </div>
            </div>

            <p className="font-body-sm text-body-sm text-slate-500">
              You will be redirected to {gatewayOption?.name} to complete the payment. The gateway
              charges {CHECKOUT_CURRENCY} {chargeAmount.toLocaleString("en-IN")} — the same amount
              shown above.
            </p>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 font-body-sm text-body-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                className="rounded-full px-5 py-2.5 font-label-btn text-label-btn text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                onClick={() => setStep("details")}
                type="button"
              >
                Back to details
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 font-label-btn text-label-btn text-white shadow-lg shadow-indigo-600/30 transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={submitting || !gatewayReady}
                type="submit"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">
                      progress_activity
                    </span>
                    Redirecting…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                    Pay {formatPrice(chargeAmount)}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
