'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Target, 
  Mail, 
  PlusCircle, 
  FileText, 
  Users, 
  Server, 
  Send, 
  Layers, 
  Activity, 
  ShieldCheck, 
  Zap,
  Terminal,
  Clock,
  Sparkles,
  MapPin,
  Settings,
  BookOpen,
  Search
} from 'lucide-react';
import { ModalNovoScraper } from './ModalNovoScraper';
import { ModalGoogleMapsScraper } from './ModalGoogleMapsScraper';

export function Sidebar() {
  const pathname = usePathname();
  const [modalScraperAberto, setModalScraperAberto] = useState(false);
  const [modalMapsAberto, setModalMapsAberto] = useState(false);

  useEffect(() => {
    const handleAbrirScraper = () => setModalScraperAberto(true);
    window.addEventListener('abrir-modal-scraper', handleAbrirScraper);
    return () => window.removeEventListener('abrir-modal-scraper', handleAbrirScraper);
  }, []);

  const rotas = [
    {
      secao: 'Prospecção & Funil',
      itens: [
        { href: '/maps-scraper', rotulo: 'Google Maps Scraper', icone: MapPin, destaque: true, desc: 'Motor Oficial Omkar/Botasaurus' },
        { href: '/', rotulo: 'Leads Qualificados', icone: Target, desc: 'Base de dados consolidada' },
      ],
    },
    {
      secao: 'SendPortal · Disparo',
      itens: [
        { href: '/campanhas', rotulo: 'Campanhas', icone: Mail, desc: 'Gestão de disparos' },
        { href: '/campanhas/nova', rotulo: 'Nova Campanha', icone: PlusCircle, destaque: true, desc: 'Wizard 4 etapas' },
        { href: '/mensagens', rotulo: 'Logs de Mensagens', icone: Clock, desc: 'Entregas, aberturas e cliques' },
      ],
    },
    {
      secao: 'Audiência & Design',
      itens: [
        { href: '/templates', rotulo: 'Templates de E-mail', icone: FileText, desc: 'HTML & Variáveis' },
        { href: '/inscritos', rotulo: 'Inscritos & Tags', icone: Users, desc: 'Segmentação e opt-out' },
      ],
    },
    {
      secao: 'Infraestrutura & Recursos',
      itens: [
        { href: '/provedores', rotulo: 'Recursos & Usage', icone: Activity, desc: 'Telemetria de 58 API Keys' },
      ],
    },
    {
      secao: 'Sistema & Visual',
      itens: [
        { href: '/documentacao', rotulo: 'Documentação', icone: BookOpen, destaque: true, desc: 'Manual completo & Recursos da plataforma' },
        { href: '/documentacao/ia', rotulo: 'Protocolo IA & MCP', icone: Terminal, desc: '24 tools, schemas & OpenAPI spec' },
        { href: '/configuracoes', rotulo: 'Configurações & Cores', icone: Settings, desc: 'Personalizar Cor Primária e Secundária' },
      ],
    },
  ];

  return (
    <>
      <aside 
        className="w-64 lg:w-72 flex flex-col shrink-0 h-screen max-h-screen text-white select-none relative z-30 transition-all"
        style={{
          background: 'rgba(14, 18, 28, 0.45)',
          backdropFilter: 'blur(36px) saturate(200%)',
          WebkitBackdropFilter: 'blur(36px) saturate(200%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.16)',
          boxShadow: '6px 0 35px rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* Brand Header */}
        <div className="p-5 border-b shrink-0" style={{ borderColor: 'rgba(255, 255, 255, 0.10)' }}>
          <Link href="/" className="flex items-center gap-3 group">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300"
              style={{
                background: 'var(--accent-gradient)',
                boxShadow: '0 8px 25px rgba(var(--accent-rgb, 250, 66, 0), 0.35)',
              }}
            >
              <Target className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-white text-base font-display">Client Hunter</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destaque/20 text-destaque font-mono font-bold border border-destaque/40">PRO</span>
              </div>
              <p className="text-[11px] text-white/60 tracking-wide font-light">Maps Scraper + SendPortal</p>
            </div>
          </Link>
        </div>

        {/* Quick Search & Command Palette Trigger (Cmd+K) */}
        <div className="px-4 pt-3 pb-1 shrink-0">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('abrir-command-palette'))}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all group cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-destaque group-hover:scale-110 transition-transform" />
              <span className="font-medium text-[11px]">Busca &amp; Comandos</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-white/70 border border-white/15">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Quick Action Buttons (Google Maps Scraper Dedicado + Multicanal + Nova Campanha) */}
        <div className="px-4 pt-4 pb-2 space-y-2 shrink-0">
          {/* Botão Dedicado: Google Maps Web Scraper (Leva direto para a Page Dedicada) */}
          <Link
            href="/maps-scraper"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-white text-xs font-bold transition-all border border-white/25 active:scale-[0.98] cursor-pointer"
            style={{
              background: 'var(--accent-gradient)',
              boxShadow: '0 4px 18px rgba(var(--accent-rgb, 250, 66, 0), 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
            }}
          >
            <MapPin className="w-4 h-4 fill-white" />
            <span>Google Maps Scraper</span>
          </Link>

          {/* Botão Geral: Novo Scraper Multicanal */}
          <button
            type="button"
            onClick={() => setModalScraperAberto(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/[0.08] text-white text-xs font-semibold hover:bg-white/[0.14] active:scale-[0.98] transition-all border border-white/15 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-destaque" />
            <span>+ Scraper Multicanal</span>
          </button>

          <Link
            href="/campanhas/nova"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/[0.04] text-white/80 text-xs font-medium hover:bg-white/[0.10] hover:text-white active:scale-[0.98] transition-all border border-white/10"
          >
            <PlusCircle className="w-3.5 h-3.5 text-white/50" />
            <span>Criar Campanha</span>
          </Link>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 min-h-0 px-3 py-3 space-y-6 overflow-y-auto">
          {rotas.map((secao) => (
            <div key={secao.secao}>
              <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-white/40 mb-2">
                {secao.secao}
              </p>
              <div className="space-y-1">
                {secao.itens.map((item) => {
                  const ativo = item.href === '/campanhas'
                    ? pathname === '/campanhas'
                    : (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/')));
                  const Icone = item.icone;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-200 ${
                        ativo
                          ? 'bg-destaque/20 text-white font-semibold border border-destaque/40 shadow-inner'
                          : 'text-white/70 hover:text-white hover:bg-white/[0.06] border border-transparent'
                      }`}
                      style={ativo ? {
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.20)',
                      } : {}}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icone className={`w-4 h-4 shrink-0 ${ativo ? 'text-destaque' : 'text-white/50'}`} />
                        <div className="truncate">
                          <div className="truncate">{item.rotulo}</div>
                        </div>
                      </div>
                      {item.destaque && !ativo && (
                        <span className="w-1.5 h-1.5 rounded-full bg-destaque animate-pulse" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Status Card (SuperPool & Liquid Glass Badge) */}
        <div 
          className="p-4 border-t space-y-3 shrink-0"
          style={{
            borderColor: 'rgba(255, 255, 255, 0.10)',
            background: 'rgba(0, 0, 0, 0.25)',
          }}
        >
          <div 
            className="p-3 rounded-2xl border text-xs"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderColor: 'rgba(255, 255, 255, 0.10)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.15)',
            }}
          >
            <Link href="/provedores" className="block group">
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="text-white/80 group-hover:text-white flex items-center gap-1.5 font-medium transition-colors">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  SuperPool Recursos
                </span>
                <span className="text-emerald-400 text-[10px] font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                  58 CHAVES ATIVAS
                </span>
              </div>
              <p className="text-[10px] text-white/50 font-light leading-tight">
                Cluster multicanal com monitoramento de saldo em tempo real.
              </p>
            </Link>
          </div>

          <div className="flex items-center justify-between text-[10px] text-white/50 px-1 font-mono">
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3 text-destaque" />
              MCP Chat Parity
            </span>
            <span className="text-emerald-400 font-semibold">100% ATIVA</span>
          </div>
        </div>
      </aside>

      {/* Modal de Disparo de Scraper Geral */}
      <ModalNovoScraper
        aberto={modalScraperAberto}
        aoFechar={() => setModalScraperAberto(false)}
      />

      {/* Modal Dedicado Google Maps Web Scraper */}
      <ModalGoogleMapsScraper
        aberto={modalMapsAberto}
        aoFechar={() => setModalMapsAberto(false)}
      />
    </>
  );
}
