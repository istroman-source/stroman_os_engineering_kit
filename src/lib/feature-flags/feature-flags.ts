/**
 * Feature flags.
 *
 * A minimal, explicit flag system driven by configuration. Flags gate
 * in-progress work so it can merge safely without being exposed. This is
 * deliberately simple; a remote provider can implement the same interface later.
 */

export interface FeatureFlags {
  isEnabled(name: string): boolean;
  enabled(): readonly string[];
}

/** Parse a comma-separated flag string into a normalized set. */
export function parseFeatureFlags(input: string | undefined): Set<string> {
  const flags = new Set<string>();
  if (!input) return flags;
  for (const raw of input.split(",")) {
    const name = raw.trim();
    if (name.length > 0) flags.add(name);
  }
  return flags;
}

export function createFeatureFlags(enabled: Iterable<string> = []): FeatureFlags {
  const set = new Set<string>();
  for (const name of enabled) {
    const trimmed = name.trim();
    if (trimmed.length > 0) set.add(trimmed);
  }
  return {
    isEnabled: (name) => set.has(name),
    enabled: () => [...set].sort(),
  };
}
