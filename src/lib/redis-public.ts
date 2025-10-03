import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const CACHE_TTL = 60 * 60 * 24;

interface CachedDomain {
  url: string;
  normalized_url: string;
  current_da: number;
  da_change: number;
  last_checked: number;
  cached_at: number;
}

export async function getPublicDomain(slug: string): Promise<CachedDomain | null> {
  if (!redis) {
    console.log("[Redis] Not configured, skipping cache");
    return null;
  }

  try {
    const key = `public:${slug.toLowerCase()}`;
    const cached = await redis.get<CachedDomain>(key);

    if (cached) {
      console.log(`[Redis] Cache HIT for ${slug}`);
      return cached;
    }

    console.log(`[Redis] Cache MISS for ${slug}`);
    return null;
  } catch (error) {
    console.error("[Redis] Get error:", error);
    return null;
  }
}

export async function setPublicDomain(slug: string, data: Omit<CachedDomain, "cached_at">): Promise<void> {
  if (!redis) {
    console.log("[Redis] Not configured, skipping cache set");
    return;
  }

  try {
    const key = `public:${slug.toLowerCase()}`;
    const cacheData: CachedDomain = { ...data, cached_at: Date.now() };
    await redis.setex(key, CACHE_TTL, cacheData);
    console.log(`[Redis] Cached ${slug} for ${CACHE_TTL}s`);
  } catch (error) {
    console.error("[Redis] Set error:", error);
  }
}

export async function invalidatePublicDomain(slug: string): Promise<void> {
  if (!redis) {
    console.log("[Redis] Not configured, skipping invalidation");
    return;
  }

  try {
    const key = `public:${slug.toLowerCase()}`;
    await redis.del(key);
    console.log(`[Redis] Invalidated cache for ${slug}`);
  } catch (error) {
    console.error("[Redis] Delete error:", error);
  }
}

export async function getCacheStats(): Promise<{ total_keys: number; cache_enabled: boolean }> {
  if (!redis) return { total_keys: 0, cache_enabled: false };

  try {
    const keys = await redis.keys("public:*");
    return { total_keys: keys.length, cache_enabled: true };
  } catch (error) {
    console.error("[Redis] Stats error:", error);
    return { total_keys: 0, cache_enabled: true };
  }
}
