import { createHash } from "node:crypto";
import { CHECKOUT_CONFIG } from "@/lib/checkout-config";

function sha256Normalized(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const cleaned = value.trim().toLowerCase();
  if (!cleaned) return undefined;
  return createHash("sha256").update(cleaned).digest("hex");
}

function splitName(fullName: string | undefined): { firstName?: string; lastName?: string } {
  if (!fullName) return {};
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const last = parts.length > 1 ? parts.slice(1).join(" ") : undefined;
  return {
    ...(first ? { firstName: first } : {}),
    ...(last ? { lastName: last } : {}),
  };
}

export interface ConversionEventInput {
  eventName: "InitiateCheckout" | "AddPaymentInfo" | "Purchase";
  eventId: string;
  eventSourceUrl?: string;
  amountBRL: number;
  orderId?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    docNumber?: string;
  };
  tracking?: {
    fbp?: string | null;
    fbc?: string | null;
    userIp?: string | null;
    userAgent?: string | null;
  };
}

/**
 * Envia evento server-side para a Meta Conversions API (CAPI) com deduplicação por event_id.
 * Requer META_PIXEL_ID e META_CAPI_ACCESS_TOKEN no servidor.
 */
export async function sendMetaCapiEvent(input: ConversionEventInput): Promise<{ sent: boolean; reason?: string }> {
  const pixelId = process.env["META_PIXEL_ID"]?.trim();
  const accessToken = process.env["META_CAPI_ACCESS_TOKEN"]?.trim();
  if (!pixelId || !accessToken) {
    return { sent: false, reason: "META_PIXEL_ID ou META_CAPI_ACCESS_TOKEN não configurado." };
  }

  const { firstName, lastName } = splitName(input.customer?.name);
  const userData: Record<string, unknown> = {
    country: [sha256Normalized("br")],
  };
  const emHash = sha256Normalized(input.customer?.email);
  if (emHash) userData["em"] = [emHash];
  const phDigits = input.customer?.phone?.replace(/\D/g, "");
  const phHash = sha256Normalized(phDigits);
  if (phHash) userData["ph"] = [phHash];
  const fnHash = sha256Normalized(firstName);
  if (fnHash) userData["fn"] = [fnHash];
  const lnHash = sha256Normalized(lastName);
  if (lnHash) userData["ln"] = [lnHash];
  const docHash = sha256Normalized(input.customer?.docNumber?.replace(/\D/g, ""));
  if (docHash) userData["external_id"] = [docHash];
  if (input.tracking?.fbp) userData["fbp"] = input.tracking.fbp;
  if (input.tracking?.fbc) userData["fbc"] = input.tracking.fbc;
  if (input.tracking?.userIp) userData["client_ip_address"] = input.tracking.userIp;
  if (input.tracking?.userAgent) userData["client_user_agent"] = input.tracking.userAgent;

  const testEventCode = process.env["META_CAPI_TEST_EVENT_CODE"]?.trim();
  const body: Record<string, unknown> = {
    data: [
      {
        event_name: input.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: "website",
        ...(input.eventSourceUrl ? { event_source_url: input.eventSourceUrl } : {}),
        user_data: userData,
        custom_data: {
          currency: CHECKOUT_CONFIG.currency,
          value: input.amountBRL,
          content_name: CHECKOUT_CONFIG.productName,
          content_type: "product",
          ...(input.orderId ? { order_id: input.orderId } : {}),
        },
      },
    ],
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
  };

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    return { sent: false, reason: `Meta CAPI HTTP ${res.status}: ${errText.slice(0, 160)}` };
  }
  return { sent: true };
}

export interface LowTrackSaleInput {
  event: "sale.approved" | "sale.pending" | "sale.refunded";
  transactionId: string;
  amountBRL: number;
  paymentMethod: string;
  productName: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    document?: string;
  };
  tracking?: {
    utm_source?: string | null | undefined;
    utm_medium?: string | null | undefined;
    utm_campaign?: string | null | undefined;
    utm_content?: string | null | undefined;
    utm_term?: string | null | undefined;
    fbp?: string | null | undefined;
    fbc?: string | null | undefined;
  };
  userIp?: string | null;
  userAgent?: string | null;
}

/**
 * Envia evento oficial para a LowTrack Webhook API (https://lowtrack.com.br/docs/webhook).
 * Endpoint: POST https://lowtrack.com.br/api/webhook com Authorization: Bearer LOWTRACK_API_TOKEN.
 */
export async function sendLowTrackWebhook(
  input: LowTrackSaleInput,
): Promise<{ sent: boolean; reason?: string }> {
  const token = process.env["LOWTRACK_API_TOKEN"]?.trim();
  if (!token) {
    return { sent: false, reason: "LOWTRACK_API_TOKEN não configurado." };
  }

  const { firstName, lastName } = splitName(input.customer?.name);
  const payload = {
    event: input.event,
    transaction_id: input.transactionId,
    amount: input.amountBRL,
    currency: CHECKOUT_CONFIG.currency,
    payment_method: input.paymentMethod,
    product: {
      name: input.productName,
    },
    customer: {
      ...(input.customer?.name ? { name: input.customer.name } : {}),
      ...(firstName ? { first_name: firstName } : {}),
      ...(lastName ? { last_name: lastName } : {}),
      ...(input.customer?.email ? { email: input.customer.email } : {}),
      ...(input.customer?.phone ? { phone: input.customer.phone } : {}),
      ...(input.customer?.document ? { document: input.customer.document } : {}),
      country: "br",
    },
    tracking: {
      ...(input.tracking?.utm_source ? { utm_source: input.tracking.utm_source } : {}),
      ...(input.tracking?.utm_medium ? { utm_medium: input.tracking.utm_medium } : {}),
      ...(input.tracking?.utm_campaign ? { utm_campaign: input.tracking.utm_campaign } : {}),
      ...(input.tracking?.utm_content ? { utm_content: input.tracking.utm_content } : {}),
      ...(input.tracking?.utm_term ? { utm_term: input.tracking.utm_term } : {}),
      ...(input.tracking?.fbp ? { fbp: input.tracking.fbp } : {}),
      ...(input.tracking?.fbc ? { fbc: input.tracking.fbc } : {}),
    },
    ...(input.userIp ? { user_ip: input.userIp } : {}),
    ...(input.userAgent ? { user_agent: input.userAgent } : {}),
    metadata: {
      platform: "cakto_checkout_proprio",
    },
  };

  const res = await fetch("https://lowtrack.com.br/api/webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    return { sent: false, reason: `LowTrack HTTP ${res.status}: ${errText.slice(0, 160)}` };
  }
  return { sent: true };
}