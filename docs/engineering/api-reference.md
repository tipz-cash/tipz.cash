# TIPZ API Reference

Complete documentation for the TIPZ API.

---

## Base URL

**Production**: `https://tipz.cash`
**Development**: `http://localhost:3000`

---

## Authentication

Currently, all endpoints are public. No authentication required.

**Future**: API keys for extension verification, rate limiting per key.

---

## Endpoints

### GET /api/health

Health check endpoint for monitoring and deployment verification.

#### Request

No parameters required.

#### Example Request

```bash
curl "https://tipz.app/api/health"
```

#### Response

**Success (200 OK - Healthy)**:
```json
{
  "status": "healthy",
  "version": "1.1.0",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "checks": {
    "database": {
      "status": "connected",
      "latency_ms": 12
    }
  }
}
```

**Error (503 Service Unavailable - Unhealthy)**:
```json
{
  "status": "unhealthy",
  "version": "1.1.0",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "checks": {
    "database": {
      "status": "disconnected",
      "error": "Connection timeout"
    }
  }
}
```

#### Notes
- Returns 200 if all checks pass
- Returns 503 if any critical check fails
- Response includes `Cache-Control: no-cache` header
- Useful for load balancer health checks and monitoring

---

### GET /api/creator

Look up a single creator by platform and handle.

#### Request

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| platform | string | Yes | Platform identifier: `x` or `substack` |
| handle | string | Yes | Creator's handle (with or without @) |

#### Example Request

```bash
curl "https://tipz.app/api/creator?platform=x&handle=elonmusk"
```

#### Response

**Success (Creator Found)**:
```json
{
  "found": true,
  "creator": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "platform": "x",
    "handle": "elonmusk",
    "shielded_address": "u1..."
  }
}
```

**Success (Creator Not Found)**:
```json
{
  "found": false
}
```

**Error (400 Bad Request)**:
```json
{
  "error": "Missing platform or handle parameter"
}
```

#### Notes
- Handle lookup is case-insensitive
- Leading `@` is stripped automatically
- Returns shielded address for display (truncated in UI)

---

### POST /api/register

Register a new creator or update existing registration.

#### Request

**Headers**:
```
Content-Type: application/json
```

**Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| platform | string | Yes | `x` or `substack` |
| handle | string | Yes | Creator's handle |
| shielded_address | string | Yes | Zcash unified address (u1...) |

#### Example Request

```bash
curl -X POST "https://tipz.app/api/register" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "x",
    "handle": "myhandle",
    "shielded_address": "u1rl42v9qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"
  }'
```

#### Response

**Success (New Registration)**:
```json
{
  "success": true,
  "message": "Registration successful",
  "verification_status": "pending"
}
```

**Success (Updated Registration)**:
```json
{
  "success": true,
  "message": "Registration updated",
  "verification_status": "pending"
}
```

**Error (429 Too Many Requests)**:
```json
{
  "error": "Too many registration attempts. Please try again later.",
  "retryAfter": 3600
}
```

**Error (400 Bad Request)**:
```json
{
  "error": "Missing required fields"
}
```

```json
{
  "error": "Invalid platform. Must be 'x' or 'substack'"
}
```

```json
{
  "error": "Invalid Zcash shielded address. Must be a Unified address (u1..., 141+ chars)"
}
```

**Error (500 Internal Server Error)**:
```json
{
  "error": "Failed to create registration"
}
```

#### Validation Rules

**Platform**:
- Must be exactly `x` or `substack`

**Handle**:
- Any non-empty string
- Normalized for storage (lowercase, @ stripped)
- Original casing preserved for display

**Shielded Address**:
- Must be a unified address starting with `u1`
- 141+ characters
- Uses Bech32m encoding

#### Notes
- Uses upsert logic: same platform + handle updates existing record
- Identity verified via Twitter OAuth 2.0 PKCE (no tweet verification needed)

---

### POST /api/creators/batch

Look up multiple creators in a single request.

#### Request

**Headers**:
```
Content-Type: application/json
```

**Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| platform | string | Yes | `x` or `substack` |
| handles | string[] | Yes | Array of handles (max 100) |

#### Example Request

```bash
curl -X POST "https://tipz.app/api/creators/batch" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "x",
    "handles": ["user1", "user2", "user3"]
  }'
```

#### Response

**Success**:
```json
{
  "results": {
    "user1": {
      "found": true,
      "creator": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "platform": "x",
        "handle": "user1",
        "shielded_address": "u1..."
      }
    },
    "user2": {
      "found": false
    },
    "user3": {
      "found": true,
      "creator": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "platform": "x",
        "handle": "user3",
        "shielded_address": "u1..."
      }
    }
  }
}
```

**Error (400 Bad Request)**:
```json
{
  "error": "Missing platform or handles array"
}
```

```json
{
  "error": "Maximum 100 handles per request"
}
```

**Error (500 Internal Server Error)**:
```json
{
  "error": "Database error"
}
```

#### Notes
- Maximum 100 handles per request
- Results keyed by original handle (preserves casing)
- Single database query for efficiency

