'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Sparkles,
  Palette,
  Zap,
  X,
  Check,
  Eye,
  Sliders,
  Moon,
  RefreshCw,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Layers,
  Image as ImageIcon,
  Flame,
  Activity,
  Heart,
} from 'lucide-react';

export const SHADER_PRESETS = [
  { id: 'strands', name: 'Strands Luminosos', desc: 'Ondas volumétricas e gradientes dinâmicos de luz', description: 'Ondas volumétricas e gradientes dinâmicos de luz', categoria: 'Energia & Luz', category: 'Energia & Luz', badge: 'Energia' },
  { id: 'siderays', name: 'Side Rays', desc: 'Feixes de luz laterais cinemáticos com dispersão', description: 'Feixes de luz laterais cinemáticos com dispersão', categoria: 'Luz & Brilho', category: 'Luz & Brilho', badge: 'Cinemático' },
  { id: 'plasmawave', name: 'Plasma Wave', desc: 'Ondas orgânicas fluidas de plasma cósmico', description: 'Ondas orgânicas fluidas de plasma cósmico', categoria: 'Fluido & Eletricidade', category: 'Fluido & Eletricidade', badge: 'Fluido' },
  { id: 'ferrofluid', name: 'Ferrofluid Interativo', desc: 'Fluido magnético responsivo ao movimento do cursor', description: 'Fluido magnético responsivo ao movimento do cursor', categoria: 'Interativo & Física', category: 'Interativo & Física', badge: 'Interativo' },
  { id: 'softaurora', name: 'Soft Aurora', desc: 'Aurora boreal difusa em camadas translúcidas etéreas', description: 'Aurora boreal difusa em camadas translúcidas etéreas', categoria: 'Atmosférico', category: 'Atmosférico', badge: 'Nébula' },
  { id: 'particles', name: 'Particles 3D', desc: 'Nuvem volumétrica tridimensional com partículas interativas e rotação orbital', description: 'Nuvem volumétrica tridimensional com partículas interativas e rotação orbital', categoria: '3D & Cósmico', category: '3D & Cósmico', badge: '3D' },
  { id: 'ghostfibers', name: 'Ghost Fibers', desc: 'Camadas de ondas em espiral e refração óptica estilo fibra de alta frequência', description: 'Camadas de ondas em espiral e refração óptica estilo fibra de alta frequência', categoria: 'Energia & Luz', category: 'Energia & Luz', badge: 'Fibras' },
  { id: 'dither', name: 'Dither Waves', desc: 'Ondas retro-futuristas com gradiente pontilhado dithered', description: 'Ondas retro-futuristas com gradiente pontilhado dithered', categoria: 'Retro-Tech', category: 'Retro-Tech', badge: 'Retro' },
  { id: 'darkveil', name: 'Dark Veil', desc: 'Véu escuro e scanlines estilo Cyberpunk e CRT', description: 'Véu escuro e scanlines estilo Cyberpunk e CRT', categoria: 'Cyberpunk', category: 'Cyberpunk', badge: 'Dark Cyber' },
  { id: 'webthreads', name: 'Web Threads', desc: 'Filamentos digitais entrelaçados de rede neural de alta densidade', description: 'Filamentos digitais entrelaçados de rede neural de alta densidade', categoria: 'Rede Neural', category: 'Rede Neural', badge: 'Rede' },
  { id: 'topography', name: 'Topography Grid', desc: 'Linhas topográficas cartográficas de alta precisão', description: 'Linhas topográficas cartográficas de alta precisão', categoria: 'Cartografia', category: 'Cartografia', badge: 'Cartografia' },
  { id: 'balatro', name: 'Balatro Hypno', desc: 'Hipnose animada estilo carta espiral Balatro', description: 'Hipnose animada estilo carta espiral Balatro', categoria: 'Hipnótico', category: 'Hipnótico', badge: 'Hipnótico' },
  { id: 'faultyterminal', name: 'Faulty Terminal', desc: 'Distorção de tubo de raios catódicos com aberração cromática e flickering', description: 'Distorção de tubo de raios catódicos com aberração cromática e flickering', categoria: 'Retro-Tech', category: 'Retro-Tech', badge: 'Glitch' },
  { id: 'morphslider', name: 'Morph Slider', desc: 'Efeito derretido com aberração óptica e fluxo líquido para fundos cinemáticos', description: 'Efeito derretido com aberração óptica e fluxo líquido para fundos cinemáticos', categoria: 'Cinemático', category: 'Cinemático', badge: 'Melt' },
  { id: 'antigravity', name: 'Antigravity', desc: 'Centenas de partículas magnéticas orbitando um anel de atração e ondulação gravítica', description: 'Centenas de partículas magnéticas orbitando um anel de atração e ondulação gravítica', categoria: '3D & Cósmico', category: '3D & Cósmico', badge: 'Gravidade' },
  { id: 'aurora', name: 'Aurora Boreal', desc: 'Cortinas boreais de alta saturação e mistura contínua entre violeta, verde e ciano', description: 'Cortinas boreais de alta saturação e mistura contínua entre violeta, verde e ciano', categoria: 'Atmosférico', category: 'Atmosférico', badge: 'Boreal' },
  { id: 'letterglitch', name: 'Letter Glitch', desc: 'Matriz cyberpunk de glifos em mutação aleatória com vinheta periférica suave', description: 'Matriz cyberpunk de glifos em mutação aleatória com vinheta periférica suave', categoria: 'Retro-Tech', category: 'Retro-Tech', badge: 'Matrix' },
  { id: 'plasma', name: 'Plasma Incandescente', desc: 'Funções trigonométricas iterativas gerando ondas incandescentes de plasma', description: 'Funções trigonométricas iterativas gerando ondas incandescentes de plasma', categoria: 'Fluido & Eletricidade', category: 'Fluido & Eletricidade', badge: 'Plasma' },
  { id: 'liquidether', name: 'Liquid Ether', desc: 'Simulação fluida de Navier-Stokes com dispersão de cor e perturbação por cursor', description: 'Simulação fluida de Navier-Stokes com dispersão de cor e perturbação por cursor', categoria: 'Fluido & Eletricidade', category: 'Fluido & Eletricidade', badge: 'Fluido 3D' },
  { id: 'orb', name: 'Orb 3D', desc: 'Esfera plasmática tridimensional pulsante com turbulência na casca volumétrica', description: 'Esfera plasmática tridimensional pulsante com turbulência na casca volumétrica', categoria: '3D & Cósmico', category: '3D & Cósmico', badge: 'Orbe 3D' },
  { id: 'prism', name: 'Prism', desc: 'Geometria piramidal rotativa decompondo a luz ambiente em feixes espectrais', description: 'Geometria piramidal rotativa decompondo a luz ambiente em feixes espectrais', categoria: 'Luz & Brilho', category: 'Luz & Brilho', badge: 'Prisma' },
  { id: 'prismaticburst', name: 'Prismatic Burst', desc: 'Raios volumétricos estelares com distorção rotacional e reflexos prismáticos', description: 'Raios volumétricos estelares com distorção rotacional e reflexos prismáticos', categoria: '3D & Cósmico', category: '3D & Cósmico', badge: 'Burst 3D' },
  { id: 'lightning', name: 'Lightning', desc: 'Descargas eletrostáticas ramificadas e estocásticas de alta voltagem com pós-brilho', description: 'Descargas eletrostáticas ramificadas e estocásticas de alta voltagem com pós-brilho', categoria: 'Fluido & Eletricidade', category: 'Fluido & Eletricidade', badge: 'Raio' },
  { id: 'evileye', name: 'Evil Eye 3D', desc: 'Íris viva gerada por ruído fractal com chamas periféricas e rastreamento de foco', description: 'Íris viva gerada por ruído fractal com chamas periféricas e rastreamento de foco', categoria: '3D & Cósmico', category: '3D & Cósmico', badge: 'Olho 3D' },
  { id: 'beams', name: 'Beams 3D', desc: 'Colunas de laser volumétrico tridimensional com ruído de iluminação em tempo real', description: 'Colunas de laser volumétrico tridimensional com ruído de iluminação em tempo real', categoria: 'Luz & Brilho', category: 'Luz & Brilho', badge: 'Laser 3D' },
  { id: 'floatinglines', name: 'Floating Lines', desc: 'Camadas de curvas harmônicas oscilantes com paralaxe e curvatura dinâmica', description: 'Camadas de curvas harmônicas oscilantes com paralaxe e curvatura dinâmica', categoria: 'Energia & Luz', category: 'Energia & Luz', badge: 'Curvas' },
  { id: 'silk', name: 'Silk', desc: 'Tecido etéreo de seda líquida ondulando suavemente no espaço tridimensional', description: 'Tecido etéreo de seda líquida ondulando suavemente no espaço tridimensional', categoria: 'Fluido & Eletricidade', category: 'Fluido & Eletricidade', badge: 'Seda' },
  { id: 'radar', name: 'Radar Tático', desc: 'Display tático radial com anéis concêntricos e varredura rotativa de alta precisão', description: 'Display tático radial com anéis concêntricos e varredura rotativa de alta precisão', categoria: 'Cyberpunk', category: 'Cyberpunk', badge: 'Radar' },
  { id: 'ripplegrid', name: 'Ripple Grid', desc: 'Grade poligonal de perspectiva com ondas concêntricas disparadas pelo cursor', description: 'Grade poligonal de perspectiva com ondas concêntricas disparadas pelo cursor', categoria: 'Cyberpunk', category: 'Cyberpunk', badge: 'Grid' },
  { id: 'pixelblast', name: 'Pixel Blast', desc: 'Matriz reticulada de micro-pixels responsiva a toques e pulsos de energia', description: 'Matriz reticulada de micro-pixels responsiva a toques e pulsos de energia', categoria: 'Retro-Tech', category: 'Retro-Tech', badge: 'Pixels' },
  { id: 'magicrings', name: 'Magic Rings', desc: 'Série de anéis ressonantes concêntricos com rotação diferencial e efeito de impacto', description: 'Série de anéis ressonantes concêntricos com rotação diferencial e efeito de impacto', categoria: '3D & Cósmico', category: '3D & Cósmico', badge: 'Anéis 3D' },
  { id: 'gridscan', name: 'Grid Scan', desc: 'Feixe de laser de alta velocidade escaneando uma grade ortogonal cibernética', description: 'Feixe de laser de alta velocidade escaneando uma grade ortogonal cibernética', categoria: 'Cyberpunk', category: 'Cyberpunk', badge: 'Scanner' },
  { id: 'liquidchrome', name: 'Liquid Chrome', desc: 'Reflexos metálicos hipnóticos de mercúrio líquido fluindo sob distorção contínua', description: 'Reflexos metálicos hipnóticos de mercúrio líquido fluindo sob distorção contínua', categoria: 'Fluido & Eletricidade', category: 'Fluido & Eletricidade', badge: 'Cromo' },
  { id: 'linewaves', name: 'Line Waves', desc: 'Linhas de contorno harmônico sobrepostas criando padrões moiré e interferência de fase', description: 'Linhas de contorno harmônico sobrepostas criando padrões moiré e interferência de fase', categoria: 'Energia & Luz', category: 'Energia & Luz', badge: 'Moiré' },
  { id: 'acidsquares', name: 'Acid Squares', desc: 'Grid geométrico psicodélico em túnel infinito', description: 'Grid geométrico psicodélico em túnel infinito', categoria: 'Geometria Cósmica', category: 'Geometria Cósmica', badge: 'Geométrico' },
  { id: 'moltenmetal', name: 'Molten Metal', desc: 'Metal líquido incandescente em fusão térmica', description: 'Metal líquido incandescente em fusão térmica', categoria: 'Fusão Térmica', category: 'Fusão Térmica', badge: 'Fusão' },
  { id: 'lighttunnel', name: 'Light Tunnel', desc: 'Túnel de cabos de fibra e pulsos de velocidade', description: 'Túnel de cabos de fibra e pulsos de velocidade', categoria: 'Hipervelocidade', category: 'Hipervelocidade', badge: 'Hipervelocidade' }
];

