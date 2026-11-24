/**
 * Configuração centralizada do checkout externo (Cakto), parâmetros UTM e Meta Pixel.
 * Substitua CHECKOUT_BASE_URL pelo link real do checkout da Cakto quando estiver ativo.
 */
export const CHECKOUT_CONFIG = {
  productName: "Pequenos na Fé — Acesso Completo ao Plano Principal",
  priceBRL: 9.9,
  priceFormatted: "R$ 9,90",
  /** Substitua pelo link real de checkout na Cakto */
  checkoutBaseUrl: "https://pay.cakto.com.br/pequenos-na-fe",
  /** Opcional: preencha o ID do Meta Pixel para ativar PageView / InitiateCheckout */
  metaPixelId: "",
  supportEmail: "suporte@pequenosnafe.com.br",
  guaranteeDays: 7,
  /**
   * Ative somente quando os preços abaixo forem valores reais pelos quais cada
   * material é (ou foi) vendido separadamente. Desativado = mostra só "Incluso".
   */
  showBonusReferencePrices: true,
  /**
   * Preço individual de referência de cada bônus (em reais). Use null para um
   * bônus sem preço avulso comprovável: ele volta a exibir só "Incluso".
   */
  bonusReferencePrices: {
    livro: 12.9,
    pintura: 9.9,
    desafio: 14.9,
    cartoes: 10.2,
  } as Record<string, number | null>,
};

export function formatBRL(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

/** Preço riscado de um bônus, ou null quando não deve ser exibido. */
export function getBonusReferencePrice(id: string): number | null {
  if (!CHECKOUT_CONFIG.showBonusReferencePrices) return null;
  const v = CHECKOUT_CONFIG.bonusReferencePrices[id];
  return typeof v === "number" && v > 0 ? v : null;
}

/** Soma dos preços de referência; só existe quando todos os bônus têm preço válido. */
export function getBonusTotalReference(ids: readonly string[]): number | null {
  let total = 0;
  for (const id of ids) {
    const v = getBonusReferencePrice(id);
    if (v === null) return null;
    total += v;
  }
  return Math.round(total * 100) / 100;
}

const TRACKED_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "src",
  "sck",
] as const;

/**
 * Monta a URL final de checkout preservando os parâmetros UTM/fbclid da visita atual.
 */
export function buildCheckoutUrl(currentSearch: string, placement?: string): string {
  const destination = new URL(CHECKOUT_CONFIG.checkoutBaseUrl);
  const incoming = new URLSearchParams(currentSearch);

  for (const key of TRACKED_PARAMS) {
    const value = incoming.get(key);
    if (value) {
      destination.searchParams.set(key, value);
    }
  }

  if (placement && !destination.searchParams.has("src")) {
    destination.searchParams.set("src", placement);
  }

  return destination.toString();
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Dispara InitiateCheckout no Meta Pixel apenas se o Pixel estiver configurado e carregado.
 * Nunca dispara evento Purchase no cliente sem confirmação real de pagamento.
 */
export function trackInitiateCheckout(placement: string): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }
  window.fbq("track", "InitiateCheckout", {
    content_name: CHECKOUT_CONFIG.productName,
    currency: "BRL",
    value: CHECKOUT_CONFIG.priceBRL,
    content_category: placement,
  });
}