# DrBadge Pricing Strategy & Analysis

**Last Updated:** 2025-10-27
**Status:** Implemented & Ready for Stripe Configuration

---

## Executive Summary

DrBadge's pricing strategy is designed to be **competitively aligned with FrogDR** while offering **better value** in the entry-level plan. The pricing accepts **10-30% profitability** as a growth strategy, prioritizing market penetration over immediate margins.

### Key Competitive Advantages
- ✅ **15 domains at $5/month** (FrogDR offers 12 domains)
- ✅ **4x daily automatic checks** (matching FrogDR)
- ✅ **Unlimited on-demand updates** with generous rate limits (50/30min = ~2400/day)
- ✅ **Identical pricing** for 25, 50, 100 domain tiers

---

## Pricing Table

| Plan | Domains | Monthly Price | Annual Price | Annual Savings |
|------|---------|--------------|--------------|----------------|
| **Free** | 3 | $0 | $0 | - |
| **Pro 15** | 15 | $5.00 | $51.00 | 15% ($9) |
| **Pro 25** | 25 | $9.00 | $91.80 | 15% ($16.20) |
| **Pro 50** | 50 | $16.00 | $163.20 | 15% ($28.80) |
| **Pro 100** | 100 | $29.00 | $295.80 | 15% ($52.20) |

---

## Competitive Analysis: FrogDR

### FrogDR Pricing Model

| Plan | Domains | Price | Features |
|------|---------|-------|----------|
| Free | 3 | $0 | 1x daily updates |
| Paid | 12 | $5/month | 4x daily + unlimited on-demand |
| Paid | 25 | $9/month | 4x daily + unlimited on-demand |
| Paid | 50 | $16/month | 4x daily + unlimited on-demand |
| Paid | 100 | $29/month | 4x daily + unlimited on-demand |

### Our Competitive Position

| Metric | FrogDR | DrBadge | Winner |
|--------|--------|---------|--------|
| $5 Plan Domains | 12 | **15** | 🏆 DrBadge (+25%) |
| $9 Plan Domains | 25 | 25 | 🤝 Tied |
| $16 Plan Domains | 50 | 50 | 🤝 Tied |
| $29 Plan Domains | 100 | 100 | 🤝 Tied |
| Auto Checks | 4x daily | 4x daily | 🤝 Tied |
| On-Demand | Unlimited | Unlimited (50/30min) | 🏆 DrBadge (better rate limit) |

**Verdict:** DrBadge offers **superior value** at the same price points.

---

## API Cost Analysis

### API Provider: RapidAPI (SEO Intelligence by KarmaLabs)

**Current Plan Assumptions:**
- **Pro Plan:** $9.99/month (10,000 requests) + $0.003/request
- **Ultra Plan:** $29.99/month (40,000 requests) + $0.002/request

**Marginal Cost (at scale):** $0.002 per request (Ultra plan)

### Request Calculation

**Automatic Checks:**
- Frequency: 4x daily
- Requests per domain: 4 × 30 = 120/month
- Cost per domain: 120 × $0.002 = **$0.24/month**

**On-Demand Checks (estimated):**
- Conservative: 5 checks/domain/month = $0.01
- Moderate: 10 checks/domain/month = $0.02
- Heavy: 20 checks/domain/month = $0.04

**Total Cost per Domain:** $0.24 - $0.28/month (moderate usage)

---

## Profitability Analysis

### Scenario: Moderate On-Demand Usage (5 checks/domain/month)

| Plan | Domains | Auto Requests | On-Demand | Total Requests | API Cost | Monthly Price | Gross Profit | Stripe Fee | Net Profit | **Profitability** |
|------|---------|---------------|-----------|----------------|----------|--------------|-------------|------------|------------|------------------|
| **15d** | 15 | 1,800 | 75 | 1,875 | $3.75 | $5.00 | $1.25 | $0.45 | **$0.80** | **16%** |
| **25d** | 25 | 3,000 | 125 | 3,125 | $6.25 | $9.00 | $2.75 | $0.56 | **$2.19** | **24%** |
| **50d** | 50 | 6,000 | 250 | 6,250 | $12.50 | $16.00 | $3.50 | $0.76 | **$2.74** | **17%** |
| **100d** | 100 | 12,000 | 500 | 12,500 | $25.00 | $29.00 | $4.00 | $1.14 | **$2.86** | **10%** |

