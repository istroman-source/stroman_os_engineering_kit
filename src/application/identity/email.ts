/**
 * Normalize an email for storage/audit only. We trim surrounding whitespace and
 * lowercase, matching how the provider (Supabase) stores addresses, and do NOT
 * perform provider-inconsistent canonicalization (no dot-stripping, no plus-tag
 * removal) — that would silently merge distinct accounts. The result is never
 * used as an authorization key; identity is keyed by `(provider, subject)`.
 */
export function normalizeEmail(raw: string | null | undefined): string | null {
  if (raw === null || raw === undefined) return null;
  const trimmed = raw.trim().toLowerCase();
  return trimmed === "" ? null : trimmed;
}
