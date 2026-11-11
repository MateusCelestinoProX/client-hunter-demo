import { superpool } from '../../lib/superpool.mjs';

/**
 * Motor de Coleta LinkedIn via SuperPool Apify.
 * Combina busca SERP de alta velocidade com atores especializados da Apify
 * para extrair empresas e tomadores de decisão (CEOs, Diretores, Sócios).
 */

function extrairSlug(url) {
  try {
    const u = new URL(url);
    const partes = u.pathname.split('/').filter(Boolean);
    const idxCompany = partes.indexOf('company');
    if (idxCompany !== -1 && partes[idxCompany + 1]) {
      return partes[idxCompany + 1];
    }
    const idxIn = partes.indexOf('in');
    if (idxIn !== -1 && partes[idxIn + 1]) {
      return partes[idxIn + 1];
    }
    return partes[partes.length - 1] || null;
  } catch {
    return null;
  }
}

function limparNomeEmpresa(titulo) {
  if (!titulo) return 'Empresa Sem Nome';
  return titulo
    .replace(/\s*\|\s*LinkedIn.*$/i, '')
    .replace(/\s*-\s*LinkedIn.*$/i, '')
    .replace(/:\s*sobre\s*$/i, '')
    .replace(/:\s*visão geral.*$/i, '')
    .replace(/:\s*overview.*$/i, '')
    .replace(/:\s*posts.*$/i, '')
    .replace(/:\s*vagas.*$/i, '')
    .trim();
}

function extrairDecisorDeTitulo(titulo) {
  // Exemplo: "Carlos Silva - Diretor Comercial - SolTech Energia | LinkedIn"
  if (!titulo) return null;
  const limpo = titulo.replace(/\s*\|\s*LinkedIn.*$/i, '').trim();
  const partes = limpo.split(/\s*[-–|]\s*/);
  if (partes.length >= 2) {
    const nome = partes[0].trim();
    const cargo = partes[1].trim();
    const empresa = partes.length >= 3 ? partes[2].trim() : null;
    return { nome, cargo, empresa };
  }
  return null;
}

/**
 * Busca empresas e decisores no LinkedIn via dorking SERP do Apify (100% de taxa de entrega, sem bloqueios).
 */
