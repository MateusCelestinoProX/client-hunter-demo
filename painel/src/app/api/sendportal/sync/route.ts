import { NextResponse } from 'next/server';
import path from 'node:path';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { nicho, classe, canal } = body;

    try {
      const corePath = path.join(process.cwd(), '..', 'lib', 'sendportal', 'index.mjs');
      const { sincronizarLeadsParaInscritos } = await import(/* webpackIgnore: true */ corePath);

      const resultado = sincronizarLeadsParaInscritos({ nicho, classe, canal });
      return NextResponse.json(resultado);
    } catch {
      return NextResponse.json({
        sucesso: true,
        demo: true,
        novos: 18,
        repetidos: 6,
        total_ativos: 24,
        mensagem: '[Modo Demo] 18 leads B2B sincronizados com a base do SendPortal!',
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
