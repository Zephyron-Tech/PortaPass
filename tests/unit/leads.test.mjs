import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, mock, test } from "node:test";

const origin = "http://localhost:3100";
const providerUrl = "https://api.resend.com/emails";
const environment = {
  RESEND_API_KEY: "test-resend-key-not-a-credential",
  VERCEL: "0",
  LEADS_FROM: "PortaPass Tests <sender@example.test>",
  LEADS_TO: "leads@example.test",
};
const lead = {
  hotel: "Hotel Test",
  email: "owner@example.test",
  phone: "",
  message: "",
  website: "",
  submissionId: "12345678-1234-4123-8123-123456789abc",
};

function request(input = lead, init = {}) {
  return new Request(`${origin}/api/leads`, {
    method: "POST",
    body: JSON.stringify(input),
    ...init,
    headers: { origin, "content-type": "application/json", ...init.headers },
  });
}

describe("POST /api/leads", { concurrency: false }, () => {
  let POST;
  let sequence = 0;
  let originalFetch;
  let originalEnv;
  let transport;
  let provider;

  beforeEach(async () => {
    originalFetch = globalThis.fetch;
    originalEnv = Object.fromEntries(Object.keys(environment).map((key) => [key, process.env[key]]));
    Object.assign(process.env, environment);
    provider = async () => Response.json({ id: "provider-message-id" });
    // Never delegate to the original fetch, even if the route uses a wrong URL.
    transport = mock.fn(async (url, init) => {
      assert.equal(url, providerUrl);
      return provider(url, init);
    });
    globalThis.fetch = transport;
    const url = new URL("../../src/app/api/leads/route.ts", import.meta.url);
    url.searchParams.set("test", String(++sequence));
    ({ POST } = await import(url.href));
  });

  afterEach(() => {
    try {
      // A route catch must not hide an assertion failure inside the stub.
      for (const call of transport.mock.calls) assert.equal(call.arguments[0], providerUrl);
    } finally {
      globalThis.fetch = originalFetch;
      for (const [key, value] of Object.entries(originalEnv)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    }
  });

  test("empty optional phone and message send fixed plaintext mail", async () => {
    const response = await POST(request());
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual(await response.json(), { ok: true });
    assert.equal(transport.mock.callCount(), 1);
    const [url, init] = transport.mock.calls[0].arguments;
    assert.equal(url, providerUrl);
    assert.equal(init.method, "POST");
    assert.equal(init.cache, "no-store");
    assert.ok(init.signal instanceof AbortSignal);
    const headers = new Headers(init.headers);
    assert.equal(headers.get("authorization"), `Bearer ${environment.RESEND_API_KEY}`);
    assert.equal(headers.get("content-type"), "application/json");
    assert.equal(headers.get("idempotency-key"), `portapass-lead/${lead.submissionId}`);
    assert.deepEqual(JSON.parse(init.body), {
      from: environment.LEADS_FROM,
      to: [environment.LEADS_TO],
      reply_to: lead.email,
      subject: "PortaPass: nov\u00e1 popt\u00e1vka uk\u00e1zky",
      text: "Hotel: Hotel Test\nE-mail: owner@example.test\nTelefon: Neuveden\n\nZpr\u00e1va:\nBez zpr\u00e1vy",
    });
  });

  test("full payload is normalized, remains plaintext, and cannot override delivery", async () => {
    const response = await POST(request({
      ...lead,
      hotel: "  Hotel <Test>  ",
      email: "  OWNER@EXAMPLE.TEST  ",
      phone: "  +420 (123) 456-789 / 12  ",
      message: "  Hello <script>alert(1)</script>\nSecond line  ",
      from: "attacker@evil.test",
      to: ["victim@evil.test"],
      reply_to: "attacker@evil.test",
      url: "https://evil.test/emails",
    }));
    assert.equal(response.status, 200);
    assert.equal(transport.mock.callCount(), 1);
    assert.deepEqual(JSON.parse(transport.mock.calls[0].arguments[1].body), {
      from: environment.LEADS_FROM,
      to: [environment.LEADS_TO],
      reply_to: lead.email,
      subject: "PortaPass: nov\u00e1 popt\u00e1vka uk\u00e1zky",
      text: "Hotel: Hotel <Test>\nE-mail: owner@example.test\nTelefon: +420 (123) 456-789 / 12\n\nZpr\u00e1va:\nHello <script>alert(1)</script>\nSecond line",
    });
  });

  test("retries forward the same submission ID to the provider", async () => {
    provider = async () => { throw new Error("Uncertain delivery"); };
    assert.equal((await POST(request())).status, 502);
    provider = async () => Response.json({ id: "confirmed-id" });
    assert.equal((await POST(request())).status, 200);
    assert.equal(transport.mock.callCount(), 2);
    const [first, retry] = transport.mock.calls.map(({ arguments: [, init] }) => init);
    assert.equal(first.body, retry.body);
    assert.equal(new Headers(first.headers).get("idempotency-key"), `portapass-lead/${lead.submissionId}`);
    assert.equal(new Headers(retry.headers).get("idempotency-key"), `portapass-lead/${lead.submissionId}`);
  });

  for (const [name, result] of [
    ["missing ID", {}], ["empty ID", { id: "" }], ["numeric ID", { id: 42 }],
    ["null", null], ["array", []], ["string", "accepted"],
  ]) {
    test(`provider 200 with ${name} is not success`, async () => {
      provider = async () => Response.json(result);
      const response = await POST(request());
      assert.equal(response.status, 502);
      assert.equal(typeof (await response.json()).error, "string");
      assert.equal(transport.mock.callCount(), 1);
    });
  }

  for (const status of [400, 401, 429, 500]) {
    test(`provider rejection ${status} returns 502 without leaking response`, async () => {
      provider = async () => Response.json({ error: "private-provider-detail" }, { status });
      const response = await POST(request());
      assert.equal(response.status, 502);
      assert.equal(transport.mock.callCount(), 1);
      assert.doesNotMatch(await response.text(), /private-provider-detail|test-resend-key/);
    });
  }

  test("malformed provider JSON returns 502", async () => {
    provider = async () => new Response("not JSON", { status: 200 });
    assert.equal((await POST(request())).status, 502);
    assert.equal(transport.mock.callCount(), 1);
  });

  for (const key of [undefined, ""]) {
    test(`missing provider key (${String(key)}) returns 503 without fetch`, async () => {
      if (key === undefined) delete process.env.RESEND_API_KEY;
      else process.env.RESEND_API_KEY = key;
      const response = await POST(request());
      assert.equal(response.status, 503);
      assert.equal(typeof (await response.json()).error, "string");
      assert.equal(transport.mock.callCount(), 0);
    });
  }

  const invalidFields = {
    hotel: [undefined, null, 42, {}, [], "", "x", "x".repeat(161), "Hotel\nInjected"],
    email: [undefined, null, 42, {}, [], "", "not-an-email", "a@b", "a b@example.test", "a@example.test\r\nBcc:x@y.test", `${"a".repeat(250)}@b.test`],
    phone: [undefined, null, 42, {}, [], "12345", "------", "+420 abc 123456", "123456\n789", "1".repeat(41)],
    message: [undefined, null, 42, {}, [], "x".repeat(2001), "text\u0000"],
  };
  for (const [field, values] of Object.entries(invalidFields)) {
    for (const [index, value] of values.entries()) {
      test(`invalid ${field} case ${index + 1} returns accessible field detail without fetch`, async () => {
        const response = await POST(request({ ...lead, [field]: value }));
        assert.equal(response.status, 400);
        assert.equal(response.headers.get("cache-control"), "no-store");
        const body = await response.json();
        assert.equal(typeof body.error, "string");
        assert.ok(body.fields[field]);
        assert.equal(transport.mock.callCount(), 0);
      });
    }
  }

  for (const website of [undefined, null, 42, {}, "https://spam.test"]) {
    test(`honeypot ${JSON.stringify(website)} is rejected without fetch`, async () => {
      assert.equal((await POST(request({ ...lead, website }))).status, 400);
      assert.equal(transport.mock.callCount(), 0);
    });
  }

  for (const submissionId of [undefined, "", 42, "not-a-uuid", "12345678-1234-1123-8123-123456789abc"]) {
    test(`invalid submission ID ${JSON.stringify(submissionId)} is rejected`, async () => {
      assert.equal((await POST(request({ ...lead, submissionId }))).status, 400);
      assert.equal(transport.mock.callCount(), 0);
    });
  }

  for (const [name, init, status] of [
    ["cross origin", { headers: { origin: "https://evil.test" } }, 403],
    ["missing origin", { headers: { origin: "" } }, 403],
    ["wrong content type", { headers: { "content-type": "text/plain" } }, 415],
    ["missing content type", { headers: { "content-type": "" } }, 415],
    ["oversized declared body", { headers: { "content-length": "12001" } }, 413],
    ["malformed JSON", { body: "{" }, 400],
    ["empty body", { body: null }, 400],
    ["null JSON", { body: "null" }, 400],
    ["array JSON", { body: "[]" }, 400],
    ["string JSON", { body: '"hello"' }, 400],
  ]) {
    test(`${name} returns ${status} without fetch`, async () => {
      const response = await POST(request(lead, init));
      assert.equal(response.status, status);
      assert.equal(typeof (await response.json()).error, "string");
      assert.equal(transport.mock.callCount(), 0);
    });
  }

  test("streamed body is bounded by bytes without content-length", async () => {
    const bytes = new TextEncoder().encode(JSON.stringify({ ...lead, message: "\u00e9".repeat(6500) }));
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(bytes.slice(0, 6000));
        controller.enqueue(bytes.slice(6000));
        controller.close();
      },
    });
    const incoming = request(lead, { body: stream, duplex: "half" });
    assert.equal(incoming.headers.has("content-length"), false);
    assert.equal((await POST(incoming)).status, 413);
    assert.equal(transport.mock.callCount(), 0);
  });

  test("JSON content type permits a charset", async () => {
    assert.equal((await POST(request(lead, { headers: { "content-type": "application/json; charset=utf-8" } }))).status, 200);
    assert.equal(transport.mock.callCount(), 1);
  });

  test("five attempts pass; sixth is rate limited despite spoofed forwarding headers", async () => {
    for (let index = 0; index < 5; index++) assert.equal((await POST(request())).status, 200);
    const response = await POST(request(lead, {
      headers: { "x-forwarded-for": "192.0.2.9", "x-vercel-forwarded-for": "192.0.2.10" },
    }));
    assert.equal(response.status, 429);
    assert.equal(response.headers.get("cache-control"), "no-store");
    const retryAfter = Number(response.headers.get("retry-after"));
    assert.ok(retryAfter > 0 && retryAfter <= 600);
    assert.equal(typeof (await response.json()).error, "string");
    assert.equal(transport.mock.callCount(), 5);
  });

  test("invalid submissions also consume the five-attempt limit", async () => {
    for (let index = 0; index < 5; index++) assert.equal((await POST(request({ ...lead, email: "bad" }))).status, 400);
    assert.equal((await POST(request())).status, 429);
    assert.equal(transport.mock.callCount(), 0);
  });
});
