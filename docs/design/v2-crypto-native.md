# TIPZ Design Direction: Crypto Native

> Inspiration: Zashi, NEAR, Phantom wallet
> Aesthetic: Dark, gradients, tech-forward

---

## 1. Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| **Void Black** | `#0D0D0D` | Primary background |
| **Electric Purple** | `#8B5CF6` | Primary accent, gradients |
| **Neon Cyan** | `#22D3EE` | Secondary accent, highlights |
| **Soft Lavender** | `#E0E7FF` | Text on dark backgrounds |
| **Zcash Yellow** | `#F4B728` | Zcash brand moments, success states |

### Gradient
Primary gradient: `linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)`

### Rationale
This palette speaks directly to crypto users. The purple-to-cyan gradient is immediately recognizable as "web3" while the Zcash yellow creates brand connection. Dark mode is default and only mode - this is crypto native.

---

## 2. Typography

### Primary: Satoshi
- Modern geometric sans-serif
- Clean but with personality
- Weights: 400 (body), 500 (UI), 700 (headings)

### Secondary: JetBrains Mono
- Premium monospace for addresses, amounts, technical data
- Excellent for displaying Zcash addresses
- Weight: 400, 500

### Scale
```
Hero:     56px / 700
H1:       40px / 700
H2:       28px / 700
H3:       20px / 500
Body:     16px / 400
Caption:  14px / 400
Mono:     14px / 400
```

---

## 3. Hero Section

### Copy
```
Headline:     Private tips.
              Zero trace.
Subheadline:  The browser extension for shielded micro-payments.
              Powered by Zcash.
CTA:          Install Extension
Secondary:    View on GitHub
```

### Layout
```
┌──────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ░░░░░░  [Animated gradient mesh background]  ░░░░░░░░  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                                          │
│         ╔════════════════════════════════╗              │
│         ║     Private tips.              ║              │
│         ║     Zero trace.                ║  ← Gradient  │
│         ╚════════════════════════════════╝     text     │
│                                                          │
│      The browser extension for shielded micro-payments.  │
│                  Powered by Zcash.                       │
│                                                          │
│    ┌──────────────────────┐   ┌──────────────────────┐  │
│    │  Install Extension   │   │   View on GitHub     │  │
│    │  ████ gradient ████  │   │   ghost/outline      │  │
│    └──────────────────────┘   └──────────────────────┘  │
│                                                          │
│         [3D floating extension UI mockup with           │
│          glow effects and subtle animation]             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Tip Button Design (on X/Twitter)

### Appearance
- Stands out intentionally - crypto users want to signal participation
- Gradient background (purple to cyan)
- Lightning bolt or Zcash "Z" icon + "Tip" text
- Subtle glow effect on hover

### States
```
Default:    Gradient bg, white text, subtle glow
Hover:      Intensified glow, slight scale up (1.02)
Active:     Pressed with inner shadow
Disabled:   Grayscale gradient, no glow
```

### Visual
```
┌──────────────────┐
│  ⚡ Tip          │  ← Purple-to-cyan gradient
└──────────────────┘     with subtle outer glow

Size: 76px × 30px
Border-radius: 8px
Font: Satoshi 500, 13px
Icon: Lightning bolt or Z mark
Glow: 0 0 20px rgba(139, 92, 246, 0.3)
```

---

## 5. Modal Design (Tip Flow)

### Structure
A sleek, dark modal with gradient accents and animated elements. Feels like a premium wallet interface.

```
┌─────────────────────────────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  [×]  │ ← Gradient header bar
│                                         │
│      ┌──────┐                          │
│      │ ○○○○ │  @username               │ ← Avatar with gradient ring
│      └──────┘  Verified Creator         │
│                                         │
│   ╔═════════════════════════════════╗  │
│   ║      $5.00                      ║  │ ← Large, glowing amount
│   ║      ≈ 0.0234 ZEC               ║  │
│   ╚═════════════════════════════════╝  │
│                                         │
│   ┌───┐ ┌───┐ ┌───┐ ┌────┐ ┌───────┐  │
│   │$1 │ │$2 │ │$5 │ │$10 │ │Custom │  │
│   └───┘ └───┘ └───┘ └────┘ └───────┘  │
│   ▓▓▓▓▓▓▓▓▓▓▓  ← Selected has gradient │
│                                         │
│   ┌─────────────────────────────────┐  │
│   │  Message (encrypted)        🔒  │  │
│   └─────────────────────────────────┘  │
│                                         │
│   ┌─────────────────────────────────┐  │
│   │ ████████  Send Tip  ████████   │  │ ← Full gradient button
│   └─────────────────────────────────┘  │
│                                         │
│      🛡 Shielded Transaction            │
│      z-addr → z-addr                    │
└─────────────────────────────────────────┘
```

### Design Details
- Width: 380px max
- Border-radius: 20px
- Background: `#0D0D0D` with subtle noise texture
- Border: 1px gradient border
- Shadow: Large glow (0 0 60px rgba(139, 92, 246, 0.2))
- Amount display: Large, gradient text
- ZEC conversion: Shown in real-time
- Send button: Full gradient with hover animation
- Micro-animations: Amount changes with spring physics

---

## 6. Key Differentiating Element

### "Shielded Transaction Visualization"
When a tip is sent, show an animated visualization:

```
        Sending...
           │
    ┌──────┴──────┐
    │  ░░░░░░░░░  │
    │  ░ YOUR  ░  │     →→→→→→     ┌────────────┐
    │  ░ ADDR  ░  │    ▓▓▓▓▓▓▓▓    │  SHIELDED  │
    │  ░░░░░░░░░  │     →→→→→→     │  ████████  │
    └─────────────┘                └────────────┘

    "Your tip is being shielded..."
```

This visualization:
- Shows particles flowing from sender to receiver
- Particles enter a "shield" zone and become anonymized
- Gradient colors pulse during the transaction
- Creates a memorable, shareable moment

### Philosophy
This design embraces crypto culture. It's dark, it's glowy, it's unapologetically web3. The gradient treatment and animations signal innovation and modernity. Users who see this immediately understand: this is crypto-native, privacy-focused, and built for them.

---

## Summary

| Aspect | Approach |
|--------|----------|
| Tone | Tech-forward, premium, crypto-native |
| Complexity | Medium - polished animations and effects |
| Target | Crypto users, web3 enthusiasts, early adopters |
| Risk | May alienate mainstream users, could feel "too crypto" |
| Strength | Immediate recognition by target audience, shareable |
