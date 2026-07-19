import { type Brand, defineId } from "../shared";

/** Identity of a recorded decision. */
export type DecisionId = Brand<string, "DecisionId">;
export const DecisionId = defineId<"DecisionId">("DecisionId", "dec");