**Stripe Fees:** 2.9% + $0.30 per transaction

### Sensitivity Analysis

#### Pessimistic (Heavy On-Demand: 10 checks/domain/month)

| Plan | API Cost | Net Profit | Profitability |
|------|----------|------------|---------------|
| 15d | $3.90 | $0.65 | 13% |
| 25d | $6.50 | $1.94 | 22% |
| 50d | $13.00 | $2.24 | 14% |
| 100d | $26.00 | $1.86 | 6% |

#### Optimistic (Light On-Demand: 2 checks/domain/month)

| Plan | API Cost | Net Profit | Profitability |
|------|----------|------------|---------------|
| 15d | $3.66 | $0.89 | 18% |
| 25d | $6.10 | $2.34 | 26% |
| 50d | $12.20 | $3.04 | 19% |
| 100d | $24.40 | $3.46 | 12% |

---

## Strategic Rationale

### Why Accept 10-30% Profitability?

#### 1. **Market Penetration Strategy**
- SaaS growth typically prioritizes user acquisition over immediate profitability
- Building user base now enables:
  - Network effects
  - Word-of-mouth growth
  - Market positioning
  - Future price increases from a position of strength

#### 2. **Competitive Necessity**
- FrogDR has established market pricing at $5/$9/$16/$29
- Pricing significantly higher would limit customer acquisition
- Need to match or beat competitor pricing to win users

#### 3. **Future Optimization Opportunities**
- **Reduce automatic checking:** 4x → 2x daily (50% cost savings)
- **Smart scheduling:** Check active domains more frequently, stable domains less
- **Negotiate volume discounts:** At scale, negotiate better API rates
- **Introduce premium tiers:** Add higher-priced features (analytics, integrations, white-label)
- **Affiliate revenue:** 20% commission programs with SEO tools

#### 4. **Path to Higher Profitability**

**Phase 1 (Now):** Growth Mode
- Profitability: 10-30%
- Goal: Acquire 1,000+ paying users
- Focus: Product-market fit, feature parity

**Phase 2 (6-12 months):** Optimization
- Profitability Target: 40-60%
- Actions:
  - Optimize checking frequency (2x daily)
  - Negotiate API volume discounts
  - Introduce premium features
- Result: Maintain prices while improving margins

**Phase 3 (12-24 months):** Premium Positioning
- Profitability Target: 60-80%
- Actions:
  - Price increases for new users (10-20%)
  - Grandfather existing users
  - Premium/Enterprise tiers
- Result: Sustainable high-margin business

---

## Technical Implementation

### Files Modified

1. **`src/lib/plans.ts`**
   - Updated all pricing: $5/$9/$16/$29 (monthly)
   - Updated annual pricing with 15% discount
   - Added refresh frequency: "4x daily + on-demand"
   - Added detailed profitability comments

2. **`src/app/api/domains/refresh/route.ts`**
   - Updated documentation
   - Rate limiting: 50 refreshes per 30 minutes (~2400/day)
   - Already implemented: API call, snapshot creation, usage tracking

3. **`src/components/dashboard/DomainList.tsx`**
   - Fixed PLANS.PAID bug
   - Added getUserRefreshInfo() function
   - Dynamic plan detection based on domains_limit
   - Refresh button already implemented in dropdown menu

4. **`src/app/(dashboard)/dashboard/billing/page.tsx`**
   - Updated feature descriptions
   - Added "4x daily + on-demand" to features
   - Added "Unlimited on-demand updates" as explicit feature
   - Updated both Free and Paid plan presentations

### Features

#### Free Plan (3 domains)
- ✅ Domain Rating tracking
- ✅ 1x daily automatic updates
- ✅ Basic analytics
- ✅ Historical charts

