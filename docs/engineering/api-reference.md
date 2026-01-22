# TIPZ API Reference

Complete documentation for the TIPZ API.

---

## Base URL

**Production**: `https://tipz.app`
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
    "shielded_address": "zs1..."
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
| shielded_address | string | Yes | Zcash shielded address (zs...) |
| tweet_url | string | Yes | Verification tweet URL |

#### Example Request

```bash
curl -X POST "https://tipz.app/api/register" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "x",
    "handle": "myhandle",
    "shielded_address": "zs1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqp",
    "tweet_url": "https://x.com/myhandle/status/1234567890"
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
  "error": "Invalid Zcash shielded address. Must start with 'zs' and be 78 characters"
}
```

```json
{
  "error": "Invalid tweet URL format"
}
```

```json
{
  "error": "Tweet must be from the handle being registered"
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
- Must match regex: `^zs[a-zA-Z0-9]{76}$`
- Starts with `zs`
- Exactly 78 characters total

**Tweet URL**:
- Must match pattern: `https://(x|twitter).com/{handle}/status/{id}`
- Handle in URL must match registered handle (case-insensitive)

#### Notes
- Uses upsert logic: same platform + handle updates existing record
- Tweet URL verification is currently URL-pattern only (TODO: actual API verification)

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
        "shielded_address": "zs1..."
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
        "shielded_address": "zs1..."
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
  tweet_url: string;
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

### v1.1.0 (Current)
- Added health check endpoint (`GET /api/health`)
- Implemented rate limiting on registration endpoint (10 req/hour per IP)
- Improved tweet URL validation with stricter format checking
- Added `verification_status` field to registration response
- Enhanced shielded address validation (proper Base58 character set)
- Added rate limit headers to all responses

### v1.0.0
- Initial API release
- Single and batch creator lookup
- Creator registration with tweet verification (URL only)

### Planned
- Twitter API integration for proper tweet verification
- Transaction logging endpoint (`POST /api/transactions/log`)
- Creator statistics endpoint (`GET /api/creator/stats`)
- Rate limiting on lookup endpoints
- Webhook for transaction status updates
