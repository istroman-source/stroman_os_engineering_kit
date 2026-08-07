import { type Brand, defineId } from "../shared";
export type RetrospectiveId = Brand<string, "RetrospectiveId">;
export const RetrospectiveId = defineId<"RetrospectiveId">("RetrospectiveId", "retro");
export type LessonId = Brand<string, "LessonId">;
export const LessonId = defineId<"LessonId">("LessonId", "lesson");
