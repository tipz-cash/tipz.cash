# TIPZ UX Flows

User journey maps and interaction flows for the TIPZ platform.

---

## Overview

TIPZ has two primary user types:
1. **Creators** - Content creators who register to receive tips (use extension + web)
2. **Tippers** - Users who want to send tips to creators (use web tip pages only)

**Key Distinction**: The browser extension is a **Creator Tool**, not a tipper tool. Tippers use the web app's tip pages at `tipz.cash/{handle}`.

---

## Flow 1: Creator Registration (4-Step Wizard)

### Journey Map

```
Landing Page → /register → Step 1 (Handle) → Step 2 (Wallet) → Step 3 (Tweet) → Step 4 (Success)
```

### Detailed Steps

#### Step 1: Handle Entry
- Creator enters their X handle (with or without @)
- Client validates format
- "Next" button enabled when valid
- Shows real-time validation feedback

#### Step 2: Wallet Setup
- Creator enters their Zcash shielded address
- Supports both formats:
  - Sapling: `zs1...` (78 characters)
  - Unified: `u1...` (variable length)
- Shows address format examples
- Validates on blur

#### Step 3: Tweet Verification
- Shows pre-formatted verification tweet text
- Tweet should contain: handle + shielded address + TIPZ mention
- Creator posts tweet, then pastes URL
- Server validates:
  - URL format matches `https://(x|twitter).com/{handle}/status/{id}`
  - Handle in URL matches registered handle
  - If Twitter API configured: verifies tweet content

#### Step 4: Confirmation
- Server creates/updates registration in Supabase
- Sets `tipz_creator_identity` in localStorage for extension bridge
- Shows success with:
  - Tip page URL: `tipz.cash/{handle}`
  - "Install Extension" CTA
  - "Share on X" button

### Error States

| Error | Message | Recovery |
|-------|---------|----------|
| Invalid handle format | "Please enter a valid X handle (letters, numbers, underscores)" | Fix input |
| Invalid address | "Please enter a valid Zcash shielded address (zs1... or u1...)" | Fix input |
| Tweet URL invalid | "Invalid tweet URL. Please use format: https://x.com/handle/status/..." | Re-enter URL |
| Handle mismatch | "This tweet appears to be from a different account" | Post new tweet |
| Rate limited | "Too many attempts. Please try again in {time}" | Wait |
| Already registered | "Registration updated!" | Success (upsert) |

### Success State

```
✓ You're all set, @{handle}!

Your tip page is live at:
tipz.cash/{handle}

[Copy Link] [Share on X] [Install Extension]
```

---

## Flow 2: Tipping via Web App

### Journey Map

```
Visit tipz.cash/{handle} → Select Amount → Choose Token → Connect Wallet → Confirm → Success
```

### Detailed Steps

#### Step 1: Visit Tip Page
- Tipper visits `tipz.cash/{handle}` (found via X post, bio link, etc.)
- Page loads creator info and TippingFlow component
- Shows creator handle, verification status, privacy badges

#### Step 2: Amount Selection (AmountSelector)
- Preset USD amounts: $1, $5, $10, $25
- Custom amount input for other values
- Real-time conversion to ZEC shown
- Selected amount highlighted

#### Step 3: Private Message (MessageTrench)
- Optional text input for private note
- Shows "ENCRYPTED" badge indicating end-to-end privacy
- Message travels with tip to creator's shielded address

#### Step 4: Token Selection (TokenSelector)
- Dropdown shows supported tokens: ETH, USDC, MATIC, etc.
- Shows user's balance for each token
- Displays current price and estimated cost
- Auto-selects if user has only one token

#### Step 5: Swap Quote
- Client calls `/api/swap/quote` with selected token/amount
- Shows breakdown:
  - ZEC amount creator will receive
  - Network fees
  - Protocol fees (0.5%)
  - Estimated time (5-10 minutes)

#### Step 6: Wallet Connection (WalletConnect)
- "Connect Wallet" button triggers WalletConnect modal
- Supports MetaMask, Rainbow, Coinbase Wallet, etc.
- Shows connected address and balance after connection

#### Step 7: Confirmation (TipSummary)
- Review screen shows:
  - Recipient: @{handle}
  - Amount: X ZEC (~$Y)
  - Your payment: Z TOKEN
  - Fees: $X.XX
- "Send Tip" button (gold gradient, prominent)

#### Step 8: Transaction Processing (TransactionStatus)
- "Confirm in your wallet" prompt
- Spinner with status messages:
  - "Waiting for wallet confirmation..."
  - "Processing swap..."
  - "Creating NEAR Intent..."
  - "Routing to Zcash..."

#### Step 9: Success
- Checkmark animation
- "Tip Sent!" confirmation
- Summary of transaction
- "Share on X" button
- "Tip Again" option

### Error States

| Error | Message | Recovery |
|-------|---------|----------|
| Wallet not connected | "Connect your wallet to continue" | Connect wallet |
| Insufficient balance | "Insufficient {TOKEN} balance" | Reduce amount or switch token |
| Quote expired | "Quote expired. Getting new quote..." | Auto-refresh |
| Transaction rejected | "Transaction cancelled" | Try again |
| Swap failed | "Swap failed. No funds were charged." | Retry |
| Network error | "Network error. Please check your connection." | Retry |

---

## Flow 3: Extension Identity Linking

### Journey Map (New Creator)

```
Register on Web → Extension detects identity → Dashboard unlocked
```

### Detailed Steps

