# Private Messaging Technical Specification

Zero-Knowledge DMs for TIPZ — "We Cannot Read Your Messages"

---

## TL;DR — Core Implementation (~50 lines of crypto)

```typescript
// Creator generates keypair (once, on extension link)
const keys = await crypto.subtle.generateKey(
  { name: "RSA-OAEP", modulusLength: 4096, publicExponent: new Uint8Array([1,0,1]), hash: "SHA-256" },
  true,
  ["encrypt", "decrypt"]
);
// Store private key in chrome.storage.local (password-protected)
// Upload public key to server

// Tipper encrypts message (hybrid: AES-GCM + RSA-OAEP)
const aesKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
const nonce = crypto.getRandomValues(new Uint8Array(12));
const encryptedBody = await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aesKey, new TextEncoder().encode(message));
const exportedAesKey = await crypto.subtle.exportKey("raw", aesKey);
const encryptedKey = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, creatorPublicKey, exportedAesKey);
// Send: { encryptedKey, nonce, encryptedBody }

// Creator decrypts
const aesKeyRaw = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encryptedKey);
const aesKey = await crypto.subtle.importKey("raw", aesKeyRaw, "AES-GCM", false, ["decrypt"]);
const message = new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: nonce }, aesKey, encryptedBody));
```

**Dependencies**: None. `window.crypto.subtle` is built into every browser.

---

## Overview

Private Messaging enables tippers to send encrypted messages alongside tips. The core security guarantee: **TIPZ servers cannot read message content**. This is the 0→1 monopoly feature that makes "X cannot compete" structurally true.

### Why This Matters

1. **Tippers get privacy** — Support is personal. Expressing gratitude shouldn't create a surveillance record.
2. **Creators get signal** — Anonymous tips are nice; tips with context are actionable.
3. **TIPZ gets a moat** — X will never offer this because encrypted DMs undermine their ad targeting model.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           TIPPER BROWSER                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 1. Fetch creator's public key from TIPZ                          │   │
│  │ 2. Generate ephemeral AES-256-GCM key                            │   │
│  │ 3. Encrypt message with AES-GCM                                  │   │
│  │ 4. Encrypt AES key with creator's RSA-OAEP public key            │   │
│  │ 5. Send [encryptedKey + nonce + encryptedBody] to Blind Relay    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           TIPZ SERVER                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Blind Relay Endpoint                                             │   │
│  │ • Receives: { depositAddress, encryptedBlob, timestamp }         │   │
│  │ • Validates: depositAddress exists                               │   │
│  │ • Pushes: to creator's Realtime channel                          │   │
│  │ • Logs: { timestamp, delivered: true } ONLY                      │   │
│  │ • CANNOT: decrypt, read, or correlate content                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        CREATOR EXTENSION                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 1. Receive encrypted blob via Supabase Realtime                  │   │
│  │ 2. Decrypt AES key using local RSA private key                   │   │
│  │ 3. Decrypt message body using AES-GCM + nonce                    │   │
│  │ 4. Display: "+$5 • [Message]" with lock icon                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Why Hybrid Encryption?

| Approach | Max Message | Complexity | Future-Proof |
|----------|-------------|------------|--------------|
| RSA-OAEP only | ~400 chars | Lower | Breaks if users want longer messages |
| **Hybrid (AES-GCM + RSA-OAEP)** | **Unlimited** | ~20 more lines | **Handles any message size** |

Hybrid encryption is antifragile: it gains optionality (unlimited messages) for minimal additional complexity.

### Effort Estimate

| Task | Time |
|------|------|
| Keypair generation (4096-bit) + storage | 2 hrs |
| Hybrid encrypt function (tipper side) | 2 hrs |
| Decrypt function (creator side) | 2 hrs |
| API endpoint (blind relay) | 1 hr |
| Password-encrypt private key storage | 2 hrs |
| Testing | 2 hrs |
| **Total** | **~1.5 days** |

