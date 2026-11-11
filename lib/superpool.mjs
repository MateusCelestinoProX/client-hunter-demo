// Cliente de integração com o Super Pool de Recursos e Chaves de IA da VPS.
// Fornece rotação automática através de:
// - 13 contas Apify (Actors, Instagram, Meta Ads, Google SERP)
// - 14 contas Firecrawl (Bypass anti-bot, SPAs e Markdown limpo)
// - 9 contas Exa AI (Busca neural semântica)
// - 8 contas Resend (E-mails transacionais)

import { env } from './env.mjs';

const PRIMARY_GATEWAY = process.env.GATEWAY_URL || env.GATEWAY_URL || 'http://100.99.207.96:5057';
const FALLBACK_GATEWAY = process.env.GATEWAY_FALLBACK_URL || env.GATEWAY_FALLBACK_URL || 'http://127.0.0.1:5057';

class SuperPoolClient {
  constructor() {
    this.gateways = [PRIMARY_GATEWAY, FALLBACK_GATEWAY];
    this.activeGateway = null;
  }

  async request(endpoint, method = 'GET', body = null, timeoutMs = 60000) {
    const hosts = this.activeGateway ? [this.activeGateway, ...this.gateways.filter(g => g !== this.activeGateway)] : this.gateways;
    let lastError = null;

    for (const host of hosts) {
      const cleanHost = host.replace(/\/+$/, '');
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const url = `${cleanHost}${cleanEndpoint}`;

      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        const options = {
          method,
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'LeadPulse-SuperPool-Client/1.0',
          },
        };

        if (body && (method === 'POST' || method === 'PUT')) {
          options.headers['Content-Type'] = 'application/json';
          options.body = typeof body === 'string' ? body : JSON.stringify(body);
        }

        const res = await fetch(url, options);
        clearTimeout(timer);

        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = { raw: text };
        }

        if (!res.ok) {
          throw new Error(`SuperPool HTTP ${res.status}: ${typeof data === 'object' ? JSON.stringify(data) : data}`);
        }

        this.activeGateway = host;
        return data;
      } catch (err) {
        lastError = err;
        this.activeGateway = null;
        continue;
      }
    }

    throw new Error(`SuperPool indisponível em [${hosts.join(', ')}]: ${lastError?.message || lastError}`);
  }

  async isAvailable(timeoutMs = 3000) {
    try {
      const stats = await this.request('/api/pool/stats', 'GET', null, timeoutMs);
      return Boolean(stats && stats.total_providers > 0);
    } catch {
      return false;
    }
  }

  async getStats() {
    return this.request('/api/pool/stats', 'GET', null, 10000);
  }

  async reloadPool() {
    return this.request('/api/pool/reload', 'POST', {}, 10000);
  }

  /**
   * Executa qualquer ator do catálogo da Apify com rotação sobre o pool de 13 contas ativas.
   */
  async runApifyActor(actor_id, payload = {}, timeout = 90) {
    const timeoutMs = (timeout + 20) * 1000;
    // Garante compatibilidade com o formato da API do Apify (autor~nome-do-ator)
    const safeActorId = actor_id.includes('/') ? actor_id.replace('/', '~') : actor_id;
    return this.request('/api/apify/actor', 'POST', {
      actor_id: safeActorId,
      payload,
      timeout,
    }, timeoutMs);
  }

  /**
   * Busca no Google tipo SERP via Apify Google Search Scraper.
   */
  async apifyGoogleSearch(query, maxResults = 10) {
    return this.runApifyActor('apify~google-search-scraper', {
      queries: query,
      maxPagesPerQuery: 1,
      resultsPerPage: maxResults,
    }, 90);
  }

  /**
   * Meta-busca agregada e triangulada com deduplicação de resultados cruzando múltiplos motores (Exa AI + Search Index).
   */
  async unifiedSearch(query, limit = 5) {
    return this.request('/api/search/unified', 'POST', {
      query,
      limit,
    }, 45000);
  }

  /**
   * Raspa páginas web completas extraindo Markdown limpo via pool de 14 contas Firecrawl.
   * Contorna proteções anti-bot/Cloudflare e renderiza SPAs.
   */
  async firecrawlScrape(url, format = 'markdown') {
    return this.request('/api/scrape/firecrawl', 'POST', {
      url,
      format,
    }, 60000);
  }

  /**
   * Realiza busca semântica neural via pool de 9 contas Exa AI.
   */
  async exaSearch(query, numResults = 5, useAutoprompt = true) {
    return this.request('/api/search/exa', 'POST', {
      query,
      numResults,
      useAutoprompt,
    }, 45000);
  }

  /**
   * Busca rápida via Google CSE da VPS.
   */
  async googleCseSearch(query, limit = 10) {
    const q = encodeURIComponent(query);
    return this.request(`/api/search/google-cse?q=${q}&limit=${limit}`, 'GET', null, 20000);
  }

  /**
   * Dispara e-mail via pool de 8 contas Resend.
   */
  async resendEmail({ to, subject, html, text, from = 'prospeccao@resend.dev' }) {
    return this.request('/api/email/resend', 'POST', {
      to,
      subject,
      html,
      text,
      from,
    }, 20000);
  }
}

export const superpool = new SuperPoolClient();
