import { BookOpen, Check, Gift, Heart, Lock, Printer, ShieldCheck, Smartphone, Sparkles } from "lucide-react";
import bonusCards from "@/assets/bonus-cards.jpg";
import bonusColoring from "@/assets/bonus-coloring.jpg";
import bonusFamily from "@/assets/bonus-family.jpg";
import bonusPrayers from "@/assets/bonus-prayers.jpg";
import { CHECKOUT_CONFIG, formatBRL, getBonusReferencePrice, getBonusTotalReference } from "@/lib/checkout-config";
import { CheckoutButton } from "./CheckoutButton";

const BONUSES = [
  {
    id: "livro",
    number: "Bônus 1",
    format: "Livro Digital Ilustrado",
    title: "Meu Primeiro Livro de Orações",
    description:
      "Orações simples e ensinamentos para momentos reais do dia: ao acordar, nas refeições e antes de dormir.",
    image: bonusPrayers,
    alt: "Prévia conceitual da capa do Meu Primeiro Livro de Orações",
  },
  {
    id: "pintura",
    number: "Bônus 2",
    format: "PDF Imprimível (A4)",
    title: "Pequenos Artistas da Bíblia",
    description:
      "Coleção de desenhos bíblicos prontos para imprimir e colorir com lápis de cor e giz fora das telas.",
    image: bonusColoring,
    alt: "Prévia conceitual das folhas imprimíveis Pequenos Artistas da Bíblia",
  },
  {
    id: "desafio",
    number: "Bônus 3",
    format: "Guia de Missões",
    title: "Desafio Cristão em Família",
    description:
      "Pequenas missões semanais que aproximam pais e filhos com conversas leves e práticas sobre a fé.",
    image: bonusFamily,
    alt: "Prévia conceitual do guia Desafio Cristão em Família",
  },
  {
    id: "cartoes",
    number: "Bônus 4",
    format: "Baralho Ilustrado",
    title: "Cartões de Valores Cristãos",
    description:
      "Cartões visuais sobre amor, respeito, gratidão e generosidade para usar no dia a dia com as crianças.",
    image: bonusCards,
    alt: "Prévia conceitual dos Cartões de Valores Cristãos",
  },
];

const INCLUDED_ITEMS = [
  "Aplicativo web Pequenos na Fé (celular, tablet e computador, sem instalar)",
  "Histórias bíblicas ilustradas, quiz, memória, pinturas digitais e quebra-cabeças",
  "Jornada de 30 dias de aventuras bíblicas + acompanhamento de progresso",
  "Área destinada aos responsáveis + atividades complementares para imprimir",
  "Todos os 4 bônus exclusivos inclusos por R$ 0,00",
];

