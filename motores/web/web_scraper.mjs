import { superpool } from '../../lib/superpool.mjs';
import { enriquecerSite } from '../../lib/site.mjs';

/**
 * Motor de Coleta Web Corporativa B2B via SuperPool (Apify SERP + Exa AI + Firecrawl).
 * Procura diretamente os sites e portais de empresas do nicho na cidade desejada,
 * contornando diretórios genéricos e extraindo contatos institucionais diretamente da fonte.
 */

function extrairDominio(url) {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return null;
  }
}

function isDominioValido(dominio) {
  if (!dominio) return false;
  const d = dominio.toLowerCase();

  // Rejeita domínios governamentais, judiciais, militares e educacionais
  if (
    d.endsWith('.gov.br') ||
    d.endsWith('.jus.br') ||
    d.endsWith('.leg.br') ||
    d.endsWith('.mp.br') ||
    d.endsWith('.edu.br') ||
    d.endsWith('.mil.br')
  ) {
    return false;
  }

  // Lista de diretórios, redes sociais, marketplaces e portais de mídia que não são empresas individuais
  const blacklistTermos = [
    'wikipedia.org', 'wikimedia.org',
    'facebook.com', 'instagram.com', 'linkedin.com', 'twitter.com', 'x.com',
    'youtube.com', 'tiktok.com', 'pinterest.com', 'threads.net',
    'mercadolivre.com.br', 'mercadolivre.com', 'olx.com.br', 'shopee.com.br',
    'amazon.com.br', 'amazon.com', 'magazineluiza.com.br',
    'jusbrasil.com.br', 'reclameaqui.com.br', 'guiamais.com.br',
    'apontador.com.br', 'telelistas.net', 'econodata.com.br', 'consultasocio.com',
    'transparencia.cc', 'cnpj.biz', 'casadosdados.com.br', 'infoplex.com.br',
    'speedio.com.br', 'situacao-cadastral.com', 'consultacnpj.com',
    'globo.com', 'uol.com.br', 'terra.com.br', 'r7.com', 'estadao.com.br',
    'folha.uol.com.br', 'cnnbrasil.com.br', 'metropoles.com', 'g1.globo.com',
    'tripadvisor.com', 'booking.com', 'trivago.com', 'airbnb.com',
    'sympla.com.br', 'eventbrite.com.br', 'meetup.com',
    'github.com', 'gitlab.com', 'medium.com', 'wordpress.com', 'blogspot.com'
  ];

  for (const item of blacklistTermos) {
    if (d === item || d.endsWith(`.${item}`)) {
      return false;
    }
  }

  return true;
}

