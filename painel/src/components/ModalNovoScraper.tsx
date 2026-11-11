'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { nativeVibrate, nativeToast } from '@/lib/native';
import {
  MapPin,
  Globe,
  Sparkles,
  Zap,
  CheckCircle2,
  X,
  Loader2,
  Send,
  Building2,
  Filter,
  Layers,
  ArrowRight,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Search,
  Check,
} from 'lucide-react';

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.65 1.65 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

interface ModalNovoScraperProps {
  aberto: boolean;
  aoFechar: () => void;
  nichoInicial?: string;
}

export const CANAIS_SCRAPER = [
  {
    id: 'maps',
    nome: 'Google Maps Scraper',
    sub: 'Busca geográfica profunda, telefones comerciais, sites oficiais e notas',
    icone: MapPin,
    cor: 'var(--accent-primary, #FA4200)',
    corGlow: 'var(--accent-primary, rgba(250, 66, 0, 0.40))',
    badge: 'SuperPool Apify · R$ 0',
    vantagem: 'Localização GPS · Celular · WhatsApp · Horários',
  },
  {
    id: 'linkedin',
    nome: 'LinkedIn B2B',
    sub: 'Empresas, executivos, sócios, diretores e tomadores de decisão',
    icone: LinkedinIcon,
    cor: '#0A66C2',
    corGlow: 'rgba(10, 102, 194, 0.40)',
    badge: 'B2B Decisores',
    vantagem: 'Cargos C-Level · Setor Corporativo · Headcount',
  },
  {
    id: 'instagram',
    nome: 'Instagram Comercial',
    sub: 'Biografias, canais de direct, engajamento e WhatsApp de empresas',
    icone: InstagramIcon,
    cor: '#E1306C',
    corGlow: 'rgba(225, 48, 108, 0.40)',
    badge: 'Comercial & Direct',
    vantagem: 'Perfil Público · Bio Links · Contato Instantâneo',
  },
  {
    id: 'web',
    nome: 'Web Scraper B2B',
    sub: 'Portais corporativos, busca semântica profunda e sites diretos',
    icone: Globe,
    cor: '#8B5CF6',
    corGlow: 'rgba(139, 92, 246, 0.40)',
    badge: 'Busca Semântica SERP',
    vantagem: 'Deep Crawl · Meta Tags · Detecção de Pixels & CNPJ',
  },
];

