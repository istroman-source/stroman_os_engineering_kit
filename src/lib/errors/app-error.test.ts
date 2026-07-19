import { describe, expect, it } from "vitest";
import {
  AppError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  isAppError,
  toAppError,
} from "./app-error";

describe("AppError", () => {
  it("maps codes to HTTP statuses", () => {
    expect(new ValidationError().httpStatus).toBe(400);
    expect(new NotFoundError().httpStatus).toBe(404);
    expect(new ForbiddenError().httpStatus).toBe(403);
    expect(new AppError("INTERNAL", "x").httpStatus).toBe(500);
  });

  it("sets subclass name and operational flag", () => {
    const error = new NotFoundError("missing");
    expect(error.name).toBe("NotFoundError");
    expect(error.isOperational).toBe(true);
    expect(error).toBeInstanceOf(AppError);
  });

  it("serializes without leaking the cause", () => {
    const error = new ValidationError("bad", { cause: new Error("secret") });
    expect(error.toJSON()).toEqual({
      name: "ValidationError",
      code: "VALIDATION",
      message: "bad",
      httpStatus: 400,
    });
  });

  it("carries context", () => {
    const error = new ValidationError("bad", { context: { field: "email" } });
    expect(error.context).toEqual({ field: "email" });
  });

  it("recognizes and normalizes errors", () => {
    expect(isAppError(new ValidationError())).toBe(true);
    expect(isAppError(new Error("plain"))).toBe(false);

    const normalized = toAppError(new Error("plain"));
    expect(normalized.code).toBe("INTERNAL");
    expect(normalized.message).toBe("plain");

    const passthrough = new NotFoundError();
    expect(toAppError(passthrough)).toBe(passthrough);
  });
});
