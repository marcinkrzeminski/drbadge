/**
 * Simple rate limiter utility for email sending
 * Helps prevent hitting Plunk API rate limits
 */

export interface RateLimiterConfig {
  batchSize: number; // Number of operations per batch
  delayMs: number; // Delay between batches in milliseconds
}

const DEFAULT_CONFIG: RateLimiterConfig = {
  batchSize: 10,
  delayMs: 1000,
};

/**
 * Process items in batches with rate limiting
 */
export async function processBatched<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  config: Partial<RateLimiterConfig> = {}
): Promise<R[]> {
  const { batchSize, delayMs } = { ...DEFAULT_CONFIG, ...config };
  const results: R[] = [];

  console.log(`[Rate Limiter] Processing ${items.length} items in batches of ${batchSize}`);

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(items.length / batchSize);

    console.log(`[Rate Limiter] Processing batch ${batchNumber}/${totalBatches} (${batch.length} items)`);

    // Process batch in parallel
    const batchResults = await Promise.all(
      batch.map(item => processor(item))
    );

    results.push(...batchResults);

    // Add delay between batches (except after the last batch)
    if (i + batchSize < items.length) {
      console.log(`[Rate Limiter] Waiting ${delayMs}ms before next batch...`);
      await delay(delayMs);
    }
  }

  console.log(`[Rate Limiter] Completed processing ${items.length} items`);
  return results;
}

/**
 * Helper function to create a delay
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Process items sequentially with a delay between each
 * Use this when order matters or you need strict rate limiting
 */
export async function processSequential<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  delayMs: number = 500
): Promise<R[]> {
  const results: R[] = [];

  console.log(`[Rate Limiter] Processing ${items.length} items sequentially with ${delayMs}ms delay`);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    console.log(`[Rate Limiter] Processing item ${i + 1}/${items.length}`);

    const result = await processor(item);
    results.push(result);

    // Add delay between items (except after the last item)
    if (i < items.length - 1) {
      await delay(delayMs);
    }
  }

  console.log(`[Rate Limiter] Completed sequential processing of ${items.length} items`);
  return results;
}
