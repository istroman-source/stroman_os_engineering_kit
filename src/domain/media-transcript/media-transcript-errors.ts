import { DomainError } from "@/domain/shared";

export class DuplicateTranscriptSpeakerError extends DomainError {
  constructor() {
    super("CONFLICT", "Transcript speaker ids must be unique");
  }
}
export class DuplicateTranscriptSegmentError extends DomainError {
  constructor() {
    super("CONFLICT", "Transcript segment ids must be unique");
  }
}
export class DuplicateTranscriptSequenceError extends DomainError {
  constructor() {
    super("CONFLICT", "Transcript segment sequences must be unique");
  }
}
export class UnknownTranscriptSpeakerError extends DomainError {
  constructor() {
    super("VALIDATION", "Transcript segment references an unknown speaker");
  }
}
export class EmptyTranscriptError extends DomainError {
  constructor() {
    super("VALIDATION", "Transcript must contain at least one segment");
  }
}
