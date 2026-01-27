# NEAR Intents Integration Guide

Technical documentation for integrating real NEAR Intents/Defuse SDK to replace the current mock implementation.

---

## Current Mock Implementation

### Files to Replace

| File | Current State | Production State |
|------|---------------|------------------|
| `web/app/api/intents/create/route.ts` | Returns fake intent IDs | Creates real NEAR Intents |
| `web/app/api/swap/execute/route.ts` | Returns mock tx hashes | Executes real swaps |
| `extension/lib/payment.ts` | Calls mock APIs | No changes needed (uses same API) |

### Current Flow (Demo Mode)

```
User Wallet → TIPZ Extension → /api/swap/execute (MOCK) → /api/intents/create (MOCK) → Fake Success
```

### Target Flow (Production)

```
User Wallet → TIPZ Extension → /api/swap/execute → Swap Aggregator → NEAR Intents → Zcash Shielded
```

---

## Phase A: NEAR SDK Integration

### 1. Install Dependencies

```bash
cd tipz/web
npm install near-api-js @near-js/client @near-js/keystores-browser
```

### 2. NEAR Configuration

Create `lib/near.ts`:

```typescript
import { connect, keyStores, WalletConnection } from "near-api-js";

const NEAR_CONFIG = {
  testnet: {
    networkId: "testnet",
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://testnet.mynearwallet.com/",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://testnet.nearblocks.io",
  },
  mainnet: {
    networkId: "mainnet",
    nodeUrl: "https://rpc.mainnet.near.org",
    walletUrl: "https://app.mynearwallet.com/",
    helperUrl: "https://helper.mainnet.near.org",
    explorerUrl: "https://nearblocks.io",
  },
};

const isMainnet = process.env.NEAR_NETWORK === "mainnet";
const config = isMainnet ? NEAR_CONFIG.mainnet : NEAR_CONFIG.testnet;

export async function getNearConnection() {
  const keyStore = new keyStores.InMemoryKeyStore();
  const near = await connect({ ...config, keyStore });
  return near;
}

export async function getIntentsContract(near: any) {
  const account = await near.account(process.env.NEAR_ACCOUNT_ID);
  return account;
}
```

### 3. Environment Variables

Add to `.env.local`:

```bash
# NEAR Configuration
NEAR_NETWORK=testnet  # or mainnet
NEAR_ACCOUNT_ID=tipz.testnet
NEAR_PRIVATE_KEY=ed25519:...

# Intents Contract
NEAR_INTENTS_CONTRACT=intents.near  # or testnet equivalent

# API Keys (for swap aggregators)
THORCHAIN_API_KEY=
ONEINCH_API_KEY=
```

---

## Phase B: Intents Contract Integration

### Defuse Protocol

Defuse is a cross-chain intent system built on NEAR. It allows:
- Cross-chain token swaps
- Private destination routing
- Multi-hop transactions

### Install Defuse SDK (when available)

```bash
npm install @defuse-protocol/defuse-sdk
```

### Intents Contract Interface

The intents contract typically has these methods:

```typescript
interface IntentsContract {
  // Create a new intent
  create_intent(args: {
    intent_type: "swap" | "transfer" | "bridge";
    source_chain: string;
    source_token: string;
    source_amount: string;
    destination_chain: string;
    destination_token: string;
    destination_address: string;
    deadline: number;
    solver_id?: string;
  }): Promise<{ intent_id: string }>;

  // Get intent status
  get_intent(intent_id: string): Promise<{
    id: string;
    status: "pending" | "matched" | "executing" | "completed" | "failed";
    source_tx?: string;
    destination_tx?: string;
    solver?: string;
  }>;

  // Cancel an intent (before execution)
  cancel_intent(intent_id: string): Promise<void>;
}
```

---

## Phase C: Updated API Implementation

### `/api/intents/create/route.ts` (Production Version)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { connect, keyStores, Contract } from "near-api-js";

const NEAR_CONFIG = {
  networkId: process.env.NEAR_NETWORK || "testnet",
  nodeUrl: process.env.NEAR_NODE_URL || "https://rpc.testnet.near.org",
  contractId: process.env.NEAR_INTENTS_CONTRACT || "intents.testnet.near",
};

