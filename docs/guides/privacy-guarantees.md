# TIPZ Privacy Guarantees

Technical documentation of TIPZ's privacy architecture, what data we store, and our threat model.

---

## Core Privacy Philosophy

TIPZ is built on a simple principle: **financial support should leave no trace**.

Every design decision prioritizes minimizing data collection and maximizing transaction privacy. We use Zcash shielded addresses because they provide the strongest on-chain privacy available today.

---

## What Data TIPZ Stores

### Supabase Database (Our Backend)

| Data | Stored | Purpose |
|------|--------|---------|
| Creator X handle | Yes | Profile identification |
| Shielded address | Yes | Tip routing |
| Registration timestamp | Yes | Account management |
| Verification status | Yes | Spam prevention |
| Tip transactions (pending) | Temporarily | Status polling during swap |
| Tip amount (USD) | Temporarily | UI display during transaction |

### What We DO NOT Store

| Data | Stored | Why |
|------|--------|-----|
| Tipper identity | No | Never collected |
| Tipper wallet address | No | Not logged to database |
| IP addresses | No | Not logged |
| Browser fingerprints | No | Not collected |
| Completed transaction details | No | Deleted after confirmation |
| ZEC transaction IDs | No | On-chain only |

### Data Retention

- **Pending transactions:** Deleted within 24 hours of completion
- **Failed transactions:** Deleted within 7 days
- **Creator profiles:** Retained until creator requests deletion
- **Server logs:** 7-day rolling window, no PII

---

## On-Chain Privacy (Zcash Shielded Transactions)

TIPZ exclusively uses Zcash **shielded addresses** (`u1*` or `zs1*`).

### How Shielded Transactions Work

1. **Zero-Knowledge Proofs:** Transactions use zk-SNARKs to prove validity without revealing:
   - Sender address
   - Recipient address
   - Transaction amount

2. **Encrypted Memo Field:** The 512-byte memo is encrypted and only readable by the recipient

3. **Viewing Keys:** Only the recipient can decrypt transaction details with their viewing key

### Privacy Guarantees

| What blockchain observers see | Answer |
|------------------------------|--------|
| Who sent the tip? | Unknown |
| Who received the tip? | Unknown |
| How much was sent? | Unknown |
| When was it sent? | Approximate (block time) |
| Was it even a tip? | Unknown (looks like any ZEC tx) |

### Why Not Other Cryptocurrencies?

| Currency | Privacy Level | Notes |
|----------|--------------|-------|
| Bitcoin | Pseudonymous | Addresses linkable via chain analysis |
| Ethereum | Pseudonymous | Full transaction graph visible |
| Monero | Strong | Good privacy, less ecosystem support |
| **Zcash (shielded)** | **Strongest** | **Mathematically proven privacy** |

---

## Cross-Chain Swap Privacy (NEAR Intents)

When tippers pay with ETH, USDC, or SOL, we use NEAR Intents for cross-chain swaps.

### Swap Flow

```
Tipper's Wallet (ETH/USDC/SOL)
    ↓
NEAR Intents Deposit Address (public)
    ↓
NEAR Protocol (swap executed)
    ↓
Zcash Shielded Address (private)
```

### Privacy Characteristics

**What's visible on source chain (Ethereum/Solana):**
- Tipper's wallet address
- Amount sent to NEAR Intents deposit address
- Timestamp

**What's NOT linkable:**
- The destination (creator's shielded address)
- The final amount in ZEC
- The purpose of the transaction

**Why this is acceptable:**
- The tipper's transaction looks like any DeFi swap
- No on-chain link between tipper and creator
- NEAR Intents doesn't know or store the relationship

### Privacy Improvement: Direct ZEC

For maximum privacy, tippers can:
1. Click "I have ZEC" on the tip page
2. Scan the QR code with their Zcash wallet
3. Send directly—no cross-chain trail

---

## Threat Model

### Who We Protect Against

| Adversary | Protected? | How |
|-----------|-----------|-----|
| **Casual observers** | Yes | Shielded transactions hide all details |
| **Chain analysis firms** | Yes | ZK proofs prevent transaction graph analysis |
| **TIPZ (us)** | Yes | We don't collect tipper identity |
| **Law enforcement (without warrant)** | Yes | No data to subpoena |
| **Compromised database** | Partial | Creator profiles exposed, but no tip history |

### What We CAN'T Protect Against

| Adversary | Risk | Mitigation |
|-----------|------|------------|
| **Creator doxxing themselves** | Creator shares their address publicly | Use unique address for TIPZ |
| **Tipper announcing their tip** | Tipper publicly tweets "I just tipped!" | Social choice, not technical |
| **Metadata timing attacks** | Correlating tip page visit with blockchain tx | Use Tor, delay tips |
| **NEAR Intents logging** | They could theoretically log swap destinations | Direct ZEC flow available |

---

## Limitations & Honest Caveats

### Things That ARE NOT Private

1. **Your tip page exists:** `tipz.cash/yourhandle` is public if you share it
2. **Your shielded address:** Visible on your profile (but receiving to it is private)
3. **That someone visited your page:** Standard web analytics could track this (we don't)

### Things We're Working On

1. **Onion routing:** Tor support for tip page access
2. **Memo encryption:** End-to-end encrypted messages from tipper to creator
3. **Self-hosted profiles:** Run your own tip page with zero TIPZ involvement

---

## Technical Implementation Details

### Shielded Address Validation

```typescript
// We only accept shielded addresses
function isValidShieldedAddress(address: string): boolean {
  return address.startsWith("u1") || address.startsWith("zs1")
}
```

### No Tipper Logging

```typescript
// In our API routes, we explicitly DON'T log tipper info
// This is intentional - we can't leak what we don't have
export async function POST(request: Request) {
  const { creatorHandle, amount } = await request.json()
  // Note: No wallet address, no IP, no user agent logged

  // Process tip...
}
```

### Data Deletion

```typescript
// Pending transactions auto-expire
const PENDING_EXPIRY_HOURS = 24

async function cleanupPendingTransactions() {
  await supabase
    .from("pending_transactions")
    .delete()
    .lt("created_at", hoursAgo(PENDING_EXPIRY_HOURS))
}
```

---

## Comparison to Alternatives

| Platform | Tipper Privacy | Creator Privacy | Fees |
|----------|---------------|-----------------|------|
| Patreon | None (name visible) | None (earnings public) | 5-12% |
| Ko-fi | None | Partial | 0-5% |
| Buy Me a Coffee | None | None | 5% |
| PayPal | None | None | 2.9%+ |
| **TIPZ** | **Full (shielded)** | **Full** | **0%** |

---

## Auditing & Verification

### Open Source

All TIPZ code is open source at [github.com/defi-naly/tipz](https://github.com/defi-naly/tipz).

You can verify:
- We don't log tipper data (check API routes)
- We use shielded addresses only (check validation)
- Transaction cleanup runs as documented

### Zcash Protocol

Zcash's shielded transactions are:
- Peer-reviewed cryptography
- Audited by multiple security firms
- In production since 2016 with no privacy breaks

References:
- [Zcash Protocol Specification](https://zips.z.cash/protocol/protocol.pdf)
- [Sapling Audit Report](https://electriccoin.co/blog/sapling-security-assessments/)

---

## Questions?

If you have questions about our privacy model:
- Open an issue on GitHub
- Email privacy@tipz.cash
- Review our code directly

We believe in transparency about our privacy guarantees—including their limitations.
