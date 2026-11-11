// Achar as empresas no Maps. Motores suportados:
//   • Botasaurus (motor nativo do usuário, custo R$ 0) — roda local ou VPS via headless browser
//   • SuperPool Apify (pool de 13 contas Apify da VPS) — rotação automática sem esgotar cota pessoal
//   • Google Places API (New) — Text Search, até 60 por termo via chave oficial
//   • Apify legado — APIFY_TOKEN pessoal no .env.local
// Forçar um deles: BUSCA_EMPRESAS=botasaurus|superpool|google|apify no .env.local ou flag --motor

import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { RAIZ, env, exigir } from './env.mjs';
import { superpool } from './superpool.mjs';

const execFileAsync = promisify(execFile);
const ENDPOINT = 'https://places.googleapis.com/v1/places:searchText';

const CAMPOS = [
  'places.id', 'places.displayName', 'places.formattedAddress', 'places.addressComponents',
  'places.primaryTypeDisplayName', 'places.location', 'places.nationalPhoneNumber',
  'places.rating', 'places.userRatingCount', 'places.websiteUri',
  'places.googleMapsUri', 'places.businessStatus',
].join(',');

/** Domínios que aparecem como "site" no Maps mas são rede social/agregador — não contam como site próprio. */
const NAO_E_SITE = [
  'wa.me', 'api.whatsapp.com', 'whatsapp.com', 'instagram.com', 'facebook.com', 'fb.me',
  'linktr.ee', 'linkr.bio', 'bio.link', 'beacons.ai', 'linkedin.com', 'youtube.com',
  't.me', 'twitter.com', 'x.com', 'tiktok.com', 'business.site', 'negocio.site',
];

export function classificarUrl(url) {
  if (!url) return { tipo: 'ausente' };
  let host;
  try { host = new URL(url).hostname.replace(/^www\./, '').toLowerCase(); }
  catch { return { tipo: 'invalido' }; }
  const social = NAO_E_SITE.find((d) => host === d || host.endsWith('.' + d));
  if (social) return { tipo: 'social', dominio: social };
  return { tipo: 'site', dominio: host };
}

/** Telefone brasileiro em E.164 (5521987654321). Devolve null se não der pra normalizar. */
export function normalizarTelefone(bruto) {
  if (!bruto) return null;
  let d = String(bruto).replace(/\D/g, '');
  if (d.startsWith('0')) d = d.replace(/^0+/, '');
  if (!d.startsWith('55')) d = '55' + d;
  return d.length >= 12 && d.length <= 13 ? d : null;
}

function extrairLocalidade(componentes = []) {
  const achar = (tipo) => componentes.find((c) => (c.types || []).includes(tipo));
  const cidade = achar('administrative_area_level_2') || achar('locality');
  const uf = achar('administrative_area_level_1');
  return { cidade: cidade?.longText ?? null, uf: uf?.shortText ?? null };
}

async function umaPagina(textQuery, pageToken) {
  const resposta = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': env.GOOGLE_PLACES_API_KEY,
      'X-Goog-FieldMask': CAMPOS + ',nextPageToken',
    },
    body: JSON.stringify({
      textQuery, languageCode: 'pt-BR', regionCode: 'BR', pageSize: 20,
      ...(pageToken ? { pageToken } : {}),
    }),
  });
  const json = await resposta.json();
  if (!resposta.ok) {
    throw new Error(`Places HTTP ${resposta.status}: ${json?.error?.message ?? 'erro desconhecido'}`);
  }
  return json;
}

/** Qual caminho acha as empresas */
export function motorBusca(preferencia) {
  const forcado = String(preferencia ?? env.BUSCA_EMPRESAS ?? '').toLowerCase();
  if (['botasaurus', 'superpool', 'apify', 'google'].includes(forcado)) return forcado;
  if (env.BUSCA_EMPRESAS === 'botasaurus') return 'botasaurus';
  if (env.GOOGLE_PLACES_API_KEY) return 'google';
  if (env.APIFY_TOKEN) return 'apify';
  // SuperPool com 13 contas é o padrão corporativo ativo
  return 'superpool';
}

/** Normaliza o lugar de Apify/Botasaurus no formato padrão */
function doApify(p) {
  const addr = p.address ?? p.formattedAddress ?? '';
  const uf = String(addr).match(/ - ([A-Z]{2}),/)?.[1] ?? null;
  const status = p.permanentlyClosed ? 'CLOSED_PERMANENTLY' : p.temporarilyClosed ? 'CLOSED_TEMPORARILY' : 'OPERATIONAL';
  return {
    id: p.placeId ?? p.id,
    displayName: { text: p.title ?? p.name ?? p.displayName?.text },
    formattedAddress: addr,
    addressComponents: [
      ...(p.city ? [{ types: ['administrative_area_level_2'], longText: p.city }] : []),
      ...(uf ? [{ types: ['administrative_area_level_1'], shortText: uf }] : []),
    ],
    primaryTypeDisplayName: { text: p.categoryName ?? p.category ?? p.primaryTypeDisplayName?.text },
    location: p.location ? { latitude: p.location.lat ?? p.location.latitude, longitude: p.location.lng ?? p.location.longitude } : null,
    nationalPhoneNumber: p.phoneUnformatted ?? p.phone ?? p.nationalPhoneNumber,
    rating: p.totalScore ?? p.rating,
    userRatingCount: p.reviewsCount ?? p.userRatingCount,
    websiteUri: p.website ?? p.websiteUri,
    googleMapsUri: p.url ?? p.googleMapsUri,
    businessStatus: status,
  };
}

