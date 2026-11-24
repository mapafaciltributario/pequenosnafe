import { ArrowRight, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { buildCheckoutUrl, trackInitiateCheckout } from "@/lib/checkout-config";
import { captureAndGetAttribution } from "@/lib/tracking";

interface CheckoutButtonProps {
  label?: string;
  sublabel?: string;
  placement: string;
  fullWidth?: boolean;
  variant?: "cta" | "primary" | "gold";
  highlight?: boolean;
  size?: "md" | "lg";
}

/** Todos os CTAs de compra levam ao /checkout próprio preservando UTM/fbclid. */
export function CheckoutButton({
  label = "Quero acesso completo por R$ 9,90",
  sublabel,
  placement,
  fullWidth = false,
  variant = "cta",
  highlight = false,
  size = "lg",
}: CheckoutButtonProps) {
  const [href, setHref] = useState<string>("/checkout");

  useEffect(() => {
    captureAndGetAttribution();
    setHref(buildCheckoutUrl(window.location.search, placement));
  }, [placement]);

  const colorClasses =
    variant === "cta"
      ? `bg-gradient-cta text-cta-foreground ${highlight ? "animate-cta-glow" : "shadow-cta"}`
      : variant === "gold"
        ? "bg-gradient-gold text-accent-foreground shadow-glow"
        : "bg-primary text-primary-foreground shadow-card-soft";

  const sizeClasses = size === "lg" ? "min-h-[60px] px-7 py-4 text-lg" : "min-h-[48px] px-5 py-3 text-base";

  return (
    <div className={fullWidth ? "w-full" : "inline-flex w-full flex-col sm:w-auto"}>
      <a
        href={href}
        onClick={() => trackInitiateCheckout(placement)}
        className={`cta-shine group inline-flex items-center justify-center gap-2.5 rounded-full text-center font-sans font-black tracking-tight transition-all duration-200 hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/60 active:scale-[0.97] ${sizeClasses} ${colorClasses} w-full`}
      >
        <span className="leading-tight">{label}</span>
        <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
      </a>
      {sublabel ? (
        <p className="mt-2.5 inline-flex items-center justify-center gap-1.5 text-center text-xs font-semibold opacity-80">
          <Lock className="h-3 w-3" />
          {sublabel}
        </p>
      ) : null}
    </div>
  );
}
