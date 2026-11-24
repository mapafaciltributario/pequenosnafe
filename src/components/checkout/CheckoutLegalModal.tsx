import { X } from "lucide-react";
import { CHECKOUT_CONFIG } from "@/lib/checkout-config";

export type LegalDocType = "privacy" | "terms" | null;

interface CheckoutLegalModalProps {
  doc: LegalDocType;
  onClose: () => void;
}

export function CheckoutLegalModal({ doc, onClose }: CheckoutLegalModalProps) {
  if (!doc) return null;

  const isPrivacy = doc === "privacy";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="max-h-[82vh] w-full max-w-lg overflow-y-auto rounded-3xl border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b pb-4">
          <h2 id="legal-modal-title" className="font-display text-xl font-bold text-foreground">
            {isPrivacy ? "Política de Privacidade" : "Termos de Compra e Garantia"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-xl p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
          {isPrivacy ? (
            <>
              <p>
                O <strong className="text-foreground">Pequenos na Fé</strong> coleta apenas os
                dados estritamente necessários do responsável adulto (nome completo, e-mail, CPF e
                telefone) para processar a compra pela processadora{" "}
                <strong className="text-foreground">Cakto</strong>, emitir comprovantes e enviar o
                acesso digital.
              </p>
              <p>
                Não solicitamos nem armazenamos dados pessoais das crianças no checkout. Os dados
                de cartão de crédito são tokenizados diretamente no navegador pelo SDK oficial da
                Cakto e nunca trafegam nem ficam salvos em nossos servidores.
              </p>
              <p>
                Em conformidade com a LGPD (Lei nº 13.709/2018), você pode solicitar informações,
                correção ou exclusão de seus dados pelo e-mail{" "}
                <strong className="text-foreground">{CHECKOUT_CONFIG.supportEmail}</strong>.
              </p>
            </>
          ) : (
            <>
              <p>
                Ao concluir a compra, você adquire acesso digital único ao{" "}
                <strong className="text-foreground">{CHECKOUT_CONFIG.productShortName}</strong>{" "}
                pelo valor único de{" "}
                <strong className="text-foreground">{CHECKOUT_CONFIG.priceFormatted}</strong>, sem
                mensalidades nem cobranças recorrentes, incluindo os 4 bônus digitais descritos na
                oferta.
              </p>
              <p>
                O acesso é liberado exclusivamente após a confirmação real do pagamento pela Cakto
                e enviado para o e-mail cadastrado no checkout.
              </p>
              <p>
                Você dispõe de{" "}
                <strong className="text-foreground">
                  {CHECKOUT_CONFIG.guaranteeDays} dias de garantia
                </strong>{" "}
                a partir da confirmação da compra. Para solicitar reembolso dentro do prazo, envie
                mensagem para{" "}
                <strong className="text-foreground">{CHECKOUT_CONFIG.supportEmail}</strong>.
              </p>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-primary px-5 py-2.5 font-display text-sm font-semibold text-primary-foreground transition hover:brightness-105"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}