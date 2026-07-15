import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export type ApiKeyScope = "read" | "write" | "admin";
export type ApiKeyStatus = "active" | "revoked";

export interface ApiKeyRecord {
  id: string;
  prefix: string;
  keyHash: string;
  keyPrefix: string; // first 8 chars of the full key for identification
  scope: ApiKeyScope;
  status: ApiKeyStatus;
  name: string;
  userId: string;
  orgId: string;
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
}

export interface GeneratedApiKey {
  rawKey: string;      // Returned once to the user, never stored
  keyHash: string;     // SHA-256 hash stored in DB
  keyPrefix: string;   // First 8 chars for identification
  prefix: string;      // Human-readable prefix
}

const PREFIX_REGEX = /^[a-z0-9_-]{2,16}$/;
const KEY_PREFIX_LENGTH = 8;
const RANDOM_BYTE_LENGTH = 32; // 256 bits of entropy

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function base62Encode(bytes: Buffer): string {
  let value = BigInt("0x" + bytes.toString("hex"));
  let result = "";
  const base = BigInt(62);
  while (value > 0) {
    result = BASE62[Number(value % base)] + result;
    value = value / base;
  }
  return result.padStart(Math.ceil((bytes.length * 8) / Math.log2(62)), "0");
}

/**
 * Generate a new API key.
 *
 * Format: fm_{prefix}_{random-base62}
 * Example: fm_prod_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
 */
export function generateApiKey(prefix: string): GeneratedApiKey {
  if (!PREFIX_REGEX.test(prefix)) {
    throw new Error(
      `Invalid API key prefix: "${prefix}". Must be 2-16 chars: lowercase, digits, hyphens, underscores.`,
    );
  }

  const random = randomBytes(RANDOM_BYTE_LENGTH);
  const randomStr = base62Encode(random);

  const rawKey = `fm_${prefix}_${randomStr}`;
  const keyHash = createHash("sha256").update(rawKey, "utf8").digest("hex");
  const keyPrefix = rawKey.slice(0, KEY_PREFIX_LENGTH);

  return { rawKey, keyHash, keyPrefix, prefix };
}

/**
 * Hash a raw API key for storage/comparison.
 */
export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey, "utf8").digest("hex");
}

/**
 * Verify a raw API key against a stored hash using timing-safe comparison.
 */
export function verifyApiKey(rawKey: string, storedHash: string): boolean {
  const computedHash = hashApiKey(rawKey);
  try {
    return timingSafeEqual(Buffer.from(computedHash), Buffer.from(storedHash));
  } catch {
    return false;
  }
}

/**
 * Extract the prefix portion from a raw API key (for logging and identification).
 */
export function getApiKeyPrefix(rawKey: string): string {
  return rawKey.slice(0, KEY_PREFIX_LENGTH);
}

/**
 * Check if an API key has the required scope.
 */
export function hasScope(
  keyScope: ApiKeyScope,
  requiredScope: ApiKeyScope,
): boolean {
  const scopeHierarchy: Record<ApiKeyScope, number> = {
    read: 1,
    write: 2,
    admin: 3,
  };
  return scopeHierarchy[keyScope] >= scopeHierarchy[requiredScope];
}

/**
 * Zod schema for API key creation input.
 */
export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  prefix: z
    .string()
    .min(2)
    .max(16)
    .regex(PREFIX_REGEX, "Prefix must be 2-16 chars: lowercase, digits, hyphens, underscores"),
  scope: z.enum(["read", "write", "admin"]),
  expiresInDays: z.coerce.number().int().min(1).max(365).optional(),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;

/**
 * Rate limit key for a specific API key.
 */
export function getApiKeyRateLimitKey(keyPrefix: string): string {
  return `rl:apikey:${keyPrefix}`;
}
