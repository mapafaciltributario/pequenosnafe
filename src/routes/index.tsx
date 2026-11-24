import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  CheckCircle2,
  Compass,
  Gamepad2,
  Heart,
  Laptop,
  Palette,
  Printer,
  Puzzle,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Users,
  XCircle,
} from "lucide-react";
import heroFamily from "@/assets/hero-family.jpg";
import storyNoah from "@/assets/story-noah.jpg";
import { AppMockupCarousel } from "@/components/sales/AppMockupCarousel";
import { BonusesAndOffer } from "@/components/sales/BonusesAndOffer";
import { CheckoutButton } from "@/components/sales/CheckoutButton";
import { FaqAndFooter } from "@/components/sales/FaqAndFooter";
import { ScrollReveal } from "@/components/sales/ScrollReveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pequenos na Fé — Aventuras Bíblicas e Jogos Cristãos (R$ 9,90)" },
      {
        name: "description",
        content:
          "Transforme o tempo de tela das crianças de 4 a 8 anos em aprendizado com Jesus. Histórias bíblicas, jogos educativos, jornada de 30 dias e 4 bônus por pagamento único de R$ 9,90.",
      },
      { property: "og:title", content: "Pequenos na Fé — Educação Infantil Cristã Interativa" },
      {
        property: "og:description",
        content:
          "Aplicativo web interativo com histórias bíblicas, jogos educativos, pinturas digitais e 4 bônus inclusos. Pagamento único de R$ 9,90.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const BEFORE_ITEMS = [
  "Vídeos e jogos agitados que não transmitem valores cristãos",
  "Falta de tempo para pesquisar e montar atividades bíblicas",
  "Dificuldade para despertar o interesse das crianças pela Bíblia",
];

const AFTER_ITEMS = [
  "Tempo de tela transformado em histórias e ensinamentos de Jesus",
  "Atividades prontas em segundos no celular, tablet ou computador",
  "A criança pede para jogar, pintar e ouvir histórias bíblicas",
];

const PILLARS = [
  {
    title: "Aprender a Bíblia",
    items: [
      { icon: BookOpen, label: "Histórias bíblicas ilustradas" },
      { icon: Compass, label: "Jornada de 30 dias de aventuras" },
      { icon: Heart, label: "Orações infantis para o dia a dia" },
    ],
  },
  {
    title: "Brincar e Criar",
    items: [
      { icon: Gamepad2, label: "Jogos educativos e memória" },
      { icon: Sparkles, label: "Quiz bíblico infantil" },
      { icon: Palette, label: "Pinturas digitais e quebra-cabeças" },
    ],
  },
  {
    title: "Acompanhar em Família",
    items: [
      { icon: Star, label: "Progresso infantil visual" },
      { icon: Users, label: "Área exclusiva dos responsáveis" },
      { icon: Printer, label: "Atividades complementares p/ imprimir" },
    ],
  },
];

