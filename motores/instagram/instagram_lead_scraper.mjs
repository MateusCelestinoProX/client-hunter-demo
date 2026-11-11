import { superpool } from '../../lib/superpool.mjs';

/**
 * Motor de Coleta Instagram via SuperPool Apify.
 * Capta perfis comerciais, clínicas, escritórios e integradores através de:
 * 1. Dorking SERP otimizado (site:instagram.com com filtros de contato/WhatsApp)
 * 2. Ator oficial Apify Instagram Scraper (apify~instagram-scraper)
 */

function extrairUsername(url) {
  try {
    const u = new URL(url);
    const partes = u.pathname.split('/').filter(Boolean);
    const ignorados = ['p', 'reel', 'explore', 'stories', 'tv', 'direct', 'accounts'];
    if (partes[0] && !ignorados.includes(partes[0].toLowerCase())) {
      return partes[0].replace(/[@]/g, '');
    }
    return null;
  } catch {
    return null;
  }
}

function extrairContatosBio(texto) {
  if (!texto) return { email: null, telefone: null, whatsapp: null };

  const emailMatch = texto.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  
  // Extração de WhatsApp / Telefone brasileiro
  const zapMatch = texto.match(/(?:whats(?:app)?|zap|contato|fone|tel|cel)?\s*(?:\(?(\d{2})\)?\s*)?(?:9\s*)?(\d{4,5})[-.\s]?(\d{4})/i);
  let telefoneFormatado = null;
  if (zapMatch) {
    const ddd = zapMatch[1] || '';
    const num1 = zapMatch[2];
    const num2 = zapMatch[3];
    telefoneFormatado = ddd ? `+55${ddd}${num1}${num2}` : `${num1}${num2}`;
  }

  // Links wa.me ou bit.ly
  const waLinkMatch = texto.match(/wa\.me\/(55\d{10,11}|\d{10,11})/i);
  const whatsapp = waLinkMatch ? `+${waLinkMatch[1]}` : telefoneFormatado;

  return {
    email: emailMatch ? emailMatch[0] : null,
    telefone: telefoneFormatado,
    whatsapp,
  };
}

