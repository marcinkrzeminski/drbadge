import { NextRequest } from "next/server";
import { getPublicDomain } from "@/lib/redis-public";
import { init } from "@instantdb/admin";

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!,
  adminToken: process.env.INSTANTDB_ADMIN_TOKEN!,
});

function normalizeDomain(domain: string): string {
  return domain
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

async function getDomainData(domain: string) {
  const normalized = normalizeDomain(domain);

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

  return activeDomains[0];
}

type BadgeStyle = "normal" | "small" | "tiny";
type BadgeColor = "white" | "light" | "dark";
type BadgeIcon = "circle" | "checkmark";
type BadgeShape = "rect" | "round";
type TextStyle = "regular" | "bold" | "italic" | "bold-italic";

function generateBadgeSVG(drValue: number, options: {
  style: BadgeStyle;
  color: BadgeColor;
  icon: BadgeIcon;
  shape: BadgeShape;
  text: string;
  textStyle: TextStyle;
}): string {
  const sizes = {
    normal: { width: 200, height: 60, fontSize: 14, drSize: 24 },
    small: { width: 150, height: 45, fontSize: 12, drSize: 20 },
    tiny: { width: 120, height: 36, fontSize: 10, drSize: 16 },
  };

  const colors = {
    white: { bg: "#ffffff", text: "#1f2937", drBg: "#3b82f6", drText: "#ffffff", border: "#e5e7eb" },
    light: { bg: "#f3f4f6", text: "#374151", drBg: "#2563eb", drText: "#ffffff", border: "#d1d5db" },
    dark: { bg: "#1f2937", text: "#f9fafb", drBg: "#3b82f6", drText: "#ffffff", border: "#374151" },
  };

  const size = sizes[options.style];
  const colorScheme = colors[options.color];
  const borderRadius = options.shape === "round" ? 8 : 4;
  const fontWeight = options.textStyle.includes("bold") ? "600" : "400";
  const fontStyle = options.textStyle.includes("italic") ? "italic" : "normal";
  const iconSVG = options.icon === "checkmark"
    ? `<path d="M9 12l2 2 4-4" stroke="${colorScheme.drText}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<circle cx="12" cy="12" r="8" fill="${colorScheme.drBg}" stroke="${colorScheme.drText}" stroke-width="2"/>`;
  const drBoxWidth = size.height - 16;
  const textX = drBoxWidth + 24;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size.width}" height="${size.height}" viewBox="0 0 ${size.width} ${size.height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size.width}" height="${size.height}" rx="${borderRadius}" fill="${colorScheme.bg}" stroke="${colorScheme.border}" stroke-width="1"/>
  <rect x="8" y="8" width="${drBoxWidth}" height="${size.height - 16}" rx="${borderRadius - 2}" fill="${colorScheme.drBg}"/>
  <text x="${8 + drBoxWidth / 2}" y="${size.height / 2 + size.drSize / 3}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="${size.drSize}" font-weight="700" fill="${colorScheme.drText}">${drValue}</text>
  ${options.icon === "checkmark" ? `<svg x="${8 + drBoxWidth / 2 - 12}" y="${size.height / 2 + size.drSize / 2 + 2}" width="24" height="24">${iconSVG}</svg>` : ""}
  <text x="${textX}" y="${size.height / 2 - 4}" font-family="system-ui, -apple-system, sans-serif" font-size="${size.fontSize}" font-weight="${fontWeight}" font-style="${fontStyle}" fill="${colorScheme.text}">DR ${drValue}</text>
  <text x="${textX}" y="${size.height / 2 + size.fontSize + 2}" font-family="system-ui, -apple-system, sans-serif" font-size="${size.fontSize - 2}" font-weight="400" fill="${colorScheme.text}" opacity="0.7">${options.text}</text>
</svg>`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const domain = searchParams.get("domain");

    if (!domain) return new Response("Missing domain parameter", { status: 400 });

    const domainData = await getDomainData(domain);
    if (!domainData) return new Response("Domain not found", { status: 404 });

    const svg = generateBadgeSVG(domainData.current_da || 0, {
      style: (searchParams.get("style") || "normal") as BadgeStyle,
      color: (searchParams.get("color") || "white") as BadgeColor,
      icon: (searchParams.get("icon") || "circle") as BadgeIcon,
      shape: (searchParams.get("shape") || "round") as BadgeShape,
      text: searchParams.get("text") || "certified domain rating",
      textStyle: (searchParams.get("textStyle") || "regular") as TextStyle,
    });

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("[Badge API] Error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
