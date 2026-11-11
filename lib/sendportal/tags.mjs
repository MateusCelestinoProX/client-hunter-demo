import { getLocalDb } from '../local_db.mjs';

function slugificar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function listarTags() {
  const db = getLocalDb();
  return db.prepare(`
    SELECT t.*, COUNT(it.inscrito_id) as total_inscritos
    FROM sp_tags t
    LEFT JOIN sp_inscritos_tags it ON t.id = it.tag_id
    GROUP BY t.id
    ORDER BY t.nome ASC
  `).all();
}

export function garantirTag(nome, cor = '#3b82f6') {
  if (!nome || typeof nome !== 'string') return null;
  const limpo = nome.trim();
  const slug = slugificar(limpo);
  const tagId = `tag_${slug}`;
  const db = getLocalDb();

  const existe = db.prepare('SELECT * FROM sp_tags WHERE id = ? OR nome = ?').get(tagId, limpo);
  if (existe) return existe;

  db.prepare('INSERT OR IGNORE INTO sp_tags (id, nome, cor) VALUES (?, ?, ?)').run(tagId, limpo, cor);
  return db.prepare('SELECT * FROM sp_tags WHERE id = ?').get(tagId);
}
