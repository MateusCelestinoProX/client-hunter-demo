import crypto from 'node:crypto';
import { getLocalDb } from '../local_db.mjs';
import { superpool } from '../superpool.mjs';
import { adicionarInscrito } from './inscritos.mjs';
import { obterTemplate, renderizarMensagem } from './templates.mjs';

/**
 * Dispara um e-mail direto / rápido para um lead individual a partir da tabela de leads.
 */
export async function enviarEmailRapidoParaLead({
  lead_id = null,
  email = null,
  assunto = null,
  conteudo_html = null,
  template_id = 'tpl_cold_outreach_b2b',
  urlBase = 'http://localhost:3333',
}) {
  const db = getLocalDb();

  let lead = null;
  if (lead_id) {
    lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(lead_id);
  }

  let emailAlvo = email;
  if (!emailAlvo && lead) {
    let emailsList = [];
    try {
      emailsList = JSON.parse(lead.emails || '[]');
    } catch {
      if (typeof lead.emails === 'string') emailsList = lead.emails.split(/[,;\s]+/);
    }
    emailAlvo = Array.isArray(emailsList) ? emailsList[0] : null;
  }

  if (!emailAlvo || !emailAlvo.includes('@')) {
    throw new Error('E-mail de destino não encontrado para este lead');
  }

  // Garantir que o lead está na base de inscritos
  let primeiroNome = lead?.nome_pessoa || null;
  let cargo = null;
  if (lead?.decisor) {
    const match = lead.decisor.match(/^([^(]+)(?:\(([^)]+)\))?/);
    if (match) {
      primeiroNome = match[1].trim().split(' ')[0];
      cargo = match[2]?.trim();
    }
  }
  if (!primeiroNome && lead?.nome) {
    primeiroNome = lead.nome.split(/[-–|: ]/)[0]?.trim();
  }

  const inscrito = adicionarInscrito({
    email: emailAlvo,
    primeiro_nome: primeiroNome,
    empresa: lead?.nome_empresa || lead?.nome || 'sua empresa',
    cargo,
    lead_id: lead?.id || null,
    tags: lead?.nicho ? [`nicho:${lead.nicho}`] : ['cold-outreach'],
  });

  // Criar ou reusar uma campanha técnica de envio direto
  const campId = 'camp_direto_outbound';
  const campExiste = db.prepare('SELECT id FROM sp_campanhas WHERE id = ?').get(campId);
  if (!campExiste) {
    db.prepare(`
      INSERT INTO sp_campanhas (id, nome, assunto, remetente_nome, remetente_email, conteudo_html, status)
      VALUES (?, 'Envios Diretos / One-to-One', 'Abordagem Comercial', 'Client Hunter', 'prospeccao@resend.dev', '<p>Email direto</p>', 'concluida')
    `).run(campId);
  }

  // Obter template ou conteúdo
  let htmlBase = conteudo_html;
  let assuntoBase = assunto;

  if (!htmlBase && template_id) {
    const tpl = obterTemplate(template_id);
    if (tpl) {
      htmlBase = tpl.conteudo_html;
      if (!assuntoBase && tpl.assunto_padrao) assuntoBase = tpl.assunto_padrao;
    }
  }

  if (!htmlBase) {
    htmlBase = `<div style="font-family: Arial, sans-serif; font-size: 15px; color: #222; line-height: 1.6;">
      <p>Olá, {{first_name}}!</p>
      <p>Espero que este e-mail lhe encontre bem. Notamos o destaque da {{company}} e gostaríamos de apresentar uma proposta de valor direta.</p>
      <p>Podemos conversar 10 minutos?</p>
      <p><a href="{{unsubscribe_url}}" style="color: #888; font-size: 12px;">Descadastrar</a></p>
    </div>`;
  }

  if (!assuntoBase) {
    assuntoBase = 'Oportunidade para a {{company}}';
  }

  const variaveis = {
    first_name: inscrito.primeiro_nome || 'Prezado(a)',
    last_name: inscrito.sobrenome || '',
    company: inscrito.empresa || 'sua empresa',
    cargo: inscrito.cargo || 'Gestor',
    nicho: lead?.nicho || 'seu segmento',
    cidade: lead?.cidade || 'sua região',
  };

  const htmlInterpolado = renderizarMensagem(htmlBase, variaveis);
  const assuntoInterpolado = renderizarMensagem(assuntoBase, variaveis);

  const tokenTracking = crypto.randomBytes(16).toString('hex');
  const msgId = `msg_dir_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  const unsubscribeUrl = `${urlBase}/api/unsubscribe/${inscrito.token_optout}`;
  const trackingPixel = `<img src="${urlBase}/api/track/open/${tokenTracking}" width="1" height="1" style="display:none;" alt="" />`;

  let htmlFinal = htmlInterpolado.replace(/\{\{\s*unsubscribe_url\s*\}\}/g, unsubscribeUrl);
  htmlFinal = htmlFinal.replace(/<a\s+(?:[^>]*?\s+)?href=["']([^"']*)["']([^>]*)>/gi, (m, href, rest) => {
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.includes('/api/unsubscribe/')) return m;
    return `<a href="${urlBase}/api/track/click/${tokenTracking}?url=${encodeURIComponent(href)}"${rest}>`;
  });
  htmlFinal += `\n${trackingPixel}`;

  db.prepare(`
    INSERT INTO sp_mensagens (id, campanha_id, inscrito_id, email, status, token_tracking)
    VALUES (?, ?, ?, ?, 'pendente', ?)
  `).run(msgId, campId, inscrito.id, emailAlvo, tokenTracking);

  console.log(`\n✉️ [SendPortal] Disparando e-mail direto para ${emailAlvo} (${inscrito.empresa || 'Lead'})...`);

  try {
    const res = await superpool.resendEmail({
      to: emailAlvo,
      subject: assuntoInterpolado,
      html: htmlFinal,
      text: renderizarMensagem(assuntoBase, variaveis),
      from: 'prospeccao@resend.dev',
    });

    const espId = res?.id || 'resend_ok';
    db.prepare(`
      UPDATE sp_mensagens
      SET status = 'enviado', esp_message_id = ?, enviado_em = datetime('now')
      WHERE id = ?
    `).run(espId, msgId);

    console.log(`✓ [SendPortal] E-mail direto enviado com sucesso! Message ID: ${msgId}`);

    return {
      sucesso: true,
      mensagem_id: msgId,
      email: emailAlvo,
      empresa: inscrito.empresa,
      assunto: assuntoInterpolado,
      esp_id: espId,
    };
  } catch (err) {
    db.prepare(`
      UPDATE sp_mensagens
      SET status = 'falhou', erro = ?
      WHERE id = ?
    `).run(err.message, msgId);
    console.error(`✗ [SendPortal] Falha no envio direto:`, err.message);
    throw err;
  }
}
