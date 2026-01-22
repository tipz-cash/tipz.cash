# TIPZ Component Library

Reference for all UI components used across the TIPZ web app and browser extension.

All components use the terminal aesthetic with JetBrains Mono font and the amber/black color palette.

---

## Design Tokens

### Colors (JavaScript/TypeScript)

```typescript
const colors = {
  bg: "#0A0A0A",           // True Black - primary background
  surface: "#1A1A1A",      // Surface - cards, elevated elements
  primary: "#F5A623",      // Terminal Amber - CTAs, accents
  primaryHover: "#FFB84D", // Amber Hover - hover states
  success: "#00FF00",      // Matrix Green - success states
  error: "#FF4444",        // Error Red - error states
  muted: "#888888",        // Muted Gray - secondary text
  border: "#333333",       // Border Gray - borders, dividers
  text: "#E0E0E0",         // Phosphor White - primary text
};
```

### Base Styles

```typescript
const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  backgroundColor: colors.bg,
  color: colors.text,
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "14px",
  lineHeight: 1.6,
};

const maxWidthStyle: React.CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 24px",
};

const borderStyle = `1px solid ${colors.border}`;
```

---

## Buttons

### Primary Button

Used for main CTAs (Register, Send Tip, Install Extension).

```tsx
<button
  style={{
    backgroundColor: colors.primary,
    color: colors.bg,
    border: "none",
    padding: "14px 28px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = colors.primaryHover;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = colors.primary;
  }}
>
  I'm a Creator →
</button>
```

**States**:
- Default: `backgroundColor: #F5A623`
- Hover: `backgroundColor: #FFB84D`
- Disabled: `backgroundColor: #888888, cursor: not-allowed`
- Loading: Show spinner, disable interaction

### Secondary Button

Used for secondary actions (See How It Works, Cancel).

```tsx
<button
  style={{
    backgroundColor: "transparent",
    color: colors.text,
    border: `1px solid ${colors.border}`,
    padding: "14px 28px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.2s",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.borderColor = colors.primary;
    e.currentTarget.style.color = colors.primary;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.borderColor = colors.border;
    e.currentTarget.style.color = colors.text;
  }}
>
  See How It Works
</button>
```

### Ghost Button (Link Style)

Used for tertiary actions, inline links.

```tsx
<button
  style={{
    backgroundColor: "transparent",
    color: colors.muted,
    border: "none",
    padding: "0",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "13px",
    cursor: "pointer",
    textDecoration: "underline",
    transition: "color 0.2s",
  }}
  onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
  onMouseLeave={(e) => e.currentTarget.style.color = colors.muted}
>
  See how it works
</button>
```

### Tip Button (Extension)

Terminal-style button injected next to tweets.

```tsx
// Registered creator - clickable
<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 18px",
    borderRadius: 6,
    backgroundColor: colors.bg,
    border: `2px solid ${colors.primary}`,
    color: colors.primary,
    fontWeight: 600,
    fontSize: 14,
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.5px",
    cursor: "pointer",
  }}
>
  [TIP]
</div>

// Hover state
style={{
  backgroundColor: colors.primary,
  color: colors.bg,
  boxShadow: `0 0 24px ${colors.primary}60`,
}}

// Unregistered creator - disabled
<div
  style={{
    padding: "8px 18px",
    borderRadius: 6,
    backgroundColor: "transparent",
    border: `1px solid ${colors.border}`,
    color: colors.muted,
    fontSize: 12,
    cursor: "default",
  }}
>
  Not on TIPZ
</div>
```

---

## Form Elements

### Input Style Constants

```typescript
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  fontSize: "14px",
  backgroundColor: colors.bg,
  color: colors.text,
  border: `1px solid ${colors.border}`,
  borderRadius: "4px",
  fontFamily: "'JetBrains Mono', monospace",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  fontSize: "12px",
  color: colors.muted,
  letterSpacing: "0.5px",
  textTransform: "uppercase",
};
```

### Text Input

```tsx
<div style={{ marginBottom: "20px" }}>
  <label style={labelStyle}>X HANDLE</label>
  <div style={{ position: "relative" }}>
    <span style={{
      position: "absolute",
      left: "16px",
      top: "50%",
      transform: "translateY(-50%)",
      color: colors.muted,
    }}>
      @
    </span>
    <input
      type="text"
      placeholder="yourhandle"
      style={{ ...inputStyle, paddingLeft: "36px" }}
      onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
      onBlur={(e) => e.currentTarget.style.borderColor = colors.border}
    />
  </div>
</div>
```

