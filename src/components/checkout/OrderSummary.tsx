import { CheckCircle2, Gift, MailCheck, ShieldCheck } from "lucide-react";
import heroNight from "@/assets/hero-night-story.jpg";
import { CHECKOUT_CONFIG, formatBRL, type OrderBumpConfig } from "@/lib/checkout-config";

interface OrderSummaryProps {
  selectedBumps: readonly OrderBumpConfig[];
  totalBRL: number;
  compact?: boolean;
}

export function OrderSummary({ selectedBumps, totalBRL, compact = false }: OrderSummaryProps) {
  return (
    <aside className="overflow-hidden rounded-[1.75rem] bg-card shadow-book ring-2 ring-gold/70">
      <div className="relative bg-night text-night-foreground">
        <img src={heroNight} alt="" width={1024} height={1280} className="absolute inset-0 h-full w-full object-cover object-[60%_30%] opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-night via-night/80 to-night/30" />
        <div className="relative p-5 sm:p-6">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gold">Seu pedido • pagamento único</p>
          <h2 className="mt-1 font-display text-xl font-bold leading-snug">{CHECKOUT_CONFIG.productShortName}</h2>
          <p className="mt-1 text-xs opacity-80">Sem mensalidades • Celular, tablet e computador</p>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <ul className="space-y-2.5 text-sm">
          <li className="flex items-start justify-between gap-3">
            <span className="flex items-start gap-2 font-bold text-foreground">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <span>App completo Pequenos na Fé</span>
            </span>
            <span className="shrink-0 font-bold">{CHECKOUT_CONFIG.priceFormatted}</span>
          </li>
          {!compact ? (
            CHECKOUT_CONFIG.bonusesSummary.map((bonus, i) => (
              <li key={bonus} className="flex items-start justify-between gap-3 text-xs sm:text-sm">
                <span className="flex items-start gap-2 text-muted-foreground">
                  <Gift className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cta" />
                  <span>Bônus {String(i + 1).padStart(2, "0")}: {bonus}</span>
                </span>
                <span className="shrink-0 rounded-full bg-success/12 px-2 py-0.5 text-[11px] font-black text-success">Incluso</span>
              </li>
            ))
          ) : (
            <li className="flex items-start justify-between gap-3 text-xs">
              <span className="flex items-start gap-2 text-muted-foreground">
                <Gift className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cta" />
                <span>4 bônus inclusos</span>
              </span>
              <span className="shrink-0 rounded-full bg-success/12 px-2 py-0.5 text-[11px] font-black text-success">Incluso</span>
            </li>
          )}
          {selectedBumps.map((bump) => (
            <li key={bump.id} className="flex items-start justify-between gap-3">
              <span className="flex items-start gap-2 font-bold">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{bump.name}</span>
              </span>
              <span className="shrink-0 font-bold">{formatBRL(bump.priceBRL)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-end justify-between border-t border-dashed pt-4">
          <div>
            <span className="font-display text-base font-bold">Total hoje</span>
            <p className="text-xs text-muted-foreground">Cobrança única • Sem renovação</p>
          </div>
          <span className="font-display text-4xl font-black tracking-tight text-foreground">{formatBRL(totalBRL)}</span>
        </div>

        {!compact && (
          <div className="mt-4 space-y-2.5 rounded-2xl bg-surface-sky p-3.5 text-xs">
            <div className="flex items-start gap-2.5">
              <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span><strong>Entrega digital:</strong> acesso liberado na confirmação e enviado ao seu e-mail.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <span><strong>Garantia de {CHECKOUT_CONFIG.guaranteeDays} dias:</strong> peça reembolso pelo suporte se decidir não continuar.</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
