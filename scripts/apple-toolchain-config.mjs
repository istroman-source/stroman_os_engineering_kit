import { existsSync } from "node:fs";
import path from "node:path";

const commandLineToolsSdks = "/Library/Developer/CommandLineTools/SDKs";

/**
 * A small number of macOS releases can update Swift before the active SDK is
 * rebuilt. Apple Photogrammetry is available in the 15.4 SDK, so use it as a
 * narrowly-scoped compile fallback only when the operator has not supplied an
 * SDK path and it is installed locally.
 */
export function compatibleAppleSdkPath(environment = process.env, exists = existsSync) {
  if (environment.STROMAN_APPLE_RECONSTRUCTION_SDK_PATH) {
    return environment.STROMAN_APPLE_RECONSTRUCTION_SDK_PATH;
  }

  const fallback = path.join(commandLineToolsSdks, "MacOSX15.4.sdk");
  return exists(fallback) ? fallback : undefined;
}

export function appleSwiftCompileArguments({ source, binary, moduleCachePath, sdkPath }) {
  const arguments_ = ["-parse-as-library", "-module-cache-path", moduleCachePath];
  if (sdkPath) arguments_.push("-sdk", sdkPath);
  arguments_.push(source, "-o", binary);
  return arguments_;
}
