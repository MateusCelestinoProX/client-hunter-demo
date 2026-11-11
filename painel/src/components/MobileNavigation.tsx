'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Target,
  MapPin,
  Zap,
  Send,
  Menu,
  X,
  FileText,
  Users,
  Server,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Activity,
  Plus,
  Palette,
  Settings,
  BookOpen,
  Terminal,
} from 'lucide-react';
import { ModalNovoScraper } from './ModalNovoScraper';

export function MobileNavigation() {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalScraperAberto, setModalScraperAberto] = useState(false);

  const linksPrincipais = [
    { href: '/', label: 'Leads', icone: Target },
    { href: '/maps-scraper', label: 'Maps', icone: MapPin },
    // O botão central é o Scraper (Zap)
    { href: '/campanhas', label: 'Outreach', icone: Send },
  ];

  const linksSecundarios = [
    { href: '/documentacao', label: 'Documentação & Manual', icone: BookOpen, destaque: true },
    { href: '/documentacao/ia', label: 'Protocolo IA & MCP Spec', icone: Terminal },
    { href: '/configuracoes', label: 'Configurações & Cores', icone: Settings },
    { href: '/campanhas/nova', label: 'Nova Campanha', icone: Plus },
    { href: '/templates', label: 'Templates de E-mail', icone: FileText },
    { href: '/inscritos', label: 'Inscritos & Listas', icone: Users },
    { href: '/mensagens', label: 'Logs de Despacho', icone: MessageSquare },
    { href: '/provedores', label: 'Recursos & Usage (58 Chaves)', icone: Activity },
  ];

  return (
    <>
      {/* ======================================================== */}
      {/* 1. BOTTOM NAVIGATION BAR TOUCH-FIRST (Fixo no Mobile)    */}
      {/* ======================================================== */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-1.5 border-t select-none"
        style={{
          background: 'rgba(14, 18, 28, 0.48)',
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)',
          borderColor: 'rgba(255, 255, 255, 0.18)',
          boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.28)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)',
        }}
      >
        {/* 1. Leads */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[48px] rounded-xl transition-all ${
            pathname === '/'
              ? 'text-destaque'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Target className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium tracking-tight">Leads</span>
          {pathname === '/' && (
            <span className="w-1.5 h-1.5 rounded-full bg-destaque mt-0.5 shadow-sm shadow-destaque" />
          )}
        </Link>

        {/* 2. Google Maps Scraper */}
        <Link
          href="/maps-scraper"
          className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[48px] rounded-xl transition-all ${
            pathname === '/maps-scraper'
              ? 'text-destaque'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <MapPin className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium tracking-tight">Maps</span>
          {pathname === '/maps-scraper' && (
            <span className="w-1.5 h-1.5 rounded-full bg-destaque mt-0.5 shadow-sm shadow-destaque" />
          )}
        </Link>

        {/* 3. BOTÃO CENTRAL ELEVADO: Multi Scraper Instantâneo */}
        <div className="flex flex-col items-center justify-center -mt-5 px-1">
          <button
            type="button"
            onClick={() => setModalScraperAberto(true)}
            className="w-13 h-13 rounded-2xl flex items-center justify-center text-white border transition-transform active:scale-95 shadow-xl cursor-pointer"
            style={{
              background: 'var(--accent-gradient)',
              borderColor: 'rgba(255, 255, 255, 0.40)',
              boxShadow: '0 8px 25px rgba(var(--accent-rgb, 250, 66, 0), 0.50), inset 0 1px 0 rgba(255, 255, 255, 0.40)',
            }}
            aria-label="Abrir Multi-Scraper"
          >
            <Zap className="w-6 h-6 fill-white" />
          </button>
          <span className="text-[9px] font-bold text-white/90 mt-1 uppercase tracking-wider">
            Scraper
          </span>
        </div>

        {/* 4. Campanhas */}
        <Link
          href="/campanhas"
          className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[48px] rounded-xl transition-all ${
            pathname?.startsWith('/campanhas')
              ? 'text-destaque'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Send className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium tracking-tight">Outreach</span>
          {pathname?.startsWith('/campanhas') && (
            <span className="w-1.5 h-1.5 rounded-full bg-destaque mt-0.5 shadow-sm shadow-destaque" />
          )}
        </Link>

        {/* 5. Menu Mais */}
        <button
          type="button"
          onClick={() => setMenuAberto(true)}
          className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[48px] rounded-xl transition-all ${
            menuAberto
              ? 'text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium tracking-tight">Mais</span>
        </button>
      </nav>

      {/* ======================================================== */}
      {/* 2. DRAWER / BOTTOM SHEET MOBILE (Menu Expandido Vidro Claro) */}
      {/* ======================================================== */}
      {menuAberto && (
        <div className="md:hidden fixed inset-0 z-[110] flex flex-col justify-end animate-in fade-in duration-200">
          {/* Backdrop Translúcido Suave para manter o Shader Visível */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-[6px]"
            onClick={() => setMenuAberto(false)}
          />

          {/* Painel do Sheet Deslizante (Vidro Claro Apple Liquid Glass) */}
          <div
            className="relative z-10 w-full rounded-t-3xl border-t p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, rgba(14, 18, 28, 0.52) 100%)',
              backdropFilter: 'blur(40px) saturate(210%)',
              WebkitBackdropFilter: 'blur(40px) saturate(210%)',
              borderColor: 'rgba(255, 255, 255, 0.24)',
              boxShadow: '0 -20px 60px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
            }}
          >
            {/* Puxador do Drawer */}
            <div className="w-12 h-1.5 rounded-full bg-white/30 mx-auto -mt-1 mb-2 shadow-sm" />

            {/* Cabeçalho do Drawer */}
            <div className="flex items-center justify-between pb-3 border-b border-white/15">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-destaque to-destaque-hover flex items-center justify-center text-white shadow-md shadow-destaque/30 border border-white/20">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-display">Client Hunter Suite</h3>
                  <p className="text-[11px] text-white/60">Módulos e Recursos Rápidos</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMenuAberto(false)}
                className="p-1.5 rounded-xl text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lista de Rotas Secundárias */}
            <div className="space-y-1.5">
              {linksSecundarios.map((item) => {
                const Icone = item.icone;
                const ativo = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuAberto(false)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-xs font-semibold backdrop-blur-md shadow-sm ${
                      item.destaque
                        ? 'bg-gradient-to-r from-destaque/30 to-destaque-hover/20 border-destaque/50 text-white shadow-md shadow-destaque/20'
                        : ativo
                        ? 'bg-white/20 border-white/40 text-white shadow-md'
                        : 'bg-white/[0.08] border-white/14 text-white hover:bg-white/[0.15] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          item.destaque
                            ? 'bg-destaque text-white shadow-sm'
                            : 'bg-white/15 text-white'
                        }`}
                      >
                        <Icone className="w-4 h-4" />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/50" />
                  </Link>
                );
              })}

              {/* Botão de personalização visual MCP OS para Mobile */}
              <button
                type="button"
                onClick={() => {
                  setMenuAberto(false);
                  window.dispatchEvent(new CustomEvent('abrir-modal-mcp-os'));
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-xs font-semibold bg-white/[0.08] border-white/14 text-white hover:bg-white/[0.15] active:scale-[0.98] cursor-pointer backdrop-blur-md shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-tr from-destaque/30 to-destaque-hover/20 border border-destaque/40 text-destaque shadow-sm">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span>Visual MCP OS</span>
                    <span className="block text-[10px] text-white/60 font-normal">Shaders WebGL & Wallpapers</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/50" />
              </button>
            </div>

            {/* Status SuperPool & Informações */}
            <div
              className="p-4 rounded-2xl border space-y-2"
              style={{
                background: 'rgba(255, 255, 255, 0.07)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.20)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  SuperPool VPS
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Online · R$ 0
                </span>
              </div>
              <p className="text-[11px] text-white/70 leading-relaxed">
                13 contas Apify conectadas e rotacionando sem limites na porta 5057.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Multi-Scraper acionável pelo botão central do mobile */}
      <ModalNovoScraper
        aberto={modalScraperAberto}
        aoFechar={() => setModalScraperAberto(false)}
      />
    </>
  );
}
