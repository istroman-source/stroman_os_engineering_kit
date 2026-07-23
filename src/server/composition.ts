import "server-only";

import { createIdGenerator, systemClock } from "@/application/shared";
import type { Clock, IdGenerator } from "@/application/shared";
import type { MaterializationRepository } from "@/application/knowledge-acquisition";
import type { ContentRepository } from "@/domain/content";
import type { AnalysisRepository } from "@/domain/analysis";
import type { DecisionRepository } from "@/domain/decision";
import type { EvidenceReferenceRepository } from "@/domain/evidence";
import type { CreativeBriefRepository } from "@/domain/creative";
import type { EvaluationRepository, RubricRepository } from "@/domain/evaluation";
import type { IdentityRepository } from "@/domain/identity";
import type {
  AcquisitionRunRepository,
  KnowledgeObservationRepository,
  KnowledgeReviewRepository,
  KnowledgeSourceRepository,
  SourceDocumentRepository,
} from "@/domain/knowledge-acquisition";
import type { MediaAssetRepository, TranscriptDocumentRepository } from "@/domain/media-transcript";
import type {
  EntityRepository,
  InsightRepository,
  MemoryRepository,
  RelationshipRepository,
  SourceRepository,
} from "@/domain/memory";
import type { ProjectRepository } from "@/domain/project";
import type {
  StoryAngleRepository,
  StoryCritiqueRepository,
  StoryEvidenceRepository,
} from "@/domain/story-reasoning";
import {
  PrismaContentRepository,
  PrismaCreativeBriefRepository,
  PrismaDecisionRepository,
  PrismaEntityRepository,
  PrismaEvaluationRepository,
  PrismaIdentityRepository,
  PrismaInsightRepository,
  PrismaMemoryRepository,
  PrismaProjectRepository,
  PrismaRelationshipRepository,
  PrismaRubricRepository,
  PrismaSourceRepository,
  PrismaStoryAngleRepository,
  PrismaStoryCritiqueRepository,
  PrismaStoryEvidenceRepository,
  PrismaKnowledgeSourceRepository,
  PrismaSourceDocumentRepository,
  PrismaAcquisitionRunRepository,
  PrismaKnowledgeObservationRepository,
  PrismaKnowledgeReviewRepository,
  PrismaMaterializationRepository,
  PrismaMediaAssetRepository,
  PrismaTranscriptDocumentRepository,
  PrismaEvidenceReferenceRepository,
  PrismaAnalysisRepository,
  prisma,
} from "@/infrastructure/persistence/prisma";
import { createProductionAuthGateway, createProductionAuthenticator } from "@/server/auth/factory";
import { isCookieSecure } from "@/server/auth/config";
import type { AuthGateway, RequestAuthenticator } from "@/server/auth/types";

/**
 * The single server-side composition boundary. It wires infrastructure adapters
 * to the application ports. It is a superset of every use case's dependency
 * object, so a route can pass the whole context to any use case (structural
 * typing selects the fields each one needs). Prisma is never re-exported here.
 */
export interface ApiContext {
  readonly analyses: AnalysisRepository;
  readonly projects: ProjectRepository;
  readonly content: ContentRepository;
  readonly rubrics: RubricRepository;
  readonly evaluations: EvaluationRepository;
  readonly decisions: DecisionRepository;
  readonly identity: IdentityRepository;
  readonly creativeBriefs: CreativeBriefRepository;
  readonly entities: EntityRepository;
  readonly sources: SourceRepository;
  readonly memories: MemoryRepository;
  readonly relationships: RelationshipRepository;
  readonly insights: InsightRepository;
  readonly storyAngles: StoryAngleRepository;
  readonly storyEvidence: StoryEvidenceRepository;
  readonly storyCritiques: StoryCritiqueRepository;
  readonly knowledgeSources: KnowledgeSourceRepository;
  readonly sourceDocuments: SourceDocumentRepository;
  readonly acquisitionRuns: AcquisitionRunRepository;
  readonly knowledgeObservations: KnowledgeObservationRepository;
  readonly knowledgeReviews: KnowledgeReviewRepository;
  readonly materializations: MaterializationRepository;
  readonly mediaAssets: MediaAssetRepository;
  readonly transcripts: TranscriptDocumentRepository;
  readonly evidenceReferences: EvidenceReferenceRepository;
  readonly clock: Clock;
  readonly ids: IdGenerator;
}