interface IntentRequest {
  amount: string;
  destinationAddress: string;
  destinationChain: string;
  metadata?: {
    sourceTxHash?: string;
    sourceChain?: number;
    senderAddress?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: IntentRequest = await request.json();
    const { amount, destinationAddress, destinationChain, metadata } = body;

    // Validate inputs
    if (!amount || !destinationAddress || !destinationChain) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate shielded address
    if (!destinationAddress.startsWith("zs1") && !destinationAddress.startsWith("u1")) {
      return NextResponse.json(
        { error: "Invalid ZEC shielded address" },
        { status: 400 }
      );
    }

    // Connect to NEAR
    const keyStore = new keyStores.InMemoryKeyStore();
    await keyStore.setKey(
      NEAR_CONFIG.networkId,
      process.env.NEAR_ACCOUNT_ID!,
      // Parse private key from env
      KeyPair.fromString(process.env.NEAR_PRIVATE_KEY!)
    );

    const near = await connect({
      ...NEAR_CONFIG,
      keyStore,
    });

    const account = await near.account(process.env.NEAR_ACCOUNT_ID!);

    // Initialize contract
    const contract = new Contract(account, NEAR_CONFIG.contractId, {
      viewMethods: ["get_intent", "get_supported_chains"],
      changeMethods: ["create_intent", "cancel_intent"],
    });

    // Create intent on NEAR
    const intentResult = await (contract as any).create_intent({
      args: {
        intent_type: "swap",
        source_chain: metadata?.sourceChain?.toString() || "1", // Ethereum
        source_token: "native",
        source_amount: amount,
        destination_chain: "ZEC",
        destination_token: "ZEC",
        destination_address: destinationAddress,
        deadline: Date.now() + 3600000, // 1 hour
      },
      gas: "100000000000000", // 100 TGas
      attachedDeposit: "1", // 1 yoctoNEAR for storage
    });

    return NextResponse.json({
      success: true,
      intentId: intentResult.intent_id,
      status: "pending",
      destinationChain: "ZEC",
      estimatedCompletion: Date.now() + 300000, // 5 minutes
      nearContract: NEAR_CONFIG.contractId,
      nearTxHash: intentResult.transaction_hash,
    });
  } catch (error: any) {
    console.error("[intents/create] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create intent" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const intentId = request.nextUrl.searchParams.get("intentId");

  if (!intentId) {
    return NextResponse.json(
      { error: "Missing intentId parameter" },
      { status: 400 }
    );
  }

  try {
    // Connect to NEAR (view-only, no key needed)
    const near = await connect({
      networkId: NEAR_CONFIG.networkId,
      nodeUrl: NEAR_CONFIG.nodeUrl,
    });

    const account = await near.account("system");

    const contract = new Contract(account, NEAR_CONFIG.contractId, {
      viewMethods: ["get_intent"],
      changeMethods: [],
    });

    const intent = await (contract as any).get_intent({ intent_id: intentId });

    return NextResponse.json({
      intentId: intent.id,
      status: intent.status,
      sourceTx: intent.source_tx,
      destinationTx: intent.destination_tx,
      solver: intent.solver,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get intent status" },
      { status: 500 }
    );
  }
}
```

---

## Phase D: Swap Infrastructure

### Option 1: THORChain Integration

THORChain provides cross-chain swaps with ZEC support.

```typescript
// lib/thorchain.ts
const THORCHAIN_API = "https://thornode.ninerealms.com";

export async function getThorChainQuote(
  fromAsset: string,
  toAsset: string,
  amount: string,
  destination: string
) {
  const response = await fetch(
    `${THORCHAIN_API}/thorchain/quote/swap?` +
    `from_asset=${fromAsset}&` +
    `to_asset=${toAsset}&` +
    `amount=${amount}&` +
    `destination=${destination}`
  );

  return response.json();
}

export async function executeThorChainSwap(
  quote: any,
  walletAddress: string,
  privateKey: string
) {
  // Implement swap execution with THORChain
  // This requires sending to a THORChain vault address
}
```

### Option 2: 1inch + Bridge

Use 1inch for EVM swaps + a bridge for ZEC output.

```typescript
// lib/oneinch.ts
const ONEINCH_API = "https://api.1inch.dev/swap/v5.2";

export async function get1inchQuote(
  chainId: number,
  fromToken: string,
  toToken: string,
  amount: string
) {
  const response = await fetch(
    `${ONEINCH_API}/${chainId}/quote?` +
    `src=${fromToken}&` +
    `dst=${toToken}&` +
    `amount=${amount}`,
    {
      headers: {
        "Authorization": `Bearer ${process.env.ONEINCH_API_KEY}`,
      },
    }
  );

  return response.json();
}
```

---

## Testing Strategy

### Phase 1: Testnet Integration

1. Deploy to NEAR testnet
2. Use testnet ETH (Goerli/Sepolia) for input
3. Verify intents are created on NEAR Explorer
4. Mock ZEC output (no testnet for shielded)

### Phase 2: Mainnet Dry Run

1. Deploy to NEAR mainnet with low limits
2. Test with small amounts ($1-5)
3. Verify full flow: ETH → Swap → NEAR Intent → ZEC

### Phase 3: Production

1. Remove amount limits
2. Enable full token support
3. Add monitoring and alerts

---

## Monitoring & Error Handling

### Intent Status Polling

```typescript
// Poll intent status until completion or timeout
async function waitForIntentCompletion(
  intentId: string,
  maxWaitMs: number = 600000 // 10 minutes
): Promise<IntentStatus> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const status = await getIntentStatus(intentId);

    if (status === "completed") {
      return status;
    }

    if (status === "failed") {
      throw new Error(`Intent ${intentId} failed`);
    }

    // Wait 5 seconds before next poll
    await new Promise(r => setTimeout(r, 5000));
  }

  throw new Error(`Intent ${intentId} timed out`);
}
```

### Error Recovery

```typescript
// Handle common errors
function handleIntentError(error: any): { message: string; recoverable: boolean } {
  if (error.message.includes("insufficient_funds")) {
    return { message: "Insufficient funds for transaction", recoverable: false };
  }

  if (error.message.includes("deadline_exceeded")) {
    return { message: "Intent expired. Please try again.", recoverable: true };
  }

  if (error.message.includes("no_solver")) {
    return { message: "No solver available. Please try later.", recoverable: true };
  }

  return { message: "Transaction failed. Please try again.", recoverable: true };
}
```

---

## Security Considerations

### API Key Protection

- Store all API keys in environment variables
- Use server-side API routes (never expose keys to client)
- Implement rate limiting on all endpoints

### Transaction Validation

- Always validate shielded addresses server-side
- Implement maximum transaction limits
- Log all transactions for audit

### NEAR Account Security

- Use separate accounts for testnet/mainnet
- Implement key rotation
- Consider multi-sig for production account

---

## Cost Estimates

### NEAR Transaction Costs

| Operation | Gas | Cost (NEAR) | Cost (USD*) |
|-----------|-----|-------------|-------------|
| Create Intent | ~100 TGas | ~0.01 NEAR | ~$0.05 |
| Query Intent | 0 | Free | Free |
| Cancel Intent | ~50 TGas | ~0.005 NEAR | ~$0.025 |

*At NEAR = $5.00

### Swap Provider Costs

| Provider | Fee | Min Amount |
|----------|-----|------------|
| THORChain | 0.3% | $10 |
| 1inch | 0.1% | $1 |
| Defuse | TBD | TBD |

---

## Timeline Estimate

| Phase | Tasks | Dependencies |
|-------|-------|--------------|
| A | NEAR SDK setup | None |
| B | Intents contract integration | Phase A |
| C | Swap provider integration | Phase A |
| D | Testnet testing | Phases A-C |
| E | Mainnet deployment | Phase D |

---

## Resources

### Documentation

- [NEAR Protocol Docs](https://docs.near.org/)
- [near-api-js](https://github.com/near/near-api-js)
- [NEAR Explorer](https://explorer.near.org/)
- [THORChain Docs](https://docs.thorchain.org/)
- [Defuse Protocol](https://defuse.io/) (when available)

### Testnet Faucets

- [NEAR Testnet Faucet](https://near-faucet.io/)
- [Goerli Faucet](https://goerlifaucet.com/)

### Contract Examples

- [NEAR Examples](https://github.com/near-examples)
- [Cross-chain intents patterns](https://github.com/near/near-intents)

---

## Alternative Payment Source: Mesh Connect

Mesh Connect allows users to tip directly from their Coinbase/Binance accounts without needing a wallet. This section documents integrating Mesh as an alternative payment source that routes through NEAR Intents.

### Architecture

**Two payment paths, same NEAR Intents destination:**
1. **Wallet Connect (existing):** User connects wallet → sends to NEAR Intents deposit address → ZEC to creator
2. **Mesh (new):** User logs into exchange → Mesh sends to NEAR Intents deposit address → ZEC to creator

**TIPZ never custodies funds.** Both paths route through NEAR Intents deposit addresses.

### Flow

```
User clicks "Pay with Exchange"
    ↓
Backend gets NEAR Intents quote → deposit address
    ↓
Backend creates Mesh linkToken with toAddress = deposit address
    ↓
Frontend opens Mesh modal
    ↓
User logs into Coinbase, confirms payment
    ↓
Mesh sends USDC directly to NEAR Intents deposit address
    ↓
NEAR Intents automatically processes swap
    ↓
ZEC delivered to creator's shielded address
```

### Environment Setup

Add to `web/.env.example` and `.env.local`:
```
MESH_CLIENT_ID=
MESH_CLIENT_SECRET=
NEXT_PUBLIC_MESH_CLIENT_ID=
```

No treasury needed - funds go directly to NEAR Intents.

### Backend: Link Token Endpoint

**New file:** `web/app/api/mesh/link-token/route.ts`

```typescript
// POST /api/mesh/link-token
// Request: { amount, destinationAddress, refundAddress? }
// Response: { linkToken, depositAddress, quoteId, expiresAt }

async function POST(request: NextRequest) {
  const { amount, destinationAddress, refundAddress } = await request.json()

  // 1. Get NEAR Intents quote first (reuse existing logic)
  const nearQuote = await getSwapQuote({
    originAsset: USDC_POLYGON,  // or let user choose chain
    destinationAsset: ZEC_ASSET_ID,
    depositAmount: toSmallestUnits(amount, 6), // USDC has 6 decimals
    recipient: destinationAddress,  // Creator's shielded address
    refundTo: refundAddress || destinationAddress,
  })

  // 2. Create Mesh linkToken pointing to NEAR Intents deposit address
  const meshResponse = await fetch('https://integration-api.meshconnect.com/api/v1/linktoken', {
    method: 'POST',
    headers: {
      'X-Client-Id': process.env.MESH_CLIENT_ID,
      'X-Client-Secret': process.env.MESH_CLIENT_SECRET,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: `tip_${Date.now()}`,
      transferOptions: {
        transactionId: nearQuote.correlationId,
        transferType: 'payment',
        fundingOptions: { enabled: true },  // SmartFunding
        toAddresses: [{
          symbol: 'USDC',
          address: nearQuote.quote.depositAddress,  // ← Key: NEAR Intents deposit
          networkId: 'polygon',  // Verify exact ID in Mesh sandbox
          amount: parseFloat(amount),
        }],
      },
    }),
  })