export function ModalNovoScraper({ aberto, aoFechar }: ModalNovoScraperProps) {
  const router = useRouter();
  const [canal, setCanal] = useState<string>('maps');
  
  // CAMPOS DE BUSCA 100% LIMPOS EM BRANCO (SEM MOCK DATA)
  const [nicho, setNicho] = useState<string>('');
  const [praca, setPraca] = useState<string>('');
  const [limite, setLimite] = useState<number>(10);
  const [enriquecer, setEnriquecer] = useState<boolean>(true);
  const [sincronizarSendportal, setSincronizarSendportal] = useState<boolean>(true);
  const [tipoLinkedIn, setTipoLinkedIn] = useState<'empresas' | 'decisores'>('empresas');
  const [fullScreen, setFullScreen] = useState<boolean>(true);

  const [executando, setExecutando] = useState<boolean>(false);
  const [etapaStatus, setEtapaStatus] = useState<string>('');
  const [resultado, setResultado] = useState<any>(null);
  const [erro, setErro] = useState<string | null>(null);

  if (!aberto) return null;

  const canalAtual = CANAIS_SCRAPER.find((c) => c.id === canal) || CANAIS_SCRAPER[0];

  const handleExecutar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicho.trim()) {
      setErro('Por favor, informe o nicho ou segmento de mercado desejado.');
      return;
    }
    if (!praca.trim()) {
      setErro('Por favor, informe a cidade, estado ou localização desejada.');
      return;
    }

    setExecutando(true);
    setErro(null);
    setResultado(null);
    setEtapaStatus('Iniciando scraper multi-canal...');
    nativeVibrate(40);
    nativeToast(`⚡ Scraper ${canal.toUpperCase()} iniciado...`);

    try {
      setEtapaStatus(`Disparando scraper ${canal.toUpperCase()} para "${nicho.trim()}" em "${praca.trim()}"...`);
      
      const res = await fetch('/api/prospeccao/captar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canal,
          nicho: nicho.trim(),
          praca: praca.trim(),
          limite,
          enriquecer,
          sincronizarSendportal,
          tipoLinkedIn,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Falha ao executar scraper');
      }

      setResultado(data);
      setEtapaStatus('Scraper concluído com sucesso!');
      nativeVibrate(60);
      nativeToast(`🎉 Coleta finalizada! ${data?.novos || 0} novos leads.`);
      router.refresh();
    } catch (err: any) {
      setErro(err.message || 'Erro inesperado durante a coleta');
    } finally {
      setExecutando(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[120] flex items-center justify-center select-none animate-in fade-in duration-300 ${
        fullScreen ? 'p-0 md:p-3 lg:p-6' : 'p-3 md:p-6'
      }`}
      style={{
        background: 'rgba(0, 0, 0, 0.35)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !executando) aoFechar();
      }}
    >
      <div
        className={`w-full flex flex-col overflow-hidden transition-all duration-300 relative ${
          fullScreen
            ? 'h-full md:h-[94vh] max-w-[1400px] rounded-none md:rounded-3xl border-0 md:border'
            : 'max-w-4xl max-h-[90vh] rounded-3xl border'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(14, 18, 28, 0.50) 100%)',
          backdropFilter: 'blur(36px) saturate(200%)',
          WebkitBackdropFilter: 'blur(36px) saturate(200%)',
          borderColor: 'rgba(255, 255, 255, 0.22)',
          boxShadow: '0 32px 100px -20px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
        }}
      >
        {/* Shimmer especular superior no topo do vidro */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${canalAtual.cor} 50%, transparent 100%)`,
            opacity: 0.85,
            transition: 'background 0.3s ease',
          }}
        />

        {/* Barra Superior estilo Apple Glassmorphism / macOS Vision Window */}
        <div
          className="px-4 sm:px-6 py-4 border-b flex items-center justify-between shrink-0"
          style={{
            borderColor: 'rgba(255, 255, 255, 0.10)',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white border transition-all duration-300 shrink-0"
              style={{
                background: `linear-gradient(135deg, ${canalAtual.cor} 0%, rgba(255, 255, 255, 0.15) 100%)`,
                borderColor: 'rgba(255, 255, 255, 0.30)',
                boxShadow: `0 8px 24px ${canalAtual.corGlow}`,
              }}
            >
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-display">
                  Multi-Scraper & Captação Inteligente
                </h2>
                <span
                  className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-semibold border"
                  style={{
                    background: `${canalAtual.cor}22`,
                    color: '#FFF',
                    borderColor: `${canalAtual.cor}55`,
                  }}
                >
                  {canalAtual.nome}
                </span>
                <span className="hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded-full font-mono bg-white/10 text-white/70 border border-white/10">
                  SuperPool Engine Ativa
                </span>
              </div>
              <p className="text-xs text-white/60 hidden sm:block">
                Extraia leads diretamente para a base, enriqueça dados e conecte automações de outreach.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botão Maximizar / Restaurar Full Screen */}
            <button
              type="button"
              onClick={() => setFullScreen(!fullScreen)}
              className="hidden md:flex p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition border border-white/10"
              title={fullScreen ? 'Modo Janela' : 'Tela Cheia'}
            >
              {fullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Botão Fechar */}
            <button
              type="button"
              disabled={executando}
              onClick={aoFechar}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition border border-white/10 disabled:opacity-30"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo Principal com Rolagem Suave */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {resultado ? (
            /* Tela de Sucesso */
            <div className="max-w-2xl mx-auto py-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div
                className="p-6 rounded-3xl border text-center space-y-3"
                style={{
                  background: 'rgba(34, 197, 94, 0.10)',
                  borderColor: 'rgba(34, 197, 94, 0.30)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white font-display">
                  Captação Concluída com Sucesso!
                </h3>
                <p className="text-sm text-white/80 max-w-lg mx-auto">
                  {resultado.mensagem}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  className="p-4 rounded-2xl border text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  <span className="text-[11px] uppercase tracking-wider text-white/50 block mb-1 font-semibold">
                    Novos Leads
                  </span>
                  <span className="text-3xl font-bold text-emerald-400 font-display">
                    {resultado.novos}
                  </span>
                </div>
                <div
                  className="p-4 rounded-2xl border text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  <span className="text-[11px] uppercase tracking-wider text-white/50 block mb-1 font-semibold">
                    Enriquecidos
                  </span>
                  <span className="text-3xl font-bold text-destaque font-display">
                    {resultado.totalEnriquecidos}
                  </span>
                </div>
                <div
                  className="p-4 rounded-2xl border text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  <span className="text-[11px] uppercase tracking-wider text-white/50 block mb-1 font-semibold">
                    SendPortal Sync
                  </span>
                  <span className="text-3xl font-bold text-sky-400 font-display">
                    {resultado.sendportal?.novosContatos ?? '✓'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setResultado(null)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-white/20 text-white/80 hover:text-white bg-white/5 hover:bg-white/10 transition text-sm font-semibold"
                >
                  Nova Captação
                </button>
                <button
                  type="button"
                  onClick={() => {
                    aoFechar();
                    router.push('/');
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl btn-primario text-sm font-bold shadow-lg shadow-destaque/30 transition flex items-center justify-center gap-2"
                >
                  <span>Ver Leads no Painel</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleExecutar} className="space-y-6">
              {/* Layout em 2 Colunas para Telas Amplas e Responsivo em Mobile */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* COLUNA ESQUERDA: Seleção de Canais de Captação (5 colunas) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                      <Layers className="w-4 h-4 text-destaque" />
                      Canal de Captação
                    </label>
                    <span className="text-[11px] text-white/50 font-mono">1 de 4 selecionado</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                    {CANAIS_SCRAPER.map((item) => {
                      const ativo = canal === item.id;
                      const Icone = item.icone;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setCanal(item.id)}
                          className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                            ativo
                              ? 'border-white/40 shadow-xl'
                              : 'border-white/10 hover:border-white/25 hover:bg-white/[0.06]'
                          }`}
                          style={{
                            background: ativo
                              ? `linear-gradient(135deg, ${item.cor}25 0%, rgba(255, 255, 255, 0.08) 100%)`
                              : 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                          }}
                        >
                          {ativo && (
                            <div
                              className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-40"
                              style={{ background: item.cor }}
                            />
                          )}

                          <div className="flex items-start gap-3.5 relative z-10">
                            <div
                              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 border transition-transform duration-200 group-hover:scale-105"
                              style={{
                                background: ativo ? item.cor : 'rgba(255, 255, 255, 0.08)',
                                borderColor: ativo ? 'rgba(255, 255, 255, 0.40)' : 'rgba(255, 255, 255, 0.12)',
                                boxShadow: ativo ? `0 6px 20px ${item.corGlow}` : 'none',
                              }}
                            >
                              <Icone className="w-5 h-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="text-sm font-bold text-white tracking-tight truncate">
                                  {item.nome}
                                </span>
                                {ativo && (
                                  <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3" />
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-white/70 line-clamp-2 leading-relaxed mb-2">
                                {item.sub}
                              </p>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono text-white/70 bg-black/40 border border-white/10">
                                  {item.badge}
                                </span>
                                <span className="text-[10px] text-white/50 font-mono">
                                  • {item.vantagem}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Configuração adicional do LinkedIn */}
                  {canal === 'linkedin' && (
                    <div
                      className="p-4 rounded-2xl border space-y-2.5 animate-in fade-in"
                      style={{
                        background: 'rgba(10, 102, 194, 0.12)',
                        borderColor: 'rgba(10, 102, 194, 0.35)',
                      }}
                    >
                      <span className="text-xs text-white font-semibold flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#0A66C2]" />
                        Modo de Busca no LinkedIn:
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setTipoLinkedIn('empresas')}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold transition border ${
                            tipoLinkedIn === 'empresas'
                              ? 'bg-[#0A66C2] text-white border-white/30 shadow-md'
                              : 'bg-white/5 text-white/60 border-white/10 hover:text-white'
                          }`}
                        >
                          🏢 Páginas de Empresas
                        </button>
                        <button
                          type="button"
                          onClick={() => setTipoLinkedIn('decisores')}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold transition border ${
                            tipoLinkedIn === 'decisores'
                              ? 'bg-[#0A66C2] text-white border-white/30 shadow-md'
                              : 'bg-white/5 text-white/60 border-white/10 hover:text-white'
                          }`}
                        >
                          👔 Decisores & Sócios
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* COLUNA DIREITA: Parâmetros de Busca & Automação (7 colunas) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Seção 1: Nicho de Mercado (EM BRANCO / SEM MOCK DATA) */}
                  <div
                    className="p-5 rounded-3xl border space-y-3"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      borderColor: 'rgba(255, 255, 255, 0.14)',
                      backdropFilter: 'blur(24px)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-destaque" />
                        Nicho / Segmento de Atuação
                      </label>
                      <span className="text-[11px] text-white/50 font-mono">Campo Livre</span>
                    </div>

                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                      <input
                        type="text"
                        value={nicho}
                        onChange={(e) => setNicho(e.target.value)}
                        placeholder="Digite o nicho de atuação desejado..."
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border text-sm text-white placeholder-white/40 outline-none transition-all duration-200 focus:border-destaque focus:ring-2 focus:ring-destaque/20"
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          borderColor: 'rgba(255, 255, 255, 0.16)',
                        }}
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-white/50">
                      Exemplos de termos livres: tecnologia, indústrias químicas, energia solar, clínicas, logística, etc.
                    </p>
                  </div>

                  {/* Seção 2: Praça / Localização (EM BRANCO / SEM MOCK DATA) */}
                  <div
                    className="p-5 rounded-3xl border space-y-3"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      borderColor: 'rgba(255, 255, 255, 0.14)',
                      backdropFilter: 'blur(24px)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-destaque" />
                        Praça Geográfica / Localização
                      </label>
                      <span className="text-[11px] text-white/50 font-mono">Cidade, Estado ou Região</span>
                    </div>

                    <div className="relative">
                      <MapPin className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                      <input
                        type="text"
                        value={praca}
                        onChange={(e) => setPraca(e.target.value)}
                        placeholder="Digite a cidade, estado ou região desejada..."
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border text-sm text-white placeholder-white/40 outline-none transition-all duration-200 focus:border-destaque focus:ring-2 focus:ring-destaque/20"
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          borderColor: 'rgba(255, 255, 255, 0.16)',
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-white/50">
                      Você pode informar cidades específicas, estados (ex: SP, PR, MG) ou regiões metropolitanas.
                    </p>
                  </div>

                  {/* Seção 3: Quantidade & Automações */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Limite de Leads */}
                    <div
                      className="p-5 rounded-3xl border space-y-3"
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        borderColor: 'rgba(255, 255, 255, 0.14)',
                        backdropFilter: 'blur(24px)',
                      }}
                    >
                      <label className="text-xs font-bold text-white uppercase tracking-wider font-mono block">
                        Volume por Ciclo
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[5, 10, 20, 50].map((qtd) => (
                          <button
                            key={qtd}
                            type="button"
                            onClick={() => setLimite(qtd)}
                            className={`py-3 rounded-xl text-xs font-bold border transition-all duration-200 ${
                              limite === qtd
                                ? 'bg-destaque text-white border-white/30 shadow-md shadow-destaque/30 scale-[1.02]'
                                : 'bg-white/[0.04] text-white/70 border-white/10 hover:text-white hover:bg-white/[0.08]'
                            }`}
                          >
                            {qtd}
                          </button>
                        ))}
                      </div>
                      <span className="text-[11px] text-white/50 block">
                        Quantidade de alvos a captar nesta execução.
                      </span>
                    </div>

                    {/* Automações Ativas */}
                    <div
                      className="p-5 rounded-3xl border space-y-3"
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        borderColor: 'rgba(255, 255, 255, 0.14)',
                        backdropFilter: 'blur(24px)',
                      }}
                    >
                      <label className="text-xs font-bold text-white uppercase tracking-wider font-mono block">
                        Automações de Ponta
                      </label>
                      <div className="space-y-2.5">
                        <label className="flex items-center gap-3 text-xs text-white/90 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={enriquecer}
                            onChange={(e) => setEnriquecer(e.target.checked)}
                            className="w-4 h-4 accent-destaque rounded cursor-pointer"
                          />
                          <span>Enriquecimento Neural (CNPJ, Pixels, Whats)</span>
                        </label>
                        <label className="flex items-center gap-3 text-xs text-white/90 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={sincronizarSendportal}
                            onChange={(e) => setSincronizarSendportal(e.target.checked)}
                            className="w-4 h-4 accent-destaque rounded cursor-pointer"
                          />
                          <span>Sincronização Direta com SendPortal</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Mensagem de Erro se houver */}
                  {erro && (
                    <div className="p-4 rounded-2xl border border-red-500/40 bg-red-500/15 text-xs text-red-200 font-medium animate-in fade-in">
                      {erro}
                    </div>
                  )}

                  {/* Ação de Disparo */}
                  <div
                    className="p-5 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.16)',
                      backdropFilter: 'blur(24px)',
                    }}
                  >
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <Sparkles className="w-4 h-4 text-destaque" />
                      <span>Pipeline Universal pronto para execução multicanal</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        disabled={executando}
                        onClick={aoFechar}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl border border-white/15 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition text-xs font-semibold"
                      >
                        Cancelar
                      </button>

                      <button
                        type="submit"
                        disabled={executando}
                        className="w-full sm:w-auto px-7 py-3 rounded-xl btn-primario text-xs font-bold transition-all shadow-xl shadow-destaque/30 border border-white/20 flex items-center justify-center gap-2 min-w-[180px] cursor-pointer"
                      >
                        {executando ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>Extraindo Leads...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 fill-white" />
                            <span>Iniciar Scraper Agora</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
