import assert from 'node:assert';
import { superpool } from '../lib/superpool.mjs';
import { motorBusca } from '../lib/places.mjs';
import { motorPesquisa } from '../lib/pesquisa.mjs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

async function runE2E() {
  console.log('🚀 Iniciando Validação E2E do LeadPulse Pro...\n');

  // 1. Validar SuperPool
  console.log('1️⃣ Checando conectividade com SuperPool da VPS...');
  const stats = await superpool.getStats();
  assert(stats.total_providers >= 4, 'Deveria ter pelo menos 4 provedores no pool');
  console.log(`   ✓ Provedores ativos: ${Object.keys(stats.providers).join(', ')}`);
  console.log(`   ✓ Contas Apify ativas: ${stats.providers.apify.active_keys}`);
  console.log(`   ✓ Contas Firecrawl ativas: ${stats.providers.firecrawl.active_keys}`);

  // 2. Validar Motores de Busca
  console.log('\n2️⃣ Testando seleção de motores de busca...');
  assert.strictEqual(motorBusca('botasaurus'), 'botasaurus');
  assert.strictEqual(motorBusca('superpool'), 'superpool');
  assert.strictEqual(motorPesquisa('superpool'), 'superpool');
  console.log('   ✓ Seleção dinâmica de motores operacional');

  // 3. Validar Servidor MCP
  console.log('\n3️⃣ Testando Servidor MCP dedicado (mcp/leadpulse-mcp.mjs)...');
  const mcpPayload = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }) + '\n';
  const child = execFile('node', ['mcp/leadpulse-mcp.mjs']);
  let stdoutData = '';
  child.stdout.on('data', (d) => { stdoutData += d; });
  child.stdin.write(mcpPayload);
  child.stdin.end();

  await new Promise((resolve, reject) => {
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`MCP server exited with code ${code}`));
    });
  });

  const mcpRes = JSON.parse(stdoutData.trim());
  assert(mcpRes.result?.tools?.length >= 7, 'MCP server deve expor todas as 7 ferramentas');
  console.log(`   ✓ Servidor MCP ativo com ${mcpRes.result.tools.length} ferramentas expostas`);

  console.log('\n🎉 SUCESSO: Todos os componentes integrados e operando 100%!');
}

runE2E().catch((err) => {
  console.error('\n❌ Falha no teste E2E:', err);
  process.exit(1);
});
