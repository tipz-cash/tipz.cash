# TIPZ Launch Checklist

Pre-launch verification and launch day tasks.

**Last Updated**: January 2026
**Launch Target**: [Set specific date]

---

## Pre-Launch (T-7 to T-1)

### Product Readiness

#### Web App (tipz.cash)
- [ ] Landing page loads in <3 seconds
- [ ] All navigation links work (Home, About, Register, FAQ)
- [ ] All CTA buttons point to correct destinations
- [ ] Registration form validates: X handle format, shielded address format (starts with "zs1")
- [ ] Registration submits successfully (test with real shielded address)
- [ ] Success state: Confirmation message displays, next steps clear
- [ ] Error states: Invalid handle, invalid address, network error all show helpful messages
- [ ] Mobile: Test on iPhone Safari, Android Chrome - all features accessible
- [ ] OG image: Share tipz.cash link on X, verify image/title/description appear correctly
- [ ] Favicon: Verify icon shows in browser tab
- [ ] SSL: Confirm https:// works, no mixed content warnings

#### Browser Extension
- [ ] Chrome: Install from Web Store (or load unpacked if not published)
- [ ] Firefox: Install from AMO (or load temporary if not published)
- [ ] Popup: Opens correctly, displays branding and key info
- [ ] X.com - Content script: Navigate to x.com, verify script loads (check console for errors)
- [ ] X.com - Registered creator: Visit tweet from registered test account, verify tip button appears
- [ ] X.com - Unregistered creator: Visit tweet from unregistered account, verify "Not on TIPZ" or no button
- [ ] Substack: Navigate to substack author page, verify appropriate behavior
- [ ] Tip modal: Click tip button, verify modal opens with correct creator info
- [ ] Amount selection: Test 1 ZEC, 5 ZEC, custom amount options work
- [ ] Wallet connection: Test MetaMask/WalletConnect connection flow
- [ ] Transaction initiation: Test full tip flow (use testnet or small amount)
- [ ] Error handling: Test with insufficient balance, rejected transaction, network error

#### API Endpoints
- [ ] `GET /api/creator?handle=testhandle` - Returns correct creator data
- [ ] `GET /api/creator?handle=nonexistent` - Returns appropriate 404
- [ ] `POST /api/creators/batch` - Returns data for multiple handles efficiently
- [ ] `POST /api/register` - Creates new creator record
- [ ] `POST /api/register` - Updates existing creator record (address change)
- [ ] Rate limiting: Test 100 requests in 1 minute, verify limiting kicks in
- [ ] Error responses: All errors return JSON with helpful message
- [ ] Security: Verify no SQL injection, no sensitive data in responses
- [ ] CORS: Verify extension can access API, random domains cannot

#### Database (Supabase)
- [ ] Connection: Verify API can connect consistently
- [ ] Backup: Confirm daily backup is configured and running
- [ ] Test data: Remove all test records from production
- [ ] Credentials: Verify production keys are not in git, stored in env variables
- [ ] Row-level security: Verify RLS policies prevent unauthorized access

### Content Readiness

#### Marketing Materials
- [ ] Launch thread: 10-tweet thread written, reviewed, loaded in scheduler or draft
  - Tweet 1: Hook (the problem)
  - Tweet 2: Solution intro
  - Tweet 3: How it works (creator side)
  - Tweet 4: How it works (tipper side)
  - Tweet 5: Why privacy matters
  - Tweet 6: Technical credibility (NEAR Intents, shielded)
  - Tweet 7: Demo GIF
  - Tweet 8: Call to action (creators)
  - Tweet 9: Call to action (tippers)
  - Tweet 10: Vision / future
- [ ] Demo GIF: 15-30 second screen recording showing tip flow, exported as GIF
- [ ] Demo video: 60-second walkthrough for those who want more detail
- [ ] OG image: 1200x630px, clear text, TIPZ branding
- [ ] X profile: @tipz_app (or handle) - profile picture set (logo)
- [ ] X banner: 1500x500px, tagline and visual
- [ ] X bio: "Private tips for creators. Any token to shielded ZEC. Ship fast, tip private."

#### Documentation
- [ ] README: Updated with current features, installation instructions
- [ ] Registration guide: Step-by-step with screenshots for getting shielded address
- [ ] FAQ: At least 10 common questions answered (see below for list)
- [ ] Support: hello@tipz.cash (or appropriate) set up and monitored

**FAQ Must-Have Questions:**
1. What is TIPZ?
2. How do I register as a creator?
3. How do I get a shielded Zcash address?
4. What wallets are supported?
5. How do I tip a creator?
6. What tokens can I tip with?
7. Are there any fees?
8. Is TIPZ custodial?
9. How long do tips take to arrive?
10. What platforms does TIPZ support?

