import { NextResponse } from 'next/server';
import { listarProspeccao, resumir, buscarLead } from '@/lib/prospeccao';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    // Se passou ID, busca o lead detalhado
    if (id) {
      const lead = await buscarLead(id);
      if (!lead) {
        return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
      }
      return NextResponse.json({ ok: true, lead });
    }

    const nicho = searchParams.get('nicho') || undefined;
    const classe = searchParams.get('classe') || undefined;
    const canal = searchParams.get('canal') || undefined;
    const site = searchParams.get('site') || undefined;
    const busca = searchParams.get('busca') || undefined;
    const apenasResumo = searchParams.get('resumo') === 'true';

    const leads = await listarProspeccao({
      nicho,
      classe,
      canal,
      site,
      busca,
    });

    const resumo = resumir(leads);

    if (apenasResumo) {
      return NextResponse.json({
        ok: true,
        resumo,
      });
    }

    return NextResponse.json({
      ok: true,
      total: leads.length,
      resumo,
      leads: leads.slice(0, 50), // Devolve até 50 leads formatados
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
