import { err, ok, type Result } from "@/lib/result";
import { InvalidStateTransitionError } from "./domain-error";

/**
 * A minimal explicit state machine. Given an exhaustive map of allowed
 * transitions (terminal states map to an empty list), it answers whether a
 * transition is legal and produces a typed error when it is not. This keeps
 * lifecycle rules declarative and testable without an inheritance framework.
 */
export interface StateMachine<S extends string> {
  can(from: S, to: S): boolean;
  assert(entity: string, from: S, to: S): Result<S, InvalidStateTransitionError>;
}

export function defineStateMachine<S extends string>(
  transitions: Readonly<Record<S, readonly S[]>>,
): StateMachine<S> {
  return {
    can(from, to) {
      return transitions[from].includes(to);
    },
    assert(entity, from, to) {
      return transitions[from].includes(to)
        ? ok(to)
        : err(new InvalidStateTransitionError(entity, from, to));
    },
  };
}
