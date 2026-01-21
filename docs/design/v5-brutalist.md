# TIPZ Design Direction: Brutalist

> Inspiration: Balaji's sites, crypto punk aesthetic
> Aesthetic: High contrast, raw, bold typography

---

## 1. Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| **Pure White** | `#FFFFFF` | Primary background |
| **Pure Black** | `#000000` | Text, accents, borders |
| **Signal Red** | `#FF0000` | Alerts, important elements |
| **Electric Blue** | `#0000FF` | Links, interactive elements |
| **System Gray** | `#808080` | Secondary text, disabled |

### Rationale
Maximum contrast, zero decoration. This palette is intentionally jarring and honest. No gradient softening, no subtle shades - just pure, bold color when needed. This is anti-design as design.

---

## 2. Typography

### Primary: Arial / Helvetica
- System defaults, deliberately "basic"
- No custom fonts = faster loading
- Weights: 400 (body), 700 (bold)

### Secondary: Courier New
- System monospace for code, addresses
- Raw, unpolished appearance
- Weight: 400

### Scale
```
Hero:     72px / 700 / UPPERCASE
H1:       48px / 700
H2:       32px / 700
H3:       24px / 700
Body:     18px / 400
Caption:  14px / 400
Mono:     16px / 400
```

---

## 3. Hero Section

### Copy
```
Headline:     TIP ANYONE.
              PRIVATELY.
Subheadline:  Zcash shielded transactions.
              No tracking. No bullshit.
CTA:          INSTALL →
Secondary:    SOURCE CODE
```

### Layout
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                                                          │
│                                                          │
│                                                          │
│   TIP ANYONE.                                           │
│   PRIVATELY.                                            │
│   ══════════════════════════════════════════════════    │
│                                                          │
│   Zcash shielded transactions.                          │
│   No tracking. No bullshit.                             │
│                                                          │
│                                                          │
│   ┌─────────────────────┐                               │
│   │     INSTALL →       │  ← Solid black button         │
│   └─────────────────────┘                               │
│                                                          │
│   SOURCE CODE                                            │
│   ───────────                                            │
│   (underlined, blue link)                               │
│                                                          │
│                                                          │
│                                                          │
│   ┌─────────────────────────────────────────────────┐   │
│   │                                                 │   │
│   │   [Raw screenshot of extension - no mockup,     │   │
│   │    no device frame, just the UI]                │   │
│   │                                                 │   │
│   └─────────────────────────────────────────────────┘   │
│                                                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Tip Button Design (on X/Twitter)

### Appearance
- Stark, high-contrast button
- Black rectangle with white text
- No icons, no decoration
- Intentionally "ugly" but unmistakable

### States
```
Default:    Black bg, white text
Hover:      Inverted (white bg, black text, black border)
Active:     Red bg, white text
Disabled:   Gray bg, darker gray text
```

### Visual
```
┌──────────────────┐
│  TIP             │  ← Pure black, sharp corners
└──────────────────┘

Size: 48px × 24px
Border: 2px solid #000000
Border-radius: 0px
Font: Arial 700, 12px, UPPERCASE
```

---

## 5. Modal Design (Tip Flow)

### Structure
A raw, functional modal. No rounded corners, no shadows, no softness. Just information and action.

```
╔═════════════════════════════════════════╗
║  TIP @USERNAME                     [X]  ║
╠═════════════════════════════════════════╣
║                                         ║
║  AMOUNT                                 ║
║  ┌─────────────────────────────────┐   ║
║  │ $5.00                           │   ║
║  └─────────────────────────────────┘   ║
║                                         ║
║  $1  |  $2  |  $5  |  $10  |  OTHER    ║
║  ───────────────────────────────────── ║
║                                         ║
║  MESSAGE (optional)                     ║
║  ┌─────────────────────────────────┐   ║
║  │                                 │   ║
║  └─────────────────────────────────┘   ║
║                                         ║
║  ═══════════════════════════════════   ║
║  PRIVACY: SHIELDED                      ║
║  NETWORK: ZCASH                         ║
║  FEE: $0.001                            ║
║  ═══════════════════════════════════   ║
║                                         ║
║  ┌─────────────────────────────────┐   ║
║  │          SEND TIP               │   ║
║  └─────────────────────────────────┘   ║
║                                         ║
╚═════════════════════════════════════════╝
```

### Design Details
- Width: 400px
- Border: 3px solid #000000
- Border-radius: 0px
- Background: `#FFFFFF`
- No shadows
- ASCII-style box drawing characters
- Labels in UPPERCASE
- Dividers using `═══` and `───`
- Send button: Solid black, full width
- All text left-aligned

### Processing State
```
╔═════════════════════════════════════════╗
║                                         ║
║  SENDING...                             ║
║                                         ║
║  ████████████░░░░░░░░░░░░░░░░░░ 40%    ║
║                                         ║
╚═════════════════════════════════════════╝
```

### Success State
```
╔═════════════════════════════════════════╗
║                                         ║
║  ✓ SENT                                 ║
║                                         ║
║  $5.00 → @username                      ║
║  PRIVATE. CONFIRMED.                    ║
║                                         ║
║  [DONE]                                 ║
║                                         ║
╚═════════════════════════════════════════╝
```

---

## 6. Key Differentiating Element

### "The Manifesto"
A bold, unapologetic statement that appears prominently:

```
═══════════════════════════════════════════════════════════

WHY TIPZ?

SURVEILLANCE CAPITALISM BROKE THE WEB.
EVERY PAYMENT IS TRACKED, LOGGED, SOLD.
YOUR SUPPORT FOR CREATORS BECOMES DATA.

TIPZ USES ZCASH SHIELDED TRANSACTIONS.
YOUR TIPS ARE MATHEMATICALLY PRIVATE.
NO TRACKING. NO LOGS. NO EXCEPTIONS.

THIS IS NOT A FEATURE.
THIS IS THE POINT.

═══════════════════════════════════════════════════════════
```

### "Raw Stats"
No pretty charts, just numbers:

```
STATS
─────────────────────────
TIPS SENT:     127,453
TOTAL VALUE:   $892,104
UNIQUE USERS:  23,891
UPTIME:        99.97%
CODE:          OPEN SOURCE
TRACKING:      NONE
─────────────────────────
```

### Philosophy
This design rejects contemporary design trends entirely. No rounded corners. No gradients. No micro-interactions. No "delight." Just function, clarity, and an ideological stance. It's polarizing by design - those who get it will love it, those who don't aren't the target audience.

The brutalist approach communicates: "We're not trying to manipulate you with pretty design. We're just building something that works and respects you."

---

## Summary

| Aspect | Approach |
|--------|----------|
| Tone | Raw, honest, ideological, punk |
| Complexity | Minimal - stripped to essentials |
| Target | Cypherpunks, privacy maximalists, anti-establishment |
| Risk | Alienates mainstream users, may seem "broken" |
| Strength | Strong identity, memorable, filters for true believers |
