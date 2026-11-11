export interface Campanha {
  id: string;
  nome: string;
  assunto: string;
  remetente_nome: string;
  remetente_email: string;
  template_id: string | null;
  conteudo_html: string;
  conteudo_texto: string | null;
  tag_alvo: string | null;
  status: 'rascunho' | 'agendada' | 'enviando' | 'concluida' | 'pausada' | 'cancelada';
  agendado_para: string | null;
  enviado_em: string | null;
  total_destinatarios: number;
  total_enviados: number;
  total_aberturas: number;
  total_cliques: number;
  total_bounces: number;
  total_unsubscribes: number;
  created_at: string;
  updated_at: string;
  template_nome?: string;
  taxa_abertura?: string;
  taxa_clique?: string;
}

export interface Template {
  id: string;
  nome: string;
  assunto_padrao: string | null;
  conteudo_html: string;
  conteudo_texto: string | null;
  created_at: string;
  updated_at: string;
}

export interface Inscrito {
  id: string;
  lead_id: string | null;
  email: string;
  primeiro_nome: string | null;
  sobrenome: string | null;
  empresa: string | null;
  cargo: string | null;
  status: 'ativo' | 'desinscrito' | 'bounce';
  token_optout: string;
  created_at: string;
  updated_at: string;
  tags_nomes?: string;
}

export interface Tag {
  id: string;
  nome: string;
  cor: string;
  total_inscritos?: number;
}

export interface MensagemSendPortal {
  id: string;
  campanha_id: string;
  inscrito_id: string;
  destinatario_email: string;
  status: 'pendente' | 'enviado' | 'aberto' | 'clicado' | 'bounce' | 'falha';
  provedor_id?: string | null;
  enviado_em?: string | null;
  aberto_em?: string | null;
  clicado_em?: string | null;
  url_clicada?: string | null;
  erro_detalhe?: string | null;
  created_at: string;
  campanha_nome?: string;
  campanha_assunto?: string;
  primeiro_nome?: string | null;
  empresa?: string | null;
  cargo?: string | null;
}

export interface EventoSendPortal {
  id: string;
  tipo: 'abertura' | 'clique' | 'descadastro' | 'bounce' | 'envio';
  campanha_id: string;
  inscrito_id: string;
  mensagem_id?: string | null;
  ip?: string | null;
  user_agent?: string | null;
  url_destino?: string | null;
  created_at: string;
  campanha_nome?: string;
  email?: string;
  primeiro_nome?: string;
  empresa?: string;
}

export interface ProvedorResend {
  id: string;
  nome: string;
  tipo: 'resend';
  chave_mascarada: string;
  ativo: boolean;
  total_disparados: number;
  total_sucessos: number;
  total_falhas: number;
  quota_diaria: number;
  limite_segundo: number;
  latencia_media_ms: number;
  ultima_utilizacao?: string;
}
