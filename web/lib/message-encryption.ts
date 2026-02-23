/**
 * Message Encryption Library for TIPZ Private Messaging (Tipper Side)
 *
 * Implements hybrid encryption (RSA-OAEP + AES-GCM) for end-to-end encrypted
 * messages. Messages are encrypted on the tipper's device and can only be
 * decrypted by the creator using their private key.
 *
 * This runs in the browser - window.crypto.subtle is built-in.
 */

export interface EncryptedMessage {
  encryptedKey: string // RSA-encrypted AES key (base64)
  nonce: string // AES-GCM nonce (base64)
  encryptedBody: string // AES-encrypted message (base64)
}

/**
 * Encrypt a message for a specific creator using hybrid encryption.
 *
 * @param message - Plaintext message (unlimited length)
 * @param publicKeyJwk - Creator's RSA public key from API
 * @returns Encrypted message components
 */
export async function encryptMessage(
  message: string,
  publicKeyJwk: JsonWebKey
): Promise<EncryptedMessage> {
  // 1. Generate ephemeral AES-256-GCM key
  const aesKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true, // extractable (we need to encrypt it)
    ["encrypt", "decrypt"]
  )

  // 2. Generate random nonce for AES-GCM
  const nonce = crypto.getRandomValues(new Uint8Array(12))

  // 3. Encrypt message with AES-GCM
  const encoder = new TextEncoder()
  const encryptedBody = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    aesKey,
    encoder.encode(message)
  )

  // 4. Export AES key as raw bytes
  const exportedAesKey = await crypto.subtle.exportKey("raw", aesKey)

  // 5. Import creator's RSA public key
  const publicKey = await crypto.subtle.importKey(
    "jwk",
    publicKeyJwk,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  )

  // 6. Encrypt AES key with RSA-OAEP
  const encryptedKey = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, exportedAesKey)

  // 7. Encode all components as base64
  return {
    encryptedKey: arrayBufferToBase64(encryptedKey),
    nonce: arrayBufferToBase64(nonce),
    encryptedBody: arrayBufferToBase64(encryptedBody),
  }
}

/**
 * Serialize encrypted message for transmission.
 */
export function serializeEncryptedMessage(msg: EncryptedMessage): string {
  return JSON.stringify(msg)
}

/**
 * Convert ArrayBuffer to base64 string.
 */
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Validate that a public key is in the expected format.
 */
export function isValidPublicKey(key: unknown): key is JsonWebKey {
  if (!key || typeof key !== "object") return false
  const jwk = key as Record<string, unknown>
  return jwk.kty === "RSA" && typeof jwk.n === "string" && typeof jwk.e === "string"
}
