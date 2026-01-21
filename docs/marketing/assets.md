# TIPZ Marketing Assets

Inventory and specifications for all marketing graphics, videos, and demos.

---

## Asset Checklist

### Logo & Branding
- [ ] Logo SVG (primary - white on transparent)
- [ ] Logo SVG (accent - gold on transparent)
- [ ] Logo PNG (1024x1024 for large use)
- [ ] Favicon ICO (16x16, 32x32)
- [ ] Apple Touch Icon (180x180)

### Social Media
- [ ] X Profile Picture (400x400)
- [ ] X Banner (1500x500)
- [ ] OG Image - Default (1200x630)
- [ ] Twitter Card (1200x600)

### Product Screenshots
- [ ] Landing page full (desktop)
- [ ] Landing page full (mobile)
- [ ] Registration form (desktop)
- [ ] Registration success
- [ ] Extension popup
- [ ] Tip button on X.com
- [ ] Tip modal open
- [ ] Transaction confirmation

### Demo Videos/GIFs
- [ ] Full tip flow GIF (< 30s)
- [ ] Creator registration GIF
- [ ] Extension install + first tip
- [ ] Any-token swap visualization

### Presentation
- [ ] Pitch deck (10 slides)
- [ ] One-pager PDF

---

## Asset Specifications

### Social Media Images

**X Profile Picture**
- Size: 400x400px
- Format: PNG
- Content: TIPZ logo mark centered
- Background: #000000

**X Banner**
- Size: 1500x500px
- Format: PNG
- Content: "Private tips. Any asset. Zero trace." + subtle branding
- Background: #000000 with gold accent glow

**OG Image**
- Size: 1200x630px
- Format: PNG
- Content: TIPZ logo + tagline
- Used for: Link previews on all platforms
- Background: #000000

**Twitter Card**
- Size: 1200x600px
- Format: PNG
- Content: Product screenshot or key visual
- Used for: Tweet embeds

### Product Screenshots

**Landing Page (Desktop)**
- Size: 1920x1080px or browser window
- Format: PNG
- Show: Full hero section with CTA visible

**Landing Page (Mobile)**
- Size: 390x844px (iPhone 14 Pro)
- Format: PNG
- Show: Mobile hero with navigation

**Registration Form**
- Size: 1200x800px
- Format: PNG
- Show: Form filled with example data (not real address)

**Extension Popup**
- Size: Actual extension size (~320x400px)
- Format: PNG
- Show: Active state with wallet connected

**Tip Button on X.com**
- Size: Crop around tweet with button visible
- Format: PNG
- Show: Gold "Tip" button next to engagement buttons

**Tip Modal**
- Size: Crop around modal
- Format: PNG
- Show: Modal open with amount presets visible

### Demo GIFs

**Full Tip Flow**
- Duration: < 30 seconds
- Size: 800x600px recommended
- Frame rate: 15-30 fps
- Sequence:
  1. Scrolling X timeline
  2. Hovering over tip button
  3. Clicking tip button
  4. Modal opens
  5. Selecting amount
  6. Confirming in wallet (mock)
  7. Success toast

**Creator Registration**
- Duration: < 20 seconds
- Sequence:
  1. Landing on tipz.app
  2. Clicking Register
  3. Filling form (sped up)
  4. Submit
  5. Success message

---

## Brand Assets in Use

### Logo Usage

**Minimum clear space**: Height of the "T" in TIPZ on all sides

**Minimum size**:
- Digital: 24px height
- Print: 0.5 inches height

**Do**:
- Use on dark backgrounds
- Maintain aspect ratio
- Use approved colors only

**Don't**:
- Stretch or distort
- Add effects (shadows, outlines)
- Place on busy backgrounds
- Rotate or flip

### Color Application

**Primary surfaces**: Pure black (#000000)
**CTAs and accents**: Zcash Gold (#F4B728)
**Text on dark**: White (#FFFFFF) or Muted (#888888)

### Typography in Assets

**Headlines**: Inter Semibold (600)
**Body text**: Inter Regular (400)
**Never**: Use fonts outside the Inter family

---

## Asset Storage

**Primary Location**: `/tipz/web/public/`
- logo.svg
- og-image.png
- favicon.ico

**Marketing Assets**: `/tipz/docs/marketing/assets/` (to be created)
- /social/
- /screenshots/
- /videos/

**Design Source Files**: Figma (link TBD)

---

## Production Notes

### Screenshot Capture
- Use browser at 1920x1080 or standard mobile sizes
- Clear browser chrome or use full-screen
- Ensure no sensitive data visible
- Use example data that looks realistic

### GIF Creation
- Use Screen Studio, Kap, or GIPHY Capture
- Optimize for file size (< 5MB for X)
- Consider MP4 for higher quality where supported
- Add subtle zoom on important actions

### Image Optimization
- Run all PNGs through TinyPNG
- Use WebP where supported
- Provide 2x versions for retina

---

## Pending Assets (Priority Order)

1. **OG Image** - Needed for all link sharing
2. **Full tip flow GIF** - Core demo asset
3. **X Profile/Banner** - Brand presence
4. **Extension screenshots** - Store listing
5. **Pitch deck** - Partnership discussions
