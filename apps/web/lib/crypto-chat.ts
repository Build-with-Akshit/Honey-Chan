import crypto from "crypto";

// Secret salt for key derivation
const MASTER_SALT = process.env.JWT_SECRET || process.env.ENCRYPTION_SECRET || "honeychain-kvic-apiculture-master-secret-2026";

/**
 * Derives a user-specific 256-bit AES key using HMAC-SHA256
 */
function deriveUserKey(userId: number): Buffer {
  return crypto
    .createHmac("sha256", MASTER_SALT)
    .update(`user_chat_key_salt_${userId}`)
    .digest();
}

export interface EncryptedPayload {
  encryptedText: string; // Base64 ciphertext
  iv: string;            // Base64 12-byte IV
  tag: string;           // Base64 16-byte GCM Auth Tag
}

/**
 * Encrypts chat message using AES-256-GCM (Authenticated Encryption)
 */
export function encryptChatMessage(plaintext: string, userId: number): EncryptedPayload {
  const key = deriveUserKey(userId);
  const iv = crypto.randomBytes(12); // Standard 96-bit IV for GCM

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  let ciphertext = cipher.update(plaintext, "utf8", "base64");
  ciphertext += cipher.final("base64");

  const tag = cipher.getAuthTag();

  return {
    encryptedText: ciphertext,
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  };
}

/**
 * Decrypts chat message using AES-256-GCM
 */
export function decryptChatMessage(
  encryptedText: string,
  ivBase64: string,
  tagBase64: string,
  userId: number
): string {
  try {
    const key = deriveUserKey(userId);
    const iv = Buffer.from(ivBase64, "base64");
    const tag = Buffer.from(tagBase64, "base64");

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedText, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (err) {
    console.error(`[CryptoChat] Failed to decrypt chat for user ${userId}:`, err);
    return "🔒 [Encrypted message - decryption failed or key mismatch]";
  }
}
