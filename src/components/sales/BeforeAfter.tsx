import { useState } from "react";

const ROWS = [
  ["Vídeo atrás de vídeo, sem saber o que vem depois", "Histórias bíblicas escolhidas para a idade dele"],
  ["A criança só assiste", "A criança lê, responde, joga e pinta"],
  ["Você não sabe o que ela aprendeu", "Você vê o progresso na área dos pais"],
  ["Tempo de tela que só passa", "Tempo de tela que vira conversa sobre Jesus"],
] as const;

/** Comparação arrastável: mesma tarde, duas experiências. */
export function BeforeAfter() {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative mx-auto max-w-3xl select-none overflow-hidden rounded-3xl border shadow-book">
      <Panel tone="before" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }} aria-hidden="true">
        <Panel tone="after" />
      </div>
      <div className="pointer-events-none absolute inset-y-0 w-1 bg-gold shadow-glow" style={{ left: `calc(${pos}% - 2px)` }}>
        <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-gold text-sm font-black text-accent-foreground shadow-glow">
          ⇆
        </span>
      </div>
      <input
        type="range"
        min={8}
        max={92}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Arraste para comparar as duas tardes"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}

function Panel({ tone }: { tone: "before" | "after" }) {
  const after = tone === "after";
  return (
    <div className={`${after ? "bg-night-sky text-night-foreground" : "bg-muted text-muted-foreground"} p-5 sm:p-8`}>
      <p className={`text-xs font-black uppercase tracking-[0.2em] ${after ? "text-gold" : ""}`}>
        {after ? "A mesma tarde, com Pequenos na Fé" : "Uma tarde de tela qualquer"}
      </p>
      <ul className="mt-4 space-y-3.5">
        {ROWS.map(([b, a]) => (
          <li key={b} className={`flex items-start gap-3 min-h-[2.8em] font-display text-base leading-snug sm:text-lg font-semibold`}>
            <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${after ? "bg-gold text-accent-foreground" : "bg-border"}`}>
              {after ? "✓" : "–"}
            </span>
            {after ? a : b}
          </li>
        ))}
      </ul>
    </div>
  );
}
