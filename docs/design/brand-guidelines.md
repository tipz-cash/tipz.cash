# TIPZ Brand Guidelines

## Brand Essence

**Mission**: Enable private, frictionless micro-tipping for creators across the web.

**Personality**: Minimal, trustworthy, privacy-first, technically sophisticated yet approachable.

**Tagline**: "Private tips. Any asset. Zero trace."

---

## Color Palette

### Primary Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Black | `#000000` | Primary background |
| Zcash Gold | `#F4B728` | Accent, CTAs, highlights |
| White | `#FFFFFF` | Primary text |

### Secondary Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Muted Gray | `#888888` | Secondary text, borders |
| Dark Gray | `#1a1a1a` | Card backgrounds, subtle surfaces |
| Success Green | `#22c55e` | Success states, confirmations |
| Error Red | `#ef4444` | Error states, warnings |

### Gradients

**Gold Glow** (for hero elements):
```css
background: radial-gradient(ellipse at center, rgba(244, 183, 40, 0.15) 0%, transparent 70%);
```

**Text Highlight**:
```css
background: linear-gradient(to right, #F4B728, #fcd34d);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

---

## Typography

### Font Family

**Primary**: Inter
- Available weights: 400 (Regular), 500 (Medium), 600 (Semibold)
- Fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

### Type Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Hero Headline | 72px | 600 | 1.1 |
| Section Title | 48px | 600 | 1.2 |
| Subtitle | 24px | 400 | 1.4 |
| Body | 18px | 400 | 1.6 |
| Small/Caption | 14px | 400 | 1.5 |
| Button | 16px | 500 | 1.0 |

### Usage Guidelines

- Headlines: Use Semibold (600) for impact
- Body text: Use Regular (400) for readability
- Buttons/CTAs: Use Medium (500) for emphasis
- Never use weights below 400 or above 600

---

## Logo

### Primary Mark

The TIPZ wordmark uses Inter Semibold with custom letter-spacing.

**Clear Space**: Maintain minimum padding of 1x logo height on all sides.

**Minimum Size**: 24px height for digital, 0.5" for print.

### Color Variants

1. **Primary** (on dark): White text
2. **Accent** (on dark): Zcash Gold text
3. **Inverse** (on light): Black text (rare usage)

### Don'ts

- Don't stretch or distort the logo
- Don't add effects (shadows, gradients on the logo itself)
- Don't place on busy backgrounds without sufficient contrast
- Don't use colors outside the brand palette

---

## Iconography

### Style

- Stroke-based, 2px stroke weight
- Rounded corners (2px radius)
- Minimal, geometric forms
- Use white or Zcash Gold on dark backgrounds

### Common Icons

| Icon | Usage |
|------|-------|
| Shield | Privacy, security features |
| Lightning | Speed, instant transactions |
| Wallet | Payments, balances |
| Check | Success, verification |
| Lock | Shielded addresses |

---

## UI Components

### Buttons

**Primary Button**:
```css
background: #F4B728;
color: #000000;
border-radius: 8px;
padding: 12px 24px;
font-weight: 500;
```

**Secondary Button**:
```css
background: transparent;
border: 1px solid #888888;
color: #FFFFFF;
border-radius: 8px;
padding: 12px 24px;
```

**Ghost Button**:
```css
background: transparent;
color: #F4B728;
text-decoration: underline;
```

### Cards

```css
background: #1a1a1a;
border: 1px solid #333333;
border-radius: 12px;
padding: 24px;
```

### Input Fields

```css
background: #000000;
border: 1px solid #333333;
border-radius: 8px;
padding: 12px 16px;
color: #FFFFFF;
```

Focus state:
```css
border-color: #F4B728;
outline: none;
```

---

## Animation

### Principles

- Subtle and purposeful
- 200-300ms duration for micro-interactions
- 500-800ms for page transitions
- Ease-out for entrances, ease-in for exits

### Standard Transitions

**Fade In**:
```css
animation: fadeIn 0.5s ease-out;

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

**Hover States**:
```css
transition: all 0.2s ease;
```

---

## Voice & Tone

### Voice Characteristics

- **Clear**: No jargon without explanation
- **Confident**: Direct statements, not hedging
- **Privacy-focused**: Emphasize user control
- **Technical but accessible**: Explain crypto concepts simply

### Tone by Context

| Context | Tone | Example |
|---------|------|---------|
| Marketing | Inspiring, bold | "Your tips. Your privacy. Your control." |
| UI/UX | Helpful, concise | "Enter your Zcash address" |
| Error messages | Supportive, clear | "We couldn't verify that tweet. Please check the URL." |
| Success | Celebratory, brief | "You're all set!" |

### Writing Guidelines

- Use active voice
- Keep sentences short (under 20 words)
- Avoid crypto jargon where possible
- When using technical terms, explain on first use

---

## Photography & Imagery

### Style

- Abstract, minimal
- Dark backgrounds preferred
- Use geometric patterns, light rays, or abstract forms
- Avoid stock photos with people

### Illustrations

- Line-based, geometric
- White or Zcash Gold on black
- Consistent stroke weight (2px)

---

## Spacing System

Based on 4px grid:

| Token | Size |
|-------|------|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| 2xl | 48px |
| 3xl | 64px |

---

## Responsive Breakpoints

| Breakpoint | Width |
|------------|-------|
| Mobile | < 640px |
| Tablet | 640px - 1024px |
| Desktop | > 1024px |

---

## Asset Checklist

- [ ] Logo SVG (primary, accent variants)
- [ ] Favicon (16x16, 32x32, 180x180)
- [ ] OG Image (1200x630)
- [ ] Twitter Card (1200x600)
- [ ] Extension icons (16, 32, 48, 64, 128)
- [ ] App Store screenshots (if applicable)
