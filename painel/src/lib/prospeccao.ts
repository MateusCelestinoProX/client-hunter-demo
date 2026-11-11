import 'server-only';
import { query, one } from './db';
export * from './prospeccao-types';
import type { LeadProspeccao, FiltroProspeccao } from './prospeccao-types';
import { MOCK_LEADS } from './mock-data';

/**
 * Módulo de Prospecção & Qualificação de Leads
 * Suporta consulta nativa a PostgreSQL/Supabase com fallback gracioso para Mock Dataset Enterprise
 */

const COLUNAS = 'p.*';

function filtrarMockLeads(f: FiltroProspeccao = {}): LeadProspeccao[] {
  return MOCK_LEADS.filter((lead) => {
    if (f.nicho && lead.nicho !== f.nicho) return false;
    if (f.classe && lead.classificacao !== f.classe) return false;
    if (f.site && lead.situacao_site !== f.site) return false;
    if (f.oportunidade && lead.oportunidade !== f.oportunidade) return false;
    if (f.canal && lead.canal_origem !== f.canal) return false;
    if (f.lista !== 'todos') {
      if (lead.aderente_nicho === false || lead.requisitos_ok === false) return false;
    }
    if (f.busca && f.busca.trim()) {
      const q = f.busca.toLowerCase().trim();
      const match =
        (lead.nome && lead.nome.toLowerCase().includes(q)) ||
        (lead.nome_empresa && lead.nome_empresa.toLowerCase().includes(q)) ||
        (lead.cidade && lead.cidade.toLowerCase().includes(q)) ||
        (lead.decisor && lead.decisor.toLowerCase().includes(q)) ||
        (lead.celular && lead.celular.includes(q)) ||
        (lead.cnpj && lead.cnpj.includes(q)) ||
        (lead.razao_social && lead.razao_social.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  }).sort((a, b) => b.score - a.score);
}

export const listarProspeccao = async (f: FiltroProspeccao = {}): Promise<LeadProspeccao[]> => {
  try {
    const dbLeads = await query<LeadProspeccao>(
      `select ${COLUNAS}
         from prospeccao.leads p
        where ($1::text is null or p.nicho = $1)
          and ($2::text is null or p.classificacao = $2)
          and ($3::text is null or p.situacao_site = $3)
          and ($4::text is null or p.oportunidade = $4)
          and ($5::text is null or p.nome ilike '%'||$5||'%' or p.nome_empresa ilike '%'||$5||'%'
               or p.cidade ilike '%'||$5||'%' or p.decisor ilike '%'||$5||'%' or p.celular ilike '%'||$5||'%')
          and ($6::text = 'todos' or (p.aderente_nicho is not false and p.requisitos_ok is not false))
          and ($7::text is null or p.canal_origem = $7)
        order by p.score desc, p.created_at desc
        limit 500`,
      [f.nicho ?? null, f.classe ?? null, f.site ?? null, f.oportunidade ?? null, f.busca ?? null, f.lista ?? null, f.canal ?? null],
    );
    if (dbLeads && dbLeads.length > 0) return dbLeads;
  } catch (err) {
    // Silently fall through to mock data in demo environment
  }

  return filtrarMockLeads(f);
};

export const buscarLead = async (id: string): Promise<LeadProspeccao | null> => {
  try {
    const lead = await one<LeadProspeccao>(`select * from prospeccao.leads where id = $1`, [id]);
    if (lead) return lead;
  } catch {}

  return MOCK_LEADS.find((l) => l.id === id || l.id.toLowerCase() === id.toLowerCase()) || null;
};

export const nichosProspeccao = async (): Promise<{ nicho: string; total: number }[]> => {
  try {
    const rows = await query<{ nicho: string; total: number }>(
      `select nicho, count(*)::int as total
         from prospeccao.leads
        group by nicho
        order by 2 desc`,
    );
    if (rows && rows.length > 0) return rows;
  } catch {}

  const counts: Record<string, number> = {};
  for (const l of MOCK_LEADS) {
    counts[l.nicho] = (counts[l.nicho] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([nicho, total]) => ({ nicho, total }))
    .sort((a, b) => b.total - a.total);
};

export const cidadesProspeccao = async (nicho?: string): Promise<{ cidade: string; uf: string; total: number }[]> => {
  try {
    const rows = await query<{ cidade: string; uf: string; total: number }>(
      `select cidade, uf, count(*)::int as total
         from prospeccao.leads
        where cidade is not null and uf is not null
          and ($1::text is null or nicho = $1)
        group by cidade, uf
        order by 3 desc`,
      [nicho ?? null],
    );
    if (rows && rows.length > 0) return rows;
  } catch {}

  const counts: Record<string, { cidade: string; uf: string; total: number }> = {};
  for (const l of MOCK_LEADS) {
    if (nicho && l.nicho !== nicho) continue;
    if (!l.cidade || !l.uf) continue;
    const chave = `${l.cidade}_${l.uf}`;
    if (!counts[chave]) {
      counts[chave] = { cidade: l.cidade, uf: l.uf, total: 0 };
    }
    counts[chave].total++;
  }
  return Object.values(counts).sort((a, b) => b.total - a.total);
};

export const pesosNicho = async (nicho: string): Promise<{ sinal: string; peso: number }[]> => {
  try {
    const rows = await query<{ sinal: string; peso: number }>(
      `select k as sinal, max((sinais->k->>'pontos')::int) as peso
         from prospeccao.leads, jsonb_object_keys(sinais) k
        where nicho = $1 and k <> '_total'
        group by k
        order by 2 desc`,
      [nicho],
    );
    if (rows && rows.length > 0) return rows;
  } catch {}

  return [
    { sinal: 'site_ativo', peso: 25 },
    { sinal: 'whatsapp_presente', peso: 20 },
    { sinal: 'instagram_ativo', peso: 20 },
    { sinal: 'anuncios_ativos', peso: 15 },
    { sinal: 'cnpj_regular', peso: 15 },
  ];
};

/** Os números do topo da aba, sempre sobre a lista que está na tela (mesmos filtros). */
export function resumir(leads: LeadProspeccao[]) {
  return {
    total: leads.length,
    classeA: leads.filter((l) => l.classificacao === 'A').length,
    comCelular: leads.filter((l) => l.celular || l.whatsapp).length,
    comInstagram: leads.filter((l) => l.instagram).length,
  };
}
