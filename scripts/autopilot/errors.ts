export class AutopilotError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "AutopilotError";
  }
}
export class ApprovalRequiredError extends AutopilotError {
  constructor(message: string) {
    super(message, "APPROVAL_REQUIRED");
  }
}
