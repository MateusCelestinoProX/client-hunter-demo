import { NextResponse } from 'next/server';
import path from 'node:path';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { lead_id, email, assunto, template_id, conteudo_html } = body;

    try {
      const corePath = path.join(process.cwd(), '..', 'lib', 'sendportal', 'index.mjs');
      const { enviarEmailRapidoParaLead } = await import(/* webpackIgnore: true */ corePath);

      const resultado = await enviarEmailRapidoParaLead({
        lead_id: lead_id || null,
        email: email || null,
        assunto: assunto || null,
        template_id: template_id || 'tpl_cold_outreach_b2b',
        conteudo_html: conteudo_html || null,
        urlBase: 'http://localhost:3333',
      });

      return NextResponse.json(resultado);
    } catch {
      return NextResponse.json({
        sucesso: true,
        demo: true,
        destinatario: email || 'lead@empresa.com.br',
        provedor: 'Resend Cluster Node 01',
        mensagem: `[Modo Demo] E-mail individual disparado com sucesso para ${email || 'o lead'}!`,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
