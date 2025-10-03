/**
 * SEO Intelligence API integration using RapidAPI KarmaLabs
 * Provides Domain Authority (DA) metrics for tracked domains
 */

interface SEOMetrics {
  domain: string;
  domainAuthority: number;
  backlinks?: number;
  referringDomains?: number;
}

interface SEOAPIResponse {
  domain: string;
  domain_rating?: number; // DR from API
  domain_rank?: number;
  success?: boolean;
  // Legacy fields (keep for compatibility)
  domain_authority?: number;
  da?: number;
  authority_score?: number;
  backlinks?: number;
  referring_domains?: number;
  total_backlinks?: number;
  ref_domains?: number;
}

export class SEOIntelligenceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'SEOIntelligenceError';
  }
}

export class SEOIntelligenceService {
  private readonly apiKey: string;
  private readonly apiHost: string = 'seo-intelligence.p.rapidapi.com';
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 1000; // 1 second

  constructor() {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      throw new SEOIntelligenceError('RAPIDAPI_KEY environment variable is not set');
    }
    this.apiKey = apiKey;
  }

  /**
   * Fetch Domain Authority metrics for a given domain
   */
  async getDomainMetrics(domain: string): Promise<SEOMetrics> {
    const normalizedDomain = this.normalizeDomain(domain);

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.makeAPIRequest(normalizedDomain);
        return this.parseResponse(normalizedDomain, response);
      } catch (error) {
        if (attempt === this.maxRetries) {
          throw error;
        }

        // Wait before retry with exponential backoff
        await this.sleep(this.retryDelay * attempt);
        console.warn(`Retry attempt ${attempt} for domain ${normalizedDomain}`);
      }
    }

    throw new SEOIntelligenceError('Max retries exceeded');
  }

  /**
   * Make API request to SEO Intelligence
   */
  private async makeAPIRequest(domain: string): Promise<SEOAPIResponse> {
    const url = `https://${this.apiHost}/check-dr-ar?domain=${encodeURIComponent(domain)}`;

    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': this.apiKey,
        'x-rapidapi-host': this.apiHost,
      },
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[SEO Intelligence] API error: ${response.status} - ${errorText}`);

      throw new SEOIntelligenceError(
        `API request failed: ${response.statusText}`,
        response.status
      );
    }

    return await response.json();
  }

  /**
   * Parse API response to standard metrics format
   */
  private parseResponse(domain: string, response: SEOAPIResponse): SEOMetrics {
    // domain_rating is the DR value (0-100), domain_rank is position ranking
    const da = response.domain_rating ?? 0;

    const backlinks =
      response.backlinks ??
      response.total_backlinks;

    const referringDomains =
      response.referring_domains ??
      response.ref_domains;

    return {
      domain,
      domainAuthority: da,
      backlinks,
      referringDomains,
    };
  }

  /**
   * Normalize domain to consistent format
   * Removes protocol, www, and trailing slashes
   */
  private normalizeDomain(url: string): string {
    let domain = url.trim().toLowerCase();

    // Remove protocol
    domain = domain.replace(/^https?:\/\//, '');

    // Remove www
    domain = domain.replace(/^www\./, '');

    // Remove path and trailing slash
    domain = domain.split('/')[0];

    // Remove port if present
    domain = domain.split(':')[0];

    return domain;
  }

  /**
   * Sleep utility for retries
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const seoIntelligence = new SEOIntelligenceService();
