import useEmblaCarousel from "embla-carousel-react";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Gamepad2,
  Palette,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import storyDavid from "@/assets/story-david.jpg";
import storyNoah from "@/assets/story-noah.jpg";

interface MockupSlide {
  id: string;
  shortLabel: string;
  device: "Celular" | "Tablet" | "Computador";
  title: string;
  caption: string;
}

const SLIDES: MockupSlide[] = [
  {
    id: "historias",
    shortLabel: "Histórias",
    device: "Celular",
    title: "Histórias Bíblicas Ilustradas",
    caption: "Narrativas curtas, coloridas e fáceis de entender para crianças de 4 a 8 anos.",
  },
  {
    id: "jornada",
    shortLabel: "30 Dias",
    device: "Tablet",
    title: "Jornada de 30 Dias de Aventuras",
    caption: "Uma trilha diária com missões leves para criar o hábito de aprender sobre Jesus.",
  },
  {
    id: "quiz",
    shortLabel: "Quiz & Jogos",
    device: "Celular",
    title: "Quiz Bíblico & Jogo da Memória",
    caption: "Brincadeiras interativas que reforçam cada ensinamento enquanto a criança se diverte.",
  },
  {
    id: "pintura",
    shortLabel: "Pintura",
    device: "Tablet",
    title: "Pinturas Digitais, Quebra-Cabeças e Orações",
    caption: "Criatividade, raciocínio e pequenas orações para diferentes momentos do dia.",
  },
  {
    id: "pais",
    shortLabel: "Pais",
    device: "Computador",
    title: "Área dos Responsáveis & Progresso",
    caption: "Acompanhe a evolução da criança e baixe atividades complementares para imprimir.",
  },
];

