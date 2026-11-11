import { NextResponse } from 'next/server';
import { listarCampanhasPainel } from '@/lib/sendportal';
import path from 'node:path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const campanhas = listarCampanhasPainel();
  return NextResponse.json(campanhas);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, assunto, template_id, tag_alvo, remetente_nome, remetente_email, conteudo_html, conteudo_texto } = body;

    try {
      const corePath = path.join(process.cwd(), '..', 'lib', 'sendportal', 'index.mjs');
      const { criarCampanha } = await import(/* webpackIgnore: true */ corePath);

      const campanha = criarCampanha({
        nome,
        assunto,
        template_id,
        tag_alvo,
        remetente_nome,
        remetente_email,
        conteudo_html,
        conteudo_texto,
      });

      return NextResponse.json(campanha);
    } catch {
      const novaCampanha = {
        id: `cmp_demo_${Date.now()}`,
        nome: nome || 'Nova Campanha Demo',
        assunto: assunto || 'Contato Estratégico',
        remetente_nome: remetente_nome || 'Mateus Celestino',
        remetente_email: remetente_email || 'contato@clienthunter-demo.io',
        template_id: template_id || null,
        conteudo_html: conteudo_html || '<p>Olá</p>',
        conteudo_texto: conteudo_texto || null,
        tag_alvo: tag_alvo || 'geral',
        status: 'rascunho',
        agendado_para: null,
        enviado_em: null,
        total_destinatarios: 150,
        total_enviados: 0,
        total_aberturas: 0,
        total_cliques: 0,
        total_bounces: 0,
        total_unsubscribes: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return NextResponse.json(novaCampanha);
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
