# TIPZ Final Design: Terminal Edition

> The primary design direction for TIPZ, optimized for developers and power users.
> This direction aligns with naly.dev's brand aesthetic.

---

## Design Philosophy

**Core Principles:**
1. Information density over decoration
2. Transparency in every interaction
3. Technical credibility through restraint
4. Monospace creates uniformity and trust
5. Amber warmth against black void

---

## Complete Color System

### Primary Palette

| Token | Name | Hex | RGB | Usage |
|-------|------|-----|-----|-------|
| `--color-bg` | True Black | `#000000` | 0, 0, 0 | Primary background |
| `--color-fg` | Phosphor White | `#E8E8E8` | 232, 232, 232 | Primary text |
| `--color-accent` | Terminal Amber | `#FFB000` | 255, 176, 0 | Primary accent |
| `--color-success` | Matrix Green | `#00FF41` | 0, 255, 65 | Success states |
| `--color-error` | Signal Red | `#FF3333` | 255, 51, 51 | Error states |

### Extended Palette

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--color-fg-muted` | Dim Gray | `#6B6B6B` | Secondary text |
| `--color-fg-subtle` | Deep Gray | `#4A4A4A` | Tertiary text, borders |
| `--color-surface` | Near Black | `#0A0A0A` | Elevated surfaces |
| `--color-surface-hover` | Charcoal | `#1A1A1A` | Hover states |
| `--color-accent-dim` | Amber Muted | `#8B6000` | Disabled accent |
| `--color-link` | Terminal Amber | `#FFB000` | Links (same as accent) |
| `--color-link-visited` | Amber Light | `#FFD966` | Visited links |

### Semantic Tokens

```css
:root {
  /* Backgrounds */
  --bg-primary: var(--color-bg);
  --bg-secondary: var(--color-surface);
  --bg-elevated: var(--color-surface-hover);

  /* Text */
  --text-primary: var(--color-fg);
  --text-secondary: var(--color-fg-muted);
  --text-tertiary: var(--color-fg-subtle);

  /* Interactive */
  --interactive-default: var(--color-accent);
  --interactive-hover: var(--color-fg);
  --interactive-disabled: var(--color-accent-dim);

  /* States */
  --state-success: var(--color-success);
  --state-error: var(--color-error);
  --state-warning: var(--color-accent);
}
```

---

## Typography Scale

### Font Stack

```css
:root {
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', 'Consolas', monospace;
}
```

### Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `--text-hero` | 40px | 700 | 1.1 | -0.02em | Hero headlines |
| `--text-h1` | 32px | 700 | 1.2 | -0.01em | Page titles |
| `--text-h2` | 24px | 700 | 1.25 | 0 | Section headers |
| `--text-h3` | 18px | 600 | 1.3 | 0 | Subsections |
| `--text-body` | 14px | 400 | 1.6 | 0 | Body text |
| `--text-small` | 12px | 400 | 1.5 | 0 | Captions, help text |
| `--text-label` | 11px | 600 | 1.4 | 0.1em | Labels (uppercase) |
| `--text-code` | 13px | 400 | 1.5 | 0 | Code snippets |

### CSS Implementation

```css
.text-hero { font-size: 40px; font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; }
.text-h1 { font-size: 32px; font-weight: 700; line-height: 1.2; letter-spacing: -0.01em; }
.text-h2 { font-size: 24px; font-weight: 700; line-height: 1.25; }
.text-h3 { font-size: 18px; font-weight: 600; line-height: 1.3; }
.text-body { font-size: 14px; font-weight: 400; line-height: 1.6; }
.text-small { font-size: 12px; font-weight: 400; line-height: 1.5; }
.text-label { font-size: 11px; font-weight: 600; line-height: 1.4; letter-spacing: 0.1em; text-transform: uppercase; }
```

---

## Full Landing Page Copy

### Navigation
```
TIPZ                                              [Docs]  [GitHub]  [Install]
```