export function AppMockupCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "center", loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
        {SLIDES.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => emblaApi?.scrollTo(idx)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              idx === selectedIndex
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {s.shortLabel}
          </button>
        ))}
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {SLIDES.map((slide, idx) => (
            <div key={slide.id} className="min-w-0 flex-[0_0_88%] px-2 sm:flex-[0_0_68%] lg:flex-[0_0_52%]">
              <div
                className={`rounded-3xl border bg-card p-4 transition-all duration-300 sm:p-6 ${
                  idx === selectedIndex ? "shadow-card-soft scale-100 opacity-100" : "scale-[0.96] opacity-75"
                }`}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-surface-sky px-3 py-1 text-xs font-semibold text-primary">
                    Prévia conceitual • {slide.device}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {idx + 1} / {SLIDES.length}
                  </span>
                </div>

                <div className="mockup-lift mb-4 flex min-h-[260px] items-center justify-center rounded-2xl bg-surface-warm p-3.5 sm:min-h-[295px]">
                  {slide.id === "historias" && <PhoneStoryMockup />}
                  {slide.id === "jornada" && <TabletJourneyMockup />}
                  {slide.id === "quiz" && <PhoneQuizMockup />}
                  {slide.id === "pintura" && <TabletCreativeMockup />}
                  {slide.id === "pais" && <DesktopParentsMockup />}
                </div>

                <h3 className="font-display text-lg font-semibold text-foreground sm:text-xl">{slide.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{slide.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => emblaApi?.scrollPrev()}
          aria-label="Tela anterior"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-card text-foreground transition hover:bg-secondary"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => emblaApi?.scrollTo(idx)}
              aria-label={`Ver ${s.title}`}
              className={`h-2.5 rounded-full transition-all ${
                idx === selectedIndex ? "w-7 bg-primary" : "w-2.5 bg-border"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => emblaApi?.scrollNext()}
          aria-label="Próxima tela"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-card text-foreground transition hover:bg-secondary"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function PhoneStoryMockup() {
  return (
    <div className="w-[220px] rounded-[2rem] border-4 border-foreground/85 bg-card p-2.5 shadow-card-soft">
      <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-foreground/20" />
      <img
        src={storyNoah}
        alt="Ilustração conceitual da história da Arca de Noé"
        width={944}
        height={704}
        loading="lazy"
        className="h-32 w-full rounded-2xl object-cover"
      />
      <div className="mt-2.5 px-1">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-primary">
          <BookOpen className="h-3.5 w-3.5" />
          <span>História do Dia</span>
        </div>
        <p className="mt-0.5 font-display text-sm font-semibold text-foreground">A Arca de Noé</p>
        <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
          Obediência, confiança em Deus e o cuidado com toda a criação.
        </p>
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-3/4 rounded-full bg-cta" />
        </div>
      </div>
    </div>
  );
}

function TabletJourneyMockup() {
  const days = [1, 2, 3, 4, 5, 6, 7, 8];
  return (
    <div className="w-full max-w-[360px] rounded-[1.5rem] border-4 border-foreground/85 bg-card p-4 shadow-card-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Compass className="h-4 w-4" />
          <span>Jornada de 30 Dias</span>
        </div>
        <span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-bold text-accent-foreground">
          Dia 4 ativo
        </span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {days.map((day) => {
          const done = day < 4;
          const active = day === 4;
          return (
            <div
              key={day}
              className={`flex flex-col items-center justify-center rounded-xl py-2.5 text-xs font-bold ${
                done
                  ? "bg-cta/15 text-cta"
                  : active
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
              }`}
            >
              <span>Dia {day}</span>
              <Star className="mt-1 h-3.5 w-3.5" />
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Cada dia libera uma história, uma brincadeira e uma pequena oração.
      </p>
    </div>
  );
}

function PhoneQuizMockup() {
  return (
    <div className="w-[220px] rounded-[2rem] border-4 border-foreground/85 bg-card p-2.5 shadow-card-soft">
      <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-foreground/20" />
      <img
        src={storyDavid}
        alt="Ilustração conceitual do pequeno pastor Davi"
        width={944}
        height={704}
        loading="lazy"
        className="h-24 w-full rounded-2xl object-cover"
      />
      <div className="mt-2 px-1">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-primary">
          <Gamepad2 className="h-3.5 w-3.5" />
          <span>Quiz Bíblico</span>
        </div>
        <p className="mt-0.5 text-xs font-semibold text-foreground">
          O que Davi tocava enquanto cuidava das ovelhas?
        </p>
        <div className="mt-2 space-y-1.5 text-[11px] font-medium">
          <div className="flex items-center justify-between rounded-lg bg-cta/15 px-2.5 py-1.5 text-cta">
            <span>Uma harpa</span>
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
          <div className="rounded-lg bg-secondary px-2.5 py-1.5 text-muted-foreground">Um tambor</div>
        </div>
      </div>
    </div>
  );
}

function TabletCreativeMockup() {
  return (
    <div className="w-full max-w-[360px] rounded-[1.5rem] border-4 border-foreground/85 bg-card p-4 shadow-card-soft">
      <div className="flex items-center gap-2 text-xs font-semibold text-primary">
        <Palette className="h-4 w-4" />
        <span>Ateliê & Orações Infantis</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <div className="rounded-xl bg-surface-sky p-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <p className="mt-2 font-display text-sm font-semibold text-foreground">Pintura Digital</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Colorir cenas bíblicas direto na tela.</p>
        </div>
        <div className="rounded-xl bg-secondary p-3">
          <BookOpen className="h-5 w-5 text-gold" />
          <p className="mt-2 font-display text-sm font-semibold text-foreground">Oração da Noite</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Gratidão simples antes de dormir.</p>
        </div>
      </div>
    </div>
  );
}

function DesktopParentsMockup() {
  return (
    <div className="w-full max-w-[380px]">
      <div className="rounded-t-2xl border-4 border-foreground/85 bg-card p-4 shadow-card-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <ShieldCheck className="h-4 w-4" />
            <span>Área dos Responsáveis</span>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">Sem instalação</span>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between rounded-xl bg-surface-warm px-3 py-2 text-xs">
            <span className="font-medium text-foreground">Histórias concluídas</span>
            <span className="font-bold text-primary">Progresso visual</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-surface-sky px-3 py-2 text-xs">
            <span className="font-medium text-foreground">Atividades para imprimir</span>
            <span className="font-bold text-cta">PDF pronto</span>
          </div>
        </div>
      </div>
      <div className="mx-auto h-3 w-[92%] rounded-b-xl bg-foreground/20" />
    </div>
  );
}