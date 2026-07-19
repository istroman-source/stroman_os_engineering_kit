/**
 * Application-owned clock port. Use cases read "now" through this so their
 * behavior is deterministic under test. The domain still receives a plain
 * `Date`; the application is responsible for supplying it.
 */
export interface Clock {
  now(): Date;
}

export const systemClock: Clock = {
  now: () => new Date(),
};
