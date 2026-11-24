/**
 * Wrapper browser-only para o SDK oficial da Cakto:
 * https://docs.cakto.com.br/sdk/visao-geral
 * Script oficial: https://cakto-sdk.pages.dev/cakto-sdk.min.js
 */

const CAKTO_SDK_SCRIPT_URL = "https://cakto-sdk.pages.dev/cakto-sdk.min.js";

export interface CaktoSdkCardInput {
  holderName?: string;
  cardNumber: string;
  cvv: string;
  expMonth: string;
  expYear: string;
}

export interface Cakto3DSResult {
  success: boolean;
  cavv?: string;
  eci?: string;
  xid?: string;
  referenceId?: string;
  version?: string;
  error?: string;
}

interface CaktoSDKInstance {
  initAntifraud: () => Promise<void>;
  completeAntifraudProfile: () => Promise<void>;
  getAntifraudReference: () => string;
  cleanupAntifraud: () => void;
  createToken: (card: CaktoSdkCardInput) => Promise<{ cardToken: string }>;
  authenticate3DS: (params: {
    card: CaktoSdkCardInput;
    customer: {
      amount: number;
      currency: string;
      email: string;
      name: string;
      phone: string;
      paymentMethod: "credit";
    };
  }) => Promise<Cakto3DSResult>;
}

declare global {
  interface Window {
    Cakto?: {
      CaktoSDK: new (config: { client_id: string }) => CaktoSDKInstance;
    };
  }
}

let sdkLoadPromise: Promise<void> | null = null;
let sdkSingleton: CaktoSDKInstance | null = null;
let sdkClientIdLoaded: string | null = null;
let antifraudStarted = false;

function loadCaktoScript(): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(new Error("Cakto SDK só pode ser executado no navegador."));
  }
  if (window.Cakto?.CaktoSDK) {
    return Promise.resolve();
  }
  if (sdkLoadPromise) {
    return sdkLoadPromise;
  }

  sdkLoadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${CAKTO_SDK_SCRIPT_URL}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Não foi possível carregar o SDK oficial da Cakto.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = CAKTO_SDK_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      if (window.Cakto?.CaktoSDK) {
        resolve();
      } else {
        reject(new Error("SDK da Cakto carregou sem expor window.Cakto."));
      }
    };
    script.onerror = () => {
      sdkLoadPromise = null;
      reject(new Error("Falha de conexão ao carregar o SDK oficial da Cakto."));
    };
    document.head.appendChild(script);
  });

  return sdkLoadPromise;
}

/** Obtém instância única do CaktoSDK na página (exigido pela documentação para antifraude). */
export async function getCaktoSdk(clientId: string): Promise<CaktoSDKInstance> {
  if (!clientId.trim()) {
    throw new Error("CAKTO_SDK_CLIENT_ID não configurado.");
  }
  await loadCaktoScript();
  if (!sdkSingleton || sdkClientIdLoaded !== clientId) {
    if (!window.Cakto?.CaktoSDK) {
      throw new Error("SDK da Cakto indisponível no navegador.");
    }
    sdkSingleton = new window.Cakto.CaktoSDK({ client_id: clientId });
    sdkClientIdLoaded = clientId;
    antifraudStarted = false;
  }
  return sdkSingleton;
}

/** Inicia coleta passiva antifraude no carregamento da página de checkout. */
export async function startCaktoAntifraud(clientId: string): Promise<boolean> {
  if (!clientId.trim() || typeof window === "undefined") return false;
  try {
    const sdk = await getCaktoSdk(clientId);
    if (!antifraudStarted) {
      await sdk.initAntifraud();
      antifraudStarted = true;
    }
    return true;
  } catch {
    return false;
  }
}

/** Gera um fingerprint estável para a sessão atual (campo customer.fingerprint da API Cakto). */
export function getOrCreateSessionFingerprint(): string {
  if (typeof window === "undefined") return "ssr-session";
  const key = "pnf_device_fp_v1";
  try {
    const existing = window.sessionStorage.getItem(key);
    if (existing) return existing;
    const created =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? `pnf_${crypto.randomUUID()}`
        : `pnf_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
    window.sessionStorage.setItem(key, created);
    return created;
  } catch {
    return `pnf_${Date.now()}`;
  }
}