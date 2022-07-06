export class CueNotFoundError extends Error {}

export function isCueNotFoundError(e: unknown): e is CueNotFoundError {
  return e instanceof CueNotFoundError;
}
