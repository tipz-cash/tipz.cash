# TIPZ Brand Guidelines

## Brand Essence

**Mission**: Enable private, frictionless micro-tipping for creators across the web.

**Personality**: Cypherpunk, terminal-native, privacy-obsessed, technically sophisticated.

**Tagline**: "Private tips. Any asset. Zero trace."

**Aesthetic**: Bloomberg terminal meets cypherpunk. Dense information, monospace typography, amber/green on black.

---

## Color Palette

### Terminal Color System

TIPZ uses a terminal-inspired color palette that evokes Bloomberg terminals, command-line interfaces, and cypherpunk aesthetics.

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **True Black** | `#0A0A0A` | 10, 10, 10 | Primary background |
| **Surface** | `#1A1A1A` | 26, 26, 26 | Card backgrounds, elevated surfaces |
| **Terminal Amber** | `#F5A623` | 245, 166, 35 | Primary accent, CTAs, highlights |
| **Amber Hover** | `#FFB84D` | 255, 184, 77 | Hover states, emphasis |

### Status Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Matrix Green** | `#00FF00` | 0, 255, 0 | Success states, live indicators, confirmations |
| **Error Red** | `#FF4444` | 255, 68, 68 | Error states, warnings, destructive actions |

### Neutral Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Phosphor White** | `#E0E0E0` | 224, 224, 224 | Primary text |
| **Muted Gray** | `#888888` | 136, 136, 136 | Secondary text, labels, placeholders |
| **Border Gray** | `#333333` | 51, 51, 51 | Borders, dividers, grid lines |

### CSS Variables

```css
:root {
  --tipz-bg: #0A0A0A;
  --tipz-surface: #1A1A1A;
  --tipz-primary: #F5A623;
  --tipz-primary-hover: #FFB84D;
  --tipz-success: #00FF00;
  --tipz-error: #FF4444;
  --tipz-text: #E0E0E0;
  --tipz-muted: #888888;
  --tipz-border: #333333;
}
```

### Ambient Effects

**Primary Glow** (for hero elements and active states):
```css
box-shadow: 0 0 20px rgba(245, 166, 35, 0.3);
```

**Success Glow** (for confirmations):
```css
box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
```

**Subtle Grid Background**:
```css
background-image:
  linear-gradient(#33333340 1px, transparent 1px),
  linear-gradient(90deg, #33333340 1px, transparent 1px);
background-size: 40px 40px;
```

---

## Typography

### Font Family

**Primary**: JetBrains Mono
- Monospace font for all text (terminal aesthetic)
- Available weights: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- Source: Google Fonts

```css
font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| Hero Headline | 24-32px | 600 | 1.4 | 0 |
| Section Label | 12px | 500 | 1.0 | 1px (UPPERCASE) |
| Step Number | 32px | 700 | 1.0 | 0 |
| Card Title | 14-16px | 600 | 1.4 | 0 |
| Body | 14px | 400 | 1.6 | 0 |
| Caption/Label | 11-12px | 400-500 | 1.5 | 0.5px |
| Button | 14-16px | 600 | 1.0 | 0 |
| Code/Specs | 12px | 400 | 1.5 | 0 |

### Terminal Text Patterns

**Command Prompt Style**:
```
> Get tipped. Stay private. No fees.
```

**Section Headers** (always uppercase with comment syntax):
```
// FOR_CREATORS
// ARCHITECTURE
// REGISTER
```

**Status Indicators**:
```
NETWORK_STATUS: OPERATIONAL
PLATFORM_FEE: 0%
```

### Usage Guidelines

- All text uses monospace (JetBrains Mono)
- Section headers: UPPERCASE with `// PREFIX`
- Labels: UPPERCASE, 11-12px, muted color
- Technical terms: Use underscores (e.g., `ZK_SHIELDED`, `ANY_TOKEN_IN`)
- Version numbers: `v0.1.0-beta` format
- Never use sans-serif fonts

---

## Logo

### Primary Mark: The Bracketed Z

The TIPZ logo is displayed as `[TIPZ]` in JetBrains Mono Bold, evoking command-line syntax.

```
[TIPZ]
```

