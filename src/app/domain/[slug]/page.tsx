import { notFound } from "next/navigation";
import { init } from "@instantdb/admin";
import { Metadata } from "next";
import { getPublicDomain, setPublicDomain } from "@/lib/redis-public";

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!,
  adminToken: process.env.INSTANTDB_ADMIN_TOKEN!,
});

interface DomainPageProps {
  params: Promise<{ slug: string }>;
}

function normalizeDomain(domain: string): string {
  return domain
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

async function getDomainData(slug: string) {
  const normalized = normalizeDomain(slug);

  const cached = await getPublicDomain(normalized);
  if (cached) return cached;

  const result = await db.query({
    domains: {
      $: {
        where: {
          normalized_url: normalized,
        },
      },
    },
  });

  const activeDomains = (result.domains || []).filter(
    (d: any) => !d.deleted_at || d.deleted_at === 0
  );

  if (activeDomains.length === 0) return null;

  const domain = activeDomains[0];

  await setPublicDomain(normalized, {
    url: domain.url,
    normalized_url: domain.normalized_url,
    current_da: domain.current_da || 0,
    da_change: domain.da_change || 0,
    last_checked: domain.last_checked || Date.now(),
  });

  return domain;
}

export async function generateMetadata({
  params,
}: DomainPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const domain = await getDomainData(resolvedParams.slug);

  if (!domain) {
    return {
      title: "Domain Not Found",
    };
  }

  const daValue = domain.current_da || 0;
  const change = domain.da_change || 0;
  const trend = change > 0 ? "↑" : change < 0 ? "↓" : "→";

  return {
    title: `${domain.url} - DR ${daValue} ${trend}`,
    description: `Certified Domain Rating for ${domain.url}. Current DR: ${daValue} (${
      change > 0 ? "+" : ""
    }${change})`,
    openGraph: {
      title: `${domain.url} - DR ${daValue}`,
      description: `Certified Domain Rating: ${daValue}`,
      type: "website",
      images: [
        {
          url: `/api/og?domain=${encodeURIComponent(domain.url)}&dr=${daValue}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${domain.url} - DR ${daValue}`,
      description: `Certified Domain Rating: ${daValue}`,
    },
  };
}

export default async function DomainPublicPage({
  params,
}: DomainPageProps) {
  const resolvedParams = await params;
  const domain = await getDomainData(resolvedParams.slug);

  if (!domain) {
    notFound();
  }

  const daValue = domain.current_da || 0;
  const change = domain.da_change || 0;
  const trend = change > 0 ? "↑" : change < 0 ? "↓" : "→";
  const trendColor =
    change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-gray-600";

  const lastUpdated = domain.last_checked
    ? new Date(domain.last_checked).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center space-y-8">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
                <div className="w-44 h-44 rounded-full bg-white flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-gray-900">{daValue}</div>
                    <div className="text-sm text-gray-500 font-medium mt-1">DR</div>
                  </div>
                </div>
              </div>
              {change !== 0 && (
                <div className={`absolute -top-2 -right-2 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center ${trendColor}`}>
                  <span className="text-3xl font-bold">{trend}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">{domain.url}</h1>
            <p className="text-lg text-gray-600 font-medium">Certified Domain Rating</p>
          </div>

          {change !== 0 && (
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-full">
                <span className="text-gray-600">Change:</span>
                <span className={`font-bold ${trendColor}`}>
                  {change > 0 ? "+" : ""}{change}
                </span>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Last updated: <span className="font-medium">{lastUpdated}</span>
            </p>
          </div>

          <div className="pt-6">
            <a href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors" target="_blank" rel="noopener noreferrer">
              <span>Powered by DrBadge</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Want to track your domain rating?{" "}
            <a href="/" className="text-blue-600 hover:text-blue-700 font-medium underline">
              Get started for free
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
