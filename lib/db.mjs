// Acesso ao schema prospeccao no seu projeto no Supabase, via conexão Postgres direta.
// Se SUPABASE_DB_URL não estiver configurado, utiliza o banco local SQLite (saidas/leads_local.db)
import pg from 'pg';
import { env } from './env.mjs';
import { inserirLeadLocal, listarLeadsLocal, getLocalDb } from './local_db.mjs';

let pool;
function conexao() {
  if (!pool) {
    if (!env.SUPABASE_DB_URL) return null;
    pool = new pg.Pool({
      connectionString: env.SUPABASE_DB_URL,
      ssl: { rejectUnauthorized: false },
      max: 4,
    });
  }
  return pool;
}

function executarSqlite(sql, params = []) {
  const db = getLocalDb();
  let limpo = sql
    .replace(/prospeccao\.leads/g, 'leads')
    .replace(/array_to_string\(([a-zA-Z0-9_]+),\s*['"][^'"]*['"]\)/gi, '$1')
    .replace(/([a-zA-Z0-9_]+)->>'([a-zA-Z0-9_]+)'/gi, "json_extract($1, '$.$2')")
    .replace(/::[a-zA-Z0-9_]+/g, '')
    .replace(/\bnow\(\)/gi, "datetime('now')")
    .replace(/\bIS NOT FALSE\b/gi, 'IS NOT 0')
    .replace(/\bIS NOT TRUE\b/gi, 'IS NOT 1');

  const sqliteParams = [];
  limpo = limpo.replace(/\$(\d+)/g, (_, num) => {
    const idx = parseInt(num, 10) - 1;
    sqliteParams.push(params[idx]);
    return '?';
  });

  const isSelect = /^\s*SELECT/i.test(limpo);
  if (isSelect) {
    const stmt = db.prepare(limpo);
    const rows = stmt.all(...sqliteParams);
    const jsonCampos = ['emails', 'email', 'telefones_site', 'marketing', 'sinais', 'receita', 'instagram_perfil', 'anuncios', 'pesquisa', 'canal_detalhes'];
    for (const row of rows) {
      for (const col of jsonCampos) {
        if (typeof row[col] === 'string') {
          try {
            const parsed = JSON.parse(row[col]);
            if (col === 'email' && Array.isArray(parsed)) {
              row[col] = parsed.join('; ');
            } else {
              row[col] = parsed;
            }
          } catch {}
        }
      }
    }
    return { rows };
  } else {
    const stmt = db.prepare(limpo);
    const info = stmt.run(...sqliteParams);
    return { rows: [], rowCount: info.changes };
  }
}

/**
 * Toda consulta roda numa transação que PEDE escrita quando conectado ao Supabase.
 * Sem SUPABASE_DB_URL, roda localmente no SQLite.
 */
export async function consultar(sql, params = []) {
  if (!env.SUPABASE_DB_URL) {
    return executarSqlite(sql, params);
  }

  const c = conexao();
  if (!c) return { rows: [] };

  const cliente = await c.connect();
  try {
    await cliente.query('BEGIN READ WRITE');
    const resultado = await cliente.query(sql, params);
    await cliente.query('COMMIT');
    return resultado;
  } catch (e) {
    await cliente.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    cliente.release();
  }
}

export const encerrar = async () => {
  if (pool) await pool.end();
  pool = null;
};

/**
 * Grava o lead vindo de qualquer canal (Maps, LinkedIn, Instagram, Web).
 * Se SUPABASE_DB_URL não estiver preenchido, salva no SQLite local de alta performance.
 */
export async function inserirLead(lead) {
  if (!env.SUPABASE_DB_URL) {
    return inserirLeadLocal(lead);
  }

  const { rows } = await consultar(
    `INSERT INTO prospeccao.leads
       (google_id, nicho, praca, termo_busca, nome, categoria, endereco, cidade, uf,
        lat, lng, google_maps_url, avaliacao, total_avaliacoes, telefone_google, site,
        whatsapp, instagram, linkedin, canal_origem, decisor, resumo_site)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
     ON CONFLICT (google_id) DO UPDATE SET
       avaliacao        = COALESCE(EXCLUDED.avaliacao, prospeccao.leads.avaliacao),
       total_avaliacoes = COALESCE(EXCLUDED.total_avaliacoes, prospeccao.leads.total_avaliacoes),
       telefone_google  = COALESCE(EXCLUDED.telefone_google, prospeccao.leads.telefone_google),
       site             = COALESCE(prospeccao.leads.site, EXCLUDED.site),
       whatsapp         = COALESCE(prospeccao.leads.whatsapp, EXCLUDED.whatsapp),
       instagram        = COALESCE(prospeccao.leads.instagram, EXCLUDED.instagram),
       linkedin         = COALESCE(prospeccao.leads.linkedin, EXCLUDED.linkedin),
       canal_origem     = COALESCE(prospeccao.leads.canal_origem, EXCLUDED.canal_origem),
       decisor          = COALESCE(prospeccao.leads.decisor, EXCLUDED.decisor),
       updated_at       = now()
     RETURNING (xmax = 0) AS novo`,
    [lead.google_id, lead.nicho, lead.praca, lead.termo_busca, lead.nome, lead.categoria,
     lead.endereco, lead.cidade, lead.uf, lead.lat, lead.lng, lead.google_maps_url,
     lead.avaliacao, lead.total_avaliacoes, lead.telefone_google, lead.site,
     lead.whatsapp || null, lead.instagram || null, lead.linkedin || null,
     lead.canal_origem || 'maps', lead.decisor || null, lead.resumo_site || null],
  );
  return { novo: rows[0]?.novo ?? true };
}

