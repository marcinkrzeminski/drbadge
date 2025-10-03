# DrBadge

Track your website's Domain Rating effortlessly with instant alerts and beautiful charts.

## Features

- 🎯 **Domain Rating Tracking** - Monitor DR changes automatically
- 📊 **Historical Charts** - View DR trends with interactive charts and sparklines
- 🏷️ **Embeddable Badges** - Showcase your domain authority on your website
- 📱 **Dashboard Views** - Grid or table view with sorting options
- 🔔 **Email Alerts** - Get notified when your DR changes
- 📈 **Data Visualization** - Time range filters (7d, 30d, 90d, All time)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- InstantDB account
- RapidAPI account (SEO Intelligence API)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd drbadge
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables - create a `.env.local` file with:

```env
NEXT_PUBLIC_INSTANTDB_APP_ID=your_instant_app_id
INSTANTDB_ADMIN_TOKEN=your_admin_token
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=seo-intelligence.p.rapidapi.com
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development Scripts

### Generate Historical Data

To populate your domains with historical DR snapshots for testing:

```bash
npx tsx scripts/generate-historical-data.ts
```

**What it does:**

- Fetches all domains from your database
- Generates 31 snapshots per domain (every 3 days for 90 days)
- Creates realistic data with random trends (up/down/stable)
- Saves snapshots to `dr_snapshots` collection

This is useful for:

- Testing chart visualizations
- Demonstrating sparklines
- Populating the dashboard with sample data

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** InstantDB (real-time)
- **Styling:** Tailwind CSS 4
- **Charts:** Recharts
- **API:** SEO Intelligence (RapidAPI)
- **Auth:** InstantDB Auth
- **Payments:** Stripe
