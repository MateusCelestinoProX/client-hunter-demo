'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  MapPin,
  Target,
  Mail,
  PlusCircle,
  FileText,
  Users,
  Activity,
  Settings,
  BookOpen,
  Sparkles,
  Zap,
  Terminal,
  Clock,
  Layers,
  ChevronRight,
  ShieldCheck,
  Palette
} from 'lucide-react';

const ROTA_TITULOS: Record<string, { secao: string; titulo: string; icone: any }> = {
  '/': { secao: 'Prospecção & Funil', titulo: 'Leads Qualificados', icone: Target },
  '/maps-scraper': { secao: 'Prospecção & Funil', titulo: 'Google Maps Web Scraper', icone: MapPin },
  '/campanhas': { secao: 'SendPortal · Disparo', titulo: 'Campanhas de Cold E-mail', icone: Mail },
  '/campanhas/nova': { secao: 'SendPortal · Disparo', titulo: 'Nova Campanha (Wizard)', icone: PlusCircle },
  '/mensagens': { secao: 'SendPortal · Disparo', titulo: 'Logs de Mensagens', icone: Clock },
  '/templates': { secao: 'Audiência & Design', titulo: 'Templates de E-mail', icone: FileText },
  '/inscritos': { secao: 'Audiência & Design', titulo: 'Inscritos & Tags', icone: Users },
  '/provedores': { secao: 'Infraestrutura', titulo: 'Recursos & Usage (SuperPool)', icone: Activity },
  '/configuracoes': { secao: 'Sistema & Visual', titulo: 'Configurações & Cores', icone: Settings },
  '/documentacao': { secao: 'Sistema & Visual', titulo: 'Manual do Sistema & Documentação', icone: BookOpen },
  '/documentacao/ia': { secao: 'Automação & IA', titulo: 'Protocolo Agentes de IA & MCP', icone: Terminal },
  '/docuemtacao': { secao: 'Sistema & Visual', titulo: 'Manual do Sistema & Documentação', icone: BookOpen },
};

export function DesktopTopBar() {
  const pathname = usePathname();
  const [hora, setHora] = useState<string>('');

  useEffect(() => {
    const atualizar = () => {
      const d = new Date();
      setHora(
        d.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    atualizar();
    const timer = setInterval(atualizar, 1000);
    return () => clearInterval(timer);
  }, []);

  const rotaAtual = ROTA_TITULOS[pathname] || {
    secao: 'Client Hunter PRO',
    titulo: pathname.replace('/', '').toUpperCase() || 'DASHBOARD',
    icone: Target,
  };
  const IconeRota = rotaAtual.icone;

  return (
    <header
      className="hidden md:flex items-center justify-between px-6 py-3 border-b select-none shrink-0 sticky top-0 z-30 transition-all"
      style={{
        background: 'rgba(14, 18, 28, 0.40)',
        backdropFilter: 'blur(30px) saturate(190%)',
        WebkitBackdropFilter: 'blur(30px) saturate(190%)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.20), inset 0 -1px 0 rgba(255, 255, 255, 0.12)',
      }}
    >
      {/* Lado Esquerdo: Breadcrumb Dinâmico */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-white/40 font-mono font-medium">{rotaAtual.secao}</span>
        <ChevronRight className="w-3.5 h-3.5 text-white/20" />
        <div className="flex items-center gap-1.5 font-bold text-white tracking-wide font-display">
          <IconeRota className="w-3.5 h-3.5 text-destaque" />
          <span>{rotaAtual.titulo}</span>
        </div>
      </div>

      {/* Centro: Botão de Busca Rápida (Command Palette) */}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent('abrir-command-palette'))}
        className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 text-white/60 hover:text-white text-xs transition-all shadow-sm cursor-pointer group"
      >
        <Search className="w-3.5 h-3.5 text-destaque group-hover:scale-110 transition-transform" />
        <span className="font-medium text-[11px]">Busca Rápida de Telas &amp; Ações...</span>
        <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-white/70 border border-white/15">
          ⌘K
        </kbd>
      </button>

      {/* Lado Direito: Status da VPS, Shader Trigger & Relógio */}
      <div className="flex items-center gap-3 text-xs">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('abrir-modal-mcp-os'))}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/10 transition-all cursor-pointer"
          title="Abrir Seletor de 37 Shaders WebGL"
        >
          <Palette className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-medium">Shaders</span>
        </button>

        <Link
          href="/documentacao"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/10 transition-all"
        >
          <BookOpen className="w-3.5 h-3.5 text-destaque" />
          <span className="text-[11px] font-medium">Manual</span>
        </Link>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destaque/10 border border-destaque/25 text-destaque font-mono text-[11px]">
          <Sparkles className="w-3 h-3 text-destaque animate-pulse" />
          <span>DEMO SANDBOX</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>CLUSTER ONLINE</span>
        </div>

        {hora && (
          <span className="text-[11px] font-mono text-white/40 border-l border-white/10 pl-3 hidden lg:inline">
            {hora}
          </span>
        )}
      </div>
    </header>
  );
}
