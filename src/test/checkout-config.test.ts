import { describe, expect, it } from "vitest";
import {
  buildCheckoutUrl,
  CHECKOUT_CONFIG,
  formatBRL,
  getBonusReferencePrice,
  getBonusTotalReference,
} from "@/lib/checkout-config";

describe("checkout-config", () => {
  it("keeps the single-plan price at R$ 9,90", () => {
    expect(CHECKOUT_CONFIG.priceBRL).toBe(9.9);
    expect(CHECKOUT_CONFIG.priceFormatted).toBe("R$ 9,90");
  });

  it("preserves UTM and fbclid parameters in the Cakto checkout URL", () => {
    const url = buildCheckoutUrl(
      "?utm_source=meta&utm_campaign=lancamento&fbclid=abc123&ignored=1",
      "hero",
    );
    const parsed = new URL(url);
    expect(parsed.searchParams.get("utm_source")).toBe("meta");
    expect(parsed.searchParams.get("utm_campaign")).toBe("lancamento");
    expect(parsed.searchParams.get("fbclid")).toBe("abc123");
    expect(parsed.searchParams.get("src")).toBe("hero");
    expect(parsed.searchParams.get("ignored")).toBeNull();
  });

  it("sums the four bonus reference prices to R$ 47,90", () => {
    expect(formatBRL(getBonusTotalReference(["livro", "pintura", "desafio", "cartoes"]) ?? 0)).toBe("R$ 47,90");
  });

  it("hides anchors when reference prices are disabled", () => {
    const cfg = CHECKOUT_CONFIG as { showBonusReferencePrices: boolean };
    cfg.showBonusReferencePrices = false;
    expect(getBonusReferencePrice("livro")).toBeNull();
    expect(getBonusTotalReference(["livro"])).toBeNull();
    cfg.showBonusReferencePrices = true;
  });

  it("hides the total when any bonus has no real price", () => {
    CHECKOUT_CONFIG.bonusReferencePrices["extra"] = null;
    expect(getBonusTotalReference(["livro", "extra"])).toBeNull();
    delete CHECKOUT_CONFIG.bonusReferencePrices["extra"];
  });
});
