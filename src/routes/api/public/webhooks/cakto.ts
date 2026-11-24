import { createFileRoute } from "@tanstack/react-router";
import { CHECKOUT_CONFIG } from "@/lib/checkout-config";

interface CaktoWebhookOrder {
  id?: string;
  refId?: string;
  status?: string;
  amount?: number | string | null;
  baseAmount?: number | string | null;
  paymentMethod?: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  fbc?: string | null;
  fbp?: string | null;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    docNumber?: string;
  };
  product?: {
    name?: string;
  };
}

interface CaktoWebhookEnvelope {
  secret?: string;
  event?: string;
  data?: CaktoWebhookOrder | CaktoWebhookOrder[];
}

function parseAmount(value: number | string | null | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && !Number.isNaN(Number(value))) return Number(value);
  return CHECKOUT_CONFIG.priceBRL;
}

export const Route = createFileRoute("/api/public/webhooks/cakto")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        let payload: CaktoWebhookEnvelope;
        try {
          payload = JSON.parse(rawBody) as CaktoWebhookEnvelope;
        } catch {
          return Response.json({ error: "Payload JSON inválido." }, { status: 400 });
        }

        const configuredSecret = process.env["CAKTO_WEBHOOK_SECRET"]?.trim() ?? "";
        const { verifyCaktoWebhookRequest } = await import("@/lib/cakto.server");
        const verification = verifyCaktoWebhookRequest({
          rawBody,
          timestampHeader: request.headers.get("x-cakto-timestamp"),
          signatureHeader: request.headers.get("x-cakto-signature"),
          bodySecret: payload.secret,
          configuredSecret,
        });

        if (!verification.valid) {
          return Response.json(
            { error: verification.reason ?? "Assinatura do webhook inválida." },
            { status: 401 },
          );
        }

        const eventName = payload.event ?? "";
        // Suporta Webhook V1 (objeto) e Webhook V2 (array de pedidos)
        const orders: CaktoWebhookOrder[] = Array.isArray(payload.data)
          ? payload.data
          : payload.data
            ? [payload.data]
            : [];

        const { sendLowTrackWebhook, sendMetaCapiEvent } = await import(
          "@/lib/conversions.server"
        );

        const results: Array<{ orderId: string; event: string; metaSent: boolean; lowTrackSent: boolean }> = [];

        for (const order of orders) {
          const orderId = order.id;
          if (!orderId) continue;

          const amountBRL = parseAmount(order.amount ?? order.baseAmount);
          const paymentMethod = order.paymentMethod ?? "pix";
          const productName = order.product?.name || CHECKOUT_CONFIG.productName;

          let metaSent = false;
          let lowTrackSent = false;

          if (eventName === "purchase_approved" && order.status === "paid") {
            // Purchase disparado EXCLUSIVAMENTE após confirmação real (paid)
            const [metaRes, ltRes] = await Promise.all([
              sendMetaCapiEvent({
                eventName: "Purchase",
                eventId: `purchase_${orderId}`,
                amountBRL,
                orderId,
                customer: {
                  ...(order.customer?.name ? { name: order.customer.name } : {}),
                  ...(order.customer?.email ? { email: order.customer.email } : {}),
                  ...(order.customer?.phone ? { phone: order.customer.phone } : {}),
                  ...(order.customer?.docNumber ? { docNumber: order.customer.docNumber } : {}),
                },
                tracking: {
                  fbp: order.fbp ?? null,
                  fbc: order.fbc ?? null,
                },
              }),
              sendLowTrackWebhook({
                event: "sale.approved",
                transactionId: orderId,
                amountBRL,
                paymentMethod,
                productName,
                customer: {
                  ...(order.customer?.name ? { name: order.customer.name } : {}),
                  ...(order.customer?.email ? { email: order.customer.email } : {}),
                  ...(order.customer?.phone ? { phone: order.customer.phone } : {}),
                  ...(order.customer?.docNumber ? { document: order.customer.docNumber } : {}),
                },
                tracking: {
                  utm_source: order.utm_source ?? null,
                  utm_medium: order.utm_medium ?? null,
                  utm_campaign: order.utm_campaign ?? null,
                  utm_content: order.utm_content ?? null,
                  utm_term: order.utm_term ?? null,
                  fbp: order.fbp ?? null,
                  fbc: order.fbc ?? null,
                },
              }),
            ]);
            metaSent = metaRes.sent;
            lowTrackSent = ltRes.sent;
          } else if (eventName === "refund" || eventName === "chargeback" || order.status === "refunded") {
            const ltRes = await sendLowTrackWebhook({
              event: "sale.refunded",
              transactionId: orderId,
              amountBRL,
              paymentMethod,
              productName,
              customer: {
                ...(order.customer?.name ? { name: order.customer.name } : {}),
                ...(order.customer?.email ? { email: order.customer.email } : {}),
              },
            });
            lowTrackSent = ltRes.sent;
          }

          results.push({ orderId, event: eventName, metaSent, lowTrackSent });
        }

        return Response.json({ received: true, processed: results.length, results });
      },
    },
  },
});