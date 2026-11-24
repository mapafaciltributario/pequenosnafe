import { BookOpen, Brain, Check, ChevronLeft, ChevronRight, Compass, RotateCcw, Sparkles, Star, X } from "lucide-react";
import { useMemo, useState } from "react";
import storyNoah from "@/assets/story-noah.jpg";
import storyDavid from "@/assets/story-david.jpg";

type Tab = "historia" | "quiz" | "memoria" | "jornada";

const TABS: { id: Tab; label: string; icon: typeof BookOpen }[] = [
  { id: "historia", label: "História", icon: BookOpen },
  { id: "quiz", label: "Quiz", icon: Sparkles },
  { id: "memoria", label: "Memória", icon: Brain },
  { id: "jornada", label: "Jornada", icon: Compass },
];

const PAGES = [
  { text: "Deus pediu a Noé que construísse um barco enorme: a arca.", hint: "Toque na seta para virar a página" },
  { text: "Noé confiou em Deus e obedeceu, mesmo quando ninguém entendia.", hint: "Obediência e confiança" },
  { text: "Os animais entraram de dois em dois. E Deus cuidou de todos!", hint: "Deus cuida de nós" },
  { text: "Depois da chuva, Deus colocou um arco-íris no céu: uma promessa de amor.", hint: "Fim da história ✨" },
];

