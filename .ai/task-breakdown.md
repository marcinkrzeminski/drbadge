# FrogDR Clone - Task Breakdown (Next.js 15.5 + InstantDB)

## Phase 0: Setup & Configuration (Day 1-2)

### Environment Setup
- [ ] Install Node.js 22 LTS
- [ ] Create Next.js 15.5 app with create-next-app
- [ ] Choose TypeScript, ESLint, Tailwind CSS
- [ ] Setup App Router structure
- [ ] Configure .env.local file
- [ ] Setup Git repository
- [ ] Create .gitignore with Next.js defaults
- [ ] Install additional dependencies:
  - [ ] @instantdb/react and @instantdb/admin for database
  - [ ] stripe for payments
  - [ ] react-hook-form + zod
  - [ ] shadcn/ui components
  - [ ] recharts for visualizations

### InstantDB Setup (Primary Database)
- [ ] Create InstantDB account
- [ ] Get App ID and Admin Token
- [ ] Create new InstantDB app instance
- [ ] Define schema for all collections:
  - [ ] users collection
  - [ ] domains collection
  - [ ] dr_snapshots collection
  - [ ] api_usage collection (for tracking)
- [ ] Install @instantdb/react and @instantdb/admin
- [ ] Create lib/instant-client.ts for client-side
- [ ] Create lib/instant-server.ts for server-side
- [ ] Test InstantDB connection
- [ ] Verify real-time sync is working

### External Services Setup
- [ ] Register Google OAuth application in Google Cloud Console
- [ ] Get Google Client ID and Secret
- [ ] Configure OAuth redirect URL: https://api.instantdb.com/runtime/oauth/callback
- [ ] Add Google OAuth to InstantDB dashboard
- [ ] Create Stripe account
- [ ] Get Stripe API keys (test mode)
- [ ] Create Stripe products and prices
- [ ] Setup Stripe webhook endpoint
- [ ] Register for RapidAPI account
- [ ] Subscribe to SEO Intelligence by KarmaLabs
- [ ] Get RapidAPI key
- [ ] Setup Plunk account for emails at useplunk.com
- [ ] Get Plunk API key
- [ ] Setup Vercel account for deployment
- [ ] Connect GitHub repo to Vercel

## Phase 1: Authentication System (Day 3-4)

### InstantDB OAuth Configuration
- [ ] Add Google Client ID/Secret to InstantDB dashboard
- [ ] Configure OAuth settings in InstantDB
- [ ] Test OAuth flow in development
- [ ] Create client-side auth component using InstantDB hooks
- [ ] Implement useAuth() from @instantdb/react
- [ ] Setup auth state management
- [ ] Create protected route wrapper
- [ ] Handle OAuth success redirect
- [ ] Handle OAuth error states

### Session Management
- [ ] InstantDB handles sessions automatically via JWT
- [ ] Create client-side auth hooks wrapper
- [ ] Setup auth state in React context (if needed)
- [ ] Create signOut handler using InstantDB
- [ ] Handle session expiry
- [ ] Test session persistence

### User Model & InstantDB Integration
- [ ] Define users schema in InstantDB
- [ ] Add email and name fields
- [ ] InstantDB automatically creates users on OAuth
- [ ] Create utility functions for user data
- [ ] Test user creation flow
- [ ] Test user login flow
- [ ] Verify real-time sync between sessions

## Phase 2: Landing Page & Marketing (Day 5-6)

### Homepage Layout
- [ ] Create resources/views/layouts/guest.blade.php
- [ ] Add meta tags and SEO basics
- [ ] Include Tailwind CSS
- [ ] Create navigation component
- [ ] Add logo placeholder
- [ ] Create resources/views/welcome.blade.php
- [ ] Build hero section
- [ ] Add headline text
- [ ] Add subheadline text
- [ ] Create CTA buttons
- [ ] Add hero image/illustration placeholder

### Feature Sections
- [ ] Create features grid section
- [ ] Add "Track Progress" feature card
- [ ] Add "Multi-Domain" feature card
- [ ] Add "Notifications" feature card
- [ ] Add "Leaderboard" feature card
- [ ] Create screenshot section
- [ ] Add dashboard mockup image
- [ ] Create stats counter section
- [ ] Add "8000+ domains" counter
- [ ] Add testimonials section
- [ ] Create testimonial cards
- [ ] Add avatar placeholders

