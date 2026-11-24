import { createHmac, timingSafeEqual } from "node:crypto";
import { CHECKOUT_CONFIG, getActiveOrderBumps } from "@/lib/checkout-config";

const CAKTO_API_BASE = "https://api.cakto.com.br";
const WEBHOOK_TOLERANCE_SECONDS = 5 * 60;

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

let cachedToken: CachedToken | null = null;

export interface CaktoEnvStatus {
  caktoApiConfigured: boolean;
  caktoOfferConfigured: boolean;
  caktoSdkClientId: string;
  cakto3dsEnabled: boolean;
  webhookSecretConfigured: boolean;
  metaCapiConfigured: boolean;
  lowTrackConfigured: boolean;
}

export function getCaktoEnvStatus(): CaktoEnvStatus {
  const clientId = process.env["CAKTO_API_CLIENT_ID"]?.trim() ?? "";
  const clientSecret = process.env["CAKTO_API_CLIENT_SECRET"]?.trim() ?? "";
  const offerId = process.env["CAKTO_OFFER_ID"]?.trim() ?? "";
  const sdkClientId =
    process.env["CAKTO_SDK_CLIENT_ID"]?.trim() ||
    process.env["VITE_CAKTO_SDK_CLIENT_ID"]?.trim() ||
    "";

  return {
    caktoApiConfigured: Boolean(clientId && clientSecret),
    caktoOfferConfigured: Boolean(offerId),
    caktoSdkClientId: sdkClientId,
    cakto3dsEnabled: process.env["CAKTO_ENABLE_3DS"] === "true",
    webhookSecretConfigured: Boolean(process.env["CAKTO_WEBHOOK_SECRET"]?.trim()),
    metaCapiConfigured: Boolean(
      process.env["META_PIXEL_ID"]?.trim() && process.env["META_CAPI_ACCESS_TOKEN"]?.trim(),
    ),
    lowTrackConfigured: Boolean(process.env["LOWTRACK_API_TOKEN"]?.trim()),
  };
}

function getSigningSecret(): string {
  const secret =
    process.env["CHECKOUT_SIGNING_SECRET"]?.trim() ||
    process.env["CAKTO_WEBHOOK_SECRET"]?.trim() ||
    process.env["CAKTO_API_CLIENT_SECRET"]?.trim();
  if (!secret) {
    throw new Error("CHECKOUT_SIGNING_SECRET não configurado no servidor.");
  }
  return secret;
}

/** Gera token HMAC-SHA256 vinculando orderId ao e-mail do comprador para consulta segura de status e /obrigado. */
export function signOrderAccessToken(orderId: string, customerEmail: string): string {
  const normalized = `${orderId}:${customerEmail.trim().toLowerCase()}`;
  return createHmac("sha256", getSigningSecret()).update(normalized).digest("hex");
}

