"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { CONTACT_MAILTO } from "@/lib/content";
import { CheckMark, WarningMark } from "@/components/marks";

const fields = [
  { name: "hotel", label: "Hotel nebo penzion", maxLength: 160, required: true, type: "text", autoComplete: "organization" },
  { name: "email", label: "Kontaktní e-mail", maxLength: 254, required: true, type: "email", autoComplete: "email" },
  { name: "phone", label: "Telefon (nepovinné)", maxLength: 40, required: false, type: "tel", autoComplete: "tel" },
  { name: "message", label: "Zpráva (nepovinné)", maxLength: 2000, required: false, type: "text", autoComplete: "off" },
] as const;

type FieldName = (typeof fields)[number]["name"];
type FieldErrors = Partial<Record<FieldName, string>>;

const fieldMessages: Record<FieldName, string> = {
  hotel: "Zadejte název hotelu.",
  email: "Zadejte platný e-mail.",
  phone: "Zadejte platné telefonní číslo.",
  message: "Zpráva je moc dlouhá.",
};

const failureMessage = "Poptávku se nepodařilo odeslat. Zkuste to prosím znovu nebo nám napište e-mailem.";
const validationMessage = "Zkontrolujte prosím označená pole.";
const rateLimitMessage = "Příliš mnoho pokusů. Zkuste to prosím za chvíli.";
const knownMessages = new Set([
  failureMessage,
  validationMessage,
  rateLimitMessage,
  ...Object.values(fieldMessages),
]);

