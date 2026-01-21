# TIPZ Design Direction: Terminal

> Inspiration: naly.dev, Vercel, Linear
> Aesthetic: Monospace, dark, amber accents, data-dense

---

## 1. Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| **True Black** | `#000000` | Primary background |
| **Terminal Amber** | `#FFB000` | Primary accent, highlights |
| **Matrix Green** | `#00FF41` | Success states, active elements |
| **Phosphor White** | `#E8E8E8` | Primary text |
| **Dim Gray** | `#4A4A4A` | Secondary text, borders |

### Rationale
Classic terminal aesthetic modernized. The amber provides warmth against the black while the green signals "go" states. This palette screams competence and technical sophistication.

---

## 2. Typography

### Primary: JetBrains Mono
- Premium monospace throughout
- Highly legible at small sizes
- Weights: 400 (body), 500 (emphasis), 700 (headings)

### Secondary: JetBrains Mono (same font, different treatment)
- All caps for labels
- Reduced letter-spacing for headers
- Weight: 700

### Scale
```
Hero:     40px / 700
H1:       32px / 700
H2:       24px / 700
H3:       18px / 500
Body:     14px / 400
Caption:  12px / 400
Label:    11px / 500 / UPPERCASE / +0.1em tracking
```

---

## 3. Hero Section

### Copy
```
Headline:     > tipz init
Subheadline:  Private micro-payments for the open web.
              Shielded Zcash transactions. Zero tracking.
CTA:          [Install] [Docs]
Secondary:    v0.1.0 • MIT License • 100% open source
```

### Layout
```
┌──────────────────────────────────────────────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│                                                          │
│  TIPZ                                      [Docs] [GitHub]│
│  ────                                                    │
│                                                          │
│  > tipz init_                                            │
│                                                          │
│  Private micro-payments for the open web.                │
│  Shielded Zcash transactions. Zero tracking.             │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ $ tipz tip @vitalik --amount 5.00                │   │
│  │ > Resolving address...                           │   │
│  │ > Creating shielded transaction...               │   │
│  │ > Transaction sent: ████████████████             │   │
│  │ ✓ Tip delivered privately                        │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌────────────┐  ┌────────────┐                         │
│  │  Install   │  │   Docs     │                         │
│  └────────────┘  └────────────┘                         │
│                                                          │
│  v0.1.0 • MIT License • Open Source                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Tip Button Design (on X/Twitter)

### Appearance
- Minimal, utilitarian button
- Black background with amber border
- Monospace text
- No icons, just text: "[tip]"

### States
```
Default:    Black bg, amber border, amber text
Hover:      Amber bg, black text
Active:     Inverted colors, slight inset
Disabled:   Dim gray border and text
```

### Visual
```
┌──────────────────┐
│  [tip]           │  ← Black bg, amber border
└──────────────────┘

Size: 52px × 24px
Border: 1px solid #FFB000
Border-radius: 0px (sharp corners)
Font: JetBrains Mono 500, 12px
```

### Alternative: Command-style
```
┌──────────────────┐
│  $ tip           │
└──────────────────┘
```

---

## 5. Modal Design (Tip Flow)

### Structure
A terminal-inspired modal with command-line aesthetics. Dense information display, scannable structure.

```
┌─────────────────────────────────────────┐
│  TIPZ v0.1.0                       [×]  │
│  ─────────────────────────────────────  │
│                                         │
│  TO: @username                          │
│  STATUS: verified                       │
│  ─────────────────────────────────────  │
│                                         │
│  AMOUNT                                 │
│  ┌─────────────────────────────────┐   │
│  │ $ 5.00_                         │   │
│  └─────────────────────────────────┘   │
│  ≈ 0.0234 ZEC @ $213.67                 │
│                                         │
│  PRESETS                                │
│  [1] [2] [5] [10] [___]                 │
│                                         │
│  MEMO (encrypted)                       │
│  ┌─────────────────────────────────┐   │
│  │ > _                             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ─────────────────────────────────────  │
│  PRIVACY: shielded (z → z)              │
│  FEE: 0.0001 ZEC                        │
│  ─────────────────────────────────────  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         [SEND]                  │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Design Details
- Width: 360px max
- Border: 1px solid #FFB000
- Border-radius: 0px (sharp)
- Background: `#000000`
- Header with version number
- Section dividers using `────`
- Labels in ALL CAPS
- Real-time ZEC conversion display
- Fee transparency
- Send button: Amber bg, black text

### Processing State
```
┌─────────────────────────────────────────┐
│                                         │
│  > Creating shielded transaction...     │
│  > Signing with Zashi...                │
│  > Broadcasting to network...           │
│  ████████████████░░░░░░░░░░░░░░ 67%    │
│                                         │
└─────────────────────────────────────────┘
```

### Success State
```
┌─────────────────────────────────────────┐
│                                         │
│  ✓ TRANSACTION COMPLETE                 │
│                                         │
│  TXID: 8f3a...7b2c                      │
│  AMOUNT: 0.0234 ZEC                     │
│  TIME: 2024-01-15 14:32:07 UTC          │
│                                         │
│  [View on Explorer] [Done]              │
│                                         │
└─────────────────────────────────────────┘
```

---

## 6. Key Differentiating Element

### "The Transaction Log"
A persistent, scannable log of all tips sent, displayed in terminal format:

```
┌─────────────────────────────────────────────────────────┐
│  TRANSACTION LOG                                        │
│  ───────────────────────────────────────────────────── │
│  2024-01-15 14:32  @vitalik     $5.00   ✓ confirmed    │
│  2024-01-14 09:15  @balajis     $2.00   ✓ confirmed    │
│  2024-01-13 22:47  @naval       $10.00  ✓ confirmed    │
│  ───────────────────────────────────────────────────── │
│  TOTAL: $17.00 (0.0798 ZEC)                            │
└─────────────────────────────────────────────────────────┘
```

### "Privacy Indicator"
A system-status style indicator:

```
┌─────────────────────────────────┐
│  SYSTEM STATUS                  │
│  ─────────────────────────────  │
│  ● Network:    connected        │
│  ● Privacy:    shielded         │
│  ● Tracking:   none             │
│  ● Logs:       local only       │
└─────────────────────────────────┘
```

### Philosophy
This design speaks to developers, power users, and those who appreciate systems. It emphasizes transparency (you can see exactly what's happening) and control (dense information at your fingertips). The terminal aesthetic signals technical credibility and attracts users who value substance over flash.

---

## Summary

| Aspect | Approach |
|--------|----------|
| Tone | Technical, precise, transparent, powerful |
| Complexity | High information density, but well-organized |
| Target | Developers, power users, technical enthusiasts |
| Risk | May intimidate non-technical users |
| Strength | Unique differentiation, technical credibility |
