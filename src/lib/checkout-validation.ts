import { z } from "zod";

/** Remove todos os caracteres não numéricos. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Máscara brasileira de CPF: 000.000.000-00 */
export function formatCpf(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** Máscara brasileira de telefone com DDD: (11) 99999-9999 ou (11) 3333-4444 */
export function formatPhoneBR(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Converte telefone BR (10 ou 11 dígitos) para formato E.164 exigido pela Cakto (5511999999999). */
export function toCaktoPhoneE164(value: string): string {
  const d = onlyDigits(value);
  if (d.startsWith("55") && (d.length === 12 || d.length === 13)) {
    return d;
  }
  return `55${d}`;
}

/** Máscara de número de cartão: 0000 0000 0000 0000 */
export function formatCardNumber(value: string): string {
  const d = onlyDigits(value).slice(0, 19);
  return d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

/** Máscara de validade do cartão: MM/AA */
export function formatCardExpiry(value: string): string {
  const d = onlyDigits(value).slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

/** Valida CPF brasileiro (dígitos verificadores oficiais). */
export function isValidCpf(raw: string): boolean {
  const cpf = onlyDigits(raw);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(cpf[i]) * (10 - i);
  }
  let check1 = (sum * 10) % 11;
  if (check1 === 10) check1 = 0;
  if (check1 !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(cpf[i]) * (11 - i);
  }
  let check2 = (sum * 10) % 11;
  if (check2 === 10) check2 = 0;
  return check2 === Number(cpf[10]);
}

/** Algoritmo de Luhn recomendado pela documentação oficial da Cakto antes da tokenização. */
export function isValidCardLuhn(raw: string): boolean {
  const digits = onlyDigits(raw);
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (shouldDouble) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

/** Detecta a bandeira principal do cartão apenas para feedback visual no campo. */
export function detectCardBrand(raw: string): string | null {
  const d = onlyDigits(raw);
  if (!d) return null;
  if (/^4/.test(d)) return "Visa";
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(d)) return "Mastercard";
  if (/^3[47]/.test(d)) return "Amex";
  if (/^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(d)) {
    return "Elo";
  }
  if (/^(606282|3841)/.test(d)) return "Hipercard";
  return null;
}

/** Valida validade MM/AA garantindo mês entre 01-12 e cartão não vencido. */
export function parseAndValidateCardExpiry(raw: string): { month: string; year: string } | null {
  const digits = onlyDigits(raw);
  if (digits.length !== 4) return null;
  const monthNum = Number(digits.slice(0, 2));
  const yearTwoDigits = Number(digits.slice(2, 4));
  if (monthNum < 1 || monthNum > 12) return null;

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  if (yearTwoDigits < currentYear || (yearTwoDigits === currentYear && monthNum < currentMonth)) {
    return null;
  }
  return {
    month: digits.slice(0, 2),
    year: digits.slice(2, 4),
  };
}

export const buyerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, "Informe seu nome completo.")
    .max(120, "Nome muito longo.")
    .refine((v) => v.split(/\s+/).filter(Boolean).length >= 2, {
      message: "Informe nome e sobrenome.",
    }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Informe um e-mail válido para receber o acesso.")
    .max(254, "E-mail muito longo."),
  cpf: z
    .string()
    .trim()
    .refine((v) => isValidCpf(v), {
      message: "CPF inválido. Confira os 11 dígitos.",
    }),
  phone: z
    .string()
    .trim()
    .refine((v) => {
      const d = onlyDigits(v);
      return d.length === 10 || d.length === 11;
    }, "Informe um telefone com DDD (ex: (11) 99999-9999)."),
});

export type BuyerFormData = z.infer<typeof buyerSchema>;

export const trackingParamsSchema = z.object({
  utm_source: z.string().max(120).optional(),
  utm_medium: z.string().max(120).optional(),
  utm_campaign: z.string().max(120).optional(),
  utm_content: z.string().max(120).optional(),
  utm_term: z.string().max(120).optional(),
  fbclid: z.string().max(255).optional(),
  src: z.string().max(120).optional(),
  sck: z.string().max(120).optional(),
  fbp: z.string().max(120).optional(),
  fbc: z.string().max(255).optional(),
});

export type TrackingParams = z.infer<typeof trackingParamsSchema>;