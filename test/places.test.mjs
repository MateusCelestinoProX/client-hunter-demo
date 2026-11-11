import assert from 'node:assert';
import { motorBusca, normalizarLugar } from '../lib/places.mjs';

async function runTests() {
  console.log('🧪 Iniciando testes do motor de busca de lugares...');

  const motor = motorBusca();
  console.log(`  ✓ Motor de busca detectado por padrão: ${motor}`);
  assert(motor !== null, 'Deve detectar um motor de busca válido (superpool, botasaurus, google ou apify)');

  // Teste de normalização
  const lugarMock = {
    id: 'ChIJ1234567890',
    displayName: { text: 'Clínica Odonto Teste' },
    formattedAddress: 'Rua das Flores, 123 - Centro, Curitiba - PR, 80000-000',
    addressComponents: [
      { types: ['administrative_area_level_2'], longText: 'Curitiba' },
      { types: ['administrative_area_level_1'], shortText: 'PR' }
    ],
    primaryTypeDisplayName: { text: 'Dentista' },
    nationalPhoneNumber: '(41) 99999-8888',
    rating: 4.9,
    userRatingCount: 85,
    websiteUri: 'https://odontoteste.com.br',
    googleMapsUri: 'https://maps.google.com/?cid=123'
  };

  const normalizado = normalizarLugar(lugarMock, {
    nicho: 'clinica-odontologica',
    praca: 'Curitiba PR',
    termo_busca: 'dentista em curitiba'
  });

  assert.strictEqual(normalizado.google_id, 'ChIJ1234567890');
  assert.strictEqual(normalizado.cidade, 'Curitiba');
  assert.strictEqual(normalizado.uf, 'PR');
  assert.strictEqual(normalizado.telefone_google, '5541999998888');
  assert.strictEqual(normalizado.site, 'https://odontoteste.com.br');

  console.log('  ✓ Normalização de lead aprovada!');
  console.log('🎉 Todos os testes de lugares passaram!');
}

runTests().catch((err) => {
  console.error('❌ Falha nos testes de lugares:', err);
  process.exit(1);
});
