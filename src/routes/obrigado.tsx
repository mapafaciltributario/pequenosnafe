import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import {
  checkOrderStatus,
  type VerifiedOrderStatusResult,
} from "@/lib/checkout.functions";
import { CHECKOUT_CONFIG, formatBRL } from "@/lib/checkout-config";
import { initMarketingScripts, trackConfirmedPurchaseEvent } from "@/lib/tracking";

const searchSchema = z.object({
  order: z.string().optional(),
  token: z.string().optional(),
});

export const Route = createFileRoute("/obrigado")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Confirmação do Pedido — Pequenos na Fé" },
      {
        name: "description",
        content: "Verificação de pagamento e liberação segura de acesso ao Pequenos na Fé.",
      },
      { property: "og:title", content: "Confirmação do Pedido — Pequenos na Fé" },
      {
        property: "og:description",
        content: "Confirmação de pagamento e orientações de acesso ao Pequenos na Fé.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ObrigadoPage,
});

function ObrigadoPage() {
  const { order, token } = Route.useSearch();
  const checkStatusFn = useServerFn(checkOrderStatus);

  const [loading, setLoading] = useState(Boolean(order && token));
  const [result, setResult] = useState<VerifiedOrderStatusResult | null>(null);

  const verifyOrder = useCallback(async () => {
    if (!order || !token) {
      setLoading(false);
      setResult({
        verified: false,
        paid: false,
        status: "missing_params",
        reason:
          "Esta página só libera acesso após uma compra confirmada com código de verificação válido.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await checkStatusFn({ data: { orderId: order, accessToken: token } });
      setResult(res);
      if (res.verified && res.paid && res.orderId) {
        initMarketingScripts();
        trackConfirmedPurchaseEvent(res.orderId, res.amountBRL ?? CHECKOUT_CONFIG.priceBRL);
      }
    } catch {
      setResult({
        verified: false,
        paid: false,
        status: "error",
        reason: "Não foi possível consultar a confirmação do seu pedido agora. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  }, [checkStatusFn, order, token]);

  useEffect(() => {
    void verifyOrder();
  }, [verifyOrder]);

  return (
    <div className="min-h-screen bg-surface-warm/60 text-foreground">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="font-display text-xl font-bold tracking-tight text-primary">
            {CHECKOUT_CONFIG.brandName}
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cta">
            <ShieldCheck className="h-4 w-4" />
            Verificação segura
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        {loading ? (
          <div className="rounded-3xl border bg-card p-8 text-center shadow-card-soft">
            <Loader2 className="mx-auto h-9 w-9 animate-spin text-primary" />
            <h1 className="mt-4 font-display text-xl font-bold text-foreground">
              Confirmando seu pagamento...
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Estamos validando a aprovação diretamente com a Cakto para liberar seu acesso com
              segurança.
            </p>
          </div>
        ) : result?.verified && result.paid ? (
          <div className="rounded-3xl border-2 border-cta/30 bg-card p-6 shadow-card-soft sm:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cta/15 text-cta">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h1 className="mt-4 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Pagamento confirmado! Bem-vindo ao Pequenos na Fé
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Obrigado pela sua compra{result.customerName ? `, ${result.customerName.split(" ")[0]}` : ""}.
                Seu acesso completo ao aplicativo web e aos 4 bônus digitais foi liberado.
              </p>
            </div>

            <div className="mt-6 rounded-2xl bg-surface-sky/70 p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-muted-foreground">Pedido confirmado</span>
                <span className="font-mono text-xs font-semibold text-foreground">
                  #{result.refId || result.orderId}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-muted-foreground">Valor pago</span>
                <span className="font-display font-bold text-cta">
                  {formatBRL(result.amountBRL ?? CHECKOUT_CONFIG.priceBRL)}
                </span>
              </div>
              {result.customerEmailMasked ? (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-muted-foreground">E-mail de envio</span>
                  <span className="font-medium text-foreground">{result.customerEmailMasked}</span>
                </div>
              ) : null}
            </div>

            {result.appAccessUrl ? (
              <div className="mt-6">
                <a
                  href={result.appAccessUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-shine flex w-full items-center justify-center gap-2 rounded-2xl bg-cta px-6 py-4 font-display text-base font-bold text-cta-foreground shadow-cta transition hover:brightness-105"
                >
                  <span>Acessar o Pequenos na Fé agora</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ) : null}

            <div className="mt-6 space-y-3 rounded-2xl border bg-background p-4 text-sm">
              <h2 className="font-display text-base font-bold text-foreground">
                Como acessar o aplicativo
              </h2>
              <ol className="space-y-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                <li>
                  1. <strong className="text-foreground">Confira seu e-mail:</strong> enviamos o
                  link e as instruções de entrada para o endereço informado na compra (verifique
                  também a aba Promoções ou Spam).
                </li>
                <li>
                  2. <strong className="text-foreground">Abra em qualquer aparelho:</strong> o
                  Pequenos na Fé funciona direto no navegador do celular, tablet ou computador, sem
                  precisar baixar nada.
                </li>
                <li className="flex items-start gap-2 pt-1">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span>
                    Seus <strong>4 bônus inclusos</strong> estão disponíveis junto ao acesso do
                    Plano Principal.
                  </span>
                </li>
              </ol>
            </div>

            <div className="mt-6 flex flex-col items-center gap-2 border-t pt-5 text-center text-xs text-muted-foreground">
              <p className="inline-flex items-center gap-1.5 font-medium text-foreground">
                <Mail className="h-4 w-4 text-primary" />
                Precisa de ajuda? Fale com nosso suporte: {CHECKOUT_CONFIG.supportEmail}
              </p>
              <p>{CHECKOUT_CONFIG.supportHours}</p>
            </div>
          </div>
        ) : result?.verified && !result.paid ? (
          <div className="rounded-3xl border bg-card p-6 text-center shadow-card-soft sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-sky text-primary">
              <Clock className="h-7 w-7" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
              Pagamento ainda aguardando confirmação
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Seu pedido <strong className="text-foreground">#{result.refId || result.orderId}</strong>{" "}
              ainda está com status <strong className="text-foreground">{result.status}</strong>.
              Assim que a Cakto confirmar o pagamento, seu acesso será liberado automaticamente.
            </p>
            <button
              type="button"
              onClick={() => void verifyOrder()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-display text-sm font-semibold text-primary-foreground transition hover:brightness-105"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Verificar confirmação novamente</span>
            </button>
          </div>
        ) : (
          <div className="rounded-3xl border bg-card p-6 text-center shadow-card-soft sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-warm text-gold">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
              Acesso vinculado à confirmação real da compra
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {result?.reason ||
                "Não localizamos uma compra aprovada nesta sessão. A liberação do Pequenos na Fé acontece somente após a confirmação real do pagamento."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/checkout"
                className="rounded-xl bg-cta px-5 py-3 font-display text-sm font-semibold text-cta-foreground transition hover:brightness-105"
              >
                Ir para o checkout
              </Link>
              <Link
                to="/"
                className="rounded-xl border bg-background px-5 py-3 font-display text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                Voltar à página inicial
              </Link>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              Já efetuou o pagamento? Fale com {CHECKOUT_CONFIG.supportEmail}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}