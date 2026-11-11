import { getLocalDb } from '../local_db.mjs';

/**
 * Lista mensagens individuais disparadas (Log de Caixa de Saída do SendPortal).
 */
export function listarMensagens({ campanha_id = null, status = null, limite = 50, offset = 0 } = {}) {
  const db = getLocalDb();
  let sql = `
    SELECT m.*, c.nome as campanha_nome, c.assunto as campanha_assunto,
           i.primeiro_nome, i.empresa, i.cargo
    FROM sp_mensagens m
    JOIN sp_campanhas c ON m.campanha_id = c.id
    LEFT JOIN sp_inscritos i ON m.inscrito_id = i.id
  `;
  const params = [];
  const wheres = [];

  if (campanha_id) {
    wheres.push('m.campanha_id = ?');
    params.push(campanha_id);
  }
  if (status) {
    wheres.push('m.status = ?');
    params.push(status);
  }

  if (wheres.length > 0) {
    sql += ` WHERE ${wheres.join(' AND ')}`;
  }

  sql += ` ORDER BY m.created_at DESC LIMIT ? OFFSET ?`;
  params.push(limite, offset);

  return db.prepare(sql).all(...params);
}

/**
 * Lista os eventos analíticos mais recentes (Feed de Atividades em Tempo Real).
 */
export function listarEventosRecentes(limite = 20) {
  const db = getLocalDb();
  return db.prepare(`
    SELECT e.*, c.nome as campanha_nome, i.email, i.primeiro_nome, i.empresa
    FROM sp_eventos e
    JOIN sp_campanhas c ON e.campanha_id = c.id
    JOIN sp_inscritos i ON e.inscrito_id = i.id
    ORDER BY e.created_at DESC
    LIMIT ?
  `).all(limite);
}

/**
 * Retorna dados agregados para o gráfico de engajamento do dashboard.
 */
export function obterDadosGraficoEngajamento() {
  const db = getLocalDb();
  
  // Agrupamento por dia (últimos 7 dias)
  const dados = db.prepare(`
    SELECT 
      substr(created_at, 1, 10) as data,
      SUM(CASE WHEN tipo = 'abertura' THEN 1 ELSE 0 END) as aberturas,
      SUM(CASE WHEN tipo = 'clique' THEN 1 ELSE 0 END) as cliques
    FROM sp_eventos
    GROUP BY substr(created_at, 1, 10)
    ORDER BY data ASC
    LIMIT 7
  `).all();

  return dados;
}
