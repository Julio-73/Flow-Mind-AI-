import type { ExecutionState } from "@flowmind/core";

export class RetryManager {
  constructor(
    private maxRetries: number,
    private baseDelayMs: number = 2000,
  ) {}

  shouldRetry(state: ExecutionState, currentAttempt?: number): boolean {
    const attempt = currentAttempt ?? state.retryCount;
    return attempt < this.maxRetries;
  }

  getBackoff(attempt: number): number {
    return Math.min(
      this.baseDelayMs * Math.pow(2, attempt - 1),
      30000,
    );
  }

  getJitteredBackoff(attempt: number): number {
    const backoff = this.getBackoff(attempt);
    const jitter = Math.random() * backoff * 0.1;
    return backoff + jitter;
  }

  resetRetries(state: ExecutionState): void {
    state.retryCount = 0;
  }
}
