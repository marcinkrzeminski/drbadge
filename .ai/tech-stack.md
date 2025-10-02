# FrogDR Clone - Technical Stack & Architecture

## Core Technology Stack

### Frontend & Backend Framework

**Next.js 15.5**

- React 19 + Server Components
- App Router (stable)
- Turbopack (beta for builds)
- Server Actions for API
- TypeScript 5.5+
- Node.js middleware (stable)

### UI & Styling

**shadcn/ui + Tailwind CSS**

- Radix UI primitives
- Tailwind CSS 3.4
- CSS Variables for theming
- Framer Motion for animations
- React Email for templates

### Database Layer

**Primary & Only: InstantDB**

```javascript
// InstantDB handles EVERYTHING - no SQLite needed!
{
  appId: "frogdr-clone",
  schema: {
    // Users & Authentication
    users: {
      id: { type: "string", primary: true },
      oauth_provider: { type: "string", indexed: true },
      oauth_id: { type: "string", indexed: true },
      email: { type: "string", indexed: true },
      name: { type: "string" },
      avatar_url: { type: "string" },
      subscription_status: { type: "string" },
      stripe_customer_id: { type: "string" },
      subscription_ends_at: { type: "timestamp" },
      last_active_at: { type: "timestamp" },
      created_at: { type: "timestamp" }
    },

    // Domains monitoring
    domains: {
      id: { type: "string", primary: true },
      user_id: { type: "string", indexed: true },
      url: { type: "string", indexed: true },
      current_da: { type: "number" },
      previous_da: { type: "number" },
      da_change: { type: "number" },
      last_checked: { type: "timestamp" },
      created_at: { type: "timestamp" }
    },

    // Historical snapshots
    dr_snapshots: {
      id: { type: "string", primary: true },
      domain_id: { type: "string", indexed: true },
      da_value: { type: "number" },
      backlinks: { type: "number" },
      referring_domains: { type: "number" },
      recorded_at: { type: "timestamp", indexed: true }
    },

    // Background jobs tracking
    jobs: {
      id: { type: "string", primary: true },
      type: { type: "string", indexed: true },
      payload: { type: "string" },
      status: { type: "string" },
      attempts: { type: "number" },
      scheduled_at: { type: "timestamp", indexed: true },
      completed_at: { type: "timestamp" },
      created_at: { type: "timestamp" }
    },

    // API usage tracking
    api_usage: {
      id: { type: "string", primary: true },
      domain: { type: "string" },
      cost: { type: "number" },
      provider: { type: "string" },
      created_at: { type: "timestamp", indexed: true }
    }
  }
}
```

**No SQLite = Simpler Stack!**

- All data in one place (InstantDB)
- Real-time sync across all users
- No data synchronization issues
- Simpler backup strategy
- One connection to manage

### Authentication

**InstantDB Built-in Auth**

- Google OAuth 2.0 provider
- Session management via InstantDB
- No need for NextAuth - InstantDB handles it all
- JWT tokens managed by InstantDB
- No password authentication

### Payment Processing

**Stripe (Direct Integration)**

- Stripe Checkout for subscriptions
- Stripe Webhooks for events
- Custom subscription management
- SCA compliance built-in
- Stripe Customer Portal

### External APIs

**RapidAPI - SEO Intelligence by KarmaLabs**

