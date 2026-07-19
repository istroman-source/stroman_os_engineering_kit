import { type Brand, defineId } from "../shared";

/** Identity of a knowledge-base content item. */
export type ContentItemId = Brand<string, "ContentItemId">;
export const ContentItemId = defineId<"ContentItemId">("ContentItemId", "cnt");
