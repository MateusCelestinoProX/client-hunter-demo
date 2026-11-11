import crypto from 'node:crypto';
import { getLocalDb } from '../local_db.mjs';
import { superpool } from '../superpool.mjs';
import { obterCampanha, atualizarMetricasCampanha } from './campanhas.mjs';
import { renderizarMensagem } from './templates.mjs';

function prepararHtmlComTracking(html, tokenTracking, tokenOptout, urlBase = 'http://localhost:3333') {
  if (!html) return '';
  const unsubscribeUrl = `${urlBase}/api/unsubscribe/${tokenOptout}`;
  const trackingPixel = `<img src="${urlBase}/api/track/open/${tokenTracking}" width="1" height="1" style="display:none !important;" alt="" />`;

  // 1. Substituir link de unsubscribe
  let processado = html.replace(/\{\{\s*unsubscribe_url\s*\}\}/g, unsubscribeUrl);

  // 2. Reescrever links normais para rastreamento de cliques
  processado = processado.replace(/<a\s+(?:[^>]*?\s+)?href=["']([^"']*)["']([^>]*)>/gi, (match, href, rest) => {
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.includes('/api/unsubscribe/') || href.includes('{{unsubscribe_url}}')) {
      return match;
    }
    const trackedUrl = `${urlBase}/api/track/click/${tokenTracking}?url=${encodeURIComponent(href)}`;
    return `<a href="${trackedUrl}"${rest}>`;
  });

  // 3. Injetar pixel de abertura antes do </body> ou no fim
  if (processado.includes('</body>')) {
    processado = processado.replace('</body>', `${trackingPixel}</body>`);
  } else {
    processado += `\n${trackingPixel}`;
  }

  return { htmlProcessado: processado, unsubscribeUrl };
}

/**
 * Dispara uma campanha de e-mail marketing com rotação no SuperPool Resend.
 */
