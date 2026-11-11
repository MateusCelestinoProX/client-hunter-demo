-- 011-canais-de-aquisicao.sql
-- Adiciona suporte a canais de aquisição multi-origem (Maps, LinkedIn, Instagram, Web B2B)

ALTER TABLE prospeccao.leads
  ADD COLUMN IF NOT EXISTS canal_origem TEXT DEFAULT 'maps',
  ADD COLUMN IF NOT EXISTS canal_detalhes JSONB,
  ADD COLUMN IF NOT EXISTS decisor TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_canal_origem ON prospeccao.leads (canal_origem);