export async function buscarWeb({ nicho, praca, limite = 10, enriquecerNaColeta = true }) {
  console.log(`   🌐 [Web B2B] Buscando portais e empresas de "${nicho}" em "${praca}"...`);

  const leads = [];
  const dominiosVistos = new Set();

  // 1. Busca SERP corporativa via Apify
  const querySerp = `"${nicho}" "${praca}" ("contato" OR "fale conosco" OR "orçamento" OR "serviços") -site:mercadolivre.com.br -site:olx.com.br -site:wikipedia.org`;
  
  try {
    console.log(`   🌐 [Web B2B] Executando Apify SERP Search...`);
    const res = await superpool.runApifyActor('apify~google-search-scraper', {
      queries: querySerp,
      maxPagesPerQuery: 1,
      resultsPerPage: Math.min(limite * 2, 20),
      countryCode: 'br',
      languageCode: 'pt-BR',
    }, 45);

    const items = res?.data || [];
    for (const bloco of items) {
      const organicos = bloco.organicResults || [];
      for (const item of organicos) {
        if (leads.length >= limite) break;
        const url = item.url;
        if (!url) continue;

        const dominio = extrairDominio(url);
        if (!dominio || !isDominioValido(dominio) || dominiosVistos.has(dominio)) continue;
        dominiosVistos.add(dominio);

        // Limpar nome da empresa a partir do título do site
        const rawTitulo = item.title || dominio;
        const nomeMatch = rawTitulo.split(/[-–|:»]/)[0]?.trim();
        const nome = (nomeMatch && nomeMatch.length > 2) ? nomeMatch : dominio;

        const snippet = item.description || '';
        const emailMatch = snippet.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        const telMatch = snippet.match(/(?:\(?\d{2}\)?\s*)?(?:9\d{4}|\d{4})[-.\s]?\d{4}/);

        const lead = {
          id: `web:${dominio}`,
          google_id: `web:${dominio}`,
          nome,
          canal_origem: 'web',
          nicho,
          praca,
          termo_busca: querySerp,
          categoria: `Website Corporativo (${nicho})`,
          endereco: praca,
          cidade: praca.split(/[-–,]/)[0]?.trim() || praca,
          uf: praca.length === 2 ? praca : null,
          site: url,
          site_titulo: item.title,
          telefone_google: telMatch ? telMatch[0] : null,
          emails: emailMatch ? [emailMatch[0]] : [],
          resumo_site: snippet,
          dados_adicionais: {
            dominio,
            snippet,
            posicao: item.position,
            motor: 'apify~google-search-scraper',
          },
        };

        leads.push(lead);
      }
    }
  } catch (err) {
    console.warn(`   ⚠️ Erro na busca SERP Web (${querySerp}):`, err.message);
  }

  // 2. Busca Semântica Exa AI se ainda tivermos vagas
  if (leads.length < limite) {
    try {
      console.log(`   🧠 [Web B2B] Complementando com busca semântica Exa AI...`);
      const exaRes = await superpool.exaSearch(`empresas fornecedoras e prestadores de ${nicho} em ${praca}`, limite - leads.length);
      const exaItems = exaRes?.results || [];

      for (const item of exaItems) {
        if (leads.length >= limite) break;
        const url = item.url;
        if (!url) continue;

        const dominio = extrairDominio(url);
        if (!dominio || !isDominioValido(dominio) || dominiosVistos.has(dominio)) continue;
        dominiosVistos.add(dominio);

        const nome = item.title?.split(/[-–|:»]/)[0]?.trim() || dominio;
        const lead = {
          id: `web:${dominio}`,
          google_id: `web:${dominio}`,
          nome,
          canal_origem: 'web',
          nicho,
          praca,
          termo_busca: 'Exa AI Neural Search',
          categoria: `Website B2B (${nicho})`,
          endereco: praca,
          cidade: praca.split(/[-–,]/)[0]?.trim() || praca,
          uf: praca.length === 2 ? praca : null,
          site: url,
          site_titulo: item.title,
          emails: [],
          resumo_site: item.text?.slice(0, 300) || '',
          dados_adicionais: {
            dominio,
            score_relevancia: item.score,
            motor: 'exa-ai',
          },
        };

        leads.push(lead);
      }
    } catch (exaErr) {
      console.warn(`   ⚠️ Busca Exa AI não concluída:`, exaErr.message);
    }
  }

  // 3. Opcional: Enriquecer sites raspando via lib/site.mjs (com Firecrawl fallback)
  if (enriquecerNaColeta && leads.length > 0) {
    console.log(`   🌐 [Web B2B] Extraindo contatos e metadados dos primeiros ${Math.min(leads.length, 5)} sites...`);
    const subset = leads.slice(0, 5);
    for (const lead of subset) {
      try {
        const enriquecimento = await enriquecerSite(lead.site);
        if (enriquecimento) {
          if (enriquecimento.emails?.length) lead.emails = [...new Set([...lead.emails, ...enriquecimento.emails])];
          if (enriquecimento.whatsapp) lead.whatsapp = enriquecimento.whatsapp;
          if (enriquecimento.telefones_site?.length && !lead.telefone_google) lead.telefone_google = enriquecimento.telefones_site[0];
          if (enriquecimento.instagram) lead.instagram = enriquecimento.instagram;
          if (enriquecimento.linkedin) lead.linkedin = enriquecimento.linkedin;
          if (enriquecimento.cnpj) lead.cnpj = enriquecimento.cnpj;
          if (enriquecimento.resumo_site) lead.resumo_site = enriquecimento.resumo_site;
          lead.site_vivo = enriquecimento.site_vivo;
          lead.site_url_final = enriquecimento.site_url_final || lead.site;
          lead.situacao_site = enriquecimento.site_vivo ? 'com_site' : 'site_morto';
          lead.marketing = enriquecimento.marketing || null;
          lead.texto_site = enriquecimento.texto || null;
        }
      } catch (scrapErr) {
        // Silencioso se um site particular falhar
      }
    }
  }

  console.log(`   ✓ [Web B2B] Encontrados ${leads.length} leads qualificados.`);
  return leads;
}
