"use client";

import { apiGetWithEtag, apiPostWithEtag } from "@/ui/auth/api-client";

export type SourceStatus = "ACTIVE" | "PAUSED" | "ARCHIVED";
export interface KnowledgeSource {
  id: string;
  name: string;
  sourceType: "UPLOAD" | "WEB_PAGE" | "MANUAL";
  origin: string | null;
  sourceReliability: "VERIFIED" | "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
  status: SourceStatus;
  createdAt: string;
}
export interface SourceDocument {
  id: string;
  knowledgeSourceId: string;
  documentType: string;
  contentHash: string;
  title: string;
  mediaType: string | null;
  byteSize: number | null;
  createdAt: string;
}
export interface RunSummary {
  documentsProcessed: number;
  observationsCreated: number;
  failureCount: number;
}
export interface AcquisitionRun {
  id: string;
  knowledgeSourceId: string;
  extractor: string;
  extractorVersion: string;
  status: "PENDING" | "RUNNING" | "SUCCEEDED" | "PARTIALLY_SUCCEEDED" | "FAILED";
  startedAt: string | null;
  finishedAt: string | null;
  summary: RunSummary | null;
  createdAt: string;
}
export type ObservationPayload =
  | { kind: "ENTITY"; name: string; entityKind: string }
  | { kind: "MEMORY"; content: string }
  | { kind: "INSIGHT"; statement: string }
  | { kind: "RELATIONSHIP"; relationType: string; fromLabel: string; toLabel: string };
export interface KnowledgeObservation {
  id: string;
  observationType: ObservationPayload["kind"];
  payload: ObservationPayload;
  evidence: {
    sourceDocumentId: string;
    knowledgeSourceId: string;
    acquisitionRunId: string | null;
    location: Record<string, unknown> | null;
  };
  confidence: number | null;
  createdBy: string;
  status: "PENDING_REVIEW" | "ACCEPTED" | "REJECTED";
  createdAt: string;
}
export interface KnowledgeReview {
  id: string;
  outcome: "ACCEPT" | "REJECT" | "EDIT_AND_ACCEPT";
  note: string | null;
  editedPayload: ObservationPayload | null;
  reviewedAt: string;
}
export interface ObservationWithReview {
  observation: KnowledgeObservation;
  review: KnowledgeReview | null;
}
export interface MaterializationResult {
  knowledgeObservationId: string;
  knowledgeReviewId: string;
  record: { recordType: string; recordId: string };
  createdAt: string;
}
export type WithEtag<T> = { data: T; etag: string | null };

const list = async <T>(path: string) => (await apiGetWithEtag<{ items: T[] }>(path)).data.items;
const enc = encodeURIComponent;
export const listSources = () => list<KnowledgeSource>("/api/v1/knowledge-sources");
export const createSource = (body: {
  name: string;
  sourceType: string;
  origin?: string | null;
  sourceReliability: string;
}) => apiPostWithEtag<KnowledgeSource>("/api/v1/knowledge-sources", body);
export const getSource = (id: string) =>
  apiGetWithEtag<KnowledgeSource>(`/api/v1/knowledge-sources/${enc(id)}`);
const sourceAction = (id: string, action: string, etag: string) =>
  apiPostWithEtag<KnowledgeSource>(`/api/v1/knowledge-sources/${enc(id)}/${action}`, {}, etag);
export const pauseSource = (id: string, e: string) => sourceAction(id, "pause", e);
export const resumeSource = (id: string, e: string) => sourceAction(id, "resume", e);
export const archiveSource = (id: string, e: string) => sourceAction(id, "archive", e);
export const listDocuments = (id: string) =>
  list<SourceDocument>(`/api/v1/knowledge-sources/${enc(id)}/documents`);
export const addDocument = (
  id: string,
  body: {
    documentType: string;
    contentHash: string;
    title: string;
    mediaType?: string | null;
    byteSize?: number | null;
  },
) => apiPostWithEtag<SourceDocument>(`/api/v1/knowledge-sources/${enc(id)}/documents`, body);
export const listRuns = (id: string) =>
  list<AcquisitionRun>(`/api/v1/knowledge-sources/${enc(id)}/runs`);
export const createRun = (id: string, body: { extractor: string; extractorVersion: string }) =>
  apiPostWithEtag<AcquisitionRun>(`/api/v1/knowledge-sources/${enc(id)}/runs`, body);
export const getRun = (id: string) =>
  apiGetWithEtag<AcquisitionRun>(`/api/v1/acquisition-runs/${enc(id)}`);
const runAction = (id: string, action: string, body: unknown, e: string) =>
  apiPostWithEtag<AcquisitionRun>(`/api/v1/acquisition-runs/${enc(id)}/${action}`, body, e);
export const startRun = (id: string, e: string) => runAction(id, "start", {}, e);
export const completeRun = (id: string, body: { status: string; summary: RunSummary }, e: string) =>
  runAction(id, "complete", body, e);
export const failRun = (id: string, e: string) => runAction(id, "fail", {}, e);
export const listObservationsByRun = (id: string) =>
  list<KnowledgeObservation>(`/api/v1/acquisition-runs/${enc(id)}/observations`);
export const getObservation = (id: string) =>
  apiGetWithEtag<ObservationWithReview>(`/api/v1/knowledge-observations/${enc(id)}`);
export const reviewObservation = (
  id: string,
  body: { outcome: string; note?: string | null; editedPayload?: ObservationPayload },
  e: string,
) =>
  apiPostWithEtag<ObservationWithReview>(
    `/api/v1/knowledge-observations/${enc(id)}/review`,
    body,
    e,
  );
export const materializeObservation = (id: string, resolution: Record<string, unknown>) =>
  apiPostWithEtag<MaterializationResult>(`/api/v1/knowledge-observations/${enc(id)}/materialize`, {
    resolution,
  });