---

### GET /api/creators

Get a paginated list of registered creators.

#### Request

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Results per page (default: 20, max: 100) |

#### Example Request

```bash
curl "https://tipz.cash/api/creators?page=1&limit=20"
```

#### Response

**Success**:
```json
{
  "creators": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "handle": "username",
      "shielded_address": "u1...",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### POST /api/link

Re-link a returning creator's extension by verifying their original tweet still exists.

#### Request

**Headers**:
```
Content-Type: application/json
```

**Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| handle | string | Yes | Creator's X handle |

#### Example Request

```bash
curl -X POST "https://tipz.cash/api/link" \
  -H "Content-Type: application/json" \
  -d '{"handle": "username"}'
```

#### Response

**Success**:
```json
{
  "success": true,
  "handle": "username",
  "verified": true
}
```

**Error (404 Not Found)**:
```json
{
  "error": "Creator not found"
}
```

**Error (400 Bad Request)**:
```json
{
  "error": "Original verification tweet not found or invalid. Please re-register.",
  "code": "TWEET_INVALID"
}
```

---

### GET /api/zec-price

Get real-time ZEC price from CoinGecko.

#### Request

No parameters required.

#### Example Request

```bash
curl "https://tipz.cash/api/zec-price"
```

#### Response

**Success**:
```json
{
  "price": 42.50,
  "currency": "USD",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### POST /api/swap/quote

Get a swap quote for converting any supported token to ZEC.

#### Request

**Headers**:
```
Content-Type: application/json
```

**Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| fromChain | number | Yes | Source chain ID (1=Ethereum, 137=Polygon) |
| fromToken | string | Yes | Token contract address (0x0... for native) |
| fromAmount | string | Yes | Amount to swap (in token units) |
| toChain | string | No | Destination chain (default: "ZEC") |
| toToken | string | No | Destination token (default: "ZEC") |
| destinationAddress | string | No | ZEC shielded address |

#### Example Request

```bash
curl -X POST "https://tipz.cash/api/swap/quote" \
  -H "Content-Type: application/json" \
  -d '{
    "fromChain": 1,
    "fromToken": "0x0000000000000000000000000000000000000000",
    "fromAmount": "0.01",
    "destinationAddress": "u1rl42v9qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"
  }'
```

#### Response

**Success**:
```json
{
  "toAmount": "0.75000000",
  "exchangeRate": "80.0",
  "fees": {
    "network": "0.5000",
    "protocol": "0.1600",
    "total": "0.6600"
  },
  "estimatedTime": 480,
  "route": ["ETH", "USDC", "ZEC"],
  "expiresAt": 1705316000000,
  "demo": true
}
```

**Notes**:
- Quotes use real prices from CoinGecko
- `demo: true` indicates execution will be simulated
- `demo: false` indicates real NEAR Intents execution
- Quote expires in 60 seconds

---

### POST /api/swap/execute

Execute a token swap after obtaining a quote.

#### Request

**Headers**:
```
Content-Type: application/json
```

**Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| fromChain | number | Yes | Source chain ID |
| fromToken | string | Yes | Token contract address |
| fromAmount | string | Yes | Amount to swap |
| toAmount | string | Yes | Expected ZEC amount (from quote) |
| destinationAddress | string | Yes | ZEC shielded address |
| senderAddress | string | Yes | Wallet address executing swap |
| signature | string | No | Transaction signature (production only) |

#### Response

**Success (Demo Mode)**:
```json
{
  "success": true,
  "txHash": "demo_tx_abc123...",
  "status": "completed",
  "demo": true,
  "message": "Demo swap executed - no real funds moved"
}
```

**Success (Production)**:
```json
{
  "success": true,
  "txHash": "0x...",
  "status": "pending",
  "demo": false,
  "intentId": "intent_xyz789"
}
```

---

### POST /api/intents/create

Create a NEAR Intent for cross-chain privacy routing.

#### Request

**Headers**:
```
Content-Type: application/json
```

**Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | string | Yes | ZEC amount to send |
| destinationAddress | string | Yes | ZEC unified address (u1...) |
| destinationChain | string | Yes | Must be "ZEC" |
| metadata | object | No | Optional metadata |
| metadata.sourceTxHash | string | No | Source transaction hash |
| metadata.sourceChain | number | No | Source chain ID |
| metadata.senderAddress | string | No | Sender's wallet address |

#### Example Request

```bash
curl -X POST "https://tipz.cash/api/intents/create" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "0.75",
    "destinationAddress": "u1rl42v9qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
    "destinationChain": "ZEC",
    "metadata": {
      "sourceTxHash": "0x...",
      "sourceChain": 1
    }
  }'
```

#### Response

**Success**:
```json
{
  "success": true,
  "intentId": "intent_1705316000_abc123",
  "status": "pending",
  "destinationChain": "ZEC",
  "estimatedCompletion": 1705316600000,
  "nearContract": "intents.testnet",
  "demo": true,
  "message": "Demo intent created - no real funds routed through NEAR"
}
```

**Validation Errors**:
```json
{
  "error": "Invalid ZEC shielded address. Must be a unified address starting with 'u1'."
}
```

```json
{
  "error": "Unsupported destination chain: BTC. Supported: ZEC"
}
```

---

### GET /api/intents/create

Query the status of a NEAR Intent.

#### Request

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| intentId | string | Yes | The intent ID to query |

#### Example Request

```bash
curl "https://tipz.cash/api/intents/create?intentId=intent_1705316000_abc123"
```

#### Response

**Success**:
```json
{
  "intentId": "intent_1705316000_abc123",
  "status": "completed",
  "demo": true,
  "message": "Demo status - not querying real NEAR chain"
}
```

**Production Response**:
```json
{
  "intentId": "intent_1705316000_abc123",
  "status": "processing",
  "solver": "solver.near",
  "demo": false
}
```

---

### GET /api/og/[handle]

Generate dynamic OG (Open Graph) images for creator tip pages.

#### Request

**URL Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| handle | string | Yes | Creator's handle |

#### Example Request

```bash
curl "https://tipz.cash/api/og/username"
```

#### Response

Returns a PNG image (1200x630) suitable for social media previews.

**Features**:
- Dynamic avatar based on handle
- Creator handle prominently displayed
- Privacy indicators (Private, Instant, 0% fees)
- Tip amount presets
- TIPZ branding

---

## Data Types

### Creator Object

```typescript
interface Creator {
  id: string          // UUID
  platform: string    // 'x' | 'substack'
  handle: string      // Original casing
  shielded_address: string  // Zcash shielded address
}
```

### Platform Values

| Value | Description |
|-------|-------------|
| `x` | X (Twitter) |
| `substack` | Substack |

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Human-readable error message"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 429 | Too Many Requests (rate limit exceeded) |
| 500 | Internal Server Error |
| 503 | Service Unavailable (health check failed) |

---

## Rate Limits

Rate limiting is implemented using an in-memory sliding window algorithm.

**Current Limits**:
| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /api/register | 10 requests | per hour |
| GET /api/creator | 100 requests | per minute |
| POST /api/creators/batch | 10 requests | per minute |

**Rate Limit Headers**:
All rate-limited endpoints return these headers:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1705320000
```

**Rate Limit Exceeded (429 Response)**:
```json
{
  "error": "Too many registration attempts. Please try again later.",
  "retryAfter": 3600
}
```

Additional header when rate limited:
```
Retry-After: 3600
```

**Note**: Current implementation uses in-memory storage, suitable for single-instance deployments. For multi-instance deployments, consider Redis/Upstash for distributed rate limiting

---

## CORS

All endpoints allow cross-origin requests from:
- Browser extensions
- Local development (localhost)

---

## Code Examples

### JavaScript (Fetch)

```javascript
// Single lookup
async function lookupCreator(platform, handle) {
  const response = await fetch(
    `https://tipz.app/api/creator?platform=${platform}&handle=${handle}`
  );
  return response.json();
}

// Batch lookup
async function batchLookup(platform, handles) {
  const response = await fetch('https://tipz.app/api/creators/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform, handles })
  });
  return response.json();
}

