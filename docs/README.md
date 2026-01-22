# TIPZ Documentation

Welcome to the TIPZ documentation hub. This directory contains all planning, strategy, and technical documentation for the TIPZ private micro-tipping platform.

## Directory Structure

```
docs/
├── design/           # Brand, components, UX flows
├── marketing/        # Messaging, content, assets
├── gtm/              # Go-to-market, partnerships, launch
├── engineering/      # Architecture, API, roadmap
└── operations/       # Deployment, monitoring, support
```

## Quick Links

### Design
- [Brand Guidelines](./design/brand-guidelines.md) - Colors, typography, logo usage
- [Component Library](./design/component-library.md) - UI component specs
- [UX Flows](./design/ux-flows.md) - User journey maps

### Marketing
- [Messaging](./marketing/messaging.md) - Value props, taglines, copy
- [Content Calendar](./marketing/content-calendar.md) - Social/blog schedule
- [Assets](./marketing/assets.md) - Graphics, videos, demos

### Go-to-Market
- [Strategy](./gtm/strategy.md) - Go-to-market plan
- [KOL Outreach](./gtm/kol-outreach.md) - Influencer relationships
- [Partnerships](./gtm/partnerships.md) - Ecosystem integrations
- [Launch Checklist](./gtm/launch-checklist.md) - Pre-launch tasks

### Engineering
- [Architecture](./engineering/architecture.md) - System design
- [API Reference](./engineering/api-reference.md) - Endpoint documentation
- [Roadmap](./engineering/roadmap.md) - Feature priorities

### Operations
- [Runbook](./operations/runbook.md) - Deployment, monitoring
- [Support](./operations/support.md) - FAQ, troubleshooting

## Product Overview

**TIPZ** is a private micro-tipping platform powered by Zcash shielded addresses and NEAR Intents for cross-chain swaps.

**Core Value Proposition**: Private tips. Any asset. Zero trace.

**Target Audience**: Crypto-native creators on X/Twitter and Substack

**Tech Stack**:
- Web App: Next.js 16, Supabase
- Extension: Plasmo, Chrome MV3
- Payments: SwapKit SDK, NEAR Intents, Zcash shielded

## Contributing

Each workstream has its own directory. When making changes:
- Design decisions go in `/docs/design/`
- Copy and messaging go in `/docs/marketing/`
- Commit messages should prefix with workstream: `[design]`, `[marketing]`, `[gtm]`, `[ext]`, `[api]`
