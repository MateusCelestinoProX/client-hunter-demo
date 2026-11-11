import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { Pool, types } from 'pg';
import { createRequire } from 'node:module';

// A senha do banco é a mesma do prospectar.mjs e mora num lugar só: o .env.local da pasta de cima.
// Um SUPABASE_DB_URL no ambiente (ou num .env.local dentro de painel/) ganha dele.
function urlDoBanco() {
  if (process.env.SUPABASE_DB_URL) return process.env.SUPABASE_DB_URL;
  const arquivo = path.join(process.cwd(), '..', '.env.local');
  if (!fs.existsSync(arquivo)) return undefined;
  const linha = fs.readFileSync(arquivo, 'utf8').split(/\r?\n/).find((l) => /^\s*SUPABASE_DB_URL\s*=/.test(l));
  return linha?.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '') || undefined;
}

let localSqliteDb: any = null;
function getSqliteDb() {
  if (localSqliteDb) return localSqliteDb;
  const dbPath = path.join(process.cwd(), '..', 'saidas', 'leads_local.db');
  if (fs.existsSync(dbPath)) {
    try {
      const proc = process as unknown as { getBuiltinModule?: (m: string) => { DatabaseSync: new (p: string) => any } };
      const mod = proc.getBuiltinModule ? proc.getBuiltinModule('node:sqlite') : null;
      if (mod?.DatabaseSync) {
        localSqliteDb = new mod.DatabaseSync(dbPath);
        return localSqliteDb;
      }
      return null;
    } catch (e) {
      console.warn(`[!] Não foi possível inicializar SQLite nativo: ${e}`);
      return null;
    }
  }
  return null;
}

function formatarLeadSqlite(row: Record<string, unknown>) {
  const plain: Record<string, unknown> = JSON.parse(JSON.stringify(row));
  const jsonCampos = [
    'emails', 'telefones_site', 'marketing', 'sinais', 'receita', 'instagram_perfil',
    'anuncios', 'pesquisa', 'canal_detalhes', 'bi_dossier', 'tech_stack', 'decisores', 'reviews_bi'
  ];
  for (const c of jsonCampos) {
    if (typeof plain[c] === 'string') {
      try {
        plain[c] = JSON.parse(plain[c] as string);
      } catch {
        plain[c] = null;
      }
    }
  }
  return plain;
}

// O driver devolve timestamp como objeto Date. Padronizamos tudo em ISO string na saida do banco:
const paraIso = (v: string | null) => (v === null ? null : new Date(v).toISOString());
types.setTypeParser(types.builtins.TIMESTAMPTZ, paraIso);
types.setTypeParser(types.builtins.TIMESTAMP, paraIso);

declare global {
  // eslint-disable-next-line no-var
  var __painelPool: Pool | undefined;
}

export const pool =
  global.__painelPool ??
  new Pool({
    connectionString: urlDoBanco(),
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000,
  });

if (process.env.NODE_ENV !== 'production') global.__painelPool = pool;

