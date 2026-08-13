import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const command = process.argv[2];
const actorUserId = process.env.STROMAN_PRIVATE_BETA_ADMIN_USER_ID?.trim();
const targetUserIdFromEnv = process.env.STROMAN_PRIVATE_BETA_TARGET_USER_ID?.trim();
const targetEmail = process.env.STROMAN_PRIVATE_BETA_TARGET_EMAIL?.trim().toLowerCase();

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}

function validUserId(value) {
  return typeof value === "string" && /^usr_[A-Za-z0-9]+$/.test(value);
}

if (!["owner-id", "list", "grant", "revoke"].includes(command ?? "")) {
  fail("Usage: npm run private-beta:access -- owner-id|list|grant|revoke");
} else if (command !== "owner-id" && !validUserId(actorUserId)) {
  fail("STROMAN_PRIVATE_BETA_ADMIN_USER_ID must identify the active beta owner.");
} else {
  const prisma = new PrismaClient({ log: ["error"] });
  try {
    if (command === "owner-id") {
      const owners = await prisma.privateBetaAccess.findMany({
        where: { role: "OWNER", revokedAt: null },
        select: { userId: true },
        take: 2,
      });
      if (owners.length !== 1) {
        throw new Error("Expected exactly one active private-beta owner.");
      }
      process.stdout.write(`${owners[0].userId}\n`);
    } else {
      const actorAccess = await prisma.privateBetaAccess.findUnique({
        where: { userId: actorUserId },
      });
      if (!actorAccess || actorAccess.role !== "OWNER" || actorAccess.revokedAt) {
        throw new Error("The configured administrator is not an active beta owner.");
      }

      if (command === "list") {
        const rows = await prisma.privateBetaAccess.findMany({ orderBy: { grantedAt: "asc" } });
        process.stdout.write(
          `${JSON.stringify(
            rows.map((row) => ({
              userId: row.userId,
              role: row.role,
              status: row.revokedAt ? "REVOKED" : "ACTIVE",
              grantedAt: row.grantedAt.toISOString(),
              revokedAt: row.revokedAt?.toISOString() ?? null,
            })),
            null,
            2,
          )}\n`,
        );
      } else {
        let targetUserId = targetUserIdFromEnv;
        if (!targetUserId && targetEmail) {
          const identities = await prisma.userIdentity.findMany({
            where: { normalizedEmail: targetEmail },
            orderBy: { lastAuthenticatedAt: "desc" },
            select: { userId: true },
            distinct: ["userId"],
            take: 2,
          });
          if (identities.length > 1) {
            throw new Error(
              "That email resolves to multiple internal users; use STROMAN_PRIVATE_BETA_TARGET_USER_ID.",
            );
          }
          targetUserId = identities[0]?.userId;
        }
        if (!validUserId(targetUserId)) {
          throw new Error(
            "Set STROMAN_PRIVATE_BETA_TARGET_USER_ID, or set STROMAN_PRIVATE_BETA_TARGET_EMAIL after that tester has signed in once.",
          );
        }
        const user = await prisma.user.findUnique({ where: { id: targetUserId } });
        if (!user || user.status !== "ACTIVE") {
          throw new Error("The target is not an active Stroman user.");
        }

        const now = new Date();
        if (command === "grant") {
          const current = await prisma.privateBetaAccess.findUnique({
            where: { userId: targetUserId },
          });
          if (current?.role === "OWNER") {
            throw new Error("The initial owner cannot be changed by this command.");
          }
          await prisma.$transaction(async (tx) => {
            await tx.privateBetaAccess.upsert({
              where: { userId: targetUserId },
              create: {
                userId: targetUserId,
                role: "TESTER",
                grantedByUserId: actorUserId,
                grantedAt: now,
              },
              update: {
                grantedByUserId: actorUserId,
                grantedAt: now,
                revokedAt: null,
              },
            });
            await tx.privateBetaAccessEvent.create({
              data: {
                id: `pbe_${randomUUID().replaceAll("-", "")}`,
                actorUserId,
                targetUserId,
                action: "ACCESS_GRANTED",
                occurredAt: now,
              },
            });
          });
          process.stdout.write(`Access granted for internal user ${targetUserId}.\n`);
        } else {
          const current = await prisma.privateBetaAccess.findUnique({
            where: { userId: targetUserId },
          });
          if (!current) throw new Error("The target has no private-beta access record.");
          if (current.role === "OWNER") {
            throw new Error("The initial owner cannot be revoked by this command.");
          }
          if (!current.revokedAt) {
            await prisma.$transaction(async (tx) => {
              await tx.privateBetaAccess.update({
                where: { userId: targetUserId },
                data: { revokedAt: now },
              });
              await tx.privateBetaAccessEvent.create({
                data: {
                  id: `pbe_${randomUUID().replaceAll("-", "")}`,
                  actorUserId,
                  targetUserId,
                  action: "ACCESS_REVOKED",
                  occurredAt: now,
                },
              });
            });
          }
          process.stdout.write(`Access revoked for internal user ${targetUserId}.\n`);
        }
      }
    }
  } catch (error) {
    fail(error instanceof Error ? error.message : "Private-beta access operation failed.");
  } finally {
    await prisma.$disconnect();
  }
}
