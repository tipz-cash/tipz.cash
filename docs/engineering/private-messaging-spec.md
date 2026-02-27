# Private Messaging Technical Specification

Zero-Knowledge DMs for TIPZ — "We Cannot Read Your Messages"

---

## Overview

Private Messaging enables tippers to send encrypted messages alongside tips. The core security guarantee: **TIPZ servers cannot read message content**.

### How It Works

1. **Tippers get privacy** — Support is personal. Expressing gratitude shouldn't create a surveillance record.
2. **Creators get signal** — Anonymous tips are nice; tips with context are actionable.
3. **TIPZ gets a moat** — Platforms will never offer this because encrypted DMs undermine their ad targeting model.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           TIPPER BROWSER                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 1. Fetch creator's public key from TIPZ API                      │   │
│  │ 2. Generate ephemeral AES-256-GCM key                            │   │
│  │ 3. Encrypt message with AES-GCM                                  │   │
│  │ 4. Encrypt AES key with creator's RSA-OAEP public key            │   │
│  │ 5. Encrypted blob stored in tipz.data column                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           TIPZ SERVER                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ • Stores encrypted blob in tipz.data column                      │   │
│  │ • Pushes notification via Supabase Realtime                      │   │
│  │ • CANNOT: decrypt, read, or correlate content                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        CREATOR DASHBOARD (/my)                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 1. Receive tip notification via Supabase Realtime                │   │
│  │ 2. Decrypt AES key using local RSA private key (from IndexedDB)  │   │
│  │ 3. Decrypt message body using AES-GCM + nonce                    │   │
│  │ 4. Display decrypted message in activity feed                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Encryption Implementation

### Key Generation (on creator login)

```typescript
// Keys generated automatically when creator logs in at /my
const keys = await crypto.subtle.generateKey(
  { name: "RSA-OAEP", modulusLength: 4096,
    publicExponent: new Uint8Array([1,0,1]), hash: "SHA-256" },
  true,
  ["encrypt", "decrypt"]
);
// Private key → IndexedDB (never leaves device)
// Public key → uploaded to server via /api/link
```

### Hybrid Encryption (tipper side)

```typescript
// web/lib/message-encryption.ts
const aesKey = await crypto.subtle.generateKey(
  { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]
);
const nonce = crypto.getRandomValues(new Uint8Array(12));
const encryptedBody = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv: nonce }, aesKey, new TextEncoder().encode(message)
);
const exportedAesKey = await crypto.subtle.exportKey("raw", aesKey);
const encryptedKey = await crypto.subtle.encrypt(
  { name: "RSA-OAEP" }, creatorPublicKey, exportedAesKey
);
// Send: { encryptedKey, nonce, encryptedBody } as part of tip
```

### Decryption (creator side)

```typescript
// web/lib/crypto-client.ts
const aesKeyRaw = await crypto.subtle.decrypt(
  { name: "RSA-OAEP" }, privateKey, encryptedKey
);
const aesKey = await crypto.subtle.importKey("raw", aesKeyRaw, "AES-GCM", false, ["decrypt"]);
const message = new TextDecoder().decode(
  await crypto.subtle.decrypt({ name: "AES-GCM", iv: nonce }, aesKey, encryptedBody)
);
```

**Dependencies**: None. `window.crypto.subtle` is built into every browser.

---

## Key Storage

| Key Type | Location | Leaves Device? |
|----------|----------|----------------|
| Private Key | IndexedDB in browser | **Never** |
| Public Key | Supabase `creators.public_key` column | Yes (by design) |

---

## Why Hybrid Encryption?

| Approach | Max Message | Complexity |
|----------|-------------|------------|
| RSA-OAEP only | ~400 chars | Lower |
| **Hybrid (AES-GCM + RSA-OAEP)** | **Unlimited** | ~20 more lines |

Hybrid encryption handles any message size for minimal additional complexity.

---

## Security Guarantees

**We guarantee:**
1. **Content blindness** — TIPZ provably cannot read message content (no private key)
2. **AES-GCM authentication** — Messages are authenticated (tampering detected)

**We cannot guarantee:**
1. **Key authenticity** — Trust HTTPS + TIPZ for key delivery
2. **Forward secrecy** — Leaked private key exposes past messages (acceptable for tip messages)
3. **Metadata protection** — We know a tip was sent and who received it

---

## Threat Model

| Actor | Can Read Messages? |
|-------|-------------------|
| Random attacker | No — encrypted with creator's public key |
| TIPZ server operator | No — we never have the private key |
| State actor with device access | Yes — can read if IndexedDB accessible |
| State actor with server access | No — only encrypted blobs stored |