**States**:
- Default: `border: 1px solid #333333`
- Focus: `border-color: #F5A623`
- Error: `border-color: #FF4444`
- Disabled: `opacity: 0.5, cursor: not-allowed`

### Text Input with Helper Text

```tsx
<div style={{ marginBottom: "20px" }}>
  <label style={labelStyle}>ZCASH SHIELDED ADDRESS</label>
  <input
    type="text"
    placeholder="zs1..."
    style={inputStyle}
  />
  <p style={{ margin: "8px 0 0", fontSize: "12px", color: colors.muted }}>
    Must start with "zs" and be 78 characters.{" "}
    <a href="#" style={{ color: colors.primary, textDecoration: "underline" }}>
      Don't have a wallet?
    </a>
  </p>
</div>
```

### Platform Selection Buttons

```tsx
const buttonStyle = (isActive: boolean): React.CSSProperties => ({
  padding: "10px 20px",
  fontSize: "14px",
  fontWeight: 500,
  color: isActive ? colors.bg : colors.text,
  backgroundColor: isActive ? colors.primary : "transparent",
  border: `1px solid ${isActive ? colors.primary : colors.border}`,
  borderRadius: "4px",
  cursor: "pointer",
  fontFamily: "'JetBrains Mono', monospace",
  transition: "all 0.2s",
});

<div style={{ marginBottom: "20px" }}>
  <label style={labelStyle}>PLATFORM</label>
  <div style={{ display: "flex", gap: "12px" }}>
    <button type="button" style={buttonStyle(true)}>
      X (Twitter)
    </button>
    <button type="button" style={buttonStyle(false)}>
      Substack
    </button>
  </div>
</div>
```

---

## Cards

### Feature Card

Used for architecture/feature highlights on the landing page.

```tsx
<div
  style={{
    border: `1px solid ${colors.border}`,
    padding: "24px",
    backgroundColor: colors.surface,
    transition: "border-color 0.2s",
  }}
  onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.primary}
  onMouseLeave={(e) => e.currentTarget.style.borderColor = colors.border}
>
  <div style={{ fontSize: "24px", marginBottom: "12px" }}>
    []  {/* Terminal-style icon */}
  </div>
  <h3 style={{
    color: colors.text,
    fontSize: "14px",
    fontWeight: 600,
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  }}>
    ZK_SHIELDED
    {/* Optional badge */}
    <span style={{
      fontSize: "10px",
      color: colors.primary,
      border: `1px solid ${colors.primary}`,
      padding: "2px 6px",
      borderRadius: "2px",
    }}>
      COMING SOON
    </span>
  </h3>
  <p style={{ color: colors.muted, fontSize: "13px", margin: 0 }}>
    zk-SNARKs prove transaction validity without revealing sender, receiver, or amount.
  </p>
</div>
```

### Step Card

Used in "How It Works" sections.

```tsx
<div
  style={{
    border: `1px solid ${colors.border}`,
    padding: "32px 24px",
    backgroundColor: colors.surface,
    transition: "border-color 0.2s",
  }}
  onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.primary}
  onMouseLeave={(e) => e.currentTarget.style.borderColor = colors.border}
>
  <div style={{
    color: colors.primary,
    fontSize: "32px",
    fontWeight: 700,
    marginBottom: "16px",
  }}>
    01
  </div>
  <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>
    Register your shielded address
  </h3>
  <p style={{ color: colors.muted, fontSize: "14px", margin: 0 }}>
    Paste your Zcash address and verify ownership with a tweet. No KYC, no middlemen.
  </p>
</div>
```

### Trust Badge Card

Used for status/metrics display.

```tsx
<div style={{
  backgroundColor: colors.bg,
  padding: "20px",
}}>
  <div style={{
    color: colors.muted,
    fontSize: "11px",
    marginBottom: "8px",
    letterSpacing: "0.5px",
  }}>
    PLATFORM_FEE
  </div>
  <div style={{
    fontSize: "20px",
    fontWeight: 600,
    marginBottom: "4px",
    color: colors.success, // Green for "0%"
  }}>
    0%
  </div>
  <div style={{ fontSize: "12px", color: colors.muted }}>
    Network fee only
  </div>
</div>
```

---

## Modals

### Terminal Window Modal

Used for registration forms and tip modals. Features macOS-style traffic lights.

