import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

export interface EncryptedData {
  iv: string;          // hex
  ciphertext: string;  // hex
  authTag: string;     // hex
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 *
 * @param plaintext - The text to encrypt (UTF-8)
 * @param key - 256-bit key as hex string (64 hex chars)
 * @returns Object with iv, ciphertext, and authTag (all hex-encoded)
 */
export function encrypt(plaintext: string, key: string): EncryptedData {
  const keyBuffer = Buffer.from(key, "hex");
  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error(
      `Invalid encryption key length: expected ${KEY_LENGTH} bytes, got ${keyBuffer.length} bytes`,
    );
  }

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, keyBuffer, iv);

  const plaintextBuffer = Buffer.from(plaintext, "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintextBuffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    ciphertext: encrypted.toString("hex"),
    authTag: authTag.toString("hex"),
  };
}

/**
 * Decrypt a ciphertext using AES-256-GCM.
 *
 * @param data - Object with iv, ciphertext, and authTag (all hex-encoded)
 * @param key - 256-bit key as hex string (64 hex chars)
 * @returns Decrypted plaintext string
 */
export function decrypt(data: EncryptedData, key: string): string {
  const keyBuffer = Buffer.from(key, "hex");
  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error(
      `Invalid decryption key length: expected ${KEY_LENGTH} bytes, got ${keyBuffer.length} bytes`,
    );
  }

  const iv = Buffer.from(data.iv, "hex");
  const encrypted = Buffer.from(data.ciphertext, "hex");
  const authTag = Buffer.from(data.authTag, "hex");

  const decipher = createDecipheriv(ALGORITHM, keyBuffer, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

/**
 * Serialize encrypted data to a single hex string for storage.
 * Format: `iv:ciphertext:authTag` (all hex)
 */
export function serializeEncrypted(data: EncryptedData): string {
  return `${data.iv}:${data.ciphertext}:${data.authTag}`;
}

/**
 * Parse a serialized encrypted string back into EncryptedData.
 */
export function parseEncrypted(serialized: string): EncryptedData {
  const parts = serialized.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted data format. Expected: iv:ciphertext:authTag");
  }
  const iv = parts[0];
  const ciphertext = parts[1];
  const authTag = parts[2];
  if (!iv || !ciphertext || !authTag) {
    throw new Error("Invalid encrypted data format. Expected: iv:ciphertext:authTag");
  }
  return { iv, ciphertext, authTag };
}

/**
 * Generate a new random encryption key (256-bit) as hex.
 */
export function generateEncryptionKey(): string {
  return randomBytes(KEY_LENGTH).toString("hex");
}

/**
 * Re-encrypt data with a new key (key rotation).
 * Decrypts with old key, encrypts with new key.
 */
export function reEncrypt(
  serializedData: string,
  oldKey: string,
  newKey: string,
): string {
  const data = parseEncrypted(serializedData);
  const plaintext = decrypt(data, oldKey);
  const newEncrypted = encrypt(plaintext, newKey);
  return serializeEncrypted(newEncrypted);
}

/**
 * Verify that a key is valid (correct length, hex-encoded).
 */
export function isValidEncryptionKey(key: string): boolean {
  const hexRegex = /^[0-9a-f]{64}$/i;
  return hexRegex.test(key);
}

export function encryptSecret(plaintext: string, key?: string): string {
  const k = key ?? process.env["ENCRYPTION_KEY"] ?? "";
  return serializeEncrypted(encrypt(plaintext, k));
}

export function decryptSecret(serialized: string, key?: string): string {
  const k = key ?? process.env["ENCRYPTION_KEY"] ?? "";
  return decrypt(parseEncrypted(serialized), k);
}
