import { CHECKOUT_CONFIG } from "@/lib/checkout-config";
import type { TrackingParams } from "@/lib/checkout-validation";

const STORAGE_KEY = "pnf_attribution_v1";
const FIRED_EVENTS_KEY = "pnf_fired_events_v1";
const TRACKED_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "src",
  "sck",
] as const;

declare global {
  interface Window {
    _fbq?: unknown;
    __pnfMetaPixelLoaded?: boolean;
    __pnfLowTrackLoaded?: boolean;
  }
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${encodeURIComponent(name)}=`));
  if (!match) return undefined;
  const value = match.split("=").slice(1).join("=");
  return value ? decodeURIComponent(value) : undefined;
}

/** Captura e persiste parâmetros UTM, fbclid, _fbc e _fbp durante toda a jornada de compra. */
export function captureAndGetAttribution(): TrackingParams {
  if (typeof window === "undefined") return {};

  let stored: TrackingParams = {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      stored = JSON.parse(raw) as TrackingParams;
    }
  } catch {
    stored = {};
  }

  const params = new URLSearchParams(window.location.search);
  const next: TrackingParams = { ...stored };

  for (const key of TRACKED_KEYS) {
    const val = params.get(key);
    if (val) {
      next[key] = val.slice(0, 255);
    }
  }

  const fbpCookie = readCookie("_fbp");
  if (fbpCookie) next.fbp = fbpCookie;

  const fbcCookie = readCookie("_fbc");
  if (fbcCookie) {
    next.fbc = fbcCookie;
  } else if (next.fbclid && !next.fbc) {
    next.fbc = `fb.1.${Date.now()}.${next.fbclid}`;
  }

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // sessionStorage pode estar indisponível em modo privado restrito
  }

  return next;
}

/** Gera um event_id consistente para deduplicação entre Pixel (navegador) e CAPI (servidor). */
export function generateEventId(prefix: string): string {
  const rand =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}_${rand}`;
}

/** Inicializa Meta Pixel (VITE_META_PIXEL_ID) e LowTrack pixel.js (VITE_LOWTRACK_PIXEL_URL) apenas fora de rotas infantis. */
export function initMarketingScripts(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const metaPixelId =
    (import.meta.env["VITE_META_PIXEL_ID"] as string | undefined)?.trim() ||
    CHECKOUT_CONFIG.metaPixelId;

  if (metaPixelId && !window.__pnfMetaPixelLoaded) {
    window.__pnfMetaPixelLoaded = true;
    const fbqFn: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
      push?: (...args: unknown[]) => void;
    } = function (...args: unknown[]) {
      if (fbqFn.callMethod) {
        fbqFn.callMethod(...args);
      } else {
        fbqFn.queue?.push(args);
      }
    };
    fbqFn.queue = [];
    fbqFn.loaded = true;
    fbqFn.version = "2.0";
    fbqFn.push = fbqFn;
    if (!window.fbq) {
      window.fbq = fbqFn;
      window._fbq = fbqFn;
    }
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
    window.fbq("init", metaPixelId);
  }

  const lowTrackPixelUrl = (
    import.meta.env["VITE_LOWTRACK_PIXEL_URL"] as string | undefined
  )?.trim();
  if (lowTrackPixelUrl && !window.__pnfLowTrackLoaded) {
    window.__pnfLowTrackLoaded = true;
    const script = document.createElement("script");
    script.async = true;
    script.src = lowTrackPixelUrl;
    document.head.appendChild(script);
  }
}

function hasFiredOnce(key: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.sessionStorage.getItem(FIRED_EVENTS_KEY);
    const list: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    return list.includes(key);
  } catch {
    return false;
  }
}

function markFiredOnce(key: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.sessionStorage.getItem(FIRED_EVENTS_KEY);
    const list: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    if (!list.includes(key)) {
      list.push(key);
      window.sessionStorage.setItem(FIRED_EVENTS_KEY, JSON.stringify(list));
    }
  } catch {
    // ignora falha de storage
  }
}

export function trackPageView(): string {
  const eventId = generateEventId("pv");
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "PageView", {}, { eventID: eventId });
  }
  return eventId;
}

export function trackViewContent(): string {
  const eventId = generateEventId("vc");
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(
      "track",
      "ViewContent",
      {
        content_name: CHECKOUT_CONFIG.productName,
        content_type: "product",
        currency: CHECKOUT_CONFIG.currency,
        value: CHECKOUT_CONFIG.priceBRL,
      },
      { eventID: eventId },
    );
  }
  return eventId;
}

export function trackInitiateCheckoutEvent(valueBRL: number, placement?: string): string {
  const eventId = generateEventId("ic");
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(
      "track",
      "InitiateCheckout",
      {
        content_name: CHECKOUT_CONFIG.productName,
        content_type: "product",
        currency: CHECKOUT_CONFIG.currency,
        value: valueBRL,
        ...(placement ? { content_category: placement } : {}),
      },
      { eventID: eventId },
    );
  }
  return eventId;
}

export function trackAddPaymentInfoEvent(
  paymentMethod: "pix" | "credit_card",
  valueBRL: number,
): string {
  const eventId = generateEventId("api");
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(
      "track",
      "AddPaymentInfo",
      {
        content_name: CHECKOUT_CONFIG.productName,
        currency: CHECKOUT_CONFIG.currency,
        value: valueBRL,
        payment_method: paymentMethod,
      },
      { eventID: eventId },
    );
  }
  return eventId;
}

/**
 * Dispara Purchase no navegador EXCLUSIVAMENTE após confirmação real (status === "paid") no servidor,
 * usando o mesmo event_id ("purchase_" + orderId) que o servidor envia na Meta CAPI para deduplicação.
 */
export function trackConfirmedPurchaseEvent(orderId: string, amountBRL: number): boolean {
  const dedupKey = `purchase_${orderId}`;
  if (hasFiredOnce(dedupKey)) return false;
  markFiredOnce(dedupKey);

  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(
      "track",
      "Purchase",
      {
        content_name: CHECKOUT_CONFIG.productName,
        content_type: "product",
        currency: CHECKOUT_CONFIG.currency,
        value: amountBRL,
      },
      { eventID: dedupKey },
    );
  }
  return true;
}