import nodemailer from "nodemailer";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LIMITS = { name: 120, email: 200, message: 1000 };

// Rate limit: 5 sent messages per hour per IP and per sender address, so switching
// one or the other doesn't get around it. In memory, so it is per server instance
// and resets on restart.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

const recentHits = (key: string, now: number) => {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length) hits.set(key, recent);
  else hits.delete(key);
  return recent;
};

/** Seconds until the caller may send again, or 0 if they are under the limit. */
const retryAfter = (keys: string[]) => {
  const now = Date.now();
  // Drop stale entries now and then so the map can't grow without bound.
  if (hits.size > 1000) for (const k of [...hits.keys()]) recentHits(k, now);
  const waits = keys.map((k) => {
    const recent = recentHits(k, now);
    return recent.length >= MAX_PER_WINDOW ? recent[0] + WINDOW_MS - now : 0;
  });
  return Math.ceil(Math.max(0, ...waits) / 1000);
};

/** Count a send up front so parallel requests can't all slip under the limit. */
const reserve = (keys: string[]) => {
  const now = Date.now();
  for (const k of keys) hits.set(k, [...recentHits(k, now), now]);
  // Undo if the send fails, so a mail outage doesn't use up the sender's quota.
  return () => {
    for (const k of keys) {
      const left = (hits.get(k) ?? []).filter((t) => t !== now);
      if (left.length) hits.set(k, left);
      else hits.delete(k);
    }
  };
};

const clientIp = (request: Request) =>
  request.headers.get("cf-connecting-ip") ||
  request.headers.get("x-real-ip") ||
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  "local";

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request: Request) {
  const { GMAIL_USER, GMAIL_APP_PASSWORD, CONTACT_TO } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    return Response.json({ ok: false, error: "Mailer is not configured" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot: bots fill every field. Pretend success so they move on.
  if (clean(body.company, 200)) return Response.json({ ok: true });

  const name = clean(body.name, LIMITS.name);
  const email = clean(body.email, LIMITS.email);
  const message = clean(body.message, LIMITS.message);
  if (!name || !EMAIL_RE.test(email) || message.length < 10) {
    return Response.json({ ok: false, error: "Invalid input" }, { status: 422 });
  }

  const keys = [`ip:${clientIp(request)}`, `email:${email.toLowerCase()}`];
  const wait = retryAfter(keys);
  if (wait) {
    return Response.json(
      { ok: false, error: "Too many messages", retryAfter: wait },
      { status: 429, headers: { "Retry-After": String(wait) } },
    );
  }

  const release = reserve(keys);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });

  try {
    await transporter.sendMail({
      from: `"Portfolio contact" <${GMAIL_USER}>`,
      to: CONTACT_TO || "sohamrc08@gmail.com",
      replyTo: { name, address: email },
      subject: `New message from ${name.replace(/[\r\n]+/g, " ")}`,
      text: `${message}\n\nFrom: ${name} <${email}>`,
      html: `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#15130f">
  <p style="white-space:pre-wrap;margin:0 0 20px">${escape(message)}</p>
  <p style="margin:0;color:#6b665c">From: ${escape(name)} &lt;${escape(email)}&gt;</p>
</div>`,
    });
    return Response.json({ ok: true });
  } catch (err) {
    release();
    console.error("[contact] send failed", err);
    return Response.json({ ok: false, error: "Send failed" }, { status: 502 });
  }
}
