"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/ui/primitives/button";
import { friendlyError, getSession, startOtp, verifyOtp } from "./api-client";

type Phase = "checking" | "email" | "code";

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Cooldown after a send, to prevent accidental repeat requests hitting the quota. */
const RESEND_COOLDOWN_SECONDS = 60;

/** Sanitized message for the provider's built-in test-email rate limit. */
const RATE_LIMIT_MESSAGE =
  "Supabase’s test email limit has been reached. Wait before requesting another sign-in link, then use only the newest email.";

/**
 * Passwordless email-OTP sign-in. Talks only to the Stroman OS auth API. An
 * already-authenticated visitor is bounced to /projects (session-aware login).
 */
export function LoginView() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("checking");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let active = true;
    void getSession().then((authenticated) => {
      if (!active) return;
      if (authenticated) router.replace("/projects");
      else setPhase("email");
    });
    return () => {
      active = false;
    };
  }, [router]);

  // Tick the resend cooldown down to zero (one timer per second; self-cleaning).
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function onSendCode(event: FormEvent) {
    event.preventDefault();
    if (cooldown > 0) return;
    setBusy(true);
    setError(null);
    try {
      await startOtp(email.trim());
      setNotice(
        "Check your email: click the sign-in link, or enter the 6-digit code below if your email includes one.",
      );
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setPhase("code");
    } catch (err) {
      // A provider rate limit gets a specific, sanitized message and its own
      // cooldown so the user does not keep hammering the quota.
      if ((err as { code?: string } | null)?.code === "RATE_LIMITED") {
        setError(RATE_LIMIT_MESSAGE);
        setCooldown(RESEND_COOLDOWN_SECONDS);
      } else {
        setError(friendlyError(err));
      }
    } finally {
      setBusy(false);
    }
  }

  async function onVerify(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await verifyOtp(email.trim(), code.trim());
      router.replace("/projects");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  if (phase === "checking") {
    return <p className="text-muted-foreground text-sm">Checking session…</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {phase === "email" ? (
        <form
          onSubmit={onSendCode}
          className="flex flex-col gap-3"
          aria-label="Request sign-in code"
        >
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <Button type="submit" disabled={busy || cooldown > 0}>
            {cooldown > 0 ? `Resend in ${cooldown}s` : busy ? "Sending…" : "Send sign-in link"}
          </Button>
        </form>
      ) : (
        <form onSubmit={onVerify} className="flex flex-col gap-3" aria-label="Verify sign-in code">
          <p className="text-muted-foreground text-sm">Code sent to {email}</p>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Verification code</span>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              className={inputClass}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
            />
          </label>
          <Button type="submit" disabled={busy}>
            {busy ? "Verifying…" : "Verify & sign in"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => {
              setPhase("email");
              setCode("");
              setNotice(null);
              setError(null);
            }}
          >
            Use a different email
          </Button>
        </form>
      )}
      {notice ? (
        <p role="status" className="text-muted-foreground text-sm">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}
