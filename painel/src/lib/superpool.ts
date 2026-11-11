import 'server-only';
import { MOCK_SUPERPOOL_STATS } from './mock-data';

export interface SuperPoolStats {
  total_providers: number;
  providers: {
    apify?: { total_keys: number; active_keys: number; total_requests: number };
    firecrawl?: { total_keys: number; active_keys: number; total_requests: number };
    exa?: { total_keys: number; active_keys: number; total_requests: number };
    resend?: { total_keys: number; active_keys: number; total_requests: number };
    youcom?: { total_keys: number; active_keys: number; total_requests: number };
  };
}

export async function obterSuperPoolStats(): Promise<SuperPoolStats> {
  const hosts = ['http://127.0.0.1:5057', 'http://100.99.207.96:5057'];
  for (const host of hosts) {
    try {
      const res = await fetch(`${host}/api/pool/stats`, {
        next: { revalidate: 30 },
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      continue;
    }
  }
  return MOCK_SUPERPOOL_STATS;
}

export interface ApiKeyResource {
  account: string;
  key_mask: string;
  provider: 'apify' | 'firecrawl' | 'resend' | 'exa' | 'youcom';
  unit: string;
  capacity: number;
  used: number;
  available: number;
  pct_available: number;
  pct_used: number;
  reset_date: string;
  status: 'active' | 'exhausted' | 'cooldown';
  requests_total: number;
  requests_success: number;
  requests_failed: number;
  last_used_at?: string | null;
}

export interface ProviderSummary {
  provider: string;
  unit: string;
  total_keys: number;
  active_keys: number;
  capacity: number;
  used: number;
  available: number;
  pct_available: number;
}

export interface LiveResourcesData {
  updated_at: string;
  cached?: boolean;
  total_keys: number;
  active_keys: number;
  overall_health_score: number;
  summaries: {
    apify: ProviderSummary;
    firecrawl: ProviderSummary;
    resend: ProviderSummary;
    exa: ProviderSummary;
    youcom: ProviderSummary;
  };
  keys_by_provider: {
    apify: ApiKeyResource[];
    firecrawl: ApiKeyResource[];
    resend: ApiKeyResource[];
    exa: ApiKeyResource[];
    youcom: ApiKeyResource[];
  };
}

export async function obterLiveResources(forceRefresh = false): Promise<LiveResourcesData> {
  const hosts = ['http://127.0.0.1:5057', 'http://100.99.207.96:5057'];
  const qs = forceRefresh ? '?refresh=1' : '';
  for (const host of hosts) {
    try {
      const res = await fetch(`${host}/api/pool/resources${qs}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      continue;
    }
  }

  // Fallback Enterprise higienizado para o modo Demonstração
  const now = new Date().toISOString();
  return {
    updated_at: now,
    cached: false,
    total_keys: 17,
    active_keys: 17,
    overall_health_score: 99.8,
    summaries: {
      resend: {
        provider: 'Resend SuperPool',
        unit: 'envios/dia',
        total_keys: 8,
        active_keys: 8,
        capacity: 24000,
        used: 6140,
        available: 17860,
        pct_available: 74.4,
      },
      apify: {
        provider: 'Apify Actors',
        unit: 'compute units',
        total_keys: 4,
        active_keys: 4,
        capacity: 500,
        used: 82,
        available: 418,
        pct_available: 83.6,
      },
      firecrawl: {
        provider: 'Firecrawl Crawl',
        unit: 'páginas/mês',
        total_keys: 2,
        active_keys: 2,
        capacity: 10000,
        used: 1420,
        available: 8580,
        pct_available: 85.8,
      },
      exa: {
        provider: 'Exa Neural Search',
        unit: 'queries/mês',
        total_keys: 2,
        active_keys: 2,
        capacity: 5000,
        used: 940,
        available: 4060,
        pct_available: 81.2,
      },
      youcom: {
        provider: 'You.com Search',
        unit: 'queries/mês',
        total_keys: 1,
        active_keys: 1,
        capacity: 2000,
        used: 310,
        available: 1690,
        pct_available: 84.5,
      },
    },
    keys_by_provider: {
      resend: [
        {
          account: 'NODE-01-PRIMARY',
          key_mask: 're_1a9b...7x89',
          provider: 'resend',
          unit: 'disparos',
          capacity: 3000,
          used: 840,
          available: 2160,
          pct_available: 72,
          pct_used: 28,
          reset_date: '2026-12-01',
          status: 'active',
          requests_total: 2940,
          requests_success: 2938,
          requests_failed: 2,
          last_used_at: now,
        },
        {
          account: 'NODE-02-SECONDARY',
          key_mask: 're_2b8c...4y12',
          provider: 'resend',
          unit: 'disparos',
          capacity: 3000,
          used: 620,
          available: 2380,
          pct_available: 79.3,
          pct_used: 20.7,
          reset_date: '2026-12-01',
          status: 'active',
          requests_total: 2890,
          requests_success: 2890,
          requests_failed: 0,
          last_used_at: now,
        },
        {
          account: 'NODE-03-HIGHTICKET',
          key_mask: 're_3c7d...9z34',
          provider: 'resend',
          unit: 'disparos',
          capacity: 3000,
          used: 980,
          available: 2020,
          pct_available: 67.3,
          pct_used: 32.7,
          reset_date: '2026-12-01',
          status: 'active',
          requests_total: 2910,
          requests_success: 2910,
          requests_failed: 0,
          last_used_at: now,
        },
        {
          account: 'NODE-04-WARMUP',
          key_mask: 're_4d6e...1a56',
          provider: 'resend',
          unit: 'disparos',
          capacity: 3000,
          used: 720,
          available: 2280,
          pct_available: 76,
          pct_used: 24,
          reset_date: '2026-12-01',
          status: 'active',
          requests_total: 2850,
          requests_success: 2845,
          requests_failed: 5,
          last_used_at: now,
        },
        {
          account: 'NODE-05-SCALE',
          key_mask: 're_5e5f...8b78',
          provider: 'resend',
          unit: 'disparos',
          capacity: 3000,
          used: 1100,
          available: 1900,
          pct_available: 63.3,
          pct_used: 36.7,
          reset_date: '2026-12-01',
          status: 'active',
          requests_total: 2980,
          requests_success: 2980,
          requests_failed: 0,
          last_used_at: now,
        },
        {
          account: 'NODE-06-FAILOVER',
          key_mask: 're_6f4g...3c90',
          provider: 'resend',
          unit: 'disparos',
          capacity: 3000,
          used: 480,
          available: 2520,
          pct_available: 84,
          pct_used: 16,
          reset_date: '2026-12-01',
          status: 'active',
          requests_total: 2760,
          requests_success: 2758,
          requests_failed: 2,
          last_used_at: now,
        },
        {
          account: 'NODE-07-REGIONAL',
          key_mask: 're_7g3h...5d23',
          provider: 'resend',
          unit: 'disparos',
          capacity: 3000,
          used: 690,
          available: 2310,
          pct_available: 77,
          pct_used: 23,
          reset_date: '2026-12-01',
          status: 'active',
          requests_total: 2820,
          requests_success: 2818,
          requests_failed: 2,
          last_used_at: now,
        },
        {
          account: 'NODE-08-ENTERPRISE',
          key_mask: 're_8h2i...0e45',
          provider: 'resend',
          unit: 'disparos',
          capacity: 3000,
          used: 710,
          available: 2290,
          pct_available: 76.3,
          pct_used: 23.7,
          reset_date: '2026-12-01',
          status: 'active',
          requests_total: 2900,
          requests_success: 2900,
          requests_failed: 0,
          last_used_at: now,
        },
      ],
      apify: [
        {
          account: 'APIFY-CLUSTER-01',
          key_mask: 'apify_api_...x411',
          provider: 'apify',
          unit: 'compute units',
          capacity: 250,
          used: 42,
          available: 208,
          pct_available: 83.2,
          pct_used: 16.8,
          reset_date: '2026-12-01',
          status: 'active',
          requests_total: 8200,
          requests_success: 8190,
          requests_failed: 10,
          last_used_at: now,
        },
        {
          account: 'APIFY-CLUSTER-02',
          key_mask: 'apify_api_...y522',
          provider: 'apify',
          unit: 'compute units',
          capacity: 250,
          used: 40,
          available: 210,
          pct_available: 84,
          pct_used: 16,
          reset_date: '2026-12-01',
          status: 'active',
          requests_total: 4300,
          requests_success: 4295,
          requests_failed: 5,
          last_used_at: now,
        },
      ],
      firecrawl: [
        {
          account: 'FIRECRAWL-PRO-01',
          key_mask: 'fc_live_...99bb',
          provider: 'firecrawl',
          unit: 'páginas',
          capacity: 10000,
          used: 1420,
          available: 8580,
          pct_available: 85.8,
          pct_used: 14.2,
          reset_date: '2026-12-01',
          status: 'active',
          requests_total: 1420,
          requests_success: 1418,
          requests_failed: 2,
          last_used_at: now,
        },
      ],
      exa: [
        {
          account: 'EXA-NEURAL-01',
          key_mask: 'exa_api_...77ff',
          provider: 'exa',
          unit: 'queries',
          capacity: 5000,
          used: 940,
          available: 4060,
          pct_available: 81.2,
          pct_used: 18.8,
          reset_date: '2026-12-01',
          status: 'active',
          requests_total: 940,
          requests_success: 940,
          requests_failed: 0,
          last_used_at: now,
        },
      ],
      youcom: [
        {
          account: 'YOU-RESEARCH-01',
          key_mask: 'you_live_...44ee',
          provider: 'youcom',
          unit: 'queries',
          capacity: 2000,
          used: 310,
          available: 1690,
          pct_available: 84.5,
          pct_used: 15.5,
          reset_date: '2026-12-01',
          status: 'active',
          requests_total: 310,
          requests_success: 310,
          requests_failed: 0,
          last_used_at: now,
        },
      ],
    },
  };
}
