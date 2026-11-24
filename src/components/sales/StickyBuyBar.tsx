import { useEffect, useState } from "react";
import { CheckoutButton } from "./CheckoutButton";

/** Barra fixa mobile: aparece após o topo e some na oferta/rodapé para não cobrir conteúdo. */
export function StickyBuyBar() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("topo");
    const hideTargets = ["oferta", "cta-final"].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const state = { pastHero: false, inHide: new Set<Element>() };
    const update = () => setVisible(state.pastHero && state.inHide.size === 0);
    const io1 = new IntersectionObserver(([e]) => { state.pastHero = !e?.isIntersecting; update(); });
    const io2 = new IntersectionObserver((entries) => {
      for (const e of entries) e.isIntersecting ? state.inHide.add(e.target) : state.inHide.delete(e.target);
      update();
    });
    if (hero) io1.observe(hero);
    hideTargets.forEach((t) => io2.observe(t));
    return () => { io1.disconnect(); io2.disconnect(); };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-night-2 bg-night/95 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur-md transition-transform duration-300 md:hidden ${visible ? "translate-y-0" : "translate-y-full"}`}
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0 text-night-foreground">
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Tudo por</p>
          <p className="font-display text-xl font-black leading-none text-gold">R$ 9,90</p>
        </div>
        <div className="flex-1">
          <CheckoutButton label="Quero o Pequenos na Fé" placement="sticky_mobile" fullWidth size="md" />
        </div>
      </div>
    </div>
  );
}
