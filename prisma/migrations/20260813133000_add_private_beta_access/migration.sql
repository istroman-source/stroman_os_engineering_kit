CREATE TYPE "PrivateBetaRole" AS ENUM ('OWNER', 'TESTER');
CREATE TYPE "PrivateBetaAccessAction" AS ENUM ('OWNER_BOOTSTRAPPED', 'ACCESS_GRANTED', 'ACCESS_REVOKED');

CREATE TABLE "private_beta_access" (
    "user_id" TEXT NOT NULL,
    "role" "PrivateBetaRole" NOT NULL,
    "granted_by_user_id" TEXT,
    "bootstrap_key" TEXT,
    "granted_at" TIMESTAMPTZ(3) NOT NULL,
    "revoked_at" TIMESTAMPTZ(3),
    CONSTRAINT "private_beta_access_pkey" PRIMARY KEY ("user_id")
);

CREATE TABLE "private_beta_access_events" (
    "id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "target_user_id" TEXT NOT NULL,
    "action" "PrivateBetaAccessAction" NOT NULL,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "private_beta_access_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "private_beta_access_bootstrap_key_key" ON "private_beta_access"("bootstrap_key");
CREATE INDEX "private_beta_access_role_revoked_at_idx" ON "private_beta_access"("role", "revoked_at");
CREATE INDEX "private_beta_access_events_target_user_id_occurred_at_idx" ON "private_beta_access_events"("target_user_id", "occurred_at");
CREATE INDEX "private_beta_access_events_actor_user_id_occurred_at_idx" ON "private_beta_access_events"("actor_user_id", "occurred_at");

ALTER TABLE "private_beta_access"
  ADD CONSTRAINT "private_beta_access_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
