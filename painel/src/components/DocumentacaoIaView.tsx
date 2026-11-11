'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Terminal,
  Cpu,
  Code2,
  Copy,
  Check,
  Search,
  ExternalLink,
  Layers,
  Sparkles,
  Zap,
  Activity,
  Database,
  Send,
  Target,
  MapPin,
  Mail,
  ShieldCheck,
  FileCode,
  Download,
  Filter,
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface ToolDef {
  name: string;
  categoria: 'Mineração & Maps' | 'LinkedIn & Web' | 'Business Intelligence' | 'Cold Outreach' | 'Telemetria';
  description: string;
  parameters: Record<string, any>;
  samplePayload: Record<string, any>;
  returnSchema: string;
}

const MCP_TOOLS: ToolDef[] = [
  {
    name: 'leadpulse_coletar_leads',
    categoria: 'Mineração & Maps',
    description: 'Orquestra a coleta multi-canal de leads (Google Maps, LinkedIn, Instagram, Web B2B) com gravação idempotente no SQLite.',
    parameters: {
      canal: { type: 'string', enum: ['maps', 'linkedin', 'instagram', 'web'], default: 'maps', description: 'Canal de captação' },
      nicho: { type: 'string', required: true, description: 'Nicho comercial (ex: energia-solar, clinicas-odontologicas)' },
      praca: { type: 'string', required: true, description: 'Cidade/Estado alvo (ex: Curitiba PR)' },
      limite: { type: 'number', default: 10, description: 'Meta de leads a coletar' }
    },
    samplePayload: {
      canal: 'maps',
      nicho: 'clinicas-odontologicas',
      praca: 'Curitiba PR',
      limite: 15
    },
    returnSchema: '{ coletados: number, salvos: number, pendentes_enriquecimento: number, leads: Array<Lead> }'
  },
  {
    name: 'leadpulse_buscar_empresas',
    categoria: 'Mineração & Maps',
    description: 'Busca empresas no Google Maps usando Botasaurus nativo (R$ 0), SuperPool Apify (13 contas) ou Google Places.',
    parameters: {
      query: { type: 'string', required: true, description: 'Termo de busca com praça (ex: "energia solar no Rio de Janeiro RJ")' },
      limite: { type: 'number', default: 10, description: 'Quantidade máxima de empresas a retornar' },
      motor: { type: 'string', enum: ['botasaurus', 'superpool', 'google', 'apify'], default: 'superpool' }
    },
    samplePayload: {
      query: 'energia solar em Ribeirão Preto SP',
      limite: 10,
      motor: 'superpool'
    },
    returnSchema: '{ empresas: Array<{ nome, endereco, telefone, site, nota, avaliacoes, place_id }> }'
  },
  {
    name: 'leadpulse_buscar_linkedin',
    categoria: 'LinkedIn & Web',
    description: 'Capta empresas B2B e tomadores de decisão (CEOs, Diretores, Sócios) no LinkedIn via SuperPool.',
    parameters: {
      nicho: { type: 'string', required: true, description: 'Nicho comercial' },
      praca: { type: 'string', required: true, description: 'Praça/Cidade' },
      limite: { type: 'number', default: 10, description: 'Limite de leads' },
      tipo: { type: 'string', enum: ['empresas', 'decisores', 'ambos'], default: 'empresas' }
    },
    samplePayload: {
      nicho: 'software saas',
      praca: 'São Paulo SP',
      limite: 10,
      tipo: 'decisores'
    },
    returnSchema: '{ decisores: Array<{ nome, cargo, empresa, url_linkedin, resumo }> }'
  },
  {
    name: 'leadpulse_buscar_instagram_leads',
    categoria: 'Mineração & Maps',
    description: 'Capta perfis comerciais no Instagram com WhatsApp na bio, e-mail e contagem de seguidores.',
    parameters: {
      nicho: { type: 'string', required: true, description: 'Nicho comercial' },
      praca: { type: 'string', required: true, description: 'Praça/Cidade' },
      limite: { type: 'number', default: 10, description: 'Limite de leads' }
    },
    samplePayload: {
      nicho: 'arquitetura',
      praca: 'Campinas SP',
      limite: 12
    },
    returnSchema: '{ perfis: Array<{ username, whatsapp, email, seguidores, bio }> }'
  },
  {
    name: 'leadpulse_buscar_web_leads',
    categoria: 'LinkedIn & Web',
    description: 'Procura portais e sites corporativos B2B na web combinando SERP, Exa Neural Search e Firecrawl.',
    parameters: {
      nicho: { type: 'string', required: true, description: 'Nicho comercial' },
      praca: { type: 'string', required: true, description: 'Praça/Cidade' },
      limite: { type: 'number', default: 10, description: 'Limite de leads' }
    },
    samplePayload: {
      nicho: 'distribuidora alimenticia',
      praca: 'Santa Catarina SC',
      limite: 10
    },
    returnSchema: '{ sites: Array<{ titulo, url, snippet, emails, telefones }> }'
  },
  {
    name: 'leadpulse_busca_neural_exa',
    categoria: 'LinkedIn & Web',
    description: 'Busca semântica neural via 9 contas Exa AI para mapear concorrentes, fornecedores ou dados corporativos.',
    parameters: {
      query: { type: 'string', required: true, description: 'Consulta conceitual ou descritiva' },
      numResults: { type: 'number', default: 5, description: 'Número de resultados desejados' }
    },
    samplePayload: {
      query: 'empresas líderes em gestão de resíduos industriais em SP',
      numResults: 5
    },
    returnSchema: '{ resultados: Array<{ title, url, score, author, highlights }> }'
  },
  {
    name: 'leadpulse_pesquisa_google',
    categoria: 'LinkedIn & Web',
    description: 'Executa busca na web tipo SERP via pool rotativo do Apify ou Google CSE.',
    parameters: {
      query: { type: 'string', required: true, description: 'Termo de busca no Google' },
      maxResults: { type: 'number', default: 10, description: 'Quantidade de resultados' }
    },
    samplePayload: {
      query: 'site:linkedin.com/in "sócio" "energia solar" "Florianópolis"',
      maxResults: 10
    },
    returnSchema: '{ items: Array<{ title, link, snippet }> }'
  },
  {
    name: 'leadpulse_raspar_instagram',
    categoria: 'Mineração & Maps',
    description: 'Raspa métricas, número de seguidores, posts e engajamento do perfil no Instagram usando o pool de 13 contas Apify.',
    parameters: {
      usernames: { type: 'array', items: 'string', required: true, description: 'Lista de nomes de usuário do Instagram (sem @)' }
    },
    samplePayload: {
      usernames: ['clinicasorrir', 'solarparana']
    },
    returnSchema: '{ profiles: Array<{ username, fullName, followersCount, biografia, externalUrl }> }'
  },
  {
    name: 'leadpulse_consultar_anuncios',
    categoria: 'Business Intelligence',
    description: 'Verifica se a empresa possui anúncios ativos na Biblioteca de Anúncios da Meta via Apify Pool.',
    parameters: {
      nomes_empresas: { type: 'array', items: 'string', required: true, description: 'Lista de nomes limpos das empresas' }
    },
    samplePayload: {
      nomes_empresas: ['SolarTech Campinas', 'Clínica OdontoAlpha']
    },
    returnSchema: '{ resultados: Array<{ empresa, possui_anuncios_ativos, total_anuncios, criativos }> }'
  },
  {
    name: 'leadpulse_enriquecer_site',
    categoria: 'Business Intelligence',
    description: 'Audita e extrai contatos (WhatsApp, e-mails, redes sociais, pixel de marketing) do site com fallback para Firecrawl.',
    parameters: {
      url: { type: 'string', required: true, description: 'URL do site da empresa a enriquecer' }
    },
    samplePayload: {
      url: 'https://solarbrasil.com.br'
    },
    returnSchema: '{ site_vivo: boolean, emails: string[], telefones: string[], whatsapp: string, redes: object, pixels: string[] }'
  },
  {
    name: 'leadpulse_enriquecer_bi',
    categoria: 'Business Intelligence',
    description: 'Executa a Etapa 2 de Business Intelligence para um lead: descobre tomadores de decisão no LinkedIn via Apify SERP Dorking, detecta Tech Stack completo (CMS, CRM, Pixels), valida servidores MX corporativos e gera Dossiê Executivo de abordagem B2B.',
    parameters: {
      lead_id: { type: 'string', required: true, description: 'ID do lead a enriquecer com BI' },
      forcar: { type: 'boolean', default: false, description: 'Forçar reprocessamento' }
    },
    samplePayload: {
      lead_id: 'maps:ChIJgUb9cqYEzgARxpt7A...',
      forcar: false
    },
    returnSchema: '{ lead_id, tech_stack: string[], decisores: Array<{ nome, cargo, url }>, bi_dossier: object, bi_enriquecido_em: string }'
  },
  {
    name: 'leadpulse_enriquecer_lote_bi',
    categoria: 'Business Intelligence',
    description: 'Enriquece uma lista de leads pendentes com Business Intelligence em lote, filtrados opcionalmente por nicho.',
    parameters: {
      nicho: { type: 'string', description: 'Nicho específico para filtrar' },
      limite: { type: 'number', default: 5, description: 'Quantidade máxima de leads a processar' },
      forcar: { type: 'boolean', default: false }
    },
    samplePayload: {
      nicho: 'energia-solar',
      limite: 5,
      forcar: false
    },
    returnSchema: '{ processados: number, resultados: Array<{ id, sucesso, lead }> }'
  },
  {
    name: 'leadpulse_consultar_bi_dossier',
    categoria: 'Business Intelligence',
    description: 'Consulta o Dossiê Executivo de Business Intelligence, maturidade digital, lista de decisores mapeados e Tech Stack de um lead.',
    parameters: {
      lead_id: { type: 'string', required: true, description: 'ID do lead a consultar' }
    },
    samplePayload: {
      lead_id: 'maps:ChIJgUb9cqYEzgARxpt7A...'
    },
    returnSchema: '{ id, nome, bi_dossier: object, tech_stack: string[], decisores: Array<object>, emails: string[], whatsapp: string }'
  },
  {
    name: 'leadpulse_buscar_decisores_linkedin',
    categoria: 'Business Intelligence',
    description: 'Busca tomadores de decisão (Sócios, CEOs, Diretores) no LinkedIn para qualquer empresa via Apify Google Search Dorking.',
    parameters: {
      empresa: { type: 'string', required: true, description: 'Nome da empresa alvo' },
      praca: { type: 'string', description: 'Cidade ou estado (opcional)' }
    },
    samplePayload: {
      empresa: 'Neosolar Energia',
      praca: 'São Paulo SP'
    },
    returnSchema: '{ decisores: Array<{ nome, cargo, perfil_url, empresa }> }'
  },
  {
    name: 'leadpulse_sendportal_sincronizar_leads',
    categoria: 'Cold Outreach',
    description: 'Sincroniza leads enriquecidos captados pelo Client Hunter para a base de contatos do SendPortal com tags automáticas.',
    parameters: {
      nicho: { type: 'string', description: 'Filtrar por nicho (opcional)' },
      classe: { type: 'string', description: 'Filtrar por classe (A, B, C, D) (opcional)' },
      canal: { type: 'string', description: 'Filtrar por canal de origem (maps, linkedin, instagram, web) (opcional)' }
    },
    samplePayload: {
      nicho: 'clinicas-odontologicas',
      classe: 'A'
    },
    returnSchema: '{ sincronizados: number, tags_geradas: string[] }'
  },
  {
    name: 'leadpulse_sendportal_listar_campanhas',
    categoria: 'Cold Outreach',
    description: 'Lista todas as campanhas de e-mail marketing, status de envio e métricas (aberturas, cliques).',
    parameters: {},
    samplePayload: {},
    returnSchema: '{ campanhas: Array<{ id, nome, status, total_enviados, taxa_abertura, taxa_clique }> }'
  },
  {
    name: 'leadpulse_sendportal_listar_templates',
    categoria: 'Cold Outreach',
    description: 'Lista todos os modelos de e-mail disponíveis com suas variáveis dinâmicas.',
    parameters: {},
    samplePayload: {},
    returnSchema: '{ templates: Array<{ id, nome, assunto_padrao, variaveis: string[] }> }'
  },
  {
    name: 'leadpulse_sendportal_criar_campanha',
    categoria: 'Cold Outreach',
    description: 'Cria uma nova campanha de e-mail marketing no SendPortal.',
    parameters: {
      nome: { type: 'string', required: true, description: 'Nome identificador da campanha' },
      assunto: { type: 'string', required: true, description: 'Assunto do e-mail com variáveis como {{company}}' },
      template_id: { type: 'string', description: 'ID do modelo/template a utilizar' },
      tag_alvo: { type: 'string', description: 'Tag alvo dos contatos (opcional)' },
      leads_ids: { type: 'array', items: 'string', description: 'Lista de IDs específicos de leads' },
      remetente_nome: { type: 'string', default: 'Client Hunter Outreach' },
      remetente_email: { type: 'string', default: 'prospeccao@resend.dev' }
    },
    samplePayload: {
      nome: 'Outreach Clínicas SP Outubro',
      assunto: 'Parceria de Expansão para {{company}}',
      template_id: 'tpl_cold_outreach_b2b',
      tag_alvo: 'classe_a_odontologia'
    },
    returnSchema: '{ id, nome, status: "rascunho", total_destinatarios: number }'
  },
  {
    name: 'leadpulse_sendportal_disparar_campanha',
    categoria: 'Cold Outreach',
    description: 'Dispara uma campanha de e-mail marketing para os contatos segmentados via SuperPool Resend com rastreamento.',
    parameters: {
      campanha_id: { type: 'string', required: true, description: 'ID da campanha a disparar' },
      teste_email: { type: 'string', description: 'E-mail de teste único (opcional)' }
    },
    samplePayload: {
      campanha_id: 'cmp_1730000000'
    },
    returnSchema: '{ sucesso: boolean, enviados: number, falhas: number, campanha_id: string }'
  },
  {
    name: 'leadpulse_sendportal_enviar_email_rapido',
    categoria: 'Cold Outreach',
    description: 'Dispara um e-mail comercial personalizado direto e imediato para um lead captado pelo Client Hunter via SuperPool Resend.',
    parameters: {
      lead_id: { type: 'string', description: 'ID do lead no banco (ex: maps:..., linkedin:..., web:...)' },
      email: { type: 'string', description: 'E-mail do destinatário (opcional se lead_id informado)' },
      assunto: { type: 'string', description: 'Assunto personalizado do e-mail' },
      template_id: { type: 'string', default: 'tpl_cold_outreach_b2b', description: 'ID do template a usar' },
      conteudo_html: { type: 'string', description: 'HTML customizado para envio direto' }
    },
    samplePayload: {
      lead_id: 'maps:ChIJgUb9cqYEzgARxpt7A...',
      assunto: 'Dúvida sobre os projetos solares da SolarTech'
    },
    returnSchema: '{ sucesso: boolean, message_id: string, destinatario: string }'
  },
  {
    name: 'leadpulse_sendportal_listar_mensagens',
    categoria: 'Cold Outreach',
    description: 'Consulta o log detalhado de mensagens individuais disparadas (status, aberturas, cliques e eventuais falhas).',
    parameters: {
      campanha_id: { type: 'string', description: 'Filtrar por campanha (opcional)' },
      status: { type: 'string', enum: ['pendente', 'enviado', 'aberto', 'clicado', 'falhou'] },
      limite: { type: 'number', default: 20 }
    },
    samplePayload: {
      status: 'aberto',
      limite: 10
    },
    returnSchema: '{ mensagens: Array<{ id, destinatario, status, aberto_em, clicado_em }> }'
  },
  {
    name: 'leadpulse_sendportal_feed_atividades',
    categoria: 'Cold Outreach',
    description: 'Retorna os eventos analíticos mais recentes em tempo real (quem abriu o e-mail, quem clicou no link e horários).',
    parameters: {
      limite: { type: 'number', default: 20 }
    },
    samplePayload: {
      limite: 20
    },
    returnSchema: '{ eventos: Array<{ tipo: "abertura" | "clique", lead_nome, horario, link_clicado }> }'
  },
  {
    name: 'leadpulse_sendportal_salvar_template',
    categoria: 'Cold Outreach',
    description: 'Cria ou atualiza um modelo (template) de e-mail no SendPortal com variáveis dinâmicas.',
    parameters: {
      id: { type: 'string', description: 'ID único do template (opcional para criação)' },
      nome: { type: 'string', required: true, description: 'Nome descritivo do modelo' },
      assunto_padrao: { type: 'string', description: 'Assunto padrão' },
      conteudo_html: { type: 'string', required: true, description: 'Conteúdo em HTML com variáveis' },
      conteudo_texto: { type: 'string', description: 'Versão texto puro' }
    },
    samplePayload: {
      nome: 'Pitch B2B com Dossiê',
      assunto_padrao: 'Oportunidade para a {{company}}',
      conteudo_html: '<p>Olá {{first_name}}, notei sua liderança na {{company}}...</p>'
    },
    returnSchema: '{ template_id: string, salvo: boolean }'
  },
  {
    name: 'leadpulse_superpool_status',
    categoria: 'Telemetria',
    description: 'Consulta a telemetria, quotas e chaves ativas do Super Pool (Apify 13 contas, Exa 9 contas, Firecrawl, Resend).',
    parameters: {},
    samplePayload: {},
    returnSchema: '{ apify: { ativas: 13, pool_status: "ok" }, exa: { ativas: 9 }, resend: { status: "operacional" } }'
  }
];

