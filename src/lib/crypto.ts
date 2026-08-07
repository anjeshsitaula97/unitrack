import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_ITERATIONS = 200000;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

export interface EncryptedPayload {
  encrypted: true;
  iv: string;
  tag: string;
  salt: string;
  data: string;
}

export function encryptBackup(plaintext: string, password: string): EncryptedPayload {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = crypto.pbkdf2Sync(password, salt, KEY_ITERATIONS, KEY_LENGTH, "sha512");
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");
  const tag = cipher.getAuthTag();
  return {
    encrypted: true,
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
    salt: salt.toString("hex"),
    data: encrypted,
  };
}

export function decryptBackup(payload: EncryptedPayload, password: string): string {
  const salt = Buffer.from(payload.salt, "hex");
  const key = crypto.pbkdf2Sync(password, salt, KEY_ITERATIONS, KEY_LENGTH, "sha512");
  const iv = Buffer.from(payload.iv, "hex");
  const tag = Buffer.from(payload.tag, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(payload.data, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