### Hero Section
```
> tipz init_

Private micro-payments for the open web.
Shielded Zcash transactions. Zero tracking.

┌──────────────────────────────────────────────────────────────┐
│ $ tipz tip @creator --amount 5.00                            │
│ > Resolving address...                                       │
│ > Creating shielded transaction...                           │
│ > Broadcasting to network...                                 │
│ ✓ Tip delivered privately                                    │
│                                                              │
│ txid: 8f3a7b2c...                                           │
│ amount: 0.0234 ZEC ($5.00)                                  │
│ privacy: shielded (z-addr → z-addr)                         │
└──────────────────────────────────────────────────────────────┘

[Install Extension]    [Read the Docs]
```

### How It Works Section
```
HOW IT WORKS
────────────────────────────────────────────────────────────────

01. INSTALL
   Add TIPZ to your browser. Connect your Zashi wallet.
   No account creation. No email. No tracking.

02. BROWSE
   Visit X, YouTube, or any supported platform.
   TIPZ detects creator addresses automatically.

03. TIP
   Click [tip] on any post. Choose amount.
   Your tip is shielded end-to-end.

04. DONE
   Creator receives ZEC privately.
   No one else knows. Not even us.
```

### Privacy Section
```
PRIVACY BY DESIGN
────────────────────────────────────────────────────────────────

TIPZ uses Zcash shielded transactions (Sapling protocol).

Your tips are:
  ✓ Encrypted end-to-end
  ✓ Unlinkable to your identity
  ✓ Invisible on the public blockchain
  ✓ Private even from TIPZ servers

We collect:
  ✗ No email addresses
  ✗ No wallet addresses
  ✗ No transaction history
  ✗ No analytics or tracking

VERIFICATION
All code is open source. Audit it yourself.
github.com/naly-dev/tipz
```

### Technical Specs Section
```
SPECIFICATIONS
────────────────────────────────────────────────────────────────

PROTOCOL        Zcash Sapling (shielded z-addresses)
WALLET          Zashi (via WalletConnect)
PLATFORMS       Chrome, Firefox, Brave
MINIMUM TIP     $0.01 (≈0.00005 ZEC)
NETWORK FEE     0.0001 ZEC (≈$0.02)
LATENCY         ~60 seconds (block confirmation)
LICENSE         MIT
```

### Stats Section
```
NETWORK STATS
────────────────────────────────────────────────────────────────

TIPS SENT          127,453
TOTAL VALUE        $892,104
UNIQUE TIPPERS     23,891
CREATORS TIPPED    8,234
UPTIME             99.97%
────────────────────────────────────────────────────────────────
```

### Footer
```
────────────────────────────────────────────────────────────────

TIPZ v0.1.0 • MIT License • Made by naly.dev

[GitHub]  [Docs]  [Privacy]  [Status]

No tracking. No analytics. No cookies.
────────────────────────────────────────────────────────────────
```

---

## Component Specifications

### Buttons

#### Primary Button
```css
.btn-primary {
  background: var(--color-accent);
  color: var(--color-bg);
  font: 600 12px/1 var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 12px 24px;
  border: 2px solid var(--color-accent);
  border-radius: 0;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary:hover {
  background: var(--color-bg);
  color: var(--color-accent);
}

.btn-primary:active {
  transform: translateY(1px);
}

.btn-primary:disabled {
  background: var(--color-fg-subtle);
  border-color: var(--color-fg-subtle);
  color: var(--color-fg-muted);
  cursor: not-allowed;
}
```

#### Secondary Button (Ghost)
```css
.btn-secondary {
  background: transparent;
  color: var(--color-accent);
  font: 600 12px/1 var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 12px 24px;
  border: 1px solid var(--color-accent);
  border-radius: 0;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-secondary:hover {
  background: var(--color-accent);
  color: var(--color-bg);
}
```

