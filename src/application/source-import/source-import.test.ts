import { describe, expect, it } from "vitest";
import { OwnerId, ProjectId, createProject, makeProjectName } from "@/domain/project";
import { InMemoryProjectRepository } from "../../../test/adapters/in-memory-repositories";
import { FixedClock, SequentialIdGenerator } from "../../../test/adapters/fakes";
import {
  InMemorySourceImportRepository,
  InMemorySourceStorage,
} from "../../../test/adapters/in-memory-source-import";
import { importProjectSource, parseTranscript, TranscriptParseError } from "./source-import";

const OWNER = OwnerId.unsafe("usr_00000001");
const OTHER = OwnerId.unsafe("usr_00000002");
const PROJECT = ProjectId.unsafe("proj_00000001");
const NOW = new Date("2026-07-29T12:00:00Z");

function env() {
  const projects = new InMemoryProjectRepository();
  const name = makeProjectName("Documentary");
  if (!name.ok) throw name.error;
  projects.seed(createProject({ id: PROJECT, ownerId: OWNER, name: name.value, now: NOW }));
  return {
    projects,
    imports: new InMemorySourceImportRepository(),
    storage: new InMemorySourceStorage(),
    ids: new SequentialIdGenerator(),
    clock: new FixedClock(NOW),
  };
}

describe("transcript import", () => {
  it("preserves SRT cue ordering and timestamps", () => {
    const parsed = parseTranscript(
      "1\n00:00:02,000 --> 00:00:03,250\nSecond\n\n2\n00:00:04,000 --> 00:00:05,000\nThird",
      "srt",
    );
    expect(parsed.segments).toMatchObject([
      { sequence: 0, text: "Second", startMs: 2000, endMs: 3250 },
      { sequence: 1, text: "Third", startMs: 4000, endMs: 5000 },
    ]);
  });

  it("normalizes JSON speakers in first-seen order", () => {
    const parsed = parseTranscript(
      JSON.stringify([
        { speaker: "Director", text: "Action", startMs: 0, endMs: 100 },
        { speaker: "Guest", text: "Hello" },
        { speaker: "Director", text: "Cut" },
      ]),
      "json",
    );
    expect(parsed.speakers).toEqual([{ label: "Director" }, { label: "Guest" }]);
    expect(parsed.segments.map((value) => value.speakerIndex)).toEqual([0, 1, 0]);
  });

  it("returns a typed terminal parser failure", () => {
    expect(() => parseTranscript("not cues", "vtt")).toThrow(TranscriptParseError);
  });

  it("atomically persists a transcript and makes repeated imports idempotent", async () => {
    const deps = env();
    const input = {
      actorId: OWNER,
      projectId: PROJECT,
      idempotencyKey: "upload-1",
      sourceName: "interview.txt",
      contentType: "text/plain",
      bytes: new TextEncoder().encode("First paragraph\n\nSecond paragraph"),
      contentHash: "sha256:abc",
      transcriptFormat: "text" as const,
    };
    const first = await importProjectSource(deps, input);
    const second = await importProjectSource(deps, input);
    expect(first.ok).toBe(true);
    expect(second).toEqual(first);
    expect(deps.imports.receipts.size).toBe(1);
    expect(deps.imports.media.size).toBe(1);
    expect(deps.imports.transcripts.size).toBe(1);
    expect(
      [...deps.imports.transcripts.values()][0]?.segments.map((value) => value.sequence),
    ).toEqual([0, 1]);
  });

  it("preserves project isolation and removes stored bytes after an atomic failure", async () => {
    const deps = env();
    const denied = await importProjectSource(deps, {
      actorId: OTHER,
      projectId: PROJECT,
      idempotencyKey: "denied",
      sourceName: "clip.mov",
      contentType: "video/quicktime",
      bytes: new Uint8Array([1]),
      contentHash: "sha256:denied",
    });
    expect(denied.ok).toBe(false);
    deps.imports.failNext = true;
    const failed = await importProjectSource(deps, {
      actorId: OWNER,
      projectId: PROJECT,
      idempotencyKey: "fails",
      sourceName: "clip.mov",
      contentType: "video/quicktime",
      bytes: new Uint8Array([1, 2]),
      contentHash: "sha256:fails",
    });
    expect(failed.ok).toBe(false);
    expect(deps.storage.values.size).toBe(0);
    expect(deps.imports.media.size).toBe(0);
  });
});