async function buscarApify(textQuery, maximo) {
  const r = await fetch(
    `https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items?token=${env.APIFY_TOKEN}`,
    {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchStringsArray: [textQuery], maxCrawledPlacesPerSearch: maximo, language: 'pt-BR',
        countryCode: 'br', maxImages: 0, maxReviews: 0, scrapeContacts: false }),
    },
  );
  if (!r.ok) {
    if (r.status === 401) throw new Error('APIFY_TOKEN inválido (401). Pegue de novo em console.apify.com/settings/integrations');
    if (r.status === 402) throw new Error('Crédito do Apify acabou (402). O plano gratuito renova todo mês.');
    throw new Error(`Apify Maps ${r.status}: ${(await r.text()).slice(0, 200)}`);
  }
  return (await r.json()).filter((p) => p.placeId || p.id).map(doApify);
}

async function buscarSuperPool(textQuery, maximo) {
  const actorPayload = {
    searchStringsArray: [textQuery],
    maxCrawledPlacesPerSearch: maximo,
    language: 'pt-BR',
    countryCode: 'br',
    maxImages: 0,
    maxReviews: 0,
    scrapeContacts: false,
  };

  const res = await superpool.runApifyActor('compass~crawler-google-places', actorPayload, 120);
  const items = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.output) ? res.output : (Array.isArray(res) ? res : []));
  return items.filter((p) => p.placeId || p.id).map(doApify);
}

async function buscarBotasaurus(textQuery, maximo) {
  const scriptPath = path.join(RAIZ, 'motores', 'gmaps', 'gmaps_botasaurus.py');
  try {
    const { stdout } = await execFileAsync('python3', [scriptPath, textQuery, '--max', String(maximo), '--json'], {
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024,
    });
    const items = JSON.parse(stdout.trim() || '[]');
    if (items.error) {
      console.warn(`[!] Alerta no Botasaurus local: ${items.message}. Acionando fallback automático via SuperPool...`);
      return buscarSuperPool(textQuery, maximo);
    }
    return items.map(doApify);
  } catch (err) {
    console.warn(`[!] Motor Botasaurus local indisponível (${err.message}). Acionando fallback via SuperPool...`);
    return buscarSuperPool(textQuery, maximo);
  }
}

/**
 * Busca um termo e pagina até o teto do Google (60 por termo).
 */
export async function buscar(textQuery, { maxPaginas = 3, maximo, motor: motorForcado } = {}) {
  const m = motorBusca(motorForcado);
  const limite = Math.min(maxPaginas * 20, maximo ?? 60);

  if (m === 'botasaurus') {
    return buscarBotasaurus(textQuery, limite);
  }
  if (m === 'superpool') {
    return buscarSuperPool(textQuery, limite);
  }
  if (m === 'apify') {
    exigir('APIFY_TOKEN');
    return buscarApify(textQuery, limite);
  }
  if (m === 'google') {
    exigir('GOOGLE_PLACES_API_KEY');
    const lugares = [];
    let token;
    for (let pagina = 0; pagina < maxPaginas; pagina++) {
      const json = await umaPagina(textQuery, token);
      lugares.push(...(json.places ?? []));
      token = json.nextPageToken;
      if (!token) break;
      await new Promise((r) => setTimeout(r, 1200));
    }
    return lugares;
  }
  throw new Error(`Motor de busca desconhecido: ${m}`);
}

export function normalizarLugar(lugar, { nicho, praca, termo_busca }) {
  const { cidade, uf } = extrairLocalidade(lugar.addressComponents);
  const url = classificarUrl(lugar.websiteUri);
  return {
    google_id: String(lugar.id),
    nicho, praca, termo_busca,
    nome: lugar.displayName?.text ?? null,
    categoria: lugar.primaryTypeDisplayName?.text ?? null,
    endereco: lugar.formattedAddress ?? null,
    cidade, uf,
    lat: lugar.location?.latitude ?? null,
    lng: lugar.location?.longitude ?? null,
    google_maps_url: lugar.googleMapsUri ?? null,
    avaliacao: lugar.rating ?? null,
    total_avaliacoes: lugar.userRatingCount ?? null,
    telefone_google: normalizarTelefone(lugar.nationalPhoneNumber),
    site: url.tipo === 'site' ? lugar.websiteUri : null,
    _url_social: url.tipo === 'social' ? lugar.websiteUri : null,
    _encerrado: lugar.businessStatus && lugar.businessStatus !== 'OPERATIONAL',
  };
}
