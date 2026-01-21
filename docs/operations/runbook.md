# TIPZ Operations Runbook

Deployment, monitoring, and incident response procedures.

---

## Infrastructure Overview

### Components

| Component | Provider | URL |
|-----------|----------|-----|
| Web App | Vercel | tipz.app |
| Database | Supabase | [dashboard](https://app.supabase.com) |
| Extension | Chrome Web Store | [link TBD] |
| Domain | [Registrar TBD] | tipz.app |

### Environment Variables

**Web App (Vercel)**:
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...
```

**Extension**:
```
PLASMO_PUBLIC_API_URL=https://tipz.app
```

---

## Deployment

### Web App (Vercel)

**Automatic Deployment**:
1. Push to `main` branch
2. Vercel automatically builds and deploys
3. Preview deployments for PRs

**Manual Deployment**:
```bash
cd tipz/web
npm run build
vercel --prod
```

**Rollback**:
1. Go to Vercel dashboard
2. Deployments → Select previous deployment
3. Click "Promote to Production"

### Extension (Chrome Web Store)

**Build**:
```bash
cd tipz/extension
npm run build
# Output: build/chrome-mv3-prod/
```

**Submit Update**:
1. Zip `build/chrome-mv3-prod/` contents
2. Go to [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Select TIPZ extension
4. Upload new zip
5. Submit for review

**Review Timeline**: Typically 1-3 business days

**Rollback**: Contact Chrome support or submit previous version

---

## Monitoring

### Uptime Monitoring

**Recommended**: UptimeRobot or Better Uptime (free tier)

**Endpoints to monitor**:
| Endpoint | Check Interval | Alert After |
|----------|---------------|-------------|
| https://tipz.app | 5 min | 2 failures |
| https://tipz.app/api/health | 5 min | 2 failures |

### Error Monitoring

**Recommended**: Sentry

**Setup**:
1. Create Sentry project (Next.js)
2. Install SDK: `npm install @sentry/nextjs`
3. Configure DSN in environment

**Alert Thresholds**:
- > 10 errors/hour: Warning
- > 50 errors/hour: Critical

### Database Monitoring

**Supabase Dashboard**:
- API requests
- Database size
- Connection count

**Alerts**:
- Database approaching limit
- High error rate
- Slow queries (> 1s)

### Analytics

**Recommended**: Plausible (privacy-friendly)

**Key Metrics**:
- Daily active users
- Registration conversions
- Extension referrals

---

## Common Procedures

### Checking Service Health

```bash
# API health (if implemented)
curl https://tipz.app/api/health

# Check creator lookup
curl "https://tipz.app/api/creator?platform=x&handle=test"

# Check database via Supabase dashboard
# app.supabase.com → SQL Editor → Run: SELECT COUNT(*) FROM creators;
```

### Viewing Logs

**Vercel Logs**:
1. Vercel Dashboard → Project → Logs
2. Filter by function (e.g., `/api/register`)
3. Filter by time range

**Supabase Logs**:
1. Supabase Dashboard → Database → Logs
2. View query history
3. Check for errors

### Database Queries

**Count Creators**:
```sql
SELECT platform, COUNT(*)
FROM creators
GROUP BY platform;
```

**Recent Registrations**:
```sql
SELECT handle, platform, created_at
FROM creators
ORDER BY created_at DESC
LIMIT 20;
```

**Find Creator**:
```sql
SELECT * FROM creators
WHERE handle_normalized = 'username';
```

---

## Incident Response

### Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| P0 | Service completely down | Immediate |
| P1 | Core feature broken (registration/lookup) | < 1 hour |
| P2 | Non-critical feature broken | < 4 hours |
| P3 | Minor issue | Next business day |

### Incident Workflow

1. **Detect**: Monitoring alert or user report
2. **Assess**: Determine severity and impact
3. **Communicate**: Update status (if public status page)
4. **Investigate**: Check logs, identify root cause
5. **Mitigate**: Quick fix or rollback
6. **Resolve**: Full fix deployed
7. **Review**: Post-mortem within 48 hours

### Communication Templates

**Initial Acknowledgment** (Twitter/Status):
```
We're aware of issues with [feature] and are investigating.
Updates to follow.
```

**Resolution**:
```
The issue with [feature] has been resolved.
Root cause: [brief explanation].
Thank you for your patience.
```

---

## Common Issues & Fixes

### Registration Failing

**Symptoms**: Users can't register, 500 errors

**Investigation**:
1. Check Vercel function logs
2. Check Supabase connection
3. Test API directly with curl

**Common causes**:
- Supabase connection timeout → Check Supabase status
- Invalid input not caught → Check validation
- Database constraint violation → Check schema

**Fix**: Usually Supabase transient issue, may resolve automatically

### Extension Not Loading

**Symptoms**: Tip buttons don't appear on X.com

**Investigation**:
1. Check browser console for errors
2. Verify extension is enabled
3. Test on fresh profile

**Common causes**:
- X.com DOM changed → Update selectors in content script
- CSP blocking → Check manifest permissions
- Extension update pending → Manual reload

**Fix**: Push extension update if selector changed

### Creator Lookup Slow

**Symptoms**: Batch lookup taking > 2s

**Investigation**:
1. Check Supabase query performance
2. Verify indexes exist
3. Check request size

**Common causes**:
- Missing index → Add index on handle_normalized
- Large batch size → Enforce 100 limit
- Supabase cold start → First request after idle

**Fix**: Ensure indexes, consider caching

---

## Backup & Recovery

### Database Backup

**Supabase**:
- Daily automatic backups (7-day retention on free tier)
- Point-in-time recovery available on paid plans

**Manual Export**:
```sql
-- Export via Supabase dashboard or pg_dump
```

### Recovery Procedure

1. Identify recovery point
2. Restore from Supabase dashboard
3. Verify data integrity
4. Resume service

---

## Scaling Procedures

### If Traffic Spikes

1. Monitor Vercel/Supabase dashboards
2. Vercel auto-scales (no action needed)
3. Supabase may need upgrade if hitting limits
4. Consider adding caching if repeated lookups

### Database Growth

**Free tier limits**: 500MB database, 50K requests/month

**When approaching limits**:
1. Review data retention needs
2. Consider archiving old data
3. Upgrade to paid tier

---

## Security Procedures

### If Compromise Suspected

1. **Rotate credentials immediately**
   - Generate new Supabase service key
   - Update in Vercel environment
   - Redeploy

2. **Review access logs**
   - Supabase audit logs
   - Vercel function logs

3. **Assess impact**
   - Check for unauthorized data access
   - Review recent registrations

4. **Communicate**
   - If user data affected, notify users
   - Document incident

### Regular Security Tasks

**Weekly**:
- Review registration patterns for abuse
- Check for unusual API usage

**Monthly**:
- Review access permissions
- Update dependencies
- Check for security advisories

---

## Contacts

| Role | Contact |
|------|---------|
| Technical Lead | [TBD] |
| Supabase Support | support@supabase.com |
| Vercel Support | support@vercel.com |
| Chrome Support | [Developer dashboard] |

---

## Runbook Checklist

Before going live, ensure:

- [ ] Uptime monitoring configured
- [ ] Error monitoring configured
- [ ] Supabase credentials secured
- [ ] Vercel environment variables set
- [ ] Extension published to store
- [ ] Domain DNS configured
- [ ] SSL certificate active
- [ ] Backup verified