### Outreach Preparation

- [ ] Mert DM: Final version ready at `/tipz/docs/gtm/outreach-ready/mert-dm.md`
- [ ] Josh/cashZ DM: Final version ready at `/tipz/docs/gtm/outreach-ready/josh-dm.md`
- [ ] Community posts: Ready at `/tipz/docs/gtm/outreach-ready/community-posts.md`
- [ ] Forum intro: Ready at `/tipz/docs/gtm/community/forum-intro.md`
- [ ] Zashi proposal: Ready at `/tipz/docs/gtm/proposals/zashi-integration.md`
- [ ] Pre-engagement: Liked/replied to 3+ recent tweets from Mert, Josh before DM
- [ ] KOL tracking spreadsheet: Created with columns (Name, Handle, Status, Date Sent, Response, Notes)

### Monitoring & Support

- [ ] Sentry: Error monitoring configured, test error triggers alert
- [ ] Analytics: Plausible/Vercel Analytics tracking page views, registrations
- [ ] Uptime: BetterUptime or similar monitoring tipz.cash every 5 min
- [ ] Support email: hello@tipz.cash receiving and forwarding correctly
- [ ] Support response: Template responses ready for common questions
- [ ] Incident playbook: Documented at `/tipz/docs/ops/incident-response.md` (create if needed)

### Beta Testing (T-3 to T-1)

- [ ] Recruit 5-10 friendly beta creators (personal network, Zcash community)
- [ ] Send each beta creator registration link with ask for feedback
- [ ] Collect feedback via DM or simple form
- [ ] Fix any critical issues found
- [ ] Get at least 2 beta creators to post about TIPZ at launch (optional but ideal)

---

## Launch Day (T-0)

**Suggested Launch Time**: Tuesday or Wednesday, 9am PT / 12pm ET / 5pm UTC
(Highest X engagement, gives full week for momentum)

### Morning Prep (Before Launch - T-2 hours)

- [ ] Clear calendar: No meetings for 4 hours post-launch
- [ ] Final registration test: Complete full flow, verify in Supabase
- [ ] Final extension test: Tip a beta creator, verify it works
- [ ] API health check: Hit all endpoints, verify responses
- [ ] Supabase check: Dashboard shows no issues, under limits
- [ ] Load launch thread: Ready to post (Twitter draft or Typefully/Hypefury)
- [ ] Open monitoring: Sentry, uptime monitor, analytics dashboard
- [ ] Notify team: Confirm everyone available for first 4 hours

### Launch Sequence

**T-0 (9am PT)**

1. [ ] **Post launch thread**
   - Post Tweet 1 (the hook)
   - Wait 2-3 minutes for initial engagement
   - Post remaining tweets 2-10 as replies
   - Total thread should be live within 15 minutes
   - Pin thread to @tipz_app profile

2. [ ] **Amplify with demo content**
   - Reply to thread with demo GIF (separate tweet for shareability)
   - Quote tweet the demo GIF from personal accounts (if applicable)

3. [ ] **Verify website is launch-ready**
   - Remove any "beta" or "coming soon" language
   - Ensure Chrome/Firefox extension links are correct
   - Check registration form works (one more time)

**T+30 minutes**

4. [ ] **Begin engagement**
   - Like and reply to every comment on launch thread
   - Thank anyone who shares or quote tweets
   - Answer questions promptly and thoroughly

**T+1 hour**

5. [ ] **KOL outreach**
   - Send DM to Mert (@0xMert_) - use `/tipz/docs/gtm/outreach-ready/mert-dm.md`
   - Send DM to Josh Swihart - use `/tipz/docs/gtm/outreach-ready/josh-dm.md`
   - Post in Zcash Discord - use `/tipz/docs/gtm/outreach-ready/community-posts.md`
   - Tag @zcash_community, @ZcashNews in relevant thread reply

6. [ ] **Ongoing engagement (through T+4h)**
   - Respond to all mentions within 30 minutes
   - Retweet/quote supportive posts
   - DM anyone who expresses strong interest
   - Post "bonus" content if engagement is high

**T+4 hours**

7. [ ] **First metrics checkpoint**
   - [ ] Creator registrations: _____ (target: 20+)
   - [ ] Thread impressions: _____ (target: 10K+)
   - [ ] Thread engagements: _____ (target: 500+)
   - [ ] New followers: _____ (target: 50+)
   - [ ] Error count: _____ (target: 0)
   - [ ] Extension installs: _____ (if trackable)

8. [ ] **Course correct if needed**
   - If registrations < 5: Check registration flow, reach out to beta creators to register publicly
   - If errors > 0: Investigate and fix immediately, post status update if affecting users
   - If engagement low: Post follow-up content, engage more in replies

**T+8 hours (End of Day 1)**

