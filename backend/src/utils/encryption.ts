import { config } from "@/config";
import CryptoJS from "crypto-js";

/**
 * Encrypts a plain text string using AES encryption and a configured secret key.
 * * @param {string} text - The plain text string to be encrypted.
 * @returns {string} The encrypted text as a CipherBase64 string.
 * @throws {Error} Throws an error if the encryption key is missing from the configuration.
 * * @example
 * const secretMessage = "Hello World";
 * const encrypted = encrypt(secretMessage);
 */
export const encrypt = (text: string): string => {
  const encryptionKey = config.encryptionKey;
  if (!encryptionKey) {
    throw new Error("Encryption key is not set");
  }
  const encryptedText = CryptoJS.AES.encrypt(text, encryptionKey).toString();
  return encryptedText;
};

/**
 * Decrypts an AES-encrypted cipher text back into a plain text string.
 * * @param {string} text - The encrypted cipher text string to be decrypted.
 * @returns {string} The original decrypted plain text string.
 * @throws {Error} Throws an error if the encryption key is missing from the configuration.
 * * @example
 * const cipherText = "U2FsdGVkX1...";
 * const decrypted = dcrypt(cipherText); // Returns "Hello World"
 */
export const dcrypt = (text: string): string => {
  const encryptionKey = config.encryptionKey;
  if (!encryptionKey) {
    throw new Error("Encryption key is not set");
  }
  const decryptedText = CryptoJS.AES.decrypt(text, encryptionKey).toString(
    CryptoJS.enc.Utf8,
  );
  return decryptedText;
};
