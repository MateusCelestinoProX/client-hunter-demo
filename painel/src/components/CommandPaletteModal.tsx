'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  ArrowRight,
  CornerDownLeft,
  X,
  Palette,
  ExternalLink,
  ShieldCheck,
  Check,
  Globe
} from 'lucide-react';

interface ComandoItem {
  id: string;
  titulo: string;
  subtitulo: string;
  categoria: 'Navegação' | 'Ações Rápidas' | 'Filtros' | 'Ferramentas';
  icone: any;
  acao: () => void;
  atalho?: string;
  badge?: string;
}

export function CommandPaletteModal() {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [indiceSelecionado, setIndiceSelecionado] = useState(0);
  const [copiadoCli, setCopiadoCli] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listaRef = useRef<HTMLDivElement | null>(null);

  // Escutar atalho global Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setAberto((prev) => !prev);
      } else if (e.key === 'Escape' && aberto) {
        e.preventDefault();
        setAberto(false);
      }
    };

    const handleCustomOpen = () => setAberto(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('abrir-command-palette', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('abrir-command-palette', handleCustomOpen);
    };
  }, [aberto]);

  // Foco no input ao abrir
  useEffect(() => {
    if (aberto) {
      setBusca('');
      setIndiceSelecionado(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [aberto]);

  const executarENavegar = (rota: string) => {
    setAberto(false);
    router.push(rota);
  };

  const comandos: ComandoItem[] = useMemo(() => [
    // Navegação Principal
    {
      id: 'nav-maps',
      titulo: 'Google Maps Web Scraper',
      subtitulo: 'Mineração profunda e extração de contatos de empresas',
      categoria: 'Navegação',
      icone: MapPin,
      acao: () => executarENavegar('/maps-scraper'),
      atalho: 'G M',
      badge: 'Motor Oficial',
    },
    {
      id: 'nav-leads',
      titulo: 'Leads Qualificados (CRM)',
      subtitulo: 'Base consolidada com notas de score e filtros',
      categoria: 'Navegação',
      icone: Target,
      acao: () => executarENavegar('/'),
      atalho: 'G L',
    },
    {
      id: 'nav-docs',
      titulo: 'Documentação & Manual Completo',
      subtitulo: 'Guia de operação, catálogo de recursos e shaders',
      categoria: 'Navegação',
      icone: BookOpen,
      acao: () => executarENavegar('/documentacao'),
      atalho: 'G D',
      badge: 'Manual Oficial',
    },
    {
      id: 'nav-docs-ia',
      titulo: 'Protocolo Agentes de IA & Servidor MCP',
      subtitulo: 'Catálogo de 24 tools, schemas JSON-RPC e rotas REST',
      categoria: 'Navegação',
      icone: Terminal,
      acao: () => executarENavegar('/documentacao/ia'),
      atalho: 'G I',
      badge: 'M2M Spec',
    },
    {
      id: 'nav-campanhas',
      titulo: 'Campanhas de Cold E-mail',
      subtitulo: 'Gestão de disparos e histórico de campanhas',
      categoria: 'Navegação',
      icone: Mail,
      acao: () => executarENavegar('/campanhas'),
      atalho: 'G C',
    },
    {
      id: 'nav-nova-campanha',
      titulo: 'Criar Nova Campanha',
      subtitulo: 'Wizard de 4 etapas para disparo em massa',
      categoria: 'Navegação',
      icone: PlusCircle,
      acao: () => executarENavegar('/campanhas/nova'),
      atalho: 'N C',
    },
    {
      id: 'nav-logs',
      titulo: 'Logs de Mensagens',
      subtitulo: 'Telemetria de entregas, aberturas e cliques',
      categoria: 'Navegação',
      icone: Clock,
      acao: () => executarENavegar('/mensagens'),
    },
    {
      id: 'nav-templates',
      titulo: 'Templates de E-mail Responsivos',
      subtitulo: 'Biblioteca HTML com variáveis {{nome}}, {{empresa}}',
      categoria: 'Navegação',
      icone: FileText,
      acao: () => executarENavegar('/templates'),
    },
    {
      id: 'nav-inscritos',
      titulo: 'Inscritos & Tags',
      subtitulo: 'Segmentação de listas e gestão de descadastros (LGPD)',
      categoria: 'Navegação',
      icone: Users,
      acao: () => executarENavegar('/inscritos'),
    },
    {
      id: 'nav-provedores',
      titulo: 'Recursos & Usage (SuperPool)',
      subtitulo: 'Telemetria em tempo real das 58 API Keys',
      categoria: 'Navegação',
      icone: Activity,
      acao: () => executarENavegar('/provedores'),
      badge: '58 Chaves',
    },
    {
      id: 'nav-config',
      titulo: 'Configurações & Cores',
      subtitulo: 'Personalizar Cor Primária e Secundária em HEX',
      categoria: 'Navegação',
      icone: Settings,
      acao: () => executarENavegar('/configuracoes'),
    },

    // Ações Rápidas
    {
      id: 'act-modal-scraper',
      titulo: '+ Iniciar Novo Scraper Multicanal',
      subtitulo: 'Abre modal para raspagem no Instagram, Maps ou Web',
      categoria: 'Ações Rápidas',
      icone: Zap,
      acao: () => {
        setAberto(false);
        window.dispatchEvent(new CustomEvent('abrir-modal-scraper'));
      },
      badge: 'Multicanal',
    },
    {
      id: 'act-shaders',
      titulo: 'Alternar Shaders WebGL & Wallpapers',
      subtitulo: 'Abre a gaveta lateral com os 37 shaders matemáticos GPU',
      categoria: 'Ações Rápidas',
      icone: Palette,
      acao: () => {
        setAberto(false);
        window.dispatchEvent(new CustomEvent('abrir-modal-mcp-os'));
      },
      badge: '37 Shaders',
    },
    {
      id: 'act-cli-copy',
      titulo: 'Copiar Comando CLI de Prospecção',
      subtitulo: 'node prospectar.mjs "nicho" "cidade"',
      categoria: 'Ações Rápidas',
      icone: Terminal,
      acao: () => {
        navigator.clipboard.writeText('node prospectar.mjs "energia solar" "Campinas SP"');
        setCopiadoCli(true);
        setTimeout(() => {
          setCopiadoCli(false);
          setAberto(false);
        }, 1200);
      },
    },

    // Filtros Rápidos
    {
      id: 'filtro-classe-a',
      titulo: 'Ver Leads Classe A (Score 75+)',
      subtitulo: 'Filtra empresas mais quentes e com canais ativos',
      categoria: 'Filtros',
      icone: Target,
      acao: () => executarENavegar('/?classe=A'),
      badge: 'Quentes',
    },
    {
      id: 'filtro-sem-site',
      titulo: 'Ver Leads Sem Site (Oportunidade)',
      subtitulo: 'Filtra empresas que não possuem website próprio',
      categoria: 'Filtros',
      icone: Globe,
      acao: () => executarENavegar('/?oportunidade=sem-site'),
    },
    {
      id: 'filtro-com-whats',
      titulo: 'Ver Leads Com Celular / WhatsApp',
      subtitulo: 'Leads prontos para abordagem direta no WhatsApp',
      categoria: 'Filtros',
      icone: ShieldCheck,
      acao: () => executarENavegar('/?canal=maps'),
    },
  ], [router]);

  // Filtragem
  const filtrados = useMemo(() => {
    if (!busca.trim()) return comandos;
    const q = busca.toLowerCase();
    return comandos.filter(
      (c) =>
        c.titulo.toLowerCase().includes(q) ||
        c.subtitulo.toLowerCase().includes(q) ||
        c.categoria.toLowerCase().includes(q)
    );
  }, [busca, comandos]);

  // Navegação por teclado
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndiceSelecionado((prev) => (prev + 1) % Math.max(1, filtrados.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndiceSelecionado((prev) => (prev - 1 + filtrados.length) % Math.max(1, filtrados.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtrados[indiceSelecionado]) {
        filtrados[indiceSelecionado].acao();
      }
    }
  };

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 select-none animate-fadeIn"
      style={{
        background: 'rgba(0, 0, 0, 0.35)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setAberto(false);
      }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden border shadow-2xl transition-all"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(14, 18, 28, 0.55) 100%)',
          backdropFilter: 'blur(40px) saturate(210%)',
          WebkitBackdropFilter: 'blur(40px) saturate(210%)',
          borderColor: 'rgba(255, 255, 255, 0.22)',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
        }}
      >
        {/* Barra de Busca Superior */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}>
          <Search className="w-5 h-5 text-destaque shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setIndiceSelecionado(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Digite para buscar qualquer tela, ferramenta ou ação... (ou use as setas)"
            className="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none font-medium"
          />
          {busca && (
            <button
              type="button"
              onClick={() => setBusca('')}
              className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-white/50 border border-white/15">
            ESC para fechar
          </kbd>
        </div>

        {/* Lista de Resultados */}
        <div ref={listaRef} className="max-h-[380px] overflow-y-auto p-2 divide-y divide-white/5 space-y-1">
          {filtrados.length === 0 ? (
            <div className="py-12 text-center text-xs text-white/40 font-light">
              Nenhum comando ou página encontrada para &quot;{busca}&quot;.
            </div>
          ) : (
            filtrados.map((cmd, idx) => {
              const Icon = cmd.icone;
              const ativo = idx === indiceSelecionado;
              return (
                <div
                  key={cmd.id}
                  onClick={cmd.acao}
                  onMouseEnter={() => setIndiceSelecionado(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    ativo
                      ? 'bg-destaque/25 text-white font-semibold border border-destaque/40 shadow-inner'
                      : 'text-white/70 hover:text-white hover:bg-white/[0.05] border border-transparent'
                  }`}
                  style={
                    ativo
                      ? {
                          backdropFilter: 'blur(16px)',
                          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.20)',
                        }
                      : {}
                  }
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        ativo ? 'bg-destaque text-white' : 'bg-white/10 text-white/70'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2 truncate">
                        <span className="truncate text-white font-medium">{cmd.titulo}</span>
                        {cmd.badge && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-white/10 text-white/80 border border-white/15">
                            {cmd.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/50 font-light truncate">{cmd.subtitulo}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {cmd.id === 'act-cli-copy' && copiadoCli && (
                      <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Copiado!
                      </span>
                    )}
                    {cmd.atalho && (
                      <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-black/40 text-[10px] font-mono text-white/40 border border-white/10">
                        {cmd.atalho}
                      </kbd>
                    )}
                    {ativo && <CornerDownLeft className="w-3.5 h-3.5 text-destaque animate-pulse" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé Informativo */}
        <div
          className="flex items-center justify-between px-4 py-2.5 border-t text-[11px] text-white/40 font-mono bg-black/40"
          style={{ borderColor: 'rgba(255, 255, 255, 0.10)' }}
        >
          <div className="flex items-center gap-3">
            <span>↑↓ Navegar</span>
            <span>↵ Executar</span>
            <span>ESC Sair</span>
          </div>
          <span className="text-destaque font-medium">Client Hunter PRO · Fast HUD</span>
        </div>
      </div>
    </div>
  );
}