export async function query<T = Record<string, unknown>>(text: string, params: unknown[] = []) {
  if (!urlDoBanco()) {
    const sdb = getSqliteDb();
    if (!sdb) return [] as T[];

    try {
      if (text.includes('group by nicho')) {
        const rows = sdb.prepare(`
          SELECT nicho, CAST(COUNT(*) AS TEXT) as total
          FROM leads
          GROUP BY nicho
          ORDER BY MAX(created_at) DESC
        `).all() as unknown[];
        return rows.map((r) => JSON.parse(JSON.stringify(r))) as T[];
      }

      if (text.includes('where p.id = $1') || text.includes('where p.id = ?') || text.includes('where id = $1') || text.includes('where id = ?')) {
        const id = params[0];
        const row = sdb.prepare('SELECT * FROM leads WHERE id = ? OR google_id = ?').get(id, id) as Record<string, unknown> | undefined;
        if (!row) return [] as T[];
        return [formatarLeadSqlite(row)] as T[];
      }

      if (text.includes('jsonb_object_keys(sinais)') || text.includes('as sinal')) {
        const nicho = params[0];
        const rows = sdb.prepare('SELECT sinais FROM leads WHERE nicho = ? AND sinais IS NOT NULL LIMIT 50').all(nicho) as { sinais: string }[];
        const pesosMap = new Map<string, number>();
        for (const r of rows) {
          try {
            const parsed = typeof r.sinais === 'string' ? JSON.parse(r.sinais) : r.sinais;
            for (const [k, v] of Object.entries(parsed || {})) {
              if (k !== '_total' && typeof v === 'object' && v !== null) {
                const pts = Number((v as { pontos?: number }).pontos) || 0;
                pesosMap.set(k, Math.max(pesosMap.get(k) || 0, pts || 10));
              }
            }
          } catch {}
        }
        if (pesosMap.size === 0) {
          // Defaults robustos
          pesosMap.set('site_vivo', 25);
          pesosMap.set('reputacao', 20);
          pesosMap.set('whatsapp', 15);
          pesosMap.set('instagram', 15);
          pesosMap.set('telefone', 15);
          pesosMap.set('cnpj', 10);
        }
        const listaPesos = Array.from(pesosMap.entries()).map(([sinal, peso]) => ({ sinal, peso }));
        listaPesos.sort((a, b) => b.peso - a.peso);
        return listaPesos as unknown as T[];
      }

      if (text.includes('group by cidade, uf')) {
        const nicho = params[0];
        let sqlCidades = 'SELECT cidade, uf, count(*) as total FROM leads WHERE cidade IS NOT NULL AND uf IS NOT NULL';
        const paramsCid: unknown[] = [];
        if (nicho) {
          sqlCidades += ' AND nicho = ?';
          paramsCid.push(nicho);
        }
        sqlCidades += ' GROUP BY cidade, uf ORDER BY total DESC';
        const rows = sdb.prepare(sqlCidades).all(...paramsCid) as unknown[];
        return rows.map((r) => JSON.parse(JSON.stringify(r))) as T[];
      }

      // Query geral com filtros de leads
      let sql = 'SELECT * FROM leads WHERE 1=1';
      const sqliteParams: unknown[] = [];
      const [nicho, classe, site, oportunidade, busca, lista, canal] = params;

      if (nicho) { sql += ' AND nicho = ?'; sqliteParams.push(nicho); }
      if (classe) { sql += ' AND classificacao = ?'; sqliteParams.push(classe); }
      if (site) { sql += ' AND situacao_site = ?'; sqliteParams.push(site); }
      if (oportunidade) { sql += ' AND oportunidade = ?'; sqliteParams.push(oportunidade); }
      if (busca) {
        sql += ' AND (nome LIKE ? OR cidade LIKE ? OR decisor LIKE ? OR celular LIKE ?)';
        sqliteParams.push(`%${busca}%`, `%${busca}%`, `%${busca}%`, `%${busca}%`);
      }
      if (lista !== 'todos') {
        sql += ' AND (aderente_nicho IS NOT 0 AND requisitos_ok IS NOT 0)';
      }
      if (canal) {
        sql += ' AND (canal_origem = ? OR id LIKE ?)';
        sqliteParams.push(canal, `${canal}:%`);
      }
      sql += ' ORDER BY score DESC, total_avaliacoes DESC LIMIT 500';

      const rows = sdb.prepare(sql).all(...sqliteParams) as Record<string, unknown>[];
      return rows.map(formatarLeadSqlite) as T[];
    } catch (err: unknown) {
      console.warn(`[!] Aviso de consulta SQLite local: ${err instanceof Error ? err.message : String(err)}`);
      return [] as T[];
    }
  }

  try {
    const res = await pool.query(text, params);
    return res.rows as T[];
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[!] Aviso de banco no painel: ${msg}`);
    return [] as T[];
  }
}

export async function one<T = Record<string, unknown>>(text: string, params: unknown[] = []) {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
