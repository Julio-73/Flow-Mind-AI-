import { createHmac, timingSafeEqual } from "node:crypto";

export interface WebhookHeaders {
  signature: string;
  timestamp?: string;
  webhookId: string;
  source: string;
}

export interface WebhookValidationResult {
  valid: boolean;
  error?: string;
}

const DEFAULT_MAX_PAYLOAD_BYTES = 256 * 1024; // 256 KB
const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_TIMESTAMP_AGE_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Verify HMAC-SHA256 signature for an incoming webhook payload.
 *
 * @param payload - Raw request body (Buffer or string)
 * @param signature - Hex-encoded HMAC from the webhook header
 * @param secret - Shared secret used to sign
 * @returns Whether the signature is valid
 */
export function verifyHmacSignature(
  payload: Buffer | string,
  signature: string,
  secret: string,
): boolean {
  const hmac = createHmac("sha256", secret);
  hmac.update(
    typeof payload === "string" ? Buffer.from(payload, "utf8") : payload,
  );
  const expected = hmac.digest("hex");

  if (expected.length !== signature.length) return false;

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

/**
 * Verify HMAC with timestamp to prevent replay attacks.
 * Expected format: `sha256=<hex-signature>` with `X-Webhook-Timestamp` header.
 */
export function verifyHmacWithTimestamp(
  payload: Buffer | string,
  signatureHeader: string,
  timestamp: string,
  secret: string,
): WebhookValidationResult {
  // Validate signature format
  if (!signatureHeader.startsWith("sha256=")) {
    return { valid: false, error: "Invalid signature format" };
  }
  const signature = signatureHeader.slice(7);

  // Validate timestamp freshness
  const timestampMs = parseInt(timestamp, 10);
  if (isNaN(timestampMs)) {
    return { valid: false, error: "Invalid timestamp" };
  }
  const age = Date.now() - timestampMs;
  if (Math.abs(age) > MAX_TIMESTAMP_AGE_MS) {
    return { valid: false, error: "Timestamp too old or in the future" };
  }

  // Reconstruct signed content: timestamp + "." + payload
  const signedContent = `${timestamp}.${typeof payload === "string" ? payload : payload.toString("utf8")}`;
  const isValid = verifyHmacSignature(signedContent, signature, secret);

  return {
    valid: isValid,
    error: isValid ? undefined : "Signature mismatch",
  };
}

/**
 * Validate webhook payload size.
 */
export function validatePayloadSize(
  payload: Buffer | string,
  maxBytes: number = DEFAULT_MAX_PAYLOAD_BYTES,
): WebhookValidationResult {
  const size = typeof payload === "string" ? Buffer.byteLength(payload, "utf8") : payload.length;
  if (size > maxBytes) {
    return {
      valid: false,
      error: `Payload too large: ${size} bytes (max: ${maxBytes} bytes)`,
    };
  }
  return { valid: true };
}

/**
 * Check for replay by tracking webhook ID in Redis (caller must provide check function).
 */
export type ReplayCheckFn = (webhookId: string) => Promise<boolean>;

export async function checkReplay(
  webhookId: string,
  isAlreadyProcessed: ReplayCheckFn,
): Promise<WebhookValidationResult> {
  const exists = await isAlreadyProcessed(webhookId);
  if (exists) {
    return { valid: false, error: "Duplicate webhook (already processed)" };
  }
  return { valid: true };
}

/**
 * Validate all webhook security checks.
 */
export async function validateWebhook(
  payload: Buffer | string,
  headers: WebhookHeaders,
  secret: string,
  isAlreadyProcessed: ReplayCheckFn,
  options?: {
    maxPayloadBytes?: number;
    validateTimestamp?: boolean;
  },
): Promise<WebhookValidationResult> {
  // 1. Payload size
  const sizeCheck = validatePayloadSize(payload, options?.maxPayloadBytes);
  if (!sizeCheck.valid) return sizeCheck;

  // 2. Replay check
  const replayCheck = await checkReplay(headers.webhookId, isAlreadyProcessed);
  if (!replayCheck.valid) return replayCheck;

  // 3. Signature verification
  const signatureCheck = headers.timestamp
    ? verifyHmacWithTimestamp(payload, headers.signature, headers.timestamp, secret)
    : { valid: verifyHmacSignature(payload, headers.signature, secret) };

  if (!signatureCheck.valid) {
    return { valid: false, error: signatureCheck.error ?? "Signature verification failed" };
  }

  return { valid: true };
}

/**
 * Sign an outgoing webhook payload.
 */
export function signOutgoingWebhook(
  payload: Record<string, unknown>,
  secret: string,
  timestamp?: number,
): { signature: string; timestamp: number; body: string } {
  const ts = timestamp ?? Date.now();
  const body = JSON.stringify(payload);
  const signedContent = `${ts}.${body}`;
  const signature = createHmac("sha256", secret)
    .update(signedContent)
    .digest("hex");

  return { signature, timestamp: ts, body };
}
