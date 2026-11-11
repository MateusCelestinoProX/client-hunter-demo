import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const mcpTools = [
    {
      name: 'leadpulse_coletar_leads',
      description: 'Orquestra a coleta multi-canal de leads (Google Maps, LinkedIn, Instagram, Web B2B) com gravação idempotente no SQLite.',
      parameters: {
        canal: { type: 'string', enum: ['maps', 'linkedin', 'instagram', 'web'], default: 'maps', description: 'Canal de captação' },
        nicho: { type: 'string', required: true, description: 'Nicho comercial (ex: energia-solar, clinicas-odontologicas)' },
        praca: { type: 'string', required: true, description: 'Cidade/Estado alvo (ex: Curitiba PR)' },
        limite: { type: 'number', default: 10, description: 'Meta de leads a coletar' }
      }
    },
    {
      name: 'leadpulse_buscar_linkedin',
      description: 'Capta empresas B2B e tomadores de decisão (CEOs, Diretores, Sócios) no LinkedIn via SuperPool.',
      parameters: {
        nicho: { type: 'string', required: true, description: 'Nicho comercial' },
        praca: { type: 'string', required: true, description: 'Praça/Cidade' },
        limite: { type: 'number', default: 10, description: 'Limite de leads' },
        tipo: { type: 'string', enum: ['empresas', 'decisores', 'ambos'], default: 'empresas' }
      }
    },
    {
      name: 'leadpulse_buscar_instagram_leads',
      description: 'Capta perfis comerciais no Instagram com WhatsApp na bio, e-mail e contagem de seguidores.',
      parameters: {
        nicho: { type: 'string', required: true, description: 'Nicho comercial' },
        praca: { type: 'string', required: true, description: 'Praça/Cidade' },
        limite: { type: 'number', default: 10, description: 'Limite de leads' }
      }
    },
    {
      name: 'leadpulse_buscar_web_leads',
      description: 'Procura portais e sites corporativos B2B na web combinando SERP, Exa Neural Search e Firecrawl.',
      parameters: {
        nicho: { type: 'string', required: true, description: 'Nicho comercial' },
        praca: { type: 'string', required: true, description: 'Praça/Cidade' },
        limite: { type: 'number', default: 10, description: 'Limite de leads' }
      }
    },
    {
      name: 'leadpulse_superpool_status',
      description: 'Consulta a telemetria, quotas e chaves ativas do Super Pool (Apify 13 contas, Exa 9 contas, Firecrawl, Resend).',
      parameters: {}
    },
    {
      name: 'leadpulse_buscar_empresas',
      description: 'Busca empresas no Google Maps usando Botasaurus nativo (R$ 0), SuperPool Apify ou Google Places.',
      parameters: {
        query: { type: 'string', required: true, description: 'Termo de busca com praça (ex: "energia solar no Rio de Janeiro RJ")' },
        limite: { type: 'number', default: 10, description: 'Quantidade máxima de empresas a retornar' },
        motor: { type: 'string', enum: ['botasaurus', 'superpool', 'google', 'apify'], default: 'superpool' }
      }
    },
    {
      name: 'leadpulse_enriquecer_site',
      description: 'Audita e extrai contatos (WhatsApp, e-mails, redes sociais, pixel de marketing) do site com fallback para Firecrawl.',
      parameters: {
        url: { type: 'string', required: true, description: 'URL do site da empresa a enriquecer' }
      }
    },
    {
      name: 'leadpulse_pesquisa_google',
      description: 'Executa busca na web tipo SERP via pool rotativo do Apify ou Google CSE.',
      parameters: {
        query: { type: 'string', required: true, description: 'Termo de busca no Google' },
        maxResults: { type: 'number', default: 10, description: 'Quantidade de resultados' }
      }
    },
    {
      name: 'leadpulse_raspar_instagram',
      description: 'Raspa métricas, número de seguidores, posts e engajamento do perfil no Instagram usando o pool de 13 contas Apify.',
      parameters: {
        usernames: { type: 'array', items: 'string', required: true, description: 'Lista de nomes de usuário do Instagram (sem @)' }
      }
    },
    {
      name: 'leadpulse_consultar_anuncios',
      description: 'Verifica se a empresa possui anúncios ativos na Biblioteca de Anúncios da Meta via Apify Pool.',
      parameters: {
        nomes_empresas: { type: 'array', items: 'string', required: true, description: 'Lista de nomes limpos das empresas' }
      }
    },
    {
      name: 'leadpulse_busca_neural_exa',
      description: 'Busca semântica neural via 9 contas Exa AI para mapear concorrentes, fornecedores ou dados corporativos.',
      parameters: {
        query: { type: 'string', required: true, description: 'Consulta conceitual ou descritiva' },
        numResults: { type: 'number', default: 5, description: 'Número de resultados desejados' }
      }
    },
    {
      name: 'leadpulse_sendportal_sincronizar_leads',
      description: 'Sincroniza leads enriquecidos captados pelo Client Hunter para a base de contatos do SendPortal com tags automáticas.',
      parameters: {
        nicho: { type: 'string', description: 'Filtrar por nicho (opcional)' },
        classe: { type: 'string', description: 'Filtrar por classe (A, B, C, D) (opcional)' },
        canal: { type: 'string', description: 'Filtrar por canal de origem (maps, linkedin, instagram, web) (opcional)' }
      }
    },
    {
      name: 'leadpulse_sendportal_listar_campanhas',
      description: 'Lista todas as campanhas de e-mail marketing, status de envio e métricas (aberturas, cliques).',
      parameters: {}
    },
    {
      name: 'leadpulse_sendportal_listar_templates',
      description: 'Lista todos os modelos de e-mail disponíveis com suas variáveis dinâmicas.',
      parameters: {}
    },
    {
      name: 'leadpulse_sendportal_criar_campanha',
      description: 'Cria uma nova campanha de e-mail marketing no SendPortal.',
      parameters: {
        nome: { type: 'string', required: true, description: 'Nome identificador da campanha' },
        assunto: { type: 'string', required: true, description: 'Assunto do e-mail com variáveis como {{company}}' },
        template_id: { type: 'string', description: 'ID do modelo/template a utilizar' },
        tag_alvo: { type: 'string', description: 'Tag alvo dos contatos (opcional)' },
        leads_ids: { type: 'array', items: 'string', description: 'Lista de IDs específicos de leads' },
        remetente_nome: { type: 'string', default: 'Client Hunter Outreach' },
        remetente_email: { type: 'string', default: 'prospeccao@resend.dev' }
      }
    },
    {
      name: 'leadpulse_sendportal_disparar_campanha',
      description: 'Dispara uma campanha de e-mail marketing para os contatos segmentados via SuperPool Resend com rastreamento.',
      parameters: {
        campanha_id: { type: 'string', required: true, description: 'ID da campanha a disparar' },
        teste_email: { type: 'string', description: 'E-mail de teste único (opcional)' }
      }
    },
    {
      name: 'leadpulse_sendportal_enviar_email_rapido',
      description: 'Dispara um e-mail comercial personalizado direto e imediato para um lead captado pelo Client Hunter via SuperPool Resend.',
      parameters: {
        lead_id: { type: 'string', description: 'ID do lead no banco (ex: maps:..., linkedin:..., web:...)' },
        email: { type: 'string', description: 'E-mail do destinatário (opcional se lead_id informado)' },
        assunto: { type: 'string', description: 'Assunto personalizado do e-mail' },
        template_id: { type: 'string', default: 'tpl_cold_outreach_b2b', description: 'ID do template a usar' },
        conteudo_html: { type: 'string', description: 'HTML customizado para envio direto' }
      }
    },
    {
      name: 'leadpulse_sendportal_listar_mensagens',
      description: 'Consulta o log detalhado de mensagens individuais disparadas (status, aberturas, cliques e eventuais falhas).',
      parameters: {
        campanha_id: { type: 'string', description: 'Filtrar por campanha (opcional)' },
        status: { type: 'string', enum: ['pendente', 'enviado', 'aberto', 'clicado', 'falhou'] },
        limite: { type: 'number', default: 20 }
      }
    },
    {
      name: 'leadpulse_sendportal_feed_atividades',
      description: 'Retorna os eventos analíticos mais recentes em tempo real (quem abriu o e-mail, quem clicou no link e horários).',
      parameters: {
        limite: { type: 'number', default: 20 }
      }
    },
    {
      name: 'leadpulse_sendportal_salvar_template',
      description: 'Cria ou atualiza um modelo (template) de e-mail no SendPortal com variáveis dinâmicas.',
      parameters: {
        id: { type: 'string', description: 'ID único do template (opcional para criação)' },
        nome: { type: 'string', required: true, description: 'Nome descritivo do modelo' },
        assunto_padrao: { type: 'string', description: 'Assunto padrão' },
        conteudo_html: { type: 'string', required: true, description: 'Conteúdo em HTML com variáveis' },
        conteudo_texto: { type: 'string', description: 'Versão texto puro' }
      }
    },
    {
      name: 'leadpulse_enriquecer_bi',
      description: 'Executa a Etapa 2 de Business Intelligence para um lead: descobre tomadores de decisão no LinkedIn via Apify SERP Dorking, detecta Tech Stack completo (CMS, CRM, Pixels), valida servidores MX corporativos e gera Dossiê Executivo de abordagem B2B.',
      parameters: {
        lead_id: { type: 'string', required: true, description: 'ID do lead a enriquecer com BI' },
        forcar: { type: 'boolean', default: false, description: 'Forçar reprocessamento' }
      }
    },
    {
      name: 'leadpulse_enriquecer_lote_bi',
      description: 'Enriquece uma lista de leads pendentes com Business Intelligence em lote, filtrados opcionalmente por nicho.',
      parameters: {
        nicho: { type: 'string', description: 'Nicho específico para filtrar' },
        limite: { type: 'number', default: 5, description: 'Quantidade máxima de leads a processar' },
        forcar: { type: 'boolean', default: false }
      }
    },
    {
      name: 'leadpulse_consultar_bi_dossier',
      description: 'Consulta o Dossiê Executivo de Business Intelligence, maturidade digital, lista de decisores mapeados e Tech Stack de um lead.',
      parameters: {
        lead_id: { type: 'string', required: true, description: 'ID do lead a consultar' }
      }
    },
    {
      name: 'leadpulse_buscar_decisores_linkedin',
      description: 'Busca tomadores de decisão (Sócios, CEOs, Diretores) no LinkedIn para qualquer empresa via Apify Google Search Dorking.',
      parameters: {
        empresa: { type: 'string', required: true, description: 'Nome da empresa alvo' },
        praca: { type: 'string', description: 'Cidade ou estado (opcional)' }
      }
    }
  ];

  const restEndpoints = [
    {
      path: '/api/prospeccao/captar',
      method: 'POST',
      description: 'Dispara a mineração e coleta autônoma multi-canal.',
      payload: {
        canal: 'maps | linkedin | instagram | web',
        nicho: 'string (ex: energia-solar)',
        praca: 'string (ex: Curitiba PR)',
        limite: 'number (ex: 10)',
        enriquecer: 'boolean (default: true)',
        sincronizarSendportal: 'boolean (default: true)',
        motorMaps: 'superpool | botasaurus | google | apify'
      }
    },
    {
      path: '/api/prospeccao/leads',
      method: 'GET',
      description: 'Consulta o banco CRM de leads qualificados com filtros e scores.',
      queryParams: ['nicho', 'classe', 'canal', 'site', 'busca', 'id', 'resumo']
    },
    {
      path: '/api/prospeccao/enriquecer-bi',
      method: 'POST',
      description: 'Executa enriquecimento de BI (Tech Stack + Decisores LinkedIn + Dossiê).',
      payload: {
        lead_id: 'string (opcional para unitário)',
        lead_ids: 'string[] (opcional para lista)',
        nicho: 'string (opcional para lote)',
        limite: 'number (default: 5)',
        forcar: 'boolean (default: false)'
      }
    },
    {
      path: '/api/sendportal/campanhas',
      method: 'GET | POST',
      description: 'Lista ou cria novas campanhas de Cold Mail.',
      postPayload: {
        nome: 'string',
        assunto: 'string',
        template_id: 'string',
        tag_alvo: 'string',
        remetente_nome: 'string',
        remetente_email: 'string'
      }
    },
    {
      path: '/api/sendportal/campanhas/disparar',
      method: 'POST',
      description: 'Dispara uma campanha criada via SuperPool Resend.',
      payload: {
        campanha_id: 'string',
        teste_email: 'string (opcional)'
      }
    },
    {
      path: '/api/sendportal/email-rapido',
      method: 'POST',
      description: 'Envia um e-mail 1-on-1 ultra personalizado imediato para um lead.',
      payload: {
        lead_id: 'string',
        email: 'string (opcional se lead_id fornecido)',
        assunto: 'string',
        template_id: 'string',
        conteudo_html: 'string (opcional)'
      }
    },
    {
      path: '/api/sendportal/sync',
      method: 'POST',
      description: 'Sincroniza leads qualificados para a base de contatos do SendPortal.',
      payload: {
        nicho: 'string (opcional)',
        classe: 'string (opcional)',
        canal: 'string (opcional)'
      }
    },
    {
      path: '/api/pool/resources',
      method: 'GET',
      description: 'Telemetria do SuperPool (status das 58 API keys, quotas e latência).'
    }
  ];

  return NextResponse.json({
    platform: 'Client Hunter PRO',
    version: '2.0.0',
    description: 'Protocolo de Automação para Agentes de IA Autônomos (MCP, REST API e CLI).',
    protocol_version: '2024-11-05',
    mcp_server: {
      runtime: 'node',
      entrypoint: 'mcp/leadpulse-mcp.mjs',
      transport: 'stdio (JSON-RPC 2.0)',
      total_tools: mcpTools.length,
      tools: mcpTools
    },
    rest_endpoints: restEndpoints,
    database: {
      engine: 'SQLite 3 via better-sqlite3',
      file: 'data/prospeccao.db',
      primary_tables: ['leads', 'campanhas', 'templates', 'mensagens', 'inscritos', 'superpool_quota']
    },
    autonomous_capabilities: [
      'Multi-channel Scraping (Google Maps Botasaurus R$0 + Apify Pool 13 contas)',
      'Neural Search (Exa AI 9 contas) & Deep Site Extraction (Firecrawl)',
      'LinkedIn Executive Profiling & Deciders Search',
      'Meta Ad Library Intelligence',
      'Cold Outreach Engine (Resend SuperPool + SendPortal Webhooks & Tracking)'
    ]
  }, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    }
  });
}
