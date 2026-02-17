# CLAUDE.md — TIPZ Web

## Build & Test

```bash
npm run dev          # Next.js dev server
npm run build        # Production build (must pass before merge)
npm run test         # Vitest — all tests must pass
npm run test:watch   # Watch mode
```

## Architecture Rules

### One code path: production
No demo modes, feature flags, or `if (demoMode)` branches. Every endpoint does one thing — the real thing. If something isn't ready, don't ship it behind a flag.

### Identity comes from auth, never from user input
Never trust `creatorId`, `handle`, or identity fields from request bodies or query params for privileged operations. Derive identity from the session:

```ts
const session = await getSessionFromRequest(request)
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
// Use session.handle and session.creatorId — not request params
```

### Sensitive data is encrypted
The `tipz` table has an encrypted `data` column (RSA + AES-GCM). Amounts (`amount_zec`, `amount_usd`) are plaintext for aggregation. Never store tipper wallet addresses, memos, swap details, or transaction hashes in plaintext columns.

### Auth-gated endpoints
Any endpoint that returns a creator's tip data (`/api/tips/received`, `/api/tips/stats`) requires a valid session. Validate that the requested handle matches `session.handle`.

### Public endpoints
These are intentionally public: `/api/activity`, `/api/creators`, `/api/leaderboard`, `/api/zec-price`, `/api/health`, `/api/og/[handle]`.

## Code Quality Rules

### No copy-paste duplication
If two functions share >50% of their logic, extract the shared part. The `useTipping.ts` hook uses `calculateTokenAmount()`, `handlePostExecution()`, and `executeAndFinalize()` as shared helpers between `getQuote`/`confirmTip`/`sendTip`. Never duplicate the DB logging + polling + localStorage persistence block.

### Select what you need from Supabase
Always include all fields you'll use in `.select()` queries. Missing fields silently return `null` and cause subtle UI bugs (tips rendering as `[Encrypted]` when amounts exist in DB).

### Error handling is specific
Wallet errors get classified into user-friendly messages (`classifyTxError()`). API errors return structured JSON, not stack traces.

## Key Files

- `lib/session.ts` — JWT session (HS256, httpOnly cookie, 7-day TTL)
- `lib/supabase.ts` — Supabase client + helper queries
- `lib/wallet.ts` — Wallet connection, swap quotes, tip execution
- `lib/near-intents.ts` — NEAR Intents cross-chain swap API
- `hooks/useTipping.ts` — Tipping state machine (quote → sign → deliver → poll)
- `app/api/swap/` — Quote, execute, status endpoints
- `app/api/tips/` — Tips data endpoints (auth-gated)
- `app/api/auth/` — Twitter OAuth 2.0 PKCE + session management

## Testing

Tests live in `__tests__/`. When adding auth to endpoints, mock `@/lib/session`:

```ts
const mockGetSession = vi.fn().mockResolvedValue(null)
vi.mock("@/lib/session", () => ({
  getSessionFromRequest: (...args: unknown[]) => mockGetSession(...args),
}))
```

Test both unauthenticated (returns empty/401) and authenticated (returns data) paths.
