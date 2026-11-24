import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Loader2,
  Lock,
  Mail,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  CheckoutLegalModal,
  type LegalDocType,
} from "@/components/checkout/CheckoutLegalModal";
import {
  CreditCardFields,
  type CardFormState,
} from "@/components/checkout/CreditCardFields";
import { OrderBumpSection } from "@/components/checkout/OrderBumpSection";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { PixPaymentPanel } from "@/components/checkout/PixPaymentPanel";
import {
  getCaktoSdk,
  getOrCreateSessionFingerprint,
  startCaktoAntifraud,
} from "@/lib/cakto-sdk";
import {
  createCheckoutPayment,
  getCheckoutPublicConfig,
  relayBrowserEventToCapi,
} from "@/lib/checkout.functions";
import {
  calculateCheckoutTotal,
  CHECKOUT_CONFIG,
  formatBRL,
  getActiveOrderBumps,
} from "@/lib/checkout-config";
import {
  buyerSchema,
  formatCpf,
  formatPhoneBR,
  isValidCardLuhn,
  onlyDigits,
  parseAndValidateCardExpiry,
  type BuyerFormData,
} from "@/lib/checkout-validation";
import {
  captureAndGetAttribution,
  initMarketingScripts,
  trackAddPaymentInfoEvent,
  trackInitiateCheckoutEvent,
  trackPageView,
} from "@/lib/tracking";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Finalizar Compra Segura — Pequenos na Fé" },
      {
        name: "description",
        content:
          "Conclua sua inscrição no Pequenos na Fé com pagamento único de R$ 9,90 via Pix ou Cartão de Crédito. Ambiente protegido pela Cakto.",
      },
      { property: "og:title", content: "Finalizar Compra Segura — Pequenos na Fé" },
      {
        property: "og:description",
        content: "Acesso digital ao Pequenos na Fé + 4 bônus por pagamento único de R$ 9,90.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CheckoutPage,
});

interface PixSessionState {
  orderId: string;
  refId?: string | undefined;
  accessToken: string;
  qrCode: string;
  expirationDate?: string | undefined;
  amountBRL: number;
}

