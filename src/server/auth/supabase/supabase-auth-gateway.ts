import { logger } from "@/lib/logging";
import type { AuthGateway, ProviderSession, StartOtpOutcome, VerifyOtpOutcome } from "../types";

const log = logger.child({ scope: "supabase-auth" });

/**
 * Extract ONLY a short, safe provider error token for diagnostics. Supabase auth
 * errors carry a machine `error_code` / `error` enum (e.g. "otp_expired",
 * "otp_disabled", "validation_failed") — safe to log. The human `msg` /
 * `error_description` may contain the email or detail and is NEVER logged.
 */
function safeProviderErrorCode(bodyText: string): string | undefined {
  try {
    const parsed = JSON.parse(bodyText) as Record<string, unknown>;
    const raw = parsed.error_code ?? parsed.error ?? parsed.code;
    if (typeof raw !== "string") return undefined;
    const cleaned = raw.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 64);
    return cleaned === "" ? undefined : cleaned;
  } catch {
    return undefined;
  }
}

export interface SupabaseAuthGatewayConfig {
  /** Supabase project URL, e.g. https://<ref>.supabase.co */
  readonly url: string;
  /** Publishable anon key used as the `apikey` for auth endpoints. */
  readonly anonKey: string;
}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

/**
 * Supabase Auth adapter for the passwordless email-OTP flow, implemented against
 * the documented Auth REST endpoints (`/auth/v1/otp`, `/auth/v1/verify`,
 * `/auth/v1/logout`). It keeps ALL Supabase specifics behind the `AuthGateway`
 * port: callers never see Supabase URLs, keys, tokens, or error bodies. `fetch`
 * is injectable so the adapter contract is unit-testable without a live project.
 *
 * Provider error DETAIL is deliberately discarded: outcomes are neutral kinds so
 * the delivery layer cannot leak provider state or enable account enumeration.
 */
export class SupabaseAuthGateway implements AuthGateway {
  constructor(
    private readonly config: SupabaseAuthGatewayConfig,
    private readonly fetchImpl: FetchLike = fetch,
  ) {}

  private headers(): Record<string, string> {
    return {
      apikey: this.config.anonKey,
      Authorization: `Bearer ${this.config.anonKey}`,
      "Content-Type": "application/json",
    };
  }

  private endpoint(path: string): string {
    return `${this.config.url.replace(/\/$/, "")}${path}`;
  }

  async startEmailOtp(email: string, redirectTo?: string): Promise<StartOtpOutcome> {
    // `redirect_to` is a query parameter on the OTP endpoint (matches supabase-js).
    // It controls where the emailed magic link returns the user after the provider
    // verifies it — it must be an allowlisted Redirect URL in the Supabase project.
    const endpoint = redirectTo
      ? `${this.endpoint("/auth/v1/otp")}?redirect_to=${encodeURIComponent(redirectTo)}`
      : this.endpoint("/auth/v1/otp");
    let res: Response;
    try {
      res = await this.fetchImpl(endpoint, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({ email, create_user: true }),
      });
    } catch {
      log.warn("otp_start_network_error", {});
      return { kind: "unavailable" };
    }
    if (res.ok) return { kind: "sent" };
    // Safe diagnostics only (status + short provider code); never the body/email.
    const bodyText = await res.text().catch(() => "");
    log.warn("otp_start_non_2xx", {
      status: res.status,
      providerErrorCode: safeProviderErrorCode(bodyText),
    });
    if (res.status === 429) return { kind: "rate_limited" };
    return { kind: "unavailable" };
  }

  async verifyEmailOtp(email: string, token: string): Promise<VerifyOtpOutcome> {
    let res: Response;
    try {
      res = await this.fetchImpl(this.endpoint("/auth/v1/verify"), {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({ email, token, type: "email" }),
      });
    } catch {
      log.warn("otp_verify_network_error", {});
      return { kind: "unavailable" };
    }

    const bodyText = await res.text().catch(() => "");
    if (!res.ok) {
      // Diagnose WHY without leaking: status + Supabase's short error_code token.
      log.warn("otp_verify_non_2xx", {
        status: res.status,
        providerErrorCode: safeProviderErrorCode(bodyText),
      });
      if (res.status === 429) return { kind: "rate_limited" };
      if (res.status >= 500) return { kind: "unavailable" };
      return { kind: "invalid" };
    }

    let body: unknown;
    try {
      body = JSON.parse(bodyText);
    } catch {
      log.warn("otp_verify_unparseable_body", { status: res.status });
      return { kind: "unavailable" };
    }
    const session = toProviderSession(body);
    if (!session) {
      log.warn("otp_verify_no_session_in_body", { status: res.status });
      return { kind: "unavailable" };
    }
    return { kind: "verified", session };
  }

  async signOut(accessToken: string): Promise<void> {
    // Best-effort provider-side revocation; local cookie clearing is authoritative
    // for the browser. Never throws — sign-out must remain idempotent.
    try {
      await this.fetchImpl(this.endpoint("/auth/v1/logout"), {
        method: "POST",
        headers: { ...this.headers(), Authorization: `Bearer ${accessToken}` },
      });
    } catch {
      // ignore
    }
  }
}

function toProviderSession(body: unknown): ProviderSession | null {
  if (typeof body !== "object" || body === null) return null;
  const record = body as Record<string, unknown>;
  const accessToken = record.access_token;
  const refreshToken = record.refresh_token;
  const expiresIn = record.expires_in;
  if (typeof accessToken !== "string" || accessToken === "") return null;
  if (typeof refreshToken !== "string" || refreshToken === "") return null;
  const expiresInSeconds = typeof expiresIn === "number" && expiresIn > 0 ? expiresIn : 3600;
  return { accessToken, refreshToken, expiresInSeconds };
}
