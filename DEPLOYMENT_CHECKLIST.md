# 🚀 DEPLOYMENT CHECKLIST

## Overview

Complete step-by-step guide to deploy Cyntra Insights to production.

**Project:** Cyntra Insights
**Supabase Project ID:** vkzqhxujmwepnmanirsl
**Current Status:** Development → Production Ready

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### **1. Database Setup** ✅

- [x] Documents table created (from previous migrations)
- [x] Analyses table created (from previous migrations)
- [ ] Run roles & subscriptions migration
- [ ] Run team accounts migration

**Action:**
```sql
-- In Supabase SQL Editor:

-- Migration 1: Roles & Billing
-- Copy content from: supabase/migrations/20251118180000_roles_and_subscriptions.sql
-- Execute

-- Migration 2: Team Accounts
-- Copy content from: supabase/migrations/20251118180100_team_accounts.sql
-- Execute
```

### **2. Secrets Configuration** ❌ CRITICAL

- [ ] OPENAI_API_KEY set in Supabase
- [ ] (Optional) Stripe secrets configured

**Action:**
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref vkzqhxujmwepnmanirsl

# Set OpenAI key (REQUIRED)
supabase secrets set OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE

# Optional: Set Stripe keys (only if using billing)
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
supabase secrets set STRIPE_PRO_PRICE_ID=price_YOUR_PRO_ID
supabase secrets set STRIPE_ENTERPRISE_PRICE_ID=price_YOUR_ENTERPRISE_ID

# Verify
supabase secrets list
```

### **3. Edge Functions Deployment** ❌ CRITICAL

Current functions to deploy:

- [ ] doc-scrub
- [ ] document-upload
- [ ] cie-all
- [ ] cie-swot
- [ ] cie-quickwins
- [ ] cie-benchmark
- [ ] cie-cashflow
- [ ] cie-financial
- [ ] stripe-webhook (optional)

**Action:**
```bash
# Deploy all functions
supabase functions deploy doc-scrub
supabase functions deploy document-upload
supabase functions deploy cie-all
supabase functions deploy cie-swot
supabase functions deploy cie-quickwins
supabase functions deploy cie-benchmark
supabase functions deploy cie-cashflow
supabase functions deploy cie-financial

# Optional: Deploy Stripe webhook
supabase functions deploy stripe-webhook
```

### **4. Storage Buckets** ✅

- [x] Document uploads bucket exists

**Verify:**
```
Supabase Dashboard → Storage → Check "document-uploads" bucket exists
```

---

## 🧪 TESTING PHASE

### **Test 1: Authentication**

- [ ] User can sign up
- [ ] User can login
- [ ] User can logout
- [ ] Protected routes work

**Test:**
```
1. Go to /login
2. Create account
3. Navigate to /dashboard
4. Should see dashboard (not redirected to login)
5. Logout
6. Try to access /dashboard → Should redirect to /login
```

### **Test 2: Document Upload & Scrubbing**

- [ ] Documents can be uploaded
- [ ] Scrubbing works (PII removed)
- [ ] Preview shows scrubbed text
- [ ] Document saved to database

**Test:**
```
1. Go to /complete
2. Upload a test document
3. Wait for progress bar: upload → scrub → ready
4. Check preview shows scrubbed text
5. Verify document in /documents page
```

### **Test 3: Complete Analysis**

- [ ] Complete analysis runs
- [ ] All sub-analyses generated
- [ ] Results saved to database
- [ ] Results visible in /analyses-history

**Test:**
```
1. Go to /complete
2. Upload document (if not done)
3. Enter company context
4. Click "Run alle analyses"
5. Wait for progress bar: analysis → done
6. Check results display
7. Go to /analyses-history
8. Verify analysis appears
```

### **Test 4: Executive Dashboard**

- [ ] Dashboard loads
- [ ] KPIs display correctly
- [ ] EBITDA calculated from quickwins
- [ ] Cash release calculated from cashflow
- [ ] Recent analyses show

**Test:**
```
1. Go to /dashboard
2. Verify KPI cards show:
   - Potentiële EBITDA
   - Potentiële Cash Release
   - Aantal analyses
   - Laatste analyse datum
