/**
 * Tipos e helpers puros de UI para prospecção (seguros para importar em Client Components).
 */

export type Marketing = {
  mobile?: boolean;
  analytics?: boolean;
  pixel_meta?: boolean;
  pixel_google?: boolean;
  botao_whatsapp?: boolean;
  ano_copyright?: number | null;
  desatualizado?: boolean;
};

export type PerfilInstagram = {
  usuario?: string;
  seguidores?: number;
  posts?: number;
  bio?: string | null;
  categoria?: string | null;
  dias_sem_postar?: number | null;
  posts_30_dias?: number;
  media_curtidas?: number | null;
  media_comentarios?: number | null;
};

export type LeadProspeccao = {
  id: string;
  nicho: string;
  praca: string | null;
  termo_busca: string | null;
  nome: string | null;
  nome_empresa: string | null;
  nome_pessoa: string | null;
  categoria: string | null;
  endereco: string | null;
  cidade: string | null;
  uf: string | null;
  lat: number | null;
  lng: number | null;
  google_maps_url: string | null;
  avaliacao: string | null;
  total_avaliacoes: number | null;
  telefone_google: string | null;
  site: string | null;
  site_url_final: string | null;
  site_titulo: string | null;
  situacao_site: 'com_site' | 'sem_site' | 'site_morto' | null;
  marketing: Marketing | null;
  emails: string[] | null;
  telefones_site: string[] | null;
  celular: string | null;
  whatsapp: string | null;
  instagram: string | null;
  instagram_origem: string | null;
  facebook: string | null;
  linkedin: string | null;
  youtube: string | null;
  cnpj: string | null;
  cnpj_origem: string | null;
  cnpj_nota: string | null;
  razao_social: string | null;
  decisor: string | null;
  receita: Record<string, unknown> | null;
  resumo_site: string | null;
  porte_estimado: string | null;
  score: number;
  sinais: Record<string, { tem: boolean; pontos: number; nota?: string } | number> | null;
  classificacao: string | null;
  oportunidade: 'alta' | 'media' | 'baixa' | null;
  aderente_nicho: boolean | null;
  motivo_nicho: string | null;
  requisitos_ok: boolean | null;
  motivo_requisitos: string | null;
  justificativa_nota: string | null;
  justificativa_oportunidade: string | null;
  canal_origem?: string | null;
  instagram_perfil: PerfilInstagram | null;
  seguidores: number | null;
  posts_instagram: number | null;
  ultimo_post_instagram: string | null;
  justificativa_instagram: string | null;
  abordagem_instagram: string | null;
  anuncios_ativos: number | null;
  justificativa_anuncios: string | null;
  bi_dossier?: DossierBI | null;
  tech_stack?: TechStackItem[] | null;
  decisores?: DecisorLead[] | null;
  bi_enriquecido_em?: string | null;
  created_at: string;
  enriquecido_em: string | null;
};

export type DecisorLead = {
  nome: string;
  cargo?: string | null;
  linkedin_url?: string | null;
  email_provavel?: string | null;
  email_confirmado?: string | null;
  email_status?: string | null;
  emails_preditos?: Array<{ email: string; padrao: string; confianca: string }>;
  fonte?: string | null;
  confianca?: string | null;
};

export type TechStackItem = {
  nome: string;
  categoria: string;
  icone?: string;
  impacto?: string;
};

export type DossierBI = {
  maturidade_digital: string;
  score_bi: number;
  decisor_principal?: {
    nome: string;
    cargo?: string;
    linkedin?: string;
    confianca?: string;
    email_confirmado?: string;
    email_provavel?: string;
  } | null;
  melhor_canal_abordagem?: string;
  provedor_email?: string;
  anuncios_resumo?: {
    ativo?: boolean;
    total?: number;
    link_biblioteca?: string;
    observacao?: string;
  } | null;
  instagram_resumo?: {
    usuario?: string;
    seguidores?: number;
    posts?: number;
    dias_sem_postar?: number | null;
    bio?: string;
  } | null;
  vulnerabilidades_comerciais?: string[];
  oportunidades_estrategicas?: string[];
  gancho_whatsapp?: string;
  gancho_email?: string;
  gancho_email_passo1?: string;
  gancho_email_passo2?: string;
  gancho_email_passo3?: string;
  gancho_linkedin?: string;
  gancho_abordagem_b2b?: string;
  resumo_executivo?: string;
  gerado_em?: string;
};

