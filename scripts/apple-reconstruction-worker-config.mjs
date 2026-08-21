import path from "node:path";

/**
 * Compose the private Apple worker process environment. Keeping this separate
 * from the launcher makes the native-binary hand-off independently testable.
 */
export function appleReconstructionWorkerEnvironment(
  environment,
  { root, port, binary, runtimePath },
) {
  return {
    ...environment,
    PORT: String(port),
    STROMAN_RECONSTRUCTION_ENGINE: "apple",
    STROMAN_APPLE_PHOTOGRAMMETRY_BIN: binary,
    STROMAN_GLTFPACK_BIN: path.join(root, "node_modules", ".bin", "gltfpack"),
    STROMAN_RECONSTRUCTION_DATA_PATH:
      environment.STROMAN_RECONSTRUCTION_DATA_PATH ?? path.join(runtimePath, "jobs"),
  };
}
