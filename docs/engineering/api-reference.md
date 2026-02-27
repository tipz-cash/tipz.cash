# TIPZ API Reference

Complete documentation for the TIPZ API.

---

## Base URL

**Production**: `https://tipz.cash`
**Development**: `http://localhost:3000`

---

## Authentication

Most endpoints are public. Auth-gated endpoints require a valid JWT session cookie (`tipz_session`) obtained via Twitter OAuth 2.0 PKCE login.

---

## Endpoints

### GET /api/health

Health check endpoint.

```bash
curl "https://tipz.cash/api/health"
```

---

### GET /api/creator

Look up a single creator by platform and handle.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| platform | string | Yes | Platform identifier: `x` |
| handle | string | Yes | Creator's handle (with or without @) |

```bash
curl "https://tipz.cash/api/creator?platform=x&handle=username"
```

**Response**:
```json
{
  "found": true,
  "creator": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "platform": "x",
    "handle": "username",
    "shielded_address": "u1..."
  }
}
```

- Handle lookup is case-insensitive
- Leading `@` is stripped automatically

---

### GET /api/creators

Paginated list of registered creators.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Results per page (default: 20, max: 100) |

```bash
curl "https://tipz.cash/api/creators?page=1&limit=20"
```

---

### POST /api/register

Register a new creator. Requires active OAuth session.

**Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| platform | string | Yes | `x` |
| handle | string | Yes | Creator's handle |
| shielded_address | string | Yes | Zcash unified address (u1..., 141+ chars) |

**Validation**:
- Address must start with `u1` and be 141+ characters (Zcash unified address)
- Identity verified via Twitter OAuth session

---

### GET /api/link

Re-link a returning creator by uploading their public key.

---

### GET /api/zec-price

Real-time ZEC price from CoinGecko.

```bash
curl "https://tipz.cash/api/zec-price"
```

```json
{
  "price": 42.50,
  "currency": "USD",
  "timestamp": "2025-02-15T10:30:00.000Z"
}
```

---

### POST /api/swap/quote

Get a swap quote for converting a supported token to ZEC via NEAR Intents.

**Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| fromChain | number/string | Yes | Source chain ID or name |
| fromToken | string | Yes | Token contract address or symbol |
| fromAmount | string | Yes | Amount to swap (in token units) |
| destinationAddress | string | Yes | ZEC unified address (u1...) |

```bash
curl -X POST "https://tipz.cash/api/swap/quote" \
  -H "Content-Type: application/json" \
  -d '{
    "fromChain": 1,
    "fromToken": "ETH",
    "fromAmount": "0.01",
    "destinationAddress": "u1..."
  }'
```

Returns quote with deposit address, exchange rate, fees, and expiration.

---

### POST /api/swap/execute

Execute a swap after obtaining a quote. Records the tip in the database.

---

### GET /api/swap/status

Poll swap transaction status by deposit address.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| address | string | Yes | NEAR Intents deposit address |

---

### GET /api/tips/received

Creator's received tips (encrypted data). Requires auth session.

### GET /api/tips/stats

Aggregated tip statistics for a creator.

### GET /api/tips/latest

Most recent tips.

---

### GET /api/activity

Recent tip activity across the platform.

### GET /api/leaderboard

Creator rankings by tip count.

---

### GET /api/og/[handle]

Generate dynamic OG (Open Graph) image for a creator's tip page. Returns a PNG image (1200x630).

---

### Auth Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auth/twitter` | OAuth 2.0 PKCE login redirect |
| GET | `/api/auth/twitter/callback` | OAuth callback handler |
| GET | `/api/auth/me` | Check current session |
| POST | `/api/auth/logout` | End session (clears cookie) |

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Human-readable error message"
}
```

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid session) |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
