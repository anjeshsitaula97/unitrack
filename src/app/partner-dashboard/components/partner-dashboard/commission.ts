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

export function commissionLabel(item: {
  commissionType?: string | null;
  commissionValue?: string | number | null;
  commissionCurrency?: string | null;
}): string {
  const value = toNumber(item.commissionValue);
  if (value <= 0) return "-";
  if (item.commissionType === "Flat") {
    const currency = item.commissionCurrency || "USD";
    return `${currency} ${value.toLocaleString()}`;
  }
  return `${value}%`;
}