```typescript
// KarmaLabs SEO Intelligence - $10 for 10k requests!
export class SEOIntelligenceService {
  private apiKey: string;
  private apiHost = 'seo-intelligence.p.rapidapi.com';

  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY!;
  }

  /**
   * Get Domain Authority metrics from KarmaLabs
   * Cost: $0.001 per request ($10/10k requests)
   */
  async getDomainMetrics(domain: string) {
    // Extended cache to save API calls (24-48h)
    const cacheKey = `seo_intel:${domain}`;

    // Check Upstash Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('Cache hit for domain', { domain });
      return JSON.parse(cached);
    }

    // KarmaLabs SEO Intelligence API
    const response = await fetch(
      `https://${this.apiHost}/analyze?url=${this.normalizeDomain(domain)}`,
      {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.apiHost,
        },
      }
    );

    if (!response.ok) {
      console.error('SEO Intelligence API failed', {
        domain,
        status: response.status,
      });
      throw new Error('Failed to fetch SEO metrics');
    }

    const data = await response.json();

    const metrics = {
      domain_authority: data.domain_authority ?? data.da ?? 0,
      page_authority: data.page_authority ?? data.pa ?? 0,
      referring_domains: data.referring_domains ?? 0,
      backlinks: data.total_backlinks ?? 0,
      organic_keywords: data.keywords ?? 0,
      organic_traffic: data.traffic ?? 0,
      spam_score: data.spam_score ?? 0,
      trust_flow: data.trust_flow ?? 0,
      citation_flow: data.citation_flow ?? 0,
      fetched_at: new Date().toISOString(),
      provider: 'karmalabs'
    };

    // Track API usage for cost monitoring
    await this.trackApiUsage(domain);

    // Cache for 48h for free users, 24h for paid
    const ttl = 86400; // 24h default
    await redis.setex(cacheKey, ttl, JSON.stringify(metrics));

    return metrics;
  }

  private normalizeDomain(url: string): string {
    // Clean domain for API
    let domain = url.replace(/https?:\/\/(www\.)?/, '');
    domain = domain.replace(/\/$/, '');
    return domain;
  }

  private async trackApiUsage(domain: string): Promise<void> {
    await db.transact(
      tx.api_usage[id()].update({
        provider: 'karmalabs',
        endpoint: 'analyze',
        domain,
        cost: 0.001, // $10 for 10k = $0.001 per call
        created_at: Date.now()
      })
    );
  }
}
```

**KarmaLabs SEO Intelligence Benefits**

- **Amazing pricing**: $10 for 10,000 requests
- **Cost per request**: $0.001 (10x cheaper than most!)
- **All metrics in one call**: DA, PA, backlinks, RD, keywords
- **Additional metrics**: Trust Flow, Citation Flow, Spam Score
- **High reliability**: 99.9% uptime on RapidAPI
- **Fast response**: Usually < 2 seconds

### Email Service

**Plunk**

- Simple API for transactional emails
- React Email for templates (optional)
- Weekly digest emails
- DR change alert emails
- Easy integration

### Frontend Libraries

**Component Library**

- shadcn/ui components
- Radix UI for accessibility
- React Hook Form for forms
- Zod for validation

**Data Visualization**

- Recharts for charts
- Tremor for dashboards
- Canvas Confetti for celebrations
- Sonner for toast notifications

**State & Data**

- InstantDB React hooks
- TanStack Query (optional)
- Zustand for local state
- SWR for data fetching

### Infrastructure

**Hosting**

- Vercel (recommended)
- Free tier → Pro ($20/mo)
- Edge Functions globally
- Automatic scaling

**Alternative Hosting**

- Railway.app
- Render.com
- Self-hosted on VPS

**Deployment**

- Git-based deployments
- Preview deployments for PRs
- Automatic rollbacks
- Environment variables via Vercel

**Monitoring**

- Vercel Analytics (built-in)
- Sentry for error tracking
- Uptime monitoring (UptimeRobot)
- Custom metrics dashboard

**CDN & Assets**

- Vercel Edge Network (automatic)
- Image Optimization API
- Static assets caching
- Global distribution

## Architecture Patterns

### 1. App Router File Structure

```typescript
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/
│   ├── layout.tsx
│   ├── dashboard/page.tsx
│   ├── domains/[id]/page.tsx
│   └── settings/page.tsx
├── api/
│   ├── webhooks/stripe/route.ts
│   └── domains/refresh/route.ts
└── components/
    ├── ui/           // shadcn components
    ├── domains/      // domain-specific
    └── shared/       // shared components
```

### 2. Server Components by Default

```typescript
// app/dashboard/page.tsx - Server Component
async function DashboardPage() {
  // InstantDB auth happens client-side, so we use client component
  return <DashboardClient />;
}

// components/DashboardClient.tsx - Client Component
("use client");
import { useAuth } from "@/lib/instant-client";

export function DashboardClient() {
  const { user, isLoading } = useAuth();
  // InstantDB handles auth and real-time data
}
```

### 3. Server Actions for Mutations

```typescript
// app/actions/domains.ts
"use server";
import { db } from "@/lib/instant-server";
import { id } from "@instantdb/admin";

