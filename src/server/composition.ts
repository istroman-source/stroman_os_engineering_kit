import "server-only";

import { createIdGenerator, systemClock } from "@/application/shared";
import type { Clock, IdGenerator } from "@/application/shared";
import {
  PrivateBetaAccessService,
  type PrivateBetaAccessAuthorizer,
  type PrivateBetaAccessRepository,
} from "@/application/private-beta";
import type { SourceImportRepository, SourceStorage } from "@/application/source-import";
import type { MaterializationRepository } from "@/application/knowledge-acquisition";
import type { ContentRepository } from "@/domain/content";
import type { AuditIntegrationRepository } from "@/domain/audit-integration";
import type { AnalysisRepository, GroundedEditorialAnalyzer } from "@/domain/analysis";
import type { DecisionRepository } from "@/domain/decision";
import type { EvidenceReferenceRepository } from "@/domain/evidence";
import type {
  CreativeBriefRepository,
  CreativeReasoningProvider,
  LocationReconstructionProvider,
  LocationReconstructionRepository,
  LocationGeometryInspector,
} from "@/domain/creative";
import type {
  EvaluationRepository,
  ReviewRunRepository,
  RubricRepository,
} from "@/domain/evaluation";
import type { IdentityRepository } from "@/domain/identity";
import type { RetrospectiveRepository } from "@/domain/learning";
import type {
  AcquisitionRunRepository,
  KnowledgeObservationRepository,
  KnowledgeReviewRepository,
  KnowledgeSourceRepository,
  SourceDocumentRepository,
} from "@/domain/knowledge-acquisition";
import type { MediaAssetRepository, TranscriptDocumentRepository } from "@/domain/media-transcript";
import type { VisualMediaAnalyzer } from "@/domain/media-analysis";
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
  PrismaReviewRunRepository,
  PrismaRetrospectiveRepository,
  PrismaIdentityRepository,
  PrismaPrivateBetaAccessRepository,
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
  PrismaSourceImportRepository,
  PrismaAuditIntegrationRepository,
  PrismaLocationReconstructionRepository,
  prisma,
} from "@/infrastructure/persistence/prisma";
import { FileSystemSourceStorage } from "@/infrastructure/storage/file-system-source-storage";
import { DeterministicGroundedAnalyzer } from "@/infrastructure/analysis";
import { createCreativeReasoningProvider } from "@/infrastructure/creative";
import { createVisualMediaAnalyzer } from "@/infrastructure/media-analysis";
import { createLocationReconstructionProvider } from "@/infrastructure/spatial/location-reconstruction-provider";
import type { PreparedLocationRepository } from "@/domain/location-library";
import { PrismaPreparedLocationRepository } from "@/infrastructure/persistence/prisma";
import { GlbLocationGeometryInspector } from "@/infrastructure/spatial/glb-metadata";
import { createProductionAuthGateway, createProductionAuthenticator } from "@/server/auth/factory";
import { isCookieSecure } from "@/server/auth/config";
import type { AuthGateway, RequestAuthenticator } from "@/server/auth/types";
import { getServerEnv } from "@/lib/env/env.server";

/**
 * The single server-side composition boundary. It wires infrastructure adapters
 * to the application ports. It is a superset of every use case's dependency
 * object, so a route can pass the whole context to any use case (structural
 * typing selects the fields each one needs). Prisma is never re-exported here.
 */
export interface ApiContext {
  readonly analyses: AnalysisRepository;
  readonly auditIntegrations: AuditIntegrationRepository;
  readonly projects: ProjectRepository;
  readonly content: ContentRepository;
  readonly rubrics: RubricRepository;
  readonly evaluations: EvaluationRepository;
  readonly reviewRuns: ReviewRunRepository;
  readonly retrospectives: RetrospectiveRepository;
  readonly decisions: DecisionRepository;
  readonly identity: IdentityRepository;
  readonly privateBetaAccess: PrivateBetaAccessRepository;
  readonly creativeBriefs: CreativeBriefRepository;
  readonly creativeReasoning: CreativeReasoningProvider;
  readonly locationReconstructions: LocationReconstructionRepository;
  readonly preparedLocations: PreparedLocationRepository;
  readonly locationReconstructionProvider: LocationReconstructionProvider;
  readonly locationGeometryInspector: LocationGeometryInspector;
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
  readonly sourceImports: SourceImportRepository;
  readonly sourceStorage: SourceStorage;
  readonly evidenceReferences: EvidenceReferenceRepository;
  readonly analyzer: GroundedEditorialAnalyzer;
  readonly visualMediaAnalyzer: VisualMediaAnalyzer;
  readonly clock: Clock;
  readonly ids: IdGenerator;
}