9. [ ] **Evening content**
   - Post a "Day 1 thank you" tweet with early stats (if good)
   - Or post educational content about why privacy matters

10. [ ] **Day 1 wrap-up**
    - Record final Day 1 metrics
    - Note any issues to address
    - Plan Day 2 content
    - Respond to any remaining comments/DMs

---

## Post-Launch (T+1 to T+7)

### Daily Tasks (Every Day)

- [ ] Check Sentry for errors - fix any critical issues immediately
- [ ] Check analytics - note registration count, page views
- [ ] Respond to all X mentions within 2 hours
- [ ] Respond to all DMs within 4 hours
- [ ] Post at least 1 piece of content (see content calendar below)
- [ ] Engage in 5+ relevant conversations (Zcash, privacy, creator economy)
- [ ] Update metrics tracking spreadsheet

### Day 2 (T+1)

**Theme**: Creator-focused

- [ ] Morning post: "Why creators need financial privacy" thread (3-5 tweets)
- [ ] Mid-day: Share registration numbers if good ("X creators joined in 24 hours")
- [ ] Follow up on Mert DM if no response (only if 24+ hours, one follow-up max)
- [ ] Follow up on Josh DM if no response (only if 24+ hours, one follow-up max)
- [ ] Post in Zcash Forum - full intro post from `/tipz/docs/gtm/community/forum-intro.md`
- [ ] Share any positive feedback or testimonials

### Day 3 (T+2)

**Theme**: Tipper-focused

- [ ] Morning post: "How to tip creators privately" explainer with screenshots
- [ ] Share creator testimonial if available
- [ ] Create content from any common questions received
- [ ] Engage heavily with anyone who posted about TIPZ
- [ ] Submit to ZecHub for ecosystem listing

### Day 4 (T+3)

**Theme**: Technical credibility

- [ ] Morning post: Technical architecture thread (NEAR Intents, shielded flow)
- [ ] Engage in crypto dev / builder communities
- [ ] Answer any technical questions from Zcash forum
- [ ] Consider posting in relevant subreddits (r/zcash) if forum reception positive

### Day 5 (T+4)

**Theme**: Zcash community deep engagement

- [ ] Morning post: "Why we built on Zcash" values-focused thread
- [ ] Active Discord engagement - answer questions, be helpful
- [ ] Check forum thread - respond to all comments
- [ ] Direct outreach to Zcash community leaders who haven't engaged yet

### Day 6 (T+5)

**Theme**: Social proof and use cases

- [ ] Morning post: Specific use case story (even hypothetical, well-framed)
- [ ] Share any user-generated content (screenshots of tips, positive tweets)
- [ ] Reach out to any creators who registered - ask for testimonial
- [ ] Consider small "thank you tip" to early supporters

### Day 7 (T+6)

**Theme**: Week 1 recap and planning

- [ ] Morning post: "Week 1 in numbers" thread with metrics
  - Creator registrations
  - Tips sent (if shareable)
  - Community response highlights
- [ ] Internal retrospective: What worked? What didn't? What to do more of?
- [ ] Plan Week 2 content calendar
- [ ] Begin drafting Zashi proposal outreach (send Week 2)
- [ ] Identify "anchor creators" to pursue for deeper relationship

---

## Emergency Procedures

### If Registration Fails
1. **Immediate** (within 5 min):
   - Open Supabase dashboard - check connection status and error logs
   - Test API directly: `curl https://tipz.cash/api/creator?handle=testhandle`
   - Check Sentry for error details
2. **If Supabase issue**:
   - Check Supabase status page (status.supabase.com)
   - If their issue: Wait and communicate to users
   - If our issue: Check env variables, connection strings
3. **If API issue**:
   - Check Vercel/deployment logs
   - Roll back to last working deployment if needed
   - Test locally if deployment issue unclear
4. **Communication** (if down >15 min):
   - Post on X: "We're aware of registration issues and working on a fix. Updates soon."
   - Update when resolved: "Registration is back up. Thanks for your patience!"

### If Extension Breaks
1. **Immediate diagnosis**:
   - Test in fresh Chrome profile (incognito mode)
   - Open X.com, check console for errors (Cmd+Option+J)
   - Check if X.com changed their DOM (tip buttons not appearing)
2. **If DOM change**:
   - Inspect tweet element, compare to content script selectors
   - Update selectors, test locally
   - Push hotfix to Chrome Web Store (24-48hr review) or host locally
3. **If our code issue**:
   - Check recent commits for breaking changes
   - Revert to last working version
   - Push fix
4. **If critical and can't fix quickly**:
   - Consider unpublishing extension temporarily
   - Post update: "Extension temporarily unavailable while we fix an issue"

### If Traffic Spike Causes Issues
1. **Check limits**:
   - Supabase: Check dashboard for connection limits, row limits
   - Vercel: Check function invocation limits, bandwidth
