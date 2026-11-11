import assert from 'node:assert';
import { superpool } from '../lib/superpool.mjs';

async function runTests() {
  console.log('🧪 Iniciando testes do cliente SuperPool...');

  // Teste 1: Checagem de disponibilidade
  const disponivel = await superpool.isAvailable();
  console.log(`  ✓ Gateway disponível: ${disponivel}`);
  assert.strictEqual(typeof disponivel, 'boolean', 'isAvailable deve retornar boolean');

  if (disponivel) {
    // Teste 2: Obter estatísticas do pool
    const stats = await superpool.getStats();
    console.log(`  ✓ Total de provedores no pool: ${stats.total_providers}`);
    assert(stats.total_providers > 0, 'Deve conter provedores ativos');
    assert(stats.providers.apify.active_keys > 0, 'Apify pool deve ter chaves ativas');
    assert(stats.providers.firecrawl.active_keys > 0, 'Firecrawl pool deve ter chaves ativas');
    console.log(`  ✓ Apify chaves ativas: ${stats.providers.apify.active_keys}`);
    console.log(`  ✓ Firecrawl chaves ativas: ${stats.providers.firecrawl.active_keys}`);
    console.log(`  ✓ Exa chaves ativas: ${stats.providers.exa.active_keys}`);
  }

  console.log('🎉 Todos os testes de contrato do SuperPool passaram!');
}

runTests().catch((err) => {
  console.error('❌ Falha nos testes do SuperPool:', err);
  process.exit(1);
});
