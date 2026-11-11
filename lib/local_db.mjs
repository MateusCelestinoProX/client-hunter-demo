import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { RAIZ } from './env.mjs';

const dbDir = path.join(RAIZ, 'saidas');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'leads_local.db');
let localDbInstance = null;

export function getLocalDb() {
  if (!localDbInstance) {
    localDbInstance = new DatabaseSync(dbPath);
    inicializarSchema(localDbInstance);
  }
  return localDbInstance;
}

function inicializarSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      google_id TEXT UNIQUE NOT NULL,
      nicho TEXT NOT NULL,
      praca TEXT,
      termo_busca TEXT,
      canal_origem TEXT DEFAULT 'maps',
      canal_detalhes TEXT,
      nome TEXT,
      categoria TEXT,
      endereco TEXT,
      cidade TEXT,
      uf TEXT,
      lat REAL,
      lng REAL,
      google_maps_url TEXT,
      avaliacao REAL,
      total_avaliacoes INTEGER,
      telefone_google TEXT,
      site TEXT,
      site_url_final TEXT,
      site_status INTEGER,
      site_vivo INTEGER,
      site_titulo TEXT,
      site_erro TEXT,
      emails TEXT,
      telefones_site TEXT,
      whatsapp TEXT,
      instagram TEXT,
      facebook TEXT,
      linkedin TEXT,
      youtube TEXT,
      cnpj TEXT,
      resumo_site TEXT,
      porte_estimado TEXT,
      texto_site TEXT,
      score INTEGER DEFAULT 0,
      classificacao TEXT,
      sinais TEXT,
      status TEXT NOT NULL DEFAULT 'novo',
      enriquecido_em TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      aderente_nicho INTEGER,
      motivo_nicho TEXT,
      situacao_site TEXT,
      marketing TEXT,
      oportunidade TEXT,
      celular TEXT,
      requisitos_ok INTEGER,
      motivo_requisitos TEXT,
      receita TEXT,
      razao_social TEXT,
      decisor TEXT,
      cnpj_origem TEXT,
      cnpj_nota TEXT,
      cnpj_consultado_em TEXT,
      nome_empresa TEXT,
      nome_pessoa TEXT,
      justificativa_nota TEXT,
      justificativa_oportunidade TEXT,
      instagram_perfil TEXT,
      seguidores INTEGER,
      posts_instagram INTEGER,
      ultimo_post_instagram TEXT,
      justificativa_instagram TEXT,
      abordagem_instagram TEXT,
      instagram_nota TEXT,
      instagram_consultado_em TEXT,
      anuncios TEXT,
      anuncios_ativos INTEGER,
      justificativa_anuncios TEXT,
      anuncios_consultado_em TEXT,
      site_origem TEXT,
      instagram_origem TEXT,
      linkedin_origem TEXT,
      pesquisa TEXT,
      pesquisado_em TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_local_leads_google_id ON leads(google_id);
    CREATE INDEX IF NOT EXISTS idx_local_leads_nicho ON leads(nicho);
    CREATE INDEX IF NOT EXISTS idx_local_leads_status ON leads(status);

    -- Tabelas SendPortal Core
    CREATE TABLE IF NOT EXISTS sp_templates (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      assunto_padrao TEXT,
      conteudo_html TEXT NOT NULL,
      conteudo_texto TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sp_tags (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL UNIQUE,
      cor TEXT DEFAULT '#3b82f6',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sp_inscritos (
      id TEXT PRIMARY KEY,
      lead_id TEXT,
      email TEXT NOT NULL UNIQUE,
      primeiro_nome TEXT,
      sobrenome TEXT,
      empresa TEXT,
      cargo TEXT,
      status TEXT NOT NULL DEFAULT 'ativo',
      token_optout TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sp_inscritos_tags (
      inscrito_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (inscrito_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS sp_campanhas (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      assunto TEXT NOT NULL,
      remetente_nome TEXT NOT NULL DEFAULT 'Client Hunter Outreach',
      remetente_email TEXT NOT NULL DEFAULT 'prospeccao@resend.dev',
      template_id TEXT,
      conteudo_html TEXT NOT NULL,
      conteudo_texto TEXT,
      tag_alvo TEXT,
      status TEXT NOT NULL DEFAULT 'rascunho',
      agendado_para TEXT,
      enviado_em TEXT,
      total_destinatarios INTEGER DEFAULT 0,
      total_enviados INTEGER DEFAULT 0,
      total_aberturas INTEGER DEFAULT 0,
      total_cliques INTEGER DEFAULT 0,
      total_bounces INTEGER DEFAULT 0,
      total_unsubscribes INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sp_mensagens (
      id TEXT PRIMARY KEY,
      campanha_id TEXT NOT NULL,
      inscrito_id TEXT NOT NULL,
      email TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pendente',
      esp_message_id TEXT,
      erro TEXT,
      token_tracking TEXT UNIQUE NOT NULL,
      enviado_em TEXT,
      aberto_em TEXT,
      clicado_em TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sp_eventos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campanha_id TEXT NOT NULL,
      inscrito_id TEXT NOT NULL,
      mensagem_id TEXT NOT NULL,
      tipo TEXT NOT NULL,
      url_clicada TEXT,
      ip TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_sp_inscritos_email ON sp_inscritos(email);
    CREATE INDEX IF NOT EXISTS idx_sp_inscritos_status ON sp_inscritos(status);
    CREATE INDEX IF NOT EXISTS idx_sp_mensagens_campanha ON sp_mensagens(campanha_id);
    CREATE INDEX IF NOT EXISTS idx_sp_mensagens_token ON sp_mensagens(token_tracking);
  `);

  // Inserir templates padrão do SendPortal se não existirem
  const tplCount = db.prepare('SELECT COUNT(*) as c FROM sp_templates').get();
  if (!tplCount || tplCount.c === 0) {
    const tplStmt = db.prepare(`
      INSERT OR IGNORE INTO sp_templates (id, nome, assunto_padrao, conteudo_html, conteudo_texto)
      VALUES (?, ?, ?, ?, ?)
    `);

    tplStmt.run(
      'tpl_cold_outreach_b2b',
      'Cold Outreach B2B - Redução de Custos e Eficiência',
      'Oportunidade de eficiência para a {{company}}',
      `<div style="font-family: Arial, sans-serif; font-size: 15px; color: #222; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>Olá, <strong>{{first_name}}</strong>!</p>
  <p>Notei o trabalho excelente que a <strong>{{company}}</strong> vem desenvolvendo no segmento de {{nicho}} em {{cidade}}.</p>
  <p>Desenvolvemos soluções personalizadas focadas em acelerar resultados comerciais e reduzir gargalos operacionais no seu setor.</p>
  <p>Você teria 10 minutos nesta semana para trocarmos uma ideia rápida sobre como podemos gerar valor imediato para a {{company}}?</p>
  <p style="margin-top: 30px;">
    <a href="https://wa.me/5541999999999?text=Ol%C3%A1%2C%20vi%20seu%20email%20sobre%20a%20{{company}}" style="background: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Conversar pelo WhatsApp</a>
  </p>
  <p style="margin-top: 40px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 15px;">
    Atenciosamente,<br><strong>Equipe Comercial Client Hunter</strong><br>
    Se você não deseja mais receber nossos e-mails, <a href="{{unsubscribe_url}}" style="color: #666;">clique aqui para se descadastrar</a>.
  </p>
</div>`,
      `Olá, {{first_name}}!\n\nNotei o trabalho da {{company}} no setor de {{nicho}} em {{cidade}}.\nDesenvolvemos soluções focadas em aceleração comercial e eficiência operacional.\n\nTeria 10 minutos para uma breve conversa?\n\nDescadastrar: {{unsubscribe_url}}`
    );

    tplStmt.run(
      'tpl_diagnostico_gratuito',
      'Convite para Diagnóstico Gratuito de Presença Digital',
      'Diagnóstico de Presença Digital da {{company}}',
      `<div style="font-family: Arial, sans-serif; font-size: 15px; color: #222; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>Olá, {{first_name}}!</p>
  <p>Estive analisando a presença digital e os canais de captação da <strong>{{company}}</strong> e preparei um diagnóstico preliminar com 3 oportunidades imediatas de melhoria.</p>
  <p>Identificamos melhorias em canais digitais, tempo de resposta e captação de clientes qualificados.</p>
  <p>Gostaria de ver o diagnóstico completo sem custo algum?</p>
  <p style="margin-top: 25px;">
    <a href="https://calendly.com/prospeccao" style="background: #16a34a; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Agendar Apresentação de 15 Min</a>
  </p>
  <p style="margin-top: 40px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 15px;">
    Se não deseja mais receber esta análise, <a href="{{unsubscribe_url}}" style="color: #666;">cancele aqui</a>.
  </p>
</div>`,
      `Olá {{first_name}},\n\nPreparei um diagnóstico com 3 oportunidades para a {{company}} no mercado de {{nicho}}.\nPodemos conversar 15 minutos?\n\nDescadastrar: {{unsubscribe_url}}`
    );
  }
}

export function inserirLeadLocal(lead) {
  const db = getLocalDb();
  const id = lead.id || `lead-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const googleId = lead.google_id || lead.id || `lead:${Date.now()}`;
  const canalOrigem = lead.canal_origem || 'maps';
  const canalDetalhes = lead.dados_adicionais ? JSON.stringify(lead.dados_adicionais) : null;
  const emails = Array.isArray(lead.emails) ? JSON.stringify(lead.emails) : (lead.emails || '[]');

  const check = db.prepare('SELECT id FROM leads WHERE google_id = ?').get(googleId);
  const isNovo = !check;

  if (isNovo) {
    const marketingJson = lead.marketing ? JSON.stringify(lead.marketing) : null;
    const stmt = db.prepare(`
      INSERT INTO leads (
        id, google_id, nicho, praca, termo_busca, canal_origem, canal_detalhes,
        nome, categoria, endereco, cidade, uf, lat, lng, google_maps_url,
        avaliacao, total_avaliacoes, telefone_google, site, site_url_final, site_vivo, situacao_site, marketing,
        emails, whatsapp, linkedin, instagram, seguidores, justificativa_instagram, decisor, resumo_site, cnpj, score, classificacao, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      googleId,
      lead.nicho || 'geral',
      lead.praca || null,
      lead.termo_busca || null,
      canalOrigem,
      canalDetalhes,
      lead.nome || 'Sem Nome',
      lead.categoria || null,
      lead.endereco || null,
      lead.cidade || null,
      lead.uf || null,
      lead.lat || null,
      lead.lng || null,
      lead.google_maps_url || null,
      lead.avaliacao || null,
      lead.total_avaliacoes || null,
      lead.telefone_google || null,
      lead.site || null,
      lead.site_url_final || lead.site || null,
      lead.site_vivo ? 1 : 0,
      lead.situacao_site || null,
      marketingJson,
      emails,
      lead.whatsapp || null,
      lead.linkedin || null,
      lead.instagram || null,
      lead.seguidores || null,
      lead.justificativa_instagram || null,
      lead.decisor || null,
      lead.resumo_site || null,
      lead.cnpj || null,
      lead.score || 0,
      lead.classificacao || null,
      lead.status || 'novo',
    );
  } else {
    const updateStmt = db.prepare(`
      UPDATE leads SET
        avaliacao = COALESCE(?, avaliacao),
        total_avaliacoes = COALESCE(?, total_avaliacoes),
        telefone_google = COALESCE(?, telefone_google),
        site = COALESCE(site, ?),
        site_url_final = COALESCE(site_url_final, ?),
        site_vivo = COALESCE(site_vivo, ?),
        situacao_site = COALESCE(situacao_site, ?),
        whatsapp = COALESCE(whatsapp, ?),
        linkedin = COALESCE(linkedin, ?),
        instagram = COALESCE(instagram, ?),
        seguidores = COALESCE(?, seguidores),
        decisor = COALESCE(decisor, ?),
        cnpj = COALESCE(cnpj, ?),
        canal_origem = COALESCE(canal_origem, ?),
        updated_at = datetime('now')
      WHERE google_id = ?
    `);

    updateStmt.run(
      lead.avaliacao || null,
      lead.total_avaliacoes || null,
      lead.telefone_google || null,
      lead.site || null,
      lead.site_url_final || lead.site || null,
      lead.site_vivo != null ? (lead.site_vivo ? 1 : 0) : null,
      lead.situacao_site || null,
      lead.whatsapp || null,
      lead.linkedin || null,
      lead.instagram || null,
      lead.seguidores || null,
      lead.decisor || null,
      lead.cnpj || null,
      canalOrigem,
      googleId,
    );
  }

  return { novo: isNovo };
}

export function listarLeadsLocal({ nicho, status, limite = 100 }) {
  const db = getLocalDb();
  let sql = 'SELECT * FROM leads WHERE 1=1';
  const params = [];

  if (nicho) {
    sql += ' AND nicho = ?';
    params.push(nicho);
  }
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(limite);

  const rows = db.prepare(sql).all(...params);
  return rows.map(r => ({
    ...r,
    emails: r.emails ? JSON.parse(r.emails) : [],
    telefones_site: r.telefones_site ? JSON.parse(r.telefones_site) : [],
    marketing: r.marketing ? JSON.parse(r.marketing) : null,
    sinais: r.sinais ? JSON.parse(r.sinais) : {},
    canal_detalhes: r.canal_detalhes ? JSON.parse(r.canal_detalhes) : null,
  }));
}
