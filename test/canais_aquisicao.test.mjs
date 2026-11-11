import assert from 'node:assert';
import { canalInfo, CANAIS } from '../lib/canais.mjs';
import { classificar } from '../lib/score.mjs';
import { inserirLeadLocal, getLocalDb } from '../lib/local_db.mjs';

async function runTests() {
  console.log('🧪 Iniciando testes das novas fontes de aquisição (LeadPulse Pro)...');

  // 1. Teste de canais disponíveis e helper visual
  assert.strictEqual(CANAIS.length, 4, 'Deve conter 4 canais principais configurados');
  const canaisIds = CANAIS.map(c => c.id);
  assert(canaisIds.includes('maps'), 'Deve conter canal maps');
  assert(canaisIds.includes('linkedin'), 'Deve conter canal linkedin');
  assert(canaisIds.includes('instagram'), 'Deve conter canal instagram');
  assert(canaisIds.includes('web'), 'Deve conter canal web');

  const infoLi = canalInfo('linkedin');
  assert.strictEqual(infoLi.id, 'linkedin');
  assert.strictEqual(infoLi.rotulo, 'LinkedIn B2B');
  assert(infoLi.cor.startsWith('#'), 'Deve ter cor hexadecimal');

  const infoIg = canalInfo('instagram');
  assert.strictEqual(infoIg.id, 'instagram');
  assert.strictEqual(infoIg.rotulo, 'Instagram');

  const infoWeb = canalInfo('web');
  assert.strictEqual(infoWeb.id, 'web');
  assert.strictEqual(infoWeb.rotulo, 'Web B2B');

  console.log('  ✓ Configurações e badges dos canais validadas!');

  // 2. Teste do motor de pontuação multi-canal
  const leadInstagram = {
    nome: 'Solar Instagram',
    canal_origem: 'instagram',
    instagram: 'https://instagram.com/solarinsta',
    whatsapp: '5541999999999',
    telefone_google: '5541999999999',
    endereco: 'Curitiba PR',
  };

  const scoreIg = classificar(leadInstagram, {});
  assert(scoreIg.score >= 35, `Score do Instagram deve somar instagram, whatsapp, telefone e endereco (score=${scoreIg.score})`);
  assert(scoreIg.sinais.instagram.tem, 'Sinal de Instagram deve ser positivo');
  assert(scoreIg.sinais.whatsapp.tem, 'Sinal de WhatsApp deve ser positivo');

  const leadLinkedIn = {
    nome: 'Solar Tech Corp',
    canal_origem: 'linkedin',
    linkedin: 'https://linkedin.com/company/solartech',
    decisor: 'Carlos Diretor (Diretor Comercial)',
    site: 'https://solartech.com.br',
    site_vivo: true,
    endereco: 'São Paulo SP',
  };

  const scoreLi = classificar(leadLinkedIn, { site_vivo: true });
  assert(scoreLi.sinais.linkedin.tem, 'Sinal de LinkedIn deve ser positivo');
  assert(scoreLi.sinais.site_vivo.tem, 'Sinal de site vivo deve ser positivo');

  console.log('  ✓ Motor de pontuação multi-canal aprovado com precisão!');

  // 3. Teste de gravação idempotente no SQLite local
  const leadMock = {
    id: `teste:multi:${Date.now()}`,
    google_id: `teste:multi:${Date.now()}`,
    nome: 'Empresa Teste Multi Canal',
    nicho: 'energia-solar',
    praca: 'Curitiba PR',
    canal_origem: 'linkedin',
    decisor: 'Ana Sócia (Sócia)',
    whatsapp: '+5541988887777',
    linkedin: 'https://linkedin.com/in/ana-socia',
    score: 80,
    classificacao: 'A',
  };

  const r1 = inserirLeadLocal(leadMock);
  assert.strictEqual(r1.novo, true, 'Primeira inserção deve marcar como novo');

  const r2 = inserirLeadLocal(leadMock);
  assert.strictEqual(r2.novo, false, 'Segunda inserção deve atualizar sem duplicar');

  const db = getLocalDb();
  const salvo = db.prepare('SELECT * FROM leads WHERE id = ?').get(leadMock.id);
  assert.strictEqual(salvo.canal_origem, 'linkedin');
  assert.strictEqual(salvo.decisor, 'Ana Sócia (Sócia)');
  assert.strictEqual(salvo.whatsapp, '+5541988887777');

  // Limpeza do mock de teste
  db.prepare('DELETE FROM leads WHERE id = ?').run(leadMock.id);

  console.log('  ✓ Persistência local idempotente e schema multi-canal verificados!');
  console.log('🎉 Todos os testes de aquisição multi-canal passaram com sucesso!');
}

runTests().catch((err) => {
  console.error('❌ Falha nos testes de aquisição multi-canal:', err);
  process.exit(1);
});