2. **Mitigation options**:
   - Enable/increase caching on API responses
   - Add rate limiting if not present
   - Upgrade Supabase/Vercel plan if needed
3. **If overwhelmed**:
   - Consider temporary registration pause
   - Communicate: "Registration is paused due to high demand. Back soon!"

### Communication During Issues

**Template: Issue Detected**
```
We're experiencing issues with [registration/the extension/tips]. Our team is investigating and we'll update you shortly.
```

**Template: Investigation Update**
```
Update: We've identified the issue with [X]. Working on a fix now. ETA: [time estimate if possible].
```

**Template: Resolution**
```
All systems back to normal. [Registration/Extension/Tips] working as expected. Thanks for your patience!

If you experienced issues, please try again. DM us if you're still having problems.
```

**Rules**:
- Post status update if down >15 minutes
- Update every 30-60 minutes during extended outage
- Be honest about what happened (after resolved)
- Thank community for patience
- Never blame users or external factors

---

## Launch Metrics Dashboard

Track these on launch day (copy this table to a spreadsheet):

| Metric | 1hr | 4hr | 8hr | 24hr | 48hr | 7d | Target (7d) |
|--------|-----|-----|-----|------|------|-----|-------------|
| Creator registrations | | | | | | | 100 |
| Extension installs | | | | | | | 1000 |
| Tips sent | | | | | | | 100 |
| Total ZEC tipped | | | | | | | 10 ZEC |
| Thread impressions | | | | | | | 100K |
| Thread engagements | | | | | | | 5K |
| Thread retweets | | | | | | | 100 |
| New X followers | | | | | | | 500 |
| KOL DMs sent | | | | | | | 5 |
| KOL responses | | | | | | | 2 |
| Forum post views | | | | | | | 500 |
| Discord messages | | | | | | | 20 |
| Errors logged | | | | | | | 0 |
| Support requests | | | | | | | <10 |

**Where to find each metric**:
- Creator registrations: Supabase dashboard, count of creators table
- Extension installs: Chrome Web Store developer dashboard
- Tips sent: Supabase or transaction logs
- Thread impressions: X Analytics (click on tweet)
- New followers: X profile follower count (note starting number)
- Errors: Sentry dashboard

---

## Post-Launch Retrospective Questions

Complete this after Week 1:

### What worked?
1. What drove the most registrations?
2. Which content performed best?
3. What feedback was most positive?
4. Which outreach got responses?

### What didn't work?
1. What content flopped?
2. Where did users get confused?
3. What technical issues occurred?
4. What outreach was ignored?

### Learnings
1. What would we do differently on Day 1?
2. What surprised us (positive or negative)?
3. What should we double down on for Week 2?
4. What should we stop doing?

### User Feedback Summary
- Most common positive feedback:
- Most common complaint/confusion:
- Most requested feature:
- Unexpected use case mentioned:

### Week 2 Priorities
1.
2.
3.

---

## Success Criteria

### Launch is SUCCESSFUL if (by Day 7):
- [ ] 100+ creators registered
- [ ] 500+ extension installs
- [ ] 50+ tips sent
- [ ] 50K+ thread impressions
- [ ] No critical technical failures lasting >1 hour
- [ ] At least 1 notable organic mention from non-outreach source
- [ ] Net positive Zcash community reception (forum, Discord)
- [ ] At least 1 KOL response (even if just acknowledgment)

### Launch is EXCEPTIONAL if:
- [ ] 200+ creators registered
- [ ] 1000+ extension installs
- [ ] 100+ tips sent
- [ ] 100K+ thread impressions
- [ ] Mert or Josh publicly mentions TIPZ
- [ ] Featured by Zcash community accounts
- [ ] Inbound partnership interest

### Launch NEEDS ADJUSTMENT if:
- < 20 registrations in first 24 hours
- Significant negative community feedback
- Technical issues preventing >10% of users from registering
- Zero KOL engagement after follow-up
- Major security concern raised

### If adjustment needed, consider:
- Is the value prop clear? (Revise messaging)
- Is registration too hard? (Simplify flow)
- Is the product working? (Fix bugs first)
- Are we reaching the right people? (Adjust targeting)
- Is timing wrong? (Consider pause and relaunch)

---

## Week 2+ Roadmap Items (Post-Launch)

After Week 1, begin planning:

- [ ] Zashi integration proposal outreach
- [ ] cashZ partnership follow-up
- [ ] Creator testimonial collection
- [ ] Case study write-up (if successful)
- [ ] Next platform support (Substack completion, YouTube?)
- [ ] Feature improvements based on feedback
- [ ] Zcash grant application (if applicable)
- [ ] Content expansion (blog, longer tutorials)
