# TIPZ Extension Store Screenshot Specs

Guidelines for creating Chrome Web Store and browser extension marketplace screenshots.

---

## Chrome Web Store Requirements

### Image Dimensions

| Asset | Dimensions | Format | Required |
|-------|------------|--------|----------|
| Small Promo Tile | 440x280 px | PNG/JPEG | Yes |
| Large Promo Tile | 920x680 px | PNG/JPEG | No |
| Marquee Promo Tile | 1400x560 px | PNG/JPEG | No |
| Screenshots | 1280x800 or 640x400 px | PNG/JPEG | Yes (1-5) |

### Screenshot Specifications

**Recommended**: 1280x800 pixels (16:10 aspect ratio)
**Alternative**: 640x400 pixels (same aspect ratio)
**Format**: PNG (preferred) or JPEG
**Count**: Minimum 1, maximum 5 screenshots

---

## Screenshot Content Plan

### Screenshot 1: Hero - Tip Button on Tweet

**Content**: Show a tweet with the TIPZ `[TIP]` button visible
**Focus**: The tip button integration with X/Twitter
**Text Overlay**: "Tip any creator on X"

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │  [Tweet from @satoshi]                              │  │
│   │                                                     │  │
│   │  "Just shipped a major update to my privacy        │  │
│   │   project. Shielded transactions are the future."  │  │
│   │                                                     │  │
│   │  💬 42    🔁 128    ❤️ 1.2K    [TIP] ← HIGHLIGHT   │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   "Tip any creator on X"                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Design Notes**:
- Dark background (#0A0A0A)
- Tweet styled to match X/Twitter UI
- `[TIP]` button highlighted with amber glow
- Text overlay at bottom in JetBrains Mono

---

### Screenshot 2: Tip Modal Open

**Content**: Show the tip modal with amount selection
**Focus**: The clean, terminal-style tip interface
**Text Overlay**: "Select amount. One click."

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│          ┌─────────────────────────────────────┐           │
│          │  ● ● ●  [TIPZ] // SEND_TIP          │           │
│          │  ─────────────────────────────────  │           │
│          │                                     │           │
│          │  SENDING TO                         │           │
│          │  [S] @satoshi                       │           │
│          │      zs1q8w...x7k9                  │           │
│          │                                     │           │
│          │  SELECT AMOUNT (ZEC)                │           │
│          │  [0.01] [0.05] [0.1*] [0.5] [1]    │           │
│          │                                     │           │
│          │  ┌─────────────────────────────┐   │           │
│          │  │      [Confirm Tip →]        │   │           │
│          │  └─────────────────────────────┘   │           │
│          │                                     │           │
│          └─────────────────────────────────────┘           │
│                                                             │
│   "Select amount. One click."                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Design Notes**:
- Modal centered on dark background
- Amount "0.1" highlighted as selected
- Terminal window chrome (traffic lights)
- Amber primary button

---

### Screenshot 3: Success State

**Content**: Show the success confirmation after tipping
**Focus**: Privacy confirmation message
**Text Overlay**: "Private. No trace."

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│          ┌─────────────────────────────────────┐           │
│          │                                     │           │
│          │           ┌───┐                     │           │
│          │           │ ✓ │  (green circle)    │           │
│          │           └───┘                     │           │
│          │                                     │           │
│          │         Tip Sent!                   │           │
│          │      0.1 ZEC to @satoshi            │           │
│          │                                     │           │
│          │   🛡️ Shielded • No trace            │           │
│          │                                     │           │
│          └─────────────────────────────────────┘           │
│                                                             │
│   "Private. No trace."                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Design Notes**:
- Success green (#00FF00) for checkmark
- Minimal, celebratory design
- Privacy messaging prominent

---

### Screenshot 4: Extension Popup

**Content**: Show the extension popup when clicked
**Focus**: Status and quick actions
**Text Overlay**: "Always know your status"

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Browser toolbar area...                                   │
│                                              [TIPZ icon] ▼  │
│                                   ┌─────────────────────┐  │
│                                   │  [TIPZ]             │  │
│                                   │                     │  │
│                                   │  ● Active on X.com  │  │
│                                   │                     │  │
│                                   │  Wallet Connected   │  │
│                                   │  0x1234...5678      │  │
│                                   │                     │  │
│                                   │  Tips Sent: 12      │  │
│                                   │  Total: 2.5 ZEC     │  │
│                                   │                     │  │
│                                   │  [Settings] [Help]  │  │
│                                   └─────────────────────┘  │
│                                                             │
│   "Always know your status"                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Design Notes**:
- Show popup in context of browser
- Green status dot for "Active"
- Stats display for engagement

---

### Screenshot 5: Privacy Comparison

**Content**: Show TIPZ vs traditional tipping platforms
**Focus**: Privacy and fee advantages
**Text Overlay**: "Zero fees. Full privacy."

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │                                                     │  │
│   │   Feature         TIPZ      Ko-fi    Buy Me Coffee │  │
│   │   ─────────────────────────────────────────────────│  │
│   │   Platform Fee    0% ✓      5%       5%            │  │
│   │   Income Privacy  Full ✓    Public   Public        │  │
│   │   Self-Custody    Yes ✓     No       No            │  │
│   │   KYC Required    No ✓      Yes      Yes           │  │
│   │                                                     │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   "Zero fees. Full privacy."                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Design Notes**:
- Terminal-style table
- Green checkmarks for TIPZ advantages
- Muted text for competitors

---

## Promo Tile Designs

### Small Promo Tile (440x280)

**Layout**:
```
┌─────────────────────────────────┐
│                                 │
│         [TIPZ]                  │
│                                 │
│   Private tips for creators     │
│   Zero fees. Zero trace.        │
│                                 │
│         [Install →]             │
│                                 │
└─────────────────────────────────┘
```

**Design Notes**:
- Centered layout
- ASCII logo or `[TIPZ]` text mark
- Tagline in JetBrains Mono
- Amber CTA button

### Large Promo Tile (920x680)

**Layout**:
```
┌───────────────────────────────────────────────────────┐
│                                                       │
│              ██                                       │
│  ████████╗██╗██████╗███████╗                         │
│  ╚══██╔══╝██║██╔══██╗╚═███╔╝                         │
│     ██║   ██║██████╔╝ ███╔╝                          │
│     ██║   ██║██╔═══╝ ███╔╝                           │
│     ██║   ██║██║    ███╔╝                            │
│     ╚═╝   ╚═╝╚═╝   ███████╗                          │
│              ██                                       │
│                                                       │
│   > Private tips. Any asset. Zero trace.             │
│                                                       │
│   Tip creators on X with Zcash shielded              │
│   transactions. No accounts. No fees.                │
│                                                       │
│   [0% fees]  [Self-custody]  [Open source]           │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

## Style Guidelines

### Background
- Primary: #0A0A0A (True Black)
- Optional: Subtle grid pattern at 25% opacity

### Typography
- Font: JetBrains Mono
- Headline: 24-32px, weight 600, amber (#F5A623)
- Body: 16-18px, weight 400, white (#E0E0E0)
- Caption: 12-14px, weight 400, muted (#888888)

### Colors
- Primary accent: #F5A623 (Terminal Amber)
- Success: #00FF00 (Matrix Green)
- Text: #E0E0E0 (Phosphor White)
- Muted: #888888

### Effects
- Button glow: `box-shadow: 0 0 20px rgba(245, 166, 35, 0.3)`
- Modal shadow: `box-shadow: 0 20px 60px rgba(10, 10, 10, 0.8)`

---

## File Naming Convention

```
tipz-screenshot-01-tip-button.png
tipz-screenshot-02-modal.png
tipz-screenshot-03-success.png
tipz-screenshot-04-popup.png
tipz-screenshot-05-comparison.png
tipz-promo-small-440x280.png
tipz-promo-large-920x680.png
tipz-promo-marquee-1400x560.png
```

---

## Production Checklist

- [ ] Screenshot 1: Tip button on tweet (1280x800)
- [ ] Screenshot 2: Tip modal open (1280x800)
- [ ] Screenshot 3: Success state (1280x800)
- [ ] Screenshot 4: Extension popup (1280x800)
- [ ] Screenshot 5: Privacy comparison (1280x800)
- [ ] Small promo tile (440x280)
- [ ] Large promo tile (920x680)
- [ ] Marquee promo tile (1400x560)
- [ ] All assets exported as PNG
- [ ] File sizes under 2MB each