function CheckoutPage() {
  const navigate = useNavigate();
  const getConfigFn = useServerFn(getCheckoutPublicConfig);
  const createPaymentFn = useServerFn(createCheckoutPayment);
  const relayCapiFn = useServerFn(relayBrowserEventToCapi);

  const activeBumps = useMemo(() => getActiveOrderBumps(), []);
  const [selectedBumpIds, setSelectedBumpIds] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit_card">("pix");
  const [buyer, setBuyer] = useState<BuyerFormData>({
    name: "",
    email: "",
    cpf: "",
    phone: "",
  });
  const [card, setCard] = useState<CardFormState>({
    number: "",
    holderName: "",
    expiry: "",
    cvv: "",
    installments: 1,
  });
  const [buyerErrors, setBuyerErrors] = useState<Partial<Record<keyof BuyerFormData, string>>>({});
  const [cardErrors, setCardErrors] = useState<Partial<Record<keyof CardFormState, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pixSession, setPixSession] = useState<PixSessionState | null>(null);
  const [legalDoc, setLegalDoc] = useState<LegalDocType>(null);

  const [sdkClientId, setSdkClientId] = useState<string>(
    (import.meta.env["VITE_CAKTO_SDK_CLIENT_ID"] as string | undefined)?.trim() ?? "",
  );
  const [enable3ds, setEnable3ds] = useState(false);
  const [caktoReady, setCaktoReady] = useState<boolean | null>(null);

  const submitLockRef = useRef(false);
  const idempotencyKeyRef = useRef<string>("");
  const trackedCheckoutRef = useRef(false);

  const totalBRL = useMemo(() => calculateCheckoutTotal(selectedBumpIds), [selectedBumpIds]);
  const selectedBumps = useMemo(
    () => activeBumps.filter((b) => selectedBumpIds.includes(b.id)),
    [activeBumps, selectedBumpIds],
  );

  useEffect(() => {
    initMarketingScripts();
    const tracking = captureAndGetAttribution();
    if (!trackedCheckoutRef.current) {
      trackedCheckoutRef.current = true;
      trackPageView();
      const icEventId = trackInitiateCheckoutEvent(CHECKOUT_CONFIG.priceBRL, tracking.src);
      void relayCapiFn({
        data: {
          eventName: "InitiateCheckout",
          eventId: icEventId,
          amountBRL: CHECKOUT_CONFIG.priceBRL,
          eventSourceUrl: window.location.href,
          ...(tracking.fbp ? { fbp: tracking.fbp } : {}),
          ...(tracking.fbc ? { fbc: tracking.fbc } : {}),
        },
      }).catch(() => undefined);
    }

    void getConfigFn()
      .then((cfg) => {
        setCaktoReady(cfg.caktoReady);
        setEnable3ds(cfg.cakto3dsEnabled);
        const effectiveSdkId = cfg.caktoSdkClientId || sdkClientId;
        if (effectiveSdkId) {
          setSdkClientId(effectiveSdkId);
          void startCaktoAntifraud(effectiveSdkId);
        }
      })
      .catch(() => setCaktoReady(null));
  }, [getConfigFn, relayCapiFn, sdkClientId]);

  const resetIdempotency = () => {
    idempotencyKeyRef.current = "";
  };

  const toggleBump = (bumpId: string) => {
    resetIdempotency();
    setSelectedBumpIds((prev) =>
      prev.includes(bumpId) ? prev.filter((id) => id !== bumpId) : [...prev, bumpId],
    );
  };

  const validateCardFields = (): { month: string; year: string } | null => {
    const errs: Partial<Record<keyof CardFormState, string>> = {};
    if (!isValidCardLuhn(card.number)) {
      errs.number = "Número de cartão inválido. Confira os dígitos.";
    }
    if (card.holderName.trim().length < 3) {
      errs.holderName = "Informe o nome exatamente como aparece no cartão.";
    }
    const expiryParsed = parseAndValidateCardExpiry(card.expiry);
    if (!expiryParsed) {
      errs.expiry = "Validade inválida ou cartão vencido.";
    }
    const cvvDigits = onlyDigits(card.cvv);
    if (cvvDigits.length < 3 || cvvDigits.length > 4) {
      errs.cvv = "Informe 3 ou 4 dígitos do CVV.";
    }
    setCardErrors(errs);
    return Object.keys(errs).length === 0 ? expiryParsed : null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitLockRef.current || isSubmitting) return;

    setSubmitError(null);
    const parsedBuyer = buyerSchema.safeParse(buyer);
    if (!parsedBuyer.success) {
      const fieldErrs: Partial<Record<keyof BuyerFormData, string>> = {};
      for (const issue of parsedBuyer.error.issues) {
        const key = issue.path[0] as keyof BuyerFormData | undefined;
        if (key && !fieldErrs[key]) fieldErrs[key] = issue.message;
      }
      setBuyerErrors(fieldErrs);
      return;
    }
    setBuyerErrors({});

    let parsedExpiry: { month: string; year: string } | null = null;
    if (paymentMethod === "credit_card") {
      parsedExpiry = validateCardFields();
      if (!parsedExpiry) return;
    } else {
      setCardErrors({});
    }

    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      const tracking = captureAndGetAttribution();
      const addPaymentEventId = trackAddPaymentInfoEvent(paymentMethod, totalBRL);
      void relayCapiFn({
        data: {
          eventName: "AddPaymentInfo",
          eventId: addPaymentEventId,
          amountBRL: totalBRL,
          eventSourceUrl: window.location.href,
          email: parsedBuyer.data.email,
          phone: onlyDigits(parsedBuyer.data.phone),
          ...(tracking.fbp ? { fbp: tracking.fbp } : {}),
          ...(tracking.fbc ? { fbc: tracking.fbc } : {}),
        },
      }).catch(() => undefined);

      if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current =
          typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `pnf_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      }

      const fingerprint = getOrCreateSessionFingerprint();

      if (paymentMethod === "pix") {
        const res = await createPaymentFn({
          data: {
            paymentMethod: "pix",
            idempotencyKey: idempotencyKeyRef.current,
            fingerprint,
            buyer: parsedBuyer.data,
            selectedBumpIds,
            tracking,
            installments: 1,
          },
        });

        if (!res.ok || !res.orderId || !res.accessToken || !res.pix?.qrCode) {
          resetIdempotency();
          setSubmitError(
            res.message ?? "Não foi possível gerar o Pix agora. Tente novamente em instantes.",
          );
          return;
        }

        setPixSession({
          orderId: res.orderId,
          refId: res.refId,
          accessToken: res.accessToken,
          qrCode: res.pix.qrCode,
          expirationDate: res.pix.expirationDate,
          amountBRL: res.amountBRL ?? totalBRL,
        });
        return;
      }

      // Fluxo oficial de Cartão de Crédito via SDK Cakto (tokenização + antifraude + 3DS opcional)
      if (!sdkClientId) {
        resetIdempotency();
        setSubmitError(
          "Pagamento por cartão aguardando configuração da chave pública do SDK da Cakto (VITE_CAKTO_SDK_CLIENT_ID).",
        );
        return;
      }

      const sdk = await getCaktoSdk(sdkClientId);
      const cardInput = {
        holderName: card.holderName.trim(),
        cardNumber: onlyDigits(card.number),
        cvv: onlyDigits(card.cvv),
        expMonth: parsedExpiry!.month,
        expYear: parsedExpiry!.year,
      };

      const { cardToken } = await sdk.createToken(cardInput);
      let threeDSecurePayload:
        | {
            cavv?: string;
            eci?: string;
            xid?: string;
            referenceId?: string;
            version?: string;
          }
        | undefined;

      if (enable3ds) {
        const authResult = await sdk.authenticate3DS({
          card: cardInput,
          customer: {
            amount: Math.round(totalBRL * 100),
            currency: "BRL",
            email: parsedBuyer.data.email,
            name: parsedBuyer.data.name,
            phone: onlyDigits(parsedBuyer.data.phone),
            paymentMethod: "credit",
          },
        });
        if (!authResult.success) {
          resetIdempotency();
          setSubmitError(
            authResult.error ||
              "Autenticação 3D Secure não concluída pelo banco emissor. Tente novamente ou pague com Pix.",
          );
          return;
        }
        threeDSecurePayload = {
          ...(authResult.cavv ? { cavv: authResult.cavv } : {}),
          ...(authResult.eci ? { eci: authResult.eci } : {}),
          ...(authResult.xid ? { xid: authResult.xid } : {}),
          ...(authResult.referenceId ? { referenceId: authResult.referenceId } : {}),
          ...(authResult.version ? { version: authResult.version } : {}),
        };
      }

      await sdk.completeAntifraudProfile();
      const antifraudReference = sdk.getAntifraudReference();

      const res = await createPaymentFn({
        data: {
          paymentMethod: enable3ds ? "threeDs" : "credit_card",
          idempotencyKey: idempotencyKeyRef.current,
          fingerprint,
          buyer: parsedBuyer.data,
          selectedBumpIds,
          tracking,
          cardToken,
          installments: card.installments,
          antifraudReference,
          ...(threeDSecurePayload ? { threeDSecure: threeDSecurePayload } : {}),
        },
      });

      if (!res.ok || !res.orderId || !res.accessToken) {
        resetIdempotency();
        setSubmitError(
          res.message ?? "Não foi possível aprovar o cartão. Tente novamente ou pague com Pix.",
        );
        return;
      }

      // Limpa dados sensíveis do estado do navegador imediatamente após uso
      setCard({ number: "", holderName: "", expiry: "", cvv: "", installments: 1 });

      await navigate({
        to: "/obrigado",
        search: { order: res.orderId, token: res.accessToken },
      });
    } catch (err) {
      resetIdempotency();
      const msg =
        err instanceof Error && err.message
          ? err.message
          : "Falha de conexão ao processar seu pagamento. Verifique sua internet e tente novamente.";
      setSubmitError(msg);
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="paper min-h-screen text-foreground">
      <header className="sticky top-0 z-30 bg-night text-night-foreground shadow-book">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-display text-lg font-black tracking-tight text-night-foreground sm:text-xl"
          >
            <ArrowLeft className="h-4 w-4 text-gold" />
            <span>{CHECKOUT_CONFIG.brandName}</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-xs font-bold text-gold ring-1 ring-gold/40">
            <Lock className="h-3.5 w-3.5" />
            <span>Ambiente 100% seguro</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        {caktoReady === false ? (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-gold/60 bg-card p-4 text-xs text-muted-foreground shadow-xs">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <p>
              <strong className="text-foreground">Modo de preparação:</strong> o checkout está pronto
              para operar, mas as chaves da Cakto (<code className="font-mono">CAKTO_API_CLIENT_ID</code>,{" "}
              <code className="font-mono">CAKTO_API_CLIENT_SECRET</code> e{" "}
              <code className="font-mono">CAKTO_OFFER_ID</code>) ainda não foram configuradas no
              servidor.
            </p>
          </div>
        ) : null}

        {pixSession ? (
          <div className="mx-auto max-w-2xl">
            <PixPaymentPanel
              orderId={pixSession.orderId}
              refId={pixSession.refId}
              accessToken={pixSession.accessToken}
              qrCode={pixSession.qrCode}
              expirationDate={pixSession.expirationDate}
              amountBRL={pixSession.amountBRL}
              onConfirmed={() => {
                void navigate({
                  to: "/obrigado",
                  search: { order: pixSession.orderId, token: pixSession.accessToken },
                });
              }}
            />
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="lg:hidden">
              <OrderSummary selectedBumps={selectedBumps} totalBRL={totalBRL} compact />
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} noValidate className="space-y-6 lg:col-span-7">
              {/* 1. IDENTIFICAÇÃO DO COMPRADOR */}
              <section className="rounded-[1.75rem] border bg-card p-5 shadow-book sm:p-7">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-night font-display text-sm font-black text-gold">
                    1
                  </span>
                  <div>
                    <h1 className="font-display text-lg font-bold text-foreground sm:text-xl">
                      Seus dados de acesso
                    </h1>
                    <p className="text-xs text-muted-foreground">
                      Preencha os dados do responsável para receber o acesso por e-mail.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="buyer-name" className="text-xs font-semibold text-foreground">
                      Nome completo
                    </label>
                    <input
                      id="buyer-name"
                      type="text"
                      autoComplete="name"
                      placeholder="Seu nome e sobrenome"
                      disabled={isSubmitting}
                      value={buyer.name}
                      onChange={(e) => {
                        resetIdempotency();
                        setBuyer({ ...buyer, name: e.target.value });
                      }}
                      className="mt-1.5 w-full rounded-xl border bg-background px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {buyerErrors.name ? (
                      <p className="mt-1 text-xs text-destructive">{buyerErrors.name}</p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="buyer-email" className="text-xs font-semibold text-foreground">
                      E-mail principal
                    </label>
                    <input
                      id="buyer-email"
                      type="email"
                      autoComplete="email"
                      placeholder="voce@exemplo.com.br"
                      disabled={isSubmitting}
                      value={buyer.email}
                      onChange={(e) => {
                        resetIdempotency();
                        setBuyer({ ...buyer, email: e.target.value });
                      }}
                      className="mt-1.5 w-full rounded-xl border bg-background px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {buyerErrors.email ? (
                      <p className="mt-1 text-xs text-destructive">{buyerErrors.email}</p>
                    ) : null}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="buyer-cpf" className="text-xs font-semibold text-foreground">
                        CPF
                      </label>
                      <input
                        id="buyer-cpf"
                        type="text"
                        inputMode="numeric"
                        placeholder="000.000.000-00"
                        disabled={isSubmitting}
                        value={buyer.cpf}
                        onChange={(e) => {
                          resetIdempotency();
                          setBuyer({ ...buyer, cpf: formatCpf(e.target.value) });
                        }}
                        className="mt-1.5 w-full rounded-xl border bg-background px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      {buyerErrors.cpf ? (
                        <p className="mt-1 text-xs text-destructive">{buyerErrors.cpf}</p>
                      ) : null}
                    </div>

                    <div>
                      <label htmlFor="buyer-phone" className="text-xs font-semibold text-foreground">
                        Telefone / WhatsApp com DDD
                      </label>
                      <input
                        id="buyer-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel-national"
                        placeholder="(11) 99999-9999"
                        disabled={isSubmitting}
                        value={buyer.phone}
                        onChange={(e) => {
                          resetIdempotency();
                          setBuyer({ ...buyer, phone: formatPhoneBR(e.target.value) });
                        }}
                        className="mt-1.5 w-full rounded-xl border bg-background px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      {buyerErrors.phone ? (
                        <p className="mt-1 text-xs text-destructive">{buyerErrors.phone}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. FORMA DE PAGAMENTO */}
              <section className="rounded-[1.75rem] border bg-card p-5 shadow-book sm:p-7">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-night font-display text-sm font-black text-gold">
                    2
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-bold text-foreground sm:text-xl">
                      Escolha como pagar
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Pagamento único de {formatBRL(totalBRL)} processado pela Cakto.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Forma de pagamento">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={paymentMethod === "pix"}
                    disabled={isSubmitting}
                    onClick={() => {
                      resetIdempotency();
                      setPaymentMethod("pix");
                      setSubmitError(null);
                    }}
                    className={`flex flex-col items-start gap-1 rounded-2xl border-2 p-3.5 text-left transition-all ${
                      paymentMethod === "pix"
                        ? "border-cta bg-cta/6 shadow-xs"
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <QrCode className={`h-5 w-5 ${paymentMethod === "pix" ? "text-cta" : "text-muted-foreground"}`} />
                      <span className="rounded-full bg-cta/15 px-2 py-0.5 text-[10px] font-bold text-cta">
                        Instantâneo
                      </span>
                    </div>
                    <span className="mt-1 font-display text-sm font-bold text-foreground">Pix</span>
                    <span className="text-[11px] text-muted-foreground">Aprovação na hora</span>
                  </button>

                  <button
                    type="button"
                    role="radio"
                    aria-checked={paymentMethod === "credit_card"}
                    disabled={isSubmitting}
                    onClick={() => {
                      resetIdempotency();
                      setPaymentMethod("credit_card");
                      setSubmitError(null);
                    }}
                    className={`flex flex-col items-start gap-1 rounded-2xl border-2 p-3.5 text-left transition-all ${
                      paymentMethod === "credit_card"
                        ? "border-primary bg-surface-sky/70 shadow-xs"
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <CreditCard
                      className={`h-5 w-5 ${paymentMethod === "credit_card" ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <span className="mt-1 font-display text-sm font-bold text-foreground">
                      Cartão de crédito
                    </span>
                    <span className="text-[11px] text-muted-foreground">Liberação imediata</span>
                  </button>
                </div>

                <div className="mt-4">
                  {paymentMethod === "pix" ? (
                    <div className="rounded-2xl border bg-surface-sky/50 p-4 text-xs leading-relaxed text-muted-foreground">
                      <p className="font-semibold text-foreground">Como funciona o Pix:</p>
                      <p className="mt-1">
                        Ao clicar no botão abaixo, geramos seu QR Code e código Copia e Cola oficial
                        da Cakto. Assim que o banco confirmar o pagamento, liberamos seu acesso
                        automaticamente.
                      </p>
                    </div>
                  ) : (
                    <CreditCardFields
                      value={card}
                      onChange={(next) => {
                        resetIdempotency();
                        setCard(next);
                      }}
                      errors={cardErrors}
                      totalBRL={totalBRL}
                      sdkConfigured={Boolean(sdkClientId)}
                      disabled={isSubmitting}
                    />
                  )}
                </div>

                {/* ESPAÇO MODULAR PARA ORDER BUMPS (oculto quando vazio) */}
                <div className="mt-5">
                  <OrderBumpSection
                    bumps={activeBumps}
                    selectedIds={selectedBumpIds}
                    onToggle={toggleBump}
                    disabled={isSubmitting}
                  />
                </div>

                {submitError ? (
                  <div
                    role="alert"
                    className="mt-4 flex items-start gap-2.5 rounded-2xl border border-destructive/30 bg-destructive/8 p-3.5 text-xs font-medium text-destructive"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="cta-shine animate-cta-glow mt-5 flex min-h-[60px] w-full items-center justify-center gap-2.5 rounded-full bg-gradient-cta px-6 py-4 font-sans text-base font-black text-cta-foreground transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-65 sm:text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>
                        {paymentMethod === "pix"
                          ? "Gerando QR Code Pix..."
                          : "Processando pagamento seguro..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>
                        {paymentMethod === "pix"
                          ? `Gerar Pix de ${formatBRL(totalBRL)}`
                          : `Pagar ${formatBRL(totalBRL)} com segurança`}
                      </span>
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-[11px] text-muted-foreground">
                  Pagamento único de {formatBRL(totalBRL)} • Sem mensalidades • Garantia incondicional
                  de {CHECKOUT_CONFIG.guaranteeDays} dias
                </p>
              </section>
            </form>

            <div className="hidden lg:sticky lg:top-24 lg:col-span-5 lg:block">
              <OrderSummary selectedBumps={selectedBumps} totalBRL={totalBRL} />
            </div>
          </div>
        )}
      </main>

      <footer className="mt-10 bg-night py-7 text-night-foreground/70">
        <div className="mx-auto max-w-5xl px-4 text-center text-xs sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-medium text-night-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-gold" />
              Processado pela Cakto
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-primary" />
              Suporte: {CHECKOUT_CONFIG.supportEmail}
            </span>
          </div>
          <p className="mt-2">{CHECKOUT_CONFIG.supportHours}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setLegalDoc("privacy")}
              className="underline underline-offset-4 transition hover:text-primary"
            >
              Política de Privacidade
            </button>
            <button
              type="button"
              onClick={() => setLegalDoc("terms")}
              className="underline underline-offset-4 transition hover:text-primary"
            >
              Termos de Compra e Garantia
            </button>
          </div>
        </div>
      </footer>

      <CheckoutLegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />
    </div>
  );
}