# TIPZ Support Guide

FAQ and troubleshooting for users.

---

## Frequently Asked Questions

### General

**What is TIPZ?**
TIPZ is a private micro-tipping platform for creators. Tips arrive in a Zcash shielded address where transaction details are encrypted by default.

**Is TIPZ free?**
Yes. TIPZ charges 0% platform fees. The only costs are blockchain network fees and swap fees (typically < 1%) for converting tokens.

**Why Zcash?**
Zcash has the most battle-tested privacy technology in crypto. Shielded transactions encrypt the sender, receiver, and amount — something transparent blockchains like Ethereum can't do.

---

### For Creators

**How do I register?**
1. Go to tipz.cash/register
2. Sign in with your X (Twitter) account
3. Enter your Zcash unified address (starts with `u1`)
4. Done — your tip page is live at tipz.cash/yourhandle

**Where do I get a Zcash unified address?**
Download a Zcash wallet that supports unified addresses:
- **Zashi** (mobile): Official Zcash wallet by ECC
- **Ywallet** (mobile): Community wallet
- **Zecwallet Lite** (desktop): Full-featured desktop wallet

When creating a new address, select "unified" — it starts with `u1`.

**Can I change my address later?**
Yes. Go through registration again with the same X account. Your new address will replace the old one.

**How do I see my tips?**
Log in to your dashboard at tipz.cash/my. You'll see real-time earnings, tip history, and encrypted messages from supporters.

**How do I know when I receive a tip?**
Your dashboard at tipz.cash/my shows real-time notifications via WebSocket. Tips also appear in your Zcash wallet once the swap completes.

---

### For Tippers

**How do I tip someone?**
1. Go to tipz.cash/{creatorhandle}
2. Select an amount
3. Choose your payment token (ETH, USDC, USDT, or SOL)
4. Connect your wallet
5. Confirm the transaction

**What wallets are supported?**
- **MetaMask, Rabby, Coinbase Wallet** — for ETH, USDC, USDT
- **Phantom** — for SOL

**What tokens can I use?**
ETH, USDC (on Ethereum, Polygon, Arbitrum, Optimism), USDT (Ethereum), and SOL. TIPZ automatically swaps your token to ZEC via NEAR Intents.

**Are my tips really private?**
Yes. Tips are sent to Zcash shielded addresses where the sender, receiver, and amount are all encrypted on-chain.

**Do I need to create an account?**
No. Just connect your wallet and tip. No account or signup required.

---

### Technical Issues

**Registration is failing**
- Make sure your address starts with `u1` and is 141+ characters (Zcash unified address)
- Make sure you're signed into the correct X account
- Try clearing cookies and signing in again

**Tip transaction failed**
Possible causes:
1. **Insufficient balance** — check your wallet has enough tokens plus gas
2. **Network congestion** — try again in a few minutes
3. **Quote expired** — quotes are valid for ~10 minutes, refresh and try again

Your funds are safe — failed swaps don't charge you (funds stay in your wallet or refund).

**Creator shows as not registered**
- Registration may take a minute to propagate
- Check for typos in the handle
- Creator may need to re-register

---

## Troubleshooting Flowcharts

### Tip Not Received

```
Tip shows as sent in your wallet?
├─ No → Transaction may still be pending, check wallet history
└─ Yes → Check correct Zcash wallet
         ├─ Wrong wallet → Verify registered address at tipz.cash/my
         └─ Correct wallet → Wallet fully synced?
                            └─ Run wallet sync/rescan (shielded txs need full sync)
```

---

## Contact

- Twitter: [@tipaborrem](https://x.com/tipaborrem)
- Documentation: tipz.cash/docs
- GitHub: github.com/tipz-cash/tipz.cash
