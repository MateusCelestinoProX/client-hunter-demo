/**
 * Definições e metadados visuais dos canais de aquisição do LeadPulse Pro.
 */

export const CANAIS = [
  { id: 'maps', rotulo: 'Google Maps' },
  { id: 'linkedin', rotulo: 'LinkedIn' },
  { id: 'instagram', rotulo: 'Instagram' },
  { id: 'web', rotulo: 'Web B2B' },
];

export const CANAIS_DISPONIVEIS = ['maps', 'linkedin', 'instagram', 'web'];

export function canalInfo(canal) {
  const c = String(canal || 'maps').toLowerCase();
  switch (c) {
    case 'linkedin':
      return { id: 'linkedin', rotulo: 'LinkedIn B2B', cor: '#0A66C2', bg: '#0A66C218', icone: '💼' };
    case 'instagram':
      return { id: 'instagram', rotulo: 'Instagram', cor: '#E1306C', bg: '#E1306C18', icone: '📸' };
    case 'web':
      return { id: 'web', rotulo: 'Web B2B', cor: '#4DA3FF', bg: '#4DA3FF18', icone: '🌐' };
    case 'maps':
    default:
      return { id: 'maps', rotulo: 'Google Maps', cor: '#F5B82E', bg: '#F5B82E18', icone: '📍' };
  }
}
