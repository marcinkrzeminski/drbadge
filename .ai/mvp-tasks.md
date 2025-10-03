# FrogDR Clone - MVP Task Breakdown

## Zakres MVP

MVP koncentruje się na **core functionality**:

- ✅ Landing page z pricing
- ✅ Autentykacja (Google OAuth)
- ✅ Dashboard z listą domen
- ✅ Monitoring DR (dodawanie/usuwanie domen)
- ✅ Podstawowe wykresy historyczne
- ✅ Płatności Stripe (Free/Paid plan)
- ✅ Email notyfikacje o zmianach DR

**Pominięte w MVP** (do późniejszych iteracji):

- ❌ Leaderboard
- ❌ Gamifikacja (milestones, confetti, goals)
- ❌ Growth opportunities
- ❌ Blog/Public domain pages
- ❌ Admin dashboard
- ❌ Twitter OAuth (tylko Google)
- ❌ Zaawansowane notyfikacje (weekly recap)

---

## Phase 1: Setup & Configuration (Day 1)

### Project Setup

- [x] Create Next.js 15.5 app with TypeScript
- [x] Setup Tailwind CSS
- [x] Install shadcn/ui CLI
- [x] Add shadcn/ui components: Button, Card, Input, Dialog, Select
- [x] Configure `.env.local` with all required variables
- [x] Setup Git repository with `.gitignore`

### Dependencies

- [x] Install `@instantdb/react` and `@instantdb/admin`
- [x] Install `stripe` SDK
- [x] Install `recharts` for charts
- [x] Install `react-hook-form` + `zod`
- [x] Install `sonner` for toast notifications
- [x] Install `date-fns` for date handling

### InstantDB Setup

- [x] Create InstantDB account at instantdb.com
- [x] Create new app and get App ID
- [x] Get Admin Token from dashboard
- [x] Add to `.env.local`: `NEXT_PUBLIC_INSTANTDB_APP_ID`
- [x] Add to `.env.local`: `INSTANTDB_ADMIN_TOKEN`
- [x] Create `lib/instant-client.ts` for client-side
- [x] Create `lib/instant-server.ts` for server-side
- [x] Test connection with simple query

### External Services

- [x] Create Google OAuth app in Google Cloud Console
- [x] Configure redirect URLs for development and production
- [x] Add Google Client ID/Secret to `.env.local`
- [x] Create Stripe account
- [x] Get Stripe test API keys
- [x] Create Stripe product: Paid plan ($5/mo) - free plan handled in app
- [x] Add Stripe keys to `.env.local`
- [x] Register RapidAPI account
- [x] Subscribe to SEO Intelligence by KarmaLabs ($10 plan)
- [x] Add RapidAPI key to `.env.local`
- [x] Create Plunk account for emails
- [x] Add Plunk API key to `.env.local`

---

## Phase 2: Authentication (Day 2)

### InstantDB OAuth Configuration

- [x] Add Google Client ID/Secret to InstantDB dashboard
- [x] Configure OAuth provider in InstantDB
- [x] Test OAuth flow with redirect URL
- [x] Verify user creation on first login
- [x] InstantDB automatically stores email, name, avatar
- [x] Test OAuth flow end-to-end

### Auth Utilities

- [x] Create `lib/instant-client.ts` with auth exports
- [x] Export `useAuth` hook from InstantDB
- [x] Create protected route wrapper component
- [x] Handle authentication errors gracefully
- [x] Add sign out functionality using InstantDB

### InstantDB Users Schema

- [x] Define users collection in InstantDB schema:
  - id (string, primary) - auto-created by InstantDB
  - auth_id (string, indexed) - reference to $users.id
  - email (string, indexed) - from OAuth
  - subscription_status (string) // 'free' | 'paid' | 'cancelled'
  - stripe_customer_id (string)
  - subscription_ends_at (timestamp)
  - domains_limit (number) // 3 or 12
  - created_at (timestamp)
- [x] Push schema to InstantDB using instant-cli
- [x] Setup permissions for users collection
- [x] Test user initialization on first login

---

## Phase 3: Landing Page (Day 3)

### Layout & Navigation

