# Private Web Deployment

## Release architecture

Stroman OS deploys as one long-running Railway service built from the repository Dockerfile, with
Railway managed PostgreSQL and one persistent volume mounted at `/app/.data`. Supabase remains the
authentication provider; OpenAI remains behind the provider-neutral creative-reasoning port.

Railway is the shortest compatible path for this release because Stroman is not a stateless
serverless application: hosted creative development can run for several minutes, Prisma currently
uses a long-lived PostgreSQL client, and source imports use bounded filesystem storage. The service
model also provides pre-deploy migrations, health checks, logs, deployment rollback, private
database networking, and a stable HTTPS domain without changing the verified application runtime.

The persistent volume is an intentional single-service beta constraint. Do not raise the service
above one replica until source storage moves to provider-neutral object storage. Visual blueprints
and creative output are persisted in PostgreSQL; the volume stores imported source payloads.

## Private access boundary

Every meaningful `/api/v1` route passes through the authoritative request gate:

1. Supabase verifies the cookie or bearer credential.
2. Stroman maps the provider subject to a stable internal `UserId`.
3. `private_beta_access` must contain an active owner/tester grant for that `UserId`.
4. Application ownership rules still scope every project and child resource.

The browser guard is only UX. Direct URLs, forged client state, and direct API calls cannot bypass
the server decision. Access-store failure is a distinct fail-closed `503`; a signed-in account with
no grant receives the private-testing message and protected APIs return `403`.

`STROMAN_PRIVATE_BETA_OWNER_EMAIL` is a deployment-only bootstrap secret. On the first matching,
provider-verified sign-in, the application atomically creates the singleton OWNER grant against the
stable internal user and records an append-only bootstrap event. The email is not stored in the
access table and is never an ongoing authorization key. A revoked record cannot bootstrap again.

## Railway setup (owner action)

Create a Railway project from the GitHub repository and deploy only the reviewed `main` branch.
Do not enable pull-request deployments for production.

1. Add Railway PostgreSQL to the project. Reference its private `DATABASE_URL` from the Stroman
   service. Railway's private network keeps inter-service traffic off the public internet and
   encrypts it through WireGuard; do not use the developer laptop database or public TCP proxy.
2. Add a volume mounted at `/app/.data`. Keep exactly one application replica. Railway mounts the
   volume as root; the image entrypoint prepares only this directory and immediately drops every
   application/migration/admin command to the dedicated non-root service user. Do not set a
   platform override that keeps the application running as root.
3. Configure the variable names below in the service's secure Variables UI. Never put values in a
   tracked file, build log, screenshot, PR, or chat.
4. Allow `railway.json` to build the Dockerfile, run `prisma migrate deploy` as the pre-deploy
   command, and gate traffic on `/api/health/ready`.
5. Generate a stable Railway HTTPS domain. Set `NEXT_PUBLIC_APP_URL`, `APP_ALLOWED_ORIGINS`, and the
   Supabase redirect URL to that exact origin, then redeploy.

Required production variables:

```text
DATABASE_URL
NEXT_PUBLIC_APP_URL
APP_ALLOWED_ORIGINS
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_JWT_AUD
SUPABASE_EMAIL_REDIRECT_URL
OPENAI_API_KEY
STROMAN_CREATIVE_REASONING_PROVIDER=openai
STROMAN_CREATIVE_MODEL
STROMAN_PRIVATE_BETA_OWNER_EMAIL
STROMAN_RELEASE_SHA
STROMAN_SOURCE_STORAGE_PATH=/app/.data/source-imports
NODE_ENV=production
```

Set `STROMAN_RELEASE_SHA` from Railway's Git commit SHA reference, not by copying an unverified
local value. `SUPABASE_JWT_SECRET` is optional and should remain absent when JWKS verification is
used. Production readiness fails closed if any release-critical variable is missing, the public URL
is not HTTPS, the auth callback is not same-origin `/auth/callback`, or hosted reasoning is not
explicitly selected.

