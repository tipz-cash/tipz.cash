# TIPZ Support Guide

FAQ and troubleshooting documentation for users and support team.

---

## Frequently Asked Questions

### General

**What is TIPZ?**
TIPZ is a private micro-tipping platform for creators. It allows anyone to send tips that arrive in a Zcash shielded address, where transaction details are encrypted by default.

**Is TIPZ free?**
Yes. TIPZ charges 0% platform fees. The only costs are blockchain network fees and swap fees (typically < 1%) for converting tokens.

**Is it legal?**
Yes. Zcash is legal in all major jurisdictions. Privacy is not illegal. TIPZ is a legitimate payment tool for creator support.

**Why Zcash?**
Zcash has the most battle-tested privacy technology in crypto. Shielded transactions encrypt the sender, receiver, and amount—something transparent blockchains like Ethereum can't do.

---

### For Creators

**How do I register?**
1. Go to tipz.app/register
2. Select your platform (X or Substack)
3. Enter your handle
4. Enter your Zcash shielded address (starts with `zs`)
5. Post a verification tweet and paste the URL
6. Submit

**Where do I get a Zcash shielded address?**
Download a Zcash wallet that supports shielded addresses:
- **Zashi** (mobile): Official Zcash wallet by ECC
- **Ywallet** (mobile): Community wallet
- **Zecwallet Lite** (desktop): Full-featured desktop wallet

When creating a new address, make sure to select "shielded" or "z-address" (starts with `zs`).

**Can I change my address later?**
Yes. Simply go through the registration process again with the same handle. Your new address will replace the old one.

**How do I know when I receive a tip?**
Check your Zcash wallet. Tips will appear as incoming shielded transactions. Note: shielded transactions may take a few minutes to confirm.

**Do I need to pay taxes on tips?**
Tax requirements vary by jurisdiction. Consult a tax professional. TIPZ does not report transactions to tax authorities.

**What if someone impersonates me?**
Registration requires a verification tweet from the account being registered. If you believe someone has fraudulently registered your handle, contact us.

---

### For Tippers

**How do I install the extension?**
1. Go to Chrome Web Store (link TBD)
2. Click "Add to Chrome"
3. Confirm installation
4. The extension will automatically work on X.com and Substack

**How do I tip someone?**
1. Browse X.com or Substack normally
2. Look for the gold "Tip" button next to posts/articles
3. Click the button
4. Select an amount
5. Confirm in your wallet

**What if there's no Tip button?**
If you see "Not on TIPZ" instead, the creator hasn't registered yet. You can share tipz.app with them so they can register.

**What tokens can I use?**
You can tip with any major token (ETH, USDC, SOL, etc.). TIPZ automatically swaps your token to ZEC before sending to the creator.

**Are my tips really private?**
Yes. Tips are sent to Zcash shielded addresses where:
- Your identity is encrypted
- The creator's balance is encrypted
- The amount is encrypted

Only you and the creator know the details.

**Do I need to create an account?**
No. TIPZ is account-free. You just need a crypto wallet to send tips.

---

### Technical Issues

**The extension isn't showing tip buttons**

Try these steps:
1. Make sure you're on x.com (not twitter.com)
2. Refresh the page
3. Disable and re-enable the extension
4. Check if the extension is up to date

If issues persist, try removing and reinstalling the extension.

**Registration is failing**

Check these common issues:
1. **Invalid address**: Make sure your address starts with `zs` and is exactly 78 characters
2. **Tweet URL format**: Must be a direct link to a tweet (not a quote tweet or reply)
3. **Wrong account**: The tweet must be from the account you're registering
4. **Tweet not found**: Make sure the tweet is public and not deleted

**Tip transaction failed**

Possible causes:
1. **Insufficient balance**: Check your wallet has enough tokens
2. **Network congestion**: Try again in a few minutes
3. **Swap failed**: The token pair may have low liquidity

Your funds are safe—failed swaps don't charge you.

**Creator shows as "Not on TIPZ" but they registered**