- [x] Create `app/(marketing)/layout.tsx` for public pages
- [x] Build navigation header component
- [x] Add logo placeholder
- [x] Add "Sign In" button with Google OAuth
- [x] Create footer component

### Homepage Content

- [x] Create `app/(marketing)/page.tsx`
- [x] Build hero section with headline
- [x] Add value proposition text
- [x] Create CTA buttons (Sign Up with Google)
- [x] Implement Google OAuth button using InstantDB:

  ```tsx
  const url = db.auth.createAuthorizationURL({
    clientName: "google-web",
    redirectURL: window.location.href,
  });
  // Use url in <a> or <Link> component
  ```

- [x] Add hero image/illustration placeholder
- [x] Create features grid (3-4 key features)
- [x] Add social proof section (testimonials placeholder)

### Pricing Section

- [x] Create pricing comparison table
- [x] Build Free plan card:
  - 3 domains
  - Daily updates
  - Basic DR tracking
  - Email alerts (weekly)
- [x] Build Paid plan card ($5/mo):
  - 12 domains
  - 4x daily updates
  - Manual refresh
  - Backlinks data
  - Instant alerts
- [x] Add "Get Started" CTA buttons
- [x] Link to sign up with Google OAuth

### Responsive Design

- [x] Make landing page mobile-responsive
- [x] Test on mobile, tablet, desktop breakpoints
- [x] Optimize images for web

---

## Phase 4: Dashboard Foundation (Day 4)

### Dashboard Layout

- [x] Create `app/(dashboard)/layout.tsx` for authenticated pages
- [x] Build sidebar navigation
- [x] Add user profile section (avatar, name, email)
- [x] Add navigation items: Dashboard, Settings, Billing
- [x] Create mobile hamburger menu
- [x] Add sign out button

### Dashboard Home

- [x] Create `app/(dashboard)/dashboard/page.tsx`
- [x] Protect route with auth middleware
- [x] Show welcome message for new users
- [x] Display empty state with "Add your first domain" CTA
- [x] Show quick stats cards: Total Domains, Avg DR
- [x] Create "Add Domain" button

### Domains List Component

- [x] Create `components/domains/DomainList.tsx`
- [x] Fetch user's domains from InstantDB
- [x] Display domains in responsive grid
- [x] Show empty state when no domains
- [x] Add loading skeleton states
- [x] Handle real-time updates from InstantDB

---

## Phase 5: Domain Management (Day 5-6)

### InstantDB Domains Schema

- [x] Define domains collection:
  - id (string, primary)
  - user_id (string, indexed)
  - url (string, indexed)
  - normalized_url (string)
  - current_da (number)
  - previous_da (number)
  - da_change (number)
  - last_checked (timestamp)
  - created_at (timestamp)
  - deleted_at (timestamp, soft delete)

### Add Domain Modal