```tsx
<form style={{
  backgroundColor: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  padding: "32px",
}}>
  {/* Terminal-style header */}
  <div style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: `1px solid ${colors.border}`,
  }}>
    {/* Traffic lights */}
    <div style={{ display: "flex", gap: "6px" }}>
      <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#FF5F56" }} />
      <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#FFBD2E" }} />
      <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#27CA40" }} />
    </div>
    <span style={{ color: colors.muted, fontSize: "12px", marginLeft: "8px" }}>
      [TIPZ] // REGISTER
    </span>
  </div>

  {/* Form content */}
  {/* ... */}
</form>
```

### Tip Modal (Extension)

Terminal-styled modal for tipping flow.

```tsx
<div style={{
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  padding: 28,
  width: 380,
  fontFamily: "'JetBrains Mono', monospace",
  boxShadow: `0 20px 60px ${colors.bg}80, 0 0 1px ${colors.primary}40`,
}}>
  {/* Header */}
  <div style={{
    display: "flex",
    alignItems: "center",
    gap: 8,
    paddingBottom: 16,
    borderBottom: `1px solid ${colors.border}`,
    marginBottom: 20,
  }}>
    <div style={{ display: "flex", gap: 6 }}>
      <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#FF5F56" }} />
      <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#FFBD2E" }} />
      <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#27CA40" }} />
    </div>
    <span style={{ color: colors.muted, fontSize: 12, marginLeft: 8 }}>
      [TIPZ] // SEND_TIP
    </span>
  </div>

  {/* Recipient */}
  <div style={{ marginBottom: 20 }}>
    <div style={{ color: colors.muted, fontSize: 11, marginBottom: 8 }}>
      SENDING TO
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: colors.bg,
        fontWeight: 700,
      }}>
        S
      </div>
      <div>
        <div style={{ color: colors.text, fontWeight: 600 }}>@satoshi</div>
        <div style={{ color: colors.muted, fontSize: 12 }}>zs1q8w...x7k9</div>
      </div>
    </div>
  </div>

  {/* Amount Selection */}
  <div style={{ marginBottom: 20 }}>
    <div style={{ color: colors.muted, fontSize: 11, marginBottom: 8 }}>
      SELECT AMOUNT (ZEC)
    </div>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {[0.01, 0.05, 0.1, 0.5, 1].map((amount) => (
        <div
          key={amount}
          style={{
            padding: "10px 16px",
            borderRadius: 6,
            backgroundColor: selectedAmount === amount ? colors.primary : colors.bg,
            border: `1px solid ${selectedAmount === amount ? colors.primary : colors.border}`,
            color: selectedAmount === amount ? colors.bg : colors.text,
            fontWeight: 500,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          {amount}
        </div>
      ))}
    </div>
  </div>

  {/* Confirm Button */}
  <button style={{
    width: "100%",
    padding: 14,
    borderRadius: 6,
    backgroundColor: colors.primary,
    border: "none",
    color: colors.bg,
    fontWeight: 600,
    fontSize: 15,
    fontFamily: "'JetBrains Mono', monospace",
    cursor: "pointer",
  }}>
    Confirm Tip →
  </button>

  {/* Privacy Note */}
  <p style={{
    color: colors.muted,
    fontSize: 11,
    marginTop: 12,
    textAlign: "center",
  }}>
    Powered by Zcash shielding
  </p>
</div>
```

### Success State Modal

```tsx
<div style={{ textAlign: "center", padding: "20px 0" }}>
  <div style={{
    width: 64,
    height: 64,
    borderRadius: "50%",
    backgroundColor: `${colors.success}20`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    border: `2px solid ${colors.success}`,
  }}>
    <span style={{ fontSize: 32, color: colors.success }}>✓</span>
  </div>
  <h3 style={{
    color: colors.text,
    fontSize: 18,
    fontWeight: 600,
    margin: "0 0 8px",
  }}>
    Tip Sent!
  </h3>
  <p style={{ color: colors.muted, fontSize: 14, margin: 0 }}>
    0.1 ZEC to @satoshi
  </p>
  <p style={{
    color: colors.success,
    fontSize: 12,
    marginTop: 12,
  }}>
    Shielded • No trace
  </p>
</div>
```

---

## Alerts & Notifications

### Error Alert (Inline)

```tsx
{status === "error" && (
  <div style={{
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    border: `1px solid ${colors.error}`,
    borderRadius: "4px",
    padding: "12px 16px",
    marginBottom: "20px",
    color: colors.error,
    fontSize: "13px",
  }}>
    {errorMessage}
  </div>
)}
```

