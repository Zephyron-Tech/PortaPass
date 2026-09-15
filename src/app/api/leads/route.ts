import { createHash } from "node:crypto";

export const runtime = "nodejs";

// Best-effort per-instance backstop. Apply a distributed /api/leads limit at
// the hosting firewall too; serverless instances do not share this map.
const attempts = new Map<string, { count: number; expires: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_BODY_BYTES = 12_000;

export async function POST(request: Request) {
  const reply = (body: object, status: number, headers: Record<string, string> = {}) =>
    Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return reply({ error: "Požadavek není povolený. Obnovte stránku a zkuste to znovu." }, 403);
  }
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") {
    return reply({ error: "Neplatný formát požadavku." }, 415);
  }
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
    return reply({ error: "Zpráva je příliš dlouhá." }, 413);
  }

  const now = Date.now();
  for (const [key, value] of attempts) if (value.expires <= now) attempts.delete(key);
  // Only Vercel's overwritten client-IP header is trusted on Vercel. Other
  // deployments share a conservative bucket until their proxy is configured.
  const client = process.env.VERCEL === "1"
    ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() || "unknown"
    : "local";
  const bucket = createHash("sha256").update(client).digest("hex");
  const previous = attempts.get(bucket);
  if ((previous && previous.count >= 5) || (!previous && attempts.size >= 5000)) {
    return reply({ error: "Příliš mnoho pokusů. Zkuste to prosím později." }, 429, {
      "Retry-After": String(Math.max(1, Math.ceil(((previous?.expires ?? now + WINDOW_MS) - now) / 1000))),
    });
  }
  attempts.set(bucket, { count: (previous?.count ?? 0) + 1, expires: previous?.expires ?? now + WINDOW_MS });

  let input: Record<string, unknown>;
  try {
    const reader = request.body?.getReader();
    if (!reader) return reply({ error: "Vyplňte prosím formulář." }, 400);
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > MAX_BODY_BYTES) {
          await reader.cancel();
          return reply({ error: "Zpráva je příliš dlouhá." }, 413);
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid input");
    input = parsed as Record<string, unknown>;
  } catch {
    return reply({ error: "Vyplňte prosím formulář znovu." }, 400);
  }

  if (typeof input.website !== "string" || input.website.trim()) {
    return reply({ error: "Požadavek není povolený. Obnovte stránku a zkuste to znovu." }, 400);
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
  if (Object.keys(fields).length) return reply({ error: "Zkontrolujte prosím vyplněné údaje.", fields }, 400);
  if (typeof input.submissionId !== "string" || !/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(input.submissionId)) {
    return reply({ error: "Obnovte stránku a zkuste formulář odeslat znovu." }, 400);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return reply({ error: "Formulář teď nemůže odesílat. Napište nám prosím e-mailem." }, 503);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `portapass-lead/${input.submissionId}`,
      },
      body: JSON.stringify({
        from: process.env.LEADS_FROM || "PortaPass <hello@zephyron.tech>",
        to: [process.env.LEADS_TO || "hello@zephyron.tech"],
        reply_to: email,
        subject: "PortaPass: nová poptávka ukázky",
        text: `Hotel: ${hotel}\nE-mail: ${email}\nTelefon: ${phone || "Neuveden"}\n\nZpráva:\n${message || "Bez zprávy"}`,
      }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!response.ok) {
      // Never log form fields, credentials or the provider response body.
      console.error("Lead delivery rejected", { status: response.status });
      return reply({ error: "Odeslání se nezdařilo. Zkuste to znovu, nebo nám napište e-mailem." }, 502);
    }
    const result: unknown = await response.json();
    if (!result || typeof result !== "object" || !("id" in result) || typeof result.id !== "string" || !result.id) {
      throw new Error("Unexpected provider response");
    }
    return reply({ ok: true }, 200);
  } catch {
    return reply({ error: "Odeslání se nepodařilo potvrdit. Zkuste to znovu, nebo nám napište e-mailem." }, 502);
  }
}