export async function buscarLinkedIn({ nicho, praca, limite = 10, tipo = 'empresas' }) {
  console.log(`   💼 [LinkedIn] Buscando ${tipo} de "${nicho}" em "${praca}" via SuperPool Apify...`);

  const dorks = [];
  if (tipo === 'empresas' || tipo === 'ambos') {
    dorks.push(`site:linkedin.com/company "${nicho}" "${praca}"`);
  }
  if (tipo === 'decisores' || tipo === 'ambos') {
    dorks.push(`site:linkedin.com/in ("fundador" OR "diretor" OR "ceo" OR "proprietario" OR "socio") "${nicho}" "${praca}"`);
  }

  const leads = [];
  const slugsVistos = new Set();

  for (const dork of dorks) {
    if (leads.length >= limite) break;

    try {
      const res = await superpool.runApifyActor('apify~google-search-scraper', {
        queries: dork,
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
          if (!url || !url.includes('linkedin.com/')) continue;

          const slug = extrairSlug(url);
          if (!slug || slugsVistos.has(slug)) continue;
          slugsVistos.add(slug);

          const isCompany = url.includes('/company/');
          const decisorInfo = isCompany ? null : extrairDecisorDeTitulo(item.title);
          const nomeFinal = isCompany ? limparNomeEmpresa(item.title) : (decisorInfo?.empresa || limparNomeEmpresa(item.title));

          // Tentar extrair telefone ou email do snippet
          const snippet = item.description || '';
          const emailMatch = snippet.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          const telMatch = snippet.match(/(?:\(?\d{2}\)?\s*)?(?:9\d{4}|\d{4})[-.\s]?\d{4}/);

          const lead = {
            id: `linkedin:${isCompany ? 'company' : 'person'}:${slug}`,
            google_id: `linkedin:${slug}`,
            nome: nomeFinal,
            canal_origem: 'linkedin',
            nicho,
            praca,
            termo_busca: dork,
            categoria: isCompany ? 'Empresa B2B (LinkedIn)' : 'Decisor B2B (LinkedIn)',
            endereco: praca,
            cidade: praca.split(/[-–,]/)[0]?.trim() || praca,
            uf: praca.length === 2 ? praca : null,
            site: null, // Será descoberto pelo enriquecedor se não vier no snippet
            linkedin: url,
            telefone_google: telMatch ? telMatch[0] : null,
            emails: emailMatch ? [emailMatch[0]] : [],
            decisor: decisorInfo ? `${decisorInfo.nome} (${decisorInfo.cargo})` : null,
            resumo_site: snippet,
            dados_adicionais: {
              slug,
              tipo: isCompany ? 'company' : 'person',
              titulo_original: item.title,
              snippet,
              posicao_busca: item.position,
              motor: 'apify~google-search-scraper',
            },
          };

          leads.push(lead);
        }
      }
    } catch (err) {
      console.warn(`   ⚠️ Erro ao consultar LinkedIn via Apify (${dork}):`, err.message);
    }
  }

  // Fallback e Complementação Semântica com Exa AI no SuperPool
  if (leads.length < limite) {
    try {
      console.log(`   🧠 [LinkedIn] Complementando via busca semântica neural Exa AI...`);
      const queriesExa = [];
      if (tipo === 'empresas' || tipo === 'ambos') {
        queriesExa.push(`site:linkedin.com/company "${nicho}" "${praca}"`);
      }
      if (tipo === 'decisores' || tipo === 'ambos') {
        queriesExa.push(`site:linkedin.com/in ("diretor" OR "fundador" OR "ceo" OR "socio") "${nicho}" "${praca}"`);
      }

      for (const qExa of queriesExa) {
        if (leads.length >= limite) break;
        const faltam = limite - leads.length;
        const resExa = await superpool.exaSearch(qExa, Math.min(faltam * 2, 10), false);
        const exaResults = resExa?.results || [];

        for (const item of exaResults) {
          if (leads.length >= limite) break;
          const url = item.url;
          if (!url || !url.includes('linkedin.com/')) continue;

          const slug = extrairSlug(url);
          if (!slug || slugsVistos.has(slug)) continue;
          slugsVistos.add(slug);

          const isCompany = url.includes('/company/');
          const decisorInfo = isCompany ? null : extrairDecisorDeTitulo(item.title);
          const nomeFinal = isCompany ? limparNomeEmpresa(item.title) : (decisorInfo?.empresa || limparNomeEmpresa(item.title));
          const snippet = item.snippet || '';

          const emailMatch = snippet.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          const telMatch = snippet.match(/(?:\(?\d{2}\)?\s*)?(?:9\d{4}|\d{4})[-.\s]?\d{4}/);

          const lead = {
            id: `linkedin:${isCompany ? 'company' : 'person'}:${slug}`,
            google_id: `linkedin:${slug}`,
            nome: nomeFinal,
            canal_origem: 'linkedin',
            nicho,
            praca,
            termo_busca: qExa,
            categoria: isCompany ? 'Empresa B2B (LinkedIn)' : 'Decisor B2B (LinkedIn)',
            endereco: praca,
            cidade: praca.split(/[-–,]/)[0]?.trim() || praca,
            uf: praca.length === 2 ? praca : null,
            site: null,
            linkedin: url,
            telefone_google: telMatch ? telMatch[0] : null,
            emails: emailMatch ? [emailMatch[0]] : [],
            decisor: decisorInfo ? `${decisorInfo.nome} (${decisorInfo.cargo})` : null,
            resumo_site: snippet,
            dados_adicionais: {
              slug,
              tipo: isCompany ? 'company' : 'person',
              titulo_original: item.title,
              snippet,
              motor: 'exa-ai-superpool',
            },
          };

          leads.push(lead);
        }
      }
    } catch (errExa) {
      console.warn(`   ⚠️ Erro na complementação Exa AI (LinkedIn):`, errExa.message);
    }
  }

  console.log(`   ✓ [LinkedIn] Encontrados ${leads.length} leads qualificados.`);
  return leads;
}
