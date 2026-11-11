'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Palette, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Sliders, 
  Layers, 
  ShieldCheck, 
  Smartphone, 
  Globe, 
  Save, 
  Zap, 
  Target,
  ArrowRight
} from 'lucide-react';
import { Titulo, Pagina } from '@/components/ui';
import { 
  ACCENT_COLOR_PRESETS, 
  SECONDARY_COLOR_PRESETS, 
  applyAccentColor,
  lightenHex
} from '@/components/McpOsBackgroundProvider';

export default function PaginaConfiguracoes() {
  const [corPrimaria, setCorPrimaria] = useState('#FA4200');
  const [corSecundaria, setCorSecundaria] = useState('#FF7733');
  const [inputHexPrimaria, setInputHexPrimaria] = useState('#FA4200');
  const [inputHexSecundaria, setInputHexSecundaria] = useState('#FF7733');
  const [mensagemSucesso, setMensagemSucesso] = useState(false);
  const [isMobileApp, setIsMobileApp] = useState(false);

  useEffect(() => {
    // Detectar ambiente Android WebView bridge
    if (typeof window !== 'undefined' && (window as any).AndroidApp) {
      setIsMobileApp(true);
    }

    // Carregar cores salvas do localStorage
    try {
      let savedPrimary = localStorage.getItem('client_hunter_accent_color') || '#FA4200';
      let savedSecondary = localStorage.getItem('client_hunter_secondary_color') || '#FF7733';

      if (savedSecondary.toLowerCase() !== '#ff7733' && savedPrimary.toLowerCase() === '#fa4200') {
        savedPrimary = savedSecondary;
      } else if (savedPrimary.toLowerCase() !== '#fa4200' && savedSecondary.toLowerCase() === '#ff7733') {
        savedSecondary = lightenHex(savedPrimary, 15);
      }

      setCorPrimaria(savedPrimary);
      setCorSecundaria(savedSecondary);
      setInputHexPrimaria(savedPrimary);
      setInputHexSecundaria(savedSecondary);
      applyAccentColor(savedPrimary, savedSecondary);
    } catch (e) {
      console.warn('Erro ao ler cores salvas:', e);
    }
  }, []);

  const aplicarCores = useCallback((primaria: string, secundaria: string) => {
    setCorPrimaria(primaria);
    setCorSecundaria(secundaria);
    setInputHexPrimaria(primaria);
    setInputHexSecundaria(secundaria);

    try {
      localStorage.setItem('client_hunter_accent_color', primaria);
      localStorage.setItem('client_hunter_secondary_color', secundaria);
    } catch (e) {}

    // Aplica nos tokens globais de estilo
    applyAccentColor(primaria, secundaria);

    // Notifica outros componentes da aplicação
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('sincronizar-cores-sistema', {
          detail: { primary: primaria, secondary: secundaria },
        })
      );

      // Feedback háptico se estiver rodando no APK Android
      try {
        if ((window as any).AndroidApp) {
          (window as any).AndroidApp.vibrate?.(40);
        }
      } catch (e) {}
    }
  }, []);

  // Ao escolher a Cor Primária
  const selecionarCorPrimaria = useCallback((hex: string) => {
    let sec = corSecundaria;
    if (corSecundaria.toLowerCase() === '#ff7733' || corSecundaria.toLowerCase() === corPrimaria.toLowerCase()) {
      sec = lightenHex(hex, 15);
    }
    aplicarCores(hex, sec);
  }, [corSecundaria, corPrimaria, aplicarCores]);

  // Ao escolher a Cor Secundária
  const selecionarCorSecundaria = useCallback((hex: string) => {
    aplicarCores(corPrimaria, hex);
  }, [corPrimaria, aplicarCores]);

  const handleInputHexPrimaria = (val: string) => {
    setInputHexPrimaria(val);
    const clean = val.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
      selecionarCorPrimaria(clean.toUpperCase());
    } else if (/^[0-9A-Fa-f]{6}$/.test(clean)) {
      selecionarCorPrimaria(('#' + clean).toUpperCase());
    }
  };

  const handleInputHexSecundaria = (val: string) => {
    setInputHexSecundaria(val);
    const clean = val.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
      selecionarCorSecundaria(clean.toUpperCase());
    } else if (/^[0-9A-Fa-f]{6}$/.test(clean)) {
      selecionarCorSecundaria(('#' + clean).toUpperCase());
    }
  };

  const handleBlurPrimaria = () => {
    if (!inputHexPrimaria.startsWith('#')) {
      const formatted = '#' + inputHexPrimaria;
      if (/^#[0-9A-Fa-f]{6}$/.test(formatted)) {
        selecionarCorPrimaria(formatted.toUpperCase());
      } else {
        setInputHexPrimaria(corPrimaria);
      }
    } else if (!/^#[0-9A-Fa-f]{6}$/.test(inputHexPrimaria)) {
      setInputHexPrimaria(corPrimaria);
    }
  };

  const handleBlurSecundaria = () => {
    if (!inputHexSecundaria.startsWith('#')) {
      const formatted = '#' + inputHexSecundaria;
      if (/^#[0-9A-Fa-f]{6}$/.test(formatted)) {
        selecionarCorSecundaria(formatted.toUpperCase());
      } else {
        setInputHexSecundaria(corSecundaria);
      }
    } else if (!/^#[0-9A-Fa-f]{6}$/.test(inputHexSecundaria)) {
      setInputHexSecundaria(corSecundaria);
    }
  };

  const handleSalvarManual = () => {
    aplicarCores(corPrimaria, corSecundaria);
    setMensagemSucesso(true);
    try {
      if ((window as any).AndroidApp) {
        (window as any).AndroidApp.toast?.('Identidade visual atualizada com sucesso!');
      }
    } catch (e) {}
    setTimeout(() => setMensagemSucesso(false), 3000);
  };

  const restaurarPadrao = () => {
    aplicarCores('#FA4200', '#FF7733');
    setMensagemSucesso(true);
    setTimeout(() => setMensagemSucesso(false), 3000);
  };

  return (
    <Pagina>
      {/* Cabeçalho Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Titulo sub="Personalização de cores, identidade visual e paridade Web / Android APK">
            Configurações & Identidade Visual
          </Titulo>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={restaurarPadrao}
            className="btn-outline flex items-center gap-2 text-xs py-2 px-3.5 rounded-xl cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão</span>
          </button>
          <button
            type="button"
            onClick={handleSalvarManual}
            className="btn-primario flex items-center gap-2 text-xs py-2 px-4 rounded-xl cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar & Aplicar</span>
          </button>
        </div>
      </div>

      {mensagemSucesso && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
            <span className="font-semibold">
              Cores sincronizadas com sucesso em toda a plataforma Web e no APK Android!
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400/80">LIVE UPDATE</span>
        </div>
      )}

      {/* Grid de Configurações das Cores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* CARD 1: SELETOR DE COR PRIMÁRIA */}
        <div className="cartao p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md border border-white/20"
                style={{ backgroundColor: corPrimaria }}
              >
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-display">Cor Primária do Sistema</h3>
                <p className="text-[11px] text-white/50">Substitui o Laranja Original em botões, badges e destaques</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/20">
              {corPrimaria.toUpperCase()}
            </span>
          </div>

          {/* Presets Rápidos */}
          <div>
            <label className="rotulo mb-2">Presets Rápidos (9 Cores Selecionadas)</label>
            <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
              {ACCENT_COLOR_PRESETS.map((preset) => {
                const ativo = corPrimaria.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => selecionarCorPrimaria(preset.hex)}
                    title={`${preset.nome} (${preset.hex})`}
                    className={`h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      ativo
                        ? 'scale-110 shadow-lg ring-2 ring-white border-white'
                        : 'hover:scale-105 border-white/20'
                    }`}
                    style={{ backgroundColor: preset.hex }}
                  >
                    {ativo && <Check className="w-4 h-4 text-white stroke-[3] drop-shadow" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seletor Livre HTML5 e Input Hex */}
          <div className="pt-2">
            <label className="rotulo mb-2">Seletor Livre ou Código Hexadecimal</label>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              <label className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 border border-white/15 cursor-pointer hover:bg-white/10 transition shrink-0">
                <input
                  type="color"
                  value={corPrimaria}
                  onChange={(e) => selecionarCorPrimaria(e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                />
                <span className="text-xs font-medium text-white/90 whitespace-nowrap">Conta-gotas / Paleta</span>
              </label>
              <div className="relative flex-1 min-w-[130px]">
                <input
                  type="text"
                  value={inputHexPrimaria}
                  onChange={(e) => handleInputHexPrimaria(e.target.value)}
                  onBlur={handleBlurPrimaria}
                  placeholder="#FA4200"
                  maxLength={7}
                  className="campo font-mono text-sm uppercase text-center font-bold tracking-wider"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: SELETOR DE COR SECUNDÁRIA (SOBERANIA ABSOLUTA) */}
        <div className="cartao p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md border border-white/20"
                style={{ backgroundColor: corSecundaria }}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-display">Cor Secundária do Sistema (Harmonia & Realces)</h3>
                <p className="text-[11px] text-white/50">Aplica a cor escolhida em botões secundários, shaders e efeitos da interface</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/20">
              {corSecundaria.toUpperCase()}
            </span>
          </div>

          {/* Presets Rápidos da Cor Secundária */}
          <div>
            <label className="rotulo mb-2">Presets Secundários (9 Cores)</label>
            <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
              {SECONDARY_COLOR_PRESETS.map((preset) => {
                const ativo = corSecundaria.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => selecionarCorSecundaria(preset.hex)}
                    title={`${preset.nome} (${preset.hex})`}
                    className={`h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      ativo
                        ? 'scale-110 shadow-lg ring-2 ring-white border-white'
                        : 'hover:scale-105 border-white/20'
                    }`}
                    style={{ backgroundColor: preset.hex }}
                  >
                    {ativo && <Check className="w-4 h-4 text-white stroke-[3] drop-shadow" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seletor Livre HTML5 e Input Hex Secundária */}
          <div className="pt-2">
            <label className="rotulo mb-2">Seletor Livre Secundário ou Código Hexadecimal</label>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              <label className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 border border-white/15 cursor-pointer hover:bg-white/10 transition shrink-0">
                <input
                  type="color"
                  value={corSecundaria}
                  onChange={(e) => selecionarCorSecundaria(e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                />
                <span className="text-xs font-medium text-white/90 whitespace-nowrap">Conta-gotas / Paleta</span>
              </label>
              <div className="relative flex-1 min-w-[130px]">
                <input
                  type="text"
                  value={inputHexSecundaria}
                  onChange={(e) => handleInputHexSecundaria(e.target.value)}
                  onBlur={handleBlurSecundaria}
                  placeholder="#FF7733"
                  maxLength={7}
                  className="campo font-mono text-sm uppercase text-center font-bold tracking-wider"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 3: PRÉ-VISUALIZAÇÃO EM TEMPO REAL (LIVE PREVIEW) */}
      <div className="cartao p-6 space-y-6 mb-8">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">Pré-visualização da Identidade em Tempo Real</h3>
              <p className="text-[11px] text-white/50">Veja como os componentes reagem instantaneamente à nova paleta</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-destaque/20 text-destaque border border-destaque/30">
              PRIMÁRIA: {corPrimaria}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/20">
              SECUNDÁRIA: {corSecundaria}
            </span>
          </div>
        </div>

        {/* Demonstração de Componentes do Design System */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Caixa de Gradiente Composto */}
          <div 
            className="p-5 rounded-2xl border border-white/25 flex flex-col justify-between text-white shadow-xl relative overflow-hidden min-h-[140px]"
            style={{ background: 'var(--accent-gradient)' }}
          >
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider font-bold opacity-90">Gradiente Dinâmico</span>
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <div className="relative z-10">
              <p className="text-lg font-bold font-display leading-tight">Client Hunter Ultra Glass</p>
              <p className="text-[11px] opacity-80 mt-1">Harmonização entre {corPrimaria} e {corSecundaria}</p>
            </div>
          </div>

          {/* Botões e Ações */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between space-y-3">
            <span className="text-[11px] font-mono uppercase text-white/50 tracking-wider">Botões Interativos</span>
            <div className="space-y-2">
              <button type="button" className="btn-primario w-full text-xs py-2 rounded-xl">
                Botão de Ação Primária
              </button>
              <button type="button" className="btn-secundario w-full text-xs py-2 rounded-xl">
                Botão de Ação Secundária
              </button>
              <button type="button" className="btn-outline w-full text-xs py-2 rounded-xl">
                Botão Contorno Translúcido
              </button>
            </div>
          </div>

          {/* Badges e Realces */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between space-y-3">
            <span className="text-[11px] font-mono uppercase text-white/50 tracking-wider">Badges & Indicadores</span>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                <span className="text-xs text-white/80 font-medium">Status de Extração</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-destaque/20 text-destaque border border-destaque/40">
                  QUALIFICADO
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                <span className="text-xs text-white/80 font-medium">Cluster Multicanal</span>
                <span 
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full text-white border border-white/20"
                  style={{ backgroundColor: corSecundaria }}
                >
                  DISPARO ATIVO
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="w-2 h-2 rounded-full bg-destaque animate-ping" />
                <span className="text-[11px] text-white/60">Sincronização em tempo real ativa</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 4: STATUS DE INTEGRAÇÃO MULTIPLATAFORMA (WEB + APK ANDROID + VPS) */}
      <div className="cartao p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">Status de Paridade Multiplataforma</h3>
              <p className="text-[11px] text-white/50">Sincronização instantânea na Web (VPS) e no App Nativo Android (APK)</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                Web / VPS Oracle
              </span>
              <span className="text-emerald-400 text-[10px] font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full">ATIVO (Porta 3333)</span>
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Tokens CSS dinâmicos e persistência em LocalStorage aplicados imediatamente.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-destaque" />
                Android APK (S22 Ultra)
              </span>
              <span className="text-emerald-400 text-[10px] font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {isMobileApp ? 'BRIDGE CONECTADA' : 'COMPATÍVEL (User 0)'}
              </span>
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Ponte Javascript nativa <code>AndroidApp.setColors</code> e <code>setAccentColor</code> sincronizada.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-destaque" />
                SuperPool Gateway
              </span>
              <span className="text-emerald-400 text-[10px] font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full">ONLINE (Porta 5057)</span>
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Cluster de 58 chaves com rotatividade e paridade total em ambos os clientes.
            </p>
          </div>
        </div>
      </div>
    </Pagina>
  );
}
