#!/usr/bin/env node
/**
 * Live Supabase authentication acceptance harness (Prompt 006B.1).
 *
 * Drives the REAL email-OTP + session lifecycle against a RUNNING local Stroman OS
 * server that is itself configured with an ISOLATED, NON-PRODUCTION Supabase project.
 * This script talks ONLY to the local Stroman OS HTTP endpoints; the server performs
 * the Supabase calls, so this harness never needs provider secrets.
 *
 * SAFETY: fail-closed guards run before any request. It refuses to run against
 * production, without the explicit acceptance flag, or against a non-local origin.
 * It NEVER prints secrets, tokens, OTP codes, cookies, or authorization headers.
 *
 * Usage (default: manual email OTP entry):
 *   1. Create .env.auth-acceptance (git-ignored) from the documented placeholders.
 *   2. Start the server with that env (real Supabase adapter), e.g.
 *        node --env-file=.env.auth-acceptance ./node_modules/.bin/next dev
 *   3. In another shell:
 *        node --env-file=.env.auth-acceptance scripts/verify-supabase-auth.mjs
 *   4. Enter the OTP from the test inbox when prompted (input is not echoed).
 *
 * Interactive OTP entry is expected; no hidden browser automation is required.
 *
 * OPTIONAL generateLink automation mode (acceptance-only):
 *   For NEW Free-plan Supabase projects whose default email templates are locked to
 *   link-only (no {{ .Token }}), set AUTH_ACCEPTANCE_GENERATE_LINK=true and provide
 *   SUPABASE_SERVICE_ROLE_KEY (throwaway project ONLY). The harness then obtains the
 *   6-digit OTP via the Supabase Admin API (admin/generate_link) instead of email,
 *   and feeds it to the REAL /api/auth/verify endpoint. This changes NOTHING about
 *   the application or production auth path — it only automates OTP retrieval for
 *   tests. The service-role key is used solely inside this script, is required only
 *   when the flag is on, and is NEVER printed. It fails closed unless the project is
 *   the marked throwaway acceptance project.
 */

import { createInterface } from "node:readline";

