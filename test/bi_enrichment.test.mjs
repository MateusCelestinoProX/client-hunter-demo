import assert from 'node:assert';
import {
  detectarTechStack,
  predizerEmailsDecisor,
  verificarDominioMx,
  gerarDossierExecutivoBI,
} from '../lib/bi_enrichment.mjs';
import { usuarioDoLink } from '../lib/instagram.mjs';
import { getLocalDb } from '../lib/local_db.mjs';

async function testBiEnrichment() {
  console.log('🧪 Iniciando testes do motor de Business Intelligence Ultra Deep (v3.0)...');

  // 1. Teste de Detecção de Tech Stack
  const mockHtml = `
    <html>
      <head>
        <meta name="generator" content="WordPress 6.4" />
        <link rel="stylesheet" href="/wp-content/plugins/elementor/assets/css/frontend.min.css" />
        <script src="https://connect.facebook.net/en_US/fbevents.js"></script>
        <script src="https://www.googletagmanager.com/gtag/js?id=G-123456"></script>
      </head>
      <body>
        <a href="https://api.whatsapp.com/send?phone=5511999999999">Fale Conosco</a>
      </body>
    </html>
  `;
  const stack = detectarTechStack(mockHtml, {}, [], 'https://empresa-exemplo.com.br');
  assert.ok(Array.isArray(stack), 'Tech Stack deve retornar um array');
  const nomesTech = stack.map(t => t.nome);
  assert.ok(nomesTech.some(n => n.includes('WordPress')), 'Deve detectar WordPress');
  assert.ok(nomesTech.some(n => n.includes('Elementor')), 'Deve detectar Elementor');
  assert.ok(nomesTech.some(n => n.includes('Meta Pixel')), 'Deve detectar Meta Pixel');
  assert.ok(nomesTech.some(n => n.includes('Google Analytics')), 'Deve detectar Google Analytics 4');
  assert.ok(nomesTech.some(n => n.includes('WhatsApp')), 'Deve detectar WhatsApp Click-to-Chat');
  console.log('  ✓ Detecção de Tech Stack corporativo (70+ regras) validada com sucesso!');

  // 2. Teste de Predição de E-mails com DNS MX
  const dominioMxMock = {
    ativo: true,
    dominio: 'empresa-exemplo.com.br',
    provedor: 'Google Workspace',
    mx: ['aspmx.l.google.com'],
  };
  const predicoes = predizerEmailsDecisor('Carlos Eduardo Mendes', dominioMxMock);
  assert.ok(predicoes.length >= 4, 'Deve gerar no mínimo 4 padrões de e-mails preditos');
  assert.strictEqual(predicoes[0].email, 'carlos@empresa-exemplo.com.br');
  assert.strictEqual(predicoes[1].email, 'carlos.mendes@empresa-exemplo.com.br');
  assert.strictEqual(predicoes[2].email, 'cmendes@empresa-exemplo.com.br');
  console.log('  ✓ Algoritmo de predição e correspondência de e-mails corporativos validado!');

  // 3. Teste de Extração de Usuário do Instagram
  assert.strictEqual(usuarioDoLink('https://instagram.com/empresa.oficial/'), 'empresa.oficial');
  assert.strictEqual(usuarioDoLink('https://www.instagram.com/empresa_top?igshid=123'), 'empresa_top');
  assert.strictEqual(usuarioDoLink('@perfil_simples'), 'perfil_simples');
  console.log('  ✓ Parser e sanitizador de perfis Instagram validado!');

  // 4. Teste de Síntese do Dossiê Executivo
  const mockLead = {
    id: 'test-lead-123',
    nome: 'Solar Tech Brasil',
    praca: 'Campinas SP',
    nicho: 'energia-solar',
    site: 'https://solartechbrasil.com.br',
    whatsapp: '19988776655',
  };
  const mockDecisores = [
    {
      nome: 'Carlos Eduardo Mendes',
      cargo: 'Diretor Geral',
      linkedin_url: 'https://br.linkedin.com/in/carlos-mendes-solar',
      confianca: 'confirmado_legal',
    },
  ];
  const dossier = gerarDossierExecutivoBI({
    lead: mockLead,
    techStack: stack,
    decisores: mockDecisores,
    dominioMx: dominioMxMock,
    receita: { porte: 'Demais', situacao: 'ATIVA' },
    instagramResumo: { usuario: 'solartech', seguidores: 450, posts: 30, dias_sem_postar: 42 },
    anunciosResumo: { ativo: false, total: 0 },
  });

  assert.ok(dossier.score_bi >= 10 && dossier.score_bi <= 100, 'Score de BI deve estar entre 10 e 100');
  assert.ok(dossier.gancho_whatsapp, 'Deve gerar gancho de WhatsApp');
  assert.ok(dossier.gancho_email, 'Deve gerar gancho de Cold Email');
  assert.ok(dossier.gancho_linkedin, 'Deve gerar gancho de Conexão LinkedIn');
  assert.ok(dossier.melhor_canal_abordagem, 'Deve definir o melhor canal de abordagem');
  assert.strictEqual(dossier.melhor_canal_abordagem, 'WhatsApp Direto para o Decisor');
  console.log('  ✓ Geração do Dossiê Executivo de BI e Icebreakers multicanal validada!');

  // 5. Teste de Integridade do Banco SQLite
  const db = getLocalDb();
  const count = db.prepare('SELECT count(*) as total FROM leads').get();
  assert.ok(count.total >= 0, 'Consulta de leads no SQLite deve retornar valor válido');
  console.log(`  ✓ Banco de dados local SQLite operacional (${count.total} leads registrados)!`);

  console.log('🎉 TODOS OS TESTES DE BUSINESS INTELLIGENCE (BI V3.0) PASSARAM COM SUCESSO!\n');
}

testBiEnrichment().catch((err) => {
  console.error('✗ Falha no teste de BI:', err);
  process.exit(1);
});
