import crypto from 'node:crypto';
import { getLocalDb } from '../local_db.mjs';

/**
 * Renderiza variáveis no formato {{variable_name}} no texto e HTML.
 */
export function renderizarMensagem(conteudo, dados = {}) {
  if (!conteudo) return '';
  return conteudo.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, chave) => {
    const valor = dados[chave];
    return (valor !== undefined && valor !== null) ? String(valor) : '';
  });
}

export function listarTemplates() {
  const db = getLocalDb();
  return db.prepare('SELECT * FROM sp_templates ORDER BY created_at DESC').all();
}

export function obterTemplate(id) {
  const db = getLocalDb();
  return db.prepare('SELECT * FROM sp_templates WHERE id = ?').get(id);
}

export function salvarTemplate({ id, nome, assunto_padrao, conteudo_html, conteudo_texto }) {
  const db = getLocalDb();
  const templateId = id || `tpl_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  
  const existe = db.prepare('SELECT id FROM sp_templates WHERE id = ?').get(templateId);
  if (existe) {
    db.prepare(`
      UPDATE sp_templates
      SET nome = ?, assunto_padrao = ?, conteudo_html = ?, conteudo_texto = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(nome, assunto_padrao || null, conteudo_html, conteudo_texto || null, templateId);
  } else {
    db.prepare(`
      INSERT INTO sp_templates (id, nome, assunto_padrao, conteudo_html, conteudo_texto)
      VALUES (?, ?, ?, ?, ?)
    `).run(templateId, nome, assunto_padrao || null, conteudo_html, conteudo_texto || null);
  }

  return obterTemplate(templateId);
}

export function excluirTemplate(id) {
  const db = getLocalDb();
  return db.prepare('DELETE FROM sp_templates WHERE id = ?').run(id);
}