#### Tip Button (Inline on X/Twitter)
```css
.tip-button {
  background: var(--color-bg);
  color: var(--color-accent);
  font: 500 12px/1 var(--font-mono);
  padding: 4px 12px;
  border: 1px solid var(--color-accent);
  border-radius: 0;
  cursor: pointer;
  height: 24px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tip-button:hover {
  background: var(--color-accent);
  color: var(--color-bg);
}

.tip-button::before {
  content: '$';
}
```

### Cards

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-fg-subtle);
  padding: 16px;
}

.card-header {
  font: 600 11px/1.4 var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-fg-muted);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-fg-subtle);
}

.card-body {
  font: 400 14px/1.6 var(--font-mono);
  color: var(--color-fg);
}
```

### Inputs

```css
.input {
  background: var(--color-bg);
  color: var(--color-fg);
  font: 400 14px/1.5 var(--font-mono);
  padding: 12px;
  border: 1px solid var(--color-fg-subtle);
  border-radius: 0;
  width: 100%;
}

.input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.input::placeholder {
  color: var(--color-fg-subtle);
}

.input-label {
  font: 600 11px/1.4 var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-fg-muted);
  margin-bottom: 8px;
  display: block;
}
```

### Amount Presets

```css
.amount-presets {
  display: flex;
  gap: 8px;
}

.amount-preset {
  background: transparent;
  color: var(--color-fg-muted);
  font: 500 12px/1 var(--font-mono);
  padding: 8px 12px;
  border: 1px solid var(--color-fg-subtle);
  cursor: pointer;
  transition: all 0.15s ease;
}

.amount-preset:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.amount-preset.selected {
  background: var(--color-accent);
  color: var(--color-bg);
  border-color: var(--color-accent);
}
```

### Modal

```css
.modal-backdrop {
  background: rgba(0, 0, 0, 0.9);
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: var(--color-bg);
  border: 1px solid var(--color-accent);
  width: 100%;
  max-width: 360px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-fg-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font: 600 12px/1 var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-fg);
}

.modal-close {
  background: none;
  border: none;
  color: var(--color-fg-muted);
  font: 400 16px/1 var(--font-mono);
  cursor: pointer;
  padding: 4px 8px;
}

.modal-close:hover {
  color: var(--color-accent);
}

.modal-body {
  padding: 16px;
}

.modal-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--color-fg-subtle);
}
```

---

## Extension UI Details

### Popup (Main Extension View)

```
┌─────────────────────────────────────┐
│  TIPZ v0.1.0                   [×]  │
│  ─────────────────────────────────  │
│                                     │
│  WALLET                             │
│  ┌─────────────────────────────┐   │
│  │  ● Connected                │   │
│  │  z...8f3a (Zashi)           │   │
│  └─────────────────────────────┘   │
│                                     │
│  BALANCE                            │
│  ┌─────────────────────────────┐   │
│  │  12.4523 ZEC                │   │
│  │  ≈ $2,661.23                │   │
│  └─────────────────────────────┘   │
│                                     │
│  RECENT TIPS                        │
│  ─────────────────────────────────  │
│  01-15  @vitalik     $5.00   ✓     │
│  01-14  @balajis     $2.00   ✓     │
│  01-13  @naval       $10.00  ✓     │
│  ─────────────────────────────────  │
│                                     │
│  [Settings]            [Disconnect] │
│                                     │
│  ─────────────────────────────────  │
│  ● SHIELDED  •  NO TRACKING        │
└─────────────────────────────────────┘
```

**Dimensions:** 320px × 480px

### Tip Button (Injected into X/Twitter)

```
┌────────────┐
│  $ tip     │
└────────────┘
```

**Dimensions:** 52px × 24px
**Position:** After the existing action buttons (reply, retweet, like)

### Tip Modal

```
┌─────────────────────────────────────┐
│  TIP                           [×]  │
│  ─────────────────────────────────  │
│                                     │
│  TO                                 │
│  @username                          │
│  z1q2w3e4r5t6y7u8i9o0p...         │
│                                     │
│  AMOUNT                             │
│  ┌─────────────────────────────┐   │
│  │  $ 5.00_                    │   │
│  └─────────────────────────────┘   │
│  ≈ 0.0234 ZEC @ $213.67            │
│                                     │
│  PRESETS                            │
│  [$1] [$2] [$5] [$10] [Custom]     │
│                                     │
│  MEMO                               │
│  ┌─────────────────────────────┐   │
│  │  > _                        │   │
│  └─────────────────────────────┘   │
│  encrypted, max 512 chars          │
│                                     │
│  ─────────────────────────────────  │
│  PRIVACY     shielded (z → z)      │
│  FEE         0.0001 ZEC            │
│  ─────────────────────────────────  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │         [SEND TIP]          │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Dimensions:** 360px × auto (content-driven)