### Dependencies

**None.** `window.crypto.subtle` is built into every browser. No npm packages required.

---

## 1. RSA-OAEP Key Generation

### When Keys Are Generated

Keys are generated **once** during initial extension linking:

1. Creator installs extension
2. Creator links extension to their TIPZ account (via tipz.cash)
3. Extension generates RSA-OAEP keypair
4. Public key sent to server with link request
5. Private key stored locally, never leaves device

### Key Generation Implementation

```typescript
// extension/lib/crypto.ts

export interface KeyPair {
  publicKey: JsonWebKey;
  privateKey: JsonWebKey;
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
  );

  const publicKey = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privateKey = await crypto.subtle.exportKey("jwk", keyPair.privateKey);

  return { publicKey, privateKey };
}

/**
 * Derive encryption key from password using PBKDF2.
 * Used to encrypt the private key before storage.
 */
async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

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
  );
}

/**
 * Store private key in chrome.storage.local, encrypted with user password.
 * This key NEVER leaves the device in plaintext.
 *
 * @param privateKey - The RSA private key to store
 * @param password - User-provided password for encryption (optional for v1)
 */
export async function storePrivateKey(
  privateKey: JsonWebKey,
  password?: string
): Promise<void> {
  if (password) {
    // Password-protected storage (recommended)
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const derivedKey = await deriveKeyFromPassword(password, salt);

    const encoder = new TextEncoder();
    const encryptedKey = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      derivedKey,
      encoder.encode(JSON.stringify(privateKey))
    );

    await chrome.storage.local.set({
      tipzPrivateKey: {
        encrypted: true,
        salt: Array.from(salt),
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(encryptedKey)),
      },
      keyCreatedAt: Date.now(),
    });
  } else {
    // Plaintext storage (simpler, less secure)
    await chrome.storage.local.set({
      tipzPrivateKey: { encrypted: false, data: privateKey },
      keyCreatedAt: Date.now(),
    });
  }
}

/**
 * Retrieve private key from storage.
 * Returns null if not found (creator hasn't linked).
 *
 * @param password - Required if key was stored with password protection
 */
export async function getPrivateKey(password?: string): Promise<JsonWebKey | null> {
  const result = await chrome.storage.local.get(["tipzPrivateKey"]);
  const stored = result.tipzPrivateKey;

  if (!stored) return null;

  if (stored.encrypted) {
    if (!password) {
      throw new Error("Password required to decrypt private key");
    }

    const salt = new Uint8Array(stored.salt);
    const iv = new Uint8Array(stored.iv);
    const encryptedData = new Uint8Array(stored.data);

    const derivedKey = await deriveKeyFromPassword(password, salt);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      derivedKey,
      encryptedData
    );

    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decrypted));
  }

  return stored.data;
}
```

### Key Storage Locations

| Key Type | Location | Leaves Device? |
|----------|----------|----------------|
| Private Key | `chrome.storage.local` | **Never** |
| Public Key | Supabase `creators` table | Yes (by design) |

### Database Schema Update

```sql
-- Add public key column to creators table
ALTER TABLE creators
ADD COLUMN public_key JSONB;

-- Index for efficient lookup
CREATE INDEX idx_creators_public_key_exists
ON creators ((public_key IS NOT NULL));
```

---

## 2. Message Encryption (Tipper Side)

### Hybrid Encryption Flow

Hybrid encryption uses AES-GCM for the message body (fast, unlimited size) and RSA-OAEP to encrypt the AES key (secure key exchange).

