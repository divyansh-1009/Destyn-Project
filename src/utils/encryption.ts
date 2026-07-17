/**
 * AES Encryption / Decryption Utilities
 *
 * Used to protect sensitive fields before they are written to MongoDB:
 *  - Chat messages
 *  - User emails within confessions and comments
 *
 * Security notes:
 *  - The encryption key MUST be set via the ENCRYPTION_KEY environment variable.
 *    The application will refuse to start if it is missing — there is no
 *    insecure fallback key.
 *  - crypto-js uses AES-256-CBC under the hood when given a passphrase.
 *    For future hardening, consider migrating to Node's built-in `crypto`
 *    with an explicit IV and key derivation function (PBKDF2/scrypt).
 */

import CryptoJS from "crypto-js";

// ---------------------------------------------------------------------------
// Key validation — fail loud and early rather than silently encrypting with a
// known/public default key.
// ---------------------------------------------------------------------------

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

function checkKey() {
  if (!ENCRYPTION_KEY) {
    throw new Error(
      "[encryption] ENCRYPTION_KEY environment variable is not set. " +
        "Set a strong, randomly-generated key before running the application."
    );
  }
}

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/**
 * Encrypts a plaintext string with AES.
 * Returns the ciphertext as a base-64 encoded string.
 * Returns an empty string if `text` is empty.
 */
export function encryptText(text: string): string {
  if (!text) return text;
  checkKey();
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY!).toString();
}

/**
 * Decrypts an AES-encrypted ciphertext.
 *
 * Returns the plaintext on success.
 * Returns the original input on failure (e.g. unencrypted legacy data) so
 * that existing unencrypted records can still be read gracefully during a
 * migration period.
 */
export function decryptText(encryptedText: string): string {
  if (!encryptedText) return encryptedText;
  checkKey();

  // AES output from crypto-js always starts with "U2FsdGVkX1" (Salted__…).
  // If the value doesn't match, treat it as unencrypted plaintext.
  if (!encryptedText.startsWith("U2FsdGVkX1")) {
    return encryptedText;
  }

  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY!);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    // An empty result means decryption failed (wrong key or corrupted data).
    return decrypted || encryptedText;
  } catch {
    // Never propagate decryption errors to callers; return original so the app
    // doesn't crash on legacy / corrupted records.
    return encryptedText;
  }
}

// ---------------------------------------------------------------------------
// Object-level helpers
// ---------------------------------------------------------------------------

/**
 * Returns a shallow copy of `obj` with the specified fields encrypted.
 * Fields that are missing or not strings are left unchanged.
 */
export function encryptObject<T extends Record<string, unknown>>(
  obj: T,
  fieldsToEncrypt: (keyof T)[]
): T {
  const result = { ...obj };
  for (const field of fieldsToEncrypt) {
    const value = result[field];
    if (typeof value === "string") {
      (result as Record<string, unknown>)[field as string] = encryptText(value);
    }
  }
  return result;
}

/**
 * Returns a shallow copy of `obj` with the specified fields decrypted.
 */
export function decryptObject<T extends Record<string, unknown>>(
  obj: T,
  fieldsToDecrypt: (keyof T)[]
): T {
  const result = { ...obj };
  for (const field of fieldsToDecrypt) {
    const value = result[field];
    if (typeof value === "string") {
      (result as Record<string, unknown>)[field as string] = decryptText(value);
    }
  }
  return result;
}

/**
 * Maps `encryptObject` over an array.
 */
export function encryptArray<T extends Record<string, unknown>>(
  array: T[],
  fieldsToEncrypt: (keyof T)[]
): T[] {
  return array.map((obj) => encryptObject(obj, fieldsToEncrypt));
}

/**
 * Maps `decryptObject` over an array.
 */
export function decryptArray<T extends Record<string, unknown>>(
  array: T[],
  fieldsToDecrypt: (keyof T)[]
): T[] {
  return array.map((obj) => decryptObject(obj, fieldsToDecrypt));
}