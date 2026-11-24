import { Star } from "lucide-react";

interface StarRatingProps {
  /** Valor entre 0 e 5, aceita decimais (ex.: 4.9) */
  value: number;
  size?: number;
  className?: string;
}

/** Cinco estrelas com preenchimento proporcional (inclusive parcial na última). */
export function StarRating({ value, size = 22, className = "" }: StarRatingProps) {
  const clamped = Math.max(0, Math.min(5, value));
  return (
    <div
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${clamped.toFixed(1).replace(".", ",")} de 5 estrelas`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, clamped - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star className="absolute inset-0 text-gold/30" style={{ width: size, height: size }} fill="currentColor" strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="text-gold" style={{ width: size, height: size }} fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </div>
  );
}

export function starFillFractions(value: number): number[] {
  const v = Math.max(0, Math.min(5, value));
  return Array.from({ length: 5 }, (_, i) => Math.round(Math.max(0, Math.min(1, v - i)) * 100) / 100);
}
