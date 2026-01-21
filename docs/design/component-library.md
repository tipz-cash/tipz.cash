# TIPZ Component Library

Reference for all UI components used across the TIPZ web app and browser extension.

---

## Buttons

### Primary Button

Used for main CTAs (Register, Send Tip, Connect Wallet).

```tsx
<button className="bg-[#F4B728] text-black px-6 py-3 rounded-lg font-medium hover:bg-[#d9a423] transition-colors">
  Primary Action
</button>
```

**States**:
- Default: `bg-[#F4B728]`
- Hover: `bg-[#d9a423]`
- Disabled: `bg-[#F4B728]/50 cursor-not-allowed`
- Loading: Show spinner, disable interaction

### Secondary Button

Used for secondary actions (Cancel, Learn More).

```tsx
<button className="border border-[#888] text-white px-6 py-3 rounded-lg font-medium hover:border-[#F4B728] hover:text-[#F4B728] transition-colors">
  Secondary Action
</button>
```

### Ghost Button

Used for tertiary actions, links within content.

```tsx
<button className="text-[#F4B728] underline hover:text-[#d9a423] transition-colors">
  Ghost Action
</button>
```

### Tip Button (Extension)

Injected next to tweets/articles.

```tsx
// Registered creator
<button className="tipz-tip-btn bg-[#F4B728] text-black px-3 py-1 rounded text-sm font-medium">
  Tip
</button>

// Unregistered creator
<button className="tipz-tip-btn bg-transparent border border-[#888] text-[#888] px-3 py-1 rounded text-sm cursor-default">
  Not on TIPZ
</button>
```

---

## Form Elements

### Text Input

```tsx
<input
  type="text"
  placeholder="@username"
  className="w-full bg-black border border-[#333] rounded-lg px-4 py-3 text-white placeholder-[#888] focus:border-[#F4B728] focus:outline-none transition-colors"
/>
```

**States**:
- Default: `border-[#333]`
- Focus: `border-[#F4B728]`
- Error: `border-red-500`
- Disabled: `opacity-50 cursor-not-allowed`

### Textarea

```tsx
<textarea
  placeholder="Enter your message..."
  rows={4}
  className="w-full bg-black border border-[#333] rounded-lg px-4 py-3 text-white placeholder-[#888] focus:border-[#F4B728] focus:outline-none transition-colors resize-none"
/>
```

### Select Dropdown

```tsx
<select className="w-full bg-black border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#F4B728] focus:outline-none">
  <option value="">Select platform</option>
  <option value="x">X (Twitter)</option>
  <option value="substack">Substack</option>
</select>
```

### Radio Group

```tsx
<div className="flex gap-4">
  <label className="flex items-center gap-2 cursor-pointer">
    <input type="radio" name="platform" value="x" className="accent-[#F4B728]" />
    <span className="text-white">X (Twitter)</span>
  </label>
  <label className="flex items-center gap-2 cursor-pointer">
    <input type="radio" name="platform" value="substack" className="accent-[#F4B728]" />
    <span className="text-white">Substack</span>
  </label>
</div>
```

---

## Cards

### Feature Card

Used on landing page for feature highlights.

```tsx
<div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 hover:border-[#F4B728]/50 transition-colors">
  <div className="text-[#F4B728] text-2xl mb-4">🔒</div>
  <h3 className="text-white text-xl font-semibold mb-2">Feature Title</h3>
  <p className="text-[#888] text-sm">Feature description goes here.</p>
</div>
```

### Creator Card

Display registered creator info.

```tsx
<div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 flex items-center gap-4">
  <div className="w-12 h-12 bg-[#333] rounded-full flex items-center justify-center">
    <span className="text-[#F4B728]">@</span>
  </div>
  <div>
    <div className="text-white font-medium">@username</div>
    <div className="text-[#888] text-sm">Registered on TIPZ</div>
  </div>
</div>
```

---

## Modals

### Base Modal

```tsx
<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
  <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 max-w-md w-full mx-4">
    <h2 className="text-white text-xl font-semibold mb-4">Modal Title</h2>
    <div className="text-[#888] mb-6">Modal content goes here.</div>
    <div className="flex gap-3 justify-end">
      <button className="border border-[#888] text-white px-4 py-2 rounded-lg">Cancel</button>
      <button className="bg-[#F4B728] text-black px-4 py-2 rounded-lg">Confirm</button>
    </div>
  </div>
</div>
```

