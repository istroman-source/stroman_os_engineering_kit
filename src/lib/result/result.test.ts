import { describe, expect, it } from "vitest";
import { err, fromPromise, fromThrowable, isErr, isOk, map, mapErr, ok, unwrapOr } from "./result";

describe("result", () => {
  it("constructs ok and err values", () => {
    expect(ok(1)).toEqual({ ok: true, value: 1 });
    expect(err("bad")).toEqual({ ok: false, error: "bad" });
  });

  it("narrows with isOk / isErr", () => {
    expect(isOk(ok(1))).toBe(true);
    expect(isErr(err("x"))).toBe(true);
  });

  it("maps success and passes errors through", () => {
    expect(map(ok(2), (n) => n * 3)).toEqual(ok(6));
    expect(map(err<string>("e"), (n: number) => n * 3)).toEqual(err("e"));
  });

  it("maps errors and passes successes through", () => {
    expect(mapErr(err("e"), (e) => `${e}!`)).toEqual(err("e!"));
    expect(mapErr(ok(1), (e: string) => `${e}!`)).toEqual(ok(1));
  });

  it("unwrapOr returns value or fallback", () => {
    expect(unwrapOr(ok(5), 0)).toBe(5);
    expect(unwrapOr(err("e"), 0)).toBe(0);
  });

  it("captures throwing functions", () => {
    const good = fromThrowable(() => 42);
    expect(good).toEqual(ok(42));
    const bad = fromThrowable(() => {
      throw new Error("boom");
    });
    expect(isErr(bad) && bad.error.message).toBe("boom");
  });

  it("captures promise outcomes", async () => {
    expect(await fromPromise(Promise.resolve(1))).toEqual(ok(1));
    const rejected = await fromPromise(Promise.reject(new Error("no")));
    expect(isErr(rejected) && rejected.error.message).toBe("no");
  });
});
