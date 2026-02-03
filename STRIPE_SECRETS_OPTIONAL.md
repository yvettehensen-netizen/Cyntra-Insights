# Stripe Secrets - OPTIONAL

## Status: ⚠️ OPTIONAL (Not Required for Core Functionality)

The Stripe secrets are only used by the `stripe-webhook` Edge Function for payment processing:

```
STRIPE_SECRET_KEY          → Only for Stripe API calls
STRIPE_WEBHOOK_SECRET      → Only for webhook signature verification
STRIPE_PRO_PRICE_ID        → Only for plan detection
STRIPE_ENTERPRISE_PRICE_ID → Only for plan detection
```

## What Works Without Stripe?

✅ **All Core Features Work:**
- Document upload & scrubbing
- Complete analysis (SWOT, QuickWins, Benchmark, etc.)
- All 8 analysis modules
- Document history
- PDF exports
- User authentication

❌ **What Doesn't Work:**
- Paid subscription upgrades
- Stripe payment processing
- Automatic plan management

## When to Set These Secrets

**Only set Stripe secrets if:**
1. You want to enable paid subscriptions
2. You have a Stripe account configured
3. You've created products in Stripe

## How to Set (When Ready)

### Step 1: Create Stripe Products
1. Go to https://dashboard.stripe.com/products
2. Create "Pro Plan" → Copy price ID
3. Create "Enterprise Plan" → Copy price ID
4. Get your Secret Key from https://dashboard.stripe.com/apikeys
5. Get Webhook Secret from https://dashboard.stripe.com/webhooks

### Step 2: Set Secrets
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set STRIPE_PRO_PRICE_ID=price_...
supabase secrets set STRIPE_ENTERPRISE_PRICE_ID=price_...
```

### Step 3: Deploy Webhook Function
```bash
supabase functions deploy stripe-webhook
```

## Current Priority

**Right now, focus on:**
1. ✅ Set `OPENAI_API_KEY` (REQUIRED for all analyses)
2. ✅ Deploy core Edge Functions
3. ✅ Test complete analysis flow
4. ⏳ Add Stripe later when needed

## Quick Test Without Stripe

The platform works perfectly without Stripe. All users can use the free tier features:
- Upload documents
- Run analyses
- View history
- Export PDFs

You can add monetization later!

---

**TL;DR:** Stripe secrets are optional. Your platform works fine without them. Focus on setting `OPENAI_API_KEY` first.
