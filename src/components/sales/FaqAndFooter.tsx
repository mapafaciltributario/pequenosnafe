import { ChevronDown, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { CHECKOUT_CONFIG } from "@/lib/checkout-config";
import { CheckoutButton } from "./CheckoutButton";

const FAQS = [
  {
    q: "Preciso baixar ou instalar algum aplicativo no celular?",
    a: "Não. O Pequenos na Fé é um aplicativo web interativo que funciona direto no navegador do celular, tablet ou computador, sem ocupar a memória do aparelho.",
  },
  {
    q: "Para qual faixa etária o Pequenos na Fé foi desenvolvido?",
    a: "O conteúdo foi pensado especialmente para crianças de aproximadamente 4 a 8 anos, com linguagem simples, ilustrações amigáveis e atividades que podem ser feitas sozinhas ou junto com os pais.",
  },
  {
    q: "O valor de R$ 9,90 é mensal ou pagamento único?",
    a: "É pagamento único de R$ 9,90 para o acesso completo ao Plano Principal, incluindo os 4 bônus exclusivos. Não há mensalidades nem cobranças recorrentes.",
  },
  {
    q: "Como recebo o acesso após finalizar a compra?",
    a: "Assim que o pagamento for confirmado pela plataforma Cakto, você recebe as instruções de acesso diretamente no e-mail informado na compra.",
  },
  {
    q: "E se eu achar que não faz sentido para a minha família?",
    a: `Você conta com ${CHECKOUT_CONFIG.guaranteeDays} dias de garantia. Se dentro desse prazo decidir não continuar, basta solicitar o reembolso conforme as condições da compra pelo suporte.`,
  },
];

export function FaqAndFooter() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <>
      <section className="bg-surface-sky py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div data-reveal="scale" className="flex flex-col items-center gap-5 rounded-3xl border bg-card p-6 text-center shadow-card-soft sm:flex-row sm:p-7 sm:text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cta/15 text-cta">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                Compra protegida com {CHECKOUT_CONFIG.guaranteeDays} dias de garantia
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Pagamento processado com segurança e privacidade pela Cakto. Você tem {CHECKOUT_CONFIG.guaranteeDays} dias após a confirmação da compra para avaliar o material com seus filhos e solicitar reembolso pelo suporte se preferir não continuar.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 data-reveal="up" className="text-center font-display text-3xl font-bold text-foreground sm:text-4xl">
            Perguntas frequentes
          </h2>
          <div data-reveal="up" className="mt-6 space-y-2.5">
            {FAQS.map((item, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div key={item.q} className="overflow-hidden rounded-2xl border bg-card">
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-display text-base font-semibold text-foreground sm:px-6 sm:text-lg"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-primary transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen ? (
                    <div className="border-t px-5 py-4 text-sm leading-relaxed text-muted-foreground sm:px-6 sm:text-base">
                      {item.a}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div data-reveal="up" className="mt-9 text-center">
            <CheckoutButton
              label="Quero começar hoje por R$ 9,90"
              sublabel="Pagamento único • Acesso digital • 4 bônus por R$ 0,00"
              placement="faq_bottom"
              highlight
            />
          </div>
        </div>
      </section>

      <footer className="border-t bg-card py-8">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <p className="font-display text-lg font-bold text-foreground">Pequenos na Fé</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Produto digital de educação infantil cristã • Pagamento único de {CHECKOUT_CONFIG.priceFormatted}
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5 text-primary" />
            <span>Suporte: {CHECKOUT_CONFIG.supportEmail}</span>
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-xs text-muted-foreground/80">
            As telas exibidas nesta página são representações conceituais da experiência prevista para o aplicativo web Pequenos na Fé.
          </p>
        </div>
      </footer>
    </>
  );
}