1. Creator completes registration at `/register`
2. Server sets `tipz_creator_identity` in localStorage
3. If extension installed, `tipz-interceptor.tsx` detects new identity
4. Identity synced to `chrome.storage.local`
5. Extension popup shows Creator Dashboard

### Journey Map (Returning Creator)

```
Visit tipz.cash → Enter handle → Verify ownership → Extension re-linked
```

### Detailed Steps

1. Creator visits tipz.cash with extension installed but not linked
2. Clicks "Link Account" (or visits /link page)
3. Enters their registered handle
4. Client calls `POST /api/link` to verify
5. If original tweet still valid, localStorage is set
6. Extension detects and unlocks dashboard

---

## Flow 4: Extension Popup (Creator Dashboard)

**Note**: The extension is a **Creator Tool**. Tippers use the web app.

### States

#### State 1: Not Linked (No Creator Identity)
```
┌────────────────────────────────┐
│  [TIPZ] Creator    ○ Not Linked│
├────────────────────────────────┤
│                                │
│       🛡️ Link Your Account     │
│                                │
│  Register on TIPZ to start    │
│  receiving private tips and   │
│  track your earnings.         │
│                                │
│  ┌──────────────────────────┐ │
│  │      Register Now        │ │
│  └──────────────────────────┘ │
│                                │
│  Already registered?          │
│  Visit tipz.cash to link.     │
│                                │
├────────────────────────────────┤
│  ● Powered by Zcash   GitHub  │
└────────────────────────────────┘
```

#### State 2: Linked (Creator Dashboard)
```
┌────────────────────────────────┐
│  [TIPZ] Creator   ● @username  │
├────────────────────────────────┤
│                                │
│  ┌────────────┐ ┌────────────┐│
│  │TOTAL EARNED│ │   TIPS     ││
│  │  0.2500    │ │     12     ││
│  │    ZEC     │ │  received  ││
│  └────────────┘ └────────────┘│
│                                │
│  ┌──────────────────────────┐ │
│  │      ≈ $10.50 USD        │ │
│  └──────────────────────────┘ │
│                                │
│  RECENT TIPS                   │
│  ┌──────────────────────────┐ │
│  │ Tip received      +0.05  │ │
│  │ Jan 15             ZEC   │ │
│  └──────────────────────────┘ │
│  ┌──────────────────────────┐ │
│  │ Tip received      +0.10  │ │
│  │ Jan 14             ZEC   │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │   ↗ View Tip Page        │ │
│  └──────────────────────────┘ │
│                                │
│      Unlink account           │
│                                │
├────────────────────────────────┤
│  ● Powered by Zcash   GitHub  │
└────────────────────────────────┘
```

#### State 3: Loading
```
┌────────────────────────────────┐
│  [TIPZ] Creator                │
├────────────────────────────────┤
│                                │
│           ◌                    │
│        Loading...              │
│                                │
├────────────────────────────────┤
│  ● Powered by Zcash   GitHub  │
└────────────────────────────────┘
```

---

## Flow 5: Auto-Stamp on X

### Journey Map

```
Open X Compose → Extension injects button → Click to stamp → Link added to tweet
```

### Detailed Steps

1. Creator opens X.com compose box (new tweet, reply, or quote)
2. x.tsx content script detects compose toolbar
3. If creator is linked via extension:
   - Injects AutoStampBadge button into toolbar
4. Creator clicks the TIPZ button (or if auto-stamp enabled, happens automatically)
5. Extension inserts `tipz.cash/{handle}` at end of tweet
6. Shows "TIPZ added ✓" confirmation badge

### States

| Compose State | Button Shown |
|--------------|--------------|
| Creator not linked | No button |
| Creator linked, link not in tweet | Gold "TIPZ" stamp button |
| Creator linked, link already in tweet | Green "TIPZ added ✓" badge |

---

## Flow 6: Creator Address Update

### Journey Map

```
Register Page → Enter Same Handle → New Address → New Tweet → Submit → Updated
```

### Details

- Creators can update their address by re-registering
- System uses upsert: same platform + handle = update
- Must provide a new verification tweet with new address
- Old address immediately replaced
- Extension automatically picks up new identity

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

## Flow 7: Real-Time Tip Notifications

### Journey Map

```
Tip received → Supabase Realtime → Extension background → Browser notification
```

### Detailed Steps

1. Tipper completes tip via web app
2. Transaction logged to Supabase `transactions` table
3. Supabase Realtime broadcasts INSERT event
4. Extension's `background.ts` receives event via WebSocket
5. `handleNewTip()` called:
   - Shows browser notification: "New Tip Received! 🎉 - You received X ZEC"
   - Increments badge count
   - Updates chrome.storage for popup
6. If popup is open, it refreshes to show new tip in list

### Fallback (Polling)

If WebSocket unavailable:
1. `realtime.ts` falls back to 30-second polling
2. Calls `/api/tips/latest?handle={handle}`
3. Compares with last known tip ID
4. Shows notification only for genuinely new tips

---

## Future Flows (Planned)

### Creator Analytics Dashboard
- View tip history with anonymized sender info
- Total earnings over time (daily/weekly/monthly charts)
- Average tip size
- Peak tipping hours

### Multi-Platform Support
- YouTube comment integration
- Twitch stream overlay
- GitHub sponsor alternative
- Farcaster native integration

### Recurring Tips
- Set up monthly tips to favorite creators
- Manage subscriptions from tipper dashboard
- Cancel/pause functionality
