/**
 * Orquestrador Unificado de Coleta Multi-Canal (LeadPulse Pro).
 * Suporta canais:
 * - maps: Google Maps (via Botasaurus R$ 0 / SuperPool Apify / Google API)
 * - linkedin: Empresas B2B e Tomadores de Decisão (via SuperPool Apify)
 * - instagram: Perfis Comerciais e WhatsApps (via SuperPool Apify)
 * - web: Portais corporativos e buscas semânticas (Apify SERP + Exa AI + Firecrawl)
 */

import { buscar as buscarMaps, normalizarLugar } from './places.mjs';
import { buscarLinkedIn } from '../motores/linkedin/linkedin_scraper.mjs';
import { buscarInstagram } from '../motores/instagram/instagram_lead_scraper.mjs';
import { buscarWeb } from '../motores/web/web_scraper.mjs';
import { inserirLead } from './db.mjs';

export const CANAIS_DISPONIVEIS = ['maps', 'linkedin', 'instagram', 'web'];

export async function coletarLeads({
  canal = 'maps',
  nicho,
  praca,
  termos = [],
  limite = 10,
  motorMaps = 'superpool',
  paginas = 1,
  tipoLinkedIn = 'empresas',
}) {
  const canalNormalizado = (canal || 'maps').toLowerCase();
  if (!CANAIS_DISPONIVEIS.includes(canalNormalizado)) {
    throw new Error(`Canal de coleta inválido: "${canal}". Disponíveis: ${CANAIS_DISPONIVEIS.join(', ')}`);
  }

  console.log(`\n🚀 [Coleta Multi-Canal] Iniciando captação via canal: ${canalNormalizado.toUpperCase()}`);
  console.log(`   Nicho: ${nicho} · Praça: ${praca} · Meta: ${limite} leads\n`);

  let leadsBrutos = [];

  switch (canalNormalizado) {
    case 'linkedin': {
      leadsBrutos = await buscarLinkedIn({
        nicho,
        praca,
        limite,
        tipo: tipoLinkedIn,
      });
      break;
    }

    case 'instagram': {
      leadsBrutos = await buscarInstagram({
        nicho,
        praca,
        limite,
      });
      break;
    }

    case 'web': {
      leadsBrutos = await buscarWeb({
        nicho,
        praca,
        limite,
      });
      break;
    }

    case 'maps':
    default: {
      const vistos = new Set();
      const listaTermos = termos.length > 0 ? termos : [nicho];

      for (const termo of listaTermos) {
        if (leadsBrutos.length >= limite) break;
        const consulta = `${termo} ${praca}`;
        try {
          const lugares = await buscarMaps(consulta, {
            maxPaginas: paginas,
            maximo: limite - leadsBrutos.length + 5,
            motor: motorMaps,
          });

          for (const lugar of lugares) {
            if (leadsBrutos.length >= limite) break;
            if (vistos.has(lugar.id)) continue;
            vistos.add(lugar.id);
            const lead = normalizarLugar(lugar, { nicho, praca, termo_busca: termo });
            if (!lead._encerrado) {
              lead.canal_origem = 'maps';
              leadsBrutos.push(lead);
            }
          }
        } catch (err) {
          console.warn(`   ✗ Erro no Maps para "${termo}": ${err.message}`);
        }
      }
      break;
    }
  }

  // Gravação idempotente no banco (Postgres ou SQLite local)
  let novos = 0;
  let repetidos = 0;

  for (const lead of leadsBrutos) {
    try {
      const { novo } = await inserirLead(lead);
      if (novo) novos++;
      else repetidos++;
    } catch (err) {
      console.warn(`   ⚠️ Erro ao persistir lead "${lead.nome}":`, err.message);
    }
  }

  console.log(`\n📥 [Resultado da Coleta] ${novos} leads novos gravados · ${repetidos} atualizados/já existentes`);
  return {
    canal: canalNormalizado,
    total: leadsBrutos.length,
    novos,
    repetidos,
    leads: leadsBrutos,
  };
}
