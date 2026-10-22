import { COUNTRIES } from "@/lib/data/countries";
import type { CommissionRow } from "./types";

export function currencySymbol(country: string): string {
  return COUNTRIES.find((c) => c.name === country)?.currencySymbol || "$";
}

export function toNumber(value?: string | number | null): number {
  if (value === undefined || value === null || value === "") return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

export function hasCommission(item: {
  commissionType?: string | null;
  commissionValue?: string | number | null;
}): boolean {
  return toNumber(item.commissionValue) > 0 && !!item.commissionType;
}

export function amountDisplay(row: CommissionRow): string {
  const type = row.commissionType;
  const value = toNumber(row.commissionValue);
  if (value <= 0) return "-";
  if (type === "Flat") {
    const currency = row.commissionCurrency;
    const sym = currency || (row.country ? currencySymbol(row.country) : "$");
    return `${sym} ${value.toLocaleString()}`;
  }
  return `${value}%`;
}
