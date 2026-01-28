# Creator Onboarding Guide

Get set up to receive private tips from your audience in under 10 minutes.

## Overview

TIPZ lets your audience support you with cryptocurrency that arrives privately to your wallet. No one—not platforms, not governments, not even us—can see who sent you tips or how much you received.

**What you'll set up:**
1. A Zcash wallet with a shielded address
2. Your TIPZ creator profile
3. (Optional) The browser extension for auto-stamping

---

## Step 1: Get a Shielded Address

Your shielded address is where tips arrive. It starts with `u1` or `zs1` and provides full transaction privacy.

### Option A: Zashi (Recommended for Mobile)

[Zashi](https://electriccoin.co/zashi/) is the official Zcash wallet from Electric Coin Co.

1. Download Zashi from [App Store](https://apps.apple.com/app/zashi-zcash-wallet/id1673020149) or [Google Play](https://play.google.com/store/apps/details?id=co.electriccoin.zashi)
2. Create a new wallet (or restore from seed phrase)
3. **IMPORTANT:** Write down your 24-word recovery phrase and store it safely
4. Tap your address at the top to reveal your **Unified Address** (starts with `u1`)
5. Copy this address—you'll need it for registration

### Option B: Ywallet (All Platforms)

[Ywallet](https://ywallet.app/) works on iOS, Android, Windows, macOS, and Linux.

1. Download from [ywallet.app](https://ywallet.app/)
2. Create a new account
3. **IMPORTANT:** Back up your seed phrase
4. Go to Receive → Unified Address
5. Copy the address starting with `u1`

### Option C: Hardware Wallet (Most Secure)

For maximum security, use a Ledger with [Zecwallet Lite](https://zecwallet.co/):

1. Install ZCash app on your Ledger
2. Connect with Zecwallet Lite
3. Generate a shielded address

---

## Step 2: Register on TIPZ

1. Go to [tipz.cash/register](https://tipz.cash/register)

2. **Enter your X handle** (without the @)
   - Example: If you're @cryptoqueen, enter `cryptoqueen`

3. **Paste your shielded address**
   - Must start with `u1` (unified) or `zs1` (sapling)
   - This is where tips will be sent

4. **Post the verification tweet**
   - TIPZ generates a unique tweet for you to post
   - This proves you own the X account
   - The tweet looks like: `Verifying my TIPZ tip page: tipz.cash/cryptoqueen`

5. **Click Verify**
   - TIPZ checks that you posted the tweet
   - Your profile goes live at `tipz.cash/yourhandle`

### Verification Troubleshooting

**Tweet not found?**
- Make sure the tweet is public (not protected account)
- Wait 30 seconds and try again
- The tweet must contain the exact verification text

**Address rejected?**
- Only shielded addresses work (start with `u1` or `zs1`)
- Transparent addresses (start with `t1`) don't provide privacy

---

## Step 3: Share Your Tip Link

Your profile is live at: `tipz.cash/yourhandle`

**Ways to share:**

1. **In your X bio:** Add `tipz.cash/yourhandle` to your profile
2. **In tweets:** Mention your tip link in relevant posts
3. **In pinned tweet:** Pin a tweet explaining how to tip you
4. **QR code:** Your profile page has a QR code tippers can scan

### Example bio text:
```
Support my work privately: tipz.cash/yourhandle
```

### Example pinned tweet:
```
If my content helps you, you can now tip me privately with crypto.

No platform fees. No surveillance. Just direct support.

tipz.cash/yourhandle
```

---

## Step 4 (Optional): Install the Browser Extension

The TIPZ extension automatically adds your tip link to your posts and notifies you when tips arrive.

### Features:
- **Auto-Stamp:** Adds your tip link to new posts
- **Tip Alerts:** Browser notifications when you receive tips
- **Dashboard:** See your earnings at a glance

### Installation:

1. Download from Chrome Web Store (coming soon) or load unpacked:
   - Clone the repo and run `npm run build` in `/extension`
   - Go to `chrome://extensions`
   - Enable Developer Mode
   - Click "Load unpacked" and select the `build/chrome-mv3-prod` folder

2. **Link your identity:**
   - Visit [tipz.cash](https://tipz.cash) while the extension is installed
   - The extension detects your registered identity
   - Your dashboard shows your creator status

3. **Enable Auto-Stamp:**
   - Click the extension icon
   - Toggle "Auto-Stamp" on
   - New posts will include your tip link

---

## Step 5: Test It Out

Before promoting your tip page, send yourself a test tip:

1. Go to your profile: `tipz.cash/yourhandle`
2. Connect a wallet (MetaMask, Rabby, or Phantom)
3. Select $1 and your payment token (ETH, USDC, or SOL)
4. Confirm the transaction
5. Check your Zashi/Ywallet—the ZEC should arrive within a few minutes

**Note:** The first tip may take up to 10 minutes to confirm. Subsequent tips are faster.

---

## How Tipping Works

When someone tips you:

1. They visit `tipz.cash/yourhandle`
2. They connect their crypto wallet (MetaMask, Phantom, etc.)
3. They select an amount and pay with ETH, USDC, SOL, or other tokens
4. NEAR Intents automatically swaps their payment to ZEC
5. The ZEC arrives at your shielded address
6. **No one can see the sender, amount, or recipient on-chain**

### Privacy Guarantees

| What's visible | To whom |
|----------------|---------|
| Tip amount | Only you (in your wallet) |
| Sender identity | Nobody (shielded) |
| Your total earnings | Only you |
| That you have a TIPZ page | Public (your choice to share) |

---

## FAQ

### What if someone sends ZEC directly to my address?

That works too! Your shielded address accepts direct ZEC transfers from any wallet. The QR code on your profile makes this easy.

### Do I need to cash out to fiat?

Not necessarily. You can:
- Hold ZEC long-term
- Send to exchanges that support ZEC (Kraken, Gemini)
- Use ZEC at merchants that accept it
- Swap to other crypto via decentralized exchanges

### Is there a fee?

TIPZ charges 0% platform fees. The only costs are:
- Network gas fees (paid by the tipper)
- Exchange swap fees (typically <0.5%, handled by NEAR Intents)

### What tokens can tippers use?

Currently supported:
- ETH (Ethereum)
- USDC (Ethereum, Polygon, Arbitrum, Optimism)
- USDT (Ethereum)
- SOL (Solana)
- ZEC (direct—no swap needed)

### How do I update my address?

Contact support or re-register with the new address. We're building self-service address updates.

---

## Support

- **Issues:** [github.com/defi-naly/tipz/issues](https://github.com/defi-naly/tipz/issues)
- **X:** [@tipz_cash](https://x.com/tipz_cash)
- **Email:** hello@tipz.cash

---

## What's Next

Once you're set up:

1. **Promote your tip link** in your bio and content
2. **Engage with tippers** (even though tips are private, you can thank your audience generally)
3. **Track your earnings** in your wallet or extension dashboard
4. **Tell other creators** about TIPZ—privacy-first support benefits everyone