### Processing State

```
┌─────────────────────────────────────┐
│                                     │
│  > Creating shielded transaction... │
│  > Signing with Zashi...            │
│  > Broadcasting to network...       │
│                                     │
│  ████████████████░░░░░░░░ 67%      │
│                                     │
│  Waiting for confirmation...        │
│                                     │
└─────────────────────────────────────┘
```

### Success State

```
┌─────────────────────────────────────┐
│                                     │
│  ✓ TIP SENT                         │
│                                     │
│  AMOUNT      $5.00 (0.0234 ZEC)    │
│  TO          @username             │
│  TXID        8f3a7b2c...           │
│  TIME        14:32:07 UTC          │
│                                     │
│  ─────────────────────────────────  │
│  This transaction is shielded.     │
│  Only you and @username know.      │
│  ─────────────────────────────────  │
│                                     │
│  [View on Explorer]        [Done]   │
│                                     │
└─────────────────────────────────────┘
```

### Error State

```
┌─────────────────────────────────────┐
│                                     │
│  ✗ TRANSACTION FAILED               │
│                                     │
│  ERROR                              │
│  Insufficient balance for tip       │
│  and network fee.                   │
│                                     │
│  REQUIRED    0.0235 ZEC            │
│  AVAILABLE   0.0100 ZEC            │
│                                     │
│  [Try Again]              [Cancel]  │
│                                     │
└─────────────────────────────────────┘
```

---

## Micro-Interactions and Animations

### Principles
- Minimal animation (terminal aesthetic values immediacy)
- Functional motion only (no decorative animation)
- Linear timing functions (feels mechanical, intentional)

### Specific Animations

#### Typing Effect (Hero)
```css
.typing-effect {
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid var(--color-accent);
  animation: typing 2s steps(20) forwards, blink 0.8s step-end infinite;
}

@keyframes typing {
  from { width: 0; }
  to { width: 100%; }
}

@keyframes blink {
  50% { border-color: transparent; }
}
```

#### Progress Bar
```css
.progress-bar {
  height: 4px;
  background: var(--color-fg-subtle);
}

.progress-fill {
  height: 100%;
  background: var(--color-accent);
  transition: width 0.3s linear;
}
```

#### Button Hover
```css
.btn {
  transition: background 0.15s ease, color 0.15s ease;
}
```

#### Focus States
```css
.input:focus,
.btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

#### Success Checkmark
```css
.success-icon {
  color: var(--color-success);
  animation: appear 0.3s ease-out;
}

@keyframes appear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### No Animation Situations
- No hover animations on cards
- No entrance animations on modals (instant appear)
- No scroll-triggered animations
- No loading spinners (use progress text instead)

---

## Spacing System

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
}
```

---

## Accessibility

- Minimum contrast ratio: 4.5:1 (WCAG AA)
- Focus indicators on all interactive elements
- Keyboard navigation support
- Screen reader labels for icons
- Reduced motion support:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Implementation Notes

1. **Font Loading:** Load JetBrains Mono via Google Fonts with `display: swap`
2. **Dark Mode:** This design is dark-only; no light mode variant
3. **System Fonts Fallback:** Ensure graceful degradation to system monospace
4. **Border Box:** Use `box-sizing: border-box` globally
5. **No Custom Scrollbars:** Keep native scrollbar behavior