  const { linkToken } = await meshResponse.json()

  // 3. Return both tokens to frontend
  return NextResponse.json({
    linkToken,
    depositAddress: nearQuote.quote.depositAddress,
    quoteId: nearQuote.correlationId,
    expiresAt: new Date(nearQuote.quote.deadline).getTime(),
  })
}
```

### Backend: Status Polling

**Reuse existing:** `web/app/api/swap/status/route.ts`

The existing status endpoint already polls NEAR Intents by deposit address. No changes needed - frontend can poll this after Mesh transfer completes.

### Frontend: Add Mesh Option to TippingFlow

**Install:** `npm install @meshconnect/web-link-sdk`

**Modify:** `web/components/tipping/TippingFlow.tsx`

Add payment method toggle when wallet not connected:
```tsx
{!walletState.isConnected && (
  <div>
    {/* Primary: Mesh/Exchange option */}
    <MeshPayButton
      amount={selectedAmount}
      destinationAddress={shieldedAddress}
      onSuccess={handleMeshSuccess}
      onError={handleMeshError}
    />

    {/* Secondary: Wallet connect */}
    <button onClick={connect}>
      Or connect wallet
    </button>
  </div>
)}
```

### Frontend: MeshPayButton Component

**New component:** `web/components/tipping/MeshPayButton.tsx`

```tsx
import { createLink } from "@meshconnect/web-link-sdk"