export async function addDomain(userId: string, url: string) {
  // Server-side validation
  const { data } = await db.query({
    domains: {
      $: {
        where: { userId }
      }
    }
  });

  if (data.domains.length >= 3) {
    throw new Error("Free plan limit reached");
  }

  // Add to InstantDB
  const domainId = id();
  await db.transact(
    db.domains[domainId].update({
      url,
      userId,
      createdAt: Date.now()
    })
  );

  return domainId;
}
```

### 4. InstantDB React Integration

```typescript
// lib/instant.ts
import { init } from "@instantdb/react";

export const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!,
});

// components/DomainList.tsx
("use client");
import { db } from "@/lib/instant";

export function DomainList() {
  const { data, error } = db.useQuery({
    domains: {
      $: {
        where: { userId: currentUser.id },
        include: { snapshots: { last: 30 } },
      },
    },
  });

  // Real-time updates automatically!
  return <div>{/* render domains */}</div>;
}
```

## Database Schema (InstantDB Only)

### Why InstantDB for Everything?

- **Real-time sync** - changes propagate instantly to all users
- **No ORM needed** - InstantDB has its own query language
- **Automatic scaling** - no database maintenance
- **Built-in offline support** - works even when disconnected
- **No migrations** - schema changes are instant
- **WebSocket subscriptions** - real-time updates without polling

### Complete InstantDB Collections

**users**

```javascript
{
  id: "uuid",
  oauth_provider: "google|twitter",
  oauth_id: "provider_user_id",
  email: "user@example.com",
  name: "John Doe",
  avatar_url: "https://...",
  subscription_status: "free|paid|cancelled",
  subscription_ends_at: "2024-12-31T23:59:59Z",
  stripe_customer_id: "cus_xxx",
  trial_ends_at: null,
  domains_limit: 3|12,
  last_active_at: "timestamp",
  created_at: "timestamp",
  settings: {
    timezone: "UTC",
    weekly_recap_day: 1, // Monday
    email_on_dr_change: true,
    leaderboard_visible: true
  }
}
```

**domains**

```javascript
{
  id: "uuid",
  user_id: "uuid",
  url: "example.com",
  normalized_url: "example.com", // bez www, https
  current_dr: 45,
  previous_dr: 43,
  dr_change: 2,
  dr_change_percent: 4.65,
  backlinks_count: 1250, // paid only
  referring_domains_count: 89, // paid only
  last_manual_refresh: "timestamp",
  last_auto_update: "timestamp",
  update_frequency: "daily|6hours",
  is_abandoned: false,
  goal_dr: 60, // paid only
  milestones_reached: [10, 25],
  tags: ["client", "main-project"],
  created_at: "timestamp",
  deleted_at: null // soft delete
}
```

**dr_snapshots**

```javascript
{
  id: "uuid",
  domain_id: "uuid",
  dr_value: 45,
  backlinks_count: 1250,
  referring_domains_count: 89,
  top_keywords: ["keyword1", "keyword2"], // top 5
  recorded_at: "timestamp",
  is_manual_refresh: false,
  data_source: "ahrefs|moz", // future flexibility
}
```

**leaderboard_entries**

```javascript
{
  id: "uuid",
  user_id: "uuid",
  domain_id: "uuid",
  current_rank: 42,
  previous_rank: 45,
  dr_value: 67,
  category: "saas|blog|ecommerce",
  is_anonymous: false,
  updated_at: "timestamp"
}
```

**growth_opportunities**

```javascript
{
  id: "uuid",
  title: "Submit to ProductHunt",
  description: "Get do-follow backlink from DR89 domain",
  url: "https://producthunt.com/posts/new",
  expected_dr_impact: "medium",
  do_follow: true,
  difficulty: "easy|medium|hard",
  category: "directory|guest-post|social",
  unlocked_for_domain_ids: ["uuid1", "uuid2"],
  completed_by_users: ["user_id1", "user_id2"],
  success_rate: 0.73
}
```

**api_usage** (for budget tracking)

```javascript
{
  id: "uuid",
  provider: "karmalabs",
  endpoint: "analyze",
  domain: "example.com",
  cost: 0.001,
  response_time: 1234, // ms
  success: true,
  created_at: "timestamp"
}
```

## API Integrations

### RapidAPI - SEO Intelligence Setup (KarmaLabs)

```typescript
// lib/seo-intelligence.ts
export class SEOIntelligenceService {
  private apiKey = process.env.RAPIDAPI_KEY!;
  private apiHost = "seo-intelligence.p.rapidapi.com";