**Specifications**:
- Font: JetBrains Mono
- Weight: 700 (Bold)
- Color: Terminal Amber (#F5A623)

### ASCII Art Logo

For hero sections and large displays, use the ASCII art Z mark:

```
                     ██
████████╗██╗██████╗███████╗
╚══██╔══╝██║██╔══██╗╚═███╔╝
   ██║   ██║██████╔╝ ███╔╝
   ██║   ██║██╔═══╝ ███╔╝
   ██║   ██║██║    ███╔╝
   ╚═╝   ╚═╝╚═╝   ███████╗
                     ██
```

**Specifications**:
- Font Size: 10px
- Line Height: 1.2
- Color: Terminal Amber (#F5A623)

### Z Symbol (Minimal)

The Z with vertical lines represents the Zcash connection:

```
  |
  Z
  |
```

Used for favicons and small icon contexts.

### Logo Variants

1. **Primary** (on dark): Amber text `[TIPZ]`
2. **With Version**: `[TIPZ] v0.1.0-beta`
3. **With ZEC Badge**: `[TIPZ]` + Zcash icon + `ZEC`

### Don'ts

- Don't use rounded fonts
- Don't remove the brackets
- Don't use colors outside the terminal palette
- Don't add shadows or 3D effects
- Don't place on light backgrounds

---

## Iconography

### Style

- Minimal, text-based where possible
- Use bracket notation: `[]`, `{}`, `()`, `<>`
- Terminal-style indicators: `>`, `$`, `//`
- Status dots: `●` (green for active, amber for pending)

### Common Symbols

| Symbol | Usage |
|--------|-------|
| `[]` | ZK/Shielded features |
| `{}` | Token/swap features |
| `()` | Self-custody features |
| `<>` | Open source/code features |
| `●` | Status indicators |
| `>` | Command prompt, actions |
| `//` | Section labels, comments |
| `✓` | Success, verification |

### Status Indicators

```
● NETWORK_STATUS: OPERATIONAL  (green dot)
● PROCESSING...                (amber dot, animated)
```

---

## UI Components

### Buttons

**Primary Button** (Terminal style, sharp corners):
```css
background: #F5A623;
color: #0A0A0A;
border: none;
border-radius: 0;
padding: 14px 28px;
font-family: 'JetBrains Mono', monospace;
font-size: 15px;
font-weight: 600;
cursor: pointer;
transition: background-color 0.2s;
```

Hover state:
```css
background: #FFB84D;
```

**Secondary Button** (Outlined):
```css
background: transparent;
border: 1px solid #333333;
color: #E0E0E0;
border-radius: 0;
padding: 14px 28px;
font-family: 'JetBrains Mono', monospace;
font-size: 15px;
cursor: pointer;
transition: all 0.2s;
```

Hover state:
```css
border-color: #F5A623;
color: #F5A623;
```

**Tip Button** (Extension, compact):
```css
background: #0A0A0A;
border: 2px solid #F5A623;
color: #F5A623;
border-radius: 6px;
padding: 8px 18px;
font-family: 'JetBrains Mono', monospace;
font-size: 14px;
font-weight: 600;
letter-spacing: 0.5px;
```

Content: `[TIP]`

### Cards

**Feature Card**:
```css
background: #1A1A1A;
border: 1px solid #333333;
border-radius: 0;
padding: 24px;
transition: border-color 0.2s;
```

Hover state:
```css
border-color: #F5A623;
```

**Terminal Window Card** (with traffic lights):
```css
background: #1A1A1A;
border: 1px solid #333333;
border-radius: 8px;
padding: 32px;
```

Header with traffic lights:
```html
<div class="terminal-header">
  <span class="dot red"></span>
  <span class="dot yellow"></span>
  <span class="dot green"></span>
  <span class="title">[TIPZ] // REGISTER</span>
</div>
```

### Input Fields

```css
width: 100%;
padding: 12px 16px;
font-size: 14px;
background: #0A0A0A;
color: #E0E0E0;
border: 1px solid #333333;
border-radius: 4px;
font-family: 'JetBrains Mono', monospace;
transition: border-color 0.2s;
```

Focus state:
```css
border-color: #F5A623;
outline: none;
```

Error state:
```css
border-color: #FF4444;
```

### Labels

```css
display: block;
margin-bottom: 8px;
font-size: 12px;
color: #888888;
letter-spacing: 0.5px;
text-transform: uppercase;
```

---

## Animation

### Principles

- Terminal-inspired: typing effects, cursor blinks
- Subtle and purposeful
- 200-300ms for micro-interactions
- Smooth springs for modals (damping: 15, stiffness: 60)

### Standard Transitions

**Typing Effect** (for hero text):
```javascript
// Reveal text character by character
const speed = 40; // ms per character
```

**Blinking Cursor**:
```css
animation: blink 1.06s step-end infinite;

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
```

**Border Hover**:
```css
transition: border-color 0.2s ease;
```

**Button Hover**:
```css
transition: all 0.2s ease;
```

**Modal Spring** (Remotion/Framer):
```javascript
spring({
  damping: 15,
  stiffness: 60,
  mass: 1.2
})
```

---

## Voice & Tone

### Voice Characteristics

- **Technical**: Speak to developers and power users
- **Direct**: No marketing fluff
- **Privacy-first**: Always emphasize user control
- **Cypherpunk**: Embrace the underground aesthetic

### Tone by Context

| Context | Tone | Example |
|---------|------|---------|
| Headlines | Command-like | `> Get tipped. Stay private. No fees.` |
| Labels | Technical, uppercase | `PLATFORM_FEE: 0%` |
| UI Text | Concise, direct | "Enter your Zcash address" |
| Errors | Clear, actionable | "Tweet not found. Check the URL." |
| Success | Brief, celebratory | "Tip sent privately. No trace." |

### Writing Guidelines

- Use terminal/command syntax where appropriate
- Use underscores in technical terms: `ZK_SHIELDED`, `SELF_CUSTODY`
- Version numbers: `v0.1.0-beta`
- Status text: `OPERATIONAL`, `PROCESSING...`
- Avoid emojis (except checkmarks and status symbols)

---

## Visual Patterns

### Grid Background

Subtle terminal grid for depth:
```css
background-image:
  linear-gradient(#33333330 1px, transparent 1px),
  linear-gradient(90deg, #33333330 1px, transparent 1px);
background-size: 40px 40px;
opacity: 0.25;
```

### Data Tables

Terminal-style tables with fixed-width columns:
```
┌─────────────────────────────────────────────────┐
│  PROTOCOL SPECIFICATIONS                        │
├─────────────────────────────────────────────────┤
│  Network:        Zcash Mainnet (Sapling)        │
│  Encryption:     zk-SNARKs (Groth16)            │
│  Platform Fee:   0% (network fee only)          │
└─────────────────────────────────────────────────┘
```

### Stats Display

Grid of metric cards:
```
┌──────────────┬──────────────┬──────────────┐
│ PLATFORM_FEE │ LICENSE      │ CUSTODY      │
│ 0%           │ MIT          │ SELF         │
│ Network only │ Open source  │ Your keys    │
└──────────────┴──────────────┴──────────────┘
```

---

## Spacing System

Based on 4px grid:

| Token | Size | Usage |
|-------|------|-------|
| xs | 4px | Tight gaps |
| sm | 8px | Icon gaps, small padding |
| md | 16px | Standard padding |
| lg | 24px | Card padding, section gaps |
| xl | 32px | Large section padding |
| 2xl | 48px | Section margins |
| 3xl | 64px | Hero padding |
| 4xl | 80px | Large hero padding |

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, stacked |
| Tablet | 640px - 1024px | 2-column grids |
| Desktop | > 1024px | Full layout, max-width 1200px |

---

## Asset Checklist

### Logo Assets
- [ ] `[TIPZ]` text mark (SVG)
- [ ] ASCII art logo (text file)
- [ ] Z with vertical lines favicon

### Favicon
- [ ] favicon.ico (16x16, 32x32 multi-size)
- [ ] apple-touch-icon.png (180x180)
- [ ] favicon-192.png (192x192, PWA)
- [ ] favicon-512.png (512x512, PWA)

### Social / OG Images
- [ ] og-image.png (1200x630) - Terminal aesthetic
- [ ] twitter-card.png (1200x600)

### Extension Assets
- [ ] icon-16.png
- [ ] icon-32.png
- [ ] icon-48.png
- [ ] icon-64.png
- [ ] icon-128.png

### Store Screenshots
- [ ] Chrome Web Store (1280x800 or 640x400)
- [ ] See Extension Store Screenshot Specs
