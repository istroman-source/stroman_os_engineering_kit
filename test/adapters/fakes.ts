import type { Result } from "@/lib/result";
import type { Clock } from "@/application/shared/clock";
import type { IdGenerator } from "@/application/shared/id-generator";
import type { AiError, AiRecommendation, AiRecommender } from "@/domain/ai";

/** A clock fixed to a single instant, adjustable for multi-step scenarios. */
export class FixedClock implements Clock {
  constructor(private current: Date) {}
  now(): Date {
    return this.current;
  }
  set(date: Date): void {
    this.current = date;
  }
}

/** Deterministic, monotonically increasing identifiers per prefix-agnostic counter. */
export class SequentialIdGenerator implements IdGenerator {
  private counter = 0;
  generate(prefix: string): string {
    this.counter += 1;
    return `${prefix}_${String(this.counter).padStart(8, "0")}`;
  }
}

/** An AiRecommender that returns a preconfigured result. */
export class StubAiRecommender implements AiRecommender {
  constructor(private readonly result: Result<AiRecommendation, AiError>) {}
  async recommend(): Promise<Result<AiRecommendation, AiError>> {
    return this.result;
  }
}
