/**
 * Cryptographic utilities for TIPZ Private Messaging
 *
 * Implements hybrid encryption (RSA-OAEP + AES-GCM) for end-to-end encrypted
 * messages. The server cannot read message content - only the creator can
 * decrypt using their locally stored private key.
 *
 * Security notes:
 * - RSA-OAEP 4096-bit provides ~128-bit security level
 * - AES-256-GCM provides authenticated encryption
 * - Private key never leaves the device
 * - Optional password protection using PBKDF2
 */

// Storage keys
const PRIVATE_KEY_STORAGE_KEY = 'tipz_private_key'
const KEY_CREATED_AT_KEY = 'tipz_key_created_at'

export interface KeyPair {
  publicKey: JsonWebKey
  privateKey: JsonWebKey
}

export interface EncryptedMessage {
  encryptedKey: string   // RSA-encrypted AES key (base64)
  nonce: string          // AES-GCM nonce (base64)
  encryptedBody: string  // AES-encrypted message (base64)
}

interface StoredPrivateKey {
  encrypted: boolean
  salt?: number[]
  iv?: number[]
  data: JsonWebKey | number[]
}

/**
 * Generate RSA-OAEP keypair for message encryption.
 *
 * Security notes:
 * - 4096-bit RSA provides ~128-bit security level
 * - SHA-256 hash provides collision resistance
 * - Keys are extractable only for storage, not for transmission
 */
export async function generateKeyPair(): Promise<KeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]), // 65537
      hash: "SHA-256",
    },
    true, // extractable for storage
    ["encrypt", "decrypt"]
  )

  const publicKey = await crypto.subtle.exportKey("jwk", keyPair.publicKey)
  const privateKey = await crypto.subtle.exportKey("jwk", keyPair.privateKey)

  return { publicKey, privateKey }
}

/**
 * Derive encryption key from password using PBKDF2.
 * Used to encrypt the private key before storage.
 */
async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  )

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  )
}

/**
 * Store private key in chrome.storage.local, optionally encrypted with user password.
 * This key NEVER leaves the device in plaintext.
 *
 * SECURITY NOTES:
 * - Password-protected storage is STRONGLY RECOMMENDED for production use
 * - Plaintext storage (no password) has security implications:
 *   - Local malware with chrome.storage access could steal the key
 *   - Other extensions with "<all_urls>" permission may access storage
 *   - Browser exploits could potentially access storage
 * - For v1, plaintext storage is accepted for UX simplicity
 * - TODO v2: Consider making password mandatory or using platform keychain
 *
 * The threat model assumes:
 * - The user's device is not compromised
 * - The user trusts other installed extensions
 * - The key is only used for tip message decryption (limited blast radius)
 *
 * @param privateKey - The RSA private key to store
 * @param password - User-provided password for encryption (RECOMMENDED)
 */
export async function storePrivateKey(
  privateKey: JsonWebKey,
  password?: string
): Promise<void> {
  if (typeof chrome === "undefined" || !chrome.storage?.local) {
    throw new Error("Chrome storage not available")
  }

  let storageData: StoredPrivateKey

  if (password) {
    // Password-protected storage (RECOMMENDED)
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const derivedKey = await deriveKeyFromPassword(password, salt)

    const encoder = new TextEncoder()
    const encryptedKey = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      derivedKey,
      encoder.encode(JSON.stringify(privateKey))
    )

    storageData = {
      encrypted: true,
      salt: Array.from(salt),
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encryptedKey)),
    }
  } else {
    // Plaintext storage - SECURITY TRADEOFF for v1 UX
    // See security notes above for implications
    console.warn("TIPZ Crypto: Storing private key without password protection")
    storageData = {
      encrypted: false,
      data: privateKey,
    }
  }

  await chrome.storage.local.set({
    [PRIVATE_KEY_STORAGE_KEY]: storageData,
    [KEY_CREATED_AT_KEY]: Date.now(),
  })
}

/**
 * Retrieve private key from storage.
 * Returns null if not found (creator hasn't linked with messaging).
 *
 * @param password - Required if key was stored with password protection
 */