### Success Alert (Inline)

```tsx
<div style={{
  backgroundColor: colors.surface,
  border: `1px solid ${colors.success}`,
  borderRadius: "8px",
  padding: "32px",
  textAlign: "center",
}}>
  <div style={{
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    backgroundColor: "rgba(0, 255, 0, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  }}>
    <span style={{ fontSize: "32px", color: colors.success }}>✓</span>
  </div>
  <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 600 }}>
    Registration Successful!
  </h3>
  <p style={{ margin: "0 0 24px", color: colors.muted, fontSize: "14px" }}>
    Your tip page is now active. Start sharing your TIPZ link!
  </p>
</div>
```

### Status Indicator

```tsx
<div style={{
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "24px",
}}>
  <span style={{ color: colors.success }}>●</span>
  <span style={{ color: colors.muted, fontSize: "12px" }}>
    NETWORK_STATUS: OPERATIONAL
  </span>
</div>
```

---

## Loading States

### Spinner

```tsx
<div style={{
  width: 24,
  height: 24,
  border: `2px solid ${colors.primary}`,
  borderTopColor: "transparent",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
}} />
```

### Button Loading State

```tsx
<button
  disabled
  style={{
    width: "100%",
    padding: "16px",
    fontSize: "16px",
    fontWeight: 600,
    color: colors.bg,
    backgroundColor: colors.muted,
    border: "none",
    borderRadius: "4px",
    cursor: "not-allowed",
    fontFamily: "'JetBrains Mono', monospace",
  }}
>
  Registering...
</button>
```

### Processing State (Modal)

```tsx
<div style={{ textAlign: "center", padding: "20px 0" }}>
  <div style={{
    width: 48,
    height: 48,
    border: `3px solid ${colors.primary}`,
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  }} />
  <p style={{ color: colors.muted, fontSize: 14 }}>
    Processing transaction...
  </p>
</div>
```

---

## Navigation

### Header

```tsx
<header style={{
  borderBottom: `1px solid ${colors.border}`,
  padding: "16px 0",
  position: "sticky",
  top: 0,
  backgroundColor: colors.bg,
  zIndex: 100,
}}>
  <div style={{
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}>
    {/* Logo section */}
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <span style={{ color: colors.primary, fontWeight: 700 }}>
        [TIPZ]
      </span>
      <span style={{ color: colors.muted, fontSize: "12px" }}>
        v0.1.0-beta
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: "6px", color: colors.muted, fontSize: "12px" }}>
        <img src="/zec/brandmark-yellow.svg" alt="Zcash" style={{ width: "14px", height: "14px" }} />
        ZEC
      </span>
    </div>

    {/* Navigation */}
    <nav style={{ display: "flex", gap: "24px" }}>
      {["MANIFESTO", "GITHUB", "EXTENSION"].map((item) => (
        <a
          key={item}
          href="#"
          style={{
            color: colors.muted,
            textDecoration: "none",
            fontSize: "12px",
            letterSpacing: "0.5px",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
          onMouseLeave={(e) => e.currentTarget.style.color = colors.muted}
        >
          {item}
        </a>
      ))}
    </nav>
  </div>
</header>
```

### Footer

```tsx
<footer style={{
  padding: "32px 0",
  backgroundColor: colors.bg,
}}>
  <div style={{
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  }}>
    {/* Logo */}
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <span style={{ color: colors.primary, fontWeight: 700 }}>[TIPZ]</span>
      <span style={{ color: colors.muted, fontSize: "12px" }}>v0.1.0-beta</span>
    </div>

    {/* Links */}
    <div style={{ display: "flex", gap: "24px", color: colors.muted, fontSize: "12px" }}>
      {["MANIFESTO", "GITHUB", "X"].map((item) => (
        <a
          key={item}
          href="#"
          style={{ color: colors.muted, textDecoration: "none" }}
          onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
          onMouseLeave={(e) => e.currentTarget.style.color = colors.muted}
        >
          {item}
        </a>
      ))}
    </div>

    {/* Status */}
    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: colors.muted, fontSize: "11px" }}>
      <span style={{ color: colors.success }}>●</span> All systems operational |
      <img src="/zec/brandmark-yellow.svg" alt="Zcash" style={{ width: "12px", height: "12px" }} />
      Powered by Zcash + NEAR Intents
    </div>
  </div>
</footer>
```

