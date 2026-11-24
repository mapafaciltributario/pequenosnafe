import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyCaktoWebhookRequest } from "@/lib/cakto.server";
import {
  buildCheckoutUrl,
  CHECKOUT_CONFIG,
  formatBRL,
  getBonusReferencePrice,
  getBonusTotalReference,
} from "@/lib/checkout-config";
import {
  formatCpf,
  formatPhoneBR,
  isValidCardLuhn,
  isValidCpf,
  toCaktoPhoneE164,
} from "@/lib/checkout-validation";

describe("checkout-config", () => {
  it("keeps the single-plan price at R$ 9,90", () => {
    expect(CHECKOUT_CONFIG.priceBRL).toBe(9.9);
    expect(CHECKOUT_CONFIG.priceFormatted).toBe("R$ 9,90");
  });

  it("preserves UTM and fbclid parameters in the internal /checkout URL", () => {
    const url = buildCheckoutUrl(
      "?utm_source=meta&utm_campaign=lancamento&fbclid=abc123&ignored=1",
      "hero",
    );
    const parsed = new URL(url, "https://pequenosnafe.com.br");
    expect(parsed.pathname).toBe("/checkout");
    expect(parsed.searchParams.get("utm_source")).toBe("meta");
    expect(parsed.searchParams.get("utm_campaign")).toBe("lancamento");
    expect(parsed.searchParams.get("fbclid")).toBe("abc123");
    expect(parsed.searchParams.get("src")).toBe("hero");
    expect(parsed.searchParams.get("ignored")).toBeNull();
  });

  it("sums the four bonus reference prices to R$ 47,90", () => {
    (CHECKOUT_CONFIG as { showBonusReferencePrices: boolean }).showBonusReferencePrices = true;
    expect(formatBRL(getBonusTotalReference(["livro", "pintura", "desafio", "cartoes"]) ?? 0)).toBe("R$ 47,90");
  });

  it("hides anchors when reference prices are disabled", () => {
    const cfg = CHECKOUT_CONFIG as { showBonusReferencePrices: boolean };
    cfg.showBonusReferencePrices = false;
    expect(getBonusReferencePrice("livro")).toBeNull();
    expect(getBonusTotalReference(["livro"])).toBeNull();
  });

  it("ships with bonus reference prices hidden (no invented anchors)", () => {
    expect(getBonusReferencePrice("livro")).toBeNull();
  });

  it("hides the total when any bonus has no real price", () => {
    CHECKOUT_CONFIG.bonusReferencePrices["extra"] = null;
    expect(getBonusTotalReference(["livro", "extra"])).toBeNull();
    delete CHECKOUT_CONFIG.bonusReferencePrices["extra"];
  });

  it("validates CPF, Luhn card numbers, and E.164 BR phone formatting", () => {
    expect(isValidCpf("52998224725")).toBe(true);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("52998224720")).toBe(false);
    expect(formatCpf("52998224725")).toBe("529.982.247-25");
    expect(formatPhoneBR("11987654321")).toBe("(11) 98765-4321");
    expect(toCaktoPhoneE164("(11) 98765-4321")).toBe("5511987654321");
    expect(isValidCardLuhn("4111 1111 1111 1111")).toBe(true);
    expect(isValidCardLuhn("4111 1111 1111 1112")).toBe(false);
  });

  it("verifies Cakto webhook HMAC-SHA256 signatures and rejects tampered payloads", () => {
    const secret = "whsec_test_secret_123";
    const rawBody = JSON.stringify({ event: "purchase_approved", data: { id: "ord_1", status: "paid" } });
    const ts = "1764000000";
    const sig = `v1=${createHmac("sha256", secret).update(`${ts}.${rawBody}`, "utf8").digest("hex")}`;

    expect(
      verifyCaktoWebhookRequest({
        rawBody,
        timestampHeader: ts,
        signatureHeader: sig,
        configuredSecret: secret,
        nowSeconds: 1764000030,
      }).valid,
    ).toBe(true);

    expect(
      verifyCaktoWebhookRequest({
        rawBody: rawBody.replace("paid", "refunded"),
        timestampHeader: ts,
        signatureHeader: sig,
        configuredSecret: secret,
        nowSeconds: 1764000030,
      }).valid,
    ).toBe(false);

    expect(
      verifyCaktoWebhookRequest({
        rawBody,
        timestampHeader: ts,
        signatureHeader: sig,
        configuredSecret: secret,
        nowSeconds: 1764001000,
      }).valid,
    ).toBe(false);
  });
});
