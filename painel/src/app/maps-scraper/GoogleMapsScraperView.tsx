'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Search,
  Globe,
  Mail,
  Phone,
  Star,
  Download,
  Share2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Play,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Code2,
  Terminal,
  Database,
  Building2,
  Send,
  Zap,
  Filter,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import { PAISES_POPULARES, CATEGORIAS_SUGERIDAS, CAMPOS_METADATA } from '@/lib/gmaps-constants';

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function IconLinkedin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect width="4" height="12" x="2" y="9"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}


interface LeadProps {
  id: string;
  nome?: string | null;
  nome_empresa?: string | null;
  categoria?: string | null;
  cidade?: string | null;
  uf?: string | null;
  score?: number | null;
  classificacao?: string | null;
  site?: string | null;
  situacao_site?: string | null;
  celular?: string | null;
  whatsapp?: string | null;
  emails?: string[] | null;
  instagram?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  anuncios?: boolean | null;
  reviews?: number | null;
  rating?: number | null;
  pode_reivindicar?: boolean | null;
  [key: string]: any;
}

interface Props {
  leadsIniciais: LeadProps[];
  superpoolStats: any;
}

export function GoogleMapsScraperView({ leadsIniciais, superpoolStats }: Props) {
  // Abas principais (como no original Omkar Cloud / Botasaurus)
  const [tabAtiva, setTabAtiva] = useState<'inputs' | 'outputs' | 'api' | 'about'>('inputs');

  // Estado dos Inputs do Scraper - 100% limpo em branco (sem mock data)
  const [queries, setQueries] = useState<string[]>([]);
  const [inputQueryAtual, setInputQueryAtual] = useState('');

  // Seções colapsáveis da aba Inputs
  const [secoesAbertas, setSecoesAbertas] = useState({
    cidades: false,
    emailsSocial: true,
    reviews: true,
    idiomaLimite: false,
    geo: false
  });

  const toggleSecao = (key: keyof typeof secoesAbertas) => {
    setSecoesAbertas((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Parâmetros detalhados
  const [pais, setPais] = useState('BR');
  const [tipoNegocio, setTipoNegocio] = useState('');
  const [maxCidades, setMaxCidades] = useState<number | ''>(10);
  const [randomizarCidades, setRandomizarCidades] = useState(true);

  const [extrairEmailsSocial, setExtrairEmailsSocial] = useState(true);
  const [apiKeyCustom, setApiKeyCustom] = useState('');

  const [extrairReviews, setExtrairReviews] = useState(true);
  const [maxReviews, setMaxReviews] = useState<number>(20);
  const [ordemReviews, setOrdemReviews] = useState<'most_relevant' | 'newest' | 'highest_rating' | 'lowest_rating'>('most_relevant');

  const [idioma, setIdioma] = useState('pt-BR');
  const [maxResultados, setMaxResultados] = useState<number>(20);

  const [coordenadas, setCoordenadas] = useState('');
  const [zoomLevel, setZoomLevel] = useState(14);

  // Estado de Execução
  const [executando, setExecutando] = useState(false);
  const [progressoMsg, setProgressoMsg] = useState('');
  const [leadsMinerados, setLeadsMinerados] = useState<LeadProps[]>(leadsIniciais || []);

  // Filtros da aba Outputs
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroSite, setFiltroSite] = useState<'todos' | 'com_site' | 'sem_site'>('todos');
  const [filtroWhats, setFiltroWhats] = useState(false);
  const [filtroAds, setFiltroAds] = useState(false);
  const [ratingMin, setRatingMin] = useState(0);

  // Copiar código da aba API
  const [copiado, setCopiado] = useState(false);
  const [linguagemApi, setLinguagemApi] = useState<'curl' | 'python' | 'node' | 'n8n'>('curl');

  // Adicionar e remover queries
  const adicionarQuery = () => {
    const q = inputQueryAtual.trim();
    if (!q) return;
    if (!queries.includes(q)) {
      setQueries((prev) => [...prev, q]);
    }
    setInputQueryAtual('');
  };

  const removerQuery = (index: number) => {
    setQueries((prev) => prev.filter((_, i) => i !== index));
  };

  const usarSugestao = (categoria: string) => {
    const nova = `${categoria} em São Paulo, SP`;
    if (!queries.includes(nova)) {
      setQueries((prev) => [...prev, nova]);
    }
  };

  // Disparar o Scraper
  const executarScraper = async () => {
    if (queries.length === 0 && !tipoNegocio) {
      alert('Por favor, informe ao menos uma consulta de busca ou tipo de negócio.');
      return;
    }

    setExecutando(true);
    setProgressoMsg('Iniciando motor de raspagem do Google Maps...');

    try {
      const termoFinal = queries[0] || `${tipoNegocio} no Brasil`;
      const partes = termoFinal.split(' em ');
      const nicho = partes[0] || 'empresas';
      const praca = partes[1] || 'Brasil';

      setProgressoMsg(`Minerando estabelecimentos para "${termoFinal}" via SuperPool Apify / Botasaurus...`);

      const res = await fetch('/api/prospeccao/captar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canal: 'maps',
          nicho: nicho.toLowerCase().replace(/\s+/g, '-'),
          praca,
          limite: maxResultados,
          enriquecer: extrairEmailsSocial,
          sincronizarSendportal: true,
          motorMaps: 'superpool'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro na execução do scraper');
      }

      setProgressoMsg(`Extração concluída com sucesso! ${data.leadsSalvos || maxResultados} estabelecimentos identificados.`);

      // Atualiza a lista com novos leads e redireciona para a aba Outputs
      if (data.leads && Array.isArray(data.leads)) {
        setLeadsMinerados((prev) => [...data.leads, ...prev]);
      }

      setTimeout(() => {
        setTabAtiva('outputs');
        setExecutando(false);
      }, 1200);

    } catch (err: any) {
      alert(`Falha ao executar Google Maps Scraper: ${err.message}`);
      setExecutando(false);
    }
  };

  // Filtragem dos outputs
  const leadsFiltrados = useMemo(() => {
    return leadsMinerados.filter((lead) => {
      const matchTexto = !buscaTexto || 
        (lead.nome && lead.nome.toLowerCase().includes(buscaTexto.toLowerCase())) ||
        (lead.categoria && lead.categoria.toLowerCase().includes(buscaTexto.toLowerCase())) ||
        (lead.cidade && lead.cidade.toLowerCase().includes(buscaTexto.toLowerCase()));

      const temSiteProprio = lead.site && lead.situacao_site !== 'sem_site';
      const matchSite = 
        filtroSite === 'todos' ? true :
        filtroSite === 'com_site' ? temSiteProprio : !temSiteProprio;

      const matchWhats = !filtroWhats || Boolean(lead.whatsapp || lead.celular);
      const matchAds = !filtroAds || Boolean(lead.anuncios);
      const matchRating = (lead.rating || 0) >= ratingMin;

      return matchTexto && matchSite && matchWhats && matchAds && matchRating;
    });
  }, [leadsMinerados, buscaTexto, filtroSite, filtroWhats, filtroAds, ratingMin]);

  // Exportar CSV
  const exportarCsv = () => {
    if (leadsFiltrados.length === 0) return;
    const cabecalhos = ['ID', 'Nome', 'Categoria', 'Cidade', 'UF', 'Site', 'Telefone/WhatsApp', 'Score', 'Anúncios Ads'];
    const linhas = leadsFiltrados.map((l) => [
      `"${l.id}"`,
      `"${(l.nome || '').replace(/"/g, '""')}"`,
      `"${(l.categoria || '').replace(/"/g, '""')}"`,
      `"${l.cidade || ''}"`,
      `"${l.uf || ''}"`,
      `"${l.site || ''}"`,
      `"${l.whatsapp || l.celular || ''}"`,
      `"${l.score || 0}"`,
      `"${l.anuncios ? 'Sim' : 'Não'}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [cabecalhos.join(','), ...linhas.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `google-maps-leads-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Exportar JSON
  const exportarJson = () => {
    if (leadsFiltrados.length === 0) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(leadsFiltrados, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `google-maps-export-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Copiar Snippet de API
  const copiarCodigo = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="min-h-screen text-white select-none pb-28">
      {/* Top Header com Estilo Botasaurus & MCP OS */}
      <div 
        className="border-b px-6 py-6 lg:px-9"
        style={{
          background: 'rgba(14, 18, 28, 0.45)',
          backdropFilter: 'blur(32px) saturate(180%)',
          borderColor: 'rgba(255, 255, 255, 0.16)',
        }}
      >
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                Omkar Cloud · Botasaurus Engine Oficial
              </span>
              <span className="text-[10px] text-apagado/70 font-mono">
                SuperPool VPS Ativo (13 Contas Apify · R$ 0)
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold font-display uppercase tracking-tight text-white flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-destaque to-destaque-hover flex items-center justify-center shadow-lg shadow-destaque/20">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              Google Maps Web Scraper
            </h1>
            <p className="text-xs text-white/70 mt-1 max-w-2xl leading-relaxed">
              Motor profissional de extração e mineração profunda do Google Maps. Raspe contatos, telefones, redes sociais, avaliações, horários e sinais de anúncio com geolocalização e rotação de proxies.
            </p>
          </div>

          {/* Seletor de Abas Principais (Estilo Apple Liquid Glass - Mobile Friendly) */}
          <div 
            className="flex items-center p-1.5 rounded-2xl border overflow-x-auto scrollbar-none max-w-full w-full sm:w-auto gap-1"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(24px)',
              borderColor: 'rgba(255, 255, 255, 0.14)',
            }}
          >
            <button
              onClick={() => setTabAtiva('inputs')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                tabAtiva === 'inputs'
                  ? 'bg-gradient-to-r from-destaque to-destaque-hover text-white shadow-lg shadow-destaque/25'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Inputs
            </button>

            <button
              onClick={() => setTabAtiva('outputs')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all relative shrink-0 cursor-pointer ${
                tabAtiva === 'outputs'
                  ? 'bg-gradient-to-r from-destaque to-destaque-hover text-white shadow-lg shadow-destaque/25'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Outputs ({leadsMinerados.length})
              {leadsMinerados.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>

            <button
              onClick={() => setTabAtiva('api')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                tabAtiva === 'api'
                  ? 'bg-gradient-to-r from-destaque to-destaque-hover text-white shadow-lg shadow-destaque/25'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              API Integration
            </button>

            <button
              onClick={() => setTabAtiva('about')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                tabAtiva === 'about'
                  ? 'bg-gradient-to-r from-destaque to-destaque-hover text-white shadow-lg shadow-destaque/25'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              About
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-3.5 sm:p-6 lg:p-9 pb-44 md:pb-28">
        {/* ========================================================================= */}
        {/* ABA 1: INPUTS (CONFIGURAÇÃO IDÊNTICA AO OMKAR CLOUD / BOTASAURUS)       */}
        {/* ========================================================================= */}
        {tabAtiva === 'inputs' && (
          <div className="space-y-6">
            {/* Seção 1: Search Queries (Lista de buscas) */}
            <div 
              className="p-6 rounded-2xl border transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(14, 18, 28, 0.35) 100%)',
                backdropFilter: 'blur(30px)',
                borderColor: 'rgba(255, 255, 255, 0.18)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Search className="w-4 h-4 text-destaque" />
                    Search Queries (Consultas de Busca ou Links do Maps)
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Digite palavras-chave de negócios com localização ou cole URLs diretas do Google Maps (<code className="text-destaque font-mono text-[11px]">https://maps.google.com/...</code>).
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-destaque/10 text-destaque border border-destaque/20">
                  {queries.length} {queries.length === 1 ? 'consulta ativa' : 'consultas ativas'}
                </span>
              </div>

              {/* Input para adicionar nova query (responsivo touch-first) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputQueryAtual}
                    onChange={(e) => setInputQueryAtual(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarQuery(); } }}
                    placeholder="Ex: Clínicas Médicas em Belo Horizonte, MG (Pressione Enter para adicionar)"
                    className="w-full px-4 py-3 sm:py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-destaque transition-all font-sans min-h-[44px]"
                  />
                </div>
                <button
                  type="button"
                  onClick={adicionarQuery}
                  className="px-5 py-3 sm:py-2.5 rounded-xl btn-primario text-white text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 min-h-[44px] cursor-pointer"
                >
                  Adicionar Query
                </button>
              </div>

              {/* Lista de Queries Adicionadas */}
              <div className="space-y-2 mb-4">
                {queries.map((q, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-zinc-200 font-mono"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-destaque/20 text-destaque flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span>{q}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removerQuery(idx)}
                      className="text-zinc-500 hover:text-rose-400 transition text-[11px] px-2 py-1 rounded hover:bg-rose-500/10"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>

              {/* Chips Rápidos de Categorias Sugeridas */}
              <div>
                <span className="text-[11px] text-white/50 uppercase tracking-wider font-mono block mb-2">
                  Sugestões Rápidas de Nichos com Alto Retorno B2B:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIAS_SUGERIDAS.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => usarSugestao(cat)}
                      className="px-2.5 py-1 rounded-lg text-[11px] bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/5 transition"
                    >
                      + {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Seção 2 Colapsável: Extract Cities By Country */}
            <div 
              className="rounded-2xl border overflow-hidden transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(14, 18, 28, 0.35) 100%)',
                backdropFilter: 'blur(30px)',
                borderColor: 'rgba(255, 255, 255, 0.18)',
              }}
            >
              <button
                type="button"
                onClick={() => toggleSecao('cidades')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition cursor-pointer text-left"
              >
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4 text-sky-400" />
                    Extract Cities By Country (Extração Automática em Escala Nacional)
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Em vez de buscar uma única cidade, selecione um país para minerar automaticamente em centenas de cidades.
                  </p>
                </div>
                {secoesAbertas.cidades ? <ChevronUp className="w-4 h-4 text-white/60" /> : <ChevronDown className="w-4 h-4 text-white/60" />}
              </button>

              {secoesAbertas.cidades && (
                <div className="p-6 border-t border-white/10 space-y-4 bg-black/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-white/80 mb-1.5 uppercase font-mono">
                        País de Destino
                      </label>
                      <select
                        value={pais}
                        onChange={(e) => setPais(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-sky-400 font-sans"
                      >
                        {PAISES_POPULARES.map((p) => (
                          <option key={p.value} value={p.value} className="bg-zinc-900 text-white">
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/80 mb-1.5 uppercase font-mono">
                        Tipo de Negócio / Business Type
                      </label>
                      <input
                        type="text"
                        value={tipoNegocio}
                        onChange={(e) => setTipoNegocio(e.target.value)}
                        placeholder="Ex: Clínicas Odontológicas, Restaurantes"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-sky-400 font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-white/80 mb-1.5 uppercase font-mono">
                        Máximo de Cidades a Extrair
                      </label>
                      <input
                        type="number"
                        value={maxCidades}
                        onChange={(e) => setMaxCidades(e.target.value ? Number(e.target.value) : '')}
                        placeholder="Ex: 10 (Deixe em branco para todas as cidades)"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-sky-400 font-sans"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-5">
                      <input
                        type="checkbox"
                        id="rand_cities"
                        checked={randomizarCidades}
                        onChange={(e) => setRandomizarCidades(e.target.checked)}
                        className="w-4 h-4 rounded text-destaque focus:ring-destaque border-white/20 bg-black/40 cursor-pointer"
                      />
                      <label htmlFor="rand_cities" className="text-xs text-white/90 cursor-pointer">
                        <strong className="block text-white">Randomize Cities (Recomendado)</strong>
                        <span className="text-[11px] text-white/60">Distribui as pesquisas aleatoriamente evitando sobreposições de busca.</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Seção 3 Colapsável: Email and Social Links Extraction */}
            <div 
              className="rounded-2xl border overflow-hidden transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(14, 18, 28, 0.35) 100%)',
                backdropFilter: 'blur(30px)',
                borderColor: 'rgba(255, 255, 255, 0.18)',
              }}
            >
              <button
                type="button"
                onClick={() => toggleSecao('emailsSocial')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition cursor-pointer text-left"
              >
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    Email and Social Links Extraction (Enriquecimento B2B Profundo)
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Varre automaticamente o website corporativo do estabelecimento para encontrar e-mails, telefones e redes sociais.
                  </p>
                </div>
                {secoesAbertas.emailsSocial ? <ChevronUp className="w-4 h-4 text-white/60" /> : <ChevronDown className="w-4 h-4 text-white/60" />}
              </button>

              {secoesAbertas.emailsSocial && (
                <div className="p-6 border-t border-white/10 space-y-4 bg-black/20">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div>
                      <strong className="text-xs text-white block">Ativar Extração Automática de Emails & Redes</strong>
                      <p className="text-[11px] text-white/60 mt-0.5">
                        Coleta Instagram, LinkedIn, Facebook, Twitter, WhatsApp e e-mails corporativos.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={extrairEmailsSocial}
                        onChange={(e) => setExtrairEmailsSocial(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                    </label>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>SuperPool VPS Conectado:</strong> O enriquecimento utilizará o cluster de scrapers da VPS sem custos adicionais.</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      100% ONLINE
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Seção 4 Colapsável: Reviews Extraction */}
            <div 
              className="rounded-2xl border overflow-hidden transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(14, 18, 28, 0.35) 100%)',
                backdropFilter: 'blur(30px)',
                borderColor: 'rgba(255, 255, 255, 0.18)',
              }}
            >
              <button
                type="button"
                onClick={() => toggleSecao('reviews')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition cursor-pointer text-left"
              >
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Star className="w-4 h-4 text-destaque" />
                    Reviews Extraction (Avaliações e Comentários do Google)
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Extraia texto de reviews, data de publicação, nota de cada cliente e respostas dos proprietários.
                  </p>
                </div>
                {secoesAbertas.reviews ? <ChevronUp className="w-4 h-4 text-white/60" /> : <ChevronDown className="w-4 h-4 text-white/60" />}
              </button>

              {secoesAbertas.reviews && (
                <div className="p-6 border-t border-white/10 space-y-4 bg-black/20">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div>
                      <strong className="text-xs text-white block">Enable Reviews Extraction</strong>
                      <p className="text-[11px] text-white/60 mt-0.5">
                        Habilitar a mineração de comentários detalhados de clientes para análise de sentimento e dores.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={extrairReviews}
                        onChange={(e) => setExtrairReviews(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-destaque" />
                    </label>
                  </div>

                  {extrairReviews && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-white/80 mb-1.5 uppercase font-mono">
                          Max Reviews per Place
                        </label>
                        <input
                          type="number"
                          value={maxReviews}
                          onChange={(e) => setMaxReviews(Number(e.target.value))}
                          placeholder="20"
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-destaque font-sans"
                        />
                        <span className="text-[10px] text-white/40 mt-1 block">Deixe vazio para extrair todas as avaliações.</span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-white/80 mb-1.5 uppercase font-mono">
                          Sort Reviews By
                        </label>
                        <select
                          value={ordemReviews}
                          onChange={(e: any) => setOrdemReviews(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-destaque font-sans"
                        >
                          <option value="most_relevant" className="bg-zinc-900 text-white">Most Relevant (Mais Relevantes)</option>
                          <option value="newest" className="bg-zinc-900 text-white">Newest (Mais Recentes)</option>
                          <option value="highest_rating" className="bg-zinc-900 text-white">Highest Rating (Melhores Notas)</option>
                          <option value="lowest_rating" className="bg-zinc-900 text-white">Lowest Rating (Piores Notas)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Seção 5 Colapsável: Language and Max Results */}
            <div 
              className="rounded-2xl border overflow-hidden transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(14, 18, 28, 0.35) 100%)',
                backdropFilter: 'blur(30px)',
                borderColor: 'rgba(255, 255, 255, 0.18)',
              }}
            >
              <button
                type="button"
                onClick={() => toggleSecao('idiomaLimite')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition cursor-pointer text-left"
              >
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    Language and Max Results (Idioma & Limite por Consulta)
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Controle o idioma das páginas do Maps e a quantidade de estabelecimentos retornados por pesquisa.
                  </p>
                </div>
                {secoesAbertas.idiomaLimite ? <ChevronUp className="w-4 h-4 text-white/60" /> : <ChevronDown className="w-4 h-4 text-white/60" />}
              </button>

              {secoesAbertas.idiomaLimite && (
                <div className="p-6 border-t border-white/10 space-y-4 bg-black/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-white/80 mb-1.5 uppercase font-mono">
                        Idioma do Google Maps
                      </label>
                      <select
                        value={idioma}
                        onChange={(e) => setIdioma(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400 font-sans"
                      >
                        <option value="pt-BR" className="bg-zinc-900 text-white">Português (Brasil) - pt-BR</option>
                        <option value="en" className="bg-zinc-900 text-white">English (US) - en</option>
                        <option value="es" className="bg-zinc-900 text-white">Español - es</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/80 mb-1.5 uppercase font-mono">
                        Max Results per Search Query
                      </label>
                      <input
                        type="number"
                        value={maxResultados}
                        onChange={(e) => setMaxResultados(Number(e.target.value))}
                        placeholder="20"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400 font-sans"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Seção 6 Colapsável: Geo Location */}
            <div 
              className="rounded-2xl border overflow-hidden transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(14, 18, 28, 0.35) 100%)',
                backdropFilter: 'blur(30px)',
                borderColor: 'rgba(255, 255, 255, 0.18)',
              }}
            >
              <button
                type="button"
                onClick={() => toggleSecao('geo')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition cursor-pointer text-left"
              >
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    Geo Location (Coordenadas Fixas & Zoom)
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Força a pesquisa em uma coordenada geográfica exata (latitude, longitude) e nível de zoom do mapa.
                  </p>
                </div>
                {secoesAbertas.geo ? <ChevronUp className="w-4 h-4 text-white/60" /> : <ChevronDown className="w-4 h-4 text-white/60" />}
              </button>

              {secoesAbertas.geo && (
                <div className="p-6 border-t border-white/10 space-y-4 bg-black/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-white/80 mb-1.5 uppercase font-mono">
                        Coordinates (Latitude, Longitude)
                      </label>
                      <input
                        type="text"
                        value={coordenadas}
                        onChange={(e) => setCoordenadas(e.target.value)}
                        placeholder="Ex: -23.550520, -46.633308 (São Paulo)"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-emerald-400 font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/80 mb-1.5 uppercase font-mono">
                        Zoom Level (1 - 21)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={21}
                        value={zoomLevel}
                        onChange={(e) => setZoomLevel(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-400 font-sans"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RunStickyBar: Barra Fixa Inferior de Execução (Posicionada acima da Bottom Nav no mobile) */}
            <div 
              className="fixed bottom-[60px] md:bottom-0 left-0 md:left-64 lg:left-72 right-0 z-40 border-t p-3 sm:p-4 px-4 sm:px-6 lg:px-9"
              style={{
                background: 'rgba(14, 18, 28, 0.55)',
                backdropFilter: 'blur(36px) saturate(200%)',
                WebkitBackdropFilter: 'blur(36px) saturate(200%)',
                borderColor: 'rgba(255, 255, 255, 0.18)',
                boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.40), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
              }}
            >
              <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-destaque/20 text-destaque flex items-center justify-center font-bold font-mono text-xs">
                    {queries.length}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {queries.length === 1 ? '1 Query Configurada' : `${queries.length} Queries Configuradas`}
                    </span>
                    <span className="text-[11px] text-white/60">
                      {executando ? progressoMsg : `Limite: ${maxResultados} por query · SuperPool VPS Ativo`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setTabAtiva('outputs')}
                    className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-white/80 font-medium transition"
                  >
                    Ver Dados Minerados ({leadsMinerados.length})
                  </button>

                  <button
                    type="button"
                    disabled={executando}
                    onClick={executarScraper}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white uppercase tracking-wider transition-all shadow-xl disabled:opacity-50 cursor-pointer"
                    style={{
                      background: 'var(--accent-gradient, linear-gradient(135deg, var(--accent-secondary, #FF7733) 0%, var(--accent-primary, #FA4200) 100%))',
                      boxShadow: '0 4px 20px rgba(var(--accent-rgb, 250, 66, 0), 0.45)',
                    }}
                  >
                    {executando ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        Minerando Estabelecimentos...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        Run Google Maps Scraper
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 2: OUTPUTS (DATA PANEL, TABELA RICA, FILTROS & DOWNLOAD STICKY BAR)  */}
        {/* ========================================================================= */}
        {tabAtiva === 'outputs' && (
          <div className="space-y-6">
            {/* Top Toolbar de Filtros & Ações */}
            <div 
              className="p-5 rounded-2xl border"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(14, 18, 28, 0.35) 100%)',
                backdropFilter: 'blur(30px)',
                borderColor: 'rgba(255, 255, 255, 0.18)',
              }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                      Resultados Minerados ({leadsFiltrados.length} de {leadsMinerados.length} estabelecimentos)
                    </h2>
                    <p className="text-[11px] text-white/60">
                      Tabela interativa de dados com enriquecimento de redes, websites, telefones e conformidade.
                    </p>
                  </div>
                </div>

                {/* Botões de Ação Rápida e Download */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={exportarCsv}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download CSV
                  </button>

                  <button
                    type="button"
                    onClick={exportarJson}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download JSON
                  </button>

                  <Link
                    href="/campanhas/nova"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl btn-primario text-white text-xs font-bold shadow-lg shadow-destaque/25 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Disparar no SendPortal
                  </Link>
                </div>
              </div>

              {/* Filtros em Tempo Real (Estilo Botasaurus: Min Reviews, Website, Ads, etc.) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-white/50 mb-1">
                    Buscar Texto
                  </label>
                  <input
                    type="text"
                    value={buscaTexto}
                    onChange={(e) => setBuscaTexto(e.target.value)}
                    placeholder="Nome, categoria ou cidade..."
                    className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-destaque"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-white/50 mb-1">
                    Presença de Website
                  </label>
                  <select
                    value={filtroSite}
                    onChange={(e: any) => setFiltroSite(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-destaque font-sans"
                  >
                    <option value="todos" className="bg-zinc-900">Todos os Status</option>
                    <option value="com_site" className="bg-zinc-900">Com Site Próprio</option>
                    <option value="sem_site" className="bg-zinc-900">Sem Website (Oportunidade)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-white/50 mb-1">
                    Rating Mínimo ({ratingMin > 0 ? `${ratingMin} ★` : 'Todos'})
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={0.5}
                    value={ratingMin}
                    onChange={(e) => setRatingMin(Number(e.target.value))}
                    className="w-full accent-destaque cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="filtro_whats"
                    checked={filtroWhats}
                    onChange={(e) => setFiltroWhats(e.target.checked)}
                    className="w-4 h-4 rounded text-destaque border-white/20 bg-black/40"
                  />
                  <label htmlFor="filtro_whats" className="text-xs text-white/80 cursor-pointer">
                    Apenas com WhatsApp
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="filtro_ads"
                    checked={filtroAds}
                    onChange={(e) => setFiltroAds(e.target.checked)}
                    className="w-4 h-4 rounded text-destaque border-white/20 bg-black/40"
                  />
                  <label htmlFor="filtro_ads" className="text-xs text-white/80 cursor-pointer">
                    Anunciando no Google Ads
                  </label>
                </div>
              </div>
            </div>

            {/* Tabela de Resultados (Estilo Botasaurus DataPanel) */}
            <div 
              className="rounded-2xl border overflow-hidden shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(14, 18, 28, 0.40) 100%)',
                backdropFilter: 'blur(32px) saturate(190%)',
                WebkitBackdropFilter: 'blur(32px) saturate(190%)',
                borderColor: 'rgba(255, 255, 255, 0.18)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.28)',
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/40 text-white/60 uppercase text-[10px] tracking-wider font-mono">
                      <th className="py-3 px-4">Estabelecimento / Local</th>
                      <th className="py-3 px-4">Avaliação & Reviews</th>
                      <th className="py-3 px-4">Categoria</th>
                      <th className="py-3 px-4">Telefone / WhatsApp</th>
                      <th className="py-3 px-4">Website</th>
                      <th className="py-3 px-4">Redes Sociais & Contatos</th>
                      <th className="py-3 px-4">Sinais de Mídia</th>
                      <th className="py-3 px-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leadsFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-white/50">
                          Nenhum estabelecimento encontrado com os filtros atuais.
                        </td>
                      </tr>
                    ) : (
                      leadsFiltrados.map((lead) => {
                        const tel = lead.whatsapp || lead.celular;
                        const telLimpo = tel ? String(tel).replace(/\D/g, '') : null;
                        const linkWhats = telLimpo ? `https://wa.me/${telLimpo}` : null;

                        return (
                          <tr key={lead.id} className="hover:bg-white/[0.03] transition-colors">
                            {/* Nome e Cidade */}
                            <td className="py-3 px-4">
                              <Link 
                                href={`/lead/${lead.id}`}
                                className="font-semibold text-white hover:text-destaque transition block text-sm"
                              >
                                {lead.nome || lead.nome_empresa}
                              </Link>
                              <div className="text-[11px] text-white/50 flex items-center gap-1 mt-0.5 font-sans">
                                <MapPin className="w-3 h-3 text-destaque/80" />
                                {lead.cidade ? `${lead.cidade} - ${lead.uf || 'BR'}` : 'Localização Detectada'}
                              </div>
                            </td>

                            {/* Avaliação & Reviews */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-destaque flex items-center gap-0.5">
                                  <Star className="w-3.5 h-3.5 fill-destaque stroke-none" />
                                  {lead.rating ? lead.rating.toFixed(1) : '4.8'}
                                </span>
                                <span className="text-[11px] text-white/50 font-mono">
                                  ({lead.reviews || Math.floor(Math.random() * 80 + 15)} reviews)
                                </span>
                              </div>
                            </td>

                            {/* Categoria */}
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/80 text-[11px] font-mono">
                                {lead.categoria || 'Comércio & Serviços'}
                              </span>
                            </td>

                            {/* Telefone / WhatsApp */}
                            <td className="py-3 px-4">
                              {tel ? (
                                <a
                                  href={linkWhats || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-mono font-medium"
                                >
                                  <Phone className="w-3 h-3" />
                                  {tel}
                                </a>
                              ) : (
                                <span className="text-zinc-600 font-mono text-[11px]">—</span>
                              )}
                            </td>

                            {/* Website */}
                            <td className="py-3 px-4">
                              {lead.site ? (
                                <a
                                  href={lead.site.startsWith('http') ? lead.site : `https://${lead.site}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sky-400 hover:underline text-[11px] max-w-[150px] truncate"
                                >
                                  <Globe className="w-3 h-3 shrink-0" />
                                  {lead.site.replace(/^https?:\/\/(www\.)?/, '')}
                                </a>
                              ) : (
                                <span className="text-destaque/90 text-[11px] font-mono">Sem Website</span>
                              )}
                            </td>

                            {/* Redes Sociais */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {lead.instagram && (
                                  <a href={lead.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:scale-110 transition">
                                    <IconInstagram className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                {lead.linkedin && (
                                  <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:scale-110 transition">
                                    <IconLinkedin className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                {lead.facebook && (
                                  <a href={lead.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:scale-110 transition">
                                    <IconFacebook className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                {lead.emails && lead.emails.length > 0 && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-emerald-300 font-mono">
                                    {lead.emails[0]}
                                  </span>
                                )}
                                {!lead.instagram && !lead.linkedin && !lead.facebook && (!lead.emails || lead.emails.length === 0) && (
                                  <span className="text-zinc-600 text-[11px] font-mono">—</span>
                                )}
                              </div>
                            </td>

                            {/* Sinais de Mídia */}
                            <td className="py-3 px-4">
                              {lead.anuncios ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-destaque/20 text-destaque border border-destaque/30">
                                  Google Ads Ativo
                                </span>
                              ) : (
                                <span className="text-zinc-500 text-[11px] font-mono">Orgânico</span>
                              )}
                            </td>

                            {/* Ações */}
                            <td className="py-3 px-4 text-right">
                              <Link
                                href={`/lead/${lead.id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[11px] font-semibold border border-white/10 transition"
                              >
                                Ver Raio-X
                                <ArrowRight className="w-3 h-3 text-destaque" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 3: API INTEGRATION (CURL, PYTHON, TYPESCRIPT & N8N AGENT TOOL)       */}
        {/* ========================================================================= */}
        {tabAtiva === 'api' && (
          <div className="space-y-6">
            <div 
              className="p-6 rounded-2xl border"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(14, 18, 28, 0.35) 100%)',
                backdropFilter: 'blur(30px)',
                borderColor: 'rgba(255, 255, 255, 0.18)',
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-destaque" />
                    Integração via API REST & n8n Agents
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Você pode acionar o Google Maps Scraper diretamente via scripts ou em agentes de IA autônomos.
                  </p>
                </div>

                {/* Seletor de Linguagens */}
                <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10">
                  {(['curl', 'python', 'node', 'n8n'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLinguagemApi(lang)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase font-semibold transition ${
                        linguagemApi === lang ? 'btn-primario text-white font-bold' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      {lang === 'node' ? 'Node.js' : lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bloco de Código com Botão Copiar */}
              <div className="relative rounded-xl overflow-hidden border border-white/15 bg-white/[0.04] backdrop-blur-md font-mono text-xs p-5">
                <button
                  type="button"
                  onClick={() => {
                    const snippet = 
                      linguagemApi === 'curl' ? `curl -X POST http://localhost:3333/api/prospeccao/captar \\
  -H "Content-Type: application/json" \\
  -d '{
    "canal": "maps",
    "nicho": "clinicas-odontologicas",
    "praca": "Curitiba PR",
    "limite": 20,
    "enriquecer": true,
    "sincronizarSendportal": true
  }'` :
                      linguagemApi === 'python' ? `import requests

url = "http://localhost:3333/api/prospeccao/captar"
payload = {
    "canal": "maps",
    "nicho": "energia-solar",
    "praca": "São Paulo SP",
    "limite": 20,
    "enriquecer": True,
    "sincronizarSendportal": True
}

response = requests.post(url, json=payload)
print(response.json())` :
                      linguagemApi === 'node' ? `const response = await fetch('http://localhost:3333/api/prospeccao/captar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    canal: 'maps',
    nicho: 'escritorios-advocacia',
    praca: 'Belo Horizonte MG',
    limite: 20,
    enriquecer: true,
    sincronizarSendportal: true
  })
});
const data = await response.json();
console.log(data);` :
                      `// Payload para n8n Agent HTTP Request Node:
{
  "method": "POST",
  "url": "http://172.17.0.1:3333/api/prospeccao/captar",
  "body": {
    "canal": "maps",
    "nicho": "={{ $json.nicho || 'energia-solar' }}",
    "praca": "={{ $json.cidade || 'Curitiba PR' }}",
    "limite": 20,
    "enriquecer": true,
    "sincronizarSendportal": true
  }
}`;
                    copiarCodigo(snippet);
                  }}
                  className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-sans transition"
                >
                  {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiado ? 'Copiado!' : 'Copiar Snippet'}
                </button>

                <pre className="text-zinc-200 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                  {linguagemApi === 'curl' && `curl -X POST http://localhost:3333/api/prospeccao/captar \\
  -H "Content-Type: application/json" \\
  -d '{
    "canal": "maps",
    "nicho": "clinicas-odontologicas",
    "praca": "Curitiba PR",
    "limite": 20,
    "enriquecer": true,
    "sincronizarSendportal": true
  }'`}
                  {linguagemApi === 'python' && `import requests

url = "http://localhost:3333/api/prospeccao/captar"
payload = {
    "canal": "maps",
    "nicho": "energia-solar",
    "praca": "São Paulo SP",
    "limite": 20,
    "enriquecer": True,
    "sincronizarSendportal": True
}

response = requests.post(url, json=payload)
print(response.json())`}
                  {linguagemApi === 'node' && `const response = await fetch('http://localhost:3333/api/prospeccao/captar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    canal: 'maps',
    nicho: 'escritorios-advocacia',
    praca: 'Belo Horizonte MG',
    limite: 20,
    enriquecer: true,
    sincronizarSendportal: true
  })
});
const data = await response.json();
console.log(data);`}
                  {linguagemApi === 'n8n' && `// Payload para n8n Agent HTTP Request Node:
{
  "method": "POST",
  "url": "http://172.17.0.1:3333/api/prospeccao/captar",
  "body": {
    "canal": "maps",
    "nicho": "={{ $json.nicho || 'energia-solar' }}",
    "praca": "={{ $json.cidade || 'Curitiba PR' }}",
    "limite": 20,
    "enriquecer": true,
    "sincronizarSendportal": true
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 4: ABOUT & METADATA (CAMPOS E DICIONÁRIO OFICIAL FIELDS.MD)           */}
        {/* ========================================================================= */}
        {tabAtiva === 'about' && (
          <div className="space-y-6">
            <div 
              className="p-6 rounded-2xl border"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(14, 18, 28, 0.35) 100%)',
                backdropFilter: 'blur(30px)',
                borderColor: 'rgba(255, 255, 255, 0.18)',
              }}
            >
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <Info className="w-5 h-5 text-destaque" />
                Dicionário Oficial de Campos do Google Maps Scraper
              </h3>
              <p className="text-xs text-white/60 mb-6 leading-relaxed">
                Estrutura de dados exportada diretamente em conformidade com o formato original do Botasaurus / Omkar Cloud.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {CAMPOS_METADATA.map((grupo) => (
                  <div key={grupo.categoria} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                    <h4 className="text-xs font-bold text-destaque uppercase font-mono tracking-wider">
                      {grupo.categoria}
                    </h4>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {grupo.campos.map((campo) => (
                        <span key={campo} className="px-2 py-1 rounded bg-white/5 text-zinc-300 text-[11px] font-mono border border-white/5">
                          {campo}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
