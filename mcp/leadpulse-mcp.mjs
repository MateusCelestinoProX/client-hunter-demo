#!/usr/bin/env node
/**
 * Client Hunter — Servidor MCP Comercial Dedicado
 * Permite que agentes (Google Antigravity, Claude Code, Cursor, Codex) executem
 * prospecção B2B com Google Maps Scraper + SendPortal Cold Outreach Suite.
 */

import readline from 'node:readline';
import { superpool } from '../lib/superpool.mjs';
import { buscar, motorBusca } from '../lib/places.mjs';
import { enriquecerSite } from '../lib/site.mjs';
import { consultarPerfis, resumirPerfil } from '../lib/instagram.mjs';
import { buscarAnuncios, resumirAnuncios } from '../lib/anuncios.mjs';
import { coletarLeads, CANAIS_DISPONIVEIS } from '../lib/coleta.mjs';
import { buscarLinkedIn } from '../motores/linkedin/linkedin_scraper.mjs';
import { buscarInstagram } from '../motores/instagram/instagram_lead_scraper.mjs';
import { buscarWeb } from '../motores/web/web_scraper.mjs';
import {
  listarTemplates,
  salvarTemplate,
  listarCampanhas,
  obterCampanha,
  criarCampanha,
  dispararCampanha,
  sincronizarLeadsParaInscritos,
  listarMensagens,
  listarEventosRecentes,
  enviarEmailRapidoParaLead
} from '../lib/sendportal/index.mjs';
import { enriquecerLeadComBI, buscarDecisoresLinkedIn, detectarTechStack } from '../lib/bi_enrichment.mjs';
import { getLocalDb } from '../lib/local_db.mjs';

