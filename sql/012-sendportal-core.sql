-- 012-sendportal-core.sql
-- Integração completa dos recursos do SendPortal no LeadPulse Pro:
-- Campanhas, Modelos/Templates, Inscritos/Subscribers, Tags, Mensagens e Rastreamento de Aberturas/Cliques.

-- 1. Templates de E-mail
CREATE TABLE IF NOT EXISTS sp_templates (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  assunto_padrao TEXT,
  conteudo_html TEXT NOT NULL,
  conteudo_texto TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tags e Segmentos de Inscritos
CREATE TABLE IF NOT EXISTS sp_tags (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  cor TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Inscritos / Assinantes (Subscribers)
CREATE TABLE IF NOT EXISTS sp_inscritos (
  id TEXT PRIMARY KEY,
  lead_id TEXT,
  email TEXT NOT NULL UNIQUE,
  primeiro_nome TEXT,
  sobrenome TEXT,
  empresa TEXT,
  cargo TEXT,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'desinscrito', 'bounce')),
  token_optout TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Associação Muitos-para-Muitos: Inscritos e Tags
CREATE TABLE IF NOT EXISTS sp_inscritos_tags (
  inscrito_id TEXT NOT NULL REFERENCES sp_inscritos(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES sp_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (inscrito_id, tag_id)
);

-- 5. Campanhas de E-mail Marketing
CREATE TABLE IF NOT EXISTS sp_campanhas (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  assunto TEXT NOT NULL,
  remetente_nome TEXT NOT NULL DEFAULT 'LeadPulse Outreach',
  remetente_email TEXT NOT NULL DEFAULT 'prospeccao@resend.dev',
  template_id TEXT REFERENCES sp_templates(id) ON DELETE SET NULL,
  conteudo_html TEXT NOT NULL,
  conteudo_texto TEXT,
  tag_alvo TEXT,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'agendada', 'enviando', 'concluida', 'pausada', 'cancelada')),
  agendado_para TIMESTAMPTZ,
  enviado_em TIMESTAMPTZ,
  total_destinatarios INTEGER DEFAULT 0,
  total_enviados INTEGER DEFAULT 0,
  total_aberturas INTEGER DEFAULT 0,
  total_cliques INTEGER DEFAULT 0,
  total_bounces INTEGER DEFAULT 0,
  total_unsubscribes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Mensagens / Logs de Disparo Individual por Destinatário
CREATE TABLE IF NOT EXISTS sp_mensagens (
  id TEXT PRIMARY KEY,
  campanha_id TEXT NOT NULL REFERENCES sp_campanhas(id) ON DELETE CASCADE,
  inscrito_id TEXT NOT NULL REFERENCES sp_inscritos(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'falhou', 'aberto', 'clicado', 'desinscrito')),
  esp_message_id TEXT,
  erro TEXT,
  token_tracking TEXT UNIQUE NOT NULL,
  enviado_em TIMESTAMPTZ,
  aberto_em TIMESTAMPTZ,
  clicado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Eventos Analíticos de Rastreamento (Aberturas e Cliques)
CREATE TABLE IF NOT EXISTS sp_eventos (
  id SERIAL PRIMARY KEY,
  campanha_id TEXT NOT NULL REFERENCES sp_campanhas(id) ON DELETE CASCADE,
  inscrito_id TEXT NOT NULL REFERENCES sp_inscritos(id) ON DELETE CASCADE,
  mensagem_id TEXT NOT NULL REFERENCES sp_mensagens(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('abertura', 'clique')),
  url_clicada TEXT,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de Performance
CREATE INDEX IF NOT EXISTS idx_sp_inscritos_email ON sp_inscritos(email);
CREATE INDEX IF NOT EXISTS idx_sp_inscritos_status ON sp_inscritos(status);
CREATE INDEX IF NOT EXISTS idx_sp_mensagens_campanha ON sp_mensagens(campanha_id);
CREATE INDEX IF NOT EXISTS idx_sp_mensagens_token ON sp_mensagens(token_tracking);
CREATE INDEX IF NOT EXISTS idx_sp_eventos_campanha ON sp_eventos(campanha_id);
