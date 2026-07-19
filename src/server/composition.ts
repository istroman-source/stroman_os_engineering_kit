import "server-only";

import { createIdGenerator, systemClock } from "@/application/shared";
import type { Clock, IdGenerator } from "@/application/shared";
import type { ContentRepository } from "@/domain/content";
import type { DecisionRepository } from "@/domain/decision";
import type { EvaluationRepository, RubricRepository } from "@/domain/evaluation";
import type { ProjectRepository } from "@/domain/project";
import {
  PrismaContentRepository,
  PrismaDecisionRepository,
  PrismaEvaluationRepository,
  PrismaProjectRepository,
  PrismaRubricRepository,
  prisma,
} from "@/infrastructure/persistence/prisma";

/**
 * The single server-side composition boundary. It wires infrastructure adapters
 * to the application ports. It is a superset of every use case's dependency
 * object, so a route can pass the whole context to any use case (structural
 * typing selects the fields each one needs). Prisma is never re-exported here.
 */
export interface ApiContext {
  readonly projects: ProjectRepository;
  readonly content: ContentRepository;
  readonly rubrics: RubricRepository;
  readonly evaluations: EvaluationRepository;
  readonly decisions: DecisionRepository;
  readonly clock: Clock;
  readonly ids: IdGenerator;
}

export function createApiContext(): ApiContext {
  return {
    projects: new PrismaProjectRepository(prisma),
    content: new PrismaContentRepository(prisma),
    rubrics: new PrismaRubricRepository(prisma),
    evaluations: new PrismaEvaluationRepository(prisma),
    decisions: new PrismaDecisionRepository(prisma),
    clock: systemClock,
    ids: createIdGenerator(),
  };
}

let cached: ApiContext | undefined;

/** Shared context for route handlers (adapters are cheap; reuse one instance). */
export function getApiContext(): ApiContext {
  cached ??= createApiContext();
  return cached;
}

/**
 * Bounded readiness check for the database. Keeps Prisma out of route handlers.
 * Returns false rather than throwing, and never surfaces database error detail.
 */
export async function checkDatabaseReady(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