export async function getPrivateKey(password?: string): Promise<JsonWebKey | null> {
  if (typeof chrome === "undefined" || !chrome.storage?.local) {
    return null
  }

  const result = await chrome.storage.local.get([PRIVATE_KEY_STORAGE_KEY])
  const stored = result[PRIVATE_KEY_STORAGE_KEY] as StoredPrivateKey | undefined

  if (!stored) return null

  if (stored.encrypted) {
    if (!password) {
      throw new Error("Password required to decrypt private key")
    }

    const salt = new Uint8Array(stored.salt!)
    const iv = new Uint8Array(stored.iv!)
    const encryptedData = new Uint8Array(stored.data as number[])

    const derivedKey = await deriveKeyFromPassword(password, salt)

    try {
      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        derivedKey,
        encryptedData
      )

      const decoder = new TextDecoder()
      return JSON.parse(decoder.decode(decrypted))
    } catch {
      throw new Error("Invalid password")
    }
  }

  return stored.data as JsonWebKey
}

/**
 * Check if a private key exists in storage.
 */
export async function hasPrivateKey(): Promise<boolean> {
  if (typeof chrome === "undefined" || !chrome.storage?.local) {
    return false
  }

  const result = await chrome.storage.local.get([PRIVATE_KEY_STORAGE_KEY])
  return !!result[PRIVATE_KEY_STORAGE_KEY]
}

/**
 * Check if the stored private key is password-protected.
 */
export async function isKeyPasswordProtected(): Promise<boolean> {
  if (typeof chrome === "undefined" || !chrome.storage?.local) {
    return false
  }

  const result = await chrome.storage.local.get([PRIVATE_KEY_STORAGE_KEY])
  const stored = result[PRIVATE_KEY_STORAGE_KEY] as StoredPrivateKey | undefined

  return stored?.encrypted ?? false
}

/**
 * Delete the stored private key.
 * WARNING: This cannot be undone - all encrypted messages will be unreadable.
 */
export async function clearPrivateKey(): Promise<void> {
  if (typeof chrome === "undefined" || !chrome.storage?.local) {
    return
  }

  await chrome.storage.local.remove([PRIVATE_KEY_STORAGE_KEY, KEY_CREATED_AT_KEY])
}

/**
 * Decrypt a hybrid-encrypted message using locally stored private key.
 *
 * @param encryptedBlob - JSON string containing { encryptedKey, nonce, encryptedBody }
 * @param password - Optional password if private key is password-protected
 * @returns Plaintext message
 */
export async function decryptMessage(
  encryptedBlob: string,
  password?: string
): Promise<string> {
  // 1. Parse encrypted message components
  const { encryptedKey, nonce, encryptedBody }: EncryptedMessage =
    JSON.parse(encryptedBlob)

  // 2. Retrieve private key from storage
  const privateKeyJwk = await getPrivateKey(password)

  if (!privateKeyJwk) {
    throw new Error("No private key found. Re-link extension to TIPZ.")
  }

  // 3. Import RSA private key
  const privateKey = await crypto.subtle.importKey(
    "jwk",
    privateKeyJwk,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["decrypt"]
  )

  // 4. Decode base64 components
  const encryptedKeyBytes = Uint8Array.from(
    atob(encryptedKey),
    c => c.charCodeAt(0)
  )
  const nonceBytes = Uint8Array.from(atob(nonce), c => c.charCodeAt(0))
  const encryptedBodyBytes = Uint8Array.from(
    atob(encryptedBody),
    c => c.charCodeAt(0)
  )

  // 5. Decrypt AES key using RSA private key
  const aesKeyRaw = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encryptedKeyBytes
  )

  // 6. Import decrypted AES key
  const aesKey = await crypto.subtle.importKey(
    "raw",
    aesKeyRaw,
    "AES-GCM",
    false,
    ["decrypt"]
  )

  // 7. Decrypt message body using AES-GCM
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: nonceBytes },
    aesKey,
    encryptedBodyBytes
  )

  // 8. Decode UTF-8
  const decoder = new TextDecoder()
  return decoder.decode(decryptedBuffer)
}
