import crypto from 'node:crypto';
import { getLocalDb } from '../local_db.mjs';
import { obterTemplate } from './templates.mjs';

export function listarCampanhas() {
  const db = getLocalDb();
  return db.prepare(`
    SELECT c.*, t.nome as template_nome
    FROM sp_campanhas c
    LEFT JOIN sp_templates t ON c.template_id = t.id
    ORDER BY c.created_at DESC
  `).all();
}

export function obterCampanha(id) {
  const db = getLocalDb();
  const camp = db.prepare(`
    SELECT c.*, t.nome as template_nome
    FROM sp_campanhas c
    LEFT JOIN sp_templates t ON c.template_id = t.id
    WHERE c.id = ?
  `).get(id);

  if (!camp) return null;

  // Carregar mensagens e estatísticas atualizadas
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'enviado' OR status = 'aberto' OR status = 'clicado' THEN 1 ELSE 0 END) as enviados,
      SUM(CASE WHEN status = 'aberto' OR status = 'clicado' THEN 1 ELSE 0 END) as abertos,
      SUM(CASE WHEN status = 'clicado' THEN 1 ELSE 0 END) as clicados,
      SUM(CASE WHEN status = 'falhou' THEN 1 ELSE 0 END) as falhas,
      SUM(CASE WHEN status = 'desinscrito' THEN 1 ELSE 0 END) as unsubscribes
    FROM sp_mensagens
    WHERE campanha_id = ?
  `).get(id);

  return {
    ...camp,
    metricas: {
      total_destinatarios: stats?.total || camp.total_destinatarios,
      total_enviados: stats?.enviados || camp.total_enviados,
      total_aberturas: stats?.abertos || camp.total_aberturas,
      total_cliques: stats?.clicados || camp.total_cliques,
      total_falhas: stats?.falhas || 0,
      total_unsubscribes: stats?.unsubscribes || camp.total_unsubscribes,
      taxa_abertura: stats?.enviados > 0 ? ((stats.abertos / stats.enviados) * 100).toFixed(1) : '0.0',
      taxa_clique: stats?.enviados > 0 ? ((stats.clicados / stats.enviados) * 100).toFixed(1) : '0.0',
    },
  };
}

export function criarCampanha({
  nome,
  assunto,
  remetente_nome = 'Client Hunter Outreach',
  remetente_email = 'prospeccao@resend.dev',
  template_id = null,
  conteudo_html = null,
  conteudo_texto = null,
  tag_alvo = null,
  leads_ids = null,
}) {
  if (!nome || !assunto) {
    throw new Error('Nome e Assunto da campanha são obrigatórios');
  }

  let finalHtml = conteudo_html;
  let finalTexto = conteudo_texto;

  if (template_id) {
    const tpl = obterTemplate(template_id);
    if (tpl) {
      if (!finalHtml) finalHtml = tpl.conteudo_html;
      if (!finalTexto) finalTexto = tpl.conteudo_texto;
      if (!assunto && tpl.assunto_padrao) assunto = tpl.assunto_padrao;
    }
  }

  if (!finalHtml) {
    throw new Error('Conteúdo HTML ou Template é obrigatório');
  }

  const db = getLocalDb();
  const id = `camp_${crypto.randomUUID().replace(/-/g, '').slice(0, 14)}`;
  let finalTagAlvo = tag_alvo;

  // Se foram passados IDs específicos de leads, criar segmento dedicado
  if (Array.isArray(leads_ids) && leads_ids.length > 0) {
    finalTagAlvo = `segmento:${id.slice(-6)}`;
    const tagObj = db.prepare('INSERT OR IGNORE INTO sp_tags (id, nome, cor) VALUES (?, ?, ?)')
      .run(finalTagAlvo, `Campanha: ${nome.slice(0, 20)}`, '#8b5cf6');

    // Buscar esses leads e garantir que estão como inscritos com essa tag
    for (const leadId of leads_ids) {
      const l = db.prepare('SELECT * FROM leads WHERE id = ?').get(leadId);
      if (l && l.emails) {
        let emailsList = [];
        try {
          emailsList = JSON.parse(l.emails);
        } catch {
          if (typeof l.emails === 'string') emailsList = l.emails.split(/[,;\s]+/);
        }
        for (const em of (Array.isArray(emailsList) ? emailsList : [emailsList])) {
          if (!em || !em.includes('@')) continue;
          const subId = `sub_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
          const tok = crypto.randomBytes(16).toString('hex');
          
          db.prepare(`
            INSERT OR IGNORE INTO sp_inscritos (id, lead_id, email, primeiro_nome, empresa, cargo, status, token_optout)
            VALUES (?, ?, ?, ?, ?, ?, 'ativo', ?)
          `).run(subId, l.id, em.toLowerCase(), l.nome_pessoa || l.nome?.split(' ')[0] || null, l.nome_empresa || l.nome, l.decisor || null, tok);

          const subReal = db.prepare('SELECT id FROM sp_inscritos WHERE email = ?').get(em.toLowerCase());
          if (subReal) {
            db.prepare('INSERT OR IGNORE INTO sp_inscritos_tags (inscrito_id, tag_id) VALUES (?, ?)').run(subReal.id, finalTagAlvo);
          }
        }
      }
    }
  }

  db.prepare(`
    INSERT INTO sp_campanhas (
      id, nome, assunto, remetente_nome, remetente_email,
      template_id, conteudo_html, conteudo_texto, tag_alvo, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'rascunho')
  `).run(id, nome, assunto, remetente_nome, remetente_email, template_id, finalHtml, finalTexto, finalTagAlvo || null);

  return obterCampanha(id);
}

export function atualizarMetricasCampanha(id) {
  const db = getLocalDb();
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'enviado' OR status = 'aberto' OR status = 'clicado' THEN 1 ELSE 0 END) as enviados,
      SUM(CASE WHEN status = 'aberto' OR status = 'clicado' THEN 1 ELSE 0 END) as abertos,
      SUM(CASE WHEN status = 'clicado' THEN 1 ELSE 0 END) as clicados,
      SUM(CASE WHEN status = 'falhou' THEN 1 ELSE 0 END) as falhas,
      SUM(CASE WHEN status = 'desinscrito' THEN 1 ELSE 0 END) as unsubscribes
    FROM sp_mensagens
    WHERE campanha_id = ?
  `).get(id);

  if (stats) {
    db.prepare(`
      UPDATE sp_campanhas
      SET total_destinatarios = ?,
          total_enviados = ?,
          total_aberturas = ?,
          total_cliques = ?,
          total_unsubscribes = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(stats.total || 0, stats.enviados || 0, stats.abertos || 0, stats.clicados || 0, stats.unsubscribes || 0, id);
  }
}