export async function dispararCampanha(campanhaId, { testeEmail = null, urlBase = 'http://localhost:3333', delayMs = 150 } = {}) {
  const db = getLocalDb();
  const camp = obterCampanha(campanhaId);
  if (!camp) {
    throw new Error(`Campanha ${campanhaId} não encontrada`);
  }

  console.log(`\n🚀 [SendPortal] Iniciando disparo da campanha: "${camp.nome}"`);
  console.log(`   Assunto: "${camp.assunto}" · Remetente: ${camp.remetente_nome} <${camp.remetente_email}>`);

  // Modo Teste de Envio Rápido
  if (testeEmail) {
    console.log(`   🧪 Modo Teste: Enviando amostra para ${testeEmail}...`);
    const mockToken = crypto.randomBytes(16).toString('hex');
    const mockOptout = crypto.randomBytes(16).toString('hex');
    const variaveis = {
      first_name: 'Usuário Teste',
      last_name: 'LeadPulse',
      company: 'Empresa Exemplo Solar',
      cargo: 'Diretor Comercial',
      nicho: 'Energia Solar',
      cidade: 'Curitiba',
    };

    let html = renderizarMensagem(camp.conteudo_html, variaveis);
    let texto = renderizarMensagem(camp.conteudo_texto || '', variaveis);
    const assunto = renderizarMensagem(camp.assunto, variaveis);

    const { htmlProcessado, unsubscribeUrl } = prepararHtmlComTracking(html, mockToken, mockOptout, urlBase);
    texto = texto.replace(/\{\{\s*unsubscribe_url\s*\}\}/g, unsubscribeUrl);

    try {
      const res = await superpool.resendEmail({
        to: testeEmail,
        subject: `[TESTE] ${assunto}`,
        html: htmlProcessado,
        text: texto,
        from: camp.remetente_email,
      });

      console.log(`   ✓ [SendPortal] E-mail de teste enviado com sucesso para ${testeEmail}!`);
      return { sucesso: true, teste: true, destinatario: testeEmail, resposta: res };
    } catch (err) {
      console.error(`   ✗ [SendPortal] Erro no envio de teste:`, err.message);
      throw err;
    }
  }

  // Modo Envio em Massa / Produção
  // 1. Buscar inscritos ativos que possuem a tag da campanha (ou todos os ativos se tag_alvo for null)
  let sqlInscritos = `
    SELECT DISTINCT i.*
    FROM sp_inscritos i
  `;
  const paramsInscritos = [];

  if (camp.tag_alvo) {
    sqlInscritos += `
      JOIN sp_inscritos_tags it ON i.id = it.inscrito_id
      JOIN sp_tags t ON it.tag_id = t.id
      WHERE i.status = 'ativo' AND (t.id = ? OR t.nome = ?)
    `;
    paramsInscritos.push(camp.tag_alvo, camp.tag_alvo);
  } else {
    sqlInscritos += ` WHERE i.status = 'ativo'`;
  }

  const destinatarios = db.prepare(sqlInscritos).all(...paramsInscritos);
  console.log(`   👥 Total de inscritos qualificados encontrados: ${destinatarios.length}`);

  if (destinatarios.length === 0) {
    console.warn(`   ⚠️ Nenhum inscrito ativo encontrado para os critérios da campanha.`);
    return { sucesso: false, motivo: 'nenhum_destinatario', total: 0 };
  }

  // 2. Mudar status para 'enviando'
  db.prepare("UPDATE sp_campanhas SET status = 'enviando', total_destinatarios = ?, updated_at = datetime('now') WHERE id = ?")
    .run(destinatarios.length, camp.id);

  let enviados = 0;
  let falhas = 0;

  for (const inscrito of destinatarios) {
    const tokenTracking = crypto.randomBytes(16).toString('hex');
    const msgId = `msg_${crypto.randomUUID().replace(/-/g, '').slice(0, 14)}`;

    // Registrar mensagem pendente
    db.prepare(`
      INSERT OR REPLACE INTO sp_mensagens (id, campanha_id, inscrito_id, email, status, token_tracking)
      VALUES (?, ?, ?, ?, 'pendente', ?)
    `).run(msgId, camp.id, inscrito.id, inscrito.email, tokenTracking);

    const variaveis = {
      first_name: inscrito.primeiro_nome || 'Prezado(a)',
      last_name: inscrito.sobrenome || '',
      company: inscrito.empresa || 'sua empresa',
      cargo: inscrito.cargo || 'Gestor',
      nicho: 'seu setor',
      cidade: 'sua região',
    };

    let html = renderizarMensagem(camp.conteudo_html, variaveis);
    let texto = renderizarMensagem(camp.conteudo_texto || '', variaveis);
    const assunto = renderizarMensagem(camp.assunto, variaveis);

    const { htmlProcessado, unsubscribeUrl } = prepararHtmlComTracking(html, tokenTracking, inscrito.token_optout, urlBase);
    texto = texto.replace(/\{\{\s*unsubscribe_url\s*\}\}/g, unsubscribeUrl);

    try {
      const res = await superpool.resendEmail({
        to: inscrito.email,
        subject: assunto,
        html: htmlProcessado,
        text: texto,
        from: camp.remetente_email,
      });

      const espId = res?.id || (typeof res === 'object' ? JSON.stringify(res) : null);
      db.prepare(`
        UPDATE sp_mensagens
        SET status = 'enviado', esp_message_id = ?, enviado_em = datetime('now')
        WHERE id = ?
      `).run(espId, msgId);

      enviados++;
      console.log(`   ✓ [${enviados}/${destinatarios.length}] Enviado com sucesso para ${inscrito.email}`);
    } catch (err) {
      falhas++;
      db.prepare(`
        UPDATE sp_mensagens
        SET status = 'falhou', erro = ?
        WHERE id = ?
      `).run(err.message, msgId);
      console.warn(`   ✗ [${falhas}] Falha ao enviar para ${inscrito.email}: ${err.message}`);
    }

    if (delayMs > 0) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  // 3. Atualizar campanha para 'concluida'
  db.prepare(`
    UPDATE sp_campanhas
    SET status = 'concluida', enviado_em = datetime('now'), updated_at = datetime('now')
    WHERE id = ?
  `).run(camp.id);

  atualizarMetricasCampanha(camp.id);
  console.log(`\n🎉 [SendPortal] Disparo concluído! ${enviados} enviados com sucesso · ${falhas} falhas.`);

  return {
    sucesso: true,
    campanhaId: camp.id,
    totalDestinatarios: destinatarios.length,
    totalEnviados: enviados,
    totalFalhas: falhas,
  };
}
