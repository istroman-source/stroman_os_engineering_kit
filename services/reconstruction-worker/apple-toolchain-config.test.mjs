import { describe, expect, it } from "vitest";
import {
  appleSwiftCompileArguments,
  compatibleAppleSdkPath,
} from "../../scripts/apple-toolchain-config.mjs";

describe("Apple reconstruction toolchain configuration", () => {
  it("uses an explicit SDK path in preference to the local compatibility fallback", () => {
    expect(
      compatibleAppleSdkPath(
        { STROMAN_APPLE_RECONSTRUCTION_SDK_PATH: "/opt/custom.sdk" },
        () => true,
      ),
    ).toBe("/opt/custom.sdk");
  });

  it("uses the installed compatibility SDK when Apple updates Swift ahead of the active SDK", () => {
    expect(compatibleAppleSdkPath({}, (candidate) => candidate.endsWith("MacOSX15.4.sdk"))).toMatch(
      /MacOSX15\.4\.sdk$/,
    );
  });

  it("keeps the default toolchain when no compatible fallback is installed", () => {
    expect(compatibleAppleSdkPath({}, () => false)).toBeUndefined();
  });

  it("makes the module cache writable and includes the selected SDK", () => {
    expect(
      appleSwiftCompileArguments({
        source: "worker.swift",
        binary: "worker",
        moduleCachePath: ".data/module-cache",
        sdkPath: "/opt/sdk",
      }),
    ).toEqual([
      "-parse-as-library",
      "-module-cache-path",
      ".data/module-cache",
      "-sdk",
      "/opt/sdk",
      "worker.swift",
      "-o",
      "worker",
    ]);
  });
});