- [x] Create `components/domains/AddDomainModal.tsx`
- [x] Build form with URL input field
- [x] Add Zod validation for URL format
- [x] Normalize domain (remove https://, www)
- [x] Check for duplicate domains
- [x] Check user's domain limit (3 for free, 12 for paid)
- [x] Show upgrade prompt if limit reached
- [x] Save domain to InstantDB
- [x] Show success toast notification
- [x] Close modal and refresh list

### Domain Card Component

- [x] Create `components/domains/DomainCard.tsx` (integrated in DomainList)
- [x] Display domain URL
- [x] Show current DR score (large number)
- [x] Display DR change with arrow (↑↓→)
- [x] Show last updated timestamp
- [x] Add actions dropdown menu
- [x] Add "Refresh" action (paid only)
- [x] Add "Remove" action with confirmation
- [x] Implement soft delete (set deleted_at)

### Domain Actions

- [x] Create server action for adding domain (via InstantDB transact)
- [x] Create server action for removing domain (via InstantDB transact)
- [x] Fix query filtering for deleted_at field
- [x] Add UserInitializer for automatic user record creation
- [ ] Create API route for manual refresh (paid only)
- [ ] Add rate limiting for refresh action
- [x] Show loading states during actions
- [x] Handle errors with toast notifications

---

## Phase 6: SEO Intelligence Integration (Day 7-8)

### RapidAPI Service

- [ ] Create `lib/seo-intelligence.ts` service class
- [ ] Implement `getDomainMetrics(domain: string)` method
- [ ] Add proper headers (X-RapidAPI-Key, X-RapidAPI-Host)
- [ ] Parse API response for DR
- [ ] Handle API errors with retries (3 attempts)
- [ ] Log all API calls for debugging

### Caching Strategy

- [ ] Setup Upstash Redis for free tier
- [ ] Add Upstash credentials to `.env.local`
- [ ] Implement cache key pattern: `seo:${domain}`
- [ ] Set 24h TTL for cached responses
- [ ] Check cache before API call
- [ ] Store API response in cache after fetch

### Cost Tracking

- [ ] Create `api_usage` collection in InstantDB:
  - id (string, primary)
  - provider (string) // 'karmalabs'
  - domain (string)
  - cost (number) // 0.001
  - created_at (timestamp, indexed)
- [ ] Track every API call with cost
- [ ] Create function to calculate monthly spend
- [ ] Add budget check before API calls
- [ ] Log warning when 80% budget reached

### Domain Update Logic

- [ ] Create `app/api/domains/update/route.ts`
- [ ] Fetch fresh DA from SEO Intelligence API
- [ ] Update domain's current_da and previous_da
- [ ] Calculate da_change
- [ ] Create snapshot entry
- [ ] Return updated domain data

### Snapshots Schema

- [ ] Define dr_snapshots collection:
  - id (string, primary)
  - domain_id (string, indexed)
  - da_value (number)
  - backlinks (number, nullable)
  - referring_domains (number, nullable)
  - recorded_at (timestamp, indexed)
- [ ] Create snapshot on every DA update
- [ ] Store historical data for charts

---

## Phase 7: Data Visualization (Day 9)

### Chart Component

- [ ] Create `components/charts/DomainChart.tsx`
- [ ] Install and setup Recharts
- [ ] Fetch domain snapshots from InstantDB
- [ ] Format data for line chart (dates, DA values)
- [ ] Display line chart with DA over time
- [ ] Add hover tooltips with exact values
- [ ] Make chart responsive

### Time Range Selector

- [ ] Add time range buttons: 7d, 30d, 90d, All
- [ ] Filter snapshots by selected range
- [ ] Update chart when range changes
- [ ] Set default to 30 days

### Domain Detail Page

- [ ] Create `app/(dashboard)/domains/[id]/page.tsx`
- [ ] Display large DR score at top
- [ ] Show full historical chart
- [ ] Display DR change statistics
- [ ] Show backlinks count (paid only)
- [ ] Show referring domains count (paid only)
- [ ] Add back button to dashboard

### Sparkline on Dashboard

- [ ] Create `components/charts/Sparkline.tsx`
- [ ] Show mini 7-day trend chart
- [ ] Add to each domain card
- [ ] Remove axes for minimal look
- [ ] Add subtle gradient fill

---

## Phase 8: Stripe Payments (Day 10-11)

### Stripe Setup

- [ ] Install `@stripe/stripe-js` client library
- [ ] Create Stripe product in dashboard:
  - Paid Plan: $5/mo with all features
- [ ] Get price ID for paid plan
- [ ] Add to `.env.local`
- [ ] Note: Free plan handled in app logic (no Stripe product needed)

### Upgrade Flow

- [ ] Create `components/billing/UpgradeModal.tsx`
- [ ] Show feature comparison (Free vs Paid)
- [ ] Add "Upgrade to Paid" button
- [ ] Create Stripe Checkout session
- [ ] Redirect to Stripe hosted page
- [ ] Handle success redirect to dashboard
- [ ] Handle cancel redirect back to modal

### Stripe Checkout API

- [ ] Create `app/api/stripe/checkout/route.ts`
- [ ] Create Stripe Checkout Session
- [ ] Set mode to 'subscription'
- [ ] Add success_url and cancel_url
- [ ] Pass customer email from session
- [ ] Return checkout URL to client

### Webhook Handler

- [ ] Create `app/api/webhooks/stripe/route.ts`
- [ ] Verify webhook signature
- [ ] Handle `customer.subscription.created`
- [ ] Handle `customer.subscription.updated`
- [ ] Handle `customer.subscription.deleted`
- [ ] Handle `invoice.payment_failed`
- [ ] Update user in InstantDB:
  - subscription_status
  - stripe_customer_id
  - subscription_ends_at
  - domains_limit
- [ ] Log all webhook events

### Billing Page

- [ ] Create `app/(dashboard)/billing/page.tsx`
- [ ] Show current plan (Free/Paid)
- [ ] Display next billing date (if paid)
- [ ] Show payment method (last 4 digits)
- [ ] Add "Cancel Subscription" button
- [ ] Add "Update Payment Method" button
- [ ] Link to Stripe Customer Portal

### Plan Restrictions

- [ ] Check domains_limit before adding domain
- [ ] Show upgrade prompt when limit reached
- [ ] Disable manual refresh for free users
- [ ] Hide backlinks/referring domains for free users
- [ ] Allow instant alerts only for paid users

---

## Phase 9: Email Notifications (Day 12)

### Plunk Setup

- [ ] Create Plunk account at useplunk.com
- [ ] Verify domain for sending emails
- [ ] Add Plunk API key to `.env.local`
- [ ] Install `@plunk/node` npm package

### Email Templates

- [ ] Create `lib/email-templates.ts` for email content
- [ ] Create DA change notification template
- [ ] Design email HTML with branding
- [ ] Show domain name, old DA, new DA, change
- [ ] Add "View Dashboard" CTA button
- [ ] Make responsive for mobile

### Send Notification Logic

- [ ] Create `lib/email.ts` utility
- [ ] Implement `sendDaChangeEmail()` function
- [ ] Check if DA changed significantly (> 1 point)
- [ ] Check user's plan (free = daily batch, paid = instant)
- [ ] Send email via Plunk API
- [ ] Log email delivery
- [ ] Handle send failures gracefully

### Trigger on DA Update

- [ ] After updating domain DA, check for change
- [ ] If DA increased or decreased, trigger email
- [ ] For free users: queue for daily batch
- [ ] For paid users: send immediately
- [ ] Don't spam if multiple small changes

### Notification Settings

- [ ] Add settings to user profile
- [ ] Create toggle for DA change notifications
- [ ] Save preference in InstantDB users collection
- [ ] Respect user preference before sending

---

## Phase 10: Background Jobs (Day 13)

### Vercel Cron Setup

- [ ] Create `vercel.json` in root
- [ ] Define cron jobs configuration
- [ ] Add cron job for domain updates (every 12h)
- [ ] Add cron job for budget monitoring (daily)

### Auto-Update Domains Cron

- [ ] Create `app/api/cron/update-domains/route.ts`
- [ ] Verify request is from Vercel (check headers)
- [ ] Query all domains needing update:
  - Free users: last_checked > 24h ago
  - Paid users: last_checked > 6h ago
- [ ] Process in batches of 50
- [ ] For each domain:
  - Fetch fresh DA from API
  - Update domain record
  - Create snapshot
  - Trigger email if changed
- [ ] Log results and errors
- [ ] Return status summary

### Budget Monitor Cron

- [ ] Create `app/api/cron/monitor-budget/route.ts`
- [ ] Calculate total API cost for current month
- [ ] Check against monthly budget ($50)
- [ ] If > 80%, send warning email to admin
- [ ] If > 100%, set flag to pause updates
- [ ] Log budget status

### Manual Refresh for Paid Users

- [ ] Create `app/api/domains/refresh/route.ts`
- [ ] Check user is authenticated
- [ ] Check user has paid plan
- [ ] Check rate limit (max 10/hour)
- [ ] Check budget is available
- [ ] Fetch fresh DA immediately
- [ ] Update domain and create snapshot
- [ ] Return updated data to client

---

## Phase 11: Settings & Account (Day 14)

### Settings Page

- [ ] Create `app/(dashboard)/settings/page.tsx`
- [ ] Show user profile info (name, email, avatar)
- [ ] Display account creation date
- [ ] Show current plan status

### Notification Preferences

- [ ] Add toggle for DA change emails
- [ ] Add toggle for weekly recap (coming soon - disabled)
- [ ] Save preferences to InstantDB
- [ ] Update in real-time

### Data Export (GDPR)

- [ ] Add "Export My Data" button
- [ ] Create `app/api/export-data/route.ts`
- [ ] Fetch all user's data (domains, snapshots)
- [ ] Format as JSON
- [ ] Return as downloadable file

### Account Deletion

- [ ] Add "Delete Account" button
- [ ] Show warning modal with consequences
- [ ] Require confirmation
- [ ] Soft delete user (set deleted_at)
- [ ] Cancel Stripe subscription if active
- [ ] Clear session and redirect to landing

---

## Phase 12: Polish & Testing (Day 15-16)

### Error Handling

- [ ] Add error boundaries for React components
- [ ] Create custom 404 page
- [ ] Create custom 500 error page
- [ ] Add Sentry for error tracking
- [ ] Set up Sentry in `.env.local`
- [ ] Test error scenarios

### Loading States

- [ ] Add loading skeletons for dashboard
- [ ] Show spinners during API calls
- [ ] Add progress indicators for long operations
- [ ] Test all loading states

### Form Validation

- [ ] Validate domain URL format
- [ ] Show inline error messages
- [ ] Prevent duplicate submissions
- [ ] Add client-side validation with Zod

### Responsive Design

- [ ] Test on mobile (375px, 414px)
- [ ] Test on tablet (768px, 1024px)
- [ ] Test on desktop (1280px, 1920px)
- [ ] Fix any layout issues
- [ ] Test navigation on mobile

### Performance

- [ ] Run Lighthouse audit
- [ ] Optimize images with Next.js Image
- [ ] Enable static generation where possible
- [ ] Add meta tags for SEO
- [ ] Test page load times

### Cross-browser Testing

- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge
- [ ] Fix any browser-specific issues

---

## Phase 13: Deployment (Day 17)

### Vercel Setup

- [ ] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Configure project settings
- [ ] Add all environment variables:
  - NEXT_PUBLIC_INSTANTDB_APP_ID
  - INSTANTDB_ADMIN_TOKEN
  - NEXTAUTH_SECRET
  - NEXTAUTH_URL
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET
  - STRIPE_SECRET_KEY
  - STRIPE_WEBHOOK_SECRET
  - RAPIDAPI_KEY
  - PLUNK_API_KEY
  - UPSTASH_REDIS_URL
  - SENTRY_DSN

### Production OAuth

- [ ] Update Google OAuth redirect URLs for production domain
- [ ] Test OAuth flow in production
- [ ] Verify InstantDB auth works on production

### Production Stripe

- [ ] Switch to Stripe live mode
- [ ] Create live products and prices
- [ ] Update webhook endpoints
- [ ] Test live checkout flow
- [ ] Verify webhook delivery

### Domain & DNS

- [ ] Purchase domain name
- [ ] Configure DNS in Vercel
- [ ] Add custom domain to project
- [ ] Enable SSL certificate
- [ ] Test HTTPS

### Final Checks

- [ ] Test OAuth flow in production
- [ ] Test domain add/remove flow
- [ ] Test payment flow with real card
- [ ] Test email delivery
- [ ] Test cron jobs execution
- [ ] Verify API limits and budgets

### Monitoring

- [ ] Enable Vercel Analytics
- [ ] Setup Sentry alerts
- [ ] Create Uptime monitor (UptimeRobot)
- [ ] Setup Google Analytics (optional)

---

## Post-Launch (Week 1)

### Immediate Fixes

- [ ] Monitor error logs
- [ ] Fix any critical bugs
- [ ] Optimize slow queries
- [ ] Adjust rate limits if needed

### User Feedback

- [ ] Add feedback widget
- [ ] Monitor user complaints
- [ ] Track feature requests
- [ ] Plan next iteration

---

## Summary

**Total MVP Tasks: ~150**
**Estimated Time: 17 days** (1 developer, full-time)
**Core Tech Stack:**

- Next.js 15.5 + TypeScript
- InstantDB (real-time database + auth)
- Stripe (payments)
- RapidAPI SEO Intelligence (DA tracking)
- Plunk (emails)
- Vercel (hosting + cron)

**MVP delivers:**
✅ Working product that users can sign up for and pay
✅ Core value: Track DR for up to 12 domains
✅ Revenue generation from day 1
✅ Foundation for future features