export async function buscarInstagram({ nicho, praca, limite = 10, usarAtorDireto = false }) {
  console.log(`   📸 [Instagram] Buscando perfis de "${nicho}" em "${praca}" via SuperPool Apify...`);

  const leads = [];
  const usernamesVistos = new Set();

  // Dorking de busca direcionada para contas comerciais com contato
  const dorks = [
    `site:instagram.com ("whatsapp" OR "contato" OR "agendamento" OR "orçamento") "${nicho}" "${praca}"`,
    `site:instagram.com "${nicho}" "${praca}"`,
  ];

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
          if (!url || !url.includes('instagram.com/')) continue;

          const username = extrairUsername(url);
          if (!username || usernamesVistos.has(username.toLowerCase())) continue;
          usernamesVistos.add(username.toLowerCase());

          // Formatar nome a partir do título (ex: "Clínica Dental (@clinica) • Fotos e vídeos...")
          const rawTitulo = item.title || username;
          const nomeMatch = rawTitulo.match(/^([^•|(-]+)/);
          const nome = (nomeMatch ? nomeMatch[1].trim() : username) || username;

          const bio = item.description || '';
          const contatos = extrairContatosBio(bio);

          // Extrair contagem de seguidores se estiver no snippet
          const segMatch = bio.match(/([\d.,]+[kKmM]?)\s*(?:seguidores|followers)/i);
          let seguidoresNum = null;
          if (segMatch) {
            const val = segMatch[1].toLowerCase().replace(',', '.');
            if (val.endsWith('k')) seguidoresNum = Math.round(parseFloat(val) * 1000);
            else if (val.endsWith('m')) seguidoresNum = Math.round(parseFloat(val) * 1000000);
            else seguidoresNum = parseInt(val.replace(/\./g, ''), 10) || null;
          }

          const lead = {
            id: `instagram:${username}`,
            google_id: `instagram:${username}`,
            nome,
            canal_origem: 'instagram',
            nicho,
            praca,
            termo_busca: dork,
            categoria: `Instagram Comercial (${nicho})`,
            endereco: praca,
            cidade: praca.split(/[-–,]/)[0]?.trim() || praca,
            uf: praca.length === 2 ? praca : null,
            site: null,
            instagram: `https://www.instagram.com/${username}`,
            telefone_google: contatos.telefone,
            whatsapp: contatos.whatsapp,
            emails: contatos.email ? [contatos.email] : [],
            seguidores: seguidoresNum,
            justificativa_instagram: `${seguidoresNum ? `${seguidoresNum} seguidores. ` : ''}Bio: "${bio.slice(0, 160)}"`,
            dados_adicionais: {
              username,
              bio,
              seguidores: seguidoresNum,
              motor: 'apify~google-search-scraper',
              posicao: item.position,
            },
          };

          leads.push(lead);
        }
      }
    } catch (err) {
      console.warn(`   ⚠️ Erro ao consultar Instagram via Apify SERP (${dork}):`, err.message);
    }
  }

  // Fallback e Complementação Semântica com Exa AI no SuperPool
  if (leads.length < limite) {
    try {
      console.log(`   🧠 [Instagram] Complementando via busca semântica neural Exa AI...`);
      const faltam = limite - leads.length;
      const qExa = `site:instagram.com "${nicho}" "${praca}" (whatsapp OR contato OR orcamento)`;
      const resExa = await superpool.exaSearch(qExa, Math.min(faltam * 2, 10), false);
      const exaResults = resExa?.results || [];

      for (const item of exaResults) {
        if (leads.length >= limite) break;
        const url = item.url;
        if (!url || !url.includes('instagram.com/')) continue;

        const username = extrairUsername(url);
        if (!username || usernamesVistos.has(username.toLowerCase())) continue;
        usernamesVistos.add(username.toLowerCase());

        const rawTitulo = item.title || username;
        const nomeMatch = rawTitulo.match(/^([^•|(-]+)/);
        const nome = (nomeMatch ? nomeMatch[1].trim() : username) || username;
        const bio = item.snippet || '';

        const contatos = extrairContatosBio(bio);

        // Extrair contagem de seguidores se disponível no snippet (ex: "125 followers" ou "3,272 followers")
        const segMatch = bio.match(/([\d,.]+)\s*(?:mil|k)?\s*followers/i);
        let seguidoresNum = null;
        if (segMatch) {
          const rawNum = segMatch[1].replace(/,/g, '');
          seguidoresNum = parseInt(rawNum, 10);
          if (bio.includes('mil') || bio.includes('k')) seguidoresNum *= 1000;
        }

        const lead = {
          id: `instagram:${username.toLowerCase()}`,
          google_id: `instagram:${username.toLowerCase()}`,
          nome,
          canal_origem: 'instagram',
          nicho,
          praca,
          termo_busca: qExa,
          categoria: `Perfil Comercial Instagram (${nicho})`,
          endereco: praca,
          cidade: praca.split(/[-–,]/)[0]?.trim() || praca,
          uf: praca.length === 2 ? praca : null,
          site: null,
          instagram: `https://www.instagram.com/${username}/`,
          telefone_google: contatos.telefone,
          whatsapp: contatos.whatsapp,
          emails: contatos.email ? [contatos.email] : [],
          seguidores: seguidoresNum,
          justificativa_instagram: `${seguidoresNum ? `${seguidoresNum} seguidores. ` : ''}Bio: "${bio.slice(0, 160)}"`,
          dados_adicionais: {
            username,
            bio,
            seguidores: seguidoresNum,
            motor: 'exa-ai-superpool',
          },
        };

        leads.push(lead);
      }
    } catch (errExa) {
      console.warn(`   ⚠️ Erro na complementação Exa AI (Instagram):`, errExa.message);
    }
  }

  // Se usarAtorDireto for solicitado e ainda tivermos vagas, podemos enriquecer pelo apify~instagram-scraper
  if (usarAtorDireto && leads.length > 0) {
    try {
      console.log(`   📸 [Instagram] Enriquecendo perfis via apify~instagram-scraper...`);
      const usernames = leads.slice(0, 5).map(l => l.dados_adicionais.username);
      const res = await superpool.runApifyActor('apify~instagram-scraper', {
        usernames,
        resultsLimit: 5,
      }, 60);

      const perfis = res?.data || [];
      for (const p of perfis) {
        const lead = leads.find(l => l.dados_adicionais.username.toLowerCase() === (p.username || '').toLowerCase());
        if (lead) {
          if (p.fullName) lead.nome = p.fullName;
          if (p.biography) lead.dados_adicionais.bio = p.biography;
          if (p.followersCount) lead.seguidores = p.followersCount;
          if (p.externalUrl) lead.site = p.externalUrl;
          if (p.businessCategoryName) lead.categoria = p.businessCategoryName;
          const novosContatos = extrairContatosBio(p.biography || '');
          if (!lead.whatsapp && novosContatos.whatsapp) lead.whatsapp = novosContatos.whatsapp;
          if (!lead.emails.length && novosContatos.email) lead.emails = [novosContatos.email];
        }
      }
    } catch (actorErr) {
      console.warn(`   ⚠️ Ator direto do Instagram pausado/fallback: ${actorErr.message}`);
    }
  }

  console.log(`   ✓ [Instagram] Encontrados ${leads.length} leads qualificados.`);
  return leads;
}
