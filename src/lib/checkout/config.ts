/**
 * Runtime configuration for the public checkout payment gateways.
 * Both gateways settle in NPR — the plan figures are NPR amounts.
 */

export type CheckoutGatewayId = "esewa" | "connectips";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getAppBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL || process.env.APP_BASE_URL || "http://localhost:4028";
  return trimTrailingSlash(url);
}

export interface EsewaConfig {
  enabled: boolean;
  mode: "uat" | "production";
  productCode: string;
  secretKey: string;
  formUrl: string;
  statusUrl: string;
}

export function getEsewaConfig(): EsewaConfig {
  const mode = process.env.ESEWA_MODE === "production" ? "production" : "uat";
  const productCode = process.env.ESEWA_PRODUCT_CODE || "";
  const secretKey = process.env.ESEWA_SECRET_KEY || "";

  return {
    enabled: Boolean(productCode && secretKey),
    mode,
    productCode,
    secretKey,
    formUrl:
      mode === "production"
        ? "https://epay.esewa.com.np/api/epay/main/v2/form"
        : "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
    statusUrl:
      mode === "production"
        ? "https://esewa.com.np/api/epay/transaction/status/"
        : "https://rc.esewa.com.np/api/epay/transaction/status/",
  };
}

export interface ConnectIpsConfig {
  enabled: boolean;
  mode: "test" | "production";
  baseUrl: string;
  merchantId: string;
  appId: string;
  appName: string;
  appPassword: string;
  pfxPath: string;
  pfxBase64: string;
  pfxPassword: string;
}

export function getConnectIpsConfig(): ConnectIpsConfig {
  const mode = process.env.CONNECTIPS_MODE === "production" ? "production" : "test";
  const merchantId = process.env.CONNECTIPS_MERCHANT_ID || "";
  const appId = process.env.CONNECTIPS_APP_ID || "";
  const appPassword = process.env.CONNECTIPS_APP_PASSWORD || "";
  const pfxPath = process.env.CONNECTIPS_PFX_PATH || "";
  const pfxBase64 = process.env.CONNECTIPS_PFX_BASE64 || "";
  const pfxPassword = process.env.CONNECTIPS_PFX_PASSWORD || "";

  return {
    enabled: Boolean(merchantId && appId && appPassword && (pfxPath || pfxBase64) && pfxPassword),
    mode,
    baseUrl: trimTrailingSlash(
      process.env.CONNECTIPS_BASE_URL ||
        (mode === "production" ? "https://login.connectips.com" : "https://dev.connectips.com")
    ),
    merchantId,
    appId,
    appName: process.env.CONNECTIPS_APP_NAME || "UniTrack",
    appPassword,
    pfxPath,
    pfxBase64,
    pfxPassword,
  };
}

export function getGatewayAvailability(): Record<CheckoutGatewayId, { enabled: boolean }> {
  return {
    esewa: { enabled: getEsewaConfig().enabled },
    connectips: { enabled: getConnectIpsConfig().enabled },
  };
}
