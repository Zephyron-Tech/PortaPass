export type LeadInput = {
  hotel: string;
  email: string;
  phone: string;
  message: string;
  submissionId: string;
};

export type LeadValidationResult =
  | { ok: true; value: LeadInput }
  | { ok: false; error: string; status: number; fields?: Record<string, string> };

export function validateLeadInput(input: Record<string, unknown>): LeadValidationResult {
  if (typeof input.website !== "string" || input.website.trim()) {
    return { ok: false, error: "Požadavek není povolený. Obnovte stránku a zkuste to znovu.", status: 400 };
  }
  const hotel = typeof input.hotel === "string" ? input.hotel.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const phone = typeof input.phone === "string" ? input.phone.trim() : "";
  const message = typeof input.message === "string" ? input.message.trim() : "";
  const fields: Record<string, string> = {};
  if (hotel.length < 2 || hotel.length > 160 || /[\r\n\x00-\x1f]/.test(hotel)) fields.hotel = "Zadejte název hotelu (2 až 160 znaků).";
  if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || /[\x00-\x1f\x7f]/.test(email)) fields.email = "Zadejte platný e-mail.";
  if (typeof input.phone !== "string" || phone.length > 40 || (phone && (!/^[+\d\s()./\-]+$/.test(phone) || phone.replace(/\D/g, "").length < 6 || /[\r\n\x00-\x1f]/.test(phone)))) fields.phone = "Zadejte platné telefonní číslo, nebo pole nechte prázdné.";
  if (typeof input.message !== "string" || message.length > 2000 || /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(message)) fields.message = "Zpráva může mít nejvýše 2 000 znaků.";
  if (Object.keys(fields).length) return { ok: false, error: "Zkontrolujte prosím vyplněné údaje.", status: 400, fields };
  if (typeof input.submissionId !== "string" || !/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(input.submissionId)) {
    return { ok: false, error: "Obnovte stránku a zkuste formulář odeslat znovu.", status: 400 };
  }
  return { ok: true, value: { hotel, email, phone, message, submissionId: input.submissionId } };
}