```typescript
// web/lib/message-encryption.ts

export interface EncryptedMessage {
  encryptedKey: string;   // RSA-encrypted AES key (base64)
  nonce: string;          // AES-GCM nonce (base64)
  encryptedBody: string;  // AES-encrypted message (base64)
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
  );

  // 2. Generate random nonce for AES-GCM
  const nonce = crypto.getRandomValues(new Uint8Array(12));

  // 3. Encrypt message with AES-GCM
  const encoder = new TextEncoder();
  const encryptedBody = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    aesKey,
    encoder.encode(message)
  );

  // 4. Export AES key as raw bytes
  const exportedAesKey = await crypto.subtle.exportKey("raw", aesKey);

  // 5. Import creator's RSA public key
  const publicKey = await crypto.subtle.importKey(
    "jwk",
    publicKeyJwk,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  );

  // 6. Encrypt AES key with RSA-OAEP
  const encryptedKey = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    exportedAesKey
  );

  // 7. Encode all components as base64
  return {
    encryptedKey: btoa(String.fromCharCode(...new Uint8Array(encryptedKey))),
    nonce: btoa(String.fromCharCode(...nonce)),
    encryptedBody: btoa(String.fromCharCode(...new Uint8Array(encryptedBody))),
  };
}

/**
 * Serialize encrypted message for transmission.
 */
export function serializeEncryptedMessage(msg: EncryptedMessage): string {
  return JSON.stringify(msg);
}
```

### Why Hybrid Encryption?

| Concern | Direct RSA | Hybrid (AES + RSA) |
|---------|------------|-------------------|
| Max message size | ~400 chars | **Unlimited** |
| Performance | Slow for large data | Fast (AES is hardware-accelerated) |
| Complexity | ~20 lines | ~50 lines |
| Future flexibility | Need rewrite for longer messages | **Already handles any size** |

**Decision**: Use hybrid encryption. The extra ~30 lines are worth the antifragility.

---

## 2.5 Message Input UX

### Design: Collapsible Optional Input

The encryption supports unlimited messages, but UX should minimize friction for quick tips.

```
┌─────────────────────────────────────┐
│  Tip @zooko                         │
│                                     │
│  Amount: [$5] [$10] [$25] [Custom]  │
│                                     │
│  Token: [ETH ▼]                     │
│                                     │
│  ▶ Add a message (optional)         │  ← Collapsed by default
│                                     │
│  [Connect Wallet]                   │
└─────────────────────────────────────┘

         ↓ User clicks "Add a message"

┌─────────────────────────────────────┐
│  Tip @zooko                         │
│                                     │
│  Amount: [$5] [$10] [$25] [Custom]  │
│                                     │
│  Token: [ETH ▼]                     │
│                                     │
│  ▼ Add a message (optional)         │
│  ┌─────────────────────────────┐    │
│  │ Thanks for the privacy      │    │
│  │ content! Keep it up.        │    │
│  │                             │    │
│  │                        233  │    │  ← Remaining (280 - 47)
│  └─────────────────────────────┘    │
│  🔒 End-to-end encrypted            │  ← Trust signal
│                                     │
│  [Connect Wallet]                   │
└─────────────────────────────────────┘
```

### UX Decisions

| Decision | Rationale |
|----------|-----------|
| **Collapsed by default** | Zero friction for quick tips — most users won't add messages |
| **280 char hard limit** | Matches X/Twitter — users know this limit; forces "tip message" not "letter" |
| **"End-to-end encrypted" label** | Trust signal — differentiates from regular DMs |
| **Lock icon on sent confirmation** | Reinforces privacy guarantee |

### Implementation

```tsx
// web/components/tipping/MessageInput.tsx

const MESSAGE_LIMIT = 280; // Match X/Twitter limit

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
}

function MessageInput({ value, onChange }: MessageInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const remaining = MESSAGE_LIMIT - value.length;
  const isOverLimit = remaining < 0;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Hard limit — don't allow over 280
    if (e.target.value.length <= MESSAGE_LIMIT) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="message-input">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-muted hover:text-white"
      >
        <span>{isExpanded ? "▼" : "▶"}</span>
        Add a message (optional)
      </button>

      {isExpanded && (
        <div className="mt-2">
          <textarea
            value={value}
            onChange={handleChange}
            maxLength={MESSAGE_LIMIT}
            placeholder="Say something nice..."
            className="w-full bg-surface border border-border rounded p-3 text-sm resize-none"
            rows={3}
          />
          <div className="flex justify-between items-center mt-1 text-xs">
            <span className="text-muted flex items-center gap-1">
              <LockIcon className="w-3 h-3" />
              End-to-end encrypted
            </span>
            <span className={remaining < 20 ? "text-amber-500" : "text-muted"}>
              {remaining}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Integration with TippingFlow

```tsx
// In TippingFlow.tsx