  async getDomainMetrics(domain: string) {
    // Check cache first (24-48h TTL)
    const cached = await redis.get(`seo:${domain}`);
    if (cached) return JSON.parse(cached);

    const response = await fetch(
      `https://${this.apiHost}/analyze?url=${domain}`,
      {
        headers: {
          "X-RapidAPI-Key": this.apiKey,
          "X-RapidAPI-Host": this.apiHost,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`SEO API failed: ${response.statusText}`);
    }

    const data = await response.json();

    const metrics = {
      domainAuthority: data.domain_authority ?? 0,
      pageAuthority: data.page_authority ?? 0,
      referringDomains: data.referring_domains ?? 0,
      backlinks: data.total_backlinks ?? 0,
      organicKeywords: data.keywords ?? 0,
      spamScore: data.spam_score ?? 0,
      fetchedAt: new Date().toISOString(),
    };

    // Cache for 24h (paid) or 48h (free)
    await redis.setex(`seo:${domain}`, 86400, JSON.stringify(metrics));

    // Track API usage
    await trackApiUsage(domain, 0.001);

    return metrics;
  }
}
```

### Next.js API Routes for Domain Updates

```typescript
// app/api/domains/refresh/route.ts
import { SEOIntelligenceService } from "@/lib/seo-intelligence";
import { db } from "@/lib/instant-server";
import { id, tx } from "@instantdb/admin";

export async function POST(req: Request) {
  // Get userId from request (passed from client)
  const { domainId, userId } = await req.json();

  // Verify user owns this domain
  const { data } = await db.query({
    domains: {
      $: {
        where: { id: domainId, userId }
      }
    }
  });

  if (!data.domains || data.domains.length === 0) {
    return new Response("Domain not found", { status: 404 });
  }

  const domain = data.domains[0];
  const seo = new SEOIntelligenceService();
  const metrics = await seo.getDomainMetrics(domain.url);

  // Update InstantDB
  const snapshotId = id();
  await db.transact([
    tx.domains[domainId].update({
      currentDa: metrics.domainAuthority,
      previousDa: domain.currentDa,
      lastChecked: Date.now(),
    }),
    tx.dr_snapshots[snapshotId].update({
      domainId,
      daValue: metrics.domainAuthority,
      backlinks: metrics.backlinks,
      referringDomains: metrics.referringDomains,
      recordedAt: Date.now(),
    }),
  ]);

  return Response.json(metrics);
}
```

### Background Jobs with Vercel Cron

```typescript
// app/api/cron/update-domains/route.ts
import { verifySignature } from '@/lib/cron-auth';

export async function GET(req: Request) {
  // Verify this is from Vercel Cron
  if (!verifySignature(req)) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Get all domains needing update
  const domains = await db.domains.findMany({
    where: {
      OR: [
        { lastChecked: { lt: new Date(Date.now() - 12 * 60 * 60 * 1000) } },
        { lastChecked: null }
      ]
    },
    take: 100 // Process in batches
  });

  // Update each domain
  const seo = new SEOIntelligenceService();

  for (const domain of domains) {
    try {
      const metrics = await seo.getDomainMetrics(domain.url);
      // Update domain...
    } catch (error) {
      console.error(`Failed to update ${domain.url}`, error);
    }
  }

  return Response.json({ updated: domains.length });
}

// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/update-domains",
      "schedule": "0 */6 * * *" // Every 6 hours
    }
  ]
}
```

### InstantDB Integration with Next.js

```typescript
// lib/instant-server.ts - Server-side client
import { init, tx, id } from "@instantdb/admin";

const db = init({
  appId: process.env.INSTANTDB_APP_ID!,
  adminToken: process.env.INSTANTDB_ADMIN_TOKEN!,
});

