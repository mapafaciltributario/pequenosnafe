import { Quote } from "lucide-react";
import { StarRating } from "./StarRating";

export interface Testimonial {
  name: string;
  role: string;
  highlight: string;
  text: string;
  rating: number;
  topic: string;
}

/**
 * Depoimentos REAIS e autorizados entram aqui. Enquanto estiver vazio, a seção
 * não aparece no site publicado (só no ambiente de desenvolvimento, com os
 * exemplos demonstrativos abaixo, marcados como tal).
 */
export const REAL_TESTIMONIALS: Testimonial[] = [];
/** Nota média real (ex.: 4.9). Deixe null até existirem avaliações verificadas. */
export const REAL_AVERAGE_RATING: number | null = null;

const DEMO_TESTIMONIALS: Testimonial[] = [
  { name: "Exemplo — Mãe", role: "2 filhos, 5 e 7 anos", topic: "Rotina corrida", rating: 5, highlight: "Em dez minutos antes do jantar a gente já tinha uma história e uma conversa.", text: "Texto demonstrativo para visualizar o layout. Substitua por um relato real e autorizado." },
  { name: "Exemplo — Pai", role: "Filho de 6 anos", topic: "Interesse da criança", rating: 5, highlight: "Ele pediu para fazer o quiz de novo.", text: "Texto demonstrativo para visualizar o layout." },
  { name: "Exemplo — Avó", role: "Neta de 4 anos", topic: "Facilidade de uso", rating: 4.5, highlight: "Abri no celular e funcionou na hora.", text: "Texto demonstrativo para visualizar o layout." },
  { name: "Exemplo — Mãe", role: "Filha de 8 anos", topic: "Valor pelo preço", rating: 5, highlight: "Tem muito mais coisa do que eu esperava.", text: "Texto demonstrativo para visualizar o layout." },
];

export function Testimonials() {
  const isDemo = REAL_TESTIMONIALS.length === 0;
  if (isDemo && !import.meta.env.DEV) return null;
  const items = isDemo ? DEMO_TESTIMONIALS : REAL_TESTIMONIALS;
  const avg = isDemo ? 4.9 : REAL_AVERAGE_RATING;
  const [first, ...rest] = items;
  if (!first) return null;

  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-5">
        {isDemo && (
          <p className="mx-auto mb-6 w-fit rounded-full border-2 border-dashed border-destructive px-3 py-1 text-xs font-black uppercase text-destructive">
            Conteúdo demonstrativo — visível só em desenvolvimento
          </p>
        )}
        <div className="flex flex-col items-center text-center">
          {avg !== null && (
            <>
              <StarRating value={avg} size={30} />
              <p className="mt-2 font-display text-4xl font-black">{avg.toFixed(1).replace(".", ",")} <span className="text-lg font-semibold text-muted-foreground">de 5</span></p>
            </>
          )}
          <h2 className="mt-3 max-w-xl font-display text-3xl font-bold leading-tight sm:text-4xl">O que as famílias estão vivendo</h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-5">
          <figure data-reveal="up" className="relative overflow-hidden rounded-3xl bg-night-sky p-7 text-night-foreground md:col-span-3 md:row-span-2">
            <Quote className="h-10 w-10 text-gold" />
            <blockquote className="mt-4 font-display text-2xl font-semibold leading-snug sm:text-3xl">“{first.highlight}”</blockquote>
            <p className="mt-4 text-sm opacity-80">{first.text}</p>
            <figcaption className="mt-6 flex items-center justify-between gap-3">
              <span><strong className="block">{first.name}</strong><span className="text-xs opacity-75">{first.role}</span></span>
              <StarRating value={first.rating} size={16} />
            </figcaption>
          </figure>
          {rest.map((t, i) => (
            <figure key={i} data-reveal="up" style={{ ["--reveal-delay" as string]: `${i * 80}ms` }} className="rounded-3xl border bg-card p-5 md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-surface-sky px-2.5 py-1 text-[11px] font-black uppercase text-primary">{t.topic}</span>
                <StarRating value={t.rating} size={14} />
              </div>
              <blockquote className="mt-3 font-display text-lg font-semibold leading-snug">“{t.highlight}”</blockquote>
              <figcaption className="mt-3 text-xs text-muted-foreground"><strong className="text-foreground">{t.name}</strong> • {t.role}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
