import { spawn } from 'node:child_process';
import assert from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mcpScript = path.join(__dirname, '..', 'mcp', 'leadpulse-mcp.mjs');

async function testMcpServer() {
  console.log('🧪 Iniciando testes do servidor MCP LeadPulse Pro...');

  const proc = spawn('node', [mcpScript], {
    stdio: ['pipe', 'pipe', 'inherit'],
  });

  let buffer = '';

  const send = (obj) => {
    proc.stdin.write(JSON.stringify(obj) + '\n');
  };

  const readMessage = () => {
    return new Promise((resolve) => {
      const onData = (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop(); // sobrou pedaço
        for (const line of lines) {
          if (line.trim().startsWith('{')) {
            proc.stdout.off('data', onData);
            resolve(JSON.parse(line));
            return;
          }
        }
      };
      proc.stdout.on('data', onData);
    });
  };

  // 1. Initialize
  send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} });
  const initRes = await readMessage();
  assert.strictEqual(initRes.id, 1);
  assert.strictEqual(initRes.result.serverInfo.name, 'leadpulse-pro-mcp');
  console.log(`  ✓ Servidor inicializado: ${initRes.result.serverInfo.name} v${initRes.result.serverInfo.version}`);

  // 2. Tools list
  send({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} });
  const toolsRes = await readMessage();
  assert.strictEqual(toolsRes.id, 2);
  const toolNames = toolsRes.result.tools.map((t) => t.name);
  console.log(`  ✓ ${toolNames.length} ferramentas expostas pelo MCP:`);
  toolNames.forEach((name) => console.log(`     - ${name}`));

  assert(toolNames.includes('leadpulse_buscar_linkedin'), 'Deve expor leadpulse_buscar_linkedin');
  assert(toolNames.includes('leadpulse_buscar_instagram_leads'), 'Deve expor leadpulse_buscar_instagram_leads');
  assert(toolNames.includes('leadpulse_buscar_web_leads'), 'Deve expor leadpulse_buscar_web_leads');
  assert(toolNames.includes('leadpulse_coletar_leads'), 'Deve expor leadpulse_coletar_leads');
  assert(toolNames.includes('leadpulse_superpool_status'), 'Deve expor leadpulse_superpool_status');

  proc.kill();
  console.log('🎉 Todos os testes do LeadPulse MCP Server passaram com sucesso!\n');
}

testMcpServer().catch((err) => {
  console.error('❌ Falha nos testes do MCP Server:', err);
  process.exit(1);
});
