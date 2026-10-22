import { COUNTRIES } from "@/lib/data/countries";

export function parseCountries(raw?: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return typeof raw === "string" && raw.trim() ? [raw] : [];
  }
}

export function currencySymbol(country: string): string {
  return COUNTRIES.find((c) => c.name === country)?.currencySymbol || "$";
}

export function formatAmount(value?: string | number | null): string {
  const num = Number(value);
  if (!value || isNaN(num) || num <= 0) return "-";
  return num.toLocaleString();
}