export function createApiContext(): ApiContext {
  return {
    analyses: new PrismaAnalysisRepository(prisma),
    projects: new PrismaProjectRepository(prisma),
    content: new PrismaContentRepository(prisma),
    rubrics: new PrismaRubricRepository(prisma),
    evaluations: new PrismaEvaluationRepository(prisma),
    decisions: new PrismaDecisionRepository(prisma),
    identity: new PrismaIdentityRepository(prisma),
    creativeBriefs: new PrismaCreativeBriefRepository(prisma),
    entities: new PrismaEntityRepository(prisma),
    sources: new PrismaSourceRepository(prisma),
    memories: new PrismaMemoryRepository(prisma),
    relationships: new PrismaRelationshipRepository(prisma),
    insights: new PrismaInsightRepository(prisma),
    storyAngles: new PrismaStoryAngleRepository(prisma),
    storyEvidence: new PrismaStoryEvidenceRepository(prisma),
    storyCritiques: new PrismaStoryCritiqueRepository(prisma),
    knowledgeSources: new PrismaKnowledgeSourceRepository(prisma),
    sourceDocuments: new PrismaSourceDocumentRepository(prisma),
    acquisitionRuns: new PrismaAcquisitionRunRepository(prisma),
    knowledgeObservations: new PrismaKnowledgeObservationRepository(prisma),
    knowledgeReviews: new PrismaKnowledgeReviewRepository(prisma),
    materializations: new PrismaMaterializationRepository(prisma),
    mediaAssets: new PrismaMediaAssetRepository(prisma),
    transcripts: new PrismaTranscriptDocumentRepository(prisma),
    evidenceReferences: new PrismaEvidenceReferenceRepository(prisma),
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

// --- Authentication composition -------------------------------------------------
//
// The request authenticator and auth gateway are composed here so that in
// PRODUCTION only the real Supabase adapters are ever selected. A test double can
// be injected ONLY through the explicit setters below, which THROW if invoked in
// production. There is no environment variable, header, query parameter, or cookie
// that can substitute an authenticator at runtime — this is the guarantee that the
// former `X-Stroman-Actor-Id` bypass is not reintroduced under a new name.

let authenticatorOverride: RequestAuthenticator | undefined;
let cachedAuthenticator: RequestAuthenticator | undefined;
let gatewayOverride: AuthGateway | undefined;
let cachedGateway: AuthGateway | undefined;

function assertNotProduction(what: string): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error(`${what} cannot be injected in production`);
  }
}

export function getRequestAuthenticator(): RequestAuthenticator {
  if (authenticatorOverride) return authenticatorOverride;
  cachedAuthenticator ??= createProductionAuthenticator(isCookieSecure());
  return cachedAuthenticator;
}

export function getAuthGateway(): AuthGateway {
  if (gatewayOverride) return gatewayOverride;
  cachedGateway ??= createProductionAuthGateway();
  return cachedGateway;
}

/** Test-only: inject a deterministic authenticator. Throws in production. */
export function setRequestAuthenticatorForTests(authenticator: RequestAuthenticator): void {
  assertNotProduction("A test authenticator");
  authenticatorOverride = authenticator;
}

/** Test-only: inject a fake auth gateway. Throws in production. */
export function setAuthGatewayForTests(gateway: AuthGateway): void {
  assertNotProduction("A test auth gateway");
  gatewayOverride = gateway;
}

/** Test-only: clear injected auth doubles. Throws in production. */
export function resetAuthForTests(): void {
  assertNotProduction("Auth overrides");
  authenticatorOverride = undefined;
  gatewayOverride = undefined;
}
