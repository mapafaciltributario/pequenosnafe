import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { buildCheckoutUrl, trackInitiateCheckout } from "@/lib/checkout-config";

interface CheckoutButtonProps {
  label?: string;
  sublabel?: string;
  placement: string;
  fullWidth?: boolean;
  variant?: "cta" | "primary";
  highlight?: boolean;
}

export function CheckoutButton({
  label = "Quero garantir por R$ 9,90",
  sublabel,
  placement,
  fullWidth = false,
  variant = "cta",
  highlight = false,
}: CheckoutButtonProps) {
  const [href, setHref] = useState<string>("#oferta");

  useEffect(() => {
    setHref(buildCheckoutUrl(window.location.search, placement));
  }, [placement]);

  const colorClasses =
    variant === "cta"
      ? `bg-cta text-cta-foreground hover:brightness-105 ${highlight ? "animate-cta-glow" : "shadow-cta"}`
      : "bg-primary text-primary-foreground shadow-card-soft hover:brightness-105";

  return (
    <div className={fullWidth ? "w-full" : "inline-flex flex-col items-center sm:items-start"}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackInitiateCheckout(placement)}
        className={`cta-shine group inline-flex items-center justify-center gap-2.5 rounded-2xl px-7 py-4 text-center font-display text-lg font-semibold tracking-tight transition-all duration-200 active:scale-[0.98] ${colorClasses} ${fullWidth ? "w-full" : "w-full sm:w-auto"}`}
      >
        <span>{label}</span>
        <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
      </a>
      {sublabel ? (
        <p className="mt-2 text-center text-xs font-medium text-muted-foreground sm:text-left">
          {sublabel}
        </p>
      ) : null}
    </div>
  );
}