export interface CountryOption {
  value: string;
  label: string;
}

export const PAISES_POPULARES: CountryOption[] = [
  { value: 'BR', label: 'Brasil (1.200 Cidades)' },
  { value: 'US', label: 'Estados Unidos (2.829 Cidades)' },
  { value: 'PT', label: 'Portugal (140 Cidades)' },
  { value: 'ES', label: 'Espanha (624 Cidades)' },
  { value: 'GB', label: 'Reino Unido (823 Cidades)' },
  { value: 'DE', label: 'Alemanha (1.109 Cidades)' },
  { value: 'FR', label: 'França (649 Cidades)' },
  { value: 'IT', label: 'Itália (613 Cidades)' },
  { value: 'CA', label: 'Canadá (329 Cidades)' },
  { value: 'AR', label: 'Argentina (225 Cidades)' },
  { value: 'MX', label: 'México (620 Cidades)' },
  { value: 'CL', label: 'Chile (103 Cidades)' },
  { value: 'CO', label: 'Colômbia (303 Cidades)' },
  { value: 'UY', label: 'Uruguai (31 Cidades)' },
];

export const CATEGORIAS_SUGERIDAS = [
  'Energia Solar e Painéis Fotovoltaicos',
  'Clínicas Odontológicas e Ortodontia',
  'Academias e Centros de Crossfit',
  'Escritórios de Advocacia Trabalhista',
  'Imobiliárias e Corretores de Alto Padrão',
  'Clínicas de Estética Avançada',
  'Contabilidades e BPO Financeiro',
  'Restaurantes e Gastronomia',
  'Desenvolvedores de Software & Agências Web',
  'Oficinas Mecânicas e Auto Centers',
];

export const CAMPOS_METADATA = [
  { categoria: 'Essenciais B2B', campos: ['place_id', 'name', 'website', 'phone', 'is_spending_on_ads', 'can_claim', 'reviews', 'rating'] },
  { categoria: 'Contatos & Redes', campos: ['emails', 'phones', 'whatsapp', 'instagram', 'linkedin', 'facebook', 'twitter/x', 'youtube'] },
  { categoria: 'Dados Cadastrais', campos: ['main_category', 'categories', 'address', 'coordinates', 'workday_timing', 'is_temporarily_closed'] },
  { categoria: 'Avaliações & Reputação', campos: ['featured_reviews', 'detailed_reviews', 'review_keywords', 'competitors'] },
];