### Pricing Table
- [ ] Create pricing section
- [ ] Build pricing card component
- [ ] Create Free plan card
- [ ] List free features
- [ ] Create Paid plan card
- [ ] List paid features
- [ ] Add price tag ($5/mo)
- [ ] Create comparison table
- [ ] Add feature rows
- [ ] Add checkmark/cross icons
- [ ] Create upgrade CTA buttons

### Footer
- [ ] Create footer component
- [ ] Add copyright text
- [ ] Add legal links placeholder
- [ ] Add social media icons
- [ ] Create newsletter signup form
- [ ] Style with Tailwind

## Phase 3: Dashboard Foundation (Day 7-9)

### Dashboard Layout
- [ ] Create resources/views/layouts/app.blade.php
- [ ] Build sidebar navigation
- [ ] Add logo to sidebar
- [ ] Create navigation menu items
- [ ] Add user profile section
- [ ] Create main content area
- [ ] Add top header bar
- [ ] Include user dropdown menu
- [ ] Add logout link
- [ ] Create mobile responsive menu
- [ ] Add hamburger menu icon
- [ ] Build mobile slide-out nav

### Dashboard Home View
- [ ] Create resources/views/dashboard/index.blade.php
- [ ] Create DashboardController
- [ ] Add route for /dashboard
- [ ] Apply auth middleware
- [ ] Create welcome message for empty state
- [ ] Add "Add your first domain" CTA
- [ ] Create quick stats cards section
- [ ] Add total domains counter
- [ ] Add average DR display
- [ ] Add recent activity feed placeholder

### Livewire Dashboard Component
- [ ] Create app/Livewire/Dashboard.php
- [ ] Define component properties
- [ ] Create render() method
- [ ] Create resources/views/livewire/dashboard.blade.php
- [ ] Add loading states
- [ ] Implement wire:poll for updates
- [ ] Add refresh button
- [ ] Test component rendering
- [ ] Add error handling

## Phase 4: Domain Management (Day 10-12)

### Domain Model & Database
- [ ] Create Domain model extending InstantDBModel
- [ ] Define collection as 'domains'
- [ ] Add fields: url, normalized_url, current_da
- [ ] Add user_id for relationship
- [ ] Add timestamps handling
- [ ] Create app/Repositories/DomainRepository.php
- [ ] Implement addDomain() with InstantDB
- [ ] Implement getUserDomains() with InstantDB
- [ ] Implement deleteDomain() with InstantDB
- [ ] Test real-time updates between users