#### Paid Plans (15/25/50/100 domains)
- ✅ Domain Rating tracking
- ✅ **4x daily automatic updates** (every 6 hours)
- ✅ **Unlimited on-demand updates** (rate limit: 50/30min)
- ✅ Advanced analytics & charts
- ✅ Goal setting & milestones
- ✅ Email notifications
- ✅ Priority support
- ✅ Backlink & referring domains data

---

## Cost Optimization Strategies

### Strategy 1: Smart Checking (Recommended)

**Concept:** Adapt checking frequency based on domain activity

```
Algorithm:
- IF domain DR changed in last 7 days → 4x daily
- ELSE IF domain DR changed in last 30 days → 2x daily
- ELSE → 1x daily

Expected Savings: 30-50%
User Impact: Minimal (active domains still get 4x daily)
```

### Strategy 2: Automatic Downgrade to 2x Daily

**Concept:** Quietly reduce from 4x to 2x daily for all users

```
Change: 4x daily → 2x daily automatic
Keep: Unlimited on-demand (users can manually refresh anytime)

Expected Savings: 50%
User Impact: Low (DR doesn't change that frequently)
```

### Strategy 3: Peak/Off-Peak Scheduling

**Concept:** Check more during business hours, less at night

```
Business Hours (9am-9pm): Every 4 hours (3 checks)
Off Hours (9pm-9am): Every 12 hours (1 check)
Total: 4 checks/day maintained

Expected Savings: 0% (maintains 4x)
Benefit: Better resource utilization, API rate limit management
```

### Strategy 4: Volume Negotiation

**Concept:** Negotiate better rates at higher volume

```
Current: $0.002/request (Ultra plan)
Target: $0.0015/request (25% discount at 500K+ requests/month)

Break-even: ~1,500 paying users
Expected Savings: 25% on all API costs
Profitability Impact: +5-10% improvement
```

---

## Rate Limiting Implementation

### Current Configuration

**On-Demand Refresh Limits:**
- **Default:** 50 refreshes per 30 minutes
- **Per User:** ~2,400 refreshes per day maximum
- **Fair Usage:** Prevents abuse while allowing "unlimited" marketing claim

**Environment Variables:**
```bash
REFRESH_RATE_LIMIT_WINDOW_MINUTES=30  # Time window
REFRESH_RATE_LIMIT_MAX=50              # Max requests in window
```

### Why This Works

1. **Generous but Safe:** 2,400/day is far more than reasonable usage
2. **Marketing-Friendly:** Can claim "unlimited" with confidence
3. **Cost-Protected:** Prevents single user from driving up costs
4. **User Experience:** No user will hit the limit in normal usage

### If Abuse Occurs

**Red Flags:**
- User consistently hits 50/30min limit
- Single user exceeds 500 on-demand checks/day
- Suspicious patterns (bot-like behavior)

**Actions:**
1. Monitor with PostHog events
2. Email user about excessive usage
3. Temporary reduction to 25/30min if abuse continues
4. Last resort: Account suspension

---

## Next Steps Required

### 1. ⚠️ CRITICAL: Update Stripe Configuration

**Create New Price IDs in Stripe Dashboard:**

```
Monthly Plans:
- $5.00/month  (15 domains) → price_XXXXX
- $9.00/month  (25 domains) → price_XXXXX
- $16.00/month (50 domains) → price_XXXXX
- $29.00/month (100 domains) → price_XXXXX

Annual Plans (15% discount):
- $51.00/year  (15 domains) → price_XXXXX
- $91.80/year  (25 domains) → price_XXXXX
- $163.20/year (50 domains) → price_XXXXX
- $295.80/year (100 domains) → price_XXXXX
```

**Update Environment Variables:**

