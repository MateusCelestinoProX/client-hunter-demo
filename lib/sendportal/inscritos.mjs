import crypto from 'node:crypto';
import { getLocalDb } from '../local_db.mjs';
import { garantirTag } from './tags.mjs';

export function listarInscritos({ tag = null, status = null, limite = 50, offset = 0 } = {}) {
  const db = getLocalDb();
  let sql = `
    SELECT i.*, GROUP_CONCAT(t.nome, ', ') as tags_nomes
    FROM sp_inscritos i
    LEFT JOIN sp_inscritos_tags it ON i.id = it.inscrito_id
    LEFT JOIN sp_tags t ON it.tag_id = t.id
  `;
  const params = [];
  const wheres = [];

  if (status) {
    wheres.push('i.status = ?');
    params.push(status);
  }

  if (tag) {
    wheres.push('it.tag_id = ? OR t.nome = ?');
    params.push(tag, tag);
  }

  if (wheres.length > 0) {
    sql += ` WHERE ${wheres.join(' AND ')}`;
  }

  sql += ` GROUP BY i.id ORDER BY i.created_at DESC LIMIT ? OFFSET ?`;
  params.push(limite, offset);

  return db.prepare(sql).all(...params);
}

export function obterInscrito(id) {
  const db = getLocalDb();
  return db.prepare('SELECT * FROM sp_inscritos WHERE id = ? OR email = ? OR token_optout = ?').get(id, id, id);
}

export function adicionarInscrito({ email, primeiro_nome, sobrenome, empresa, cargo, tags = [], lead_id = null }) {
  if (!email || !email.includes('@')) {
    throw new Error('E-mail inválido');
  }

  const db = getLocalDb();
  const emailLimpo = email.trim().toLowerCase();
  const id = `sub_${crypto.randomUUID().replace(/-/g, '').slice(0, 14)}`;
  const tokenOptout = crypto.randomBytes(16).toString('hex');

  // Upsert no inscrito
  const existente = db.prepare('SELECT * FROM sp_inscritos WHERE email = ?').get(emailLimpo);
  let inscritoId = existente ? existente.id : id;

  if (existente) {
    db.prepare(`
      UPDATE sp_inscritos
      SET primeiro_nome = COALESCE(?, primeiro_nome),
          sobrenome = COALESCE(?, sobrenome),
          empresa = COALESCE(?, empresa),
          cargo = COALESCE(?, cargo),
          lead_id = COALESCE(?, lead_id),
          updated_at = datetime('now')
      WHERE id = ?
    `).run(primeiro_nome || null, sobrenome || null, empresa || null, cargo || null, lead_id || null, existente.id);
  } else {
    db.prepare(`
      INSERT INTO sp_inscritos (id, lead_id, email, primeiro_nome, sobrenome, empresa, cargo, status, token_optout)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'ativo', ?)
    `).run(inscritoId, lead_id || null, emailLimpo, primeiro_nome || null, sobrenome || null, empresa || null, cargo || null, tokenOptout);
  }

  // Vincular tags
  if (Array.isArray(tags) && tags.length > 0) {
    const stmtTag = db.prepare('INSERT OR IGNORE INTO sp_inscritos_tags (inscrito_id, tag_id) VALUES (?, ?)');
    for (const t of tags) {
      const tagObj = garantirTag(t);
      if (tagObj) {
        stmtTag.run(inscritoId, tagObj.id);
      }
    }
  }

  return obterInscrito(inscritoId);
}

/**
 * Sincroniza leads captados do LeadPulse Pro para o banco de contatos do SendPortal.
 */
export function sincronizarLeadsParaInscritos({ nicho = null, classe = null, canal = null } = {}) {
  const db = getLocalDb();
  let sql = "SELECT * FROM leads WHERE emails IS NOT NULL AND emails != '[]' AND emails != ''";
  const params = [];

  if (nicho) {
    sql += ' AND nicho = ?';
    params.push(nicho);
  }
  if (classe) {
    sql += ' AND classificacao = ?';
    params.push(classe);
  }
  if (canal) {
    sql += ' AND canal_origem = ?';
    params.push(canal);
  }

  const leads = db.prepare(sql).all(...params);
  let sincronizados = 0;
  let novos = 0;

  for (const lead of leads) {
    let emailsList = [];
    try {
      emailsList = JSON.parse(lead.emails || '[]');
    } catch {
      if (typeof lead.emails === 'string') {
        emailsList = lead.emails.split(/[,;\s]+/).filter(e => e.includes('@'));
      }
    }

    if (!Array.isArray(emailsList)) {
      emailsList = [emailsList].filter(Boolean);
    }

    // Identificar primeiro nome e cargo a partir do decisor ou do nome da empresa
    let primeiroNome = lead.nome_pessoa || null;
    let cargo = null;
    if (lead.decisor) {
      // Ex: "Carlos Silva (Diretor Comercial)"
      const match = lead.decisor.match(/^([^(]+)(?:\(([^)]+)\))?/);
      if (match) {
        primeiroNome = match[1].trim().split(' ')[0];
        cargo = match[2]?.trim() || 'Tomador de Decisão';
      }
    }

    if (!primeiroNome && lead.nome) {
      primeiroNome = lead.nome.split(/[-–|: ]/)[0]?.trim();
    }

    const tagsDoLead = [
      lead.nicho ? `nicho:${lead.nicho}` : null,
      lead.canal_origem ? `canal:${lead.canal_origem}` : 'canal:maps',
      lead.classificacao ? `classe:${lead.classificacao}` : null,
      lead.cidade ? `cidade:${lead.cidade.toLowerCase().replace(/\s+/g, '-')}` : null,
    ].filter(Boolean);

    for (const email of emailsList) {
      if (!email || !email.includes('@')) continue;
      
      const jaExiste = db.prepare('SELECT id FROM sp_inscritos WHERE email = ?').get(email.trim().toLowerCase());
      adicionarInscrito({
        email,
        primeiro_nome: primeiroNome,
        empresa: lead.nome_empresa || lead.nome,
        cargo,
        tags: tagsDoLead,
        lead_id: lead.id,
      });

      if (!jaExiste) novos++;
      sincronizados++;
    }
  }

  return {
    totalLeadsAnalisados: leads.length,
    totalContatosProcessados: sincronizados,
    novosContatos: novos,
  };
}

export function desinscreverInscrito(tokenOptout) {
  const db = getLocalDb();
  const sub = db.prepare('SELECT * FROM sp_inscritos WHERE token_optout = ?').get(tokenOptout);
  if (!sub) return false;

  db.prepare("UPDATE sp_inscritos SET status = 'desinscrito', updated_at = datetime('now') WHERE id = ?").run(sub.id);
  return true;
}