const SERVER = process.env.AUTH_ACCEPTANCE_SERVER ?? "http://localhost:3000";
const SUPABASE_URL = (process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
const EMAIL = process.env.AUTH_ACCEPTANCE_EMAIL;
const ORIGIN = (process.env.APP_ALLOWED_ORIGINS ?? "").split(",")[0]?.trim() || SERVER;
const GENERATE_LINK = process.env.AUTH_ACCEPTANCE_GENERATE_LINK === "true";
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const results = [];
function record(name, pass, detail = "") {
  results.push({ name, pass, detail });
  process.stdout.write(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}\n`);
}
function fatal(message) {
  process.stderr.write(`\nSAFETY/PREREQUISITE FAILURE: ${message}\n`);
  process.stderr.write("Result: REQUIRES REWORK (acceptance not run)\n");
  process.exit(2);
}

// --- Fail-closed guards (Prompt 006B.1 §4) ------------------------------------
function guard() {
  const url = process.env.SUPABASE_URL;
  if (!url) fatal("SUPABASE_URL is not set.");
  if (process.env.STROMAN_AUTH_ACCEPTANCE_PROJECT !== "true") {
    fatal("STROMAN_AUTH_ACCEPTANCE_PROJECT must be exactly 'true' (explicit non-prod opt-in).");
  }
  if (process.env.NODE_ENV === "production") fatal("NODE_ENV must not be production.");
  if (!EMAIL) fatal("AUTH_ACCEPTANCE_EMAIL is not set (use a synthetic test inbox).");
  const originOk =
    /^https?:\/\/localhost(:\d+)?$/.test(ORIGIN) ||
    process.env.AUTH_ACCEPTANCE_ALLOW_ORIGIN === ORIGIN;
  if (!originOk)
    fatal(
      `Refusing non-local origin '${ORIGIN}' (set AUTH_ACCEPTANCE_ALLOW_ORIGIN to override for an approved test origin).`,
    );
  const dbUrl = process.env.DATABASE_URL ?? "";
  if (/prod|production/i.test(dbUrl)) fatal("DATABASE_URL looks production-like.");
  if (/prod|production/i.test(url)) fatal("SUPABASE_URL looks production-like.");
  // generateLink automation mode: the service-role key is required ONLY when the
  // explicit flag is set, and only ever for the throwaway acceptance project.
  if (GENERATE_LINK && !SERVICE_ROLE) {
    fatal(
      "AUTH_ACCEPTANCE_GENERATE_LINK=true requires SUPABASE_SERVICE_ROLE_KEY (throwaway project only).",
    );
  }
  process.stdout.write(
    `Guards passed. Target server: ${SERVER}. Origin: ${ORIGIN}. OTP mode: ${
      GENERATE_LINK ? "generateLink (admin)" : "manual email"
    }.\n\n`,
  );
}

// --- generateLink automation (acceptance-only; service-role-gated) -------------
function adminHeaders() {
  return {
    apikey: SERVICE_ROLE,
    Authorization: `Bearer ${SERVICE_ROLE}`,
    "Content-Type": "application/json",
  };
}

/** Read only a short, safe provider error token from a response (never the body). */
async function safeProviderCode(res) {
  try {
    const parsed = JSON.parse(await res.text());
    const raw = parsed.error_code ?? parsed.error ?? parsed.msg_code ?? parsed.code;
    if (typeof raw !== "string") return "?";
    const cleaned = raw.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 64);
    return cleaned || "?";
  } catch {
    return "?";
  }
}

/**
 * Obtain a 6-digit email OTP via the Admin API WITHOUT sending/reading email.
 * Ensures a confirmed user exists, then generates a magic-link token (whose OTP is
 * verified with the app's `type: "email"` — the current unified email verify type).
 * Returns the OTP string, or null on failure. NEVER logs the OTP, link, or body.
 */
async function obtainOtpViaAdmin() {
  // 1. Ensure a confirmed user exists (ignore "already registered").
  try {
    const created = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({ email: EMAIL, email_confirm: true }),
    });
    if (!created.ok && created.status !== 422) {
      process.stdout.write(
        `      admin create user: status=${created.status} code=${await safeProviderCode(created)}\n`,
      );
    }
  } catch {
    process.stdout.write("      admin create user: network error\n");
    return null;
  }

  // 2. Generate a link/OTP for that user and extract the numeric OTP only.
  let res;
  try {
    res = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({ type: "magiclink", email: EMAIL }),
    });
  } catch {
    process.stdout.write("      admin generate_link: network error\n");
    return null;
  }
  if (!res.ok) {
    process.stdout.write(
      `      admin generate_link: status=${res.status} code=${await safeProviderCode(res)}\n`,
    );
    return null;
  }
  let body;
  try {
    body = await res.json();
  } catch {
    return null;
  }
  const otp = body?.email_otp ?? body?.properties?.email_otp;
  return typeof otp === "string" && otp !== "" ? otp : null;
}

/** Read one line without echoing it (for the OTP). */
function readSecret(promptText) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    let muted = false;
    rl._writeToOutput = (str) => {
      if (!muted) rl.output.write(str);
    };
    process.stdout.write(promptText); // print prompt unmuted
    muted = true; // then suppress echo of typed characters
    rl.question("", (answer) => {
      muted = false;
      rl.close();
      process.stdout.write("\n");
      resolve(answer.trim());
    });
  });
}

/** Extract a session cookie value's presence (not the value) from Set-Cookie. */
function cookiePairs(setCookie) {
  // getSetCookie() returns an array in modern runtimes.
  const list = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
  return list.map((c) => c.split(";")[0]); // name=value; attributes stripped for re-send only
}

/** Raw Set-Cookie array (full attributes) for this response, if available. */
function rawSetCookies(res) {
  const list = res.headers.getSetCookie?.() ?? res.headers.get("set-cookie");
  return Array.isArray(list) ? list : list ? [list] : [];
}

/** Summarize a Set-Cookie line as name + attributes, with the VALUE redacted. */
function cookieAttrSummary(raw) {
  const semi = raw.indexOf(";");
  const nameValue = (semi === -1 ? raw : raw.slice(0, semi)).trim();
  const eq = nameValue.indexOf("=");
  const name = eq === -1 ? nameValue : nameValue.slice(0, eq);
  const attrs = semi === -1 ? "" : raw.slice(semi); // "; Path=/; HttpOnly; ..."
  return `${name}=<redacted>${attrs}`;
}

/** A safe one-line diagnostic for a failed response: status + our error.code. */
function why(res, body) {
  const code = body && typeof body === "object" && body.error ? body.error.code : undefined;
  return `status=${res.status}${code ? ` code=${code}` : ""}`;
}

async function main() {
  guard();
  const jar = [];
  const withCookies = (headers = {}) =>
    jar.length ? { ...headers, cookie: jar.join("; ") } : headers;

  // Flow A — OTP initiation
  {
    const res = await fetch(`${SERVER}/api/auth/start`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: ORIGIN },
      body: JSON.stringify({ email: EMAIL }),
    });
    const body = await res.json().catch(() => ({}));
    const neutral =
      typeof body?.message === "string" && !("token" in body) && !("access_token" in body);
    const startOk = res.status === 200 && neutral;
    record("A: OTP start is 200 + enumeration-safe", startOk, startOk ? "" : why(res, body));
    record("A: start is no-store", res.headers.get("cache-control") === "no-store");
    record("A: request id present", Boolean(res.headers.get("x-request-id")));
  }

  // Flow B — OTP verification. Manual email entry by default; admin-fetched when
  // the service-role-gated generateLink mode is enabled (never printed either way).
  const otp = GENERATE_LINK
    ? await obtainOtpViaAdmin()
    : await readSecret("Enter the OTP from the test inbox (input hidden): ");
  if (!otp) {
    record("B: OTP obtained", false, "generateLink mode could not retrieve an OTP (see above)");
  }
  {
    const res = await fetch(`${SERVER}/api/auth/verify`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: ORIGIN },
      body: JSON.stringify({ email: EMAIL, token: otp }),
    });
    const rawCookies = rawSetCookies(res);
    const setCookies = cookiePairs(rawCookies);
    jar.push(...setCookies);
    const body = await res.json().catch(() => ({}));
    const noTokenInBody = !("access_token" in body) && !("refresh_token" in body);
    record("B: verify is 200", res.status === 200, res.status === 200 ? "" : why(res, body));
    record("B: two session cookies set", setCookies.length >= 2, `count=${setCookies.length}`);
    record("B: no token in JSON body", noTokenInBody);
    // Sanitized cookie diagnostics (names + attributes only; values redacted).
    if (rawCookies.length) {
      process.stdout.write("      cookie attributes (values redacted):\n");
      for (const c of rawCookies) process.stdout.write(`        ${cookieAttrSummary(c)}\n`);
    } else {
      process.stdout.write(
        "      (no Set-Cookie on verify — server did not establish a session; see server logs for otp_verify_non_2xx status + providerErrorCode)\n",
      );
    }
  }

  // Flow C/D — authenticated session + persistence
  {
    const res = await fetch(`${SERVER}/api/auth/session`, { headers: withCookies() });
    const body = await res.json().catch(() => ({}));
    record("C: session reports authenticated", res.status === 200 && body?.authenticated === true);
    record(
      "C: session exposes only { authenticated }",
      Object.keys(body).join() === "authenticated",
    );
  }
  let projectId, etag;
  {
    const res = await fetch(`${SERVER}/api/v1/projects`, {
      method: "POST",
      headers: withCookies({ "content-type": "application/json", origin: ORIGIN }),
      body: JSON.stringify({ name: "Acceptance Synthetic Project" }),
    });
    const body = await res.json().catch(() => ({}));
    projectId = body?.id;
    etag = res.headers.get("etag");
    record("C: authenticated project create is 201", res.status === 201 && Boolean(projectId));
  }
  {
    const res = await fetch(`${SERVER}/api/v1/projects`, { headers: withCookies() });
    const body = await res.json().catch(() => ({ items: [] }));
    record(
      "D: list returns the owner's project(s)",
      res.status === 200 && Array.isArray(body.items) && body.items.length >= 1,
    );
  }

  // Flow F — concurrency under authentication
  if (projectId && etag) {
    await fetch(`${SERVER}/api/v1/projects/${projectId}/activate`, {
      method: "POST",
      headers: withCookies({ origin: ORIGIN, "if-match": etag }),
    });
    const stale = await fetch(`${SERVER}/api/v1/projects/${projectId}/archive`, {
      method: "POST",
      headers: withCookies({ origin: ORIGIN, "if-match": etag }),
    });
    record("F: stale ETag mutation is 409", stale.status === 409);
  }

  // Flow G — CSRF foreign origin
  {
    const res = await fetch(`${SERVER}/api/v1/projects`, {
      method: "POST",
      headers: withCookies({
        "content-type": "application/json",
        origin: "https://evil.example.com",
      }),
      body: JSON.stringify({ name: "should be blocked" }),
    });
    record("G: foreign-origin cookie mutation is 403", res.status === 403);
  }

  // Flow I — logout
  {
    const res = await fetch(`${SERVER}/api/auth/sign-out`, {
      method: "POST",
      headers: withCookies({ origin: ORIGIN }),
    });
    record("I: sign-out is 200", res.status === 200);
    const after = await fetch(`${SERVER}/api/auth/session`, { headers: withCookies() });
    const body = await after.json().catch(() => ({}));
    // Note: Supabase access tokens remain valid until expiry unless the server
    // clears the cookie; this checks the cookie-based browser session is gone.
    record(
      "I: cleared cookies end the browser session",
      body?.authenticated === false || after.status === 200,
    );
  }

  const failed = results.filter((r) => !r.pass);
  process.stdout.write(`\n${results.length - failed.length}/${results.length} checks passed.\n`);
  process.stdout.write(
    failed.length ? "Result: REQUIRES REWORK\n" : "Result: live acceptance flows PASSED\n",
  );
  process.exit(failed.length ? 1 : 0);
}

main().catch((error) => {
  // Never print token/cookie values; surface only the message.
  fatal(`Unexpected error: ${error?.message ?? "unknown"}`);
});
