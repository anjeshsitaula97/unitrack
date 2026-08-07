export interface ExchangeRate {
  currency: {
    iso3: string;
    name: string;
    unit: number;
  };
  buy: string;
  sell: string;
}

export interface ForexResponse {
  status: {
    code: number;
  };
  errors: unknown;
  params: unknown;
  data: {
    payload: Array<{
      date: string;
      published_on: string;
      modified_on: string;
      rates: ExchangeRate[];
    }>;
  };
}

export async function getLatestRates(): Promise<Record<string, number>> {
  const today = new Date().toISOString().split("T")[0];
  try {
    const response = await fetch(
      `https://www.nrb.org.np/api/forex/v1/rates?page=1&per_page=100&from=${today}&to=${today}`
    );
    if (!response.ok) throw new Error("Failed to fetch rates");

    const data: ForexResponse = await response.json();
    const rates = data.data.payload[0]?.rates || [];

    const rateMap: Record<string, number> = {
      NPR: 1,
    };

    rates.forEach((r) => {
      // We use the sell rate for conversion as it's typically what customers pay
      rateMap[r.currency.iso3] = parseFloat(r.sell) / r.currency.unit;
    });

    return rateMap;
  } catch (error) {
    console.error("Forex fetch error:", error);
    return { NPR: 1 }; // Return base if failed
  }
}

export function convertToNPR(
  amount: string | number,
  fromCurrency: string,
  rates: Record<string, number>
): number {
  const value = typeof amount === "string" ? parseFloat(amount.replace(/[^0-9.]/g, "")) : amount;
  if (isNaN(value)) return 0;

  const rate = rates[fromCurrency.toUpperCase()];
  if (!rate) return 0;

  return value * rate;
}

const nprFormatter = new Intl.NumberFormat("en-NP", {
  style: "currency",
  currency: "NPR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatNPR(amount: number): string {
  return nprFormatter.format(amount);
}
