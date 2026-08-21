/**
 * Compose the process environment for the private, loopback-only Mac test mode.
 * This intentionally replaces any deployed-origin allowlist inherited from the
 * owner's normal environment; it never changes deployed configuration.
 */
export function localReconstructionEnvironment(environment, { appPort, workerPort, secret }) {
  const origin = `http://localhost:${appPort}`;
  return {
    ...environment,
    NODE_ENV: "development",
    NEXT_PUBLIC_APP_URL: origin,
    APP_ALLOWED_ORIGINS: origin,
    STROMAN_LOCATION_RECONSTRUCTION_PROVIDER: "stroman",
    STROMAN_RECONSTRUCTION_WORKER_URL: `http://127.0.0.1:${workerPort}`,
    STROMAN_RECONSTRUCTION_WORKER_SECRET: secret,
  };
}