// Server-side operations
export async function createDomain(userId: string, url: string) {
  const domainId = id();

  await db.transact(
    tx.domains[domainId].update({
      id: domainId,
      userId,
      url,
      currentDa: 0,
      createdAt: Date.now(),
    })
  );

  return domainId;
}

// lib/instant-client.ts - Client-side hooks
import { init } from "@instantdb/react";

export const { useAuth, useQuery, useMutation, usePresence } = init({
  appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!,
});

// components/RealtimeDashboard.tsx
("use client");
import { useQuery } from "@/lib/instant-client";

export function RealtimeDashboard() {
  // Automatic real-time subscriptions
  const { data, isLoading } = useQuery({
    domains: {
      $: {
        where: { userId: currentUser.id },
      },
    },
  });

  // Live presence (who's viewing what)
  const presence = usePresence({
    roomId: `user-${currentUser.id}`,
  });

  return (
    <div>
      {presence.peers.map((peer) => (
        <Avatar key={peer.id} user={peer.user} />
      ))}
      {/* Domains update in real-time */}
      {data?.domains.map((d) => (
        <DomainCard key={d.id} {...d} />
      ))}
    </div>
  );
}
```

### Stripe Webhooks

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response("Webhook Error", { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await handleSubscriptionChange(event.data.object);
      break;

    case "customer.subscription.deleted":
      await handleSubscriptionCancelled(event.data.object);
      break;

    case "invoice.payment_failed":
      await handlePaymentFailed(event.data.object);
      break;
  }

  return new Response("OK", { status: 200 });
}
```

## Performance Optimizations

### Caching Strategy

1. **RapidAPI responses**: 24-48h in Redis/Upstash
2. **Static pages**: ISR (Incremental Static Regeneration)
3. **Public domain pages**: 60 minutes revalidation
4. **Dashboard data**: Real-time via InstantDB
5. **Static assets**: Immutable with hashed names

### Next.js Caching

```typescript
// Using Next.js built-in caching
import { unstable_cache } from "next/cache";

export const getCachedDomainMetrics = unstable_cache(
  async (domain: string) => {
    const seo = new SEOIntelligenceService();
    return await seo.getDomainMetrics(domain);
  },
  ["domain-metrics"],
  {
    revalidate: 86400, // 24 hours
    tags: ["seo-metrics"],
  }
);

// ISR for public pages
export const revalidate = 3600; // Revalidate every hour

// On-demand revalidation
import { revalidateTag } from "next/cache";

export async function refreshDomain(domain: string) {
  revalidateTag(`domain-${domain}`);
}
```

### Background Jobs with Vercel Cron

```typescript
// Vercel Cron Jobs - adjusted for API cost optimization
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/update-domains",
      "schedule": "0 */12 * * *" // Every 12 hours (not hourly!)
    },
    {
      "path": "/api/cron/send-inactivity-warnings",
      "schedule": "0 9 * * *" // Daily at 9 AM
    },
    {
      "path": "/api/cron/calculate-leaderboard",
      "schedule": "0 */12 * * *" // Twice daily
    },
    {
      "path": "/api/cron/monitor-api-costs",
      "schedule": "0 0 * * *" // Daily at midnight
    }
  ]
}
```

### API Cost Management

```typescript
// Budget monitoring for RapidAPI
export class ApiCostMonitor {
  private static MONTHLY_BUDGET = 50; // $50/month for all APIs

  async checkBudget(): Promise<boolean> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const usage = await db.query({
      api_usage: {
        $: {
          where: {
            created_at: { $gte: startOfMonth.getTime() }
          }
        }
      }
    });

    const spent = usage.data.api_usage.reduce((sum, u) => sum + u.cost, 0);

    if (spent > ApiCostMonitor.MONTHLY_BUDGET * 0.8) {
      // Alert when 80% budget used
      await sendEmail({
        to: 'admin@frogdr.com',
        subject: 'Budget Warning',
        text: `API budget at ${spent.toFixed(2)}/${ApiCostMonitor.MONTHLY_BUDGET}`
      });
    }

    return spent < ApiCostMonitor.MONTHLY_BUDGET;
  }

  async shouldUpdateDomain(domain: any): Promise<boolean> {
    // Skip updates if over budget
    if (!(await this.checkBudget())) {
      return false;
    }

    // Free users - only on login
    if (!domain.user.is_paid && !domain.user.logged_in_today) {
      return false;
    }

    // Check last update time
    const lastChecked = new Date(domain.last_checked);
    const hoursSinceUpdate = (Date.now() - lastChecked.getTime()) / (1000 * 60 * 60);

    return domain.user.is_paid
      ? hoursSinceUpdate >= 12  // Paid: 2x daily
      : hoursSinceUpdate >= 24; // Free: 1x daily
  }
}
```

