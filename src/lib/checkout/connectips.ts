import { createPrivateKey, createSign } from "crypto";
import type { KeyObject } from "crypto";
import { readFileSync } from "fs";
import { getConnectIpsConfig, type ConnectIpsConfig } from "./config";

export interface ConnectIpsForm {
  formUrl: string;
  fields: Record<string, string>;
}

export interface ConnectIpsValidationResult {
  status: string;
  statusDesc: string | null;
}

function loadPrivateKey(config: ConnectIpsConfig): KeyObject {
  const pfxBuffer = config.pfxBase64
    ? Buffer.from(config.pfxBase64, "base64")
    : readFileSync(config.pfxPath);
  // Node supports PKCS#12 ("pfx") here at runtime; the KeyFormat typings lag behind.
  return createPrivateKey({
    key: pfxBuffer,
    format: "pfx",
    passphrase: config.pfxPassword,
  } as unknown as Parameters<typeof createPrivateKey>[0]);
}

/** SHA256withRSA signature of the token message, base64 encoded (per NCHL docs). */
function signToken(message: string, privateKey: KeyObject): string {
  const signer = createSign("RSA-SHA256");
  signer.update(message);
  signer.end();
  return signer.sign(privateKey).toString("base64");
}

function formatTxnDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${date.getFullYear()}`;
}

function truncate(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value;
}

/** connectIPS amounts are integers in paisa. */
export function toPaisa(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Signed login-page form fields — the browser POSTs these to
 * {baseUrl}/connectipswebgw/loginpage to start the payment.
 */
export function buildConnectIpsForm(order: {
  reference: string;
  amount: number;
  planName: string;
  customerName: string;
  agencyName: string;
}): ConnectIpsForm {
  const config = getConnectIpsConfig();
  if (!config.enabled) throw new Error("connectIPS is not configured");

  const txnDate = formatTxnDate(new Date());
  const txnAmt = String(toPaisa(order.amount));
  const remarks = truncate(`UniTrack ${order.planName}`, 50);
  const particulars = truncate(`${order.customerName} - ${order.agencyName}`, 100);

  const message =
    `MERCHANTID=${config.merchantId},APPID=${config.appId},APPNAME=${config.appName},` +
    `TXNID=${order.reference},TXNDATE=${txnDate},TXNCRNCY=NPR,TXNAMT=${txnAmt},` +
    `REFERENCEID=${order.reference},REMARKS=${remarks},PARTICULARS=${particulars},TOKEN=TOKEN`;

  return {
    formUrl: `${config.baseUrl}/connectipswebgw/loginpage`,
    fields: {
      MERCHANTID: config.merchantId,
      APPID: config.appId,
      APPNAME: config.appName,
      TXNID: order.reference,
      TXNDATE: txnDate,
      TXNCRNCY: "NPR",
      TXNAMT: txnAmt,
      REFERENCEID: order.reference,
      REMARKS: remarks,
      PARTICULARS: particulars,
      TOKEN: signToken(message, loadPrivateKey(config)),
    },
  };
}

/**
 * Server-to-server validation after the user is redirected back.
 * connectIPS only appends TXNID to the registered success/failure URLs,
 * so the merchant must confirm the final status with this API.
 */
export async function validateConnectIpsTransaction(order: {
  reference: string;
  amount: number;
}): Promise<ConnectIpsValidationResult | null> {
  const config = getConnectIpsConfig();
  if (!config.enabled) return null;

  const txnAmt = toPaisa(order.amount);
  const message = `MERCHANTID=${config.merchantId},APPID=${config.appId},REFERENCEID=${order.reference},TXNAMT=${txnAmt}`;
  const token = signToken(message, loadPrivateKey(config));
  const basicAuth = Buffer.from(`${config.appId}:${config.appPassword}`).toString("base64");
  const merchantId = /^\d+$/.test(config.merchantId)
    ? Number(config.merchantId)
    : config.merchantId;

  try {
    const response = await fetch(`${config.baseUrl}/connectipswebws/api/creditor/validatetxn`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        merchantId,
        appId: config.appId,
        referenceId: order.reference,
        txnAmt,
        token,
      }),
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { status?: string; statusDesc?: string };
    if (!data.status) return null;

    return { status: data.status, statusDesc: data.statusDesc ?? null };
  } catch {
    return null;
  }
}