function jsonParseSafe(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function sendJsonRpc(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}

const TOOLS = [
  {
    name: 'leadpulse_coletar_leads',
    description: 'Orquestra a coleta multi-canal de leads (Google Maps, LinkedIn, Instagram, Web B2B) com gravação idempotente.',
    inputSchema: {
      type: 'object',
      properties: {
        canal: {
          type: 'string',
          enum: ['maps', 'linkedin', 'instagram', 'web'],
          description: 'Canal de captação',
          default: 'maps',
        },
        nicho: {
          type: 'string',
          description: 'Nicho comercial (ex: energia-solar, clinicas-odontologicas)',
        },
        praca: {
          type: 'string',
          description: 'Cidade/Estado alvo (ex: Curitiba PR)',
        },
        limite: {
          type: 'number',
          description: 'Meta de leads a coletar',
          default: 10,
        },
      },
      required: ['nicho', 'praca'],
    },
  },
  {
    name: 'leadpulse_buscar_linkedin',
    description: 'Capta empresas B2B e tomadores de decisão (CEOs, Diretores, Sócios) no LinkedIn via SuperPool.',
    inputSchema: {
      type: 'object',
      properties: {
        nicho: { type: 'string', description: 'Nicho comercial' },
        praca: { type: 'string', description: 'Praça/Cidade' },
        limite: { type: 'number', description: 'Limite de leads', default: 10 },
        tipo: { type: 'string', enum: ['empresas', 'decisores', 'ambos'], default: 'empresas' },
      },
      required: ['nicho', 'praca'],
    },
  },
  {
    name: 'leadpulse_buscar_instagram_leads',
    description: 'Capta perfis comerciais no Instagram com WhatsApp na bio, e-mail e contagem de seguidores.',
    inputSchema: {
      type: 'object',
      properties: {
        nicho: { type: 'string', description: 'Nicho comercial' },
        praca: { type: 'string', description: 'Praça/Cidade' },
        limite: { type: 'number', description: 'Limite de leads', default: 10 },
      },
      required: ['nicho', 'praca'],
    },
  },
  {
    name: 'leadpulse_buscar_web_leads',
    description: 'Procura portais e sites corporativos B2B na web combinando SERP, Exa Neural Search e Firecrawl.',
    inputSchema: {
      type: 'object',
      properties: {
        nicho: { type: 'string', description: 'Nicho comercial' },
        praca: { type: 'string', description: 'Praça/Cidade' },
        limite: { type: 'number', description: 'Limite de leads', default: 10 },
      },
      required: ['nicho', 'praca'],
    },
  },
  {
    name: 'leadpulse_superpool_status',
    description: 'Consulta a telemetria, quotas e chaves ativas do Super Pool (Apify, Firecrawl, Exa, Resend).',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'leadpulse_buscar_empresas',
    description: 'Busca empresas no Google Maps usando Botasaurus nativo (R$ 0), SuperPool Apify (13 contas) ou Google Places.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Termo de busca com praça (ex: "energia solar no Rio de Janeiro RJ")',
        },
        limite: {
          type: 'number',
          description: 'Quantidade máxima de empresas a retornar (padrão: 10)',
          default: 10,
        },
        motor: {
          type: 'string',
          enum: ['botasaurus', 'superpool', 'google', 'apify'],
          description: 'Motor de busca do Maps desejado',
          default: 'superpool',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'leadpulse_enriquecer_site',
    description: 'Audita e extrai contatos (WhatsApp, e-mails, redes sociais, pixel de marketing) do site com fallback para Firecrawl.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL do site da empresa a enriquecer',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'leadpulse_pesquisa_google',
    description: 'Executa busca na web tipo SERP via pool rotativo do Apify ou Google CSE.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Termo de busca no Google',
        },
        maxResults: {
          type: 'number',
          description: 'Quantidade de resultados (padrão: 10)',
          default: 10,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'leadpulse_raspar_instagram',
    description: 'Raspa métricas, número de seguidores, posts e engajamento do perfil no Instagram usando o pool de 13 contas Apify.',
    inputSchema: {
      type: 'object',
      properties: {
        usernames: {
          type: 'array',
          items: { type: 'string' },
          description: 'Lista de nomes de usuário do Instagram (sem @)',
        },
      },
      required: ['usernames'],
    },
  },
  {
    name: 'leadpulse_consultar_anuncios',
    description: 'Verifica se a empresa possui anúncios ativos na Biblioteca de Anúncios da Meta via Apify Pool.',
    inputSchema: {
      type: 'object',
      properties: {
        nomes_empresas: {
          type: 'array',
          items: { type: 'string' },
          description: 'Lista de nomes limpos das empresas para consultar anúncios',
        },
      },
      required: ['nomes_empresas'],
    },
  },
  {
    name: 'leadpulse_busca_neural_exa',
    description: 'Busca semântica neural via 9 contas Exa AI para mapear concorrentes, fornecedores ou dados corporativos.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Consulta conceitual ou descritiva',
        },
        numResults: {
          type: 'number',
          description: 'Número de resultados desejados (padrão: 5)',
          default: 5,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'leadpulse_sendportal_sincronizar_leads',
    description: 'Sincroniza leads enriquecidos captados pelo Client Hunter para a base de contatos do SendPortal com tags automáticas.',
    inputSchema: {
      type: 'object',
      properties: {
        nicho: { type: 'string', description: 'Filtrar por nicho (opcional)' },
        classe: { type: 'string', description: 'Filtrar por classe (A, B, C, D) (opcional)' },
        canal: { type: 'string', description: 'Filtrar por canal de origem (maps, linkedin, instagram, web) (opcional)' },
      },
    },
  },
  {
    name: 'leadpulse_sendportal_listar_campanhas',
    description: 'Lista todas as campanhas de e-mail marketing, status de envio e métricas (aberturas, cliques).',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'leadpulse_sendportal_listar_templates',
    description: 'Lista todos os modelos de e-mail disponíveis com suas variáveis dinâmicas.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'leadpulse_sendportal_criar_campanha',
    description: 'Cria uma nova campanha de e-mail marketing no SendPortal.',
    inputSchema: {
      type: 'object',
      properties: {
        nome: { type: 'string', description: 'Nome identificador da campanha' },
        assunto: { type: 'string', description: 'Assunto do e-mail com suporte a variáveis como {{company}}' },
        template_id: { type: 'string', description: 'ID do modelo/template a utilizar' },
        tag_alvo: { type: 'string', description: 'Tag alvo dos contatos (opcional)' },
        leads_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Lista de IDs específicos de leads captados para direcionar a campanha (opcional)',
        },
        remetente_nome: { type: 'string', description: 'Nome do remetente (padrão: Client Hunter Outreach)' },
        remetente_email: { type: 'string', description: 'E-mail do remetente (padrão: prospeccao@resend.dev)' },
      },
      required: ['nome', 'assunto'],
    },
  },
  {
    name: 'leadpulse_sendportal_disparar_campanha',
    description: 'Dispara uma campanha de e-mail marketing para os contatos segmentados via SuperPool Resend com rastreamento.',
    inputSchema: {
      type: 'object',
      properties: {
        campanha_id: { type: 'string', description: 'ID da campanha a disparar' },
        teste_email: { type: 'string', description: 'Se informado, envia apenas um e-mail de teste para este endereço' },
      },
      required: ['campanha_id'],
    },
  },
  {
    name: 'leadpulse_sendportal_enviar_email_rapido',
    description: 'Dispara um e-mail comercial personalizado direto e imediato para um lead captado pelo Client Hunter via SuperPool Resend.',
    inputSchema: {
      type: 'object',
      properties: {
        lead_id: { type: 'string', description: 'ID do lead no banco (ex: maps:..., linkedin:..., web:...)' },
        email: { type: 'string', description: 'E-mail do destinatário (opcional se lead_id for fornecido)' },
        assunto: { type: 'string', description: 'Assunto personalizado do e-mail (opcional, usa template se omitido)' },
        template_id: { type: 'string', description: 'ID do template a usar (padrão: tpl_cold_outreach_b2b)', default: 'tpl_cold_outreach_b2b' },
        conteudo_html: { type: 'string', description: 'HTML customizado para envio direto (opcional)' },
      },
    },
  },
  {
    name: 'leadpulse_sendportal_listar_mensagens',
    description: 'Consulta o log detalhado de mensagens individuais disparadas (status, aberturas, cliques e eventuais falhas).',
    inputSchema: {
      type: 'object',
      properties: {
        campanha_id: { type: 'string', description: 'Filtrar por campanha (opcional)' },
        status: { type: 'string', description: 'Filtrar por status: pendente, enviado, aberto, clicado, falhou (opcional)' },
        limite: { type: 'number', description: 'Limite de mensagens a listar', default: 20 },
      },
    },
  },
  {
    name: 'leadpulse_sendportal_feed_atividades',
    description: 'Retorna os eventos analíticos mais recentes em tempo real (quem abriu o e-mail, quem clicou no link e horários).',
    inputSchema: {
      type: 'object',
      properties: {
        limite: { type: 'number', description: 'Quantidade de eventos recentes', default: 20 },
      },
    },
  },
  {
    name: 'leadpulse_sendportal_salvar_template',
    description: 'Cria ou atualiza um modelo (template) de e-mail no SendPortal com suporte a variáveis dinâmicas.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ID único do template (opcional para criação)' },
        nome: { type: 'string', description: 'Nome descritivo do modelo' },
        assunto_padrao: { type: 'string', description: 'Assunto padrão do e-mail' },
        conteudo_html: { type: 'string', description: 'Conteúdo em HTML com variáveis como {{first_name}}, {{company}}' },
        conteudo_texto: { type: 'string', description: 'Versão em texto puro (opcional)' },
      },
      required: ['nome', 'conteudo_html'],
    },
  },
  {
    name: 'leadpulse_enriquecer_bi',
    description: 'Executa a Etapa 2 de Business Intelligence para um lead: descobre tomadores de decisão no LinkedIn via Apify SERP Dorking, detecta Tech Stack completo (CMS, CRM, Pixels), valida servidores MX corporativos e gera Dossiê Executivo de abordagem B2B.',
    inputSchema: {
      type: 'object',
      properties: {
        lead_id: { type: 'string', description: 'ID do lead a enriquecer com Business Intelligence (ex: web:..., maps:...)' },
        forcar: { type: 'boolean', description: 'Forçar reprocessamento mesmo se já enriquecido anteriormente (padrão: false)' },
      },
      required: ['lead_id'],
    },
  },
  {
    name: 'leadpulse_enriquecer_lote_bi',
    description: 'Enriquece uma lista de leads pendentes com Business Intelligence em lote, filtrados opcionalmente por nicho.',
    inputSchema: {
      type: 'object',
      properties: {
        nicho: { type: 'string', description: 'Nicho específico para filtrar (ex: energia-solar, clinicas, etc.)' },
        limite: { type: 'number', description: 'Quantidade máxima de leads a processar (padrão: 5)' },
        forcar: { type: 'boolean', description: 'Forçar reprocessamento de leads já enriquecidos' },
      },
    },
  },
  {
    name: 'leadpulse_consultar_bi_dossier',
    description: 'Consulta o Dossiê Executivo de Business Intelligence, maturidade digital, lista de decisores mapeados e Tech Stack de um lead.',
    inputSchema: {
      type: 'object',
      properties: {
        lead_id: { type: 'string', description: 'ID do lead a consultar' },
      },
      required: ['lead_id'],
    },
  },
  {
    name: 'leadpulse_buscar_decisores_linkedin',
    description: 'Busca tomadores de decisão (Sócios, CEOs, Diretores) no LinkedIn para qualquer empresa via Apify Google Search Dorking.',
    inputSchema: {
      type: 'object',
      properties: {
        empresa: { type: 'string', description: 'Nome da empresa alvo' },
        praca: { type: 'string', description: 'Cidade ou estado (opcional)' },
      },
      required: ['empresa'],
    },
  },
];

