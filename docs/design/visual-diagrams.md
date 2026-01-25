# TIPZ Visual Diagrams

Visual flow diagrams for pitch decks, partner outreach, and documentation.

---

## 1. Tipper Journey Diagram

### Linear Flow (Horizontal)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│             │    │             │    │             │    │             │    │             │    │             │
│  SEE TWEET  │───▶│ CLICK [TIP] │───▶│SELECT AMOUNT│───▶│CONNECT      │───▶│  CONFIRM    │───▶│   DONE!     │
│             │    │             │    │             │    │WALLET       │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                  │                  │                  │                  │                  │
   Browse X        Tip button          $1 / $5 / $10       MetaMask or       Review &          Tip sent
   normally        on tweets            presets          WalletConnect       sign tx           privately
```

### Detailed Vertical Flow

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                           TIPPER USER JOURNEY                                 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  ┌─────────────────────────────────────────────────────────────────────┐     ║
║  │  1. BROWSE X (TWITTER)                                               │     ║
║  │     • User has TIPZ Chrome extension installed                       │     ║
║  │     • Browses timeline normally                                      │     ║
║  │     • Extension scans tweets for registered creators                 │     ║
║  └─────────────────────────────────────────────────────────────────────┘     ║
║                                    │                                          ║
║                                    ▼                                          ║
║  ┌─────────────────────────────────────────────────────────────────────┐     ║
║  │  2. SEE [TIP] BUTTON                                                │     ║
║  │     • Gold [TIP] button appears on registered creators' tweets      │     ║
║  │     • Muted button shows "Not on TIPZ" for unregistered             │     ║
║  └─────────────────────────────────────────────────────────────────────┘     ║
║                                    │                                          ║
║                                    ▼                                          ║
║  ┌─────────────────────────────────────────────────────────────────────┐     ║
║  │  3. SELECT AMOUNT                                                    │     ║
║  │     • Click [TIP] → Modal opens                                     │     ║
║  │     • Preset: $1 / $5 / $10 / $25                                   │     ║
║  │     • Custom amount available                                        │     ║
║  └─────────────────────────────────────────────────────────────────────┘     ║
║                                    │                                          ║
║                                    ▼                                          ║
║  ┌─────────────────────────────────────────────────────────────────────┐     ║
║  │  4. CONNECT WALLET (if needed)                                       │     ║
║  │     • MetaMask, Rabby, WalletConnect, Coinbase                      │     ║
║  │     • One-click connection                                           │     ║
║  │     • No signup or account required                                  │     ║
║  └─────────────────────────────────────────────────────────────────────┘     ║
║                                    │                                          ║
║                                    ▼                                          ║
║  ┌─────────────────────────────────────────────────────────────────────┐     ║
║  │  5. CONFIRM & SIGN                                                   │     ║
║  │     • Review: Recipient, Amount, Token                              │     ║
║  │     • Sign transaction in wallet                                     │     ║
║  │     • Progress indicator: Swap → Route → Confirm                    │     ║
║  └─────────────────────────────────────────────────────────────────────┘     ║
║                                    │                                          ║
║                                    ▼                                          ║
║  ┌─────────────────────────────────────────────────────────────────────┐     ║
║  │  6. SUCCESS                                                          │     ║
║  │     ✓ Tip sent privately                                            │     ║
║  │     • Creator receives ZEC at shielded address                      │     ║
║  │     • No public blockchain record of sender/amount                  │     ║
║  └─────────────────────────────────────────────────────────────────────┘     ║
║                                                                               ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. Creator Journey Diagram

### Linear Flow (Horizontal)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│             │    │             │    │             │    │             │    │             │
│ VISIT TIPZ  │───▶│  REGISTER   │───▶│  VERIFY     │───▶│  SHARE      │───▶│ RECEIVE     │
│             │    │             │    │  (TWEET)    │    │  LINK       │    │ TIPS        │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                  │                  │                  │                  │
   tipz.cash        Paste ZEC         Tweet your          Tip button       Tips arrive
                    address           address            appears on X       shielded
```

