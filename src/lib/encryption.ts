import CryptoJS from 'crypto-js';

// Encryption key - in production, this should be stored in environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-encryption-key-change-this-in-production';

/**
 * Encrypts a string using AES encryption
 * @param text - The text to encrypt
 * @returns The encrypted text as a string
 */
export function encryptText(text: string): string {
  if (!text) return text;
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

/**
 * Decrypts an encrypted string using AES decryption
 * @param encryptedText - The encrypted text to decrypt
 * @returns The decrypted text as a string, or the original text if decryption fails
 */
export function decryptText(encryptedText: string): string {
  if (!encryptedText) return encryptedText;
  
  // Check if the text looks like it's encrypted (starts with U2FsdGVkX1)
  if (!encryptedText.startsWith('U2FsdGVkX1')) {
    // If it doesn't look encrypted, return as-is
    return encryptedText;
  }
  
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    // If decryption results in empty string, it might be a failed decryption
    if (!decrypted) {
      return encryptedText; // Return original if decryption failed
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedText; // Return original text if decryption fails
  }
}

/**
 * Encrypts an object by encrypting its string values
 * @param obj - The object to encrypt
 * @param fieldsToEncrypt - Array of field names to encrypt
 * @returns The object with encrypted fields
 */
export function encryptObject(obj: any, fieldsToEncrypt: string[]): any {
  const encryptedObj = { ...obj };
  
  for (const field of fieldsToEncrypt) {
    if (encryptedObj[field] && typeof encryptedObj[field] === 'string') {
      encryptedObj[field] = encryptText(encryptedObj[field]);
    }
  }
  
  return encryptedObj;
}

/**
 * Decrypts an object by decrypting its encrypted string values
 * @param obj - The object to decrypt
 * @param fieldsToDecrypt - Array of field names to decrypt
 * @returns The object with decrypted fields
 */
export function decryptObject(obj: any, fieldsToDecrypt: string[]): any {
  const decryptedObj = { ...obj };
  
  for (const field of fieldsToDecrypt) {
    if (decryptedObj[field] && typeof decryptedObj[field] === 'string') {
      decryptedObj[field] = decryptText(decryptedObj[field]);
    }
  }
  
  return decryptedObj;
}

/**
 * Encrypts an array of objects
 * @param array - The array to encrypt
 * @param fieldsToEncrypt - Array of field names to encrypt in each object
 * @returns The array with encrypted fields
 */
export function encryptArray(array: any[], fieldsToEncrypt: string[]): any[] {
  return array.map(obj => encryptObject(obj, fieldsToEncrypt));
}

/**
 * Decrypts an array of objects
 * @param array - The array to decrypt
 * @param fieldsToDecrypt - Array of field names to decrypt in each object
 * @returns The array with decrypted fields
 */
export function decryptArray(array: any[], fieldsToDecrypt: string[]): any[] {
  return array.map(obj => decryptObject(obj, fieldsToDecrypt));
} 