/** Valida token HMAC-SHA256 em tempo constante. */
export function verifyOrderAccessToken(
  orderId: string,
  customerEmail: string,
  providedToken: string,
): boolean {
  if (!providedToken || !orderId || !customerEmail) return false;
  const expected = signOrderAccessToken(orderId, customerEmail);
  const a = Buffer.from(providedToken, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Valida autenticidade do webhook da Cakto conforme https://docs.cakto.com.br/conceitos/webhooks
 * Prioriza header X-Cakto-Signature (v1=HMAC-SHA256 de "{timestamp}.{rawBody}") com janela de 5 min.
 * Mantém fallback timing-safe para o campo secret no corpo quando headers de assinatura estiverem ausentes.
 */
export function verifyCaktoWebhookRequest(params: {
  rawBody: string;
  timestampHeader: string | null;
  signatureHeader: string | null;
  bodySecret?: string | undefined;
  configuredSecret: string;
  nowSeconds?: number;
}): { valid: boolean; reason?: string } {
  const { rawBody, timestampHeader, signatureHeader, bodySecret, configuredSecret } = params;
  if (!configuredSecret) {
    return { valid: false, reason: "CAKTO_WEBHOOK_SECRET ausente no servidor." };
  }

  if (timestampHeader && signatureHeader) {
    const ts = Number(timestampHeader);
    const now = params.nowSeconds ?? Math.floor(Date.now() / 1000);
    if (!Number.isFinite(ts) || Math.abs(now - ts) > WEBHOOK_TOLERANCE_SECONDS) {
      return { valid: false, reason: "Timestamp do webhook fora da janela de tolerância." };
    }
    const expectedHex = createHmac("sha256", configuredSecret)
      .update(`${timestampHeader}.${rawBody}`, "utf8")
      .digest("hex");
    const expectedSig = `v1=${expectedHex}`;
    const a = Buffer.from(signatureHeader, "utf8");
    const b = Buffer.from(expectedSig, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { valid: false, reason: "Assinatura X-Cakto-Signature inválida." };
    }
    return { valid: true };
  }

  if (bodySecret) {
    const a = Buffer.from(bodySecret, "utf8");
    const b = Buffer.from(configuredSecret, "utf8");
    if (a.length === b.length && timingSafeEqual(a, b)) {
      return { valid: true };
    }
  }

  return { valid: false, reason: "Assinatura ou segredo do webhook ausente/inválido." };
}

/** Resolve o offerId autorizado no servidor (impede adulteração de preço/oferta pelo cliente). */
export function resolveAuthoritativeOffer(selectedBumpIds: readonly string[]): {
  offerId: string;
  expectedAmountBRL: number;
  selectedBumpNames: string[];
} {
  const baseOfferId = process.env["CAKTO_OFFER_ID"]?.trim() ?? "";
  if (!baseOfferId) {
    throw new Error("CAKTO_OFFER_ID não configurado no servidor.");
  }

  const activeBumps = getActiveOrderBumps();
  const chosenBumps = selectedBumpIds
    .map((id) => activeBumps.find((b) => b.id === id))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  if (chosenBumps.length === 0) {
    return {
      offerId: baseOfferId,
      expectedAmountBRL: CHECKOUT_CONFIG.priceBRL,
      selectedBumpNames: [],
    };
  }

  // A API POST /public_api/payments/ aceita exatamente 1 item em items[].
  // Quando houver order bumps ativos, mapeie ofertas combinadas via CAKTO_COMBO_OFFERS_JSON
  // (ex: {"bump_a":"OFFER_ID_COMBO"}) ou use o caktoOfferId da oferta combinada.
  const comboMapRaw = process.env["CAKTO_COMBO_OFFERS_JSON"]?.trim();
  const comboKey = chosenBumps
    .map((b) => b.id)
    .sort()
    .join("+");
  let resolvedOfferId = baseOfferId;
  if (comboMapRaw) {
    try {
      const parsed = JSON.parse(comboMapRaw) as Record<string, string>;
      const mapped = parsed[comboKey];
      if (mapped) resolvedOfferId = mapped;
    } catch {
      // mantém oferta principal caso JSON esteja malformado
    }
  }

  const total =
    Math.round(
      (CHECKOUT_CONFIG.priceBRL + chosenBumps.reduce((acc, b) => acc + b.priceBRL, 0)) * 100,
    ) / 100;

  return {
    offerId: resolvedOfferId,
    expectedAmountBRL: total,
    selectedBumpNames: chosenBumps.map((b) => b.name),
  };
}

/** Obtém access_token OAuth2 da Cakto via POST /public_api/token/ com cache em memória. */
export async function getCaktoAccessToken(): Promise<string> {
  const clientId = process.env["CAKTO_API_CLIENT_ID"]?.trim();
  const clientSecret = process.env["CAKTO_API_CLIENT_SECRET"]?.trim();
  if (!clientId || !clientSecret) {
    throw new Error("Credenciais da Cakto (CAKTO_API_CLIENT_ID / CAKTO_API_CLIENT_SECRET) não configuradas.");
  }

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 30_000) {
    return cachedToken.accessToken;
  }

  const res = await fetch(`${CAKTO_API_BASE}/public_api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Falha ao autenticar na Cakto (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) {
    throw new Error("Resposta OAuth2 da Cakto não retornou access_token.");
  }

  const ttlMs = Math.max(60, (data.expires_in ?? 3600) - 60) * 1000;
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: now + ttlMs,
  };
  return data.access_token;
}

export interface CaktoPaymentResponse {
  id: string;
  refId?: string;
  status: string;
  paymentMethod: string;
  amount?: string | number;
  checkoutUrl?: string;
  createdAt?: string;
  pix?: {
    qrCode?: string;
    expirationDate?: string;
  };
}

/** Chama POST /public_api/payments/ com X-Idempotency-Key obrigatório. */
export async function createCaktoPayment(
  payload: Record<string, unknown>,
  idempotencyKey: string,
): Promise<{ ok: true; data: CaktoPaymentResponse } | { ok: false; status: number; message: string }> {
  const accessToken = await getCaktoAccessToken();

  const res = await fetch(`${CAKTO_API_BASE}/public_api/payments/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
  });

  const rawText = await res.text();
  let parsed: Record<string, unknown> = {};
  try {
    parsed = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : {};
  } catch {
    parsed = {};
  }

  if (!res.ok) {
    const detail =
      (typeof parsed["detail"] === "string" && parsed["detail"]) ||
      (typeof parsed["message"] === "string" && parsed["message"]) ||
      (typeof parsed["error"] === "string" && parsed["error"]) ||
      `Erro ao processar pagamento na Cakto (${res.status}).`;
    return { ok: false, status: res.status, message: detail };
  }

  return { ok: true, data: parsed as unknown as CaktoPaymentResponse };
}

export interface CaktoOrderDetails {
  id: string;
  refId?: string;
  status: string;
  amount?: string | number;
  paymentMethod?: string;
  paidAt?: string | null;
  customer?: {
    name?: string;
    email?: string;
  };
  product?: {
    name?: string;
    emailAccessLink?: string | null;
  };
}

/** Consulta o status real de um pedido na Cakto via GET /public_api/orders/{id}/ (escopo read orders). */
export async function fetchCaktoOrder(orderId: string): Promise<CaktoOrderDetails | null> {
  const accessToken = await getCaktoAccessToken();
  const res = await fetch(`${CAKTO_API_BASE}/public_api/orders/${encodeURIComponent(orderId)}/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Falha ao consultar pedido na Cakto (${res.status}).`);
  }
  return (await res.json()) as CaktoOrderDetails;
}