import assert from 'node:assert';
import { 
  listarTemplates, 
  salvarTemplate, 
  renderizarMensagem,
  garantirTag,
  listarTags,
  adicionarInscrito,
  listarInscritos,
  sincronizarLeadsParaInscritos,
  desinscreverInscrito,
  criarCampanha,
  obterCampanha,
  listarCampanhas,
  registrarAbertura,
  registrarClique,
  processarOptOut
} from '../lib/sendportal/index.mjs';
import { getLocalDb } from '../lib/local_db.mjs';

async function testSendPortal() {
  console.log('🧪 Iniciando testes de validação completa do SendPortal Core...\n');

  // 1. Templates
  const templates = listarTemplates();
  assert.ok(templates.length >= 2, 'Deveria ter templates pré-configurados');
  console.log(`  ✓ Templates padrão carregados com sucesso (${templates.length} modelos)!`);

  const renderizado = renderizarMensagem('Olá, {{first_name}} da {{company}}!', {
    first_name: 'Carlos',
    company: 'SolTech',
  });
  assert.strictEqual(renderizado, 'Olá, Carlos da SolTech!');
  console.log('  ✓ Interpolação de variáveis dinâmicas validada com precisão!');

  // 2. Tags
  const tag1 = garantirTag('nicho:energia-solar', '#f59e0b');
  const tag2 = garantirTag('classe:A', '#10b981');
  assert.ok(tag1 && tag1.id, 'Tag 1 criada');
  assert.ok(tag2 && tag2.id, 'Tag 2 criada');
  console.log('  ✓ Motor de tags e taxonomia do SendPortal aprovado!');

  // 3. Inscritos & Sincronização
  const sub = adicionarInscrito({
    email: 'diretor.teste@soltech.com.br',
    primeiro_nome: 'Carlos',
    empresa: 'SolTech Solar',
    cargo: 'Diretor Comercial',
    tags: ['nicho:energia-solar', 'classe:A'],
  });
  assert.ok(sub && sub.id, 'Inscrito criado com sucesso');
  assert.ok(sub.token_optout, 'Inscrito possui token de opt-out único');
  console.log('  ✓ Inserção de assinantes e geração de tokens de privacidade aprovados!');

  // Testar sincronização em lote da tabela leads para sp_inscritos
  const syncRes = sincronizarLeadsParaInscritos();
  assert.ok(typeof syncRes.totalContatosProcessados === 'number', 'Sincronização executada');
  console.log(`  ✓ Sincronizador de Leads captados para SendPortal aprovado (${syncRes.totalContatosProcessados} contatos processados)!`);

  // 4. Campanhas
  const camp = criarCampanha({
    nome: 'Campanha Teste Automatizada',
    assunto: 'Proposta Comercial para a {{company}}',
    template_id: 'tpl_cold_outreach_b2b',
    tag_alvo: 'nicho:energia-solar',
  });
  assert.ok(camp && camp.id, 'Campanha criada com sucesso');
  assert.strictEqual(camp.status, 'rascunho', 'Status inicial deve ser rascunho');
  console.log('  ✓ Construtor de campanhas do SendPortal aprovado!');

  // 5. Tracking de Abertura, Clique e Opt-out
  const db = getLocalDb();
  const mockMsgId = 'msg_test_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const mockToken = 'tok_test_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  db.prepare(`
    INSERT INTO sp_mensagens (id, campanha_id, inscrito_id, email, status, token_tracking)
    VALUES (?, ?, ?, ?, 'enviado', ?)
  `).run(mockMsgId, camp.id, sub.id, sub.email, mockToken);

  const abriu = registrarAbertura(mockToken, { ip: '127.0.0.1', userAgent: 'Jest-Mock/1.0' });
  assert.strictEqual(abriu, true, 'Deveria registrar abertura');
  
  const clicou = registrarClique(mockToken, 'https://soltech.com.br', { ip: '127.0.0.1' });
  assert.strictEqual(clicou, 'https://soltech.com.br', 'Deveria registrar clique e retornar URL');

  const campAtualizada = obterCampanha(camp.id);
  assert.strictEqual(campAtualizada.metricas.total_aberturas, 1, 'Métrica de abertura computada');
  assert.strictEqual(campAtualizada.metricas.total_cliques, 1, 'Métrica de clique computada');
  console.log('  ✓ Rastreamento de métricas, aberturas e cliques validado em tempo real!');

  // 6. Desinscrição
  const optoutOk = desinscreverInscrito(sub.token_optout);
  assert.strictEqual(optoutOk, true, 'Opt-out executado');
  const subVerif = db.prepare('SELECT status FROM sp_inscritos WHERE id = ?').get(sub.id);
  assert.strictEqual(subVerif.status, 'desinscrito', 'Inscrito marcado como desinscrito');
  console.log('  ✓ Gerenciamento de descadastro (Unsubscribe/Opt-Out) aprovado!');

  // 7. Limpeza limpa de artefatos de teste
  db.prepare('DELETE FROM sp_eventos WHERE mensagem_id = ?').run(mockMsgId);
  db.prepare('DELETE FROM sp_mensagens WHERE id = ?').run(mockMsgId);
  db.prepare('DELETE FROM sp_campanhas WHERE id = ?').run(camp.id);
  db.prepare('DELETE FROM sp_inscritos_tags WHERE inscrito_id = ?').run(sub.id);
  db.prepare('DELETE FROM sp_inscritos WHERE id = ?').run(sub.id);
  console.log('  ✓ Limpeza de artefatos de teste concluída com sucesso!');

  console.log('\n🎉 TODOS OS RECURSOS DO SENDPORTAL CORE FORAM APROVADOS COM SUCESSO!\n');
}

testSendPortal().catch(err => {
  console.error('❌ Erro no teste do SendPortal:', err);
  process.exit(1);
});
