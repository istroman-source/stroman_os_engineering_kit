import type { SpatialBounds } from "@/domain/creative";

export interface LocationShootBrief {
  readonly usability: "SHOOTABLE_ESTIMATE" | "REVIEW_REQUIRED";
  readonly usableViews: readonly string[];
  readonly observedConstraints: readonly string[];
  readonly estimates: readonly string[];
  readonly unknowns: readonly string[];
  readonly noGoAreas: readonly string[];
  readonly issues: readonly string[];
  readonly correctiveAction: string | null;
}

const meters = (value: number) => `${value.toFixed(value < 10 ? 1 : 0)}m`;

/**
 * Honest V1 readiness gate based only on geometry that actually exists. It does not infer doors,
 * windows, obstacles, coverage continuity, or camera lanes from a bounding box.
 */
export function assessLocationGeometry(
  bounds: SpatialBounds,
  scaleMetersPerUnit: number,
  source: "GLB" | "PHOTOS",
): LocationShootBrief {
  const dimensions = [
    Math.abs(bounds.max.x - bounds.min.x) * scaleMetersPerUnit,
    Math.abs(bounds.max.y - bounds.min.y) * scaleMetersPerUnit,
    Math.abs(bounds.max.z - bounds.min.z) * scaleMetersPerUnit,
  ] as const;
  const [width, height, depth] = dimensions;
  const horizontalMin = Math.min(width, depth);
  const horizontalMax = Math.max(width, depth);
  const issues: string[] = [];
  if (!dimensions.every((value) => Number.isFinite(value) && value > 0)) {
    issues.push("The recovered room bounds are invalid or empty.");
  } else {
    if (height < 1.7 || height > 8) {
      issues.push(
        `The estimated ${meters(height)} room height is not credible enough to plan from.`,
      );
    }
    if (horizontalMin < 1.2) {
      issues.push("One recovered floor dimension is too narrow to represent a complete room.");
    }
    if (horizontalMax > 80 || horizontalMax / Math.max(horizontalMin, 0.01) > 15) {
      issues.push("The recovered floor bounds are unusually stretched and may be distorted.");
    }
  }
  const ready = issues.length === 0;
  return {
    usability: ready ? "SHOOTABLE_ESTIMATE" : "REVIEW_REQUIRED",
    usableViews: ready
      ? [
          "Camera positions inside the recovered bounds can be explored as estimates; confirm physical clearance in the viewer and on the scout.",
        ]
      : [],
    observedConstraints: [
      `Recovered bounds span approximately ${meters(width)} wide × ${meters(height)} high × ${meters(depth)} deep.`,
    ],
    estimates: [
      "Scale and dimensions are reconstructed estimates, not surveyed measurements.",
      "The visible mesh is the only confirmed spatial evidence in this room asset.",
    ],
    unknowns: [
      "Doors, windows, obstacles, floor continuity, and operating clearance are not semantically confirmed.",
      "Missing or distorted surfaces may still exist outside the recovered view.",
    ],
    noGoAreas: [
      "Outside the recovered mesh bounds and any visibly missing surface remain unverified; do not plan a camera lane there without confirmation.",
    ],
    issues,
    correctiveAction: ready
      ? null
      : source === "PHOTOS"
        ? "Add overlapping photos around the distorted or missing side, including floor, ceiling, corners, and connecting views, then rebuild."
        : "Replace this version with a complete textured room GLB whose floor, ceiling, walls, and corners share one coordinate system.",
  };
}