export const MCP_OS_GALLERIES: Record<string, { nome: string; desc: string; icone: any; imagens: string[] }> = {
  'galeria-soft': {
    nome: 'Gen X Soft Club',
    desc: '20 wallpapers de estética minimalista, tons suaves e luz etérea',
    icone: Sparkles,
    imagens: [
      '/images/wallpapers/soft/05f22143098023a6978520a73a77637e.jpg',
      '/images/wallpapers/soft/142622f0d35efbffebc9b8a7995168dd.jpg',
      '/images/wallpapers/soft/37c572ab0404204cb6f367c2a9f78a54.jpg',
      '/images/wallpapers/soft/3e3b1728d96b733b8f3bbf418021dd42.jpg',
      '/images/wallpapers/soft/69b55c9be40f117fd5f076d27334d2cf.jpg',
      '/images/wallpapers/soft/6e86f5937cb8ef54593b94952a59d5a1.jpg',
      '/images/wallpapers/soft/71acf6cb2cad2c986df87d817a06c33b.jpg',
      '/images/wallpapers/soft/72859fb9ef398cd2a69777dc26d7d1d2.jpg',
      '/images/wallpapers/soft/73ba35d0e4557dacaeb9ffaab42cd635.jpg',
      '/images/wallpapers/soft/747c0ca848cc44632e4c94436348fe07.jpg',
      '/images/wallpapers/soft/7b78f45b8a8f62b1cb9c7477d0b83f63.jpg',
      '/images/wallpapers/soft/800c456fafbe63fae067663194fe47e9.jpg',
      '/images/wallpapers/soft/8f432d4e77f909f3abccb186f47ffff3.jpg',
      '/images/wallpapers/soft/b1cd9d06a79b40e08ff9b945cd051aab.jpg',
      '/images/wallpapers/soft/b26f28a14964906204ec288ddf524432.jpg',
      '/images/wallpapers/soft/bbf00645951aa952366c3a446a07c990.jpg',
      '/images/wallpapers/soft/c4058aae27b4310eb2c979cf9f6a817d.jpg',
      '/images/wallpapers/soft/e82d7e3487abb787a3398210d02801c8.jpg',
      '/images/wallpapers/soft/f24ac251210bc82b90f9c33ce2438194.jpg',
      '/images/wallpapers/soft/f9f930471adfb299ae9ad2f9b319421b.jpg',
    ],
  },
  'galeria-motivation': {
    nome: 'Foco & Motivação',
    desc: '17 wallpapers de alta intensidade, mindset de alta performance e triunfo',
    icone: Flame,
    imagens: [
      '/images/wallpapers/motivation/1000427297.jpg',
      '/images/wallpapers/motivation/1000427303.jpg',
      '/images/wallpapers/motivation/1000427312.jpg',
      '/images/wallpapers/motivation/img_8287.jpeg',
      '/images/wallpapers/motivation/img_9915.jpeg',
      '/images/wallpapers/motivation/projetounohome_20260613_155750_319.jpg',
      '/images/wallpapers/motivation/projetounohome_20260613_155802_757.jpg',
      '/images/wallpapers/motivation/projetounohome_20260613_155833_559.jpg',
      '/images/wallpapers/motivation/projetounohome_20260613_155903_814.jpg',
      '/images/wallpapers/motivation/projetounohome_20260613_171838_541.jpg',
      '/images/wallpapers/motivation/vaideuno_20260613_155457_985.jpg',
      '/images/wallpapers/motivation/vaideuno_20260613_155513_639.jpg',
      '/images/wallpapers/motivation/vaideuno_20260613_170029_918.jpg',
      '/images/wallpapers/motivation/vaideuno_20260613_171916_766.jpg',
      '/images/wallpapers/motivation/welitonofc001-20260222-0004.jpg',
      '/images/wallpapers/motivation/welitonofc001-20260222-0049.jpg',
      '/images/wallpapers/motivation/welitonofc001-20260222-0097.jpg',
    ],
  },
  'galeria-gym': {
    nome: 'Gym & Performance',
    desc: '14 wallpapers para energia, ritmo constante e prospecção ininterrupta',
    icone: Activity,
    imagens: [
      '/images/wallpapers/gym/012f4996731b766a5f6fce9ae5fa16a0.jpg',
      '/images/wallpapers/gym/04747ba8c86d370f14b19aff88c73f77.jpg',
      '/images/wallpapers/gym/1-20260505_170907.jpg',
      '/images/wallpapers/gym/2-20260327_135337.jpg',
      '/images/wallpapers/gym/3-20260313_123924.jpg',
      '/images/wallpapers/gym/416bb19b1eefa7c850b4db3cb09bac12_copia.jpg',
      '/images/wallpapers/gym/4567a6460e49dca509404aa4031c11d2.jpg',
      '/images/wallpapers/gym/9811449c83f06fc824d7a95f235d376e_copia.jpg',
      '/images/wallpapers/gym/b3668afb13ab00288ff06c9d72453d19.jpg',
      '/images/wallpapers/gym/c6081876648f7ce1a6e4734daa79e7d4.jpg',
      '/images/wallpapers/gym/e5ef0ddde9b00540cdf18e4b226e0bee.jpg',
      '/images/wallpapers/gym/eca2c6f16007ec99ca3c5058876b2af6.jpg',
      '/images/wallpapers/gym/f4fcf6bb7808351828fbd6ed76cba496.jpg',
      '/images/wallpapers/gym/onboarding.jpg',
    ],
  },
  'galeria-flowers': {
    nome: 'Flores & Natureza',
    desc: '8 wallpapers orgânicos com harmonia floral e luz natural suave',
    icone: Heart,
    imagens: [
      '/images/wallpapers/flowers/59da96db902a205e9f90e651a4bcaa72.jpg',
      '/images/wallpapers/flowers/797d233401eae1b36818abc988af10d4.jpg',
      '/images/wallpapers/flowers/7f15501be01e3225966e2ab7fe1b735a.jpg',
      '/images/wallpapers/flowers/8e7943acb3073ec2e112542af9fcc2c6.jpg',
      '/images/wallpapers/flowers/a7a3a081d906882bcf9068afc3894eee.jpg',
      '/images/wallpapers/flowers/b268e4783280047be44e09f1fca7dec6.jpg',
      '/images/wallpapers/flowers/beb4c6ac11f067d61799142fe1a6e27d.jpg',
      '/images/wallpapers/flowers/e55174e6ec437489913f134318952c1e.jpg',
    ],
  },
  'galeria-red': {
    nome: 'Red Cyber & Neon',
    desc: '7 wallpapers com contrastes rubros profundos e estilo cinematográfico',
    icone: Zap,
    imagens: [
      '/images/wallpapers/red/08c3aa3a5c3631b23cec57233f5c365c.jpg',
      '/images/wallpapers/red/465148a473500d0bf6c3b9c83b98ec92.jpg',
      '/images/wallpapers/red/6c5d14bcb2f0390ee694119aa6704655.jpg',
      '/images/wallpapers/red/7361af8ac2d01d02c9752f89b3365d47.jpg',
      '/images/wallpapers/red/963a4bd9af77842586e2b4cdd53eb931.jpg',
      '/images/wallpapers/red/f8247f7bffb7269d9e3b2310844b330d.jpg',
      '/images/wallpapers/red/fb71f9cd02c7e3f7e41589d90f6fdaa8.jpg',
    ],
  },
};