### Detailed Vertical Flow

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                          CREATOR REGISTRATION JOURNEY                         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  ┌─────────────────────────────────────────────────────────────────────┐     ║
║  │  1. VISIT tipz.cash                                                  │     ║
║  │     • Learn about private tipping                                    │     ║
║  │     • See how it works, features, comparison                        │     ║
║  │     • Click "I'm a Creator" or scroll to register                   │     ║
║  └─────────────────────────────────────────────────────────────────────┘     ║
║                                    │                                          ║
║                                    ▼                                          ║
║  ┌─────────────────────────────────────────────────────────────────────┐     ║
║  │  2. GET A ZCASH WALLET (if needed)                                   │     ║
║  │     • Download Zashi (recommended) or other ZEC wallet              │     ║
║  │     • Create shielded address (starts with zs1...)                  │     ║
║  │     • Copy address to clipboard                                      │     ║
║  └─────────────────────────────────────────────────────────────────────┘     ║
║                                    │                                          ║
║                                    ▼                                          ║
║  ┌─────────────────────────────────────────────────────────────────────┐     ║
║  │  3. FILL REGISTRATION FORM                                           │     ║
║  │     • Enter X handle (e.g., @yourhandle)                            │     ║
║  │     • Paste shielded ZEC address                                    │     ║
║  └─────────────────────────────────────────────────────────────────────┘     ║
║                                    │                                          ║
║                                    ▼                                          ║
║  ┌─────────────────────────────────────────────────────────────────────┐     ║
║  │  4. TWEET VERIFICATION                                               │     ║
║  │     • Post verification tweet with your ZEC address                 │     ║
║  │     • "I'm registering for @tipz_cash to receive private tips..."   │     ║
║  │     • Copy tweet URL, paste into form                               │     ║
║  └─────────────────────────────────────────────────────────────────────┘     ║
║                                    │                                          ║
║                                    ▼                                          ║
║  ┌─────────────────────────────────────────────────────────────────────┐     ║
║  │  5. REGISTRATION COMPLETE                                            │     ║
║  │     ✓ You're now tippable!                                          │     ║
║  │     • [TIP] button appears on all your tweets                       │     ║
║  │     • Anyone with TIPZ extension can tip you                        │     ║
║  │     • Tips arrive at your shielded address                          │     ║
║  └─────────────────────────────────────────────────────────────────────┘     ║
║                                                                               ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 3. Technical Architecture Diagram

### System Overview

```
╔══════════════════════════════════════════════════════════════════════════════════════════╗
║                                TIPZ TECHNICAL ARCHITECTURE                                ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                           ║
║    ┌─────────────────┐                                                                    ║
║    │   TIPPER        │                                                                    ║
║    │   (User Wallet) │                                                                    ║
║    │   ETH/USDC/SOL  │                                                                    ║
║    └────────┬────────┘                                                                    ║
║             │                                                                             ║
║             ▼                                                                             ║
║    ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐          ║
║    │                 │         │                 │         │                 │          ║
║    │  TIPZ CHROME    │────────▶│   TIPZ API      │────────▶│   SWAP          │          ║
║    │  EXTENSION      │         │   (Next.js)     │         │   AGGREGATOR    │          ║
║    │                 │         │                 │         │                 │          ║
║    └─────────────────┘         └────────┬────────┘         └────────┬────────┘          ║
║                                         │                           │                    ║
║                                         │                           │                    ║
║                                         ▼                           ▼                    ║
║                                ┌─────────────────┐         ┌─────────────────┐          ║
║                                │                 │         │                 │          ║
║                                │   SUPABASE      │         │   NEAR INTENTS  │          ║
║                                │   (Database)    │         │   (Routing)     │          ║
║                                │                 │         │                 │          ║
║                                │  • Creators     │         │  • Cross-chain  │          ║
║                                │  • Handles      │         │  • Swap exec    │          ║
║                                │  • Addresses    │         │  • ZEC output   │          ║
║                                │                 │         │                 │          ║
║                                └─────────────────┘         └────────┬────────┘          ║
║                                                                      │                   ║
║                                                                      ▼                   ║
║                                                             ┌─────────────────┐          ║
║                                                             │                 │          ║
║                                                             │   ZCASH         │          ║
║                                                             │   MAINNET       │          ║
║                                                             │                 │          ║
║                                                             │   Shielded      │          ║
║                                                             │   Transaction   │          ║
║                                                             │   (zk-SNARKs)   │          ║
║                                                             │                 │          ║
║                                                             └────────┬────────┘          ║
║                                                                      │                   ║
║                                                                      ▼                   ║
║                                                             ┌─────────────────┐          ║
║                                                             │   CREATOR       │          ║
║                                                             │   (ZEC Wallet)  │          ║
║                                                             │   zs1...        │          ║
║                                                             │                 │          ║
║                                                             │   ✓ PRIVATE     │          ║
║                                                             └─────────────────┘          ║
║                                                                                           ║
╚══════════════════════════════════════════════════════════════════════════════════════════╝
```

### Data Flow (Simplified)

```
┌────────┐      ┌────────┐      ┌────────┐      ┌────────┐      ┌────────┐
│  ETH   │ ──▶  │  SWAP  │ ──▶  │  NEAR  │ ──▶  │  ZEC   │ ──▶  │  ZASHI │
│ WALLET │      │  API   │      │INTENTS │      │ NETWORK│      │ WALLET │
└────────┘      └────────┘      └────────┘      └────────┘      └────────┘
                                                      │
                                              ┌───────▼───────┐
                                              │   SHIELDED    │
                                              │  TRANSACTION  │
                                              │   (Private)   │
                                              └───────────────┘
```