const REST_ENDPOINTS = [
  {
    metodo: 'POST',
    caminho: '/api/prospeccao/captar',
    descricao: 'Dispara mineração e coleta autônoma multi-canal.',
    payload: `{\n  "canal": "maps",\n  "nicho": "energia-solar",\n  "praca": "Curitiba PR",\n  "limite": 10,\n  "enriquecer": true,\n  "sincronizarSendportal": true,\n  "motorMaps": "superpool"\n}`,
    curl: `curl -X POST https://instance-20260907-0637.tail798a9b.ts.net:3333/api/prospeccao/captar \\\n  -H "Content-Type: application/json" \\\n  -d '{"canal":"maps","nicho":"energia-solar","praca":"Curitiba PR","limite":10}'`
  },
  {
    metodo: 'GET',
    caminho: '/api/prospeccao/leads',
    descricao: 'Consulta CRM de leads filtrados por nicho, classe, canal ou termo livre.',
    payload: `Query params: ?nicho=clinicas&classe=A&canal=maps&limite=50`,
    curl: `curl -s "https://instance-20260907-0637.tail798a9b.ts.net:3333/api/prospeccao/leads?classe=A"`
  },
  {
    metodo: 'POST',
    caminho: '/api/prospeccao/enriquecer-bi',
    descricao: 'Dispara enriquecimento forense (Tech Stack + Decisores LinkedIn + Dossiê).',
    payload: `{\n  "lead_id": "maps:ChIJgUb9cqYEzgARxpt7A...",\n  "forcar": false\n}`,
    curl: `curl -X POST https://instance-20260907-0637.tail798a9b.ts.net:3333/api/prospeccao/enriquecer-bi \\\n  -H "Content-Type: application/json" \\\n  -d '{"lead_id":"maps:ChIJgUb9cqYEzgARxpt7A..."}'`
  },
  {
    metodo: 'POST',
    caminho: '/api/sendportal/email-rapido',
    descricao: 'Dispara um e-mail 1-on-1 ultra personalizado imediato para um lead.',
    payload: `{\n  "lead_id": "maps:ChIJgUb9cqYEzgARxpt7A...",\n  "assunto": "Parceria B2B",\n  "template_id": "tpl_cold_outreach_b2b"\n}`,
    curl: `curl -X POST https://instance-20260907-0637.tail798a9b.ts.net:3333/api/sendportal/email-rapido \\\n  -H "Content-Type: application/json" \\\n  -d '{"lead_id":"...","assunto":"Contato Comercial"}'`
  },
  {
    metodo: 'GET',
    caminho: '/api/ai/spec',
    descricao: 'Retorna a especificação JSON integral de todas as ferramentas e rotas para consumo de IA.',
    payload: `Nenhum (GET puro)`,
    curl: `curl -s https://instance-20260907-0637.tail798a9b.ts.net:3333/api/ai/spec`
  }
];