## Supabase production URL configuration (owner action)

In the existing Supabase project, preserve localhost entries and add the deployed origin:

- Site URL: the stable deployed HTTPS origin.
- Redirect URL: `<deployed-origin>/auth/callback` (exact path).
- Email templates: both Confirm signup and Magic Link must include the numeric `{{ .Token }}` if
  typed OTP remains the intended sign-in path.

Set `SUPABASE_EMAIL_REDIRECT_URL` to that same callback and `APP_ALLOWED_ORIGINS` to the exact
deployed origin. Do not add wildcard redirect origins.

## Initial owner and trusted testers

1. Deploy with the bootstrap owner email stored only in Railway Variables.
2. The owner signs in once through the deployed application. That verified request claims the
   singleton OWNER record.
3. In a Railway service shell, run `npm run private-beta:access -- owner-id`. Store the returned
   internal ID as `STROMAN_PRIVATE_BETA_ADMIN_USER_ID` in the secure service environment. It is an
   internal opaque identifier, not an authentication credential.

A prospective tester signs in once and sees the private-testing screen; this safely provisions the
provider-to-internal identity mapping but grants no product access. In the trusted Railway shell,
the owner/operator can then use one transient target selector:

```text
npm run private-beta:access -- list
npm run private-beta:access -- grant
npm run private-beta:access -- revoke
```

For grant/revoke, set either `STROMAN_PRIVATE_BETA_TARGET_USER_ID` or the transient
`STROMAN_PRIVATE_BETA_TARGET_EMAIL`. Email lookup fails if it is ambiguous and the command never
prints the email. Every mutation verifies that `STROMAN_PRIVATE_BETA_ADMIN_USER_ID` is the active
OWNER, refuses to alter the owner, and writes an audit event. No HTTP administration endpoint
exists.

## Migration, recovery, and rollback

Before the first production migration, create/verify a managed PostgreSQL backup or recovery point
and record the deployed main SHA. Never run `prisma migrate reset`, `migrate dev`, test setup, or
seed commands against production. Railway pre-deploy runs only `prisma migrate deploy`; a migration
failure prevents the new service from receiving traffic.

The private-access migration only adds enums, tables, indexes, and a restrictive foreign key. It
does not rewrite existing project or identity data. Application rollback selects the previous
successful Railway deployment. The additive table may safely remain while the old application
runs. A destructive database rollback is neither required nor authorized. If database recovery is
necessary, stop writes, preserve logs/release SHA, and restore the verified managed backup into a
new database before changing `DATABASE_URL`.

## Production verification

Do not treat a green health endpoint as product approval. Against the deployed reviewed SHA:

- verify `/api/health/live` and `/api/health/ready` report the expected safe release identity;
- complete allowlisted owner OTP, refresh/reopen, project creation, hosted Develop & Plan,
  persistence, storyboard/blueprint, transcript import, and Analyze & Edit;
- inspect 16:9 and 9:16 output at desktop width and approximately 390 px;
- verify an authenticated non-allowlisted account sees only the private-testing state;
- directly call a protected API with that denied session and confirm `403`;
- check service logs for honest request/provider/database failure categories and no credentials,
  prompts, source payloads, or secret values;
- capture only synthetic, production-safe screenshots.

After smoke testing, confirm the deployed commit equals the independently reviewed and merged SHA.

## Platform references

- [Railway private networking](https://docs.railway.com/networking/private-networking)
- [Railway PostgreSQL](https://docs.railway.com/databases/postgresql)
- [Railway volumes and permissions](https://docs.railway.com/volumes)
- [Railway pre-deploy commands](https://docs.railway.com/deployments/pre-deploy-command)
- [Railway health checks](https://docs.railway.com/deployments/healthchecks)
- [Railway config as code](https://docs.railway.com/config-as-code)
- [Railway plans and early-stage cost](https://docs.railway.com/pricing/plans)