export function LeadForm() {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const confirmationRef = useRef<HTMLParagraphElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const inFlight = useRef(false);
  const submissionRef = useRef<{ payload: string; id: string } | null>(null);
  const requestRef = useRef<{
    controller: AbortController;
    timer: ReturnType<typeof setTimeout>;
  } | null>(null);
  const errorFlashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  // Brief "Nepodařilo se" face on the button itself; the persistent error
  // message/details below is driven by `error` and does not auto-clear.
  const [errorFlash, setErrorFlash] = useState(false);
  const status = sentEmail !== null ? "success" : submitting ? "submitting" : errorFlash ? "error" : "idle";

  useEffect(() => () => {
    const request = requestRef.current;
    requestRef.current = null;
    if (request) {
      clearTimeout(request.timer);
      request.controller.abort();
    }
    if (errorFlashTimer.current !== null) clearTimeout(errorFlashTimer.current);
  }, []);

  useEffect(() => {
    // preventScroll: the fields are already on screen right where the user
    // just clicked submit — letting focus() auto-scroll them into view was
    // causing a jarring jump on every error. The ring is enough to show
    // where focus landed.
    if (sentEmail !== null) {
      confirmationRef.current?.focus({ preventScroll: true });
    } else if (!submitting && error) {
      // Wait for the disabled fieldset to be enabled before moving focus.
      const firstField = fields.find(({ name }) => fieldErrors[name]);
      const input = firstField && formRef.current?.elements.namedItem(firstField.name);
      if (input instanceof HTMLElement) input.focus({ preventScroll: true });
      else errorRef.current?.focus({ preventScroll: true });
    }
  }, [sentEmail, submitting, error, fieldErrors]);

  function flashError() {
    setErrorFlash(true);
    if (errorFlashTimer.current !== null) clearTimeout(errorFlashTimer.current);
    errorFlashTimer.current = setTimeout(() => setErrorFlash(false), 1800);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || sentEmail !== null) return;
    inFlight.current = true;
    const data = new FormData(event.currentTarget);
    const payload = {
      hotel: String(data.get("hotel") ?? "").trim(),
      email: String(data.get("email") ?? "").trim().toLowerCase(),
      phone: String(data.get("phone") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      website: String(data.get("website") ?? "").trim(),
    };
    setSubmitting(true);
    setError("");
    setFieldErrors({});
    setErrorFlash(false);
    if (errorFlashTimer.current !== null) clearTimeout(errorFlashTimer.current);
    const controller = new AbortController();
    const request = {
      controller,
      timer: setTimeout(() => controller.abort(), 20_000),
    };
    requestRef.current = request;

    try {
      const normalized = JSON.stringify(payload);
      // A timeout does not prove rejection: retries must keep the same ID.
      if (submissionRef.current?.payload !== normalized) {
        submissionRef.current = { payload: normalized, id: crypto.randomUUID() };
      }
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, submissionId: submissionRef.current.id }),
        signal: controller.signal,
      });
      const json: unknown = await res.json();
      if (requestRef.current !== request) return;
      if (controller.signal.aborted) throw new Error("Request timed out");
      const result = json && typeof json === "object" && !Array.isArray(json)
        ? json as Record<string, unknown>
        : null;

      if (res.ok && result?.ok === true) {
        setSentEmail(payload.email);
        return;
      }

      const errors: FieldErrors = {};
      if (result?.fields && typeof result.fields === "object" && !Array.isArray(result.fields)) {
        const serverFields = result.fields as Record<string, unknown>;
        for (const { name } of fields) {
          const message = serverFields[name];
          if (typeof message === "string" && message) {
            errors[name] = knownMessages.has(message) ? message : fieldMessages[name];
          }
        }
      }
      setFieldErrors(errors);
      setError(typeof result?.error === "string" && knownMessages.has(result.error)
        ? result.error
        : Object.keys(errors).length > 0
          ? validationMessage
          : res.status === 429 ? rateLimitMessage : failureMessage);
      flashError();
    } catch {
      if (requestRef.current !== request) return;
      setError(controller.signal.aborted
        ? "Odeslání se nepodařilo potvrdit do 20 sekund. Zkuste to prosím znovu se stejnými údaji nebo nám napište e-mailem."
        : failureMessage);
      flashError();
    } finally {
      clearTimeout(request.timer);
      if (requestRef.current === request) {
        requestRef.current = null;
        inFlight.current = false;
        setSubmitting(false);
      }
    }
  }

  return (
    <form ref={formRef} method="post" action="/api/leads" onSubmit={submit} noValidate aria-busy={submitting} className="lead-form space-y-5 text-ink">
      <noscript>
        <p>Pro odeslání formuláře zapněte JavaScript, nebo nám napište na hello@zephyron.tech.</p>
      </noscript>
      <fieldset disabled={submitting || sentEmail !== null} className="min-w-0 space-y-5 border-0 p-0">
        <legend className="sr-only">Kontaktní údaje pro poptávku</legend>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {fields.map((field) => {
            const inputId = `${id}-${field.name}`;
            const errorId = `${inputId}-error`;
            const inputProps = {
              id: inputId,
              name: field.name,
              required: field.required,
              maxLength: field.maxLength,
              autoComplete: field.autoComplete,
              "aria-invalid": fieldErrors[field.name] ? true : undefined,
              "aria-describedby": fieldErrors[field.name] ? errorId : undefined,
              className: "lead-input mt-2 block min-h-[54px] w-full rounded-xl border border-hairline-strong bg-background px-4 py-3 text-base text-ink disabled:opacity-70",
            };
            return (
              <div key={field.name} className={`lead-field min-w-0 ${field.name === "hotel" || field.name === "message" ? "md:col-span-2" : ""}`}>
                <label htmlFor={inputId} className="block text-sm font-medium text-ink-2">{field.label}</label>
                {field.name === "message" ? (
                  <textarea {...inputProps} rows={4} />
                ) : (
                  <input {...inputProps} type={field.type} minLength={field.name === "hotel" ? 2 : undefined} />
                )}
                {fieldErrors[field.name] && (
                  <p id={errorId} className="mt-2 text-sm text-[#9f3124]">{fieldErrors[field.name]}</p>
                )}
              </div>
            );
          })}
        </div>
        <div hidden aria-hidden="true">
          <label htmlFor={`${id}-website`}>Web</label>
          <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <button
          type="submit"
          className={`app-button lead-submit min-h-[54px] w-full px-8 disabled:opacity-70 ${status === "success" ? "is-success" : ""} ${status === "error" ? "is-error" : ""}`}
        >
          <span aria-hidden={status !== "idle"} className={`lead-submit-face ${status === "idle" ? "is-active" : ""}`}>
            Odeslat poptávku
          </span>
          <span aria-hidden={status !== "submitting"} className={`lead-submit-face ${status === "submitting" ? "is-active" : ""}`}>
            <span className="lead-spinner" /> Odesílání…
          </span>
          <span aria-hidden={status !== "success"} className={`lead-submit-face ${status === "success" ? "is-active" : ""}`}>
            <CheckMark className="h-5 w-5" /> Odesláno
          </span>
          <span aria-hidden={status !== "error"} className={`lead-submit-face ${status === "error" ? "is-active" : ""}`}>
            <WarningMark className="h-5 w-5" /> Nepodařilo se
          </span>
        </button>
      </fieldset>
      <p role="status" aria-live="polite" className="text-sm text-ink-2">
        {submitting ? "Odesílání poptávky…" : ""}
      </p>
      {sentEmail !== null && (
        <p ref={confirmationRef} tabIndex={-1} className="break-words text-ink-2 focus:outline-none">
          Poptávka byla odeslána. Ozveme se na {sentEmail}.
        </p>
      )}
      {error && (
        <div className="space-y-2">
          <p ref={errorRef} tabIndex={-1} role="alert" className="text-sm text-[#9f3124] focus:outline-none">{error}</p>
          <a href={CONTACT_MAILTO} className="inline-flex min-h-11 min-w-11 items-center py-2 text-sm text-ink underline underline-offset-4">
            Napsat e-mailem
          </a>
        </div>
      )}
      <div className="text-sm text-ink-3">
        <p>Údaje použijeme k&nbsp;vyřízení poptávky.</p>
        <Link href="/ochrana-osobnich-udaju" className="inline-flex min-h-11 min-w-11 items-center py-2 text-ink-2 underline underline-offset-4">
          Jak zpracováváme osobní údaje
        </Link>
      </div>
    </form>
  );
}
