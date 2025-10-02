# FrogDR Clone - Product Requirements Document (PRD)

## Executive Summary

FrogDR Clone to aplikacja SaaS do monitorowania Domain Rating (DR) witryn internetowych. System automatycznie śledzi metrykę DR z Ahrefs API, wizualizuje historyczne trendy i motywuje użytkowników przez gamifikację. Model freemium: darmowy plan (3 domeny) i płatny $5/msc (12 domen).

## Cele Biznesowe

- Zbudować alternatywę dla drogich narzędzi SEO (Ahrefs $99+/msc)
- Target: indie makers, blogerzy, małe agencje
- Model przychodowy: freemium z jednym planem płatnym ($5/msc)
- Cel MRR: $2k (400 płatnych subskrybentów)

## Persony Użytkowników

### 1. Indie Maker / Solo Founder

- **Potrzeby**: Śledzenie wzrostu autorytetu domeny przy ograniczonym budżecie
- **Frustracje**: Enterprise SEO tools za drogie dla pojedynczego projektu
- **Wartość**: Prosty monitoring DR za 5% ceny Ahrefs

### 2. Blogger / Content Creator

- **Potrzeby**: Wizualizacja postępów w budowaniu autorytetu
- **Frustracje**: Brak motywacji przy długoterminowym budowaniu linków
- **Wartość**: Gamifikacja (milestones, leaderboard) utrzymuje zaangażowanie

### 3. Mała Agencja SEO

- **Potrzeby**: Monitoring DR dla 5-12 klientów w jednym dashboardzie
- **Frustracje**: Koszt osobnych subskrypcji Ahrefs per klient
- **Wartość**: Wszystkie domeny klientów w jednym miejscu za $5/msc

## Główne Funkcjonalności

### 1. System Autentykacji

#### OAuth-only Authentication

- **Brak tradycyjnej rejestracji email/hasło**
- Logowanie tylko przez Google OAuth
- Instant account creation po autoryzacji OAuth
- Brak email verification, CAPTCHA, password requirements
- Użytkownik przypisany na stałe do jednego OAuth provider

#### Wymagania:

- Zero-friction signup (< 30 sekund)
- Automatyczne tworzenie profilu po OAuth
- Brak możliwości linkowania wielu OAuth do jednego konta
- Sesje zarządzane przez InstantDB built-in auth

### 2. Dashboard Główny

#### Centralna Strona Monitoringu

- Lista wszystkich monitorowanych domen
- Dla każdej domeny:
  - Aktualny DR score (0-100)
  - Trend arrow (↑↓→)
  - Sparkline chart (7-dni)
  - Last update timestamp
  - Quick actions (refresh, settings, remove)

#### Wymagania:

- Real-time updates przez Livewire
- Responsive grid layout
- Drag & drop reorder domen
- Bulk actions dla zaznaczonych domen

### 3. Domain Monitoring Engine

#### Automatyczne Aktualizacje DR

**Plan Darmowy:**

- 1x dziennie automatyczna aktualizacja
- Pauza po 10 dniach nieaktywności
- Max 3 domeny

**Plan Płatny ($5/msc):**

- 4x dziennie (co ~6 godzin)
- Unlimited manual refreshes on-demand
- Max 12 domen
- Dodatkowe metryki: Backlinks, Referring Domains

#### Przechowywanie Danych

- InstantDB: real-time sync między użytkownikami
- Historyczne snapshoty DR (codziennie przez rok)
- Retention: unlimited dla paid, 90 dni dla free

### 4. Wizualizacja Danych

#### Wykresy Historyczne

- Chart.js dla line graphs
- Zakres czasowy: 7d, 30d, 90d, 1y, All time
- Porównanie wielu domen na jednym wykresie
- Export do PNG/CSV
- Hover tooltips z dokładnymi wartościami

#### Pojedyncza Strona Domeny

- Pełny wykres historyczny DR
- Tabela wszystkich snapshotów
- Metryki dodatkowe (paid):
  - Backlinks count z trendem
  - Referring domains z trendem
  - Top 5 keywords (jeśli dostępne)

### 5. System Notyfikacji

#### Email Notifications

- DR change alerts (paid: natychmiast, free: batch co 24h)
- Weekly recap każdy poniedziałek
- Milestone celebrations
- Inactivity warnings (dzień 7 i 9)

#### Ustawienia Notyfikacji

- Toggle per domain
- Threshold settings (notify tylko przy zmianie > X)
- Preferowany czas weekly recap

### 6. Gamifikacja

#### Leaderboard (Paid Only)

- Ranking wszystkich użytkowników paid
- Filtrowanie po kategoriach/tagach
- Anonymizacja opcjonalna
- "Competitive intelligence" - podgląd backlinków top graczy

#### Milestones & Celebrations

- Confetti animation przy osiągnięciu kamieni milowych
- Predefiniowane: DR 10, 25, 50, 75
- Custom milestones per domain
- Badge system (opcjonalnie)

#### Goal Setting (Paid Only)

- Ustaw target DR per domain
- Progress bar wizualizacja
- Estimated time to goal (based on trend)
- Goal achievement notifications

### 7. Growth Section (Paid Only)

#### Link Building Opportunities