/** Demonstração navegável inspirada nas atividades do app. Opcional: nunca bloqueia a compra. */
export function AppDemo() {
  const [tab, setTab] = useState<Tab>("historia");
  return (
    <div className="mx-auto w-full max-w-[340px]">
      <div className="relative rounded-[2.6rem] border-[10px] border-night bg-night p-0 shadow-book">
        <div className="absolute left-1/2 top-1.5 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-night" />
        <div className="h-[540px] overflow-hidden rounded-[2rem] bg-background text-foreground">
          <div className="flex items-center justify-between bg-primary px-4 pb-2.5 pt-6 text-primary-foreground">
            <span className="font-display text-sm font-bold">Pequenos na Fé</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/15 px-2 py-0.5 text-[11px] font-bold">
              <Star className="h-3 w-3 text-gold" fill="currentColor" /> 12
            </span>
          </div>
          <div className="h-[calc(540px-56px-60px)] overflow-y-auto">
            {tab === "historia" && <StoryTab onQuiz={() => setTab("quiz")} />}
            {tab === "quiz" && <QuizTab />}
            {tab === "memoria" && <MemoryTab />}
            {tab === "jornada" && <JourneyTab />}
          </div>
          <nav className="grid h-[60px] grid-cols-4 border-t bg-card" aria-label="Navegação da demonstração">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-pressed={tab === t.id}
                className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold transition ${tab === t.id ? "text-cta" : "text-muted-foreground"}`}
              >
                <t.icon className="h-5 w-5" />
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <p className="mt-4 text-center text-xs font-semibold text-night-foreground/70">
        Demonstração interativa • toque nas abas e experimente
      </p>
    </div>
  );
}

function StoryTab({ onQuiz }: { onQuiz: () => void }) {
  const [page, setPage] = useState(0);
  const last = page === PAGES.length - 1;
  const current = PAGES[page] ?? PAGES[0]!;
  return (
    <div className="p-3.5">
      <div key={page} className="animate-page-turn overflow-hidden rounded-2xl border bg-card shadow-card-soft">
        <img src={storyNoah} alt="Ilustração da Arca de Noé" width={944} height={704} loading="lazy" className="h-40 w-full object-cover" style={{ objectPosition: `${20 + page * 20}% center` }} />
        <div className="paper p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-cta">A Arca de Noé • {page + 1}/{PAGES.length}</p>
          <p className="mt-1.5 font-display text-lg font-semibold leading-snug text-foreground">{current.text}</p>
          <p className="mt-2 text-xs font-semibold text-muted-foreground">{current.hint}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <button type="button" aria-label="Página anterior" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="flex h-11 w-11 items-center justify-center rounded-full border bg-card disabled:opacity-30">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-1.5">
          {PAGES.map((_, i) => (
            <span key={i} className={`h-2 rounded-full transition-all ${i === page ? "w-6 bg-cta" : "w-2 bg-border"}`} />
          ))}
        </div>
        {last ? (
          <button type="button" onClick={onQuiz} className="animate-pop-in rounded-full bg-gradient-cta px-4 py-2.5 text-xs font-black text-cta-foreground">
            Fazer o quiz →
          </button>
        ) : (
          <button type="button" aria-label="Próxima página" onClick={() => setPage((p) => p + 1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-cta text-cta-foreground">
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

const QUESTION = {
  q: "O que Deus colocou no céu como sinal da sua promessa?",
  options: ["Uma estrela gigante", "Um arco-íris", "Uma nuvem dourada"],
  answer: 1,
};

function QuizTab() {
  const [picked, setPicked] = useState<number | null>(null);
  const correct = picked === QUESTION.answer;
  return (
    <div className="p-4">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-cta">Quiz bíblico • pergunta 1</p>
      <h4 className="mt-1.5 font-display text-xl font-semibold leading-snug">{QUESTION.q}</h4>
      <div className="mt-4 space-y-2.5">
        {QUESTION.options.map((opt, i) => {
          const state = picked === null ? "idle" : i === QUESTION.answer ? "right" : picked === i ? "wrong" : "idle";
          return (
            <button
              key={opt}
              type="button"
              disabled={picked !== null}
              onClick={() => setPicked(i)}
              className={`flex w-full items-center justify-between rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-bold transition ${
                state === "right" ? "border-success bg-success/10" : state === "wrong" ? "border-destructive bg-destructive/10" : "border-border bg-card hover:border-cta"
              }`}
            >
              {opt}
              {state === "right" && <Check className="h-5 w-5 text-success" />}
              {state === "wrong" && <X className="h-5 w-5 text-destructive" />}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="animate-pop-in mt-4 rounded-2xl bg-night p-4 text-center text-night-foreground">
          <p className="font-display text-lg font-bold">{correct ? "Muito bem! ⭐ +1 estrela" : "Quase! Era o arco-íris 🌈"}</p>
          <p className="mt-1 text-xs opacity-80">Deus sempre cumpre o que promete.</p>
          <button type="button" onClick={() => setPicked(null)} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-gold">
            <RotateCcw className="h-3.5 w-3.5" /> Tentar de novo
          </button>
        </div>
      )}
    </div>
  );
}

const SYMBOLS = ["🕊️", "🌈", "🦁", "⭐"];

function shuffled(): string[] {
  const arr = [...SYMBOLS, ...SYMBOLS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

function MemoryTab() {
  const [seed, setSeed] = useState(0);
  const deck = useMemo(() => (seed === 0 ? [...SYMBOLS, ...SYMBOLS.slice().reverse()] : shuffled()), [seed]);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);

  function flip(i: number) {
    if (open.length === 2 || open.includes(i) || matched.includes(i)) return;
    const next = [...open, i];
    setOpen(next);
    if (next.length === 2) {
      const [a, b] = next as [number, number];
      setTimeout(() => {
        if (deck[a] === deck[b]) setMatched((m) => [...m, a, b]);
        setOpen([]);
      }, 650);
    }
  }
  const done = matched.length === deck.length;
  return (
    <div className="p-4">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-cta">Jogo da memória</p>
      <h4 className="mt-1 font-display text-lg font-semibold">Encontre os pares da criação</h4>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {deck.map((s, i) => {
          const shown = open.includes(i) || matched.includes(i);
          return (
            <button
              key={`${seed}-${i}`}
              type="button"
              onClick={() => flip(i)}
              aria-label={shown ? s : "Carta virada"}
              className={`flex aspect-[3/4] items-center justify-center rounded-xl text-2xl transition-all duration-300 ${
                shown ? "bg-card shadow-card-soft" : "bg-night-sky text-gold"
              } ${matched.includes(i) ? "ring-2 ring-success" : ""}`}
            >
              {shown ? s : "✦"}
            </button>
          );
        })}
      </div>
      {done ? (
        <div className="animate-pop-in mt-4 rounded-2xl bg-gold/25 p-3 text-center">
          <p className="font-display font-bold">Você conseguiu! 🎉</p>
          <button type="button" onClick={() => { setSeed((x) => x + 1); setMatched([]); }} className="mt-1 text-xs font-bold text-cta">
            Jogar de novo
          </button>
        </div>
      ) : (
        <p className="mt-4 text-center text-xs font-semibold text-muted-foreground">Toque em duas cartas</p>
      )}
    </div>
  );
}

function JourneyTab() {
  return (
    <div className="p-4">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-cta">Jornada de 30 dias</p>
      <h4 className="mt-1 font-display text-lg font-semibold">Uma pequena aventura por dia</h4>
      <img src={storyDavid} alt="Ilustração de Davi" width={944} height={704} loading="lazy" className="mt-3 h-24 w-full rounded-2xl object-cover" />
      <div className="mt-3 grid grid-cols-5 gap-1.5">
        {Array.from({ length: 15 }).map((_, i) => {
          const d = i + 1;
          const done = d < 4;
          const active = d === 4;
          return (
            <div
              key={d}
              className={`flex aspect-square items-center justify-center rounded-xl text-xs font-black ${
                done ? "bg-success/15 text-success" : active ? "animate-cta-glow bg-gradient-cta text-cta-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {done ? "✓" : d}
            </div>
          );
        })}
      </div>
      <p className="mt-3 rounded-xl bg-surface-sky p-2.5 text-xs font-semibold">Dia 4: Davi e Golias — coragem que vem de Deus.</p>
    </div>
  );
}
