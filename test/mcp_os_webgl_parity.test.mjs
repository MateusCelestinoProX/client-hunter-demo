import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BACKGROUND_PRESETS } from '../painel/public/mcp-os/mcp-os-theme-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CANONICAL_34_SHADERS = [
  'softaurora', 'particles', 'ghostfibers', 'plasmawave', 'strands',
  'siderays', 'beams', 'floatinglines', 'silk', 'radar',
  'ripplegrid', 'pixelblast', 'magicrings', 'gridscan', 'liquidchrome',
  'linewaves', 'ferrofluid', 'dither', 'darkveil', 'webthreads',
  'topography', 'balatro', 'faultyterminal', 'morphslider', 'antigravity',
  'aurora', 'letterglitch', 'plasma', 'liquidether', 'orb',
  'prism', 'prismaticburst', 'lightning', 'evileye'
];

const LEGACY_3_SHADERS = [
  'acidsquares', 'moltenmetal', 'lighttunnel'
];

const EXPECTED_TOTAL_PRESETS = CANONICAL_34_SHADERS.length + LEGACY_3_SHADERS.length; // 37

async function runParityTests() {
  console.log('🧪 Iniciando Teste de Integridade e Paridade WebGL MCP OS (Client Hunter)...\n');

  // =========================================================================
  // 1. Verificação de BACKGROUND_PRESETS em mcp-os-theme-manager.js
  // =========================================================================
  console.log('1️⃣ Validando BACKGROUND_PRESETS em mcp-os-theme-manager.js...');
  const presetIds = new Set(BACKGROUND_PRESETS.map(p => p.id));

  console.log(`   - Presets encontrados: ${BACKGROUND_PRESETS.length} (esperado: ${EXPECTED_TOTAL_PRESETS})`);
  assert.strictEqual(
    BACKGROUND_PRESETS.length,
    EXPECTED_TOTAL_PRESETS,
    `BACKGROUND_PRESETS deve conter exatamente ${EXPECTED_TOTAL_PRESETS} itens (34 canônicos + 3 legados), mas possui ${BACKGROUND_PRESETS.length}`
  );

  const missingCanonical = CANONICAL_34_SHADERS.filter(id => !presetIds.has(id));
  assert.strictEqual(
    missingCanonical.length,
    0,
    `Faltam os seguintes shaders canônicos em BACKGROUND_PRESETS: ${missingCanonical.join(', ')}`
  );

  const missingLegacy = LEGACY_3_SHADERS.filter(id => !presetIds.has(id));
  assert.strictEqual(
    missingLegacy.length,
    0,
    `Faltam os seguintes shaders legados em BACKGROUND_PRESETS: ${missingLegacy.join(', ')}`
  );

  for (const preset of BACKGROUND_PRESETS) {
    assert(preset.id, `Preset sem id válido: ${JSON.stringify(preset)}`);
    assert(preset.name, `Preset ${preset.id} sem name`);
    assert(preset.category, `Preset ${preset.id} sem category`);
    assert(preset.description, `Preset ${preset.id} sem description`);
    assert(preset.badge, `Preset ${preset.id} sem badge`);
  }
  console.log('   ✓ Todos os 37 presets estão estruturados e definidos no Theme Manager.');

  // =========================================================================
  // 2. Verificação do Motor WebGL em mcp-os-webgl.js
  // =========================================================================
  console.log('\n2️⃣ Validando motor de renderização em mcp-os-webgl.js...');
  const webglPath = path.resolve(__dirname, '../painel/public/mcp-os/mcp-os-webgl.js');
  const webglContent = fs.readFileSync(webglPath, 'utf8');

  // Validação de getSystemActiveColors
  assert(
    webglContent.includes('function getSystemActiveColors()'),
    'mcp-os-webgl.js deve conter a função getSystemActiveColors() para integração de cor dinâmica'
  );
  assert(
    webglContent.includes('client_hunter_accent_color'),
    'getSystemActiveColors() deve ler o localStorage do seletor de cor client_hunter_accent_color'
  );
  console.log('   ✓ Integração getSystemActiveColors() presente e conectada ao accent color');

  // Validação dos contratos globais
  assert(
    webglContent.includes('window.renderWebGLBackground ='),
    'Contrato window.renderWebGLBackground deve estar exposto'
  );
  assert(
    webglContent.includes('window.setWebGLBackground ='),
    'Contrato window.setWebGLBackground deve estar exposto'
  );
  assert(
    webglContent.includes('window.stopWebGLBackground ='),
    'Contrato window.stopWebGLBackground deve estar exposto'
  );
  assert(
    webglContent.includes('window.updateWebGLColors ='),
    'Contrato window.updateWebGLColors deve estar exposto'
  );
  assert(
    webglContent.includes('loseContext()'),
    'Limpeza de GPU com loseContext() deve estar implementada'
  );
  console.log('   ✓ Contratos de ciclo de vida e liberação de memória GPU presentes.');

  // Validação de suporte a todos os 37 shaders no dispatcher / engine
  const missingEngineShaders = [];
  for (const shaderId of [...CANONICAL_34_SHADERS, ...LEGACY_3_SHADERS]) {
    const caseRegex = new RegExp(`case\\s+['"]${shaderId}['"]\\s*:`);
    if (!caseRegex.test(webglContent)) {
      missingEngineShaders.push(shaderId);
    }
  }

  assert.strictEqual(
    missingEngineShaders.length,
    0,
    `Motor mcp-os-webgl.js não implementa dispatch para os shaders: ${missingEngineShaders.join(', ')}`
  );
  console.log(`   ✓ Todos os ${EXPECTED_TOTAL_PRESETS} shaders possuem dispatcher no motor mcp-os-webgl.js.`);

  // =========================================================================
  // 3. Verificação de Sincronização com Client Hunter Android (assets/www)
  // =========================================================================
  console.log('\n3️⃣ Validando sincronização de assets com client-hunter-android...');
  const androidWwwPath = path.resolve(__dirname, '../../client-hunter-android/assets/www/mcp-os');
  assert(fs.existsSync(androidWwwPath), `Diretório de assets Android não encontrado: ${androidWwwPath}`);

  const androidThemeMgr = path.join(androidWwwPath, 'mcp-os-theme-manager.js');
  const androidWebgl = path.join(androidWwwPath, 'mcp-os-webgl.js');
  const androidOgl = path.join(androidWwwPath, 'ogl.js');

  assert(fs.existsSync(androidThemeMgr), 'mcp-os-theme-manager.js deve existir em client-hunter-android/assets/www/mcp-os');
  assert(fs.existsSync(androidWebgl), 'mcp-os-webgl.js deve existir em client-hunter-android/assets/www/mcp-os');
  assert(fs.existsSync(androidOgl), 'ogl.js deve existir em client-hunter-android/assets/www/mcp-os');

  const androidThemeMgrContent = fs.readFileSync(androidThemeMgr, 'utf8');
  const androidWebglContent = fs.readFileSync(androidWebgl, 'utf8');

  // Validar paridade dos 37 presets no Android
  for (const id of [...CANONICAL_34_SHADERS, ...LEGACY_3_SHADERS]) {
    assert(
      androidThemeMgrContent.includes(`id: "${id}"`),
      `Preset ${id} ausente no theme manager do Android`
    );
    const caseRegex = new RegExp(`case\\s+['"]${id}['"]\\s*:`);
    assert(
      caseRegex.test(androidWebglContent),
      `Shader ${id} ausente no dispatcher do Android`
    );
  }
  console.log(`   ✓ 37 presets e shaders sincronizados integralmente com client-hunter-android.`);

  // =========================================================================
  // 4. Verificação de SHADER_PRESETS em McpOsBackgroundProvider.tsx (React)
  // =========================================================================
  console.log('\n4️⃣ Validando SHADER_PRESETS em McpOsBackgroundProvider.tsx (React UI)...');
  const providerPath = path.resolve(__dirname, '../painel/src/components/McpOsBackgroundProvider.tsx');
  assert(fs.existsSync(providerPath), `McpOsBackgroundProvider.tsx não encontrado: ${providerPath}`);

  const providerContent = fs.readFileSync(providerPath, 'utf8');
  assert(providerContent.includes('export const SHADER_PRESETS = ['), 'SHADER_PRESETS deve estar exportado');

  const presetIdMatches = [...providerContent.matchAll(/id:\s*['"]([a-z0-9]+)['"]/g)].map(m => m[1]);
  // Filtrar apenas os IDs únicos correspondentes ao bloco SHADER_PRESETS
  const providerPresetIds = new Set();
  for (const id of [...CANONICAL_34_SHADERS, ...LEGACY_3_SHADERS]) {
    if (providerContent.includes(`id: '${id}'`) || providerContent.includes(`id: "${id}"`)) {
      providerPresetIds.add(id);
    }
  }

  assert.strictEqual(
    providerPresetIds.size,
    EXPECTED_TOTAL_PRESETS,
    `McpOsBackgroundProvider.tsx deve conter todos os ${EXPECTED_TOTAL_PRESETS} presets, mas possui ${providerPresetIds.size}`
  );

  const missingReactCanonical = CANONICAL_34_SHADERS.filter(id => !providerPresetIds.has(id));
  assert.strictEqual(
    missingReactCanonical.length,
    0,
    `Faltam shaders canônicos em McpOsBackgroundProvider.tsx: ${missingReactCanonical.join(', ')}`
  );

  const missingReactLegacy = LEGACY_3_SHADERS.filter(id => !providerPresetIds.has(id));
  assert.strictEqual(
    missingReactLegacy.length,
    0,
    `Faltam shaders legados em McpOsBackgroundProvider.tsx: ${missingReactLegacy.join(', ')}`
  );
  console.log(`   ✓ Todos os 37 presets estão definidos em McpOsBackgroundProvider.tsx.`);

  console.log('\n🎉 SUCESSO: Todos os 37 Shaders WebGL estão plenamente integrados e validados no Client Hunter (HTML, Engine, React e Android APK)!\n');
}

runParityTests().catch(err => {
  console.error('\n❌ FALHA NO TESTE DE PARIDADE:');
  console.error(err.message);
  process.exit(1);
});
