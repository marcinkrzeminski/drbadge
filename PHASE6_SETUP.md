# Phase 6: SEO Intelligence Integration - Setup Guide

## Overview
Phase 6 implementuje integrację z RapidAPI (KarmaLabs) do pobierania Domain Authority, tracking kosztów i monitoring budżetu. **InstantDB jest jedynym źródłem danych** - nie używamy zewnętrznego cache.

## Zrealizowane funkcjonalności

### 1. SEO Intelligence Service
- Integracja z RapidAPI KarmaLabs
- Automatyczne retry (3 próby)
- Normalizacja domen
- Error handling

### 2. Data Flow (bez Redis!)
- **Scheduled Updates**: Cron job wywołuje `/api/domains/update` → pobiera z RapidAPI → zapisuje w InstantDB
- **Manual Refresh**: Paid users klikają "Refresh" → pobiera z RapidAPI → zapisuje w InstantDB
- **Dashboard Display**: UI czyta dane z InstantDB (realtime przez InstantDB subscriptions)

### 3. API Endpoints
- `/api/domains/update` - Aktualizacja DA (zawsze świeże z RapidAPI)
- `/api/domains/refresh` - Manual refresh dla paid users (rate limit: 10/hour)
- `/api/cron/budget-monitor` - Hourly budget monitoring

### 4. Budget Monitoring
- Tracking wszystkich API calls w bazie (`api_usage` table)
- Cron job co godzinę sprawdza budżet
- Email alert przy ≥70% wykorzystania budżetu
- Monthly limit: $50

### 5. UI Features
- Przycisk "Refresh" w DomainList (tylko paid users)
- Loading states
- Toast notifications
- Realtime updates przez InstantDB

## Dlaczego NIE używamy Redis?

1. **Frequency**: Updates są rzadkie (Free: 1x/dzień, Paid: 4x/dzień)
2. **InstantDB Realtime**: Dane są automatycznie synchronizowane w UI
3. **Simplicity**: Mniej dependencies, mniej kosztów, mniej punktów awarii
4. **Single Source of Truth**: InstantDB przechowuje wszystko

## Konfiguracja

### 1. Environment Variables

Dodaj do `.env.local`:

```bash
# Cron Job Security
CRON_SECRET=your_random_secret_here

# Budget Alerts
ALERT_EMAIL=your_email@domain.com
```

#### Jak wygenerować CRON_SECRET:
```bash
openssl rand -base64 32
```

### 2. Vercel Configuration

#### Dodaj Environment Variables w Vercel Dashboard:
1. Przejdź do Project Settings → Environment Variables
2. Dodaj:
   - `CRON_SECRET` (ten sam co lokalnie)
   - `ALERT_EMAIL` (twój email do alertów)

#### Vercel Cron Job (automatycznie skonfigurowany)
Plik `vercel.json` zawiera:
```json
{
  "crons": [
    {
      "path": "/api/cron/budget-monitor",
      "schedule": "0 * * * *"
    }
  ]
}
```

**Ważne:** Vercel Cron Jobs są dostępne tylko na **Pro planie** ($20/month).

**Alternatywa dla Hobby planu:**
- Użyj zewnętrznego serwisu (np. cron-job.org, easycron.com)
- Wywołuj `GET https://yourdomain.com/api/cron/budget-monitor` co godzinę
- Dodaj header: `Authorization: Bearer YOUR_CRON_SECRET`

### 3. Plunk Email (już skonfigurowane)
Email alerts używają istniejącej konfiguracji Plunk:
- `PLUNK_SECRET_API_KEY` - już w `.env.local`
- `ALERT_EMAIL` - email do otrzymywania alertów

## Testowanie

### 1. Test SEO Intelligence API
```bash
curl -X POST http://localhost:3000/api/domains/update \
  -H "Content-Type: application/json" \
  -d '{"domainId": "your_domain_id"}'
```

### 2. Test Manual Refresh (paid users only)
```bash
curl -X POST http://localhost:3000/api/domains/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "domainId": "your_domain_id",
    "userId": "your_user_id"
  }'
```

### 3. Test Budget Monitor
```bash
curl -X GET http://localhost:3000/api/cron/budget-monitor \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### 4. Test UI Refresh Button
1. Zaloguj się jako paid user
2. Dodaj domenę
3. Kliknij menu (⋮) → "Refresh"
4. Sprawdź czy DA się zaktualizował

## Budget Alert Thresholds

- **70%+**: Email alert (Warning)
- **100%+**: Email alert (Critical)

## Koszt API Calls

- **RapidAPI KarmaLabs**: ~$0.01 per call
- **Monthly Budget**: $50 = ~5000 calls/month
- **No Cache**: Każdy update = API call (ale updates są rzadkie!)

## Update Schedule (Future - Phase 7)

- **Free Plan**: 1x/dzień = 30 calls/month = $0.30/user/month
- **Paid Plan**: 4x/dzień = 120 calls/month = $1.20/user/month

Z budżetem $50/month: ~166 free users lub ~41 paid users

## Rate Limiting

- **Manual Refresh**: 10 refreshes/hour (paid users only)
- **Storage**: In-memory (MVP)

## Files Changed/Created

- ✅ `src/lib/seo-intelligence.ts`
- ✅ `src/lib/budget-monitor.ts`
- ✅ `src/app/api/domains/update/route.ts`
- ✅ `src/app/api/domains/refresh/route.ts`
- ✅ `src/app/api/cron/budget-monitor/route.ts`
- ✅ `src/components/dashboard/DomainList.tsx`
- ✅ `vercel.json`
- ❌ Redis (removed - not needed)