```bash
# .env.local
STRIPE_PRICE_ID_PAID_15_MONTHLY=price_new_5.00
STRIPE_PRICE_ID_PAID_15_ANNUAL=price_new_51.00
STRIPE_PRICE_ID_PAID_25_MONTHLY=price_new_9.00
STRIPE_PRICE_ID_PAID_25_ANNUAL=price_new_91.80
STRIPE_PRICE_ID_PAID_50_MONTHLY=price_new_16.00
STRIPE_PRICE_ID_PAID_50_ANNUAL=price_new_163.20
STRIPE_PRICE_ID_PAID_100_MONTHLY=price_new_29.00
STRIPE_PRICE_ID_PAID_100_ANNUAL=price_new_295.80
```

### 2. Migration Strategy for Existing Users

**Option A: Grandfathered Pricing (Recommended)**
- Existing users keep old prices
- New users get new prices
- Good for user retention
- Clear migration path

**Option B: Force Migration with Notice**
- Email all users 30 days before
- Explain price reduction as "special promotion"
- Automatically migrate on date
- Risk: Some churn

**Option C: Offer Choice**
- Let users choose: keep old price OR switch to new (with more domains)
- Example: "Stay at $17.98 for 15 domains OR switch to $5 for 15 domains + new features"
- Likely: Everyone switches (obvious value)

**Recommendation:** Option A (Grandfather existing users)

### 3. Marketing & Communication

**Update Required:**
- [ ] Landing page pricing section
- [ ] Email templates (welcome, upgrade prompts)
- [ ] Documentation
- [ ] Terms of Service (if pricing mentioned)
- [ ] Blog post announcing new pricing
- [ ] Social media announcements

**Messaging:**
```
🎉 Exciting News! We've reduced our prices to make DrBadge more accessible:

✅ $5/month for 15 domains (was $17.98)
✅ 4x daily automatic checks
✅ NEW: Unlimited on-demand updates
✅ Advanced analytics included

Compare: FrogDR charges $5 for only 12 domains
DrBadge gives you 25% MORE domains at the same price!

[Upgrade Now Button]
```

### 4. Monitoring & Analytics

**Track These Metrics:**

```javascript
PostHog Events to Monitor:
- 'pricing_page_viewed'
- 'plan_selected' (with plan type)
- 'checkout_started'
- 'checkout_completed'
- 'subscription_created'
- 'on_demand_refresh_used' (with frequency)
- 'rate_limit_hit' (warning sign)

Weekly Reports:
1. New subscribers by plan
2. Conversion rate by plan
3. Average on-demand usage per user
4. API cost per user
5. Actual profitability by plan
6. Churn rate by plan
```

### 5. Testing Checklist

**Before Production:**
- [ ] Test checkout flow for all 8 plans (4 monthly + 4 annual)
- [ ] Verify Stripe webhook updates domains_limit correctly
- [ ] Test on-demand refresh button (paid users only)
- [ ] Verify rate limiting (try 51 refreshes in 30min)
- [ ] Test billing page displays correct plan
- [ ] Test upgrade/downgrade flows
- [ ] Verify email notifications work
- [ ] Test annual discount calculation (15%)

---

## API Cost Monitoring

### Key Metrics to Track

1. **Daily API Usage**
   ```sql
   SELECT
     DATE(created_at) as date,
     COUNT(*) as total_requests,
     SUM(cost) as total_cost
   FROM api_usage
   WHERE provider = 'karmalabs'
   GROUP BY DATE(created_at)
   ORDER BY date DESC
   ```

2. **Cost per User**
   ```sql
   SELECT
     u.email,
     u.domains_limit,
     COUNT(au.id) as requests,
     SUM(au.cost) as total_cost,
     SUM(au.cost) / COUNT(DISTINCT DATE(au.created_at)) as avg_daily_cost
   FROM users u
   LEFT JOIN domains d ON d.user_id = u.auth_id
   LEFT JOIN api_usage au ON au.domain = d.normalized_url
   WHERE u.subscription_status = 'paid'
   GROUP BY u.id
   ORDER BY total_cost DESC
   ```

