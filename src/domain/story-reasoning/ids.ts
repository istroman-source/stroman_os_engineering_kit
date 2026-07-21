import { type Brand, defineId } from "@/domain/shared";

/** Identifiers for the Story Reasoning Engine. */
export type StoryAngleId = Brand<string, "StoryAngleId">;
export const StoryAngleId = defineId<"StoryAngleId">("StoryAngleId", "ang");

export type StoryEvidenceId = Brand<string, "StoryEvidenceId">;
export const StoryEvidenceId = defineId<"StoryEvidenceId">("StoryEvidenceId", "sev");

export type StoryCritiqueId = Brand<string, "StoryCritiqueId">;
export const StoryCritiqueId = defineId<"StoryCritiqueId">("StoryCritiqueId", "scr");