export type FiltroProspeccao = {
  nicho?: string;
  canal?: string;
  classe?: string;
  site?: string;
  oportunidade?: string;
  busca?: string;
  lista?: string;
};

export const CANAIS = [
  { id: 'maps', rotulo: 'Google Maps' },
  { id: 'linkedin', rotulo: 'LinkedIn' },
  { id: 'instagram', rotulo: 'Instagram' },
  { id: 'web', rotulo: 'Web B2B' },
];

export const canalInfo = (canal?: string | null) => {
  const c = (canal || 'maps').toLowerCase();
  switch (c) {
    case 'linkedin':
      return { id: 'linkedin', rotulo: 'LinkedIn B2B', cor: '#0A66C2', bg: '#0A66C218', icone: '💼' };
    case 'instagram':
      return { id: 'instagram', rotulo: 'Instagram', cor: '#E1306C', bg: '#E1306C18', icone: '📸' };
    case 'web':
      return { id: 'web', rotulo: 'Web B2B', cor: '#4DA3FF', bg: '#4DA3FF18', icone: '🌐' };
    case 'maps':
    default:
      return {
        id: 'maps',
        rotulo: 'Google Maps',
        cor: 'var(--accent-secondary, #FA4200)',
        borda: 'rgba(var(--accent-rgb, 250, 66, 0), 0.35)',
        bg: 'rgba(var(--accent-rgb, 250, 66, 0), 0.14)',
        icone: '📍',
      };
  }
};

export const CLASSES = [
  { id: 'A', rotulo: 'A · quente', cor: '#2E9E5B' },
  { id: 'B', rotulo: 'B · bom', cor: '#E0A800' },
  { id: 'C', rotulo: 'C · fraco', cor: '#7C9CBF' },
  { id: 'D', rotulo: 'D · descarta', cor: '#8A8A8A' },
] as const;

export const classeInfo = (id: string | null) =>
  CLASSES.find((c) => c.id === id) ?? { id: id ?? '—', rotulo: id ?? '—', cor: '#8A8A8A' };

export const SITUACOES_SITE = [
  { id: 'com_site', rotulo: 'Com site' },
  { id: 'sem_site', rotulo: 'Sem site' },
  { id: 'site_morto', rotulo: 'Site fora do ar' },
] as const;

export const situacaoSite = (id: string | null) =>
  SITUACOES_SITE.find((s) => s.id === id)?.rotulo ?? 'não testado';

export const OPORTUNIDADES = [
  { id: 'alta', rotulo: 'Alta' },
  { id: 'media', rotulo: 'Média' },
  { id: 'baixa', rotulo: 'Baixa' },
] as const;

export const SINAIS: Record<string, string> = {
  site_vivo: 'Site no ar',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  telefone: 'Telefone',
  reputacao: 'Nota no Google',
  endereco: 'Endereço',
  cnpj: 'CNPJ',
  linkedin: 'LinkedIn',
  site_morto: 'Site fora do ar',
};

export function logoDoSite(site: string | null) {
  if (!site) return null;
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(site).hostname}&sz=128`;
  } catch {
    return null;
  }
}

export function arroba(url: string | null) {
  const m = url?.match(/instagram\.com\/([^/?#]+)/i);
  return m ? `@${m[1]}` : null;
}

export function mil(n: number | null | undefined) {
  if (n === null || n === undefined) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`;
  if (n >= 1000) return `${(n / 1000).toLocaleString('pt-BR', { maximumFractionDigits: n >= 10_000 ? 0 : 1 })} mil`;
  return String(n);
}

const ACENTOS: Record<string, string> = { clinica: 'clínica', odontologica: 'odontológica', estetica: 'estética' };

export const nomeNicho = (slug: string) =>
  slug.split('-').map((p) => ACENTOS[p] ?? p).join(' ');

export const nomeOportunidade = (id: string | null) => OPORTUNIDADES.find((o) => o.id === id)?.rotulo ?? '—';