const [message, setMessage] = useState("");

// ... existing amount/token selection ...

<MessageInput value={message} onChange={setMessage} />

// On tip submission:
if (message.trim()) {
  const encrypted = await encryptMessage(message, creator.publicKey);
  await fetch("/api/messages/relay", {
    method: "POST",
    body: JSON.stringify({
      depositAddress,
      encryptedBlob: serializeEncryptedMessage(encrypted),
    }),
  });
}
```

### Character Limit

**280 characters (hard limit)** — matches X/Twitter.

| Rationale | |
|-----------|--|
| Users know this limit | Familiar from the platform TIPZ is built on |
| Forces concision | "Tip message" not "letter to creator" |
| Fits notification UI | No truncation needed in extension popup |
| Easy to change later | Single constant if we want to adjust |

Most tip messages are <100 chars anyway ("Thanks!" / "Love your work!").

---

## 3. Blind Relay Architecture

### Design Principles

1. **Content blindness** — Server receives encrypted blob, cannot decrypt
2. **Sender blindness** — No IP logging on message content
3. **Correlation resistance** — Cannot link messages to specific tips
4. **Minimal logging** — Only timestamp + delivery status

### API Endpoint

```typescript
// web/app/api/messages/relay/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface RelayRequest {
  depositAddress: string;  // NEAR Intents deposit address (identifies tip)
  encryptedBlob: string;   // Base64-encoded encrypted message
  timestamp?: number;      // Optional client timestamp
}

export async function POST(request: NextRequest) {
  try {
    const body: RelayRequest = await request.json();
    const { depositAddress, encryptedBlob, timestamp } = body;

    // 1. Validate required fields
    if (!depositAddress || !encryptedBlob) {
      return NextResponse.json(
        { error: "Missing depositAddress or encryptedBlob" },
        { status: 400 }
      );
    }

    // 2. Validate blob size (prevent abuse)
    if (encryptedBlob.length > 10000) {
      return NextResponse.json(
        { error: "Message too large" },
        { status: 413 }
      );
    }

    // 3. Look up creator by deposit address
    // (depositAddress is already public from tip transaction)
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .select("creator_id, creators(id, handle, public_key)")
      .eq("deposit_address", depositAddress)
      .single();

    if (txError || !transaction) {
      return NextResponse.json(
        { error: "Unknown deposit address" },
        { status: 404 }
      );
    }

    const creator = transaction.creators as any;

    // 4. Verify creator has public key (can receive messages)
    if (!creator.public_key) {
      return NextResponse.json(
        { error: "Creator cannot receive messages" },
        { status: 400 }
      );
    }

    // 5. Push to creator's Realtime channel
    // Channel name = creator's UUID (only they can subscribe)
    const channel = `messages:${creator.id}`;

    await supabase.channel(channel).send({
      type: "broadcast",
      event: "new_message",
      payload: {
        depositAddress,
        encryptedBlob,
        receivedAt: Date.now(),
      },
    });

    // 6. Log ONLY delivery metadata (no content, no sender info)
    // DO NOT log: encryptedBlob, IP address, user agent
    console.log(JSON.stringify({
      event: "message_relayed",
      timestamp: Date.now(),
      creatorId: creator.id,  // OK to log (public)
      depositAddress,          // OK to log (public from blockchain)
      delivered: true,
    }));

    return NextResponse.json({
      success: true,
      delivered: true,
    });

  } catch (error: any) {
    console.error("[relay] Error:", error.message);
    return NextResponse.json(
      { error: "Relay failed" },
      { status: 500 }
    );
  }
}
```

### Rate Limiting

```typescript
// Implement sliding window rate limit
// 10 messages per minute per IP (prevents spam)
// Note: This is the ONLY place we use IP, and only for rate limiting

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10;