### Add Domain Modal
- [ ] Create Livewire AddDomainModal component
- [ ] Create modal blade template
- [ ] Add form input for URL
- [ ] Add URL validation rules
- [ ] Normalize URL (remove https://, www)
- [ ] Check for duplicate domains
- [ ] Check user's domain limit (3 for free)
- [ ] Show error messages
- [ ] Show loading state during add
- [ ] Close modal on success
- [ ] Refresh dashboard after add
- [ ] Add fade-in animation

### Domain Card Component
- [ ] Create Livewire DomainCard component
- [ ] Design card layout
- [ ] Display domain URL
- [ ] Show current DR score
- [ ] Add DR change indicator (↑↓)
- [ ] Show last updated timestamp
- [ ] Add actions dropdown
- [ ] Include refresh action
- [ ] Include remove action
- [ ] Add confirmation dialog for remove
- [ ] Implement soft delete
- [ ] Add restore option

### Domain List View
- [ ] Create domains grid layout
- [ ] Make responsive (1-3 columns)
- [ ] Add empty state message
- [ ] Implement domain sorting
- [ ] Sort by DR
- [ ] Sort by name
- [ ] Sort by date added
- [ ] Add search/filter input
- [ ] Implement live search with Livewire
- [ ] Add pagination (if >9 domains)

## Phase 5: RapidAPI Integration - KarmaLabs SEO Intelligence (Day 13-15)

### RapidAPI Account Setup
- [ ] Create RapidAPI account
- [ ] Subscribe to SEO Intelligence by KarmaLabs
- [ ] Choose Basic plan ($10/mo for 10k requests)
- [ ] Get API key from dashboard
- [ ] Test endpoint in RapidAPI playground
- [ ] Verify response format
- [ ] Check rate limits (if any)
- [ ] Save example responses for testing

### SEO Intelligence Service Class
- [ ] Create app/Services/SEOIntelligenceService.php
- [ ] Add RapidAPI configuration to .env
- [ ] Set RAPIDAPI_KEY in .env
- [ ] Set RAPIDAPI_HOST=seo-intelligence.p.rapidapi.com
- [ ] Create getDomainMetrics() method
- [ ] Add proper headers (X-RapidAPI-Key, X-RapidAPI-Host)
- [ ] Implement domain normalization
- [ ] Parse API response
- [ ] Handle null/missing fields gracefully
- [ ] Add error handling for failed requests
- [ ] Implement retry logic (3 attempts)
- [ ] Log all API calls for debugging

### Caching Strategy (Critical for cost savings)
- [ ] Implement Redis caching
- [ ] Set 24h cache for paid users
- [ ] Set 48h cache for free users  
- [ ] Create cache key pattern "seo_intel:{domain}"
- [ ] Add cache warming for active domains
- [ ] Implement cache invalidation command
- [ ] Monitor cache hit ratio
- [ ] Add cache fallback if API fails
- [ ] Create manual cache clear option (admin only)

### Cost Tracking System
- [ ] Create api_usage table migration
- [ ] Track: provider, endpoint, domain, cost, timestamp
- [ ] Set cost per request at $0.001
- [ ] Create ApiUsageRepository
- [ ] Implement daily cost calculation
- [ ] Implement monthly cost calculation  
- [ ] Create budget alerts at 80% usage
- [ ] Add hard stop at 100% budget
- [ ] Create cost dashboard for admin
- [ ] Add projected monthly cost calculation

### Domain Update Strategy (Budget-Optimized)
- [ ] Create smart update scheduler
- [ ] Free users: update only on login (max 1x/day)
- [ ] Paid users: update 2x daily (morning & evening)
- [ ] Inactive domains: update 1x/week only
- [ ] New domains: immediate first check
- [ ] Implement "last_active" tracking
- [ ] Skip updates for users inactive 7+ days
- [ ] Create manual refresh for paid (deduct from budget)
- [ ] Add "force refresh" admin option
- [ ] Log all update decisions for analysis

### Budget Management 
- [ ] Set monthly budget to $10 in config
- [ ] Calculate max requests: 10,000/month
- [ ] Daily limit: ~333 requests
- [ ] Implement getBudgetRemaining() method
- [ ] Create isOverBudget() check
- [ ] Add emergency stop if budget exceeded
- [ ] Email admin at 80% budget usage
- [ ] Create budget reset on 1st of month
- [ ] Add budget override for critical domains
- [ ] Display budget status in admin dashboard

### Snapshot System
- [ ] Create DrSnapshot model
- [ ] Create dr_snapshots migration
- [ ] Add fields: domain_id, dr_value, recorded_at
- [ ] Create app/Repositories/SnapshotRepository.php
- [ ] Implement createSnapshot() method
- [ ] Implement getSnapshots() method
- [ ] Create hourly snapshot job
- [ ] Schedule in Kernel.php
- [ ] Test snapshot creation
- [ ] Verify InstantDB sync

### Manual Refresh Feature
- [ ] Add refresh button to domain card
- [ ] Create RefreshDomainAction
- [ ] Check user's plan (paid only)
- [ ] Check rate limits
- [ ] Dispatch immediate update job
- [ ] Show loading spinner
- [ ] Update UI after completion
- [ ] Show success toast
- [ ] Handle errors gracefully
- [ ] Log manual refreshes

## Phase 6: Data Visualization (Day 16-18)

### Chart Component Setup
- [ ] Install Chart.js via npm
- [ ] Create Livewire DomainChart component
- [ ] Setup canvas element
- [ ] Initialize Chart.js instance
- [ ] Configure chart options
- [ ] Set responsive sizing
- [ ] Add grid lines
- [ ] Configure tooltips
- [ ] Set axis labels
- [ ] Add chart title

### Historical Data Display
- [ ] Fetch domain snapshots
- [ ] Format data for Chart.js
- [ ] Create date labels array
- [ ] Create DR values array
- [ ] Plot line chart
- [ ] Add data points
- [ ] Style line color
- [ ] Add hover effects
- [ ] Implement time range selector
- [ ] Add 7d, 30d, 90d, All options
- [ ] Filter snapshots by date range
- [ ] Redraw chart on range change

### Chart Interactions
- [ ] Add zoom functionality
- [ ] Implement pan gesture
- [ ] Add reset zoom button
- [ ] Show value on hover
- [ ] Add crosshair cursor
- [ ] Export chart as PNG
- [ ] Add download button
- [ ] Create filename with date
- [ ] Add chart legend
- [ ] Toggle data series (future)

### Sparkline Charts
- [ ] Create mini chart component
- [ ] Remove axes for minimal look
- [ ] Show 7-day trend
- [ ] Add to domain cards
- [ ] Update on data change
- [ ] Add subtle animation

## Phase 7: Notification System (Day 19-20)

### Email Templates
- [ ] Create email layout template
- [ ] Add logo and branding
- [ ] Create DR change notification
- [ ] Design email HTML
- [ ] Add DR increase message
- [ ] Add DR decrease message
- [ ] Include domain name
- [ ] Add view dashboard CTA
- [ ] Create weekly recap template
- [ ] List all domains
- [ ] Show week's changes
- [ ] Add summary stats

### Notification Jobs
- [ ] Install @plunk/node package
- [ ] Create SendDrChangeNotification job
- [ ] Check user notification settings
- [ ] Build email data
- [ ] Send via Plunk API
- [ ] Log email sent
- [ ] Create SendWeeklyRecap job
- [ ] Aggregate week's data
- [ ] Generate email content
- [ ] Schedule for Mondays
- [ ] Handle failed sends

### Notification Preferences
- [ ] Add to user settings page
- [ ] Create toggle for DR changes
- [ ] Create toggle for weekly recap
- [ ] Set preferred timezone
- [ ] Choose recap day
- [ ] Save preferences to database
- [ ] Sync with InstantDB
- [ ] Test email delivery

## Phase 8: Subscription & Payments (Day 21-23)

### Stripe Integration
- [ ] Configure Laravel Cashier
- [ ] Run Cashier migrations
- [ ] Add Stripe fields to users
- [ ] Create subscription plans in Stripe
- [ ] Setup webhook endpoint
- [ ] Verify webhook signature
- [ ] Create SubscriptionController
- [ ] Add upgrade route
- [ ] Add cancel route
- [ ] Add resume route

### Checkout Flow
- [ ] Create upgrade modal
- [ ] Show plan comparison
- [ ] Add upgrade benefits list
- [ ] Create Stripe Checkout session
- [ ] Redirect to Stripe
- [ ] Handle success redirect
- [ ] Handle cancel redirect
- [ ] Update user subscription status
- [ ] Unlock paid features
- [ ] Send confirmation email
- [ ] Show success message

### Subscription Management
- [ ] Create billing page
- [ ] Show current plan
- [ ] Display next billing date
- [ ] Add cancel button
- [ ] Create cancellation flow
- [ ] Ask for feedback
- [ ] Process cancellation
- [ ] Set end date
- [ ] Add resume option
- [ ] Handle plan downgrades
- [ ] Manage feature access
- [ ] Update domain limits

### Webhook Handlers
- [ ] Handle subscription.created
- [ ] Handle subscription.updated
- [ ] Handle subscription.deleted
- [ ] Handle payment.failed
- [ ] Send payment failed email
- [ ] Handle payment.succeeded
- [ ] Update user status
- [ ] Log all events
- [ ] Handle edge cases

## Phase 9: Leaderboard Feature (Day 24-25)

### Leaderboard Data Structure
- [ ] Create leaderboard_entries table
- [ ] Add user_id, domain_id, dr_value
- [ ] Add current_rank, previous_rank
- [ ] Create LeaderboardService
- [ ] Calculate rankings
- [ ] Handle ties in DR
- [ ] Update ranks daily
- [ ] Store rank history
- [ ] Create anonymization option

### Leaderboard UI
- [ ] Create leaderboard page
- [ ] Check for paid subscription
- [ ] Create table component
- [ ] Show rank column
- [ ] Show domain name
- [ ] Show DR score
- [ ] Add change indicators
- [ ] Show user avatar
- [ ] Add anonymize toggle
- [ ] Implement pagination
- [ ] Add category filters

### Competitive Intelligence
- [ ] Add "View Insights" button
- [ ] Show competitor's growth rate
- [ ] Display DR history chart
- [ ] List similar domains
- [ ] Add follow feature
- [ ] Send alerts on overtake
- [ ] Create comparison view
- [ ] Export leaderboard data

## Phase 10: Gamification (Day 26-27)

### Milestones System
- [ ] Define milestone thresholds (10, 25, 50, 75)
- [ ] Create MilestoneService
- [ ] Check for milestone reach
- [ ] Store reached milestones
- [ ] Trigger celebration event
- [ ] Create milestone badges
- [ ] Display in dashboard
- [ ] Add to domain cards
- [ ] Send achievement email

### Confetti Celebration
- [ ] Install canvas-confetti library
- [ ] Create celebration trigger
- [ ] Configure confetti options
- [ ] Set particle count
- [ ] Choose colors
- [ ] Set animation duration
- [ ] Test on milestone reach
- [ ] Add sound effect (optional)
- [ ] Create disable option
- [ ] Store preference

### Goal Setting
- [ ] Add goal_dr field to domains
- [ ] Create goal setting modal
- [ ] Input target DR
- [ ] Calculate time estimate
- [ ] Show progress bar
- [ ] Update progress daily
- [ ] Send goal reached notification
- [ ] Create goals dashboard
- [ ] Show all active goals
- [ ] Display completion rate

## Phase 11: Growth Section (Day 28-29)

### Opportunities Database
- [ ] Create opportunities table
- [ ] Add seed data (50+ directories)
- [ ] Categorize by difficulty
- [ ] Add expected DR impact
- [ ] Mark do-follow status
- [ ] Create OpportunityRepository
- [ ] Implement filtering
- [ ] Track completion status
- [ ] Calculate success rates

### Growth Dashboard
- [ ] Create growth section page
- [ ] Check for paid subscription
- [ ] Display opportunity cards
- [ ] Show one per domain
- [ ] Add "Mark Complete" button
- [ ] Track completion
- [ ] Show next opportunity
- [ ] Add filter options
- [ ] Sort by impact
- [ ] Search functionality

### Educational Content
- [ ] Create resources section
- [ ] Add DR improvement guide
- [ ] Create case studies
- [ ] Add best practices
- [ ] Include do's and don'ts
- [ ] Create monthly challenges
- [ ] Track participation
- [ ] Show leaderboard
- [ ] Award badges

## Phase 12: Public Pages (Day 30-31)

### Public Domain Lookup
- [ ] Create route /{domain}
- [ ] Parse domain from URL
- [ ] Check if domain monitored
- [ ] Fetch from cache or API
- [ ] Create public view template
- [ ] Show current DR
- [ ] Add "Track this domain" CTA
- [ ] Include social share buttons
- [ ] Add meta tags for SEO
- [ ] Cache for 24 hours

### Blog System
- [ ] Create posts table
- [ ] Add title, slug, content, published_at
- [ ] Create Post model
- [ ] Create BlogController
- [ ] Add blog routes
- [ ] Create blog index page
- [ ] Create single post page
- [ ] Add markdown support
- [ ] Create admin interface
- [ ] Add WYSIWYG editor
- [ ] Include image uploads

### SEO Optimization
- [ ] Install SEO package
- [ ] Add meta tags to all pages
- [ ] Create sitemap.xml
- [ ] Add robots.txt
- [ ] Configure canonical URLs
- [ ] Add Open Graph tags
- [ ] Add Twitter cards
- [ ] Create FAQ schema
- [ ] Add breadcrumbs
- [ ] Optimize page speed

## Phase 13: Admin Dashboard (Day 32)

### Admin Authentication
- [ ] Create admin flag on users
- [ ] Add admin middleware
- [ ] Create admin routes group
- [ ] Build admin layout
- [ ] Add admin navigation

### Metrics Dashboard
- [ ] Show total users count
- [ ] Display active users (30d)
- [ ] Show total domains tracked
- [ ] Calculate MRR
- [ ] Display churn rate
- [ ] Show growth rate
- [ ] Add conversion funnel
- [ ] Create charts for trends
- [ ] Export reports

### User Management
- [ ] List all users
- [ ] Search users
- [ ] Filter by plan
- [ ] View user details
- [ ] See user's domains
- [ ] Manual plan override
- [ ] Send emails to users
- [ ] Ban/suspend users
- [ ] View activity logs

## Phase 14: Performance Optimization (Day 33)

### Caching Layer
- [ ] Configure Redis
- [ ] Cache Ahrefs responses
- [ ] Cache leaderboard
- [ ] Cache public pages
- [ ] Add cache warming
- [ ] Create cache clear commands
- [ ] Monitor cache hit rate

### Database Optimization
- [ ] Add missing indexes
- [ ] Optimize slow queries
- [ ] Add eager loading
- [ ] Implement query caching
- [ ] Archive old snapshots
- [ ] Create data retention policy

### Frontend Optimization
- [ ] Minify CSS/JS
- [ ] Enable compression
- [ ] Lazy load images
- [ ] Add loading skeletons
- [ ] Implement virtual scrolling
- [ ] Optimize Livewire polling
- [ ] Reduce wire transfers

## Phase 15: Testing & QA (Day 34-35)

### Unit Tests
- [ ] Test AhrefsService
- [ ] Test domain normalization
- [ ] Test subscription logic
- [ ] Test milestone calculations
- [ ] Test notification triggers
- [ ] Test ranking algorithm

### Feature Tests
- [ ] Test OAuth login flow
- [ ] Test domain add/remove
- [ ] Test payment flow
- [ ] Test email delivery
- [ ] Test data exports
- [ ] Test API rate limiting

### Browser Tests (Dusk)
- [ ] Test complete signup flow
- [ ] Test dashboard interactions
- [ ] Test upgrade process
- [ ] Test responsive design
- [ ] Test chart rendering
- [ ] Test real-time updates

### Manual QA Checklist
- [ ] Cross-browser testing
- [ ] Mobile responsive check
- [ ] Payment flow end-to-end
- [ ] Email delivery verification
- [ ] Load testing
- [ ] Security audit

## Phase 16: Launch Preparation (Day 36)

### Production Setup
- [ ] Configure production server
- [ ] Setup SSL certificates
- [ ] Configure backups
- [ ] Setup monitoring
- [ ] Configure error tracking
- [ ] Deploy application
- [ ] Run migrations
- [ ] Seed initial data

### Legal & Compliance
- [ ] Create Terms of Service
- [ ] Create Privacy Policy
- [ ] Add Cookie notice
- [ ] GDPR compliance check
- [ ] Add data export feature
- [ ] Add account deletion

### Marketing Materials
- [ ] Create landing page copy
- [ ] Design social media assets
- [ ] Prepare Product Hunt launch
- [ ] Write launch blog post
- [ ] Create demo video
- [ ] Setup analytics tracking

### Final Checklist
- [ ] Test payment flow with real card
- [ ] Verify email delivery
- [ ] Check all OAuth flows
- [ ] Confirm API rate limits
- [ ] Review error pages
- [ ] Test customer support flow
- [ ] Schedule first weekly recap
- [ ] Monitor first 24 hours

## Post-Launch Iterations

### Week 1 Fixes
- [ ] Fix critical bugs
- [ ] Optimize slow queries
- [ ] Adjust rate limits
- [ ] Improve error messages

### Month 1 Improvements
- [ ] Add Twitter OAuth
- [ ] Implement referral program
- [ ] Add more growth opportunities
- [ ] Create API documentation
- [ ] Build Chrome extension

### Future Features
- [ ] Mobile app (React Native)
- [ ] Slack integration
- [ ] Webhook support
- [ ] White label options
- [ ] Agency plans (>12 domains)
- [ ] Competitor monitoring
- [ ] Backlink analysis
- [ ] Keyword tracking integration

---

**Total Tasks: 500+**
**Estimated Time: 36 days** (1 developer, full-time)
**MVP Scope (Phase 0-8): ~23 days**