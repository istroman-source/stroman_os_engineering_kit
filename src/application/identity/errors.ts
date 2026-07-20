import { ApplicationError } from "../shared/errors";

/**
 * The caller authenticated successfully but their internal account is disabled.
 * Distinct from a generic authorization denial so the delivery layer can map it
 * to a specific, stable status (403 ACCOUNT_DISABLED) without leaking why.
 */
export class AccountDisabledError extends ApplicationError {
  constructor() {
    super("FORBIDDEN", "This account is disabled", { context: { reason: "account_disabled" } });
  }
}
