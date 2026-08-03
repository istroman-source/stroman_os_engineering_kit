# Internal Alpha Onboarding

## Audience and boundaries

Internal alpha is for explicitly invited filmmakers using synthetic or approved source
material. It is not a public beta. Wideframe handoff is manual; the deterministic
analysis baseline is advisory; users retain every editorial decision.

## Operator setup

1. Provision a non-production PostgreSQL database and a separate Supabase project.
2. Configure both Supabase email templates to include the numeric OTP token.
3. Supply secrets only through the deployment environment described by `.env.example`.
4. Apply migrations with `prisma migrate deploy`; do not use `migrate dev` in a shared
   environment.
5. Run the complete verification gate, `npm run test:evaluations`, and the isolated
   Supabase authentication acceptance procedure.
6. Verify `/api/health/live` and `/api/health/ready` before inviting users.

## Filmmaker first run

Sign in with the emailed code, create a project, describe the creative intent, import a
supported transcript, run evidence-grounded analysis, inspect the Edit Engine, and copy
or download the production prompt. Recommendations are suggestions and should be checked
against the cited source material.

## Support and incident handling

Record the request ID shown with an error, the time, and the action attempted. Do not
collect OTP codes, cookies, tokens, or private transcript content in support messages.
Disable invitations and stop processing new source material if authorization isolation,
source integrity, or fabricated evidence is suspected.
