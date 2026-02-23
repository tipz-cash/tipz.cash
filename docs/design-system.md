# TIPZ Design System

## Aesthetic

**Premium Glass Morphism with Golden Accents** — refined fintech, NOT heavy terminal.

The visual language emphasizes elegance and sophistication through subtle transparency effects, clean typography, and restrained use of accent colors. Avoid heavy "Bloomberg terminal" aesthetics like corner brackets, signal bars, CRT scan-lines, or glitch effects.

## Cards

```css
border-radius: 12px;                        /* standard cards */
border-radius: 24px;                        /* large containers */
background: rgba(26, 26, 26, 0.6);          /* glass background */
backdrop-filter: blur(16px);                /* standard blur */
backdrop-filter: blur(24px);                /* heavy blur for overlays */
border: 1px solid rgba(255, 255, 255, 0.06);
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);  /* subtle elevation */
```

## Accents

Top border gradient strip (NOT corner brackets):

```css
position: absolute;
top: 0;
left: 0;
right: 0;
height: 2px;
background: linear-gradient(90deg, transparent, [accent-color], transparent);
border-radius: 12px 12px 0 0;
```

## Colors

| Token | Value | Usage |
|-------|-------|-------|
| `colors.bg` | `#08090a` | Page background |
| `colors.surface` | `#12141a` | Card backgrounds (solid) |
| `colors.border` | `rgba(255, 255, 255, 0.06)` | Subtle borders |
| `colors.primary` | `#F5A623` | Golden accent, CTAs |
| `colors.primaryHover` | `#FFB84D` | Hover state |
| `colors.success` | `#22C55E` | Success states, online indicators |
| `colors.error` | `#EF4444` | Error states |
| `colors.muted` | `#D1D5DB` | Secondary text |
| `colors.textBright` | `#F9FAFB` | Primary text |

## Typography

| Element | Size | Weight | Font | Spacing |
|---------|------|--------|------|---------|
| Display | 32-36px | 700-800 | JetBrains Mono | -0.02em |
| Headline | 24-28px | 600-700 | JetBrains Mono | - |
| Body | 14-16px | 400-500 | Inter | - |
| Labels | 10-12px | 500 | JetBrains Mono | 1-2px |

## Glows & Effects

- **Glows**: Reserved for active/selected states ONLY
- **No heavy text-shadows** on static elements
- **Hover elevation**: `translateY(-2px)` with subtle shadow increase
- **Transitions**: `200-300ms ease` for most interactions

## Do's and Don'ts

### Do
- Use glass morphism backgrounds (`rgba(26,26,26,0.6)` + blur)
- Use top gradient accents for visual interest
- Keep typography clean without heavy shadows
- Use gaps between cards instead of 1px grid borders
- Reserve glows for interactive/active states

### Don't
- Use corner bracket accents (`borderTop + borderLeft` corners)
- Use signal bar icons or heavy terminal iconography
- Apply text-shadow to everything
- Use block characters (`████`) for redaction — use `[REDACTED]` text instead
- Add CRT scan-lines, glitch effects, or retro terminal aesthetics

## Components Reference

### Stat Card

```tsx
<div style={{
  backgroundColor: "rgba(26, 26, 26, 0.6)",
  backdropFilter: "blur(16px)",
  border: `1px solid ${colors.border}`,
  borderRadius: "12px",
  padding: "24px",
  position: "relative",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
}}>
  {/* Top gradient accent */}
  <div style={{
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: "2px",
    background: `linear-gradient(90deg, transparent, ${colors.success}, transparent)`,
    borderRadius: "12px 12px 0 0",
  }} />

  {/* Label */}
  <div style={{
    fontSize: "11px",
    color: colors.muted,
    letterSpacing: "1px",
    marginBottom: "8px"
  }}>
    LABEL
  </div>

  {/* Value */}
  <div style={{
    fontSize: "32px",
    fontWeight: 700,
    color: colors.success
  }}>
    Value
  </div>
</div>
```

### Testimonial Card

Cards with author attribution use the same glass morphism base with:
- Avatar with colored border ring
- Quote text at 15-16px
- Author info in smaller muted text

## Animation

- Respect `prefers-reduced-motion`
- Use `TerminalReveal` for scroll-triggered animations
- Typing animations for hero text only
- Subtle `pulse-glow` for active status indicators