export function BonusesAndOffer() {
  return (
    <>
      <section className="bg-surface-warm py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div data-reveal="up" className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/45 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-accent-foreground">
              <Gift className="h-4 w-4" />
              <span>4 materiais extras inclusos por R$ 0,00</span>
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Leve também 4 bônus exclusivos sem pagar nada a mais
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Além do aplicativo interativo, você recebe quatro materiais complementares para usar na rotina da família. Prévias conceituais dos materiais:
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {BONUSES.map((bonus, i) => (
              <article
                key={bonus.number}
                data-reveal="up"
                style={{ ["--reveal-delay" as string]: `${(i % 2) * 90}ms` }}
                className="flex flex-col overflow-hidden rounded-3xl border bg-card p-5 shadow-card-soft transition-transform duration-300 hover:-translate-y-1 sm:flex-row sm:items-center sm:gap-5"
              >
                <div className="mockup-lift mx-auto mb-4 flex w-36 shrink-0 items-center justify-center sm:mx-0 sm:mb-0">
                  <BonusMaterialMockup bonus={bonus} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      {bonus.number} • {bonus.format}
                    </span>
                    {getBonusReferencePrice(bonus.id) === null ? (
                      <span className="rounded-full bg-cta/12 px-2.5 py-0.5 text-xs font-bold text-cta">
                        Incluso por R$ 0,00
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-1.5 font-display text-lg font-semibold text-foreground sm:text-xl">
                    {bonus.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {bonus.description}
                  </p>
                  <BonusPriceTag id={bonus.id} />
                </div>
              </article>
            ))}
          </div>

          <BonusValueSummary />
        </div>
      </section>

      <section id="oferta" className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div data-reveal="scale" className="overflow-hidden rounded-[2rem] border-2 border-primary/25 bg-card shadow-card-soft">
            <div className="bg-primary px-6 py-5 text-center text-primary-foreground sm:px-10">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Plano Único • Sem Mensalidades</span>
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
                {CHECKOUT_CONFIG.productName}
              </h2>
            </div>

            <div className="p-5 sm:p-8">
              <ul className="space-y-2.5">
                {INCLUDED_ITEMS.map((item, i) => (
                  <li key={item} data-reveal="left" style={{ ["--reveal-delay" as string]: `${120 + i * 70}ms` }} className="flex items-start gap-3 text-sm text-foreground sm:text-base">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cta/15 text-cta">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div data-reveal="up" className="mt-7 rounded-2xl border border-primary/15 bg-surface-sky px-5 py-6 text-center sm:px-8">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  Aplicativo Completo + 4 Bônus por R$ 0,00
                </p>
                <p className="mt-1 font-display text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
                  {CHECKOUT_CONFIG.priceFormatted}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-foreground">
                  Pagamento único — sem mensalidades ou cobranças recorrentes
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Acesso digital enviado por e-mail após confirmação do pagamento seguro na Cakto.
                </p>

                <div className="mt-5">
                  <CheckoutButton
                    label="Garantir acesso completo por R$ 9,90"
                    placement="offer_card"
                    fullWidth
                    highlight
                  />
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-primary" />
                    Checkout seguro Cakto
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-cta" />
                    {CHECKOUT_CONFIG.guaranteeDays} dias de garantia
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5 text-primary" />
                    Sem precisar instalar
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function BonusMaterialMockup({ bonus }: { bonus: (typeof BONUSES)[number] }) {
  if (bonus.id === "livro") {
    return (
      <div className="relative w-32 -rotate-2 rounded-r-xl rounded-l-sm border-l-8 border-primary bg-card p-1.5 shadow-card-soft">
        <img
          src={bonus.image}
          alt={bonus.alt}
          width={816}
          height={816}
          loading="lazy"
          className="h-28 w-full rounded-md object-cover"
        />
        <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] font-bold text-primary">
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3 w-3" /> Orações
          </span>
          <span>PDF</span>
        </div>
      </div>
    );
  }

  if (bonus.id === "pintura") {
    return (
      <div className="relative w-32 rotate-1 rounded-xl border-2 border-dashed border-primary/40 bg-card p-1.5 shadow-card-soft">
        <img
          src={bonus.image}
          alt={bonus.alt}
          width={816}
          height={816}
          loading="lazy"
          className="h-28 w-full rounded-lg object-cover"
        />
        <div className="mt-1.5 flex items-center justify-center gap-1 text-[10px] font-bold text-foreground">
          <Printer className="h-3 w-3 text-primary" />
          <span>Pronto p/ imprimir</span>
        </div>
      </div>
    );
  }

  if (bonus.id === "cartoes") {
    return (
      <div className="relative flex h-36 w-32 items-center justify-center">
        <div className="absolute inset-x-2 top-2 bottom-1 -rotate-6 rounded-xl border bg-surface-sky" />
        <div className="relative w-28 rotate-2 rounded-xl border bg-card p-1.5 shadow-card-soft">
          <img
            src={bonus.image}
            alt={bonus.alt}
            width={816}
            height={816}
            loading="lazy"
            className="h-24 w-full rounded-lg object-cover"
          />
          <p className="mt-1 flex items-center justify-center gap-1 text-[10px] font-bold text-primary">
            <Heart className="h-3 w-3" /> Valores
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-32 rounded-2xl border bg-surface-sky p-1.5 shadow-card-soft">
      <img
        src={bonus.image}
        alt={bonus.alt}
        width={816}
        height={816}
        loading="lazy"
        className="h-28 w-full rounded-xl object-cover"
      />
      <p className="mt-1.5 text-center text-[10px] font-bold text-primary">Missões em Família</p>
    </div>
  );
}
const BONUS_IDS = BONUSES.map((b) => b.id);

function BonusPriceTag({ id }: { id: string }) {
  const price = getBonusReferencePrice(id);
  if (price === null) return null;
  return (
    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-cta/20 bg-cta/8 px-3.5 py-2.5">
      <div className="leading-tight">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Vendido separadamente
        </p>
        <p className="text-sm font-semibold text-muted-foreground line-through decoration-destructive/70 decoration-2">
          {formatBRL(price)}
        </p>
      </div>
      <div className="ml-auto text-right leading-tight">
        <p className="text-[11px] font-bold uppercase tracking-wide text-cta">Hoje para você</p>
        <p className="font-display text-2xl font-bold text-cta">R$ 0,00</p>
      </div>
    </div>
  );
}

function BonusValueSummary() {
  const total = getBonusTotalReference(BONUS_IDS);

  if (total === null) {
    return (
      <div data-reveal="scale" className="mt-7 rounded-2xl border border-primary/20 bg-card px-5 py-4 text-center shadow-card-soft">
        <p className="font-display text-base font-semibold text-foreground sm:text-lg">
          Todos os 4 bônus acima entram por <span className="text-cta">R$ 0,00</span> junto com o acesso completo ao aplicativo.
        </p>
      </div>
    );
  }

  return (
    <div data-reveal="scale" className="mx-auto mt-9 max-w-xl overflow-hidden rounded-[1.75rem] border-2 border-dashed border-cta/35 bg-card shadow-card-soft">
      <div className="flex items-center justify-center gap-2 bg-cta/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-cta">
        <Gift className="h-4 w-4" />
        <span>Resumo dos seus bônus</span>
      </div>
      <ul className="divide-y divide-dashed px-5 sm:px-7">
        {BONUSES.map((bonus, i) => {
          const price = getBonusReferencePrice(bonus.id);
          return (
            <li
              key={bonus.id}
              data-reveal="left"
              style={{ ["--reveal-delay" as string]: `${100 + i * 70}ms` }}
              className="flex items-center justify-between gap-3 py-3 text-sm"
            >
              <span className="font-medium text-foreground">
                <span className="text-primary">{bonus.number}:</span> {bonus.title}
              </span>
              <span className="shrink-0 whitespace-nowrap text-muted-foreground line-through">{price !== null ? formatBRL(price) : ""}</span>
            </li>
          );
        })}
      </ul>
      <div className="mx-5 mb-5 mt-1 rounded-2xl bg-surface-sky px-5 py-4 sm:mx-7">
        <div className="flex items-center justify-between text-sm font-semibold text-muted-foreground">
          <span>Valor total se comprados separadamente</span>
          <span className="shrink-0 whitespace-nowrap line-through decoration-destructive/70 decoration-2">{formatBRL(total)}</span>
        </div>
        <div className="mt-2 flex items-end justify-between">
          <span className="font-display text-base font-bold text-foreground">Você paga pelos bônus</span>
          <span className="font-display text-4xl font-bold leading-none text-cta">R$ 0,00</span>
        </div>
        <p className="mt-3 border-t border-primary/15 pt-3 text-center text-sm font-semibold text-foreground">
          Tudo incluso no aplicativo completo por apenas{" "}
          <span className="text-primary">{CHECKOUT_CONFIG.priceFormatted}</span> — pagamento único.
        </p>
      </div>
    </div>
  );
}