- Kurowana lista 50+ directories
- Do-follow guarantee
- 1 opportunity unlocked per monitored domain
- Tracking które zostały wykorzystane
- Success rate statistics

#### Educational Content

- Best practices dla DR improvement
- Case studies
- Monthly challenges

### 8. Publiczne Strony

#### Homepage (Marketing)

- Hero section z value proposition
- Live counter monitorowanych stron (8000+)
- Screenshot dashboardu
- Testimonials karuzela
- Pricing comparison table
- OAuth signup buttons

#### Pricing Page

- Wizualna tabela Free vs Paid
- Feature checkmarks
- FAQ sekcja
- Upgrade CTA z urgency ("Limited time: $5/mo")

#### Public Domain Lookup

- URL pattern: /domain/example.com
- Pokazuje aktualny DR (cached 24h)
- CTA do signup
- Social share buttons

#### Blog

- SEO-optimized articles
- Markdown-based CMS
- Comments przez Disqus
- Newsletter signup widget

### 9. Ustawienia Konta

#### Profile Management

- Display name (z OAuth)
- Timezone selection
- Notification preferences
- API tokens (future feature)

#### Billing (Paid)

- Stripe integration
- Credit card management
- Invoice history
- Cancel/resume subscription
- Upgrade/downgrade instant

#### Data Export

- CSV export wszystkich danych
- GDPR compliance - full data download
- Account deletion (soft delete 30 dni)

## Ograniczenia i Constraints

### Limity Planów

| Feature            | Free     | Paid ($5/mo) |
| ------------------ | -------- | ------------ |
| Domeny             | 3        | 12           |
| Auto updates       | 1x/dzień | 4x/dzień     |
| Manual refresh     | 0        | Unlimited    |
| Backlinks data     | ❌       | ✅           |
| Referring domains  | ❌       | ✅           |
| Leaderboard        | ❌       | ✅           |
| Goals              | ❌       | ✅           |
| Link opportunities | ❌       | 1 per domain |
| Email alerts       | Weekly   | Instant      |
| Data retention     | 90 dni   | Unlimited    |
| Ads                | Tak      | Nie          |

### Techniczne Ograniczenia

- Brak mobile apps (web-only)
- Brak publicznego API
- Dependency na Ahrefs API
- Brak Slack/webhook integrations
- Single region deployment (latency)

## User Flows

### 1. Onboarding Flow

```
Landing → Click Signup → OAuth (Google/Twitter) →
→ Dashboard (empty) → Add First Domain modal →
→ Instant DR fetch → Show success + tutorial →
→ Prompt: Add more domains
```

### 2. Daily Active User Flow

```
Email notification → Click link → Dashboard →
→ View DR changes → Check leaderboard →
→ Manual refresh specific domain →
→ Check Growth opportunities → Logout
```

### 3. Upgrade Flow

```
Hit 3 domain limit → Show upgrade modal →
→ Pricing benefits → Stripe checkout →
→ Payment success → Instant unlock features →
→ Onboarding dla paid features
```

## Success Metrics (KPIs)

### Acquisition

- Signup conversion rate (target: 10%)
- OAuth completion rate (target: 95%)
- Time to first domain add (target: < 2 min)

### Activation

- % users adding 2+ domains (target: 60%)
- % users returning day 2 (target: 40%)
- First manual refresh rate (paid)

### Retention

- 30-day retention free (target: 20%)
- 30-day retention paid (target: 80%)
- Churn rate paid (target: < 5%/mo)

### Revenue

- Free to paid conversion (target: 5%)
- MRR growth rate (target: 20%/mo)
- LTV:CAC ratio (target: 3:1)

### Engagement

- Weekly active users %
- Domains per user average
- Leaderboard participation rate
- Growth section CTR

## MVP Scope (Faza 1)

### Must Have (Launch)

- OAuth login (Google via InstantDB)
- Add/remove domains (3 limit)
- Daily DR updates
- Basic line chart
- Email notifications
- Pricing page
- Stripe payment

### Should Have (Miesiąc 1)

- Leaderboard basic
- Manual refresh (paid)
- Weekly recap emails
- Public domain pages
- Blog (3 articles)

### Could Have (Miesiąc 2-3)

- Milestones + confetti
- Goal setting
- Growth opportunities
- Referring domains data
- CSV exports
- Referral program

### Won't Have (Future)

- Mobile apps
- Public API
- Slack integration
- Multi-language
- White label
- Agency plans (>12 domains)

## Ryzyka i Mitigacje

### Ryzyko: Ahrefs API zmienia pricing

**Mitigacja**: Cache agresywnie, negotiate bulk pricing, prepare alternative (Moz API)

### Ryzyko: Niski conversion rate

**Mitigacja**: A/B test onboarding, extend free trial, add more free features

### Ryzyko: High churn płatnych

**Mitigacja**: Gamification hooks, annual discount, win-back campaigns

### Ryzyko: Competitive response

**Mitigacja**: Focus na niche (indie makers), build community moat

## Sukces =

**400 płatnych subskrybentów w 6 miesięcy** przy churn < 5% miesięcznie i CAC < $15 per paid user. Gamifikacja utrzymuje engagement, a przystępna cena eliminuje price objections.