### Tip Modal (Extension)

```tsx
<div className="tipz-modal bg-[#1a1a1a] border border-[#333] rounded-xl p-6 w-80">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-white font-semibold">Tip @username</h3>
    <button className="text-[#888] hover:text-white">&times;</button>
  </div>

  {/* Amount presets */}
  <div className="grid grid-cols-4 gap-2 mb-4">
    {[0.01, 0.05, 0.1, 0.5].map(amount => (
      <button className="bg-[#333] text-white py-2 rounded hover:bg-[#F4B728] hover:text-black transition-colors">
        {amount} ZEC
      </button>
    ))}
  </div>

  {/* Custom amount */}
  <input
    type="number"
    placeholder="Custom amount"
    className="w-full bg-black border border-[#333] rounded px-3 py-2 text-white mb-4"
  />

  {/* Send button */}
  <button className="w-full bg-[#F4B728] text-black py-3 rounded-lg font-medium">
    Send Tip
  </button>
</div>
```

---

## Alerts & Notifications

### Toast Notification

```tsx
<div className="fixed bottom-4 right-4 bg-[#1a1a1a] border border-[#333] rounded-lg p-4 flex items-center gap-3 shadow-xl">
  <div className="text-green-500">✓</div>
  <div className="text-white">Tip sent successfully!</div>
</div>
```

**Variants**:
- Success: `border-green-500/50` with green check
- Error: `border-red-500/50` with red X
- Info: `border-[#F4B728]/50` with gold info icon

### Inline Alert

```tsx
<div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
  Error message goes here.
</div>
```

---

## Loading States

### Spinner

```tsx
<div className="animate-spin rounded-full h-6 w-6 border-2 border-[#F4B728] border-t-transparent" />
```

### Skeleton

```tsx
<div className="animate-pulse bg-[#333] rounded h-4 w-full" />
```

### Button Loading

```tsx
<button disabled className="bg-[#F4B728]/50 text-black px-6 py-3 rounded-lg font-medium flex items-center gap-2">
  <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
  Processing...
</button>
```

---

## Navigation

### Header

```tsx
<header className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-b border-[#333] z-50">
  <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
    <div className="text-[#F4B728] text-xl font-semibold">TIPZ</div>
    <nav className="flex gap-6">
      <a href="#features" className="text-[#888] hover:text-white transition-colors">Features</a>
      <a href="#how" className="text-[#888] hover:text-white transition-colors">How it Works</a>
      <a href="/register" className="bg-[#F4B728] text-black px-4 py-2 rounded-lg font-medium">Register</a>
    </nav>
  </div>
</header>
```

### Footer

```tsx
<footer className="border-t border-[#333] py-12">
  <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
    <div className="text-[#888] text-sm">© 2026 TIPZ. All rights reserved.</div>
    <div className="flex gap-6">
      <a href="#" className="text-[#888] hover:text-[#F4B728]">Twitter</a>
      <a href="#" className="text-[#888] hover:text-[#F4B728]">GitHub</a>
      <a href="#" className="text-[#888] hover:text-[#F4B728]">Discord</a>
    </div>
  </div>
</footer>
```

---

## Extension-Specific Components

### Extension Popup

```tsx
<div className="w-80 bg-black p-6">
  <div className="text-[#F4B728] text-xl font-semibold mb-4">TIPZ</div>
  <p className="text-[#888] text-sm mb-6">Private tips for creators on X and Substack.</p>

  {/* Status */}
  <div className="bg-[#1a1a1a] rounded-lg p-4 mb-4">
    <div className="text-white text-sm font-medium">Extension Active</div>
    <div className="text-[#888] text-xs">Monitoring supported sites</div>
  </div>

  {/* Links */}
  <div className="space-y-2">
    <a href="https://tipz.app" className="block text-[#F4B728] text-sm hover:underline">
      Register as Creator →
    </a>
    <a href="https://tipz.app/help" className="block text-[#888] text-sm hover:text-white">
      Help & Support
    </a>
  </div>
</div>
```

---

## Animation Classes

```css
/* Fade in from bottom */
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Pulse glow */
.animate-glow {
  animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px rgba(244, 183, 40, 0.3); }
  50% { box-shadow: 0 0 40px rgba(244, 183, 40, 0.5); }
}

/* Slide in from right */
.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```
