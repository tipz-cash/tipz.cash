# TIPZ Documentation

Technical documentation for the TIPZ private micro-tipping platform.

## Directory Structure

```
docs/
├── engineering/              # Architecture, API reference, messaging spec
├── technical/                # NEAR Intents integration guide
├── operations/               # Support FAQ and troubleshooting
├── brand/                    # Logo philosophy and design principles
└── design-system.md          # Visual design tokens and component specs
```

## Quick Links

### Engineering
- [Architecture](./engineering/architecture.md) — System design and data flows
- [API Reference](./engineering/api-reference.md) — Endpoint documentation
- [Private Messaging Spec](./engineering/private-messaging-spec.md) — E2E encryption technical spec

### Technical
- [NEAR Intents Integration](./technical/near-intents-integration.md) — Cross-chain swap implementation

### Operations
- [Support](./operations/support.md) — FAQ and troubleshooting

### Design
- [Design System](./design-system.md) — Colors, typography, component patterns
- [Logo Philosophy](./brand/logo-philosophy.md) — Brand design principles

## Product Overview

**TIPZ** is a private micro-tipping platform powered by Zcash shielded addresses and NEAR Intents for cross-chain swaps.

**Core Value Proposition**: Private tips. Any asset. Zero trace.

**Tech Stack**:
- Web App: Next.js 16, Supabase, TypeScript
- Payments: NEAR Intents (cross-chain swaps to shielded ZEC)
- Web3: ethers.js (EVM), @solana/web3.js (Solana), Wagmi
