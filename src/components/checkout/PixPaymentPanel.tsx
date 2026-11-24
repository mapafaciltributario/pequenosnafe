import { useServerFn } from "@tanstack/react-start";
import { Check, Clock, Copy, Loader2, QrCode, RefreshCw, ShieldCheck } from "lucide-react";
import QRCode from "qrcode";
import { useCallback, useEffect, useState } from "react";
import { checkOrderStatus } from "@/lib/checkout.functions";
import { formatBRL } from "@/lib/checkout-config";

interface PixPaymentPanelProps {
  orderId: string;
  refId?: string | undefined;
  accessToken: string;
  qrCode: string;
  expirationDate?: string | undefined;
  amountBRL: number;
  onConfirmed: () => void;
}

export function PixPaymentPanel({
  orderId,
  refId,
  accessToken,
  qrCode,
  expirationDate,
  amountBRL,
  onConfirmed,
}: PixPaymentPanelProps) {
  const checkStatusFn = useServerFn(checkOrderStatus);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [statusLabel, setStatusLabel] = useState("Aguardando confirmação do pagamento Pix...");
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(qrCode, {
      width: 240,
      margin: 2,
      color: { dark: "#172542", light: "#FFFFFF" },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [qrCode]);

  useEffect(() => {
    if (!expirationDate) return;
    const targetMs = Date.parse(expirationDate);
    if (Number.isNaN(targetMs)) return;

    const update = () => {
      const diff = Math.max(0, Math.floor((targetMs - Date.now()) / 1000));
      setSecondsLeft(diff);
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [expirationDate]);

  const pollStatus = useCallback(async () => {
    setChecking(true);
    try {
      const res = await checkStatusFn({ data: { orderId, accessToken } });
      if (res.verified && res.paid) {
        setStatusLabel("Pagamento confirmado! Redirecionando...");
        onConfirmed();
        return;
      }
      if (res.status === "canceled" || res.status === "refused") {
        setStatusLabel("Esta cobrança Pix foi cancelada ou expirou.");
      }
    } catch {
      // erro transitório de rede: o próximo ciclo tenta novamente
    } finally {
      setChecking(false);
    }
  }, [accessToken, checkStatusFn, onConfirmed, orderId]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void pollStatus();
    }, 4500);
    return () => window.clearInterval(interval);
  }, [pollStatus]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
    }
  };

  const formattedCountdown =
    secondsLeft !== null
      ? `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`
      : null;

  return (
    <div className="rounded-3xl border-2 border-cta/30 bg-card p-6 shadow-card-soft sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cta/15 text-cta">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">
              Pague com Pix para liberar agora
            </h2>
            <p className="text-xs text-muted-foreground">
              Valor: <strong className="text-foreground">{formatBRL(amountBRL)}</strong>
              {refId ? ` • Pedido #${refId}` : ""}
            </p>
          </div>
        </div>
        {formattedCountdown ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-warm px-3 py-1 text-xs font-semibold text-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" />
            Expira em {formattedCountdown}
          </span>
        ) : null}
      </div>

      <div className="mt-6 grid items-center gap-6 sm:grid-cols-12">
        <div className="flex flex-col items-center sm:col-span-5">
          <div className="flex h-56 w-56 items-center justify-center rounded-2xl border bg-background p-3 shadow-xs">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code Pix para pagamento do Pequenos na Fé"
                width={220}
                height={220}
                className="h-full w-full object-contain"
              />
            ) : (
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            )}
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Aponte a câmera do app do seu banco
          </p>
        </div>

        <div className="space-y-4 sm:col-span-7">
          <div>
            <label
              htmlFor="pix-copy-paste"
              className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Ou copie o código Pix Copia e Cola
            </label>
            <div className="mt-2 flex flex-col gap-2">
              <input
                id="pix-copy-paste"
                type="text"
                readOnly
                value={qrCode}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full rounded-xl border bg-muted/40 px-3.5 py-2.5 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cta px-4 py-3 font-display text-sm font-semibold text-cta-foreground transition hover:brightness-105 active:scale-[0.99]"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Código Pix copiado!" : "Copiar código Pix"}</span>
              </button>
            </div>
          </div>

          <ol className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
            <li>1. Abra o aplicativo do seu banco e escolha <strong>Pix → Pagar</strong>.</li>
            <li>2. Escaneie o QR Code ao lado ou cole o código copiado acima.</li>
            <li>3. Confirme o pagamento. Assim que aprovado, esta página redireciona sozinha.</li>
          </ol>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-sky px-4 py-3 text-xs font-medium text-foreground">
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          {statusLabel}
        </span>
        <button
          type="button"
          disabled={checking}
          onClick={() => void pollStatus()}
          className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-muted disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${checking ? "animate-spin" : ""}`} />
          <span>Já paguei, verificar agora</span>
        </button>
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-cta" />
        Confirmação verificada em tempo real diretamente com a Cakto.
      </p>
    </div>
  );
}