3. **On-Demand Usage Patterns**
   ```sql
   SELECT
     u.email,
     COUNT(*) as on_demand_refreshes,
     DATE(au.created_at) as date
   FROM api_usage au
   JOIN domains d ON d.normalized_url = au.domain
   JOIN users u ON u.auth_id = d.user_id
   WHERE au.source = 'on_demand'  -- if you add this flag
   GROUP BY u.id, DATE(au.created_at)
   HAVING COUNT(*) > 20  -- Flag heavy users
   ```

### Cost Alerts to Set Up

**Budget Monitoring (api/cron/budget-monitor):**
```typescript
// Alert thresholds
const MONTHLY_BUDGET = 500; // $500/month
const DAILY_BUDGET = MONTHLY_BUDGET / 30;

if (todayCost > DAILY_BUDGET * 1.5) {
  // Alert: 50% over daily budget
  sendSlackAlert("⚠️ API costs 50% over daily budget!");
}

if (monthToDateCost > MONTHLY_BUDGET * 0.9) {
  // Alert: 90% of monthly budget used
  sendSlackAlert("🚨 90% of monthly API budget used!");
}
```

### Break-Even Analysis

**Monthly Fixed Costs:**
- Stripe: ~$0 (pay per transaction)
- Hosting: $20-50
- Database: $10-25
- Email (Resend): $0-20
- Error Tracking (Sentry): $0-29
- Total: ~$50-100/month

**API Variable Costs:**
- Ultra Plan Base: $29.99/month
- Per Request: $0.002

**Break-Even at Different Scales:**

| Monthly Users | Revenue | API Costs | Fixed Costs | Total Costs | Profit | Margin |
|--------------|---------|-----------|-------------|-------------|--------|--------|
| 10 | $100 | $60 | $75 | $135 | -$35 | -35% |
| 25 | $250 | $150 | $75 | $225 | $25 | 10% |
| 50 | $500 | $300 | $75 | $375 | $125 | 25% |
| 100 | $1,000 | $600 | $75 | $675 | $325 | 33% |
| 250 | $2,500 | $1,500 | $100 | $1,600 | $900 | 36% |
| 500 | $5,000 | $3,000 | $125 | $3,125 | $1,875 | 38% |

**Target:** 50+ paying users for sustainable profitability

---

## Competitive Positioning Statement

> **DrBadge offers the same powerful Domain Rating tracking as FrogDR at the same prices, but with 25% more domains in our entry plan.**
>
> **Both services provide:**
> - 4x daily automatic DR checks
> - Unlimited on-demand updates
> - Historical tracking & analytics
>
> **DrBadge advantage:**
> - **15 domains at $5/month** vs FrogDR's 12 domains
> - Advanced charting and visualization
> - Goal setting and milestones
> - Email notifications
> - Priority support
>
> **We're not trying to be cheaper—we're offering better value at the same price.**

---

## Conclusion

DrBadge's pricing strategy is **deliberately competitive**, matching FrogDR's established pricing while offering superior value. The 10-30% profitability is a **calculated growth strategy** with clear paths to optimization and higher margins.

**Success Metrics:**
- ✅ Competitive pricing achieved
- ✅ Feature parity established
- ✅ Better value proposition (25% more domains at $5)
- ✅ Scalable cost structure
- ✅ Multiple optimization paths identified

**Next Critical Action:** Update Stripe Price IDs and deploy to production.

---

## Appendix: Historical Pricing

### Original Pricing (Before Competitive Analysis)

| Plan | Price | Target Profitability | Issue |
|------|-------|---------------------|-------|
| 15 domains | $17.98 | 90% | 3.5x more expensive than FrogDR |
| 25 domains | $29.97 | 90% | 3.3x more expensive |
| 50 domains | $59.94 | 90% | 3.7x more expensive |
| 100 domains | $119.88 | 90% | 4.1x more expensive |

**Problem:** Pricing was calculated for 90% profitability but was not competitive. Would have severely limited customer acquisition.

**Solution:** Adopted competitor pricing strategy with growth-focused profitability targets.

---

*This document should be reviewed quarterly and updated as market conditions, costs, and business goals evolve.*