---

## Section Components

### Section Header

```tsx
<h2 style={{
  color: colors.primary,
  fontSize: "12px",
  letterSpacing: "1px",
  marginBottom: "32px",
}}>
  // FOR_CREATORS
</h2>
```

### Collapsible Details (For Developers)

```tsx
<details style={{ cursor: "pointer" }}>
  <summary style={{
    color: colors.muted,
    fontSize: "12px",
    letterSpacing: "1px",
    marginBottom: "24px",
    listStyle: "none",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  }}>
    <span style={{ color: colors.primary }}>[+]</span> FOR_DEVELOPERS: Protocol specs & SDK
  </summary>
  <pre style={{
    color: colors.text,
    fontSize: "12px",
    lineHeight: 1.5,
    overflow: "auto",
    margin: "24px 0 0 0",
    padding: "20px",
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: "4px",
    fontFamily: "'JetBrains Mono', monospace",
  }}>
    {techSpecs}
  </pre>
</details>
```

### Comparison Table

```tsx
<table style={{
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "14px",
}}>
  <thead>
    <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
      <th style={{ padding: "16px", textAlign: "left", color: colors.muted, fontWeight: 500 }}>Feature</th>
      <th style={{ padding: "16px", textAlign: "center", color: colors.primary, fontWeight: 600 }}>TIPZ</th>
      <th style={{ padding: "16px", textAlign: "center", color: colors.muted, fontWeight: 500 }}>Ko-fi</th>
      <th style={{ padding: "16px", textAlign: "center", color: colors.muted, fontWeight: 500 }}>Buy Me a Coffee</th>
    </tr>
  </thead>
  <tbody>
    <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
      <td style={{ padding: "16px", color: colors.text }}>Platform fee</td>
      <td style={{ padding: "16px", textAlign: "center", color: colors.success, fontWeight: 600 }}>0%</td>
      <td style={{ padding: "16px", textAlign: "center", color: colors.muted }}>5%</td>
      <td style={{ padding: "16px", textAlign: "center", color: colors.muted }}>5%</td>
    </tr>
  </tbody>
</table>
```

---

## Special Components

### ASCII Art Logo

```tsx
const ASCII_LOGO = `
                     ██
████████╗██╗██████╗███████╗
╚══██╔══╝██║██╔══██╗╚═███╔╝
   ██║   ██║██████╔╝ ███╔╝
   ██║   ██║██╔═══╝ ███╔╝
   ██║   ██║██║    ███╔╝
   ╚═╝   ╚═╝╚═╝   ███████╗
                     ██
`;

<pre style={{
  color: colors.primary,
  fontSize: "10px",
  lineHeight: 1.2,
  marginBottom: "32px",
  fontFamily: "'JetBrains Mono', monospace",
}}>
  {ASCII_LOGO}
</pre>
```

### Typing Effect Hero

```tsx
function useTypingEffect(text: string, speed: number = 50) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let index = 0;
    setDisplayText("");
    setIsComplete(false);

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayText, isComplete };
}

// Usage
const heroText = "Get tipped. Stay private. No fees.";
const { displayText, isComplete } = useTypingEffect(heroText, 40);

<div style={{ marginBottom: "24px" }}>
  <span style={{ color: colors.success }}>{">"}</span>{" "}
  <span style={{ fontSize: "24px", fontWeight: 600 }}>
    {displayText}
    <Cursor visible={!isComplete} />
  </span>
</div>
```

### Blinking Cursor

```tsx
function Cursor({ visible }: { visible: boolean }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setShow((s) => !s), 530);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;
  return (
    <span style={{ color: colors.primary, opacity: show ? 1 : 0 }}>█</span>
  );
}
```

---

## Animation Classes (CSS)

```css
/* Spinner animation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Cursor blink */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Pulse glow */
@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px rgba(245, 166, 35, 0.3); }
  50% { box-shadow: 0 0 40px rgba(245, 166, 35, 0.5); }
}
```

---

## Grid Layout Patterns

### Feature Grid

```tsx
<div style={{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "24px",
}}>
  {features.map((feature) => (
    <FeatureCard key={feature.title} {...feature} />
  ))}
</div>
```

### Stats Grid

```tsx
<div style={{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "1px",
  backgroundColor: colors.border,
  border: `1px solid ${colors.border}`,
}}>
  {stats.map((stat) => (
    <StatCard key={stat.label} {...stat} />
  ))}
</div>
```
