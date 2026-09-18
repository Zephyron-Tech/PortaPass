import { createHash } from "node:crypto";
import { sendLeadEmail } from "../../../lib/email/resend.ts";
import { createRateLimiter } from "../../../lib/rate-limit.ts";
import { validateLeadInput } from "../../../lib/validation/leads.ts";

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_BODY_BYTES = 12_000;
const limiter = createRateLimiter(WINDOW_MS);

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

  // Only Vercel's overwritten client-IP header is trusted on Vercel. Other
  // deployments share a conservative bucket until their proxy is configured.
  const client = process.env.VERCEL === "1"
    ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() || "unknown"
    : "local";
  const bucket = createHash("sha256").update(client).digest("hex");
  const limit = limiter.check(bucket, 5, 5000);
  if (!limit.allowed) {
    return reply({ error: "Příliš mnoho pokusů. Zkuste to prosím později." }, 429, {
      "Retry-After": String(limit.retryAfterSeconds),
    });
  }

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

  const validated = validateLeadInput(input);
  if (!validated.ok) return reply({ error: validated.error, ...(validated.fields ? { fields: validated.fields } : {}) }, validated.status);

  const sent = await sendLeadEmail(validated.value);
  if (!sent.ok) return reply({ error: sent.error }, sent.status);
  return reply({ ok: true }, 200);
}
