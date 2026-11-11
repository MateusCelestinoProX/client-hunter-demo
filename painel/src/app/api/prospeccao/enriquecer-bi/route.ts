import { NextResponse } from 'next/server';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { MOCK_LEADS } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { lead_id, lead_ids, nicho, limite = 5, forcar = false } = body;

    try {
      const dynamicImport = new Function('specifier', 'return import(specifier)');
      const biPath = path.resolve(process.cwd(), '..', 'lib', 'bi_enrichment.mjs');
      const biModule = await dynamicImport(pathToFileURL(biPath).href);

      if (lead_id) {
        const res = await biModule.enriquecerLeadComBI(lead_id, { forcar });
        return NextResponse.json({ sucesso: true, lead: res });
      }

      if (Array.isArray(lead_ids) && lead_ids.length > 0) {
        const resultados = [];
        for (const id of lead_ids) {
          try {
            const res = await biModule.enriquecerLeadComBI(id, { forcar });
            resultados.push({ id, sucesso: true, lead: res });
          } catch (err: any) {
            resultados.push({ id, sucesso: false, erro: err.message });
          }
        }
        return NextResponse.json({ sucesso: true, total: resultados.length, resultados });
      }

      const localDbPath = path.resolve(process.cwd(), '..', 'lib', 'local_db.mjs');
      const localDbModule = await dynamicImport(pathToFileURL(localDbPath).href);
      const db = localDbModule.getLocalDb();

      let sql = "SELECT id FROM leads WHERE bi_enriquecido_em IS NULL";
      const params: any[] = [];
      if (nicho) {
        sql += " AND nicho = ?";
        params.push(nicho);
      }
      sql += " ORDER BY score DESC LIMIT ?";
      params.push(limite);

      const rows = db.prepare(sql).all(...params);
      const resultados = [];
      for (const r of rows as any[]) {
        try {
          const res = await biModule.enriquecerLeadComBI(r.id);
          resultados.push({ id: r.id, sucesso: true, lead: res });
        } catch (err: any) {
          resultados.push({ id: r.id, sucesso: false, erro: err.message });
        }
      }

      return NextResponse.json({
        sucesso: true,
        processados: resultados.length,
        resultados,
      });
    } catch {
      // Fallback para o dataset mock enterprise
      const mockLead = MOCK_LEADS.find((l) => l.id === lead_id) || MOCK_LEADS[0];
      return NextResponse.json({
        sucesso: true,
        demo: true,
        lead: {
          ...mockLead,
          bi_enriquecido_em: new Date().toISOString(),
        },
        processados: 1,
        mensagem: '[Modo Demonstração] Dossiê de Business Intelligence enriquecido com sucesso!',
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { sucesso: false, erro: error.message || 'Erro ao processar Business Intelligence.' },
      { status: 500 }
    );
  }
}
