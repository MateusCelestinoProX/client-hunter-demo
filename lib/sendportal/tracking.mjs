import { getLocalDb } from '../local_db.mjs';
import { atualizarMetricasCampanha } from './campanhas.mjs';

/**
 * 1x1 GIF transparente em base64 para o pixel de rastreamento de abertura.
 */
export const PIXEL_GIF_BASE64 = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
export const PIXEL_BUFFER = Buffer.from(PIXEL_GIF_BASE64, 'base64');

export function registrarAbertura(tokenTracking, { ip = null, userAgent = null } = {}) {
  const db = getLocalDb();
  const msg = db.prepare('SELECT * FROM sp_mensagens WHERE token_tracking = ?').get(tokenTracking);
  if (!msg) return false;

  // Atualizar mensagem se ainda não tiver data de abertura
  db.prepare(`
    UPDATE sp_mensagens
    SET status = CASE WHEN status = 'enviado' THEN 'aberto' ELSE status END,
        aberto_em = COALESCE(aberto_em, datetime('now'))
    WHERE id = ?
  `).run(msg.id);

  // Registrar evento analítico
  db.prepare(`
    INSERT INTO sp_eventos (campanha_id, inscrito_id, mensagem_id, tipo, ip, user_agent)
    VALUES (?, ?, ?, 'abertura', ?, ?)
  `).run(msg.campanha_id, msg.inscrito_id, msg.id, ip, userAgent);

  atualizarMetricasCampanha(msg.campanha_id);
  return true;
}

export function registrarClique(tokenTracking, url, { ip = null, userAgent = null } = {}) {
  const db = getLocalDb();
  const msg = db.prepare('SELECT * FROM sp_mensagens WHERE token_tracking = ?').get(tokenTracking);
  if (!msg) return null;

  // Atualizar mensagem
  db.prepare(`
    UPDATE sp_mensagens
    SET status = 'clicado',
        clicado_em = COALESCE(clicado_em, datetime('now'))
    WHERE id = ?
  `).run(msg.id);

  // Registrar evento analítico
  db.prepare(`
    INSERT INTO sp_eventos (campanha_id, inscrito_id, mensagem_id, tipo, url_clicada, ip, user_agent)
    VALUES (?, ?, ?, 'clique', ?, ?, ?)
  `).run(msg.campanha_id, msg.inscrito_id, msg.id, url, ip, userAgent);

  atualizarMetricasCampanha(msg.campanha_id);
  return url;
}

export function processarOptOut(tokenOptout) {
  const db = getLocalDb();
  const sub = db.prepare('SELECT * FROM sp_inscritos WHERE token_optout = ?').get(tokenOptout);
  if (!sub) return null;

  db.prepare("UPDATE sp_inscritos SET status = 'desinscrito', updated_at = datetime('now') WHERE id = ?").run(sub.id);

  // Marcar as mensagens desse inscrito como desinscrito
  db.prepare("UPDATE sp_mensagens SET status = 'desinscrito' WHERE inscrito_id = ?").run(sub.id);

  return sub;
}
