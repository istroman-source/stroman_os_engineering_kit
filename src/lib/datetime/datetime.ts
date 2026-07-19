import { err, ok, type Result } from "@/lib/result";

/**
 * Date/time utilities.
 *
 * All functions are pure. Time is obtained through an injectable Clock so code
 * that reads "now" stays deterministic under test. ISO 8601 (UTC) is the wire
 * format everywhere.
 */

export type Clock = () => Date;

export const systemClock: Clock = () => new Date();

const MS_PER_DAY = 86_400_000;

export function nowIso(clock: Clock = systemClock): string {
  return clock().toISOString();
}

export function toIso(date: Date): string {
  return date.toISOString();
}

/** Parse an ISO string, returning a Result rather than an Invalid Date. */
export function parseIso(value: string): Result<Date, Error> {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return err(new Error(`Invalid ISO date: ${value}`));
  }
  return ok(date);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/** Whole-day difference (a - b), truncated toward zero. */
export function differenceInDays(a: Date, b: Date): number {
  return Math.trunc((a.getTime() - b.getTime()) / MS_PER_DAY);
}

/** YYYY-MM-DD (UTC) portion of a date. */
export function isoDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}