---

## 4. Comparison Visual

### TIPZ vs Traditional Tipping

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              TRADITIONAL CRYPTO TIPS                                     │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│   SENDER                                     RECEIVER                                    │
│   ┌────────┐                                ┌────────┐                                  │
│   │ 0x7a2f │  ─────── $50 USDC ───────────▶ │ 0x9b1c │                                  │
│   │ ...4e3d│                                │ ...8f2a│                                  │
│   └────────┘                                └────────┘                                  │
│        │                                         │                                       │
│        │                                         │                                       │
│        ▼                                         ▼                                       │
│   ┌──────────────────────────────────────────────────────────────────┐                  │
│   │  PUBLIC BLOCKCHAIN RECORD                                         │                  │
│   │                                                                   │                  │
│   │  From:    0x7a2f8c3d...4e3d                                      │                  │
│   │  To:      0x9b1c6a7b...8f2a                                      │                  │
│   │  Amount:  50.00 USDC                                             │                  │
│   │  Time:    2024-01-15 14:32:01 UTC                                │                  │
│   │  Block:   18,847,234                                             │                  │
│   │                                                                   │                  │
│   │  ⚠️ VISIBLE TO EVERYONE FOREVER                                  │                  │
│   └──────────────────────────────────────────────────────────────────┘                  │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    TIPZ PRIVATE TIPS                                     │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│   TIPPER                                     CREATOR                                     │
│   ┌────────┐                                ┌────────┐                                  │
│   │  ANY   │  ─────── $50 (any token) ────▶ │  ZEC   │                                  │
│   │ WALLET │          via TIPZ              │ SHIELDED│                                 │
│   └────────┘                                └────────┘                                  │
│        │                                         │                                       │
│        │                                         │                                       │
│        ▼                                         ▼                                       │
│   ┌──────────────────────────────────────────────────────────────────┐                  │
│   │  ZCASH SHIELDED RECORD                                            │                  │
│   │                                                                   │                  │
│   │  From:    [ENCRYPTED]                                            │                  │
│   │  To:      [ENCRYPTED]                                            │                  │
│   │  Amount:  [ENCRYPTED]                                            │                  │
│   │  Time:    [ENCRYPTED]                                            │                  │
│   │                                                                   │                  │
│   │  ✅ ONLY SENDER AND RECEIVER KNOW THE DETAILS                    │                  │
│   └──────────────────────────────────────────────────────────────────┘                  │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Pitch Deck Slide Outlines

