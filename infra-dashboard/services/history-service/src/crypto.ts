import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 12 bytes standard for GCM

// Default fallback key for local dev if ENCRYPTION_KEY is not supplied
const DEFAULT_DEV_KEY = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || DEFAULT_DEV_KEY;
  return secret.length === 64
    ? Buffer.from(secret, "hex")
    : crypto.createHash("sha256").update(secret).digest();
}

export interface EncryptedData {
  encryptedPayload: string;
  iv: string;
  authTag: string;
}

/**
 * Encrypts an arbitrary object using AES-256-GCM
 */
export function encryptCredentials(data: Record<string, any>): EncryptedData {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const jsonString = JSON.stringify(data);
  let encrypted = cipher.update(jsonString, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  return {
    encryptedPayload: encrypted,
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

/**
 * Decrypts AES-256-GCM encrypted credentials
 */
export function decryptCredentials<T = Record<string, any>>(data: {
  encryptedPayload: string;
  iv: string;
  authTag: string;
}): T {
  const key = getEncryptionKey();
  const iv = Buffer.from(data.iv, "base64");
  const authTag = Buffer.from(data.authTag, "base64");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(data.encryptedPayload, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return JSON.parse(decrypted) as T;
}