function MeshPayButton({ amount, destinationAddress, onSuccess, onError }) {
  const [isLoading, setIsLoading] = useState(false)
  const [depositAddress, setDepositAddress] = useState<string | null>(null)

  const handleClick = async () => {
    setIsLoading(true)

    // 1. Get linkToken + NEAR Intents deposit address from backend
    const res = await fetch('/api/mesh/link-token', {
      method: 'POST',
      body: JSON.stringify({ amount, destinationAddress }),
    })
    const { linkToken, depositAddress, quoteId, expiresAt } = await res.json()

    setDepositAddress(depositAddress)

    // 2. Open Mesh modal
    const meshLink = createLink({
      clientId: process.env.NEXT_PUBLIC_MESH_CLIENT_ID,
      onTransferFinished: (payload) => {
        // 3. Transfer complete - now poll NEAR Intents status
        onSuccess({ depositAddress, quoteId })
      },
      onExit: (error) => {
        if (error) onError(error)
        setIsLoading(false)
      },
    })

    meshLink.openLink(linkToken)
  }

  return (
    <button onClick={handleClick} disabled={isLoading || !amount}>
      {isLoading ? 'Loading...' : `Pay $${amount} with Coinbase`}
    </button>
  )
}
```

### Frontend: Transaction Status Updates

The existing `TransactionStatus` component already handles NEAR Intents status polling. After Mesh transfer completes:
1. Frontend receives `depositAddress` from `onTransferFinished`
2. Poll `/api/swap/status?address={depositAddress}` (existing endpoint)
3. Show existing status UI: "Processing swap..." → "Complete!"

No major changes needed - just wire up the Mesh success callback to start polling.

### Verification

**Sandbox Testing:**
- Create test linkToken with NEAR Intents deposit address
- Complete test transfer in Mesh sandbox
- Verify USDC arrives at deposit address
- Verify NEAR Intents swap processes automatically (check status endpoint)

**Production Testing:**
- Small real tip ($1-2) through Mesh
- Confirm ZEC delivered to test shielded address
- Test error cases (quote expired, user cancels, etc.)

### Edge Cases

1. **Quote expiry:** NEAR Intents quotes expire in ~10 minutes. If user takes too long in Mesh modal, show error and prompt to retry.
2. **Mesh transfer fails:** Funds stay in user's exchange - just show error message.
3. **NEAR Intents swap fails:** Funds refund to the `refundTo` address specified in the quote. Need to handle this in UI.
4. **Network mismatch:** Ensure Mesh `networkId` matches the chain NEAR Intents deposit address is on.

### Refund Flow

If NEAR Intents swap fails, funds go to `refundTo` address. For Mesh users without a wallet:
- **Option A:** Use creator's address as refund (they keep the tip attempt)
- **Option B:** Ask user for a refund address before starting (adds friction)
- **Option C:** Use a TIPZ operational address, manually handle refunds (adds custody)

**Recommendation:** Option A for v1 - failed tips become "donations" to creator. Rare edge case.

### Resources

- [Mesh Connect Documentation](https://docs.meshconnect.com/)
- [Mesh Dashboard](https://dashboard.meshconnect.com/)