// Register
async function register(data) {
  const response = await fetch('https://tipz.app/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}
```

### TypeScript Types

```typescript
// Request types
interface CreatorLookupParams {
  platform: 'x' | 'substack';
  handle: string;
}

interface BatchLookupRequest {
  platform: 'x' | 'substack';
  handles: string[];
}

interface RegisterRequest {
  platform: 'x' | 'substack';
  handle: string;
  shielded_address: string;
}

// Response types
interface CreatorLookupResponse {
  found: boolean;
  creator?: {
    id: string;
    platform: string;
    handle: string;
    shielded_address: string;
  };
}

interface BatchLookupResponse {
  results: Record<string, CreatorLookupResponse>;
}

interface RegisterResponse {
  success?: boolean;
  message?: string;
  error?: string;
}
```

---

## Changelog

### v2.0.0 (Current)
- Added swap endpoints (`POST /api/swap/quote`, `POST /api/swap/execute`)
- Added NEAR Intents integration (`POST /api/intents/create`, `GET /api/intents/create`)
- Added creator re-linking (`POST /api/link`)
- Added paginated creator directory (`GET /api/creators`)
- Added ZEC price endpoint (`GET /api/zec-price`)
- Added dynamic OG images (`GET /api/og/[handle]`)
- Only unified addresses (u1...) accepted
- Demo mode for testing without real transactions
- Real-time price quotes from CoinGecko

### v1.1.0
- Added health check endpoint (`GET /api/health`)
- Implemented rate limiting on registration endpoint (10 req/hour per IP)
- Improved tweet URL validation with stricter format checking
- Added `verification_status` field to registration response
- Enhanced shielded address validation (proper Base58 character set)
- Added rate limit headers to all responses

### v1.0.0
- Initial API release
- Single and batch creator lookup
- Creator registration with OAuth verification

### Planned
- Creator analytics endpoint (`GET /api/creator/stats`)
- Transaction webhook notifications
- Recurring tip subscriptions
