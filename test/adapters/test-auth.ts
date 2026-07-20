import type {
  AuthGateway,
  AuthOutcome,
  ProviderSession,
  RequestAuthenticator,
  StartOtpOutcome,
  VerifyOtpOutcome,
} from "@/server/auth/types";

/** Headers the test authenticator reads. These work ONLY because this
 * authenticator is wired through test composition; production uses the real
 * Supabase authenticator, which ignores them entirely. */
export const TEST_PRINCIPAL_HEADER = "x-test-principal";
export const TEST_EMAIL_HEADER = "x-test-email";
export const TEST_VIA_HEADER = "x-test-via";

/**
 * Deterministic authenticator for real-HTTP tests. It fabricates a verified
 * principal from synthetic headers so tests can exercise the full pipeline
 * (mapping, provisioning, authorization, CSRF) without a live provider. It is a
 * faithful stand-in for a verified token: no header, no identity.
 */
export class TestAuthenticator implements RequestAuthenticator {
  async authenticate(req: Request): Promise<AuthOutcome> {
    // Mirror the real authenticator's bearer support: a `Bearer <subject>` token
    // authenticates via bearer (used by the /api/auth/callback token check). The
    // synthetic `x-test-principal` header is the cookie-flow equivalent.
    const bearer = /^Bearer\s+(.+)$/i.exec(req.headers.get("authorization")?.trim() ?? "");
    const bearerSubject = bearer?.[1]?.trim();
    if (bearerSubject) {
      return {
        kind: "authenticated",
        via: "bearer",
        principal: { provider: "SUPABASE", subject: bearerSubject, email: null },
      };
    }
    const subject = req.headers.get(TEST_PRINCIPAL_HEADER);
    if (!subject) return { kind: "anonymous" };
    const email = req.headers.get(TEST_EMAIL_HEADER);
    const via = req.headers.get(TEST_VIA_HEADER) === "bearer" ? "bearer" : "cookie";
    return {
      kind: "authenticated",
      via,
      principal: { provider: "SUPABASE", subject, email: email ?? null },
    };
  }
}

/** An authenticator that always returns a fixed outcome (outage / invalid tests). */
export class FixedAuthenticator implements RequestAuthenticator {
  constructor(private readonly outcome: AuthOutcome) {}
  async authenticate(): Promise<AuthOutcome> {
    return this.outcome;
  }
}

/** A configurable in-memory auth gateway for the OTP endpoints. Records calls. */
export class FakeAuthGateway implements AuthGateway {
  startCalls: string[] = [];
  verifyCalls: Array<{ email: string; token: string }> = [];
  refreshCalls: string[] = [];
  signOutCalls: string[] = [];

  constructor(
    private readonly config: {
      start?: StartOtpOutcome;
      verify?: VerifyOtpOutcome;
      /** null → refresh fails; ProviderSession → refresh succeeds. */
      refresh?: ProviderSession | null;
    } = {},
  ) {}

  async startEmailOtp(email: string, _redirectTo?: string): Promise<StartOtpOutcome> {
    void _redirectTo;
    this.startCalls.push(email);
    return this.config.start ?? { kind: "sent" };
  }

  async verifyEmailOtp(email: string, token: string): Promise<VerifyOtpOutcome> {
    this.verifyCalls.push({ email, token });
    return (
      this.config.verify ?? {
        kind: "verified",
        session: { accessToken: "at", refreshToken: "rt", expiresInSeconds: 3600 },
      }
    );
  }

  async refreshSession(refreshToken: string): Promise<ProviderSession | null> {
    this.refreshCalls.push(refreshToken);
    return this.config.refresh === undefined ? null : this.config.refresh;
  }

  async signOut(accessToken: string): Promise<void> {
    this.signOutCalls.push(accessToken);
  }
}
