'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Server, 
  ShieldCheck, 
  Zap, 
  Activity, 
  CheckCircle2, 
  RefreshCw, 
  Lock, 
  Clock, 
  Send,
  Layers,
  Cpu,
  Search,
  Filter,
  AlertTriangle,
  Flame,
  Globe,
  Bot,
  Sparkles,
  Mail,
  Compass,
  ArrowUpRight,
  TrendingUp,
  ShieldAlert,
  SlidersHorizontal,
  Check,
  ChevronDown
} from 'lucide-react';
import { LiveResourcesData, ApiKeyResource } from '@/lib/superpool';

interface Props {
  dadosIniciais: LiveResourcesData | null;
}

export function RecursosUsageView({ dadosIniciais }: Props) {
  const [dados, setDados] = useState<LiveResourcesData | null>(dadosIniciais);
  const [carregando, setCarregando] = useState(false);
  const [notificacao, setNotificacao] = useState<string | null>(null);

  const [abaAtiva, setAbaAtiva] = useState<'todos' | 'apify' | 'firecrawl' | 'resend' | 'exa' | 'youcom'>('todos');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativo' | 'alerta'>('todos');
  const [busca, setBusca] = useState('');

  // Sincronizar em tempo real
  const handleSincronizar = async () => {
    try {
      setCarregando(true);
      const res = await fetch('/api/pool/resources?refresh=1');
      if (res.ok) {
        const novo = await res.json();
        setDados(novo);
        setNotificacao('Telemetria e cotas de API keys atualizadas com sucesso!');
        setTimeout(() => setNotificacao(null), 4000);
      } else {
        setNotificacao('Falha ao sincronizar com o gateway.');
        setTimeout(() => setNotificacao(null), 4000);
      }
    } catch {
      setNotificacao('Erro de conexão com o cluster VPS.');
      setTimeout(() => setNotificacao(null), 4000);
    } finally {
      setCarregando(false);
    }
  };

  // Coleta todas as chaves
  const todasAsChaves: ApiKeyResource[] = dados?.keys_by_provider
    ? [
        ...(dados.keys_by_provider.apify || []),
        ...(dados.keys_by_provider.firecrawl || []),
        ...(dados.keys_by_provider.resend || []),
        ...(dados.keys_by_provider.exa || []),
        ...(dados.keys_by_provider.youcom || []),
      ]
    : [];

  // Filtra as chaves pela aba, status e busca
  const chavesFiltradas = todasAsChaves.filter((k) => {
    // Filtro por provedor
    if (abaAtiva !== 'todos' && k.provider !== abaAtiva) return false;

    // Filtro por status
    if (filtroStatus === 'ativo' && k.status !== 'active') return false;
    if (filtroStatus === 'alerta' && k.status === 'active') return false;

    // Filtro por texto de busca
    if (busca.trim()) {
      const termo = busca.toLowerCase();
      const matchAccount = k.account.toLowerCase().includes(termo);
      const matchMask = k.key_mask.toLowerCase().includes(termo);
      const matchProv = k.provider.toLowerCase().includes(termo);
      if (!matchAccount && !matchMask && !matchProv) return false;
    }

    return true;
  });

  const summaries = dados?.summaries;

  return (
    <div className="p-4 sm:p-6 lg:p-9 max-w-[1600px] mx-auto space-y-7 relative z-10 text-white">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-white/50">
              SuperPool Multi-Engine Gateway · Telemetria 24/7
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase font-display flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-destaque" />
            Recursos & Usage de API Keys
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1 font-light leading-relaxed">
            Monitoramento visual em tempo real de saldo, cotas mensais de scraping, buscas neurais e despachos de e-mail.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSincronizar}
            disabled={carregando}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/20 active:scale-95 transition-all cursor-pointer shadow-lg disabled:opacity-50"
            style={{
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${carregando ? 'animate-spin text-destaque' : 'text-emerald-400'}`} />
            <span>{carregando ? 'Sincronizando...' : 'Sincronizar em Tempo Real'}</span>
          </button>

          <Link
            href="/campanhas/nova"
            className="flex items-center gap-2 px-4 py-2.5 btn-primario rounded-xl text-xs font-semibold shadow-lg transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            Nova Campanha
          </Link>
        </div>
      </div>

      {/* Banner de Feedback / Notificação */}
      {notificacao && (
        <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-300 shadow-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{notificacao}</span>
        </div>
      )}

      {/* 4 Grand Metric Cards de Recursos Disponíveis */}
      {summaries && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Apify Actors */}
          <div 
            className="p-5 rounded-2xl relative overflow-hidden group hover:scale-[1.01] transition-all duration-300"
            style={{
              background: 'rgba(255, 255, 255, 0.045)',
              backdropFilter: 'blur(28px) saturate(180%)',
              WebkitBackdropFilter: 'blur(28px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.20)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-destaque" />
                Apify Actors (Scraping)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-destaque/15 text-destaque border border-destaque/30 font-semibold">
                {summaries.apify.active_keys}/{summaries.apify.total_keys} Ativas
              </span>
            </div>

            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white flex items-baseline gap-1">
                <span className="text-emerald-400">${summaries.apify.available.toFixed(2)}</span>
                <span className="text-xs text-white/40 font-normal">/ ${summaries.apify.capacity.toFixed(2)} USD</span>
              </div>
              <p className="text-[11px] text-white/50 mt-0.5">Saldo real disponível para scraping</p>
            </div>

            {/* Barra Visual de Recurso */}
            <div className="mt-3.5 space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-white/60">Disponibilidade</span>
                <span className="text-emerald-400 font-bold">{summaries.apify.pct_available}% livre</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/40 border border-white/10 overflow-hidden p-0.5">
                <div 
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-destaque to-emerald-400"
                  style={{ width: `${Math.min(100, Math.max(5, summaries.apify.pct_available))}%` }}
                />
              </div>
            </div>
          </div>

          {/* 2. Firecrawl Scraper */}
          <div 
            className="p-5 rounded-2xl relative overflow-hidden group hover:scale-[1.01] transition-all duration-300"
            style={{
              background: 'rgba(255, 255, 255, 0.045)',
              backdropFilter: 'blur(28px) saturate(180%)',
              WebkitBackdropFilter: 'blur(28px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.20)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-400" />
                Firecrawl (Deep Web)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold">
                {summaries.firecrawl.active_keys}/{summaries.firecrawl.total_keys} Ativas
              </span>
            </div>

            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white flex items-baseline gap-1">
                <span className="text-emerald-400">{summaries.firecrawl.available.toLocaleString('pt-BR')}</span>
                <span className="text-xs text-white/40 font-normal">/ {summaries.firecrawl.capacity.toLocaleString('pt-BR')}</span>
              </div>
              <p className="text-[11px] text-white/50 mt-0.5">Créditos de raspagem profunda</p>
            </div>

            {/* Barra Visual de Recurso */}
            <div className="mt-3.5 space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-white/60">Disponibilidade</span>
                <span className="text-emerald-400 font-bold">{summaries.firecrawl.pct_available}% livre</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/40 border border-white/10 overflow-hidden p-0.5">
                <div 
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-rose-400 to-emerald-400"
                  style={{ width: `${Math.min(100, Math.max(5, summaries.firecrawl.pct_available))}%` }}
                />
              </div>
            </div>
          </div>

          {/* 3. Resend ESP Outreach */}
          <div 
            className="p-5 rounded-2xl relative overflow-hidden group hover:scale-[1.01] transition-all duration-300"
            style={{
              background: 'rgba(255, 255, 255, 0.045)',
              backdropFilter: 'blur(28px) saturate(180%)',
              WebkitBackdropFilter: 'blur(28px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.20)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-sky-400" />
                Resend (Outreach ESP)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold">
                {summaries.resend.active_keys}/{summaries.resend.total_keys} Ativas
              </span>
            </div>

            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white flex items-baseline gap-1">
                <span className="text-sky-300">{summaries.resend.available.toLocaleString('pt-BR')}</span>
                <span className="text-xs text-white/40 font-normal">/ {summaries.resend.capacity.toLocaleString('pt-BR')}</span>
              </div>
              <p className="text-[11px] text-white/50 mt-0.5">Capacidade mensal de envios de e-mail</p>
            </div>

            {/* Barra Visual de Recurso */}
            <div className="mt-3.5 space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-white/60">Disponibilidade</span>
                <span className="text-sky-400 font-bold">{summaries.resend.pct_available}% livre</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/40 border border-white/10 overflow-hidden p-0.5">
                <div 
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-sky-500 to-emerald-400"
                  style={{ width: `${Math.min(100, Math.max(5, summaries.resend.pct_available))}%` }}
                />
              </div>
            </div>
          </div>

          {/* 4. Exa AI Neural Search */}
          <div 
            className="p-5 rounded-2xl relative overflow-hidden group hover:scale-[1.01] transition-all duration-300"
            style={{
              background: 'rgba(255, 255, 255, 0.045)',
              backdropFilter: 'blur(28px) saturate(180%)',
              WebkitBackdropFilter: 'blur(28px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.20)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Exa AI (Neural Search)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold">
                {summaries.exa.active_keys}/{summaries.exa.total_keys} Ativas
              </span>
            </div>

            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white flex items-baseline gap-1">
                <span className="text-purple-300">{summaries.exa.available.toLocaleString('pt-BR')}</span>
                <span className="text-xs text-white/40 font-normal">/ {summaries.exa.capacity.toLocaleString('pt-BR')}</span>
              </div>
              <p className="text-[11px] text-white/50 mt-0.5">Consultas semânticas disponíveis</p>
            </div>

            {/* Barra Visual de Recurso */}
            <div className="mt-3.5 space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-white/60">Disponibilidade</span>
                <span className="text-purple-400 font-bold">{summaries.exa.pct_available}% livre</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/40 border border-white/10 overflow-hidden p-0.5">
                <div 
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-purple-500 to-emerald-400"
                  style={{ width: `${Math.min(100, Math.max(5, summaries.exa.pct_available))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cluster Health Banner & Summary */}
      <div 
        className="p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderColor: 'rgba(255, 255, 255, 0.10)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Cluster SuperPool VPS · Integridade de Chaves
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                {dados?.overall_health_score || 0}% Saudável
              </span>
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              {dados?.active_keys || 0} chaves ativas e operacionais de um total de {dados?.total_keys || 58} chaves gerenciadas com rotação fail-safe.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-white/40 block font-mono">ÚLTIMA ATUALIZAÇÃO</span>
            <span className="text-xs text-white/70 font-mono">
              {dados?.updated_at ? new Date(dados.updated_at).toLocaleTimeString('pt-BR') : 'Tempo Real'}
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros, Abas e Busca de Chaves */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-white/10 pb-3">
          {/* Abas por Motor */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setAbaAtiva('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                abaAtiva === 'todos'
                  ? 'bg-white/15 text-white border border-white/30 shadow-inner'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              Todos ({todasAsChaves.length})
            </button>

            <button
              type="button"
              onClick={() => setAbaAtiva('apify')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                abaAtiva === 'apify'
                  ? 'bg-destaque/25 text-destaque border border-destaque/40 shadow-inner'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-destaque" />
              Apify ({dados?.keys_by_provider.apify?.length || 0})
            </button>

            <button
              type="button"
              onClick={() => setAbaAtiva('firecrawl')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                abaAtiva === 'firecrawl'
                  ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 shadow-inner'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              Firecrawl ({dados?.keys_by_provider.firecrawl?.length || 0})
            </button>

            <button
              type="button"
              onClick={() => setAbaAtiva('resend')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                abaAtiva === 'resend'
                  ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40 shadow-inner'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-sky-400" />
              Resend ({dados?.keys_by_provider.resend?.length || 0})
            </button>

            <button
              type="button"
              onClick={() => setAbaAtiva('exa')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                abaAtiva === 'exa'
                  ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40 shadow-inner'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Exa AI ({dados?.keys_by_provider.exa?.length || 0})
            </button>

            <button
              type="button"
              onClick={() => setAbaAtiva('youcom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                abaAtiva === 'youcom'
                  ? 'bg-zinc-700/50 text-zinc-300 border border-zinc-600 shadow-inner'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              You.com ({dados?.keys_by_provider.youcom?.length || 0})
            </button>
          </div>

          {/* Filtros de Status & Busca */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 bg-white/[0.05] p-0.5 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setFiltroStatus('todos')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filtroStatus === 'todos' ? 'bg-white/20 text-white font-semibold' : 'text-white/60'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFiltroStatus('ativo')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filtroStatus === 'ativo' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-white/60'
                }`}
              >
                Ativos
              </button>
              <button
                type="button"
                onClick={() => setFiltroStatus('alerta')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filtroStatus === 'alerta' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-white/60'
                }`}
              >
                Alerta
              </button>
            </div>

            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar conta ou chave..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-destaque/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Visual de Chaves de API com Medidor de Recursos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-destaque" />
            Inventário Detalhado de Chaves & Recursos ({chavesFiltradas.length} exibidas)
          </h2>
          <span className="text-xs text-white/40 font-mono">
            {chavesFiltradas.filter((k) => k.status === 'active').length} operantes
          </span>
        </div>

        {chavesFiltradas.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-white/10 bg-white/[0.02]">
            <Search className="w-8 h-8 text-white/30 mx-auto mb-2" />
            <p className="text-sm text-white/60">Nenhuma chave de API encontrada com os filtros selecionados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {chavesFiltradas.map((k, idx) => {
              // Cálculo de cor da barra
              let barraCor = 'from-emerald-500 to-teal-400';
              let badgeStatus = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
              let statusLabel = 'Ativa';

              if (k.status === 'exhausted' || k.pct_available <= 5) {
                barraCor = 'from-rose-600 to-rose-400';
                badgeStatus = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
                statusLabel = 'Exaurida';
              } else if (k.pct_available < 40) {
                barraCor = 'from-destaque to-destaque-hover';
                badgeStatus = 'bg-destaque/15 text-destaque border-destaque/30';
                statusLabel = 'Alerta Cota';
              }

              // Ícone por motor
              let MotorIcone = Globe;
              let motorNome = k.provider.toUpperCase();
              let corTextoMotor = 'text-white/60';

              if (k.provider === 'apify') {
                MotorIcone = Bot;
                motorNome = 'Apify Actor';
                corTextoMotor = 'text-destaque';
              } else if (k.provider === 'firecrawl') {
                MotorIcone = Flame;
                motorNome = 'Firecrawl';
                corTextoMotor = 'text-rose-400';
              } else if (k.provider === 'resend') {
                MotorIcone = Mail;
                motorNome = 'Resend ESP';
                corTextoMotor = 'text-sky-400';
              } else if (k.provider === 'exa') {
                MotorIcone = Sparkles;
                motorNome = 'Exa AI';
                corTextoMotor = 'text-purple-400';
              }

              return (
                <div
                  key={`${k.provider}_${k.account}_${idx}`}
                  className="p-4 sm:p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between"
                  style={{
                    background: 'rgba(255, 255, 255, 0.035)',
                    backdropFilter: 'blur(24px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                    borderColor: 'rgba(255, 255, 255, 0.10)',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <div>
                    {/* Header do Card */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <MotorIcone className={`w-3.5 h-3.5 ${corTextoMotor}`} />
                          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${corTextoMotor}`}>
                            {motorNome}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-0.5 truncate max-w-[200px]">
                          {k.account}
                        </h4>
                      </div>

                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold border ${badgeStatus} flex items-center gap-1`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${k.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        {statusLabel}
                      </span>
                    </div>

                    {/* Mascara da Chave */}
                    <div className="flex items-center justify-between text-xs py-1 text-white/70 font-mono">
                      <span className="flex items-center gap-1.5 text-white/50 text-[11px]">
                        <Lock className="w-3 h-3" />
                        Chave:
                      </span>
                      <span className="bg-black/30 px-2 py-0.5 rounded border border-white/10 text-[11px]">
                        {k.key_mask}
                      </span>
                    </div>

                    {/* MEDIDOR VISUAL DE RECURSO DISPONÍVEL (Destaque Principal) */}
                    <div className="my-3.5 p-3 rounded-xl bg-white/[0.04] backdrop-blur-sm border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-white/50">
                          Recursos Disponíveis
                        </span>
                        <span className="text-xs font-mono font-bold text-white">
                          {k.unit === 'USD' ? `$${k.available.toFixed(2)}` : k.available.toLocaleString('pt-BR')}{' '}
                          <span className="text-[10px] text-white/50 font-normal">
                            de {k.unit === 'USD' ? `$${k.capacity.toFixed(2)}` : k.capacity.toLocaleString('pt-BR')} {k.unit}
                          </span>
                        </span>
                      </div>

                      {/* Barra de Progresso do Recurso */}
                      <div className="w-full h-2.5 rounded-full bg-white/5 border border-white/10 overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${barraCor}`}
                          style={{
                            width: `${Math.min(100, Math.max(3, k.pct_available))}%`,
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-white/50 font-mono pt-0.5">
                        <span>
                          Consumido:{' '}
                          <strong className="text-white">
                            {k.unit === 'USD' ? `$${k.used.toFixed(2)}` : k.used.toLocaleString('pt-BR')}
                          </strong>
                        </span>
                        <span>
                          {k.reset_date ? `Renova: ${k.reset_date}` : `${k.pct_available}% Livre`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Estatísticas Operacionais no Rodapé */}
                  <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[10px] font-mono text-white/60">
                    <div>
                      <span className="text-white/40 block">REQUISIÇÕES</span>
                      <span className="text-white font-bold">{k.requests_total} chamadas</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white/40 block">SUCESSO / FALHA</span>
                      <span>
                        <strong className="text-emerald-400">{k.requests_success}</strong>
                        <span className="text-white/30"> / </span>
                        <strong className="text-rose-400">{k.requests_failed}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Gateway & Infrastructure Info Box */}
      <div 
        className="p-5 rounded-2xl border grid grid-cols-1 md:grid-cols-3 gap-5 text-xs"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderColor: 'rgba(255, 255, 255, 0.10)',
        }}
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Server className="w-4 h-4 text-destaque" />
            <strong className="text-white font-sans text-xs">Gateway VPS Primário</strong>
          </div>
          <p className="text-white/60 font-mono text-[11px]">http://100.99.207.96:5057/api/pool</p>
          <p className="text-[11px] text-white/50 leading-relaxed font-light">
            Túnel privado Tailscale com balanceamento de carga automático e circuit breaker em caso de erro 429/402.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            <strong className="text-white font-sans text-xs">Fallback Localhost</strong>
          </div>
          <p className="text-white/60 font-mono text-[11px]">http://127.0.0.1:5057</p>
          <p className="text-[11px] text-white/50 leading-relaxed font-light">
            Roteamento de contingência local que garante continuidade operacional se houver latência na rede externa.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <strong className="text-white font-sans text-xs">SLA & Blindagem</strong>
          </div>
          <p className="text-emerald-400 font-semibold font-sans text-[11px]">Alta Disponibilidade Ativa</p>
          <p className="text-[11px] text-white/50 leading-relaxed font-light">
            Revalidação instantânea de chaves ativas, preservando limites gratuitos e maximizando taxa de entrega.
          </p>
        </div>
      </div>
    </div>
  );
}