const STEPS = [
  { step: "1", title: "Garanta seu acesso único", desc: "Faça o pagamento único de R$ 9,90 de forma segura pela Cakto, sem mensalidades." },
  { step: "2", title: "Abra no celular, tablet ou PC", desc: "Acesse direto pelo navegador, sem precisar instalar nada nem ocupar espaço." },
  { step: "3", title: "Vivam a jornada juntos", desc: "Transforme poucos minutos por dia em momentos leves de aprendizado com Jesus." },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ScrollReveal />
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#topo" className="font-display text-xl font-bold tracking-tight text-primary">
            Pequenos na Fé
          </a>
          <a
            href="#oferta"
            className="cta-shine rounded-xl bg-cta px-4 py-2 font-display text-sm font-semibold text-cta-foreground transition duration-200 hover:brightness-105 active:scale-[0.97]"
          >
            Garantir por R$ 9,90
          </a>
        </div>
      </header>

      <main id="topo">
        {/* HERO */}
        <section className="relative overflow-hidden bg-surface-warm pb-12 pt-6 sm:pb-16 sm:pt-10">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="animate-hero-in inline-flex items-center gap-2 rounded-full bg-surface-sky px-3.5 py-1.5 text-xs font-bold text-primary">
                Para pais cristãos com crianças de 4 a 8 anos
              </p>
              <h1 style={{ ["--reveal-delay" as string]: "60ms" }} className="animate-hero-in mt-3 font-display text-4xl font-bold leading-[1.06] tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]">
                Seu filho já pede o celular todos os dias. E se esse tempo ensinasse sobre Jesus?
              </h1>
              <p style={{ ["--reveal-delay" as string]: "120ms" }} className="animate-hero-in mt-3.5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                O <strong className="text-foreground">Pequenos na Fé</strong> transforma a tela em histórias bíblicas ilustradas, jogos educativos, pinturas digitais e uma jornada de 30 dias — direto no navegador, sem instalar nada.
              </p>

              <div style={{ ["--reveal-delay" as string]: "180ms" }} className="animate-hero-in mt-6">
                <CheckoutButton
                  label="Quero o Pequenos na Fé por R$ 9,90"
                  sublabel="Pagamento único • Sem mensalidades • 4 bônus inclusos por R$ 0,00"
                  placement="hero"
                  highlight
                />
              </div>

              <div style={{ ["--reveal-delay" as string]: "240ms" }} className="animate-hero-in mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground sm:text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4 text-primary" />
                  Celular, tablet e computador
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-cta" />
                  Garantia de 7 dias
                </span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative pb-6 sm:pb-8">
                <div className="animate-hero-image overflow-hidden rounded-[2rem] border-4 border-card shadow-card-soft">
                  <img
                    src={heroFamily}
                    alt="Família cristã sorrindo enquanto explora histórias bíblicas no tablet"
                    width={1280}
                    height={960}
                    className="h-auto w-full object-cover"
                  />
                </div>
                <div className="animate-float-gentle absolute -bottom-2 right-3 w-[168px] rounded-[1.5rem] border-[3px] border-foreground/85 bg-card p-2 shadow-card-soft sm:right-5 sm:w-[196px]">
                  <div className="mx-auto mb-1.5 h-1 w-9 rounded-full bg-foreground/20" />
                  <img
                    src={storyNoah}
                    alt="Prévia conceitual da tela do aplicativo Pequenos na Fé"
                    width={944}
                    height={704}
                    className="h-20 w-full rounded-xl object-cover sm:h-24"
                  />
                  <div className="mt-1.5 px-0.5">
                    <p className="text-[10px] font-bold text-primary">Prévia conceitual • App</p>
                    <p className="font-display text-xs font-bold text-foreground">A Arca de Noé</p>
                    <div className="mt-1 flex items-center justify-between text-[10px] font-semibold text-cta">
                      <span>História + Quiz</span>
                      <span>Dia 1/30</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARATIVO DIRETO: DORES VS TRANSFORMAÇÃO */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div data-reveal="up" className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Troque a preocupação com as telas por momentos que edificam
              </h2>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div data-reveal="left" className="rounded-3xl border bg-card p-5 sm:p-6">
                <p className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  Hoje nas telas comuns
                </p>
                <ul className="mt-4 space-y-3">
                  {BEFORE_ITEMS.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground sm:text-base">
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive/75" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div data-reveal="right" style={{ ["--reveal-delay" as string]: "100ms" }} className="rounded-3xl border-2 border-primary/25 bg-surface-sky p-5 sm:p-6">
                <p className="font-display text-sm font-bold uppercase tracking-wide text-primary">
                  Com o Pequenos na Fé
                </p>
                <ul className="mt-4 space-y-3">
                  {AFTER_ITEMS.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm font-medium text-foreground sm:text-base">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cta" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CARROSSEL INTERATIVO DE MOCKUPS */}
        <section className="bg-surface-warm py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div data-reveal="up" className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Veja por dentro o que seu filho vai explorar
              </h2>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Toque nas abas ou arraste para o lado para ver as prévias conceituais no celular, tablet e computador.
              </p>
            </div>

            <div data-reveal="scale" className="mt-7">
              <AppMockupCarousel />
            </div>
          </div>
        </section>

        {/* FUNCIONALIDADES EM 3 PILARES VISUAIS */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div data-reveal="up" className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Tudo pensado para encantar a criança e facilitar a vida dos pais
              </h2>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {PILLARS.map((pillar, i) => (
                <div key={pillar.title} data-reveal="up" style={{ ["--reveal-delay" as string]: `${i * 90}ms` }} className="rounded-3xl border bg-card p-5 shadow-card-soft">
                  <h3 className="font-display text-lg font-bold text-primary">{pillar.title}</h3>
                  <ul className="mt-4 space-y-2.5">
                    {pillar.items.map(({ icon: Icon, label }) => (
                      <li
                        key={label}
                        className="flex items-center gap-3 rounded-xl bg-surface-warm px-3.5 py-2.5 text-sm font-medium text-foreground"
                      >
                        <Icon className="h-4 w-4 shrink-0 text-primary" />
                        <span>{label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA O ACESSO */}
        <section className="bg-surface-sky py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div data-reveal="up" className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Simples de começar, fácil de incluir na rotina
              </h2>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {STEPS.map((item, i) => (
                <div key={item.step} data-reveal="up" style={{ ["--reveal-delay" as string]: `${i * 90}ms` }} className="rounded-3xl border bg-card p-5 text-center shadow-card-soft">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
            <div data-reveal="fade" className="mt-6 flex flex-wrap items-center justify-center gap-5 text-xs font-semibold text-foreground sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-cta" />
                Funciona sem baixar da loja
              </span>
              <span className="inline-flex items-center gap-2">
                <Laptop className="h-4 w-4 text-primary" />
                Compatível com qualquer dispositivo
              </span>
            </div>
          </div>
        </section>

        {/* BÔNUS E OFERTA PRINCIPAL */}
        <BonusesAndOffer />

        {/* GARANTIA, FAQ E RODAPÉ */}
        <FaqAndFooter />
      </main>
    </div>
  );
}
