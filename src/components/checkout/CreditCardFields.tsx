import { CreditCard, Lock } from "lucide-react";
import { CHECKOUT_CONFIG, formatBRL } from "@/lib/checkout-config";
import {
  detectCardBrand,
  formatCardExpiry,
  formatCardNumber,
  onlyDigits,
} from "@/lib/checkout-validation";

export interface CardFormState {
  number: string;
  holderName: string;
  expiry: string;
  cvv: string;
  installments: number;
}

interface CreditCardFieldsProps {
  value: CardFormState;
  onChange: (next: CardFormState) => void;
  errors: Partial<Record<keyof CardFormState, string>>;
  totalBRL: number;
  sdkConfigured: boolean;
  disabled?: boolean;
}

export function CreditCardFields({
  value,
  onChange,
  errors,
  totalBRL,
  sdkConfigured,
  disabled = false,
}: CreditCardFieldsProps) {
  const brand = detectCardBrand(value.number);

  return (
    <div className="space-y-4 rounded-2xl border bg-surface-warm/45 p-4 sm:p-5">
      {!sdkConfigured ? (
        <div className="rounded-xl border border-gold/50 bg-card px-3.5 py-2.5 text-xs text-muted-foreground">
          <strong className="text-foreground">Atenção:</strong> para processar cartões em produção,
          configure <code className="font-mono">VITE_CAKTO_SDK_CLIENT_ID</code> (tokenização oficial
          Cakto).
        </div>
      ) : null}

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="card-number" className="text-xs font-semibold text-foreground">
            Número do cartão
          </label>
          {brand ? (
            <span className="rounded-md bg-surface-sky px-2 py-0.5 text-[11px] font-bold text-primary">
              {brand}
            </span>
          ) : null}
        </div>
        <div className="relative mt-1.5">
          <CreditCard className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="card-number"
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="0000 0000 0000 0000"
            disabled={disabled}
            value={value.number}
            onChange={(e) => onChange({ ...value, number: formatCardNumber(e.target.value) })}
            className="w-full rounded-xl border bg-card py-3 pl-10 pr-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        {errors.number ? <p className="mt-1 text-xs text-destructive">{errors.number}</p> : null}
      </div>

      <div>
        <label htmlFor="card-holder" className="text-xs font-semibold text-foreground">
          Nome impresso no cartão
        </label>
        <input
          id="card-holder"
          type="text"
          autoComplete="cc-name"
          placeholder="Como aparece no cartão"
          disabled={disabled}
          value={value.holderName}
          onChange={(e) => onChange({ ...value, holderName: e.target.value.toUpperCase() })}
          className="mt-1.5 w-full rounded-xl border bg-card px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {errors.holderName ? (
          <p className="mt-1 text-xs text-destructive">{errors.holderName}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="card-expiry" className="text-xs font-semibold text-foreground">
            Validade (MM/AA)
          </label>
          <input
            id="card-expiry"
            type="text"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/AA"
            disabled={disabled}
            value={value.expiry}
            onChange={(e) => onChange({ ...value, expiry: formatCardExpiry(e.target.value) })}
            className="mt-1.5 w-full rounded-xl border bg-card px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {errors.expiry ? <p className="mt-1 text-xs text-destructive">{errors.expiry}</p> : null}
        </div>

        <div>
          <label htmlFor="card-cvv" className="text-xs font-semibold text-foreground">
            Código de segurança (CVV)
          </label>
          <input
            id="card-cvv"
            type="password"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="3 ou 4 dígitos"
            maxLength={4}
            disabled={disabled}
            value={value.cvv}
            onChange={(e) =>
              onChange({ ...value, cvv: onlyDigits(e.target.value).slice(0, 4) })
            }
            className="mt-1.5 w-full rounded-xl border bg-card px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {errors.cvv ? <p className="mt-1 text-xs text-destructive">{errors.cvv}</p> : null}
        </div>
      </div>

      <div>
        <label htmlFor="card-installments" className="text-xs font-semibold text-foreground">
          Parcelamento
        </label>
        <select
          id="card-installments"
          disabled={disabled}
          value={value.installments}
          onChange={(e) => onChange({ ...value, installments: Number(e.target.value) || 1 })}
          className="mt-1.5 w-full rounded-xl border bg-card px-3.5 py-3 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {Array.from({ length: Math.max(1, CHECKOUT_CONFIG.maxInstallments) }, (_, idx) => {
            const n = idx + 1;
            return (
              <option key={n} value={n}>
                {n}x de {formatBRL(totalBRL / n)} {n === 1 ? "à vista (sem juros)" : ""}
              </option>
            );
          })}
        </select>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="h-3.5 w-3.5 shrink-0 text-cta" />
        Dados criptografados e tokenizados diretamente pelo SDK oficial da Cakto.
      </p>
    </div>
  );
}