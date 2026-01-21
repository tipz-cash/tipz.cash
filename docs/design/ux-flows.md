# TIPZ UX Flows

User journey maps and interaction flows for the TIPZ platform.

---

## Overview

TIPZ has two primary user types:
1. **Creators** - Content creators who register to receive tips
2. **Tippers** - Users who want to send tips to creators

---

## Flow 1: Creator Registration

### Journey Map

```
Landing Page → Register Page → Form Completion → Tweet Verification → Success
```

### Detailed Steps

#### Step 1: Discovery
- User lands on tipz.app
- Sees hero: "Private tips. Any asset. Zero trace."
- Scrolls to see features and how it works
- Clicks "Register as Creator" CTA

#### Step 2: Platform Selection
- User arrives at /register
- Chooses platform: X (Twitter) or Substack
- UI updates to show platform-specific fields

#### Step 3: Form Completion

**For X (Twitter):**
1. Enter X handle (e.g., @username)
2. Enter Zcash shielded address (zs...)
3. Enter verification tweet URL

**For Substack:**
1. Enter Substack subdomain (e.g., username.substack.com)
2. Enter Zcash shielded address (zs...)
3. Enter verification tweet URL (still uses Twitter for verification)

#### Step 4: Tweet Verification
- User must post a tweet containing their TIPZ address
- Format: "Registering for @TIPZ_app: zs1..."
- User pastes tweet URL into form

#### Step 5: Submission
- Form validates all fields
- API checks tweet exists and matches handle
- On success: Show confirmation
- On error: Show specific error message

### Error States

| Error | Message | Recovery |
|-------|---------|----------|
| Invalid handle format | "Please enter a valid X handle (e.g., @username)" | Fix input |
| Invalid address | "Please enter a valid Zcash shielded address starting with 'zs'" | Fix input |
| Tweet not found | "We couldn't find that tweet. Please check the URL." | Re-enter URL |
| Tweet doesn't match handle | "That tweet appears to be from a different account." | Post new tweet |
| Already registered | "This handle is already registered. Your address has been updated." | Success (upsert) |

### Success State

```
✓ You're all set!

Your X handle @username is now registered on TIPZ.
Anyone can tip you at your shielded address.

[Install Extension] [Share on Twitter]
```

---

## Flow 2: Tipping on X (Twitter)

### Journey Map

```
Browse X → See Tip Button → Click Tip → Select Amount → Confirm Transaction → Success
```

### Detailed Steps

#### Step 1: Browsing
- User has TIPZ extension installed
- User browses X.com normally
- Extension scans visible tweets

#### Step 2: Button Injection
- For each tweet, extension checks if author is registered
- **Registered**: Shows gold "Tip" button
- **Not registered**: Shows muted "Not on TIPZ" button

#### Step 3: Initiate Tip
- User clicks "Tip" button on a tweet
- Modal appears with creator info

#### Step 4: Amount Selection
- Modal shows preset amounts: 0.01, 0.05, 0.1, 0.5, 1 ZEC
- User can also enter custom amount
- Shows estimated USD value

#### Step 5: Payment Method
- User selects payment token (ETH, USDC, SOL, etc.)
- SwapKit calculates swap rate to ZEC
- Shows total cost including fees

#### Step 6: Wallet Connection
- If not connected, prompts wallet connection
- Supports MetaMask, WalletConnect, etc.
- Shows connected wallet address

#### Step 7: Transaction Confirmation
- Review screen shows:
  - Recipient: @username
  - Amount: X ZEC
  - Your payment: Y TOKEN
  - Swap fee: Z%
- User clicks "Confirm"

#### Step 8: Processing
- Shows spinner: "Processing your tip..."
- Wallet prompts for signature
- Swap executes (any-token → ZEC)
- ZEC sent to shielded address

#### Step 9: Success
- Toast notification: "Tip sent! 0.1 ZEC to @username"
- Optional: Share on Twitter

### Error States

| Error | Message | Recovery |
|-------|---------|----------|
| Wallet not connected | "Please connect your wallet to continue" | Connect wallet |
| Insufficient balance | "Insufficient ETH balance for this tip" | Reduce amount or add funds |
| Swap failed | "Swap failed. Your funds have not been charged." | Retry |
| Transaction rejected | "Transaction cancelled" | Retry |
| Network error | "Network error. Please try again." | Retry |

---

## Flow 3: Tipping on Substack

### Journey Map

Same as X flow, but triggered on Substack article pages.

### Differences

- Button appears near author byline
- Creator lookup uses Substack subdomain
- Same payment flow once initiated

---

## Flow 4: Extension Popup

### States

#### State 1: Not on Supported Site
```
┌────────────────────────┐
│  TIPZ                  │
│                        │
│  Visit X or Substack   │
│  to start tipping      │
│  creators.             │
│                        │
│  [Go to X] [Register]  │
└────────────────────────┘
```

#### State 2: On Supported Site (Not Connected)
```
┌────────────────────────┐
│  TIPZ                  │
│                        │
│  ● Active on X.com     │
│                        │
│  Connect wallet to     │
│  start tipping.        │
│                        │
│  [Connect Wallet]      │
│                        │
│  [Register as Creator] │
└────────────────────────┘
```

#### State 3: On Supported Site (Connected)
```
┌────────────────────────┐
│  TIPZ                  │
│                        │
│  ● Active on X.com     │
│                        │
│  Wallet: 0x1234...5678 │
│  Balance: 0.5 ETH      │
│                        │
│  Tips Sent: 12         │
│  Total: 2.5 ZEC        │
│                        │
│  [Settings] [Help]     │
└────────────────────────┘
```

---

## Flow 5: Creator Address Update

### Journey Map

```
Register Page → Enter Same Handle → New Address → Submit → Updated
```

### Details

- Creators can update their address by re-registering
- System uses upsert: same handle = update, new handle = create
- Must still provide valid verification tweet
- Old address immediately replaced

---

## Micro-Interactions

### Tip Button Hover
- Slight scale up (1.05x)
- Subtle glow effect
- 200ms transition

### Modal Open
- Fade in backdrop (300ms)
- Scale up modal from 0.95 to 1 (200ms)
- Focus trap enabled

### Modal Close
- Fade out (200ms)
- Can close via: X button, click backdrop, Escape key

### Amount Selection
- Click highlights selected button
- Custom input clears preset selection
- Amount updates in real-time

### Transaction Processing
- Spinner animation
- Pulsing glow on modal
- Disable all inputs
- No close allowed during processing

### Success Toast
- Slide in from right (300ms)
- Auto-dismiss after 5 seconds
- Click to dismiss early

---

## Accessibility Considerations

### Keyboard Navigation
- All interactive elements focusable
- Tab order follows visual order
- Enter/Space activates buttons
- Escape closes modals

### Screen Readers
- Meaningful alt text for icons
- Aria labels on buttons
- Live regions for dynamic content
- Role="dialog" on modals

### Color Contrast
- All text meets WCAG AA (4.5:1)
- Focus indicators visible
- Don't rely solely on color

### Motion
- Respect prefers-reduced-motion
- Provide alternative for animations
- Avoid vestibular triggers

---

## Future Flows (Planned)

### Creator Dashboard
- View tip history
- Total earnings
- Analytics (anonymous)

### Recurring Tips
- Set up monthly tips
- Manage subscriptions

### Tip Chains
- Tip and share to X
- Recipients can pass it forward