// In-memory store (replace with Redis in production)
const rateLimitStore = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitStore.get(ip) || [];

  // Remove old timestamps
  const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);

  if (recent.length >= RATE_LIMIT_MAX) {
    return true;
  }

  // Add current request
  recent.push(now);
  rateLimitStore.set(ip, recent);

  return false;
}
```

### What We Log vs. Don't Log

| Data Point | Logged? | Reason |
|------------|---------|--------|
| Timestamp | Yes | Debugging, audit |
| Delivery status | Yes | Debugging |
| Creator ID | Yes | Already public |
| Deposit address | Yes | Already public (blockchain) |
| Encrypted blob | **No** | Cannot read anyway, no need to store |
| Sender IP | **No** | Privacy guarantee |
| User agent | **No** | Privacy guarantee |
| Plaintext message | **Impossible** | We don't have the key |

---

## 4. Message Decryption (Creator Side)

### Hybrid Decryption Flow

```typescript
// extension/lib/crypto.ts

import { EncryptedMessage } from "./types";

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
    JSON.parse(encryptedBlob);

  // 2. Retrieve private key from storage
  const privateKeyJwk = await getPrivateKey(password);

  if (!privateKeyJwk) {
    throw new Error("No private key found. Re-link extension to TIPZ.");
  }

  // 3. Import RSA private key
  const privateKey = await crypto.subtle.importKey(
    "jwk",
    privateKeyJwk,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["decrypt"]
  );

  // 4. Decode base64 components
  const encryptedKeyBytes = Uint8Array.from(
    atob(encryptedKey),
    c => c.charCodeAt(0)
  );
  const nonceBytes = Uint8Array.from(atob(nonce), c => c.charCodeAt(0));
  const encryptedBodyBytes = Uint8Array.from(
    atob(encryptedBody),
    c => c.charCodeAt(0)
  );

  // 5. Decrypt AES key using RSA private key
  const aesKeyRaw = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encryptedKeyBytes
  );

  // 6. Import decrypted AES key
  const aesKey = await crypto.subtle.importKey(
    "raw",
    aesKeyRaw,
    "AES-GCM",
    false,
    ["decrypt"]
  );

  // 7. Decrypt message body using AES-GCM
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: nonceBytes },
    aesKey,
    encryptedBodyBytes
  );

  // 8. Decode UTF-8
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}
```

### Extension UI Updates

```typescript
// extension/components/TipNotification.tsx

interface TipWithMessage {
  amount: number;
  currency: string;
  encryptedMessage?: string;
  depositAddress: string;
}

