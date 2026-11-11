'use client';

import React, { useState, useEffect } from 'react';
import {
  Target,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Layers,
  Activity,
  Mail,
  RefreshCw,
  Play,
  RotateCcw,
  ExternalLink
} from 'lucide-react';

export function DemoIntroOverlay() {
  const [visivel, setVisivel] = useState(true);
  const [saindo, setSaindo] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(6);
  const [pausado, setPausado] = useState(false);
  const [etapasProntas, setEtapasProntas] = useState<number[]>([]);

  // Sequência de ativação dos módulos no card de diagnóstico
  useEffect(() => {
    const t1 = setTimeout(() => setEtapasProntas((p) => [...p, 0]), 400);
    const t2 = setTimeout(() => setEtapasProntas((p) => [...p, 1]), 800);
    const t3 = setTimeout(() => setEtapasProntas((p) => [...p, 2]), 1200);
    const t4 = setTimeout(() => setEtapasProntas((p) => [...p, 3]), 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  // Timer de auto-inicialização suave
  useEffect(() => {
    if (!visivel || saindo || pausado) return;
    if (tempoRestante <= 0) {
      entrarNaDemo();
      return;
    }
    const timer = setInterval(() => {
      setTempoRestante((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [tempoRestante, pausado, visivel, saindo]);

  const entrarNaDemo = () => {
    if (saindo) return;
    setSaindo(true);
    // Dispara evento para cascatear a animação dos elementos da página
    window.dispatchEvent(new CustomEvent('demo-iniciada'));
    setTimeout(() => {
      setVisivel(false);
      setSaindo(false);
    }, 750);
  };

  const reiniciarDemo = () => {
    setTempoRestante(8);
    setSaindo(false);
    setVisivel(true);
    setEtapasProntas([0, 1, 2, 3]);
  };

  // Se não estiver visível, exibe apenas a pílula de reinicialização no canto inferior
  if (!visivel) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        <button
          type="button"
          onClick={reiniciarDemo}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold text-white/90 hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
          style={{
            background: 'rgba(14, 18, 28, 0.70)',
            backdropFilter: 'blur(24px) saturate(190%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
          }}
          title="Reiniciar apresentação inicial de portfólio"
        >
          <Sparkles className="w-3.5 h-3.5 text-destaque animate-spin" style={{ animationDuration: '6s' }} />
          <span>Modo Demo Ativo</span>
          <span className="w-1 h-3 bg-white/20 rounded-full" />
          <span className="text-[11px] text-white/60 hover:text-white flex items-center gap-1 font-normal">
            <RotateCcw className="w-3 h-3 text-white/70" />
            Reiniciar Apresentação
          </span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-700 ${
        saindo
          ? 'opacity-0 scale-[0.97] blur-md pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(circle at center, rgba(14, 18, 28, 0.78) 0%, rgba(8, 10, 15, 0.94) 100%)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
      }}
    >
      {/* Efeito sutil de brilho focal no centro */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(var(--accent-rgb, 250, 66, 0), 0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Cartão Mestre de Apresentação da Demonstração */}
      <div
        className="relative w-full max-w-3xl rounded-3xl p-6 sm:p-9 border select-none transition-all duration-500 overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(36px) saturate(210%)',
          WebkitBackdropFilter: 'blur(36px) saturate(210%)',
          borderColor: 'rgba(255, 255, 255, 0.18)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
        }}
      >
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/15 text-[11px] font-mono font-medium text-white/90">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PORTFÓLIO DE SOFTWARE · MATEUS CELESTINO</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destaque/15 border border-destaque/30 text-[11px] font-mono font-bold text-destaque">
            <Sparkles className="w-3.5 h-3.5" />
            <span>LIVE INTERACTIVE SHOWCASE</span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="flex items-start gap-4 sm:gap-5 mb-6">
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-xl"
            style={{
              background: 'var(--accent-gradient)',
              boxShadow: '0 12px 35px rgba(var(--accent-rgb, 250, 66, 0), 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
            }}
          >
            <Target className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display flex items-center gap-2.5">
              <span>Client Hunter</span>
              <span className="text-xs px-2 py-0.5 rounded-md font-mono font-bold bg-white/10 text-white border border-white/20">
                PRO v2.0
              </span>
            </h1>
            <p className="text-sm sm:text-base text-white/70 font-light mt-1 leading-snug">
              Suíte Unificada de Prospecção Multicanal, Business Intelligence &amp; Cold Outreach Enterprise
            </p>
          </div>
        </div>

        {/* 4 Pilares Arquiteturais em Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-center gap-2 text-xs font-semibold text-white mb-1">
              <div className="w-6 h-6 rounded-lg bg-destaque/20 flex items-center justify-center text-destaque">
                <Target className="w-3.5 h-3.5" />
              </div>
              <span>1. Multi-Scraper Multicanal</span>
            </div>
            <p className="text-[11px] text-white/60 font-light leading-relaxed">
              Google Maps profundo sem chaves pagas, Instagram, LinkedIn e Web Crawler deduplicado.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-center gap-2 text-xs font-semibold text-white mb-1">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span>2. BI &amp; Enriquecimento Autônomo</span>
            </div>
            <p className="text-[11px] text-white/60 font-light leading-relaxed">
              Dossiês corporativos com CNPJ, sócios, auditoria de Tech Stack e síntese de pitches persuasivos.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-center gap-2 text-xs font-semibold text-white mb-1">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <span>3. SendPortal &amp; SuperPool</span>
            </div>
            <p className="text-[11px] text-white/60 font-light leading-relaxed">
              Cluster distribuído de 8 contas Resend em rotação, 24.000 envios/dia e pixel de abertura 1x1.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-center gap-2 text-xs font-semibold text-white mb-1">
              <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <span>4. Apple Liquid Glass &amp; WebGL</span>
            </div>
            <p className="text-[11px] text-white/60 font-light leading-relaxed">
              Interface translúcida mobile-first com 37 shaders dinâmicos e paridade total com agentes de IA.
            </p>
          </div>
        </div>

        {/* Status de Inicialização / Privacy Shield */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/20 mb-6">
          <div className="flex items-center justify-between text-xs font-medium text-emerald-400 mb-2">
            <span className="flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              PRIVACY SHIELD ATIVO &middot; DATASET HIGIENIZADO
            </span>
            <span className="text-[11px] text-emerald-400/80 font-mono">
              {etapasProntas.length} / 4 PRONTO
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-white/70">
            <div className="flex items-center gap-1.5">
              <CheckCircle2
                className={`w-3.5 h-3.5 transition-colors ${
                  etapasProntas.includes(0) ? 'text-emerald-400' : 'text-white/20'
                }`}
              />
              <span>Scraper Engine</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2
                className={`w-3.5 h-3.5 transition-colors ${
                  etapasProntas.includes(1) ? 'text-emerald-400' : 'text-white/20'
                }`}
              />
              <span>BI Pipeline</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2
                className={`w-3.5 h-3.5 transition-colors ${
                  etapasProntas.includes(2) ? 'text-emerald-400' : 'text-white/20'
                }`}
              />
              <span>SuperPool 8 Nodes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2
                className={`w-3.5 h-3.5 transition-colors ${
                  etapasProntas.includes(3) ? 'text-emerald-400' : 'text-white/20'
                }`}
              />
              <span>Dados Mock Fictícios</span>
            </div>
          </div>
        </div>

        {/* Ação Primária & Controles de Timer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-white/50 font-light flex items-center gap-2 order-2 sm:order-1">
            <button
              type="button"
              onClick={() => setPausado(!pausado)}
              className="px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white transition-colors border border-white/10 cursor-pointer"
            >
              {pausado ? 'Continuar Timer' : 'Pausar Timer'}
            </button>
            <span>
              {!pausado ? `Entrando em ${tempoRestante}s...` : 'Timer pausado para leitura'}
            </span>
          </div>

          <button
            type="button"
            onClick={entrarNaDemo}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-white text-sm font-bold transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer border border-white/30 order-1 sm:order-2"
            style={{
              background: 'var(--accent-gradient)',
              boxShadow: '0 8px 30px rgba(var(--accent-rgb, 250, 66, 0), 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.45)',
            }}
          >
            <span>Explorar Demonstração Interativa</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Barra de Progresso do Timer Suave */}
        {!pausado && (
          <div className="w-full h-1 bg-white/[0.08] rounded-full mt-5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-destaque to-amber-400 transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${((6 - tempoRestante) / 6) * 100}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
