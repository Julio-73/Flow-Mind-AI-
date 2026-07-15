import { encrypt, decrypt, serializeEncrypted, parseEncrypted } from "./encryption.js";

/**
 * PII field identifiers — tags that indicate a field contains PII.
 */
export const PII_FIELD_TAGS = {
  EMAIL: "@pii:email",
  NAME: "@pii:name",
  PHONE: "@pii:phone",
  IP: "@pii:ip",
  USER_AGENT: "@pii:user_agent",
  ADDRESS: "@pii:address",
} as const;

export type PiiFieldTag = (typeof PII_FIELD_TAGS)[keyof typeof PII_FIELD_TAGS];

/**
 * List of PII field patterns for automatic detection.
 */
const PII_PATTERNS: { tag: PiiFieldTag; regex: RegExp }[] = [
  { tag: PII_FIELD_TAGS.EMAIL, regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  { tag: PII_FIELD_TAGS.IP, regex: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/ },
];

/**
 * Detect if a value looks like PII based on known patterns.
 */
export function detectPii(value: string): PiiFieldTag | null {
  for (const { tag, regex } of PII_PATTERNS) {
    if (regex.test(value)) return tag;
  }
  return null;
}

/**
 * Encrypt a PII value for storage.
 */
export function encryptPii(plaintext: string, encryptionKey: string): string {
  const encrypted = encrypt(plaintext, encryptionKey);
  return serializeEncrypted(encrypted);
}

/**
 * Decrypt a stored PII value.
 */
export function decryptPii(stored: string, encryptionKey: string): string {
  const data = parseEncrypted(stored);
  return decrypt(data, encryptionKey);
}

/**
 * Mask PII for safe logging.
 * - email: j***@example.com
 * - name: J*** D***
 * - IP: 192.168.***.***
 */
export function maskPii(value: string, tag: PiiFieldTag): string {
  switch (tag) {
    case PII_FIELD_TAGS.EMAIL: {
      const [local, domain] = value.split("@");
      if (!local || !domain) return value;
      return `${local[0]}***@${domain}`;
    }
    case PII_FIELD_TAGS.NAME: {
      return value
        .split(" ")
        .map((part) => `${part[0]}***`)
        .join(" ");
    }
    case PII_FIELD_TAGS.IP: {
      return value.replace(/\.\d+\.\d+$/, ".***.***");
    }
    case PII_FIELD_TAGS.PHONE: {
      return `${value.slice(0, 3)}***${value.slice(-2)}`;
    }
    default:
      return `${value.slice(0, 3)}***`;
  }
}

/**
 * Data retention configuration per resource type.
 */
export interface RetentionPolicy {
  resourceType: string;
  retentionDays: number;
  action: "delete" | "anonymize" | "aggregate";
}

export const DEFAULT_RETENTION_POLICIES: RetentionPolicy[] = [
  { resourceType: "user_account", retentionDays: 30, action: "anonymize" },
  { resourceType: "workflow_execution", retentionDays: 90, action: "delete" },
  { resourceType: "execution_log", retentionDays: 90, action: "delete" },
  { resourceType: "audit_log", retentionDays: 365, action: "aggregate" },
  { resourceType: "api_key_usage", retentionDays: 90, action: "delete" },
  { resourceType: "webhook_payload", retentionDays: 30, action: "delete" },
];

/**
 * Calculate if a resource is past its retention period.
 */
export function isPastRetention(
  createdAt: Date,
  resourceType: string,
  policies: RetentionPolicy[] = DEFAULT_RETENTION_POLICIES,
): boolean {
  const policy = policies.find((p) => p.resourceType === resourceType);
  if (!policy) return false;
  const expiryDate = new Date(createdAt);
  expiryDate.setDate(expiryDate.getDate() + policy.retentionDays);
  return new Date() >= expiryDate;
}
