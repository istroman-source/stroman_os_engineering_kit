import { describe, expect, it } from "vitest";
import { HttpError } from "./http-error";
import { requireBoundedContentLength } from "./upload-limit";

describe("upload request limits", () => {
  it("rejects missing lengths before request bodies are parsed", () => {
    expect(() => requireBoundedContentLength(new Headers(), 100)).toThrowError(
      expect.objectContaining<Partial<HttpError>>({ status: 411, code: "CONTENT_LENGTH_REQUIRED" }),
    );
  });

  it("rejects oversized and malformed lengths", () => {
    expect(() =>
      requireBoundedContentLength(new Headers({ "content-length": "101" }), 100),
    ).toThrowError(expect.objectContaining<Partial<HttpError>>({ status: 413 }));
    expect(() =>
      requireBoundedContentLength(new Headers({ "content-length": "unknown" }), 100),
    ).toThrowError(expect.objectContaining<Partial<HttpError>>({ status: 400 }));
  });

  it("accepts a bounded request", () => {
    expect(requireBoundedContentLength(new Headers({ "content-length": "100" }), 100)).toBe(100);
  });
});