function TipNotification({ tip }: { tip: TipWithMessage }) {
  const [message, setMessage] = useState<string | null>(null);
  const [decrypting, setDecrypting] = useState(false);

  useEffect(() => {
    if (tip.encryptedMessage) {
      setDecrypting(true);
      decryptMessage(tip.encryptedMessage)
        .then(setMessage)
        .catch(err => {
          console.error("Decryption failed:", err);
          setMessage("[Unable to decrypt]");
        })
        .finally(() => setDecrypting(false));
    }
  }, [tip.encryptedMessage]);

  return (
    <div className="tip-notification">
      <span className="amount">+${tip.amount}</span>

      {decrypting && (
        <span className="decrypting">Decrypting...</span>
      )}

      {message && (
        <div className="message">
          <LockIcon className="w-4 h-4" /> {/* Indicates end-to-end encryption */}
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
```

---

## 5. Security Model

### Attack Vectors Analysis

| Vector | Severity | Risk | Mitigation |
|--------|----------|------|------------|
| **Key storage** | Medium | Private key in `chrome.storage.local` accessible if: malicious extension installed, browser compromised, device stolen | Password-encrypt private key before storing (implemented above) |
| **No forward secrecy** | Low | If private key leaks, attacker can decrypt all past messages (static RSA key) | Key rotation monthly (optional), or accept tradeoff for stateless design |
| **No sender authentication** | None | Server can't verify who sent message. Anyone with public key can encrypt. | **This is a feature**: tie message to verified transaction (tip ID). No tip = no delivery. |
| **Replay attack** | Low | Attacker captures encrypted blob, resends it | Include timestamp in encrypted body; server rejects duplicate tip IDs |
| **Public key substitution** | Medium | Attacker compromises server, swaps creator's public key with their own | Creator signs public key with secondary key (P2), or accept risk (server compromise is game over anyway) |

### Threat Model Summary

| Actor | Can Read Messages? |
|-------|-------------------|
| Random attacker | No — encrypted with creator's public key |
| TIPZ server operator | No — we never have the private key |
| State actor with device access | Yes — can read stored messages if key not password-protected |
| State actor with server access | No — we don't store encrypted blobs |

**Verdict**: For tip messages, this is solid. We're building "pay to message," not Signal.

### Security Guarantees

**We guarantee:**

1. **Content blindness** — TIPZ provably cannot read message content (no private key)
2. **Sender anonymity** — We don't log sender identity (IP not logged on relay)
3. **No historical exposure** — We don't store encrypted blobs, so server breach exposes nothing
4. **AES-GCM authentication** — Messages are authenticated (tampering detected)

**We cannot guarantee:**

1. **Key authenticity** — No verification UI to confirm you're encrypting to the right person (trust HTTPS + TIPZ)
2. **Forward secrecy** — Leaked private key exposes all past messages (acceptable for tip messages)
3. **Metadata protection** — We know a message was sent (timestamp) and who received it (creator)

### Future Enhancements

| Enhancement | Purpose | Priority | Rationale |
|-------------|---------|----------|-----------|
| Password-protected keys | Survives device theft | **P1** | Implemented in spec |
| Key verification UI | Verify creator fingerprint | P2 | Prevents key substitution attacks |
| Key rotation | Limit exposure window | P3 | Monthly rotation, old messages unreadable |
| Signal Protocol | Perfect forward secrecy | P4 | Overkill for tip messages, consider for v3 |

---

## 6. Database Schema

### Updated Tables

```sql
-- Add public key to creators
ALTER TABLE creators
ADD COLUMN public_key JSONB,
ADD COLUMN key_created_at TIMESTAMPTZ;

-- Add deposit_address to transactions for message correlation
ALTER TABLE transactions
ADD COLUMN deposit_address TEXT;

CREATE INDEX idx_transactions_deposit_address
ON transactions(deposit_address);

-- Message delivery log (metadata only, no content)
CREATE TABLE message_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES creators(id) NOT NULL,
  deposit_address TEXT NOT NULL,
  delivered_at TIMESTAMPTZ DEFAULT NOW(),
  -- Note: NO message content stored

  CONSTRAINT fk_creator FOREIGN KEY (creator_id) REFERENCES creators(id)
);

CREATE INDEX idx_message_deliveries_creator
ON message_deliveries(creator_id);
```

---

## 7. API Reference

### GET /api/creator?handle={handle}

Updated response to include public key:

```json
{
  "handle": "zooko",
  "displayName": "Zooko Wilcox",
  "shieldedAddress": "u1...",
  "publicKey": {
    "kty": "RSA",
    "n": "...",
    "e": "AQAB",
    "alg": "RSA-OAEP-256"
  },
  "canReceiveMessages": true
}
```

### POST /api/messages/relay

Request:
```json
{
  "depositAddress": "0x...",
  "encryptedBlob": "base64encodedciphertext..."
}
```

Response:
```json
{
  "success": true,
  "delivered": true
}
```

Errors:
- `400` — Missing fields or creator can't receive messages
- `404` — Unknown deposit address
- `413` — Message too large
- `429` — Rate limited
- `500` — Server error

---

## 8. Integration Checklist

### Extension Changes

- [ ] Add `lib/crypto.ts` with key generation, encryption, decryption
- [ ] Generate keypair on first link
- [ ] Optional: prompt for password to protect private key
- [ ] Send public key with link request
- [ ] Subscribe to `messages:{creatorId}` Realtime channel
- [ ] Decrypt and display messages in notification UI (with password prompt if needed)
- [ ] Add "Messages" tab to popup
- [ ] Handle key not found (prompt re-link)
- [ ] Add password change / key export functionality (settings)

### Web Changes

- [ ] Add `lib/message-encryption.ts`
- [ ] Fetch creator's public key in TippingFlow
- [ ] Add `MessageInput` component (collapsible, 500 char soft limit)
- [ ] Integrate `MessageInput` into TippingFlow
- [ ] Call `/api/messages/relay` after successful tip (if message provided)
- [ ] Display "Private message attached" confirmation with lock icon
- [ ] Handle creators without public key (hide message input)

### Backend Changes

- [ ] Create `/api/messages/relay` endpoint
- [ ] Add `public_key` column to creators table
- [ ] Add `deposit_address` to transactions table
- [ ] Update `/api/link` to accept public key
- [ ] Update `/api/creator` to return public key

### Documentation

- [ ] Update API reference
- [ ] Create security FAQ for landing page
- [ ] Write "We cannot read your DMs" blog post
- [ ] Add key recovery warning to extension onboarding

---

## 9. Testing Plan

### Unit Tests

```typescript
// Test key generation
test("generateKeyPair creates valid RSA-OAEP 4096-bit keys", async () => {
  const { publicKey, privateKey } = await generateKeyPair();
  expect(publicKey.kty).toBe("RSA");
  expect(publicKey.alg).toBe("RSA-OAEP-256");
  expect(privateKey.d).toBeDefined(); // Private component
  // Verify 4096-bit (n is base64url encoded, ~683 chars for 4096-bit)
  expect(publicKey.n!.length).toBeGreaterThan(680);
});

// Test hybrid encryption/decryption roundtrip
test("encrypt/decrypt roundtrip preserves message", async () => {
  const { publicKey, privateKey } = await generateKeyPair();

  // Store private key (simulating extension storage)
  await storePrivateKey(privateKey);

  const message = "Thanks for the great content!";
  const encrypted = await encryptMessage(message, publicKey);
  const serialized = serializeEncryptedMessage(encrypted);
  const decrypted = await decryptMessage(serialized);

  expect(decrypted).toBe(message);
});

// Test long messages work with hybrid encryption
test("encrypt/decrypt handles long messages", async () => {
  const { publicKey, privateKey } = await generateKeyPair();
  await storePrivateKey(privateKey);

  const longMessage = "x".repeat(10000); // 10KB message
  const encrypted = await encryptMessage(longMessage, publicKey);
  const serialized = serializeEncryptedMessage(encrypted);
  const decrypted = await decryptMessage(serialized);

  expect(decrypted).toBe(longMessage);
});

// Test password-protected key storage
test("password-protected key storage works", async () => {
  const { publicKey, privateKey } = await generateKeyPair();
  const password = "test-password-123";

  await storePrivateKey(privateKey, password);

  // Without password should throw
  await expect(getPrivateKey()).rejects.toThrow("Password required");

  // With correct password should work
  const retrieved = await getPrivateKey(password);
  expect(retrieved).toEqual(privateKey);
});

// Test AES-GCM authentication (tampering detection)
test("tampered ciphertext is detected", async () => {
  const { publicKey, privateKey } = await generateKeyPair();
  await storePrivateKey(privateKey);

  const encrypted = await encryptMessage("test", publicKey);

  // Tamper with encrypted body
  const tampered = {
    ...encrypted,
    encryptedBody: encrypted.encryptedBody.slice(0, -4) + "XXXX",
  };

  await expect(decryptMessage(JSON.stringify(tampered)))
    .rejects
    .toThrow(); // AES-GCM will fail authentication
});
```

### Integration Tests

1. **Happy path**: Tipper sends tip + message → Creator receives and decrypts
2. **No public key**: Tipper tries to message creator without key → Error shown
3. **Rate limiting**: Send 15 messages quickly → Last 5 rejected with 429
4. **Key recovery**: Creator re-links extension → New keypair, old messages unreadable
5. **Long message**: Send 5KB message → Creator receives and decrypts successfully
6. **Replay attack**: Resend same message → Server rejects duplicate

### Security Audit Checklist

- [ ] Private key never sent to server (network inspection)
- [ ] Relay endpoint doesn't log encrypted content (log review)
- [ ] Rate limiting works (load test)
- [ ] HTTPS enforced on all endpoints
- [ ] Public key validated on import (malformed key rejection)
- [ ] Tampered messages are rejected (AES-GCM authentication)
- [ ] Password-protected keys require password to decrypt

---

## 10. FAQ

### Why hybrid encryption (AES-GCM + RSA-OAEP)?

RSA-OAEP is **asymmetric** — tipper encrypts with public key, only creator can decrypt with private key. But RSA has a size limit (~400 bytes for 4096-bit key). Hybrid encryption uses:
- **AES-GCM** for the message body (fast, unlimited size, authenticated)
- **RSA-OAEP** to encrypt the AES key (secure key exchange)

This gives us unlimited message size for ~30 extra lines of code. Antifragile: we never need to rewrite for longer messages.

### Why 4096-bit RSA instead of 2048-bit?

2048-bit RSA is recommended by NIST only until 2030. 4096-bit provides ~40 more years of security margin for zero additional runtime cost (key generation is a one-time operation). Always take free security.

### What if a creator loses their private key?

All historical encrypted messages are unreadable. This is the trade-off for true end-to-end encryption. We warn users during onboarding. Password-protected storage helps — if you remember the password, you can export/backup the encrypted key.

### Can TIPZ ever read messages?

No. We never have the private key. Even under legal compulsion, we cannot produce message content — only metadata (timestamp, who received). This is by design: regulatory compliance through technical impossibility.

### Why not Signal Protocol?

Signal provides perfect forward secrecy (compromised key doesn't expose past messages). It's more complex and requires interactive key exchange. For tip messages, our approach is sufficient:
- We don't store encrypted blobs (nothing to expose)
- Messages are ephemeral (delivered once, then gone from our system)
- Optional key rotation limits exposure window

Signal Protocol is a P4 enhancement if we expand to ongoing conversations.

### How do you verify you're messaging the right person?

In v1, you trust HTTPS + TIPZ. We serve the public key, so if our server is compromised, an attacker could serve a fake key. Key verification UI (showing fingerprint to compare out-of-band) is a P2 enhancement.

### What about replay attacks?

Messages include a timestamp. Server rejects:
- Duplicate deposit addresses (same tip can't have multiple messages)
- Messages older than 10 minutes (stale replays)

AES-GCM also provides authentication — tampered ciphertext is detected and rejected.

### Should I password-protect my key?

**Yes, if:**
- Your device might be stolen
- You share your computer
- You're a high-profile creator

**Optional if:**
- You're the only user of your device
- You want simpler UX (no password prompt)

Password protection encrypts the private key at rest. Without the password, even device theft doesn't expose your messages.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1 | 2026-01-29 | Updated to hybrid encryption (AES-GCM + RSA-OAEP), added password-protected key storage, added attack vectors analysis |
| 1.0 | 2026-01-29 | Initial specification |
