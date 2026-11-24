import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { CHECKOUT_CONFIG } from "@/lib/checkout-config";
import {
  buyerSchema,
  onlyDigits,
  toCaktoPhoneE164,
  trackingParamsSchema,
} from "@/lib/checkout-validation";

const createPaymentInputSchema = z.object({
  paymentMethod: z.enum(["pix", "credit_card", "threeDs"]),
  idempotencyKey: z.string().min(8).max(255),
  fingerprint: z.string().min(4).max(255),
  buyer: buyerSchema,
  selectedBumpIds: z.array(z.string().max(64)).max(10).default([]),
  tracking: trackingParamsSchema.optional(),
  cardToken: z.string().min(8).max(512).optional(),
  installments: z.number().int().min(1).max(12).default(1),
  antifraudReference: z.string().min(4).max(255).optional(),
  threeDSecure: z
    .object({
      cavv: z.string().optional(),
      eci: z.string().optional(),
      xid: z.string().optional(),
      referenceId: z.string().optional(),
      version: z.string().optional(),
      dataOnly: z.boolean().optional(),
    })
    .optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentInputSchema>;

export interface CreatePaymentResult {
  ok: boolean;
  code?: "NOT_CONFIGURED" | "VALIDATION_ERROR" | "PAYMENT_DECLINED" | "PROVIDER_ERROR";
  message?: string;
  orderId?: string;
  refId?: string;
  status?: string;
  paymentMethod?: string;
  amountBRL?: number;
  accessToken?: string;
  pix?: {
    qrCode: string;
    expirationDate?: string;
  };
}

/** Retorna apenas status público de configuração do checkout (nunca expõe segredos). */
export const getCheckoutPublicConfig = createServerFn({ method: "GET" }).handler(async () => {
  const { getCaktoEnvStatus } = await import("@/lib/cakto.server");
  const status = getCaktoEnvStatus();
  return {
    caktoReady: status.caktoApiConfigured && status.caktoOfferConfigured,
    caktoApiConfigured: status.caktoApiConfigured,
    caktoOfferConfigured: status.caktoOfferConfigured,
    caktoSdkClientId: status.caktoSdkClientId,
    caktoCardReady: Boolean(
      status.caktoApiConfigured && status.caktoOfferConfigured && status.caktoSdkClientId,
    ),
    cakto3dsEnabled: status.cakto3dsEnabled,
  };
});

/**
 * Cria pagamento real na Cakto (POST /public_api/payments/) com validação server-side,
 * X-Idempotency-Key contra cobranças duplicadas e sem trafegar dados brutos de cartão.
 */
export const createCheckoutPayment = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => createPaymentInputSchema.parse(raw))
  .handler(async ({ data }): Promise<CreatePaymentResult> => {
    const {
      createCaktoPayment,
      getCaktoEnvStatus,
      resolveAuthoritativeOffer,
      signOrderAccessToken,
    } = await import("@/lib/cakto.server");
    const { sendLowTrackWebhook } = await import("@/lib/conversions.server");

    const env = getCaktoEnvStatus();
    if (!env.caktoApiConfigured || !env.caktoOfferConfigured) {
      return {
        ok: false,
        code: "NOT_CONFIGURED",
        message:
          "Integração Cakto ainda não configurada neste ambiente. Configure CAKTO_API_CLIENT_ID, CAKTO_API_CLIENT_SECRET e CAKTO_OFFER_ID no servidor.",
      };
    }

    const { offerId, expectedAmountBRL } = resolveAuthoritativeOffer(data.selectedBumpIds);

    if (data.paymentMethod !== "pix") {
      if (!data.cardToken) {
        return {
          ok: false,
          code: "VALIDATION_ERROR",
          message: "Token do cartão ausente. Atualize a página e tente novamente.",
        };
      }
      if (!data.antifraudReference) {
        return {
          ok: false,
          code: "VALIDATION_ERROR",
          message: "Validação antifraude da Cakto não concluída. Tente novamente.",
        };
      }
    }

    const forwardedFor = getRequestHeader("x-forwarded-for");
    const clientIp =
      forwardedFor?.split(",")[0]?.trim() ||
      getRequestHeader("cf-connecting-ip") ||
      undefined;
    const userAgent = getRequestHeader("user-agent") || undefined;

    const metadata: Record<string, string> = {};
    if (data.tracking?.utm_source) metadata["utm_source"] = data.tracking.utm_source;
    if (data.tracking?.utm_medium) metadata["utm_medium"] = data.tracking.utm_medium;
    if (data.tracking?.utm_campaign) metadata["utm_campaign"] = data.tracking.utm_campaign;
    if (data.tracking?.utm_term) metadata["utm_term"] = data.tracking.utm_term;
    if (data.tracking?.utm_content) metadata["utm_content"] = data.tracking.utm_content;
    if (data.tracking?.sck) metadata["sck"] = data.tracking.sck;

    const customer: Record<string, unknown> = {
      name: data.buyer.name.trim(),
      email: data.buyer.email.trim().toLowerCase(),
      phone: toCaktoPhoneE164(data.buyer.phone),
      fingerprint: data.fingerprint,
      docType: "cpf",
      docNumber: onlyDigits(data.buyer.cpf),
      ...(clientIp ? { ip: clientIp } : {}),
    };

    const payload: Record<string, unknown> = {
      paymentMethod: data.paymentMethod,
      customer,
      items: [
        {
          offerId,
          quantity: 1,
          offerType: "main",
        },
      ],
      ...(Object.keys(metadata).length > 0 ? { metadata } : {}),
    };

    if (data.paymentMethod === "pix") {
      payload["pixExpiresIn"] = 1800;
    } else {
      payload["card"] = { token: data.cardToken };
      payload["installments"] = Math.min(data.installments, CHECKOUT_CONFIG.maxInstallments);
      // Campo de topo em snake_case conforme documentação oficial da Cakto:
      payload["antifraud_profiling_attempt_reference"] = data.antifraudReference;
      if (data.paymentMethod === "threeDs" && data.threeDSecure) {
        payload["threeDSecure"] = data.threeDSecure;
      }
    }

    const result = await createCaktoPayment(payload, data.idempotencyKey);
    if (!result.ok) {
      return {
        ok: false,
        code: result.status === 402 || result.status === 422 ? "PAYMENT_DECLINED" : "PROVIDER_ERROR",
        message: result.message,
      };
    }

    const order = result.data;
    const accessToken = signOrderAccessToken(order.id, data.buyer.email);
    const amountNumber =
      typeof order.amount === "number"
        ? order.amount
        : typeof order.amount === "string" && !Number.isNaN(Number(order.amount))
          ? Number(order.amount)
          : expectedAmountBRL;

    if (order.status === "declined" || order.status === "refused" || order.status === "blocked") {
      return {
        ok: false,
        code: "PAYMENT_DECLINED",
        message:
          "Pagamento não autorizado pela operadora do cartão. Verifique os dados, o limite disponível ou conclua via Pix.",
        orderId: order.id,
        status: order.status,
      };
    }

    // Notifica LowTrack apenas como sale.pending quando Pix for gerado (nunca dispara Purchase)
    if (data.paymentMethod === "pix" && order.status === "waiting_payment") {
      await sendLowTrackWebhook({
        event: "sale.pending",
        transactionId: order.id,
        amountBRL: amountNumber,
        paymentMethod: "pix",
        productName: CHECKOUT_CONFIG.productName,
        customer: {
          name: data.buyer.name,
          email: data.buyer.email,
          phone: toCaktoPhoneE164(data.buyer.phone),
          document: onlyDigits(data.buyer.cpf),
        },
        ...(data.tracking ? { tracking: data.tracking } : {}),
        ...(clientIp ? { userIp: clientIp } : {}),
        ...(userAgent ? { userAgent } : {}),
      }).catch(() => undefined);
    }

    return {
      ok: true,
      orderId: order.id,
      ...(order.refId ? { refId: order.refId } : {}),
      status: order.status,
      paymentMethod: order.paymentMethod,
      amountBRL: amountNumber,
      accessToken,
      ...(order.pix?.qrCode
        ? {
            pix: {
              qrCode: order.pix.qrCode,
              ...(order.pix.expirationDate ? { expirationDate: order.pix.expirationDate } : {}),
            },
          }
        : {}),
    };
  });

const checkOrderSchema = z.object({
  orderId: z.string().min(6).max(128),
  accessToken: z.string().min(32).max(128),
});

export interface VerifiedOrderStatusResult {
  verified: boolean;
  paid: boolean;
  status: string;
  orderId?: string;
  refId?: string;
  amountBRL?: number;
  paymentMethod?: string;
  paidAt?: string | null;
  customerName?: string;
  customerEmailMasked?: string;
  appAccessUrl?: string;
  reason?: string;
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return "***";
  const visible = user.slice(0, 2);
  return `${visible}***@${domain}`;
}

/**
 * Consulta o status real do pedido direto na Cakto (GET /public_api/orders/{id}/),
 * exigindo o token HMAC assinado da sessão do comprador.
 * Usado pelo polling do Pix e pela página /obrigado antes de liberar acesso ou disparar Purchase.
 */
export const checkOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => checkOrderSchema.parse(raw))
  .handler(async ({ data }): Promise<VerifiedOrderStatusResult> => {
    const { fetchCaktoOrder, getCaktoEnvStatus, verifyOrderAccessToken } = await import(
      "@/lib/cakto.server"
    );

    const env = getCaktoEnvStatus();
    if (!env.caktoApiConfigured) {
      return {
        verified: false,
        paid: false,
        status: "unconfigured",
        reason: "Credenciais da Cakto não configuradas no servidor.",
      };
    }

    let order;
    try {
      order = await fetchCaktoOrder(data.orderId);
    } catch {
      return {
        verified: false,
        paid: false,
        status: "error",
        reason: "Não foi possível verificar o pedido na Cakto agora.",
      };
    }

    if (!order || !order.customer?.email) {
      return {
        verified: false,
        paid: false,
        status: "not_found",
        reason: "Pedido não encontrado ou sem permissão de leitura.",
      };
    }

    const isTokenValid = verifyOrderAccessToken(order.id, order.customer.email, data.accessToken);
    if (!isTokenValid) {
      return {
        verified: false,
        paid: false,
        status: "unauthorized",
        reason: "Token de verificação inválido para este pedido.",
      };
    }

    const isPaid = order.status === "paid";
    const amountNumber =
      typeof order.amount === "number"
        ? order.amount
        : typeof order.amount === "string" && !Number.isNaN(Number(order.amount))
          ? Number(order.amount)
          : CHECKOUT_CONFIG.priceBRL;

    const configuredAppUrl = process.env["APP_ACCESS_URL"]?.trim();
    const appAccessUrl = isPaid
      ? configuredAppUrl || order.product?.emailAccessLink || undefined
      : undefined;

    return {
      verified: true,
      paid: isPaid,
      status: order.status,
      orderId: order.id,
      ...(order.refId ? { refId: order.refId } : {}),
      amountBRL: amountNumber,
      ...(order.paymentMethod ? { paymentMethod: order.paymentMethod } : {}),
      paidAt: order.paidAt ?? null,
      ...(order.customer.name ? { customerName: order.customer.name } : {}),
      customerEmailMasked: maskEmail(order.customer.email),
      ...(appAccessUrl ? { appAccessUrl } : {}),
    };
  });