3. Check "Recente Analyses" panel
4. Check "Impact Summary" card
```

### **Test 5: PDF Export**

- [ ] PDF export button works
- [ ] PDF downloads correctly
- [ ] PDF contains analysis content
- [ ] Filename is correct

**Test:**
```
1. Go to /analyses-history
2. Select an analysis
3. Click "Exporteer als PDF"
4. Wait for download
5. Open PDF
6. Verify content is readable
```

### **Test 6: Progress Bars**

- [ ] Upload progress shows
- [ ] Scrubbing progress shows
- [ ] Analysis progress shows
- [ ] Done state shows (100%)
- [ ] Auto-hide after completion

**Test:**
```
1. Go to /complete
2. Upload document
3. Watch progress bar (10% → 40% → 60%)
4. Run analysis
5. Watch progress bar (70% → 100%)
6. Verify auto-hide after 3 seconds
```

---

## 🔒 SECURITY CHECKLIST

### **Row Level Security (RLS)**

- [x] Documents table has RLS enabled
- [x] Analyses table has RLS enabled
- [ ] User_roles table has RLS enabled (after migration)
- [ ] Subscriptions table has RLS enabled (after migration)
- [ ] Companies table has RLS enabled (after migration)
- [ ] Company_users table has RLS enabled (after migration)

**Verify:**
```sql
-- In Supabase SQL Editor:
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Should show 'true' for all tables
```

### **Authentication**

- [x] Email/password auth enabled
- [x] JWT tokens configured
- [x] Protected routes implemented
- [x] Auth state management working

### **CORS**

- [x] Edge functions have CORS headers
- [x] OPTIONS requests handled
- [x] Proper headers for JSON responses

---

## 📊 MONITORING SETUP

### **Edge Functions Logs**

```
Supabase Dashboard → Edge Functions → Select function → Logs
```

Monitor for:
- Successful invocations
- Error rates
- Response times
- API usage (OpenAI)

### **Database Activity**

```
Supabase Dashboard → Database → Query Performance
```

Monitor:
- Slow queries
- Table sizes
- Index usage
- Connection pool

### **Storage Usage**

```
Supabase Dashboard → Storage → Usage
```

Monitor:
- Total storage used
- Upload activity
- Bandwidth usage

---

## 🎯 GO-LIVE CHECKLIST

### **Final Pre-Launch Checks**

- [ ] All tests passed
- [ ] Database migrations applied
- [ ] Secrets configured
- [ ] Edge functions deployed
- [ ] RLS policies verified
- [ ] Error handling tested
- [ ] Mobile responsive tested
- [ ] Performance acceptable

### **Launch**

- [ ] Update DNS (if custom domain)
- [ ] SSL certificate active
- [ ] Monitoring alerts configured
- [ ] Backup strategy in place
- [ ] Rollback plan documented

### **Post-Launch**

- [ ] Monitor error logs (first 24h)
- [ ] Check user signups
- [ ] Verify analyses running
- [ ] Monitor API costs (OpenAI)
- [ ] Check database performance

---

## 💰 COST MONITORING

### **Supabase (Free tier limits)**

- Database: 500 MB
- Storage: 1 GB
- Bandwidth: 2 GB
- Edge Functions: 500K invocations

**Upgrade triggers:**
- Database > 400 MB → Consider Pro ($25/month)
- Storage > 800 MB → Consider Pro
- Functions > 400K/month → Consider Pro

### **OpenAI (Pay-as-you-go)**

**Estimated costs per analysis:**
- Complete analysis: ~$0.15 - $0.30
- Single analysis: ~$0.03 - $0.05

**Monthly estimates:**
- 100 analyses/month: ~$15 - $30
- 500 analyses/month: ~$75 - $150
- 1000 analyses/month: ~$150 - $300

**Monitor:**
```
OpenAI Dashboard → Usage → Track monthly costs
Set up billing alerts
```

### **Stripe (If using billing)**

- 2.9% + €0.25 per transaction
- No monthly fees
- First €10K processed: Free

---

## 🐛 TROUBLESHOOTING GUIDE

### **Issue: "OPENAI_API_KEY not configured"**

**Solution:**
```bash
supabase secrets set OPENAI_API_KEY=sk-proj-YOUR_KEY
supabase functions deploy [affected-function]
```

### **Issue: "Fail to fetch" on login**

**Cause:** Supabase auth not properly configured

**Solution:**
```
1. Check VITE_SUPABASE_URL in .env
2. Check VITE_SUPABASE_ANON_KEY in .env
3. Verify project is running (green status in dashboard)
4. Check browser console for CORS errors
```

### **Issue: Analysis not saving to database**

**Cause:** RLS policy blocking insert

**Solution:**
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'analyses';

-- Verify user is authenticated
SELECT auth.uid();
```

### **Issue: PDF export fails**

**Cause:** Content ref not properly set

**Solution:**
```typescript
// Check contentRef is assigned in JSX
<div ref={contentRef}>
  {/* content here */}
</div>
```

### **Issue: Progress bar stuck**

**Cause:** Promise not resolving

**Solution:**
```typescript
// Check error handling in upload/analysis functions
// Verify progress states are being set
// Add console.logs to track progress updates
```

---

## 📞 SUPPORT RESOURCES

**Supabase:**
- Dashboard: https://supabase.com/dashboard
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

**OpenAI:**
- Dashboard: https://platform.openai.com
- Docs: https://platform.openai.com/docs
- Help: https://help.openai.com

**Stripe:**
- Dashboard: https://dashboard.stripe.com
- Docs: https://stripe.com/docs
- Support: https://support.stripe.com

---

## 🎉 SUCCESS METRICS

After successful deployment, track:

- [ ] User signups (target: 10+ in first week)
- [ ] Analyses run (target: 50+ in first week)
- [ ] PDF exports (target: 20+ in first week)
- [ ] Dashboard views (target: 100+ in first week)
- [ ] Error rate (target: <5%)
- [ ] Average analysis time (target: <30 seconds)

---

## 📋 QUICK COMMAND REFERENCE

```bash
# Database Migrations
# Run in Supabase SQL Editor manually

# Deploy All Functions
supabase functions deploy doc-scrub
supabase functions deploy document-upload
supabase functions deploy cie-all
supabase functions deploy cie-swot
supabase functions deploy cie-quickwins
supabase functions deploy cie-benchmark
supabase functions deploy cie-cashflow
supabase functions deploy cie-financial
supabase functions deploy stripe-webhook

# Set Secrets
supabase secrets set OPENAI_API_KEY=sk-proj-YOUR_KEY

# View Logs
supabase functions logs doc-scrub --limit 50

# Check Status
supabase functions list
supabase secrets list

# Test Function
curl -X POST https://vkzqhxujmwepnmanirsl.supabase.co/functions/v1/doc-scrub \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "Test"}'
```

---

**Project Status:** 🟡 Ready for Deployment (Pending secrets configuration)

**Next Steps:**
1. Set OPENAI_API_KEY secret
2. Run database migrations
3. Deploy Edge Functions
4. Run test suite
5. GO LIVE! 🚀
