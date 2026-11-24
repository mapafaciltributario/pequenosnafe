/**
 * Configuração centralizada do checkout próprio (Cakto), order bumps, parâmetros UTM e rastreamento.
 */
export interface OrderBumpConfig {
  id: string;
  /** ID da oferta na Cakto (ou oferta combinada configurada no servidor) */
  caktoOfferId: string;
  name: string;
  description: string;
  priceBRL: number;
  compareAtPriceBRL?: number;
  imageUrl: string;
  imageAlt: string;
  badge?: string;
  enabled: boolean;
}

/**
 * Estrutura modular para futuras ofertas complementares (Order Bumps).
 * Mantenha vazio até configurar os produtos complementares reais na Cakto.
 * Quando itens com enabled: true forem adicionados, o bloco aparecerá automaticamente no checkout.
 */
export const ORDER_BUMPS: readonly OrderBumpConfig[] = [];

export const CHECKOUT_CONFIG = {
  brandName: "Pequenos na Fé",
  productName: "Pequenos na Fé — Acesso Completo ao Plano Principal",
  productShortName: "Pequenos na Fé — Plano Principal",
  priceBRL: 9.9,
  priceFormatted: "R$ 9,90",
  currency: "BRL" as const,
  /** Rota interna do checkout próprio */
  checkoutPath: "/checkout",
  /** Rota interna da página de confirmação pós-pagamento */
  thankYouPath: "/obrigado",
  /** Opcional: preencha o ID do Meta Pixel para ativar PageView / InitiateCheckout */
  metaPixelId: "",
  supportEmail: "suporte@pequenosnafe.com.br",
  supportHours: "Segunda a sexta, das 9h às 18h (horário de Brasília)",
  guaranteeDays: 7,
  maxInstallments: 1,
  bonusesSummary: [
    "Meu Primeiro Livro de Orações",
    "Pequenos Artistas da Bíblia",
    "Desafio Cristão em Família",
    "Cartões de Valores Cristãos",
  ] as const,
  /**
   * Ative somente quando os preços abaixo forem valores reais pelos quais cada
   * material é (ou foi) vendido separadamente. Desativado = mostra só "Incluso".
   */
  showBonusReferencePrices: false,
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

/** Retorna os order bumps ativos configurados. */
export function getActiveOrderBumps(): readonly OrderBumpConfig[] {
  return ORDER_BUMPS.filter((bump) => bump.enabled);
}

/** Calcula o valor total do pedido (produto principal + order bumps selecionados). */
export function calculateCheckoutTotal(selectedBumpIds: readonly string[]): number {
  const activeBumps = getActiveOrderBumps();
  let total = CHECKOUT_CONFIG.priceBRL;
  for (const id of selectedBumpIds) {
    const bump = activeBumps.find((item) => item.id === id);
    if (bump) {
      total += bump.priceBRL;
    }
  }
  return Math.round(total * 100) / 100;
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
 * Monta a URL interna do checkout próprio (/checkout) preservando os parâmetros UTM/fbclid da visita atual.
 */
export function buildCheckoutUrl(currentSearch: string, placement?: string): string {
  const incoming = new URLSearchParams(currentSearch);
  const outgoing = new URLSearchParams();

  for (const key of TRACKED_PARAMS) {
    const value = incoming.get(key);
    if (value) {
      outgoing.set(key, value);
    }
  }

  if (placement && !outgoing.has("src")) {
    outgoing.set("src", placement);
  }

  const query = outgoing.toString();
  return query ? `${CHECKOUT_CONFIG.checkoutPath}?${query}` : CHECKOUT_CONFIG.checkoutPath;
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