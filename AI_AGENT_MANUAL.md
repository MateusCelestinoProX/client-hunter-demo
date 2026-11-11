# CLIENT HUNTER PRO — MANUAL OPERACIONAL PARA AGENTES DE IA

> Guia de referência rápida e protocolo de execução para Agentes de IA Autônomos (Google Antigravity, Claude Code, Cursor, Codex, LangChain, CrewAI, AutoGen).

---

## 1. Identificação da Plataforma
- **Sistema:** Client Hunter PRO (v2.0.0 Enterprise)
- **Objetivo Primário:** Mineração B2B multi-canal, enriquecimento forense de decisores (LinkedIn/Tech Stack) e cold outreach automatizado com entregabilidade monitorada.
- **Armazenamento:** SQLite 3 local em `data/prospeccao.db` via `better-sqlite3`.
- **Interface Web:** Next.js 16 (App Router) rodando em porta `3333`.
- **Servidor MCP:** `mcp/leadpulse-mcp.mjs` (Stdio, JSON-RPC 2.0).

---

## 2. Como Operar o Sistema

O Agente de IA pode operar o Client Hunter através de 3 camadas distintas:

### Camada 1: Servidor MCP (Recomendado para Pair Programming & Agentes Locais)
Execute o servidor via stdio apontando para `mcp/leadpulse-mcp.mjs`.
Ele expõe 24 ferramentas para automação direta.

Exemplo de chamada para coletar leads:
```json
{
  "name": "leadpulse_coletar_leads",
  "arguments": {
    "canal": "maps",
    "nicho": "energia-solar",
    "praca": "Curitiba PR",
    "limite": 10
  }
}
```

Exemplo para enriquecer tomadores de decisão:
```json
{
  "name": "leadpulse_enriquecer_bi",
  "arguments": {
    "lead_id": "maps:ChIJgUb9cqYEzgARxpt7A...",
    "forcar": false
  }
}
```

### Camada 2: API REST HTTP (Recomendado para N8N, Webhooks e Agentes Remotos)
- `POST /api/prospeccao/captar`: Inicia coleta multi-canal.
- `GET /api/prospeccao/leads`: Consulta CRM de leads filtrados (`?nicho=...&classe=A`).
- `POST /api/prospeccao/enriquecer-bi`: Enriquecimento executivo de lead.
- `POST /api/sendportal/email-rapido`: Disparo 1-on-1 ultra personalizado.
- `POST /api/sendportal/campanhas`: Criação de campanhas de e-mail.
- `POST /api/sendportal/campanhas/disparar`: Disparo em massa.
- `GET /api/ai/spec`: Especificação OpenAPI e schemas JSON de todas as ferramentas.

### Camada 3: CLI & Scripts Node.js (Subprocess / Shell)
- Prospecção rápida: `node prospectar.mjs "nicho" "cidade/uf"`
- Teste do SuperPool: `node -e "import('./lib/superpool.mjs').then(m => m.superpool.status().then(console.log))"`

---

## 3. Catálogo das 24 Ferramentas MCP

1. `leadpulse_coletar_leads`: Mineração multi-canal com gravação idempotente.
2. `leadpulse_buscar_empresas`: Mineração profunda Google Maps (Botasaurus / Apify).
3. `leadpulse_buscar_linkedin`: Empresas e decisores B2B via SERP dorking.
4. `leadpulse_buscar_instagram_leads`: Perfis comerciais com WhatsApp na bio.
5. `leadpulse_buscar_web_leads`: Descoberta web via Exa AI + Firecrawl.
6. `leadpulse_pesquisa_google`: Consulta SERP no Google via pool Apify.
7. `leadpulse_busca_neural_exa`: Busca semântica neural via 9 contas Exa.
8. `leadpulse_raspar_instagram`: Métricas de seguidores e engajamento.
9. `leadpulse_consultar_anuncios`: Auditoria de anúncios ativos no Meta Ad Library.
10. `leadpulse_enriquecer_site`: Extração de contatos, redes e pixels do site.
11. `leadpulse_enriquecer_bi`: Mapeamento de decisores LinkedIn, Tech Stack e Dossiê.
12. `leadpulse_enriquecer_lote_bi`: Enriquecimento de leads pendentes em lote.
13. `leadpulse_consultar_bi_dossier`: Consulta o Dossiê Executivo de abordagem.
14. `leadpulse_buscar_decisores_linkedin`: Busca nominal de diretores/sócios da empresa.
15. `leadpulse_sendportal_sincronizar_leads`: Sincroniza leads qualificados para inscritos.
16. `leadpulse_sendportal_listar_campanhas`: Lista campanhas e métricas.
17. `leadpulse_sendportal_listar_templates`: Lista modelos HTML de e-mail.
18. `leadpulse_sendportal_salvar_template`: Cria ou atualiza template de e-mail.
19. `leadpulse_sendportal_criar_campanha`: Cria campanha de Cold Mail.
20. `leadpulse_sendportal_disparar_campanha`: Disparo monitorado via Resend.
21. `leadpulse_sendportal_enviar_email_rapido`: E-mail pontual ultra personalizado.
22. `leadpulse_sendportal_listar_mensagens`: Logs detalhados de entrega e cliques.
23. `leadpulse_sendportal_feed_atividades`: Telemetria de aberturas em tempo real.
24. `leadpulse_superpool_status`: Status e balanceamento das 58 chaves do pool.

---

## 4. Playbook Canônico de Execução Autônoma

Para executar uma prospecção e conversão completa sem intervenção humana:
1. Extrair leads da região-alvo (`leadpulse_coletar_leads`).
2. Enriquecer os 10 melhores registros com BI (`leadpulse_enriquecer_lote_bi`).
3. Recuperar os dossiês dos leads Classe A (`leadpulse_consultar_bi_dossier`).
4. Sincronizar os contatos para o motor de envio (`leadpulse_sendportal_sincronizar_leads`).
5. Configurar campanha com copy direcionada aos desafios mapeados (`leadpulse_sendportal_criar_campanha`).
6. Disparar a campanha (`leadpulse_sendportal_disparar_campanha`).
7. Monitorar aberturas e cliques (`leadpulse_sendportal_feed_atividades`).

---

## 5. Endpoints de Documentação de Máquina
- **`/llms.txt`**: Resumo estruturado conforme a especificação LLMs.txt.
- **`/llms-full.txt`**: Documento textual exaustivo com todos os schemas para LLMs.
- **`/api/ai/spec`**: Endpoint JSON dinâmico contendo todo o contrato OpenAPI e MCP Tools.
- **`/documentacao/ia`**: Interface visual web do protocolo de agentes com busca e cópia de payloads.