export function createApiContext(): ApiContext {
  return {
    analyses: new PrismaAnalysisRepository(prisma),
    auditIntegrations: new PrismaAuditIntegrationRepository(prisma),
    projects: new PrismaProjectRepository(prisma),
    content: new PrismaContentRepository(prisma),
    rubrics: new PrismaRubricRepository(prisma),
    evaluations: new PrismaEvaluationRepository(prisma),
    reviewRuns: new PrismaReviewRunRepository(prisma),
    retrospectives: new PrismaRetrospectiveRepository(prisma),
    decisions: new PrismaDecisionRepository(prisma),
    identity: new PrismaIdentityRepository(prisma),
    privateBetaAccess: new PrismaPrivateBetaAccessRepository(prisma),
    creativeBriefs: new PrismaCreativeBriefRepository(prisma),
    creativeReasoning: createCreativeReasoningProvider(),
    locationReconstructions: new PrismaLocationReconstructionRepository(prisma),
    preparedLocations: new PrismaPreparedLocationRepository(prisma),
    locationReconstructionProvider:
      locationReconstructionProviderOverride ?? createLocationReconstructionProvider(),
    locationGeometryInspector: new GlbLocationGeometryInspector(),
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
    sourceImports: new PrismaSourceImportRepository(prisma),
    sourceStorage: new FileSystemSourceStorage(
      process.env.STROMAN_SOURCE_STORAGE_PATH ?? `${process.cwd()}/.data/source-imports`,
    ),
    evidenceReferences: new PrismaEvidenceReferenceRepository(prisma),
    analyzer: new DeterministicGroundedAnalyzer(),
    visualMediaAnalyzer: createVisualMediaAnalyzer(),
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
let privateBetaAuthorizerOverride: PrivateBetaAccessAuthorizer | undefined;
let cachedPrivateBetaAuthorizer: PrivateBetaAccessAuthorizer | undefined;
let locationReconstructionProviderOverride: LocationReconstructionProvider | undefined;

const allowAllPrivateBetaForTests: PrivateBetaAccessAuthorizer = {
  authorize: async () => "TESTER",
};

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

export function getPrivateBetaAccessAuthorizer(): PrivateBetaAccessAuthorizer {
  if (privateBetaAuthorizerOverride) return privateBetaAuthorizerOverride;
  cachedPrivateBetaAuthorizer ??= new PrivateBetaAccessService({
    access: getApiContext().privateBetaAccess,
    bootstrapOwnerEmail: getServerEnv().STROMAN_PRIVATE_BETA_OWNER_EMAIL,
    now: () => systemClock.now(),
    eventId: () => createIdGenerator().generate("pbe"),
  });
  return cachedPrivateBetaAuthorizer;
}

/** Test-only: inject a deterministic authenticator. Throws in production. */
export function setRequestAuthenticatorForTests(authenticator: RequestAuthenticator): void {
  assertNotProduction("A test authenticator");
  authenticatorOverride = authenticator;
  privateBetaAuthorizerOverride ??= allowAllPrivateBetaForTests;
}

/** Test-only: override the persistent private-beta decision. */
export function setPrivateBetaAccessAuthorizerForTests(
  authorizer: PrivateBetaAccessAuthorizer,
): void {
  assertNotProduction("A private-beta authorizer");
  privateBetaAuthorizerOverride = authorizer;
}

/** Test-only: inject a fake auth gateway. Throws in production. */
export function setAuthGatewayForTests(gateway: AuthGateway): void {
  assertNotProduction("A test auth gateway");
  gatewayOverride = gateway;
}

/** Test-only: inject a reconstruction provider without making an external submission. */
export function setLocationReconstructionProviderForTests(
  provider: LocationReconstructionProvider,
): void {
  assertNotProduction("A test reconstruction provider");
  locationReconstructionProviderOverride = provider;
}

/** Test-only: clear injected auth doubles. Throws in production. */
export function resetAuthForTests(): void {
  assertNotProduction("Auth overrides");
  authenticatorOverride = undefined;
  gatewayOverride = undefined;
  privateBetaAuthorizerOverride = undefined;
  locationReconstructionProviderOverride = undefined;
}