const SYSTEM_PROMPT_AGENTE = `Você é um Agente Autônomo Especialista em Inteligência Comercial B2B e Prospecção do Client Hunter PRO.
Sua missão é operar os motores de busca (Google Maps Botasaurus/Apify, LinkedIn e Web), qualificar empresas e tomadores de decisão, auditar maturidade digital e orquestrar campanhas de Cold Outreach com alta personalização.

DIRETRIZES DE EXECUÇÃO:
1. Sempre verifique primeiro se já existem leads qualificados usando 'leadpulse_coletar_leads' ou consultando o CRM via GET '/api/prospeccao/leads'.
2. Priorize leads Classe A (Score 75+) para campanhas de maior valor agregado.
3. Para enriquecer dados de decisores, acione 'leadpulse_enriquecer_bi' passando o 'lead_id'.
4. Antes de disparar campanhas no SendPortal, assegure-se de que os leads foram sincronizados via 'leadpulse_sendportal_sincronizar_leads'.
5. Monitore a saúde do SuperPool com 'leadpulse_superpool_status' para otimizar consumo de quotas.`;

export function DocumentacaoIaView() {
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('Todas');
  const [ferramentaAberta, setFerramentaAberta] = useState<string | null>('leadpulse_coletar_leads');
  const [abaAtiva, setAbaAtiva] = useState<'mcp' | 'rest' | 'playbooks' | 'setup' | 'prompt'>('mcp');
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  const copiar = (id: string, texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  const categorias = ['Todas', 'Mineração & Maps', 'LinkedIn & Web', 'Business Intelligence', 'Cold Outreach', 'Telemetria'];

  const ferramentasFiltradas = useMemo(() => {
    return MCP_TOOLS.filter((tool) => {
      const matchCat = categoriaAtiva === 'Todas' || tool.categoria === categoriaAtiva;
      const matchBusca =
        !busca.trim() ||
        tool.name.toLowerCase().includes(busca.toLowerCase()) ||
        tool.description.toLowerCase().includes(busca.toLowerCase());
      return matchCat && matchBusca;
    });
  }, [busca, categoriaAtiva]);

  return (
    <div className="space-y-6">
      {/* Top Cockpit de Automação IA */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-destaque/15 border border-destaque/30 flex items-center justify-center text-destaque">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-destaque tracking-wider">
                Protocolo Machine-to-Machine (M2M) v2.0
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                24 Tools Prontas
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight font-display">
              Especificação Integral para Agentes Autônomos de IA
            </h2>
          </div>
        </div>

        {/* Quick Export Actions */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => copiar('prompt', SYSTEM_PROMPT_AGENTE)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-medium bg-destaque/15 active:bg-destaque/25 hover:bg-destaque/25 text-destaque border border-destaque/30 transition-all cursor-pointer min-h-[38px]"
          >
            {copiadoId === 'prompt' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="truncate">System Prompt</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const cfg = {
                mcpServers: {
                  'client-hunter': {
                    command: 'node',
                    args: ['/home/ubuntu/apps/client-hunter/mcp/leadpulse-mcp.mjs'],
                    env: { NODE_ENV: 'production' }
                  }
                }
              };
              copiar('mcp-cfg', JSON.stringify(cfg, null, 2));
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-medium bg-white/10 active:bg-white/15 hover:bg-white/15 text-white border border-white/15 transition-all cursor-pointer min-h-[38px]"
          >
            {copiadoId === 'mcp-cfg' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="truncate">JSON MCP</span>
          </button>

          <a
            href="/api/ai/spec"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-medium bg-white/10 active:bg-white/15 hover:bg-white/15 text-white border border-white/15 transition-all min-h-[38px]"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span className="truncate">OpenAPI</span>
          </a>

          <a
            href="/llms.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-medium bg-white/10 active:bg-white/15 hover:bg-white/15 text-white border border-white/15 transition-all min-h-[38px]"
          >
            <FileCode className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate">llms.txt</span>
          </a>
        </div>
      </div>

      {/* Navegação de Abas do Cockpit IA (Scroll Horizontal no Mobile) */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'mcp', label: '1. Catálogo MCP (24 Ferramentas)', mobile: '1. MCP (24)', icone: Terminal },
          { id: 'rest', label: '2. API REST Endpoints (HTTP)', mobile: '2. REST', icone: Code2 },
          { id: 'setup', label: '3. Setup Stdio JSON-RPC & Configs', mobile: '3. Setup', icone: Layers },
          { id: 'playbooks', label: '4. Playbooks & SOPs de Execução', mobile: '4. SOPs', icone: Activity },
          { id: 'prompt', label: '5. System Prompt & Instruções', mobile: '5. Prompt', icone: Sparkles },
        ].map((aba) => {
          const Icone = aba.icone;
          const ativo = abaAtiva === aba.id;
          return (
            <button
              key={aba.id}
              type="button"
              onClick={() => setAbaAtiva(aba.id as any)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer min-h-[38px] ${
                ativo
                  ? 'bg-destaque text-white font-bold shadow-md shadow-destaque/30'
                  : 'bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08] active:bg-white/15 border border-white/10'
              }`}
            >
              <Icone className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{aba.label}</span>
              <span className="sm:hidden">{aba.mobile}</span>
            </button>
          );
        })}
      </div>

      {/* ABA 1: CATÁLOGO MCP */}
      {abaAtiva === 'mcp' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Barra de Filtros e Busca */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar ferramenta MCP por nome ou finalidade (ex: linkedin, site, campanha)..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/40 text-xs focus:outline-none focus:border-destaque"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoriaAtiva(cat)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                    categoriaAtiva === cat
                      ? 'bg-destaque/20 text-destaque border border-destaque/40 font-semibold'
                      : 'bg-white/[0.03] text-white/60 hover:text-white border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-white/50 flex items-center justify-between">
            <span>Exibindo <strong>{ferramentasFiltradas.length}</strong> de {MCP_TOOLS.length} ferramentas cadastradas no servidor MCP.</span>
            <span className="font-mono text-[11px] text-destaque">Protocol: JSON-RPC 2.0 Stdio</span>
          </div>

          {/* Grid de Ferramentas MCP */}
          <div className="space-y-3">
            {ferramentasFiltradas.map((tool) => {
              const aberta = ferramentaAberta === tool.name;
              return (
                <div
                  key={tool.name}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    aberta
                      ? 'bg-white/[0.06] border-destaque/40 shadow-lg shadow-black/40'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Tool Header */}
                  <div
                    onClick={() => setFerramentaAberta(aberta ? null : tool.name)}
                    className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-destaque/10 border border-destaque/20 flex items-center justify-center shrink-0">
                        <Terminal className="w-4 h-4 text-destaque" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-xs font-mono font-bold text-white tracking-wide">
                            {tool.name}
                          </code>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-white/60 border border-white/10">
                            {tool.categoria}
                          </span>
                        </div>
                        <p className="text-xs text-white/60 font-light truncate mt-0.5">
                          {tool.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const snippet = {
                            name: tool.name,
                            arguments: tool.samplePayload
                          };
                          copiar(tool.name, JSON.stringify(snippet, null, 2));
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-white/10 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 flex items-center gap-1 transition-all"
                        title="Copiar chamada JSON da ferramenta"
                      >
                        {copiadoId === tool.name ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Payload</span>
                      </button>
                    </div>
                  </div>

                  {/* Tool Expanded Body */}
                  {aberta && (
                    <div className="p-4 pt-0 border-t border-white/10 space-y-4 text-xs">
                      <div>
                        <h4 className="text-[11px] font-mono font-bold uppercase text-destaque tracking-wider mt-3 mb-1">
                          Descrição Operacional
                        </h4>
                        <p className="text-white/80 leading-relaxed font-light">
                          {tool.description}
                        </p>
                      </div>

                      {/* Parâmetros */}
                      <div>
                        <h4 className="text-[11px] font-mono font-bold uppercase text-white/70 tracking-wider mb-2">
                          Argumentos de Entrada (inputSchema)
                        </h4>
                        <div className="rounded-xl overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-md">
                          <table className="w-full text-left font-mono text-[11px]">
                            <thead>
                              <tr className="border-b border-white/10 bg-white/[0.04] text-white/60 text-[10px] uppercase">
                                <th className="p-2.5">Parâmetro</th>
                                <th className="p-2.5">Tipo</th>
                                <th className="p-2.5">Obrigatório</th>
                                <th className="p-2.5">Descrição</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {Object.entries(tool.parameters).length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="p-3 text-center text-white/40 italic">
                                    Nenhum parâmetro obrigatório (chamada vazia {"{}"}).
                                  </td>
                                </tr>
                              ) : (
                                Object.entries(tool.parameters).map(([param, info]: [string, any]) => (
                                  <tr key={param} className="hover:bg-white/[0.02]">
                                    <td className="p-2.5 text-destaque font-bold">{param}</td>
                                    <td className="p-2.5 text-blue-300">
                                      {info.type} {info.enum ? `(${info.enum.join(' | ')})` : ''}
                                    </td>
                                    <td className="p-2.5">
                                      {info.required ? (
                                        <span className="text-emerald-400 font-bold">Sim</span>
                                      ) : (
                                        <span className="text-white/40">Não</span>
                                      )}
                                    </td>
                                    <td className="p-2.5 text-white/70 font-sans">{info.description || '-'}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Snippet de Exemplo JSON */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-mono text-white/60 mb-1">
                            <span>Exemplo de Chamada do Agente</span>
                            <button
                              type="button"
                              onClick={() => copiar(`sample-${tool.name}`, JSON.stringify(tool.samplePayload, null, 2))}
                              className="text-destaque hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              {copiadoId === `sample-${tool.name}` ? 'Copiado!' : 'Copiar'}
                            </button>
                          </div>
                          <pre className="p-3 rounded-xl bg-black/25 backdrop-blur-md border border-white/10 font-mono text-[11px] text-amber-300 overflow-x-auto">
                            {JSON.stringify(tool.samplePayload, null, 2)}
                          </pre>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-[11px] font-mono text-white/60 mb-1">
                            <span>Esquema do Payload de Retorno</span>
                          </div>
                          <pre className="p-3 rounded-xl bg-black/25 backdrop-blur-md border border-white/10 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                            {tool.returnSchema}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 2: API REST */}
      {abaAtiva === 'rest' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 leading-relaxed">
            <strong>Endpoint Base:</strong> <code>https://instance-20260907-0637.tail798a9b.ts.net:3333</code> (ou <code>http://127.0.0.1:3333</code> local).
            Todos os endpoints devolvem payloads JSON com código HTTP adequado e cabeçalhos CORS liberados para agentes de automação.
          </div>

          <div className="space-y-4">
            {REST_ENDPOINTS.map((endpoint, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                      endpoint.metodo === 'POST' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {endpoint.metodo}
                    </span>
                    <code className="text-sm font-mono font-bold text-white">{endpoint.caminho}</code>
                  </div>

                  <button
                    type="button"
                    onClick={() => copiar(`curl-${i}`, endpoint.curl)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono bg-white/10 hover:bg-white/15 text-white/80 hover:text-white border border-white/15 transition-all cursor-pointer"
                  >
                    {copiadoId === `curl-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar cURL</span>
                  </button>
                </div>

                <p className="text-xs text-white/70 font-light">{endpoint.descricao}</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block mb-1">
                      Payload / Argumentos
                    </span>
                    <pre className="p-3 rounded-xl bg-black/25 backdrop-blur-md border border-white/10 font-mono text-[11px] text-white/80 overflow-x-auto">
                      {endpoint.payload}
                    </pre>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block mb-1">
                      Comando de Teste cURL
                    </span>
                    <pre className="p-3 rounded-xl bg-black/25 backdrop-blur-md border border-white/10 font-mono text-[11px] text-destaque overflow-x-auto">
                      {endpoint.curl}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 3: SETUP STDIO MCP */}
      {abaAtiva === 'setup' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-destaque" />
              Configurando o Servidor MCP Stdio nos Agentes
            </h3>
            <p className="text-xs text-white/70 leading-relaxed font-light">
              O servidor MCP do Client Hunter comunica-se através de stdio (Standard Input / Standard Output) usando a especificação universal do <strong>Model Context Protocol (JSON-RPC 2.0)</strong>. Isso dispensa portas abertas ou autenticações complexas.
            </p>

            {/* Exemplo de Configuração JSON */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-white/60">
                <span>claude_desktop_config.json / mcp.json / Antigravity</span>
                <button
                  type="button"
                  onClick={() => {
                    const cfg = {
                      mcpServers: {
                        'client-hunter': {
                          command: 'node',
                          args: ['/home/ubuntu/apps/client-hunter/mcp/leadpulse-mcp.mjs'],
                          env: { NODE_ENV: 'production' }
                        }
                      }
                    };
                    copiar('setup-json', JSON.stringify(cfg, null, 2));
                  }}
                  className="text-destaque hover:underline cursor-pointer"
                >
                  {copiadoId === 'setup-json' ? 'Copiado!' : 'Copiar Configuração'}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-black/25 backdrop-blur-md border border-white/10 font-mono text-xs text-emerald-300 overflow-x-auto">
{`{
  "mcpServers": {
    "client-hunter": {
      "command": "node",
      "args": [
        "/home/ubuntu/apps/client-hunter/mcp/leadpulse-mcp.mjs"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}`}
              </pre>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                <span className="font-bold text-white block mb-1">Localização no Mac (Antigravity &amp; Claude)</span>
                <code className="text-[11px] font-mono text-destaque block">~/Library/Application Support/Claude/claude_desktop_config.json</code>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                <span className="font-bold text-white block mb-1">Localização no Cursor / Windsurf</span>
                <code className="text-[11px] font-mono text-destaque block">.cursor/mcp.json ou .codeium/windsurf/mcp_config.json</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: PLAYBOOKS EXECUTÁVEIS */}
      {abaAtiva === 'playbooks' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-destaque" />
              Playbooks &amp; SOPs de Execução Autônoma (Para Prompt do Agente)
            </h3>
            <p className="text-xs text-white/70 font-light">
              Sequências operacionais passo-a-passo testadas que o agente deve executar de forma autônoma para gerar receita B2B.
            </p>

            <div className="space-y-4">
              {/* Playbook 1 */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    SOP 01 · FUNIL COMPLETO
                  </span>
                  <span className="text-[11px] text-white/40 font-mono">Lead Scraping → BI → Cold Outreach</span>
                </div>
                <h4 className="text-sm font-bold text-white">Mineração B2B, Qualificação de Decisores &amp; Disparo</h4>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-white/80 font-light">
                  <li>Chame <code className="text-destaque">leadpulse_coletar_leads</code> com canal maps ou linkedin, especificando nicho e praça.</li>
                  <li>Invoque <code className="text-destaque">leadpulse_enriquecer_lote_bi</code> para mapear os tomadores de decisão (Sócios, Diretores) e Tech Stack.</li>
                  <li>Filtre os leads Classe A e sincronize-os para o SendPortal com <code className="text-destaque">leadpulse_sendportal_sincronizar_leads</code>.</li>
                  <li>Crie a campanha com <code className="text-destaque">leadpulse_sendportal_criar_campanha</code> injetando variáveis dinâmicas.</li>
                  <li>Dispare a campanha com <code className="text-destaque">leadpulse_sendportal_disparar_campanha</code> e reporte o total de mensagens enviadas.</li>
                </ol>
              </div>

              {/* Playbook 2 */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    SOP 02 · CONVERSÃO EM WHATSAPP
                  </span>
                  <span className="text-[11px] text-white/40 font-mono">Alta Urgência · Venda de Soluções</span>
                </div>
                <h4 className="text-sm font-bold text-white">Prospecção de Empresas sem Site com Abordagem Celular</h4>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-white/80 font-light">
                  <li>Consulte o CRM via <code className="text-destaque">GET /api/prospeccao/leads?site=sem-site</code> para isolar empresas sem presença digital.</li>
                  <li>Identifique os registros com <code className="text-destaque">whatsapp</code> ou <code className="text-destaque">celular</code> válido.</li>
                  <li>Gere um script personalizado destacando a perda diária de clientes por falta de landing page otimizada.</li>
                  <li>Dispare o e-mail 1-on-1 com <code className="text-destaque">leadpulse_sendportal_enviar_email_rapido</code> ou monte a lista para discagem.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: SYSTEM PROMPT */}
      {abaAtiva === 'prompt' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-destaque" />
                  System Prompt Oficial para Injeção em Agentes
                </h3>
                <p className="text-xs text-white/70 font-light mt-0.5">
                  Copie e cole este prompt na configuração de sistema do seu modelo (Claude, GPT-4o, Gemini 2.0 Pro) para transformá-lo em um SDR autônomo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => copiar('system-prompt', SYSTEM_PROMPT_AGENTE)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-destaque hover:bg-destaque/90 text-white transition-all cursor-pointer shadow-sm"
              >
                {copiadoId === 'system-prompt' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copiar Prompt</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-black/25 backdrop-blur-md border border-white/10 font-mono text-xs text-white/90 whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {SYSTEM_PROMPT_AGENTE}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