### Slide 1: Problem

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                    THE PROBLEM                                   │
│                                                                  │
│     Every crypto tip is PUBLIC                                   │
│                                                                  │
│     • Your wallet exposed                                        │
│     • Their income visible                                       │
│     • Amount & time tracked                                      │
│     • Indexed FOREVER                                            │
│                                                                  │
│     ──────────────────────────────────                          │
│                                                                  │
│     "This isn't tipping. It's surveillance."                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Slide 2: Solution

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                    [TIPZ]                                        │
│                                                                  │
│     Private tips. Any asset. Zero trace.                        │
│                                                                  │
│     ──────────────────────────────────                          │
│                                                                  │
│     Zcash shielded addresses +                                  │
│     Any-token swaps via NEAR Intents                            │
│                                                                  │
│     ┌─────────┐    ┌─────────┐    ┌─────────┐                   │
│     │   ETH   │ ─▶ │  SWAP   │ ─▶ │  ZEC    │                   │
│     │  USDC   │    │  ENGINE │    │SHIELDED │                   │
│     │   SOL   │    │         │    │         │                   │
│     └─────────┘    └─────────┘    └─────────┘                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Slide 3: How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                    HOW IT WORKS                                  │
│                                                                  │
│     FOR CREATORS                     FOR TIPPERS                │
│     ────────────                     ──────────                 │
│                                                                  │
│     01 Get Zashi wallet              01 Install extension       │
│        (shielded address)               (Chrome)                │
│                                                                  │
│     02 Register at                   02 Browse X normally       │
│        tipz.cash                        (see [TIP] buttons)     │
│                                                                  │
│     03 Receive tips                  03 Click, pick amount,     │
│        privately                        confirm. Done.          │
│                                                                  │
│                                                                  │
│           ⏱️ Setup: 2 minutes | 💰 Fee: 0%                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Slide 4: Why It Matters

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                    WHY IT MATTERS                                │
│                                                                  │
│     FOR CREATORS                     FOR TIPPERS                │
│     ────────────                     ──────────                 │
│                                                                  │
│     • Competitors can't              • Support without          │
│       track income                     surveillance             │
│                                                                  │
│     • No doxxing from                • No wallet profiling      │
│       public balances                                           │
│                                                                  │
│     • Zero platform fees             • Use any token you have   │
│       (keep 100%)                                               │
│                                                                  │
│     • Self-custody                   • No account required      │
│       (your keys only)                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Slide 5: Tech Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                    TECH STACK                                    │
│                                                                  │
│     ┌───────────────┐  ┌───────────────┐  ┌───────────────┐    │
│     │               │  │               │  │               │    │
│     │    ZCASH      │  │  NEAR INTENTS │  │  CHROME       │    │
│     │               │  │               │  │  EXTENSION    │    │
│     │  zk-SNARKs    │  │  Cross-chain  │  │               │    │
│     │  Shielded     │  │  Swaps        │  │  X.com        │    │
│     │  Addresses    │  │  Routing      │  │  Integration  │    │
│     │               │  │               │  │               │    │
│     └───────────────┘  └───────────────┘  └───────────────┘    │
│                                                                  │
│     ──────────────────────────────────                          │
│                                                                  │
│     • MIT Licensed (Open Source)                                │
│     • Non-custodial (Self-custody)                              │
│     • Privacy by default                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Slide 6: Comparison Table

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                    VS ALTERNATIVES                               │
│                                                                  │
│     ┌──────────────┬──────┬────────┬─────────┬──────────┐       │
│     │              │ TIPZ │ PayPal │  Ko-fi  │ ETH Tips │       │
│     ├──────────────┼──────┼────────┼─────────┼──────────┤       │
│     │ Platform Fee │  0%  │ 2.9%+  │   5%    │    0%    │       │
│     ├──────────────┼──────┼────────┼─────────┼──────────┤       │
│     │ Privacy      │  ✅  │   ❌   │   ❌    │    ❌    │       │
│     ├──────────────┼──────┼────────┼─────────┼──────────┤       │
│     │ Self-Custody │  ✅  │   ❌   │   ❌    │    ✅    │       │
│     ├──────────────┼──────┼────────┼─────────┼──────────┤       │
│     │ No KYC       │  ✅  │   ❌   │   ❌    │    ✅    │       │
│     ├──────────────┼──────┼────────┼─────────┼──────────┤       │
│     │ Any Token    │  ✅  │   ❌   │   ❌    │    ❌    │       │
│     └──────────────┴──────┴────────┴─────────┴──────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Export Notes

### For Figma/Design Tools

These ASCII diagrams can be converted to visual assets by:

1. **Color Palette**
   - Background: #0A0A0A
   - Surface: #1A1A1A
   - Primary (Amber): #F5A623
   - Success (Green): #00FF00
   - Text: #E0E0E0
   - Muted: #888888
   - Border: #333333

2. **Typography**
   - Font: JetBrains Mono
   - Headers: 16-24px, weight 600
   - Body: 14px, weight 400
   - Labels: 11-12px, uppercase, weight 500

3. **Style**
   - Sharp corners (border-radius: 0 or 4px max)
   - 1px borders
   - Terminal/Bloomberg aesthetic
   - Bracket notation for features: [], {}, ()

### For SVG Export

Each diagram can be traced as:
- Rectangles with 1px stroke
- Arrow lines with arrowheads
- Monospace text elements
- Consistent 24px padding

---

## 7. Infographic Ideas

### User Flow Infographic

```
         ┌──────────────────────────────────────────────────────────┐
         │                                                          │
         │        HOW TIPZ WORKS IN 30 SECONDS                     │
         │                                                          │
         └──────────────────────────────────────────────────────────┘

              TIPPER                           CREATOR
         ┌──────────────┐                 ┌──────────────┐
         │    👤        │                 │    👤        │
         │  Has ETH     │                 │  Wants tips  │
         │  or USDC     │                 │  privately   │
         └──────┬───────┘                 └──────┬───────┘
                │                                │
                ▼                                ▼
         ┌──────────────┐                 ┌──────────────┐
         │  [TIP] $5    │                 │  Register    │
         │  on X.com    │                 │  at tipz.cash│
         └──────┬───────┘                 └──────┬───────┘
                │                                │
                ▼                                ▼
         ┌──────────────┐                 ┌──────────────┐
         │  Swap to ZEC │                 │  Get ZEC     │
         │  (automatic) │                 │  shielded    │
         └──────┬───────┘                 └──────┬───────┘
                │                                │
                └────────────┬───────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │                │
                    │  ✅ PRIVATE    │
                    │     TIP SENT   │
                    │                │
                    │  No trace.     │
                    │  No tracking.  │
                    │                │
                    └────────────────┘
```

---

## Usage

These diagrams are ready for:
- Pitch decks (convert to slides)
- Partner outreach documents
- Documentation/README files
- Social media infographics (convert to images)
- Video storyboards (scene references)
