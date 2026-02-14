/**
 * Browser-side RSA crypto for TIPZ web dashboard.
 *
 * Same RSA-OAEP 4096-bit + AES-GCM as the extension, but uses
 * localStorage instead of chrome.storage.local.
 */

import type { TipzData } from "@/lib/tipz"

const PRIVATE_KEY_STORAGE_KEY = "tipz_private_key_web"

export interface KeyPair {
  publicKey: JsonWebKey
  privateKey: JsonWebKey
}

export async function generateKeyPair(): Promise<KeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  )

  const publicKey = await crypto.subtle.exportKey("jwk", keyPair.publicKey)
  const privateKey = await crypto.subtle.exportKey("jwk", keyPair.privateKey)

  return { publicKey, privateKey }
}

export function storePrivateKey(key: JsonWebKey): void {
  localStorage.setItem(PRIVATE_KEY_STORAGE_KEY, JSON.stringify(key))
}

export function getPrivateKey(): JsonWebKey | null {
  const stored = localStorage.getItem(PRIVATE_KEY_STORAGE_KEY)
  if (!stored) return null
  return JSON.parse(stored)
}

export function hasPrivateKey(): boolean {
  return localStorage.getItem(PRIVATE_KEY_STORAGE_KEY) !== null
}

export async function decryptTipData(
  encryptedBlob: string
): Promise<TipzData> {
  const { encryptedKey, nonce, encryptedBody } = JSON.parse(encryptedBlob)

  const privateKeyJwk = getPrivateKey()
  if (!privateKeyJwk) {
    throw new Error("No private key found")
  }

  const privateKey = await crypto.subtle.importKey(
    "jwk",
    privateKeyJwk,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["decrypt"]
  )

  const encryptedKeyBytes = Uint8Array.from(
    atob(encryptedKey),
    (c) => c.charCodeAt(0)
  )
  const nonceBytes = Uint8Array.from(atob(nonce), (c) => c.charCodeAt(0))
  const encryptedBodyBytes = Uint8Array.from(
    atob(encryptedBody),
    (c) => c.charCodeAt(0)
  )

  const aesKeyRaw = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encryptedKeyBytes
  )

  const aesKey = await crypto.subtle.importKey(
    "raw",
    aesKeyRaw,
    "AES-GCM",
    false,
    ["decrypt"]
  )

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: nonceBytes },
    aesKey,
    encryptedBodyBytes
  )

  const decoder = new TextDecoder()
  return JSON.parse(decoder.decode(decryptedBuffer))
}