### Database Indexes

InstantDB automatycznie indeksuje pola oznaczone jako `indexed: true` w schemacie:
- domains.user_id
- domains.url
- dr_snapshots.domain_id
- dr_snapshots.recorded_at
- users.oauth_id
- users.email

### React Component Optimizations

```typescript
// Lazy loading components
const DomainChart = dynamic(() => import('./DomainChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false
});

// Real-time updates with InstantDB
const { data, isLoading } = useQuery({
  domains: {
    $: {
      where: { userId: session.user.id }
    }
  }
});

// Debounced updates
const debouncedRefresh = useDebouncedCallback(
  () => refreshDomains(),
  500
);

// Memoized expensive computations
const sortedDomains = useMemo(
  () => domains.sort((a, b) => b.current_da - a.current_da),
  [domains]
);
```

## Security Measures

### API Security

- Rate limiting with Upstash
- API routes protected by auth()
- CORS configuration
- Request validation with Zod

### Data Protection

- JWT tokens for sessions
- Environment variables for secrets
- HTTPS enforced via Vercel
- GDPR compliance features

### Next.js Security

- CSRF protection (built-in)
- XSS prevention (React escaping)
- SQL injection prevention (parameterized queries)
- Content Security Policy headers
- Authentication middleware

## Development Workflow

### Local Environment

```bash
# Development setup
npm install
cp .env.example .env.local
npm run dev

# With Docker (optional)
docker-compose up -d
- PostgreSQL for local testing
- Redis for caching
- Mailhog for emails
```

### Testing Strategy

```typescript
// __tests__ structure
__tests__/
├── unit/
│   ├── seo-intelligence.test.ts
│   ├── domain-service.test.ts
│   └── subscription.test.ts
├── integration/
│   ├── auth.test.ts
│   ├── api/
│   │   └── domains.test.ts
│   └── webhooks.test.ts
└── e2e/
    ├── onboarding.test.ts
    └── upgrade-flow.test.ts

// Using Jest + React Testing Library
npm run test
npm run test:e2e  // Playwright
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - uses: vercel/action@v3
```

## Monitoring & Logging

### Application Monitoring

- Sentry for error tracking
- Vercel Analytics (built-in)
- Custom event tracking
- Performance monitoring

### Business Metrics

```typescript
// lib/analytics.ts
export function trackEvent(event: string, properties?: Record<string, any>) {
  // Vercel Analytics
  if (typeof window !== "undefined") {
    window.analytics?.track(event, properties);
  }

  // Custom backend tracking
  fetch("/api/analytics", {
    method: "POST",
    body: JSON.stringify({ event, properties }),
  });
}

// Usage
trackEvent("user.signup", { provider: "google" });
trackEvent("domain.added", { plan: "free" });
trackEvent("subscription.created", { amount: 500 });
```

### Alerts

- API failures > 10%
- Stripe webhook failures
- Budget exceeded
- Response time > 2s
- Error rate spikes

## Scalability Considerations

### Phase 1 (MVP - 1K users)

- Vercel Hobby ($0-20/mo)
- InstantDB free tier
- Upstash Redis free tier

### Phase 2 (Growth - 10K users)

- Vercel Pro ($20/mo)
- InstantDB paid plan
- Upstash Redis paid
- CDN automatic via Vercel

### Phase 3 (Scale - 100K users)

- Vercel Enterprise
- Database sharding
- Multi-region deployment
- Custom infrastructure

### Performance Optimizations

- Server Components by default
- Dynamic imports for code splitting
- Image optimization API
- Edge Functions for global latency
- ISR for static content
- Streaming SSR for fast TTFB