This can happen if:
1. Registration is very recent (wait 1-2 minutes)
2. Handle has different casing (we're case-insensitive, but check for typos)
3. There was a registration error (creator should try again)

---

## Troubleshooting Flowcharts

### Extension Not Working

```
Extension installed?
├─ No → Install from Chrome Web Store
└─ Yes → Extension enabled?
         ├─ No → Enable in chrome://extensions
         └─ Yes → On supported site (x.com, *.substack.com)?
                  ├─ No → Navigate to supported site
                  └─ Yes → Try hard refresh (Ctrl+Shift+R)
                           └─ Still not working → Reinstall extension
```

### Registration Failing

```
Error: "Invalid shielded address"
└─ Address starts with zs and is 78 chars?
   ├─ No → Get correct address from wallet
   └─ Yes → Copy address directly from wallet (no manual typing)

Error: "Invalid tweet URL"
└─ URL format: https://x.com/username/status/123456789
   ├─ No → Get correct tweet URL
   └─ Yes → Tweet is from account being registered?
            ├─ No → Post from correct account
            └─ Yes → Tweet is public?
                     └─ No → Make tweet public
```

### Tip Not Received

```
Tip shows as sent?
├─ No → Check wallet transaction history
│       └─ Transaction pending → Wait for confirmation
└─ Yes → Check correct Zcash wallet
         ├─ Wrong wallet → Check registered address
         └─ Correct wallet → Shielded address synced?
                            └─ Run wallet sync/rescan
```

---

## Error Messages Reference

| Error | Meaning | Fix |
|-------|---------|-----|
| "Missing required fields" | Form incomplete | Fill all fields |
| "Invalid platform" | Wrong platform value | Select X or Substack |
| "Invalid Zcash shielded address" | Address format wrong | Check zs prefix, 78 chars |
| "Invalid tweet URL format" | URL doesn't match pattern | Use direct tweet link |
| "Tweet must be from the handle being registered" | URL doesn't match handle | Tweet from correct account |
| "Database error" | Server issue | Try again in a few minutes |
| "Failed to create registration" | Server issue | Try again in a few minutes |

---

## Contact & Escalation

### Self-Service
- This FAQ
- Documentation at tipz.app/docs

### Community Support
- Twitter: @TIPZ_app (DMs open)
- Discord: [TBD]

### Escalation Path

1. **User self-service**: FAQ and documentation
2. **Community support**: Twitter DM or Discord
3. **Technical escalation**: GitHub issues for bugs

---

## Support Response Templates

### Registration Issue

```
Thanks for reaching out!

For registration issues, please check:
1. Your Zcash address starts with "zs" and is exactly 78 characters
2. Your verification tweet is public and from the account you're registering
3. The tweet URL is a direct link (format: https://x.com/username/status/...)

If you've verified all of the above and still have issues, please share:
- Your platform (X or Substack)
- Your handle
- Screenshot of the error (no need to share your address)

We'll look into it!
```

### Extension Not Working

```
Sorry to hear the extension isn't working!

Please try these steps:
1. Make sure you're on x.com (not twitter.com)
2. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
3. Check the extension is enabled in chrome://extensions
4. Try disabling and re-enabling the extension

If that doesn't help, try reinstalling the extension from the Chrome Web Store.

Let us know if you're still having issues after trying these steps!
```

### Tip Not Received

```
Let's figure out where your tip went!

First, can you confirm:
1. The tip shows as "sent" in your wallet's transaction history?
2. You're checking the Zcash wallet where your registered address lives?
3. The wallet is fully synced? (Shielded transactions need full sync)

If the tip shows as sent and you're checking the right wallet, please give it a few minutes—Zcash shielded transactions can take 2-5 minutes to confirm.

If it's been longer than 10 minutes, let us know the transaction ID (if available) and we'll investigate.
```

---

## Known Issues

| Issue | Status | Workaround |
|-------|--------|------------|
| Buttons don't appear on mobile X | Won't fix | Extension only works on desktop Chrome |
| Twitter.com redirect | Known | Use x.com directly |
| Slow batch lookup | Investigating | Refresh if buttons delayed |

---

## Metrics to Track

- Support ticket volume
- Common issue categories
- Resolution time
- User satisfaction (if surveyed)

Use this data to:
- Improve documentation
- Prioritize bug fixes
- Identify UX improvements