const rl = readline.createInterface({ input: process.stdin });

rl.on('line', async (line) => {
  line = line.trim();
  if (!line.startsWith('{')) return;
  const msg = jsonParseSafe(line);
  if (!msg) return;

  const { id, method, params } = msg;

  if (method === 'initialize') {
    sendJsonRpc({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: { listChanged: true } },
        serverInfo: {
          name: 'leadpulse-pro-mcp',
          version: '1.0.0',
        },
      },
    });
    return;
  }

  if (method === 'notifications/initialized') return;

  if (method === 'tools/list') {
    sendJsonRpc({
      jsonrpc: '2.0',
      id,
      result: { tools: TOOLS },
    });
    return;
  }

  if (method === 'tools/call') {
    const toolName = params?.name;
    const args = params?.arguments || {};

    try {
      if (toolName === 'leadpulse_coletar_leads') {
        const resultado = await coletarLeads({
          canal: args.canal || 'maps',
          nicho: args.nicho,
          praca: args.praca,
          limite: args.limite || 10,
        });
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(resultado, null, 2) }] },
        });
        return;
      }

      if (toolName === 'leadpulse_buscar_linkedin') {
        const leads = await buscarLinkedIn({
          nicho: args.nicho,
          praca: args.praca,
          limite: args.limite || 10,
          tipo: args.tipo || 'empresas',
        });
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(leads, null, 2) }] },
        });
        return;
      }

      if (toolName === 'leadpulse_buscar_instagram_leads') {
        const leads = await buscarInstagram({
          nicho: args.nicho,
          praca: args.praca,
          limite: args.limite || 10,
        });
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(leads, null, 2) }] },
        });
        return;
      }

      if (toolName === 'leadpulse_buscar_web_leads') {
        const leads = await buscarWeb({
          nicho: args.nicho,
          praca: args.praca,
          limite: args.limite || 10,
        });
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(leads, null, 2) }] },
        });
        return;
      }

      if (toolName === 'leadpulse_superpool_status') {
        const stats = await superpool.getStats();
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(stats, null, 2) }] },
        });
        return;
      }

      if (toolName === 'leadpulse_buscar_empresas') {
        const lugares = await buscar(args.query, {
          maxPaginas: Math.ceil((args.limite || 10) / 20),
          maximo: args.limite || 10,
          motor: args.motor || 'superpool',
        });
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(lugares, null, 2) }] },
        });
        return;
      }

      if (toolName === 'leadpulse_enriquecer_site') {
        const info = await enriquecerSite(args.url);
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] },
        });
        return;
      }

      if (toolName === 'leadpulse_pesquisa_google') {
        const res = await superpool.apifyGoogleSearch(args.query, args.maxResults || 10);
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] },
        });
        return;
      }

      if (toolName === 'leadpulse_raspar_instagram') {
        const perfisCrus = await consultarPerfis(args.usernames || []);
        const resumidos = perfisCrus.map((p) => resumirPerfil(p));
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(resumidos, null, 2) }] },
        });
        return;
      }

      if (toolName === 'leadpulse_consultar_anuncios') {
        const crus = await buscarAnuncios(args.nomes_empresas || []);
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(crus, null, 2) }] },
        });
        return;
      }

      if (toolName === 'leadpulse_busca_neural_exa') {
        const res = await superpool.exaSearch(args.query, args.numResults || 5);
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] },
        });
        return;
      }

      if (toolName === 'leadpulse_sendportal_sincronizar_leads') {
        const res = sincronizarLeadsParaInscritos(args);
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] },
        });
        return;
      }

      if (toolName === 'leadpulse_sendportal_listar_campanhas') {
        const res = listarCampanhas();
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] },
        });
        return;
      }

      if (toolName === 'leadpulse_sendportal_listar_templates') {
        const res = listarTemplates();
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] },
        });
        return;
      }

      if (toolName === 'leadpulse_sendportal_criar_campanha') {
        const res = criarCampanha(args);
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] },
        });
        return;
      }

      if (toolName === 'leadpulse_sendportal_disparar_campanha') {
        const res = await dispararCampanha(args.campanha_id, {
          testeEmail: args.teste_email || null,
        });
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] },
        });
        return;
      }

      if (toolName === 'leadpulse_sendportal_enviar_email_rapido') {
        const res = await enviarEmailRapidoParaLead(args);
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] },
        });
        return;
      }

      if (toolName === 'leadpulse_sendportal_listar_mensagens') {
        const res = listarMensagens(args);
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] },
        });
        return;
      }

      if (toolName === 'leadpulse_sendportal_feed_atividades') {
        const res = listarEventosRecentes(args.limite || 20);
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] },
        });
        return;
      }

      if (toolName === 'leadpulse_sendportal_salvar_template') {
        const res = salvarTemplate(args);
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] },
        });
        return;
      }

      if (toolName === 'leadpulse_enriquecer_bi') {
        const res = await enriquecerLeadComBI(args.lead_id, { forcar: args.forcar });
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] },
        });
        return;
      }

      if (toolName === 'leadpulse_enriquecer_lote_bi') {
        const limite = args.limite || 5;
        const forcar = Boolean(args.forcar);
        const db = getLocalDb();

        let sql = "SELECT id FROM leads WHERE 1=1";
        const params = [];
        if (args.nicho) {
          sql += " AND nicho = ?";
          params.push(args.nicho);
        }
        if (!forcar) {
          sql += " AND bi_enriquecido_em IS NULL";
        }
        sql += " ORDER BY score DESC LIMIT ?";
        params.push(limite);

        const rows = db.prepare(sql).all(...params);
        const resultados = [];
        for (const r of rows) {
          try {
            const res = await enriquecerLeadComBI(r.id, { forcar });
            resultados.push({ id: r.id, sucesso: true, lead: res });
          } catch (err) {
            resultados.push({ id: r.id, sucesso: false, erro: err.message });
          }
        }

        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify({ processados: resultados.length, resultados }, null, 2) }] },
        });
        return;
      }

      if (toolName === 'leadpulse_consultar_bi_dossier') {
        const db = getLocalDb();
        const row = db.prepare('SELECT id, nome, bi_dossier, tech_stack, decisores, emails, whatsapp, celular, linkedin, instagram, bi_enriquecido_em FROM leads WHERE id = ?').get(args.lead_id);
        if (!row) throw new Error(`Lead ${args.lead_id} não encontrado.`);
        const dados = {
          id: row.id,
          nome: row.nome,
          bi_dossier: row.bi_dossier ? JSON.parse(row.bi_dossier) : null,
          tech_stack: row.tech_stack ? JSON.parse(row.tech_stack) : [],
          decisores: row.decisores ? JSON.parse(row.decisores) : [],
          emails: row.emails ? JSON.parse(row.emails) : [],
          whatsapp: row.whatsapp,
          celular: row.celular,
          linkedin: row.linkedin,
          instagram: row.instagram,
          bi_enriquecido_em: row.bi_enriquecido_em,
        };
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(dados, null, 2) }] },
        });
        return;
      }

      if (toolName === 'leadpulse_buscar_decisores_linkedin') {
        const res = await buscarDecisoresLinkedIn(args.empresa, args.praca || '');
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] },
        });
        return;
      }

      sendJsonRpc({
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Ferramenta desconhecida: ${toolName}` },
      });
    } catch (err) {
      sendJsonRpc({
        jsonrpc: '2.0',
        id,
        error: { code: -32000, message: err.message },
      });
    }
  }
});
