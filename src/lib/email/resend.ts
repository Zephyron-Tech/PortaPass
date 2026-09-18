export type SendLeadEmailParams = {
  hotel: string;
  email: string;
  phone: string;
  message: string;
  submissionId: string;
};

export type SendLeadEmailResult = { ok: true } | { ok: false; error: string; status: number };

export async function sendLeadEmail({ hotel, email, phone, message, submissionId }: SendLeadEmailParams): Promise<SendLeadEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "Formulář teď nemůže odesílat. Napište nám prosím e-mailem.", status: 503 };
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `portapass-lead/${submissionId}`,
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
      return { ok: false, error: "Odeslání se nezdařilo. Zkuste to znovu, nebo nám napište e-mailem.", status: 502 };
    }
    const result: unknown = await response.json();
    if (!result || typeof result !== "object" || !("id" in result) || typeof result.id !== "string" || !result.id) {
      throw new Error("Unexpected provider response");
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Odeslání se nepodařilo potvrdit. Zkuste to znovu, nebo nám napište e-mailem.", status: 502 };
  }
}
