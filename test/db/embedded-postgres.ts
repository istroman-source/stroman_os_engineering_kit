import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import EmbeddedPostgres from "embedded-postgres";

/**
 * Starts a REAL PostgreSQL server in userspace (no Docker/sudo) for integration
 * tests and migration generation. This is genuine PostgreSQL — not SQLite or an
 * emulation — so database behavior (constraints, transactions) is truly verified.
 */
export interface RunningPostgres {
  readonly url: string;
  stop(): Promise<void>;
}

export interface StartOptions {
  readonly port: number;
  readonly database: string;
}

export async function startEmbeddedPostgres(options: StartOptions): Promise<RunningPostgres> {
  const dataDir = mkdtempSync(join(tmpdir(), "stroman-pg-"));
  const postgres = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: "stroman",
    password: "stroman",
    port: options.port,
    persistent: false,
  });

  await postgres.initialise();
  await postgres.start();
  await postgres.createDatabase(options.database);

  const url = `postgresql://stroman:stroman@localhost:${options.port}/${options.database}?schema=public`;

  return {
    url,
    async stop() {
      await postgres.stop();
      rmSync(dataDir, { recursive: true, force: true });
    },
  };
}
