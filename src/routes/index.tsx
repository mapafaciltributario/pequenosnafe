import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, Gift, Lock, Mail, MonitorSmartphone, ShieldCheck, Sparkles } from "lucide-react";
import heroNight from "@/assets/hero-night-story.jpg";
import momentShare from "@/assets/moment-share.jpg";
import heroFamily from "@/assets/hero-family.jpg";
import storyNoah from "@/assets/story-noah.jpg";
import storyDavid from "@/assets/story-david.jpg";
import bonusPrayers from "@/assets/bonus-prayers.jpg";
import bonusColoring from "@/assets/bonus-coloring.jpg";
import bonusFamily from "@/assets/bonus-family.jpg";
import bonusCards from "@/assets/bonus-cards.jpg";
import { AppDemo } from "@/components/sales/AppDemo";
import { BeforeAfter } from "@/components/sales/BeforeAfter";
import { CheckoutButton } from "@/components/sales/CheckoutButton";
import { ScrollReveal } from "@/components/sales/ScrollReveal";
import { StickyBuyBar } from "@/components/sales/StickyBuyBar";
import { Testimonials } from "@/components/sales/Testimonials";
import { CHECKOUT_CONFIG } from "@/lib/checkout-config";
import { captureAndGetAttribution, initMarketingScripts, trackPageView, trackViewContent } from "@/lib/tracking";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pequenos na Fé — Aventuras com Jesus no celular do seu filho (R$ 9,90)" },
      { name: "description", content: "Histórias bíblicas ilustradas, quiz, jogos e uma jornada de 30 dias para crianças de 4 a 8 anos. Direto no navegador, pagamento único de R$ 9,90 com 4 bônus inclusos." },
      { property: "og:title", content: "Pequenos na Fé — Transforme o tempo de tela em aventuras com Jesus" },
      { property: "og:description", content: "App web cristão para crianças de 4 a 8 anos. Pagamento único de R$ 9,90, sem mensalidade, 4 bônus e garantia de 7 dias." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const SCENES = [
  { time: "18h40", title: "“Mãe, me empresta o celular?”", text: "Você está fazendo o jantar. Ele já sabe desbloquear a tela melhor que você." },
  { time: "19h05", title: "Você procura algo bom para ele ver", text: "Um vídeo aqui, um desenho ali, um PDF salvo que nunca saiu da pasta de downloads." },
  { time: "19h30", title: "A vontade de ensinar sobre Jesus", text: "Ela está aí. O que falta é tempo para preparar uma história, uma atividade, uma conversa." },
  { time: "20h10", title: "Ele quer cor, som e toque", text: "Criança não quer sermão. Quer descobrir, tocar, acertar e ganhar estrelinha." },
  { time: "21h00", title: "E você queria estar mais perto", text: "Participar de verdade da fé dele, mesmo num dia corrido." },
];

const CHAPTERS = [
  { n: "01", img: storyNoah, kicker: "Histórias bíblicas ilustradas", title: "Ele não só ouve a história. Ele entra nela.", text: "Noé, Davi, Daniel, Jonas, o nascimento de Jesus… narrativas curtas, com ilustrações coloridas e linguagem do tamanho dele. Cada história termina com uma lição simples que ele consegue repetir no jantar." },
  { n: "02", img: storyDavid, kicker: "Quiz, memória, pintura e quebra-cabeças", title: "Aprender sem perceber que está aprendendo.", text: "Depois da história vem a brincadeira: perguntas, jogo da memória, pinturas digitais e quebra-cabeças que reforçam o que ele acabou de descobrir. Ele toca, acerta, ganha estrelas e pede mais." },
  { n: "03", img: heroFamily, kicker: "Jornada de 30 dias + área dos pais", title: "Uma pequena aventura por dia. E você acompanha tudo.", text: "Uma trilha diária transforma minutos soltos em hábito. Na área dos responsáveis você vê o progresso e encontra atividades para imprimir e fazer junto, longe da tela." },
];

const BONUSES = [
  { id: "01", img: bonusPrayers, name: "Meu Primeiro Livro de Orações", text: "Orações ilustradas e curtinhas para a hora de dormir, das refeições e do dia a dia. Um jeito acolhedor de apresentar a conversa com Deus.", tone: "bg-surface-sky", rot: "-2deg" },
  { id: "02", img: bonusColoring, name: "Pequenos Artistas da Bíblia", text: "Desenhos de histórias e personagens bíblicos para pintar e criar. A história continua no papel, com lápis de cor na mão.", tone: "bg-parchment", rot: "2deg" },
  { id: "03", img: bonusFamily, name: "Desafio Cristão em Família", text: "Missões simples para fazer todos juntos: gestos de gentileza, perguntas para o jantar, pequenas tarefas de fé.", tone: "bg-secondary", rot: "-1.5deg" },
  { id: "04", img: bonusCards, name: "Cartões de Valores Cristãos", text: "Cartões ilustrados sobre amor, bondade, respeito, gratidão e generosidade para conversar, brincar e colar na geladeira.", tone: "bg-surface-warm", rot: "1.5deg" },
];

const STACK = [
  "App Pequenos na Fé completo",
  "Histórias bíblicas ilustradas",
  "Quiz bíblico e jogos educativos",
  "Jornada de aprendizado de 30 dias",
  "Pinturas digitais e quebra-cabeças",
  "Área dos pais com progresso",
  "Atividades cristãs para imprimir",
  "4 bônus inclusos",
];

const FAQS = [
  { q: "Preciso instalar alguma coisa?", a: "Não. O Pequenos na Fé abre direto no navegador. Você recebe o link e entra. Não ocupa memória do aparelho." },
  { q: "Existe mensalidade?", a: "Não. São R$ 9,90 uma única vez, sem renovação automática e sem cobrança escondida." },
  { q: "Funciona no celular e no tablet?", a: "Sim. Funciona no celular, no tablet e no computador, Android ou iPhone, em qualquer navegador atualizado." },
  { q: "Para qual idade é indicado?", a: "Para crianças de aproximadamente 4 a 8 anos. Os menores aproveitam melhor com um adulto por perto; os maiores já navegam sozinhos." },
  { q: "Preciso entender muito de Bíblia para acompanhar?", a: "Não. As histórias já vêm prontas, com linguagem simples e uma lição no final. Você só precisa sentar junto e conversar." },
  { q: "Como recebo o acesso?", a: "Assim que o pagamento é confirmado, o acesso é liberado na página de confirmação e enviado para o e-mail informado na compra. No Pix costuma ser em instantes." },
  { q: "Os bônus estão inclusos?", a: "Sim. Os 4 bônus fazem parte do mesmo pagamento de R$ 9,90. Não há cobrança adicional." },
  { q: "O pagamento é seguro?", a: "Sim. O pagamento é processado pela Cakto, com Pix ou cartão. Os dados do cartão são criptografados e não passam pelos nossos servidores." },
  { q: "Existe garantia?", a: `Sim. Você tem ${CHECKOUT_CONFIG.guaranteeDays} dias de garantia. Se não fizer sentido para sua família, peça o reembolso pelo suporte.` },
];

function Index() {
  useEffect(() => {
    initMarketingScripts();
    captureAndGetAttribution();
    trackPageView();
    trackViewContent();
  }, []);

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <ScrollReveal />
      <StickyBuyBar />

      {/* ============ HERO ============ */}
      <section id="topo" className="relative isolate overflow-hidden bg-night text-night-foreground">
        <img src={heroNight} alt="Criança no quarto à noite, encantada com histórias bíblicas saindo da tela do celular" width={1024} height={1280} fetchPriority="high" className="animate-hero-image absolute inset-0 -z-20 h-full w-full object-cover object-[60%_center] opacity-90 lg:left-auto lg:w-[58%]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-night/70 via-night/45 to-night lg:bg-gradient-to-r lg:from-night lg:via-night/85 lg:to-night/0" />
        <div className="stars-layer animate-twinkle pointer-events-none absolute inset-0 -z-10" />

        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 pt-5">
          <span className="font-display text-xl font-black tracking-tight">Pequenos <em className="text-gradient-gold">na Fé</em></span>
          <span className="rounded-full border border-night-foreground/25 bg-night/40 px-3 py-1 text-[11px] font-bold backdrop-blur">4 a 8 anos</span>
        </header>

        <div className="mx-auto flex min-h-[calc(100svh-60px)] max-w-6xl flex-col justify-end px-5 pb-10 pt-40 lg:min-h-[720px] lg:justify-center lg:pt-10">
          <div className="max-w-xl">
            <p className="animate-hero-in inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1.5 text-xs font-extrabold text-gold ring-1 ring-gold/40">
              <Sparkles className="h-3.5 w-3.5" /> Histórias bíblicas • Quiz • Jogos • Jornada de 30 dias
            </p>
            <h1 style={{ ["--reveal-delay" as string]: "80ms" }} className="animate-hero-in mt-4 font-display text-[2.55rem] font-bold leading-[1.02] tracking-tight sm:text-6xl">
              Seu filho já ama o celular.{" "}
              <em className="text-gradient-gold">Agora ele pode encontrar Jesus nele.</em>
            </h1>
            <p style={{ ["--reveal-delay" as string]: "160ms" }} className="animate-hero-in mt-4 text-[1.05rem] leading-relaxed text-night-foreground/85 sm:text-lg">
              Um app cristão com histórias ilustradas, perguntas e jogos que transformam parte do tempo de tela em aventura, fé e conversa em família.
            </p>
            <div style={{ ["--reveal-delay" as string]: "240ms" }} className="animate-hero-in mt-7 max-w-md">
              <CheckoutButton label="Quero o Pequenos na Fé" placement="hero" highlight fullWidth />
              <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-night-2/70 px-4 py-3 text-xs ring-1 ring-night-foreground/10 backdrop-blur">
                <span className="font-semibold leading-tight opacity-90">App completo + 4 bônus<br /><span className="opacity-70">pagamento único, sem mensalidade</span></span>
                <span className="font-display text-2xl font-black text-gold">R$ 9,90</span>
              </div>
              <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold opacity-75">
                <span>✓ Sem instalar nada</span><span>✓ Celular e tablet</span><span>✓ Garantia de 7 dias</span>
              </p>
            </div>
          </div>
          <a href="#cena" className="mx-auto mt-8 flex flex-col items-center text-[11px] font-bold opacity-60 lg:mx-0">
            Veja como funciona <ChevronDown className="h-4 w-4 animate-float-gentle" />
          </a>
        </div>
      </section>

      {/* ============ MARQUEE ============ */}
      <div className="overflow-hidden bg-gradient-gold py-3 text-accent-foreground" aria-hidden="true">
        <div className="animate-marquee flex w-max gap-8 whitespace-nowrap font-display text-sm font-bold">
          {Array.from({ length: 2 }).flatMap((_, k) =>
            ["Arca de Noé", "Davi e Golias", "Daniel na cova", "Jonas", "Nascimento de Jesus", "Quiz bíblico", "Jogo da memória", "Pinturas digitais", "Jornada de 30 dias"].map((t) => (
              <span key={`${k}-${t}`}>✦ {t}</span>
            )),
          )}
        </div>
      </div>

      {/* ============ IDENTIFICAÇÃO ============ */}
      <section id="cena" className="paper py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <p className="font-hand text-2xl text-cta">uma noite comum…</p>
          <h2 data-reveal="up" className="mt-1 max-w-2xl font-display text-3xl font-bold leading-tight sm:text-5xl">Se isso acontece na sua casa, você está no lugar certo.</h2>
        </div>
        <div className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:mx-auto sm:max-w-6xl">
          {SCENES.map((s, i) => (
            <article key={s.time} className="relative w-[78%] shrink-0 snap-center rounded-3xl border bg-card p-6 shadow-card-soft sm:w-[300px]" style={{ transform: `rotate(${i % 2 ? 1 : -1}deg)` }}>
              <span className="font-display text-4xl font-black text-primary/15">{s.time}</span>
              <h3 className="mt-2 font-display text-xl font-bold leading-snug">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </article>
          ))}
        </div>
        <p className="mt-2 px-5 text-center text-xs font-bold text-muted-foreground sm:hidden">← arraste para ver a noite inteira →</p>

        <div className="mx-auto mt-14 max-w-3xl px-5 text-center">
          <h2 data-reveal="up" className="font-display text-3xl font-bold leading-tight sm:text-4xl">
            O problema nunca foi o celular. <span className="text-cta">É o que tem dentro dele.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Arraste e compare a mesma tarde, com o mesmo aparelho.</p>
        </div>
        <div className="mt-8 px-5" data-reveal="scale"><BeforeAfter /></div>
      </section>

      {/* ============ SOLUÇÃO ============ */}
      <section className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-center text-xs font-black uppercase tracking-[0.25em] text-cta">Apresentando o Pequenos na Fé</p>
          <h2 data-reveal="up" className="mx-auto mt-3 max-w-3xl text-center font-display text-3xl font-bold leading-tight sm:text-5xl">
            Não é mais um vídeo. Não é um PDF esquecido. <em className="text-primary">É um universo inteiro de fé, num toque.</em>
          </h2>
          <div className="mt-14 space-y-16 sm:space-y-24">
            {CHAPTERS.map((c, i) => (
              <div key={c.n} className={`grid items-center gap-8 lg:grid-cols-2 ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <div data-reveal={i % 2 ? "right" : "left"} className="relative">
                  <img src={c.img} alt={c.kicker} width={944} height={704} loading="lazy" className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-book" />
                  <span className="absolute -top-6 left-4 font-display text-7xl font-black text-gradient-gold drop-shadow">{c.n}</span>
                </div>
                <div data-reveal="up">
                  <p className="text-xs font-black uppercase tracking-widest text-cta">{c.kicker}</p>
                  <h3 className="mt-2 font-display text-2xl font-bold leading-tight sm:text-4xl">{c.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ DEMO ============ */}
      <section id="demo" className="relative overflow-hidden bg-night-sky py-16 text-night-foreground sm:py-24">
        <div className="stars-layer animate-twinkle pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 lg:grid-cols-2">
          <div>
            <p className="font-hand text-2xl text-gold">não precisa acreditar só no que está escrito</p>
            <h2 className="mt-1 font-display text-3xl font-bold leading-tight sm:text-5xl">Experimente agora. Do jeito que seu filho vai usar.</h2>
            <p className="mt-4 max-w-md text-night-foreground/80">Vire as páginas da história de Noé, responda à pergunta e tente o jogo da memória. É só uma amostra do que fica liberado logo depois do pagamento.</p>
            <ul className="mt-6 space-y-2 text-sm font-bold">
              <li>📖 Vire as páginas da história</li>
              <li>⭐ Responda o quiz e ganhe estrela</li>
              <li>🧠 Encontre os pares da memória</li>
              <li>🧭 Veja a jornada de 30 dias</li>
            </ul>
            <div className="mt-8 hidden max-w-sm lg:block">
              <CheckoutButton label="Quero a versão completa" placement="demo" fullWidth />
            </div>
          </div>
          <div data-reveal="scale">
            <AppDemo />
          </div>
          <div className="lg:hidden">
            <CheckoutButton label="Quero a versão completa" placement="demo" fullWidth sublabel="R$ 9,90 • pagamento único" />
          </div>
        </div>
      </section>

      {/* ============ DESEJO ============ */}
      <section className="bg-surface-warm py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div data-reveal="left" className="relative">
              <img src={momentShare} alt="Mãe e filha olhando a história da Arca de Noé no tablet" width={1280} height={960} loading="lazy" className="w-full rounded-[2rem] object-cover shadow-book" />
              <div className="animate-drift absolute -bottom-6 right-3 max-w-[230px] rotate-2 rounded-2xl rounded-br-sm bg-card p-4 shadow-book" style={{ ["--r" as string]: "2deg" }}>
                <p className="font-hand text-2xl leading-tight">“Mãe, sabia que Noé confiou em Deus mesmo com chuva?”</p>
              </div>
            </div>
            <div data-reveal="up" className="pt-4 lg:pt-0">
              <p className="text-xs font-black uppercase tracking-widest text-cta">Imagine a cena</p>
              <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-5xl">Ele vem até você para contar o que aprendeu.</h2>
              <ol className="mt-7 space-y-5 border-l-2 border-dashed border-cta/40 pl-6">
                {[
                  ["Depois da escola", "Ele abre a história do dia sozinho, enquanto você termina o que estava fazendo."],
                  ["No jantar", "Ele conta quem foi Davi e por que ele não teve medo."],
                  ["Antes de dormir", "Vocês leem uma oração juntos e conversam sobre gratidão."],
                ].map(([t, d]) => (
                  <li key={t} className="relative">
                    <span className="absolute -left-[33px] top-1 h-4 w-4 rounded-full bg-gradient-cta ring-4 ring-surface-warm" />
                    <h3 className="font-display text-lg font-bold">{t}</h3>
                    <p className="text-sm text-muted-foreground">{d}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-8 max-w-md">
                <CheckoutButton label="Quero apresentar isso ao meu filho" placement="desejo" fullWidth sublabel="Acesso liberado logo após o pagamento" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FACILIDADE ============ */}
      <section className="bg-background py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-5">
          <h2 data-reveal="up" className="text-center font-display text-3xl font-bold sm:text-4xl">Você começa ainda hoje. Em 3 passos.</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["1", "Pague R$ 9,90", "Pix ou cartão, uma vez só."],
              ["2", "Receba o acesso", "Na tela de confirmação e no seu e-mail."],
              ["3", "Entregue o celular", "Abre no navegador. Sem instalar, sem cadastro complicado."],
            ].map(([n, t, d]) => (
              <div key={n} data-reveal="up" className="rounded-3xl border bg-card p-6 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-night font-display text-xl font-black text-gold">{n}</span>
                <h3 className="mt-3 font-display text-xl font-bold">{t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-2 text-xs font-bold">
            {["Não precisa saber muito de Bíblia", "Celular, tablet e computador", "Android e iPhone", "4 a 8 anos"].map((t) => (
              <span key={t} className="rounded-full bg-surface-sky px-3 py-1.5 text-primary">✓ {t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ BÔNUS ============ */}
      <section className="relative overflow-hidden bg-night py-16 text-night-foreground sm:py-24">
        <div className="stars-layer pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-6xl px-5">
          <div className="text-center">
            <Gift className="mx-auto h-10 w-10 text-gold" />
            <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-bold leading-tight sm:text-5xl">
              E a aventura continua <em className="text-gradient-gold">fora da tela.</em>
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-night-foreground/80">Quatro materiais extras para orar, criar, brincar e conversar em família. Todos inclusos nos mesmos R$ 9,90.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {BONUSES.map((b, i) => (
              <article key={b.id} data-reveal="up" style={{ ["--reveal-delay" as string]: `${i * 70}ms` }} className={`${b.tone} group relative overflow-hidden rounded-[2rem] text-foreground shadow-book`}>
                <div className="relative overflow-hidden">
                  <img src={b.img} alt={b.name} width={816} height={816} loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <span className="absolute left-4 top-4 rounded-full bg-night px-3 py-1 text-[11px] font-black uppercase tracking-widest text-gold">Bônus {b.id}</span>
                  <span className="absolute right-4 top-4 rounded-full bg-success px-3 py-1 text-[11px] font-black uppercase text-primary-foreground">Incluso</span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-2xl font-bold leading-tight">{b.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ OFERTA ============ */}
      <section id="oferta" className="paper py-16 sm:py-24">
        <div className="mx-auto max-w-xl px-5">
          <h2 data-reveal="up" className="text-center font-display text-3xl font-bold leading-tight sm:text-5xl">Tudo o que sua família recebe hoje</h2>
          <div data-reveal="scale" className="relative mt-10 overflow-hidden rounded-[2rem] bg-card shadow-book ring-2 ring-gold">
            <div className="bg-night-sky px-6 py-5 text-center text-night-foreground">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-gold">Acesso completo</p>
              <p className="font-display text-2xl font-bold">Pequenos na Fé + 4 bônus</p>
            </div>
            <ul className="grid gap-2.5 px-6 py-6 text-sm font-bold">
              {STACK.map((s) => (
                <li key={s} className="flex items-center gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">✓</span>{s}</li>
              ))}
              {BONUSES.map((b) => (
                <li key={b.id} className="flex items-center gap-3 pl-9 text-xs font-semibold text-muted-foreground">🎁 {b.name}</li>
              ))}
            </ul>
            <div className="border-t border-dashed px-6 py-7 text-center">
              <p className="text-sm font-bold text-muted-foreground">Pagamento único de</p>
              <p className="font-display text-7xl font-black leading-none tracking-tight text-foreground">
                <span className="align-top text-2xl">R$</span>9<span className="text-4xl">,90</span>
              </p>
              <p className="mt-2 text-sm font-semibold text-muted-foreground">
                Sem mensalidade. Na jornada de 30 dias, dá cerca de <strong className="text-foreground">R$ 0,33 por dia</strong> de aventura.
              </p>
              <div className="mt-6">
                <CheckoutButton label="Quero acesso completo por R$ 9,90" placement="oferta" highlight fullWidth />
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[11px] font-bold text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" /> Pagamento seguro Cakto</span>
                <span>Pix ou cartão</span>
                <span className="inline-flex items-center gap-1"><MonitorSmartphone className="h-3 w-3" /> Acesso digital imediato</span>
              </div>
            </div>
          </div>

          <div data-reveal="up" className="mt-8 flex items-center gap-4 rounded-3xl border-2 border-dashed border-success/50 bg-card p-5">
            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full bg-gradient-gold text-accent-foreground shadow-glow">
              <ShieldCheck className="h-6 w-6" /><span className="text-[10px] font-black">7 DIAS</span>
            </div>
            <p className="text-sm leading-relaxed">
              <strong className="font-display text-base">Risco zero para você.</strong> Use com seu filho por {CHECKOUT_CONFIG.guaranteeDays} dias. Se não fizer sentido para sua família, peça o reembolso pelo suporte.
            </p>
          </div>
        </div>
      </section>

      <Testimonials />

      {/* ============ FAQ ============ */}
      <Faq />

      {/* ============ CTA FINAL ============ */}
      <section id="cta-final" className="relative overflow-hidden bg-night-sky py-16 text-center text-night-foreground sm:py-24">
        <div className="stars-layer animate-twinkle pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-2xl px-5">
          <h2 className="font-display text-3xl font-bold leading-tight sm:text-5xl">
            Ele vai continuar pedindo o celular. <em className="text-gradient-gold">Que tal ele encontrar Jesus lá?</em>
          </h2>
          <div className="mx-auto mt-8 max-w-md">
            <CheckoutButton label="Quero o Pequenos na Fé por R$ 9,90" placement="final" highlight fullWidth sublabel="Pagamento único • 4 bônus • Garantia de 7 dias" />
          </div>
        </div>
      </section>

      <footer className="bg-night pb-28 pt-8 text-center text-xs text-night-foreground/60 md:pb-8">
        <p className="font-display text-base font-bold text-night-foreground">Pequenos na Fé</p>
        <p className="mt-2 inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {CHECKOUT_CONFIG.supportEmail}</p>
        <p className="mt-1">{CHECKOUT_CONFIG.supportHours}</p>
        <p className="mt-3">© {new Date().getFullYear()} Pequenos na Fé. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-2xl px-5">
        <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">Ainda com alguma dúvida?</h2>
        <div className="mt-8 divide-y rounded-3xl border bg-card">
          {FAQS.map((f, i) => (
            <div key={f.q}>
              <button type="button" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-display text-base font-semibold">
                {f.q}
                <ChevronDown className={`h-5 w-5 shrink-0 text-cta transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