const relayEventSchema = z.object({
  eventName: z.enum(["InitiateCheckout", "AddPaymentInfo"]),
  eventId: z.string().min(4).max(128),
  amountBRL: z.number().positive().max(10000),
  eventSourceUrl: z.string().url().max(500).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(30).optional(),
  fbp: z.string().max(120).optional(),
  fbc: z.string().max(255).optional(),
});

/** Repassa InitiateCheckout ou AddPaymentInfo para Meta CAPI com o mesmo event_id do navegador. */
export const relayBrowserEventToCapi = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => relayEventSchema.parse(raw))
  .handler(async ({ data }) => {
    const { sendMetaCapiEvent } = await import("@/lib/conversions.server");
    const forwardedFor = getRequestHeader("x-forwarded-for");
    const userIp =
      forwardedFor?.split(",")[0]?.trim() || getRequestHeader("cf-connecting-ip") || null;
    const userAgent = getRequestHeader("user-agent") || null;

    return sendMetaCapiEvent({
      eventName: data.eventName,
      eventId: data.eventId,
      amountBRL: data.amountBRL,
      ...(data.eventSourceUrl ? { eventSourceUrl: data.eventSourceUrl } : {}),
      customer: {
        ...(data.email ? { email: data.email } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
      },
      tracking: {
        fbp: data.fbp ?? null,
        fbc: data.fbc ?? null,
        userIp,
        userAgent,
      },
    });
  });