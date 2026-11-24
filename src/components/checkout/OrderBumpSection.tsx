import { Check } from "lucide-react";
import { formatBRL, type OrderBumpConfig } from "@/lib/checkout-config";

interface OrderBumpSectionProps {
  bumps: readonly OrderBumpConfig[];
  selectedIds: readonly string[];
  onToggle: (bumpId: string) => void;
  disabled?: boolean;
}

/**
 * Espaço modular para ofertas complementares (Order Bumps).
 * Permanece oculto automaticamente enquanto nenhum order bump estiver configurado em ORDER_BUMPS.
 */
export function OrderBumpSection({
  bumps,
  selectedIds,
  onToggle,
  disabled = false,
}: OrderBumpSectionProps) {
  if (bumps.length === 0) return null;

  return (
    <section aria-label="Ofertas complementares" className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
        Complemente seu pedido (opcional)
      </p>
      {bumps.map((bump) => {
        const checked = selectedIds.includes(bump.id);
        return (
          <label
            key={bump.id}
            className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border-2 p-4 transition-all ${
              checked
                ? "border-cta bg-cta/5 shadow-sm"
                : "border-dashed border-gold/70 bg-surface-warm/70 hover:border-primary/40"
            } ${disabled ? "pointer-events-none opacity-60" : ""}`}
          >
            <input
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={() => onToggle(bump.id)}
              className="sr-only"
            />
            <span
              aria-hidden="true"
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                checked
                  ? "border-cta bg-cta text-cta-foreground"
                  : "border-muted-foreground/40 bg-card"
              }`}
            >
              {checked ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : null}
            </span>
            <img
              src={bump.imageUrl}
              alt={bump.imageAlt}
              className="h-14 w-14 shrink-0 rounded-xl border object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-display text-sm font-bold text-foreground">{bump.name}</span>
                <span className="text-sm font-bold text-cta">+{formatBRL(bump.priceBRL)}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {bump.description}
              </p>
            </div>
          </label>
        );
      })}
    </section>
  );
}