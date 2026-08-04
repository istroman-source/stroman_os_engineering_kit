# Limited Beta Readiness Gate

## Verdict

**NOT READY FOR LIMITED BETA**

The application is suitable for controlled internal-alpha use. This gate adds and
verifies narrow hardening foundations, but it intentionally does not convert missing
operational, legal, or external-service proof into a beta-readiness claim.

## Automated evidence

- Global anti-framing, MIME-sniffing, referrer, browser-capability, and opener-isolation
  headers are configured and regression tested.
- Health endpoints are non-cacheable and reveal no infrastructure detail.
- Structured request logging carries request IDs, status, duration, and safe categories;
  credential and cookie redaction is regression tested.
- The signed-out sign-in flow has an automated keyboard, accessible-name, focus-order,
  and error-announcement smoke test.
- Unit, API, authentication, PostgreSQL integration, internal-alpha evaluation,
  production build, and Playwright suites remain mandatory.

## Blocking before limited beta

1. Put OTP start and verification behind a durable deployment-level rate limiter; the
   provider-only limit is insufficient for public exposure.
2. Stand up an isolated staging environment and execute migration, smoke, rollback, and
   backup-restore rehearsals with recorded evidence.
3. Add a signed-in browser journey covering project creation, source import, analysis,
   Edit Engine review, and prompt handoff against synthetic staging data.
4. Complete a manual WCAG 2.2 AA audit of the critical signed-in workflow and resolve
   serious findings. The current keyboard smoke is not a conformance audit.
5. Configure deployment-compatible database pooling and production object storage; the
   current filesystem adapter and long-lived Prisma connection assumption are not a
   serverless production design.
6. Complete privacy policy, terms, retention, subprocessor, support, incident-response,
   and legal review appropriate to the intended beta audience.
7. Define, deploy, and verify an application-specific Content-Security-Policy that
   permits only the scripts, styles, connections, frames, and other resources required
   by the production application.
8. Enable and verify Strict-Transport-Security (HSTS) for the production HTTPS origin.
   HSTS may be enforced by the deployment platform or reverse proxy rather than by the
   application, but the effective production response must be tested before beta.

## Deployment stop rules

Do not deploy a public beta when any blocking item above is open. Never run migrations
without a verified backup, migration preview, rollback procedure, named operator, and
post-deploy health checks. Never use production credentials in local, CI, preview, or
staging environments.
