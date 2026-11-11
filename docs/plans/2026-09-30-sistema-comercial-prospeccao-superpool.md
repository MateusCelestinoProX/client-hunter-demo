# Sistema Comercial de Prospecção & Qualificação B2B com SuperPool Engine
## Plano de Implementação Arquitetural

> **Para o Agente:** Plano de engenharia executável passo a passo com TDD e arquitetura modular, sem alterar nem deletar arquivos da VPS.

**Objetivo:** Transformar o `prospeccao-kit-aluno` em um sistema comercial de escala corporativa rodando 100% localhost, integrado ao SuperPool de IA da VPS (13 contas Apify, 14 Firecrawl, 9 Exa, 8 Resend) e ao motor anti-detect do `google-maps-extractor` para geração e qualificação de leads com custo de coleta zero.

**Arquitetura:**
- **Core de Infraestrutura:** `lib/superpool.mjs` como gateway client resiliente HTTP com fallback automático (`100.99.207.96:5057` -> `127.0.0.1:5057` -> `.env.local`).
- **Motor de Extração Maps Híbrido:** `lib/motores/gmaps.mjs` com suporte a `botasaurus` (motor do repositório privado do usuário), `superpool-apify` (rotação de 13 contas) e `google-places`.
- **Pipeline de Enriquecimento Resiliente:** Enriquecimento de sites com fallback para Firecrawl do SuperPool em sites protegidos por Cloudflare/SPA; enriquecimento de Instagram e Anúncios da Meta via Apify Pool.
- **Camada MCP:** Servidor MCP dedicado (`mcp/leadpulse-mcp.mjs`) permitindo orquestração por agentes e integração direta.
- **Painel Comercial:** Exibição de status do SuperPool e filtros comerciais no dashboard Next.js.

---

### Fase 1: Gateway Client do SuperPool (`lib/superpool.mjs`)
- [ ] **Tarefa 1.1:** Criar teste unitário para conexão e endpoints do SuperPool.
- [ ] **Tarefa 1.2:** Implementar `lib/superpool.mjs` com métodos:
  - `getStats()` (telemetria de chaves);
  - `runApifyActor(actorId, payload, timeout)` (com retry e rotação pelas 13 contas);
  - `apifyGoogleSearch(query, maxResults)`;
  - `firecrawlScrape(url, format)`;
  - `exaSearch(query, numResults)`;
  - `resendEmail(to, subject, html, text)`.
- [ ] **Tarefa 1.3:** Testar integração ao vivo com `100.99.207.96:5057`.

### Fase 2: Motor Google Maps Scraper Nativo (`motores/gmaps/`)
- [ ] **Tarefa 2.1:** Integrar o parser e lógica do `google-maps-extractor` em `motores/gmaps/gmaps_engine.py` e criar interface Node.js em `lib/motores/gmaps.mjs`.
- [ ] **Tarefa 2.2:** Normalizar o formato de saída para o schema do banco (`google_id`, `nome`, `categoria`, `endereco`, `cidade`, `uf`, `telefone_google`, `site`, `avaliacao`, `total_avaliacoes`).
- [ ] **Tarefa 2.3:** Integrar com `lib/places.mjs` permitindo a flag `--motor botasaurus|superpool|google`.

### Fase 3: Roteamento de Enriquecimento com SuperPool
- [ ] **Tarefa 3.1:** Atualizar `lib/site.mjs` para acionar `firecrawlScrape` quando o site retornar erro 403, Cloudflare turnstile ou falha de conexão.
- [ ] **Tarefa 3.2:** Atualizar `lib/instagram.mjs` e `lib/anuncios.mjs` para priorizar a rotação do SuperPool Apify.
- [ ] **Tarefa 3.3:** Atualizar `lib/pesquisa.mjs` com fallback para SuperPool Google Search e Exa.

### Fase 4: Servidor MCP Comercial Dedicado (`mcp/leadpulse-mcp.mjs`)
- [ ] **Tarefa 4.1:** Criar especificação de ferramentas MCP:
  - `leadpulse_buscar`: busca de empresas com seleção de motor;
  - `leadpulse_enriquecer`: enriquecimento multicamadas;
  - `leadpulse_superpool_status`: consulta cotas e contas ativas;
  - `leadpulse_listar`: consulta e filtros de leads qualificados.
- [ ] **Tarefa 4.2:** Implementar o servidor MCP compatível com protocolo JSON-RPC stdio.

### Fase 5: Atualização do Painel Web Next.js
- [ ] **Tarefa 5.1:** Adicionar widget de status do SuperPool na barra superior do painel.
- [ ] **Tarefa 5.2:** Suporte a exibição de dados ricos do SuperPool (Markdown do Firecrawl, anúncios e sócios da Receita Federal).
- [ ] **Tarefa 5.3:** Validar compilação e execução local.

### Fase 6: Validação Final e Documentação
- [ ] **Tarefa 6.1:** Executar suite de testes ponta a ponta.
- [ ] **Tarefa 6.2:** Atualizar mapa Graphify (`graphify update .`).
- [ ] **Tarefa 6.3:** Gerar documentação comercial e manual de uso do novo ecossistema.
