import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

import { PrismaClient } from "@prisma/client";
import EmbeddedPostgres from "embedded-postgres";

const releaseMigrations = [
  "20260831040000_link_decisions_to_canonical_evidence",
  "20260831043000_add_decision_context",
];
const port = Number(process.env.STROMAN_MIGRATION_REHEARSAL_PORT ?? "54331");
const rehearsalRoot = mkdtempSync(resolve(tmpdir(), "stroman-migration-rehearsal-"));
const databasePath = resolve(rehearsalRoot, "postgres");
const baselinePrismaPath = resolve(rehearsalRoot, "baseline-prisma");
const database = "stroman_migration_rehearsal";
const url = `postgresql://stroman:stroman@localhost:${port}/${database}?schema=public`;
const postgres = new EmbeddedPostgres({
  databaseDir: databasePath,
  user: "stroman",
  password: "stroman",
  port,
  persistent: false,
});

function deploy(schemaPath) {
  execFileSync(resolve("node_modules/.bin/prisma"), ["migrate", "deploy", "--schema", schemaPath], {
    env: { ...process.env, DATABASE_URL: url },
    stdio: "inherit",
  });
}

async function seedCompatibleState() {
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    await prisma.$executeRawUnsafe(`
      INSERT INTO "projects"
        ("id", "owner_id", "name", "status", "created_at", "updated_at", "lock_version")
      VALUES
        ('proj_migration_rehearsal', 'usr_migration_rehearsal', 'Existing project', 'DRAFT',
         '2026-08-30T00:00:00Z', '2026-08-30T00:00:00Z', 1)
    `);
    await prisma.$executeRawUnsafe(`
      INSERT INTO "decisions"
        ("id", "project_id", "question", "status", "created_at", "lock_version")
      VALUES
        ('dec_migration_rehearsal', 'proj_migration_rehearsal', 'Keep this direction?', 'PROPOSED',
         '2026-08-30T00:00:00Z', 1)
    `);
    await prisma.$executeRawUnsafe(`
      INSERT INTO "decision_evidence"
        ("decision_id", "position", "source_label", "observation", "relevance")
      VALUES
        ('dec_migration_rehearsal', 0, 'Existing transcript', 'A preserved observation',
         'Existing evidence remains readable')
    `);
  } finally {
    await prisma.$disconnect();
  }
}

async function verifyMigratedState() {
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const [decision] = await prisma.$queryRawUnsafe(`
      SELECT
        "origin_stage"::text AS "originStage",
        "artifact_kind"::text AS "artifactKind",
        "needs_review" AS "needsReview",
        "artifact_id" AS "artifactId",
        "artifact_version" AS "artifactVersion"
      FROM "decisions"
      WHERE "id" = 'dec_migration_rehearsal'
    `);
    const [evidence] = await prisma.$queryRawUnsafe(`
      SELECT "evidence_reference_id" AS "evidenceReferenceId"
      FROM "decision_evidence"
      WHERE "decision_id" = 'dec_migration_rehearsal' AND "position" = 0
    `);
    const valid =
      decision?.originStage === "MANUAL" &&
      decision?.artifactKind === "MANUAL" &&
      decision?.needsReview === false &&
      decision?.artifactId === null &&
      decision?.artifactVersion === null &&
      evidence?.evidenceReferenceId === null;
    if (!valid) throw new Error("Existing decision or evidence meaning changed during migration.");
  } finally {
    await prisma.$disconnect();
  }
}

try {
  cpSync(resolve("prisma"), baselinePrismaPath, { recursive: true });
  for (const migration of releaseMigrations) {
    rmSync(resolve(baselinePrismaPath, "migrations", migration), { recursive: true });
  }

  await postgres.initialise();
  await postgres.start();
  await postgres.createDatabase(database);

  deploy(resolve(baselinePrismaPath, "schema.prisma"));
  await seedCompatibleState();
  deploy(resolve("prisma/schema.prisma"));
  await verifyMigratedState();
  console.log(
    "Existing compatible database migration rehearsal passed with preserved decision evidence.",
  );
} finally {
  await postgres.stop().catch(() => undefined);
  rmSync(rehearsalRoot, { recursive: true, force: true });
}