export const WALLPAPER_PRESETS = [
  { id: 'wallpaper-nebula', name: 'Deep Cosmic Nebula', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2560&auto=format&fit=crop' },
  { id: 'wallpaper-minimal', name: 'Apple Dark Silk Wave', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2560&auto=format&fit=crop' },
  { id: 'wallpaper-prism', name: 'Liquid Glass Prism', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2560&auto=format&fit=crop' },
  { id: 'wallpaper-aurora', name: 'Northern Polar Aurora', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2560&auto=format&fit=crop' },
];

export const ACCENT_COLOR_PRESETS = [
  { nome: 'Laranja Padrão', hex: '#FA4200' },
  { nome: 'Vermelho Ruby', hex: '#E11D48' },
  { nome: 'Violeta Cyber', hex: '#8B5CF6' },
  { nome: 'Azul Elétrico', hex: '#3B82F6' },
  { nome: 'Ciano Neon', hex: '#06B6D4' },
  { nome: 'Esmeralda', hex: '#10B981' },
  { nome: 'Âmbar Solar', hex: '#F59E0B' },
  { nome: 'Rosa Choque', hex: '#EC4899' },
  { nome: 'Titânio Dark', hex: '#64748B' },
];

export const SECONDARY_COLOR_PRESETS = [
  { nome: 'Laranja Radiante', hex: '#FF7733' },
  { nome: 'Âmbar Dourado', hex: '#FBBF24' },
  { nome: 'Coral Vivo', hex: '#FB7185' },
  { nome: 'Azul Celeste', hex: '#38BDF8' },
  { nome: 'Ciano Claro', hex: '#22D3EE' },
  { nome: 'Menta Neon', hex: '#34D399' },
  { nome: 'Violeta Suave', hex: '#A855F7' },
  { nome: 'Amarelo Quente', hex: '#FACC15' },
  { nome: 'Cinza Platina', hex: '#94A3B8' },
];

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16) || 0;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function lightenHex(hex: string, percent = 15): string {
  const { r, g, b } = hexToRgb(hex);
  const nr = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
  const ng = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
  const nb = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));
  return `#${((1 << 24) + (nr << 16) + (ng << 8) + nb).toString(16).slice(1)}`;
}

export function applyAccentColor(hex: string, secondaryHex?: string) {
  if (typeof document === 'undefined') return;

  let sec = secondaryHex;
  if (!sec) {
    try {
      sec = localStorage.getItem('client_hunter_secondary_color') || hex;
    } catch {
      sec = hex;
    }
  }

  // Se o usuário escolheu uma cor secundária diferente do laranja default enquanto a primária ainda era o laranja default,
  // a cor secundária assume soberania absoluta sobre todo o sistema!
  let primaryFinal = hex;
  if (
    sec &&
    sec.toLowerCase() !== '#ff7733' &&
    sec.toLowerCase() !== '#fa4200' &&
    primaryFinal.toLowerCase() === '#fa4200'
  ) {
    primaryFinal = sec;
  }
  // E se a primária mudou para outra cor mas a secundária ainda estava no laranja default (#FF7733), sincroniza a secundária!
  if (
    primaryFinal.toLowerCase() !== '#fa4200' &&
    (!sec || sec.toLowerCase() === '#ff7733')
  ) {
    sec = lightenHex(primaryFinal, 15);
  }

  const rgb = hexToRgb(primaryFinal);
  const hoverHex = lightenHex(primaryFinal, 15);
  const secRgb = hexToRgb(sec);
  const secHover = lightenHex(sec, 18);
  const gradientEnd = primaryFinal.toLowerCase() === sec.toLowerCase() ? secHover : sec;
  const root = document.documentElement;

  root.style.setProperty('--accent-primary', primaryFinal);
  root.style.setProperty('--accent-hover', hoverHex);
  root.style.setProperty('--accent-secondary', sec);
  root.style.setProperty('--accent-secondary-hover', secHover);
  root.style.setProperty('--color-destaque', primaryFinal);
  root.style.setProperty('--color-destaque-hover', hoverHex);
  root.style.setProperty('--color-secundaria', sec);
  root.style.setProperty('--color-secundaria-hover', secHover);
  root.style.setProperty('--color-amber-300', secHover);
  root.style.setProperty('--color-amber-400', sec);
  root.style.setProperty('--color-amber-500', primaryFinal);
  root.style.setProperty('--color-orange-400', sec);
  root.style.setProperty('--color-orange-500', primaryFinal);
  root.style.setProperty('--accent-gradient', `linear-gradient(135deg, ${primaryFinal} 0%, ${gradientEnd} 100%)`);
  root.style.setProperty('--accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  root.style.setProperty('--accent-secondary-rgb', `${secRgb.r}, ${secRgb.g}, ${secRgb.b}`);

  // Atualizar shader WebGL ativo em tempo real para refletir a cor absoluta
  try {
    if (typeof (window as any).updateWebGLColors === 'function') {
      (window as any).updateWebGLColors(primaryFinal, gradientEnd);
    }
  } catch (e) {}

  // Notificar bridge nativa do Android caso disponível
  try {
    (window as any).AndroidApp?.setColors?.(primaryFinal, sec);
    (window as any).AndroidApp?.setAccentColor?.(primaryFinal);
  } catch (e) {
    console.warn('[AndroidBridge] Erro ao sincronizar accent color:', e);
  }
}

export function McpOsBackgroundProvider() {
  const [modalAberto, setModalAberto] = useState(false);
  const [abaModal, setAbaModal] = useState<'shaders' | 'galerias' | 'wallpapers' | 'ajustes'>('shaders');
  const [temaAtivo, setTemaAtivo] = useState<string>('strands');
  const [accentColor, setAccentColor] = useState<string>('#FA4200');
  const [secondaryColor, setSecondaryColor] = useState<string>('#FF7733');
  const [modoEco, setModoEco] = useState<boolean>(true);
  const [intervaloSegundos, setIntervaloSegundos] = useState<number>(20);
  const [slideshowPausado, setSlideshowPausado] = useState<boolean>(false);
  const [indiceImagemAtual, setIndiceImagemAtual] = useState<number>(0);
  const [scriptsCarregados, setScriptsCarregados] = useState(false);

  const handleSetAccentColor = useCallback((hex: string) => {
    const secHarmonic = lightenHex(hex, 15);
    setAccentColor(hex);
    setSecondaryColor(secHarmonic);
    try {
      localStorage.setItem('client_hunter_accent_color', hex);
      localStorage.setItem('client_hunter_secondary_color', secHarmonic);
    } catch (e) {}
    applyAccentColor(hex, secHarmonic);
  }, []);

  const handleSetSecondaryColor = useCallback((secHex: string) => {
    // A cor secundária selecionada torna-se TOTALMENTE ABSOLUTA em todo o sistema
    setSecondaryColor(secHex);
    setAccentColor(secHex);
    try {
      localStorage.setItem('client_hunter_secondary_color', secHex);
      localStorage.setItem('client_hunter_accent_color', secHex);
    } catch (e) {}
    applyAccentColor(secHex, secHex);
  }, []);

  const activeSlideRef = useRef<number>(1);
  const slideshowTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handler = () => setModalAberto(true);
    const handlerCores = (e: any) => {
      if (e.detail?.primary) setAccentColor(e.detail.primary);
      if (e.detail?.secondary) setSecondaryColor(e.detail.secondary);
    };
    window.addEventListener('abrir-modal-mcp-os', handler);
    window.addEventListener('sincronizar-cores-sistema', handlerCores);
    return () => {
      window.removeEventListener('abrir-modal-mcp-os', handler);
      window.removeEventListener('sincronizar-cores-sistema', handlerCores);
    };
  }, []);

  // Crossfade suave para imagem
  const trocarImagemCrossfade = useCallback((url: string) => {
    const s1 = document.getElementById('bg-slide-1');
    const s2 = document.getElementById('bg-slide-2');
    if (!s1 || !s2) return;

    const nextSlide = activeSlideRef.current === 1 ? s2 : s1;
    const currentSlide = activeSlideRef.current === 1 ? s1 : s2;

    const img = new Image();
    img.src = url;
    img.onload = () => {
      nextSlide.style.backgroundImage = `url('${url}')`;
      nextSlide.classList.add('active');
      currentSlide.classList.remove('active');
      activeSlideRef.current = activeSlideRef.current === 1 ? 2 : 1;
    };
  }, []);

  useEffect(() => {
    // 1. Carregar preferências salvas
    const savedBg = localStorage.getItem('client_hunter_bg') || 'strands';
    const savedEco = localStorage.getItem('client_hunter_eco') !== 'false';
    const savedInterval = Number(localStorage.getItem('client_hunter_interval')) || 20;
    let savedAccent = localStorage.getItem('client_hunter_accent_color') || '#FA4200';
    let savedSecondary = localStorage.getItem('client_hunter_secondary_color') || '#FF7733';

    // Se o usuário já havia selecionado uma cor secundária customizada, ela é soberana e absoluta
    if (savedSecondary.toLowerCase() !== '#ff7733' && savedAccent.toLowerCase() === '#fa4200') {
      savedAccent = savedSecondary;
      try {
        localStorage.setItem('client_hunter_accent_color', savedSecondary);
      } catch (e) {}
    } else if (savedAccent.toLowerCase() !== '#fa4200' && savedSecondary.toLowerCase() === '#ff7733') {
      savedSecondary = lightenHex(savedAccent, 15);
      try {
        localStorage.setItem('client_hunter_secondary_color', savedSecondary);
      } catch (e) {}
    }

    setTemaAtivo(savedBg);
    setModoEco(savedEco);
    setIntervaloSegundos(savedInterval);
    setAccentColor(savedAccent);
    setSecondaryColor(savedSecondary);
    applyAccentColor(savedAccent, savedSecondary);

    // 2. Carregar OGL e WebGL Shaders Engine do MCP OS
    const loadScript = (src: string, isModule = false) => {
      return new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const s = document.createElement('script');
        s.src = src;
        if (isModule) s.type = 'module';
        s.async = false;
        s.onload = () => resolve();
        s.onerror = (e) => reject(e);
        document.head.appendChild(s);
      });
    };

    Promise.all([
      loadScript('/mcp-os/ogl.js', true),
      loadScript('/mcp-os/mcp-os-webgl.js', true),
    ])
      .then(() => setScriptsCarregados(true))
      .catch((err) => {
        console.warn('[McpOsBackground] Script load fallback:', err);
        setScriptsCarregados(true);
      });
  }, []);

  // Aplica o background sempre que o tema ou scripts mudarem
  const aplicarBackground = useCallback((id: string) => {
    localStorage.setItem('client_hunter_bg', id);

    const ctnWebGL = document.getElementById('bg-webgl-container');
    const s1 = document.getElementById('bg-slide-1');
    const s2 = document.getElementById('bg-slide-2');

    // Limpar timer anterior
    if (slideshowTimerRef.current) {
      clearInterval(slideshowTimerRef.current);
      slideshowTimerRef.current = null;
    }

    // Caso 1: Galeria MCP OS com Slideshow
    if (id.startsWith('galeria-') && MCP_OS_GALLERIES[id]) {
      if (typeof (window as any).stopWebGLBackground === 'function') {
        try { (window as any).stopWebGLBackground(); } catch (e) {}
      }
      if (ctnWebGL) ctnWebGL.style.display = 'none';

      const galeria = MCP_OS_GALLERIES[id];
      const fotos = galeria.imagens;
      let idx = 0;
      setIndiceImagemAtual(0);

      if (fotos.length > 0) {
        trocarImagemCrossfade(fotos[0]);
      }

      if (!slideshowPausado && fotos.length > 1) {
        slideshowTimerRef.current = setInterval(() => {
          idx = (idx + 1) % fotos.length;
          setIndiceImagemAtual(idx);
          trocarImagemCrossfade(fotos[idx]);
        }, Math.max(intervaloSegundos, 5) * 1000);
      }
      return;
    }

    // Caso 2: Wallpaper Único Unsplash
    if (id.startsWith('wallpaper-')) {
      if (typeof (window as any).stopWebGLBackground === 'function') {
        try { (window as any).stopWebGLBackground(); } catch (e) {}
      }
      if (ctnWebGL) ctnWebGL.style.display = 'none';

      const preset = WALLPAPER_PRESETS.find((w) => w.id === id);
      if (preset) {
        trocarImagemCrossfade(preset.url);
      }
      return;
    }

    // Caso 3: WebGL Shader
    if (s1) s1.classList.remove('active');
    if (s2) s2.classList.remove('active');

    if (ctnWebGL) {
      ctnWebGL.style.display = 'block';
    }

    function renderShader(tentativas = 0) {
      if (typeof (window as any).renderWebGLBackground === 'function') {
        try {
          (window as any).renderWebGLBackground(id);
        } catch (e) {
          console.warn('[McpOs] Render error:', e);
        }
      } else if (tentativas < 25) {
        setTimeout(() => renderShader(tentativas + 1), 60);
      }
    }
    renderShader();
  }, [intervaloSegundos, slideshowPausado, trocarImagemCrossfade]);

  useEffect(() => {
    aplicarBackground(temaAtivo);
    return () => {
      if (slideshowTimerRef.current) clearInterval(slideshowTimerRef.current);
    };
  }, [temaAtivo, scriptsCarregados, aplicarBackground]);

  // Controles de avançar/voltar slide manual
  const mudarFotoManual = (direcao: 'next' | 'prev') => {
    if (!temaAtivo.startsWith('galeria-') || !MCP_OS_GALLERIES[temaAtivo]) return;
    const fotos = MCP_OS_GALLERIES[temaAtivo].imagens;
    let novoIndex = direcao === 'next' ? indiceImagemAtual + 1 : indiceImagemAtual - 1;
    if (novoIndex >= fotos.length) novoIndex = 0;
    if (novoIndex < 0) novoIndex = fotos.length - 1;

    setIndiceImagemAtual(novoIndex);
    trocarImagemCrossfade(fotos[novoIndex]);
  };

  const alternarEcoMode = (ativado: boolean) => {
    setModoEco(ativado);
    localStorage.setItem('client_hunter_eco', ativado ? 'true' : 'false');
    if ((window as any).mcpOsEcoEngine) {
      (window as any).mcpOsEcoEngine.setEcoMode(ativado);
    }
  };

  const getNomeAtual = () => {
    const s = SHADER_PRESETS.find((x) => x.id === temaAtivo);
    if (s) return s.name;
    const g = MCP_OS_GALLERIES[temaAtivo];
    if (g) return g.nome;
    const w = WALLPAPER_PRESETS.find((x) => x.id === temaAtivo);
    if (w) return w.name;
    return 'Strands Luminosos';
  };

  const ehGaleria = temaAtivo.startsWith('galeria-');

  return (
    <>
      {/* Camadas Nativas do MCP OS (Layer 0 e 1) */}
      <div id="bg-container" aria-hidden="true">
        <div id="bg-slide-1" className="bg-slide active" />
        <div id="bg-slide-2" className="bg-slide" />
        <div id="bg-webgl-container" />
      </div>
      <div id="bg-overlay" aria-hidden="true" />

      {/* Dock Flutuante de Controle MCP OS (Apple Liquid Glass) - Oculto em telas menores para não conflitar com a barra inferior */}
      <div className="hidden md:flex fixed bottom-5 right-5 z-50 select-none items-center gap-2">
        {/* Controles de navegação rápida quando uma galeria de fotos está ativa */}
        {ehGaleria && (
          <div
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border shadow-xl animate-in fade-in"
            style={{
              background: 'rgba(10, 10, 14, 0.75)',
              backdropFilter: 'blur(28px) saturate(190%)',
              WebkitBackdropFilter: 'blur(28px) saturate(190%)',
              borderColor: 'rgba(255, 255, 255, 0.16)',
            }}
          >
            <button
              type="button"
              onClick={() => mudarFotoManual('prev')}
              className="p-1 text-white/70 hover:text-white transition"
              title="Foto anterior"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setSlideshowPausado(!slideshowPausado)}
              className="p-1 text-white/90 hover:text-destaque transition"
              title={slideshowPausado ? 'Retomar slideshow' : 'Pausar slideshow'}
            >
              {slideshowPausado ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => mudarFotoManual('next')}
              className="p-1 text-white/70 hover:text-white transition"
              title="Próxima foto"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Botão Principal de Personalização */}
        <button
          type="button"
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-full border text-xs font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl group cursor-pointer"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(28px) saturate(190%)',
            WebkitBackdropFilter: 'blur(28px) saturate(190%)',
            borderColor: 'rgba(255, 255, 255, 0.20)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.30)',
          }}
        >
          <div className="w-2 h-2 rounded-full bg-destaque animate-pulse" />
          <Palette className="w-3.5 h-3.5 text-white/90 group-hover:rotate-45 transition-transform duration-300" />
          <span className="font-sans tracking-tight text-white/95">{getNomeAtual()}</span>
          <span
            className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium border bg-destaque/20 border-destaque/40 text-destaque"
          >
            Liquid Glass
          </span>
        </button>
      </div>

      {/* Modal Apple Control Center · Shaders & Wallpapers MCP OS */}
      {modalAberto && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200"
          style={{
            background: 'rgba(0, 0, 0, 0.35)',
            backdropFilter: 'blur(36px) saturate(200%)',
            WebkitBackdropFilter: 'blur(36px) saturate(200%)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalAberto(false);
          }}
        >
          <div
            className="w-full max-w-4xl max-h-[88vh] rounded-3xl border flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(14, 18, 28, 0.58) 100%)',
              backdropFilter: 'blur(45px) saturate(210%)',
              WebkitBackdropFilter: 'blur(45px) saturate(210%)',
              borderColor: 'rgba(255, 255, 255, 0.22)',
              boxShadow: '0 32px 100px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
            }}
          >
            {/* Header com Navegação em Abas */}
            <div className="p-5 border-b space-y-4" style={{ borderColor: 'rgba(255, 255, 255, 0.10)' }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-destaque to-destaque-hover flex items-center justify-center text-white shadow-xl shadow-destaque/35 border border-white/20 shrink-0">
                    <Sparkles className="w-5 h-5 fill-white/20" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight font-display">
                      Motor de Backgrounds MCP OS · Apple Liquid Glass
                    </h2>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-wrap mt-1 mb-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-destaque/20 text-destaque border border-destaque/40 shrink-0">
                        90 Wallpapers + 13 Shaders
                      </span>
                    </div>
                    <p className="text-xs text-white/60">
                      Personalize a atmosfera visual de todo o Client Hunter com fluidez e profundidade de vidro.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer self-end sm:self-auto"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Seletor de Abas Apple Style com rolagem horizontal no mobile */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 w-full overflow-x-auto no-scrollbar flex-nowrap">
                <button
                  type="button"
                  onClick={() => setAbaModal('shaders')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 whitespace-nowrap transition ${
                    abaModal === 'shaders'
                      ? 'bg-destaque text-white shadow-md shadow-destaque/30'
                      : 'text-white/65 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Shaders WebGL ({SHADER_PRESETS.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAbaModal('galerias')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 whitespace-nowrap transition ${
                    abaModal === 'galerias'
                      ? 'bg-destaque text-white shadow-md shadow-destaque/30'
                      : 'text-white/65 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Galerias MCP OS (90 Fotos)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAbaModal('wallpapers')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 whitespace-nowrap transition ${
                    abaModal === 'wallpapers'
                      ? 'bg-destaque text-white shadow-md shadow-destaque/30'
                      : 'text-white/65 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Wallpapers Cinemáticos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAbaModal('ajustes')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 whitespace-nowrap transition ${
                    abaModal === 'ajustes'
                      ? 'bg-destaque text-white shadow-md shadow-destaque/30'
                      : 'text-white/65 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Ajustes & Eco</span>
                </button>
              </div>
            </div>

            {/* Corpo do Modal de acordo com a aba */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* ABA 1: SHADERS WEBGL */}
              {abaModal === 'shaders' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-white/50 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-destaque" />
                      Shaders GPU Dinâmicos (OGL Engine)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      WebGL 2.0 Ativo
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {SHADER_PRESETS.map((preset) => {
                      const ativo = temaAtivo === preset.id;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => setTemaAtivo(preset.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between group ${
                            ativo
                              ? 'border-destaque bg-destaque/15 shadow-lg shadow-destaque/25 ring-1 ring-destaque'
                              : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                          }`}
                          style={{
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                          }}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold text-white group-hover:text-destaque transition-colors">
                                {preset.name}
                              </span>
                              {ativo ? (
                                <span className="w-4 h-4 rounded-full bg-destaque flex items-center justify-center text-white text-[10px]">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono text-white/50 bg-black/40 border border-white/5">
                                  {preset.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-white/60 leading-tight">
                              {preset.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ABA 2: GALERIAS MCP OS */}
              {abaModal === 'galerias' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-white/50 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                      Coleções Nativas do MCP OS com Transição Suave
                    </span>
                    <span className="text-[10px] font-mono text-destaque bg-destaque/10 px-2 py-0.5 rounded-full border border-destaque/20">
                      Slideshow Automático
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(MCP_OS_GALLERIES).map(([id, galeria]) => {
                      const ativo = temaAtivo === id;
                      const Icone = galeria.icone;
                      const fotoCapa = galeria.imagens[0];

                      return (
                        <div
                          key={id}
                          onClick={() => setTemaAtivo(id)}
                          className={`relative rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 group ${
                            ativo
                              ? 'border-destaque shadow-xl shadow-destaque/25 ring-2 ring-destaque'
                              : 'border-white/15 hover:border-white/30 hover:scale-[1.01]'
                          }`}
                          style={{ minHeight: '130px' }}
                        >
                          {/* Background Image Preview */}
                          <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                            style={{ backgroundImage: `url('${fotoCapa}')` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/30" />

                          {/* Content */}
                          <div className="relative p-4 flex flex-col justify-between h-full z-10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                                  <Icone className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-bold text-white font-display">
                                  {galeria.nome}
                                </span>
                              </div>
                              {ativo ? (
                                <span className="w-5 h-5 rounded-full bg-destaque flex items-center justify-center text-white text-xs shadow-md">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-black/60 text-white/70 border border-white/10 backdrop-blur-md">
                                  {galeria.imagens.length} fotos
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-white/75 mt-3 leading-snug">
                              {galeria.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ABA 3: WALLPAPERS CINEMÁTICOS */}
              {abaModal === 'wallpapers' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-white/50 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-sky-400" />
                      Wallpapers Estáticos em Ultra Alta Definição
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {WALLPAPER_PRESETS.map((wp) => {
                      const ativo = temaAtivo === wp.id;
                      return (
                        <div
                          key={wp.id}
                          onClick={() => setTemaAtivo(wp.id)}
                          className={`relative h-28 rounded-2xl border overflow-hidden cursor-pointer transition-all duration-200 group ${
                            ativo ? 'ring-2 ring-destaque border-transparent scale-[1.02]' : 'border-white/15 hover:border-white/30'
                          }`}
                          style={{
                            backgroundImage: `url('${wp.url}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex items-end p-2.5">
                            <span className="text-[11px] font-semibold text-white leading-tight">
                              {wp.name}
                            </span>
                          </div>
                          {ativo && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-destaque flex items-center justify-center text-white text-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ABA 4: AJUSTES, COR DE DESTAQUE & MODO ECO */}
              {abaModal === 'ajustes' && (
                <div className="space-y-5 max-w-xl">
                  {/* Seletor de Cor de Destaque Dinâmico (Accent Color Picker + Presets) */}
                  <div className="cartao p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <Palette className="w-4 h-4 text-destaque" />
                        Cor de Destaque da Aplicação (Accent Color)
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-destaque/20 text-destaque border border-destaque/30">
                        {accentColor.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-white/60">
                      Personalize botões, badges, barras de progresso nativas e realces Ultra Glass em tempo real sem recarregar.
                    </p>

                    {/* Presets Rápidos (9 Cores) */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider">
                        Presets Rápidos (9 Cores)
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                        {ACCENT_COLOR_PRESETS.map((preset) => {
                          const ativo = accentColor.toLowerCase() === preset.hex.toLowerCase();
                          return (
                            <button
                              key={preset.hex}
                              type="button"
                              onClick={() => handleSetAccentColor(preset.hex)}
                              title={`${preset.nome} (${preset.hex})`}
                              className={`h-9 rounded-xl border flex items-center justify-center transition-all ${
                                ativo
                                  ? 'scale-110 shadow-lg ring-2 ring-white/60 border-white'
                                  : 'hover:scale-105 border-white/20'
                              }`}
                              style={{ backgroundColor: preset.hex }}
                            >
                              {ativo && <Check className="w-3.5 h-3.5 text-white stroke-[3] drop-shadow" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Seletor Livre Hex & Input Color */}
                    <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-white/10">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-white/80">
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => handleSetAccentColor(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                          title="Abrir Seletor Livre de Cor"
                        />
                        <span className="text-xs font-medium">Seletor Livre:</span>
                      </label>
                      <input
                        type="text"
                        value={accentColor}
                        onChange={(e) => handleSetAccentColor(e.target.value)}
                        placeholder="#FA4200"
                        maxLength={7}
                        className="campo font-mono text-xs w-28 uppercase text-center"
                      />
                      <button
                        type="button"
                        onClick={() => handleSetAccentColor('#FA4200')}
                        className="btn-outline text-[11px] py-1.5 px-3 ml-auto rounded-lg"
                      >
                        Restaurar Padrão
                      </button>
                    </div>
                  </div>

                  {/* Seletor de Cor Secundária (Accent Secondary & Gradientes) */}
                  <div className="cartao p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <Palette className="w-4 h-4 text-secundaria" />
                        Cor Secundária da Aplicação (Secondary Accent)
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-secundaria border border-white/20">
                        {secondaryColor.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-white/60">
                      Harmonize gradientes Ultra Glass, brilhos especulares, botões secundários e detalhes visuais.
                    </p>

                    {/* Presets Rápidos da Cor Secundária (9 Cores) */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider">
                        Presets Secundários (9 Cores)
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                        {SECONDARY_COLOR_PRESETS.map((preset) => {
                          const ativo = secondaryColor.toLowerCase() === preset.hex.toLowerCase();
                          return (
                            <button
                              key={preset.hex}
                              type="button"
                              onClick={() => handleSetSecondaryColor(preset.hex)}
                              title={`${preset.nome} (${preset.hex})`}
                              className={`h-9 rounded-xl border flex items-center justify-center transition-all ${
                                ativo
                                  ? 'scale-110 shadow-lg ring-2 ring-white/60 border-white'
                                  : 'hover:scale-105 border-white/20'
                              }`}
                              style={{ backgroundColor: preset.hex }}
                            >
                              {ativo && <Check className="w-3.5 h-3.5 text-white stroke-[3] drop-shadow" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Seletor Livre Hex & Input Color Secundária */}
                    <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-white/10">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-white/80">
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => handleSetSecondaryColor(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                          title="Abrir Seletor Livre de Cor Secundária"
                        />
                        <span className="text-xs font-medium">Seletor Livre:</span>
                      </label>
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => handleSetSecondaryColor(e.target.value)}
                        placeholder="#FF7733"
                        maxLength={7}
                        className="campo font-mono text-xs w-28 uppercase text-center"
                      />
                      <button
                        type="button"
                        onClick={() => handleSetSecondaryColor('#FF7733')}
                        className="btn-outline text-[11px] py-1.5 px-3 ml-auto rounded-lg"
                      >
                        Restaurar Padrão
                      </button>
                    </div>

                    {/* Live Preview de Harmonização Primária + Secundária */}
                    <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-lg border border-white/30"
                          style={{ background: 'var(--accent-gradient)' }}
                        />
                        <span className="text-[11px] text-white/80 font-medium">Gradiente Composto:</span>
                      </div>
                      <span className="text-[10px] font-mono text-white/60">
                        {accentColor} ➔ {secondaryColor}
                      </span>
                    </div>
                  </div>

                  <div className="cartao p-4 space-y-3">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-destaque" />
                      Intervalo do Slideshow de Wallpapers
                    </span>
                    <p className="text-xs text-white/60">
                      Tempo de exibição de cada imagem antes do crossfade suave para a próxima.
                    </p>
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {[10, 20, 40, 60].map((seg) => (
                        <button
                          key={seg}
                          type="button"
                          onClick={() => {
                            setIntervaloSegundos(seg);
                            localStorage.setItem('client_hunter_interval', String(seg));
                          }}
                          className={`py-2 rounded-xl text-xs font-bold border transition ${
                            intervaloSegundos === seg
                              ? 'bg-destaque text-white border-white/20'
                              : 'bg-white/[0.04] text-white/70 border-white/10 hover:text-white'
                          }`}
                        >
                          {seg}s
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="cartao p-4 space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer text-xs text-white/90">
                      <input
                        type="checkbox"
                        checked={modoEco}
                        onChange={(e) => alternarEcoMode(e.target.checked)}
                        className="w-4 h-4 accent-destaque rounded"
                      />
                      <span className="font-semibold">Modo Eco Inteligente (Recomendado)</span>
                    </label>
                    <p className="text-[11px] text-white/60 pl-7">
                      Pausa os shaders WebGL quando a janela estiver minimizada ou em segundo plano para economizar bateria e GPU.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/40"
              style={{ borderColor: 'rgba(255, 255, 255, 0.10)' }}
            >
              <div className="text-xs text-white/60 flex items-center gap-2">
                <span>Tema selecionado:</span>
                <strong className="text-white font-medium">{getNomeAtual()}</strong>
              </div>

              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-destaque to-destaque-hover hover:brightness-110 text-white text-xs font-semibold shadow-lg shadow-destaque/30 transition"
              >
                Concluir & Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