/** `refazer` devolve à fila quem foi enriquecido antes de existir a leitura de marketing. */
export async function leadsPendentes({ nicho, limite, refazer = false }) {
  if (!env.SUPABASE_DB_URL) {
    return listarLeadsLocal({ nicho, status: refazer ? undefined : 'novo', limite });
  }

  const filtro = nicho ? `AND nicho = $2` : '';
  const estado = refazer ? `(status = 'novo' OR (status = 'enriquecido' AND situacao_site IS NULL))` : `status = 'novo'`;
  const { rows } = await consultar(
    `SELECT * FROM prospeccao.leads
      WHERE ${estado} ${filtro}
      ORDER BY total_avaliacoes DESC NULLS LAST
      LIMIT $1`,
    nicho ? [limite, nicho] : [limite],
  );
  return rows;
}

/**
 * Salva o enriquecimento no Supabase ou no SQLite local.
 */
export async function salvarEnriquecimento(id, d) {
  if (!env.SUPABASE_DB_URL) {
    const db = getLocalDb();
    const stmt = db.prepare(`
      UPDATE leads SET
        site = COALESCE(?, site),
        site_url_final = ?,
        site_status = ?,
        site_vivo = ?,
        site_titulo = ?,
        site_erro = ?,
        emails = ?,
        telefones_site = ?,
        whatsapp = ?,
        instagram = ?,
        facebook = ?,
        linkedin = ?,
        youtube = ?,
        cnpj = ?,
        texto_site = ?,
        score = ?,
        classificacao = ?,
        sinais = ?,
        status = ?,
        situacao_site = ?,
        marketing = ?,
        oportunidade = ?,
        justificativa_nota = ?,
        justificativa_oportunidade = ?,
        enriquecido_em = datetime('now')
      WHERE id = ? OR google_id = ?
    `);

    stmt.run(
      d.site || null,
      d.site_url_final || null,
      d.site_status || null,
      d.site_vivo ? 1 : 0,
      d.site_titulo || null,
      d.site_erro || null,
      JSON.stringify(d.emails || []),
      JSON.stringify(d.telefones_site || []),
      d.whatsapp || null,
      d.instagram || null,
      d.facebook || null,
      d.linkedin || null,
      d.youtube || null,
      d.cnpj || null,
      d.texto_site ?? null,
      d.score || 0,
      d.classificacao || null,
      JSON.stringify(d.sinais || {}),
      d.status || 'enriquecido',
      d.situacao_site || null,
      d.marketing ? JSON.stringify(d.marketing) : null,
      d.oportunidade || null,
      d.justificativa_nota ?? null,
      d.justificativa_oportunidade ?? null,
      String(id),
      String(id)
    );
    return;
  }

  await consultar(
    `UPDATE prospeccao.leads SET
       site = COALESCE($2, site), site_url_final = $3, site_status = $4, site_vivo = $5,
       site_titulo = $6, site_erro = $7, emails = $8, telefones_site = $9, whatsapp = $10,
       instagram = $11, facebook = $12, linkedin = $13, youtube = $14, cnpj = $15,
       texto_site = $16,
       resumo_site    = CASE WHEN $16::text IS DISTINCT FROM texto_site THEN NULL ELSE resumo_site END,
       porte_estimado = CASE WHEN $16::text IS DISTINCT FROM texto_site THEN NULL ELSE porte_estimado END,
       site_lido_em   = CASE WHEN $16::text IS DISTINCT FROM texto_site THEN NULL ELSE site_lido_em END,
       score = $17, classificacao = $18,
       sinais = $19, status = $20, situacao_site = $21, marketing = $22, oportunidade = $23,
       justificativa_nota = $24, justificativa_oportunidade = $25, enriquecido_em = now()
     WHERE id = $1`,
    [id, d.site, d.site_url_final, d.site_status, d.site_vivo, d.site_titulo, d.site_erro,
     d.emails, d.telefones_site, d.whatsapp, d.instagram, d.facebook, d.linkedin,
     d.youtube, d.cnpj, d.texto_site ?? null, d.score, d.classificacao,
     JSON.stringify(d.sinais), d.status, d.situacao_site,
     d.marketing ? JSON.stringify(d.marketing) : null, d.oportunidade,
     d.justificativa_nota ?? null, d.justificativa_oportunidade ?? null],
  );
}
