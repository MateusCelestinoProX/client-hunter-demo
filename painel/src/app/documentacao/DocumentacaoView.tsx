'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Sparkles,
  MapPin,
  Target,
  Mail,
  Layers,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Cpu,
  Sliders,
  Code2,
  Terminal,
  Send,
  Flame,
  Globe,
  Building2,
  Play,
  Pause,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  X,
  Menu,
  Info,
  Search,
  Users,
  Settings,
  HelpCircle,
  FileText,
  Clock,
  ArrowRight,
  Filter,
  CheckSquare,
  AlertTriangle,
  Lightbulb,
  MousePointer,
  RefreshCw,
  Share2,
  Eye,
  MessageCircle,
  Phone,
  Compass
} from 'lucide-react';
import { Titulo, Pagina } from '@/components/ui';
import { DocumentacaoIaView } from '@/components/DocumentacaoIaView';

// ==============================================================================
// 1. CANVAS SHADER GLSL DE VIDRO TRANSLÚCIDO (INTERATIVO)
// ==============================================================================
function AmbientGlassShaderCanvas({ pausado }: { pausado: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    if (!gl) return;

    const vsSource = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_pos + 1.0) * 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      varying vec2 v_uv;
      uniform vec2 u_res;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform vec3 u_color1;
      uniform vec3 u_color2;

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);
        vec2 mouse = (u_mouse - 0.5) * 2.0;

        // Refração suave de lente de cristal
        float dMouse = length(uv - mouse);
        vec2 refrUV = uv + normalize(uv - mouse) * (0.08 / (dMouse * dMouse + 0.4));

        float t = u_time * 0.5;
        float wave1 = sin(refrUV.x * 2.5 + t * 1.1) * 0.35;
        float wave2 = cos(refrUV.y * 3.0 - t * 0.8) * 0.25;
        float beam1 = 0.025 / abs(refrUV.y - wave1 + 0.05);
        float beam2 = 0.020 / abs(refrUV.y - wave2 - 0.10);

        vec3 col = u_color1 * (beam1 * 1.5) + u_color2 * (beam2 * 1.3);

        // Dispersão e vinheta
        float vignette = smoothstep(1.6, 0.2, length(uv));
        gl_FragColor = vec4(col * vignette, 0.75);
      }
    `;

    function createShader(glCtx: WebGLRenderingContext, type: number, src: string) {
      const s = glCtx.createShader(type);
      if (!s) return null;
      glCtx.shaderSource(s, src);
      glCtx.compileShader(s);
      return s;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(prog, 'a_pos');
    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    const uColor1 = gl.getUniformLocation(prog, 'u_color1');
    const uColor2 = gl.getUniformLocation(prog, 'u_color2');

    const handlePointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: 1.0 - (e.clientY - rect.top) / rect.height,
      };
    };
    window.addEventListener('mousemove', handlePointerMove);

    const hexToRgbNorm = (hex: string) => {
      let c = hex.replace('#', '');
      if (c.length === 3) c = c.split('').map((x) => x + x).join('');
      const n = parseInt(c, 16) || 0;
      return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
    };

    const render = () => {
      if (!canvas || !gl) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);

      if (!pausado) {
        timeRef.current += 0.016;
      }

      gl.useProgram(prog);
      gl.enableVertexAttribArray(aPos);
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, timeRef.current);
      gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);

      let c1Hex = '#FA4200';
      let c2Hex = '#FF7733';
      try {
        c1Hex = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim() || '#FA4200';
        c2Hex = getComputedStyle(document.documentElement).getPropertyValue('--accent-secondary').trim() || '#FF7733';
      } catch (e) {}

      const [r1, g1, b1] = hexToRgbNorm(c1Hex);
      const [r2, g2, b2] = hexToRgbNorm(c2Hex);
      gl.uniform3f(uColor1, r1, g1, b1);
      gl.uniform3f(uColor2, r2, g2, b2);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(posBuffer);
    };
  }, [pausado]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none rounded-[28px]"
      style={{ opacity: 0.8 }}
    />
  );
}

// ==============================================================================
// 2. COMPONENTE PRINCIPAL DOCUMENTAÇÃO VIEW
// ==============================================================================
export function DocumentacaoView({ modoInicial = 'humano' }: { modoInicial?: 'humano' | 'ia' }) {
  const [modoVisao, setModoVisao] = useState<'humano' | 'ia'>(modoInicial);
  const [secaoAtiva, setSecaoAtiva] = useState<string>('fluxo-geral');
  const [shaderPausado, setShaderPausado] = useState<boolean>(false);
  const [codigoCopiado, setCodigoCopiado] = useState<string | null>(null);
  const [modalIndiceAberto, setModalIndiceAberto] = useState<boolean>(false);
  const [heroExpandidoMobile, setHeroExpandidoMobile] = useState<boolean>(false);

  // Estados do Simulador de Conversão & ROI B2B
  const [simLeadsSemana, setSimLeadsSemana] = useState<number>(150);
  const [simTaxaResposta, setSimTaxaResposta] = useState<number>(15);
  const [simTaxaReuniao, setSimTaxaReuniao] = useState<number>(25);
  const [simTaxaFechamento, setSimTaxaFechamento] = useState<number>(20);
  const [simTicketMedio, setSimTicketMedio] = useState<number>(2500);

  const leadsMes = simLeadsSemana * 4;
  const respostasMes = Math.round(leadsMes * (simTaxaResposta / 100));
  const reunioesMes = Math.round(respostasMes * (simTaxaReuniao / 100));
  const fechamentosMes = Math.max(1, Math.round(reunioesMes * (simTaxaFechamento / 100)));
  const receitaNovaMes = fechamentosMes * simTicketMedio;
  const receitaAnual = receitaNovaMes * 12;

  const copiar = (id: string, texto: string) => {
    navigator.clipboard.writeText(texto);
    setCodigoCopiado(id);
    setTimeout(() => setCodigoCopiado(null), 2000);
  };

  const secoes = [
    { id: 'fluxo-geral', num: '01', curto: 'Visão Geral', titulo: '1. Visão Geral & Como a Plataforma Funciona', icone: Compass, desc: 'Arquitetura e pipeline em 5 fases' },
    { id: 'simulador-roi', num: '02', curto: 'Simulador ROI', titulo: '2. Simulador de Conversão & ROI B2B', icone: Flame, desc: 'Calculadora interativa de faturamento' },
    { id: 'maps-scraper', num: '03', curto: 'Maps Scraper', titulo: '3. Google Maps Web Scraper (Mineração)', icone: MapPin, desc: 'Extração Botasaurus e SuperPool' },
    { id: 'leads-crm', num: '04', curto: 'Leads CRM', titulo: '4. Leads Qualificados & Régua de Score (0-100)', icone: Target, desc: 'Maturidade digital e classes A/B/C/D' },
    { id: 'bi-enriquecimento', num: '05', curto: 'BI & Sócios', titulo: '5. Business Intelligence (CNPJ, Sócios & Tech)', icone: Sparkles, desc: 'Enriquecimento forense e decisores' },
    { id: 'abordagem-whatsapp', num: '06', curto: 'WhatsApp', titulo: '6. Abordagem WhatsApp, Telefones & Scripts', icone: Send, desc: 'DDI automático e cadência 3 toques' },
    { id: 'sendportal-disparo', num: '07', curto: 'Cold E-mail', titulo: '7. SendPortal · Campanhas de Cold E-mail', icone: Mail, desc: '24k envios/dia via 8 Resend pools' },
    { id: 'superpool-infra', num: '08', curto: 'SuperPool', titulo: '8. SuperPool de 58 Chaves & Telemetria', icone: Activity, desc: 'Rotação inteligente de APIs' },
    { id: 'shaders-visual', num: '09', curto: 'Liquid Glass', titulo: '9. Engine Visual Liquid Glass & Shaders', icone: Layers, desc: 'Design translúcido e WebGL' },
    { id: 'automacao-ia', num: '10', curto: 'Agentes IA', titulo: '10. Automação com Claude, n8n & Servidor MCP', icone: Terminal, desc: '24 MCP Tools e operação autônoma' },
    { id: 'faq-troubleshooting', num: '11', curto: 'FAQ & Ajuda', titulo: '11. FAQ & Resolução de Problemas', icone: HelpCircle, desc: 'Erros comuns e soluções rápidas' },
  ];

  const indiceAtual = secoes.findIndex((s) => s.id === secaoAtiva);
  const secaoCorrente = secoes[indiceAtual] || secoes[0];
  const secaoAnterior = indiceAtual > 0 ? secoes[indiceAtual - 1] : null;
  const proximaSecao = indiceAtual < secoes.length - 1 ? secoes[indiceAtual + 1] : null;

  const mudarSecao = (id: string) => {
    setSecaoAtiva(id);
    setModalIndiceAberto(false);
    if (typeof window !== 'undefined') {
      const el = document.getElementById('conteudo-manual-topo');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <Pagina larga>
      {/* ==============================================================================
          HEADER: DESKTOP (MD+)
          ============================================================================== */}
      <div className="hidden md:block mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-destaque/15 text-destaque border border-destaque/30 shadow-sm">
              <BookOpen className="w-3.5 h-3.5" />
              {modoVisao === 'ia' ? 'PROTOCOLO AGENTES DE IA' : 'MANUAL COMPLETO DO SISTEMA'}
            </span>
            <span className="text-xs font-mono text-white/50 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
              Versão 2.0 Enterprise
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Seletor de Modo: Manual Humano vs Protocolo IA */}
            <div className="flex items-center p-1 rounded-xl bg-white/[0.06] border border-white/10 shadow-inner">
              <button
                type="button"
                onClick={() => setModoVisao('humano')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  modoVisao === 'humano'
                    ? 'bg-destaque text-white shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Manual Humano</span>
              </button>
              <button
                type="button"
                onClick={() => setModoVisao('ia')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  modoVisao === 'ia'
                    ? 'bg-destaque text-white shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Protocolo Agentes de IA &amp; MCP</span>
              </button>
            </div>

            <Link
              href="/maps-scraper"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-destaque" />
              <span>Abrir Scraper</span>
            </Link>
            <Link
              href="/"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all flex items-center gap-1.5"
            >
              <Target className="w-3.5 h-3.5 text-destaque" />
              <span>Ver Leads</span>
            </Link>
          </div>
        </div>

        <Titulo sub={
          modoVisao === 'ia'
            ? "Especificação integral, contratos de ferramentas MCP (JSON-RPC), endpoints REST e schemas de dados para agentes autônomos."
            : "Guia prático e definitivo para minerar empresas, qualificar decisores, enriquecer dados corporativos e converter clientes em escala."
        }>
          {modoVisao === 'ia' ? 'Documentação Técnica para Agentes de IA & MCP' : 'Documentação & Manual de Operação'}
        </Titulo>
      </div>

      {/* ==============================================================================
          HEADER: MOBILE DEDICADO (MD-)
          ============================================================================== */}
      <div className="md:hidden mb-4 space-y-2.5">
        {/* Linha 1: Badge + Quick Links Compactos */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-destaque/15 text-destaque border border-destaque/30">
              <BookOpen className="w-3 h-3" />
              CLIENT HUNTER
            </span>
            <span className="text-[10px] font-mono text-white/50 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
              v2.0
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href="/maps-scraper"
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-white/10 active:bg-white/20 text-white border border-white/15 flex items-center gap-1"
            >
              <MapPin className="w-3 h-3 text-destaque" />
              <span>Scraper</span>
            </Link>
            <Link
              href="/"
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-white/10 active:bg-white/20 text-white border border-white/15 flex items-center gap-1"
            >
              <Target className="w-3 h-3 text-destaque" />
              <span>Leads</span>
            </Link>
          </div>
        </div>

        {/* Linha 2: Segmented Switch Full Width (42px touch height) */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-white/[0.06] border border-white/10 shadow-inner">
          <button
            type="button"
            onClick={() => setModoVisao('humano')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[40px] ${
              modoVisao === 'humano'
                ? 'bg-destaque text-white shadow-md'
                : 'text-white/60 active:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Manual Humano</span>
          </button>
          <button
            type="button"
            onClick={() => setModoVisao('ia')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[40px] ${
              modoVisao === 'ia'
                ? 'bg-destaque text-white shadow-md'
                : 'text-white/60 active:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Protocolo IA</span>
          </button>
        </div>

        {/* Linha 3: Título Cirúrgico Mobile */}
        <div className="pt-0.5">
          <h1 className="text-xl font-extrabold uppercase tracking-tight text-white font-display">
            {modoVisao === 'ia' ? 'Protocolo Agentes IA' : 'Manual Operacional'}
          </h1>
          <p className="text-[11px] text-white/60 font-light mt-0.5 line-clamp-1">
            {modoVisao === 'ia'
              ? '24 Tools MCP, REST Endpoints e Schemas de automação'
              : 'Mineração Maps, Score 0-100, BI de Sócios e Cold E-mail'}
          </p>
        </div>
      </div>

      {/* ==============================================================================
          CONTAINER MESTRE: GLASS PAGE BOX
          ============================================================================== */}
      <div
        className="relative rounded-[24px] sm:rounded-[28px] overflow-hidden transition-all shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(20, 24, 36, 0.96) 0%, rgba(9, 11, 18, 0.98) 100%)',
          backdropFilter: 'blur(40px) saturate(210%)',
          WebkitBackdropFilter: 'blur(40px) saturate(210%)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          boxShadow: '0 30px 100px rgba(0, 0, 0, 0.70), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
        }}
      >
        {/* Shimmer especular superior de vidro Apple */}
        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none z-30" />

        {/* HERO VISUAL DE VIDRO: DESKTOP (MD+) */}
        <div className="hidden md:block relative p-6 sm:p-8 lg:p-10 border-b overflow-hidden" style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}>
          <AmbientGlassShaderCanvas pausado={shaderPausado} />

          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: 'radial-gradient(circle at 85% 15%, rgba(var(--accent-rgb, 250, 66, 0), 0.25) 0%, transparent 60%), linear-gradient(180deg, rgba(8, 10, 15, 0.10) 0%, rgba(8, 10, 15, 0.40) 100%)',
            }}
          />

          <div className="relative z-20 max-w-4xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-white text-[11px] font-mono border border-white/15">
                {modoVisao === 'ia' ? 'Protocolo M2M / JSON-RPC 2.0' : 'Arquitetura All-in-One'}
              </span>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Cluster VPS Ativo
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white uppercase font-display leading-tight mb-3 drop-shadow-md">
              {modoVisao === 'ia'
                ? 'Operação Autônoma com Agentes de IA & Servidor MCP'
                : 'Como Dominar o Client Hunter PRO do Início ao Fim'}
            </h2>

            <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed mb-6 max-w-3xl">
              {modoVisao === 'ia'
                ? 'Esta especificação define os contratos das 24 ferramentas MCP (stdio), endpoints HTTP REST, modelos relacionais SQLite e playbooks operacionais para que qualquer agente de IA (Antigravity, Claude, Cursor, OpenAI, LangChain) opere a plataforma 100% no piloto automático.'
                : 'Esta página é o manual de cabeceira da sua operação comercial. Você aprenderá como cada botão funciona, como montar consultas que trazem os melhores clientes do Google Maps, como descobrir os donos de empresas sem gastar com Apollo ou Sales Navigator, e como orquestrar disparos de cold e-mail com 65%+ de abertura usando o SendPortal integrado.'}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShaderPausado(!shaderPausado)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {shaderPausado ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                <span>{shaderPausado ? 'Retomar Shader' : 'Pausar Shader'}</span>
              </button>
              <span className="text-xs text-white/50 font-mono">
                Shader WebGL acelerado por hardware · Responde ao movimento do mouse
              </span>
            </div>
          </div>
        </div>

        {/* HERO VISUAL DE VIDRO: MOBILE COMPACTO (MD-) */}
        <div className="md:hidden relative p-4 border-b overflow-hidden" style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}>
          <AmbientGlassShaderCanvas pausado={shaderPausado} />
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: 'radial-gradient(circle at 80% 20%, rgba(var(--accent-rgb, 250, 66, 0), 0.20) 0%, transparent 70%), linear-gradient(180deg, rgba(8, 10, 15, 0.35) 0%, rgba(8, 10, 15, 0.70) 100%)',
            }}
          />

          <div className="relative z-20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-white text-[10px] font-mono border border-white/15">
                {modoVisao === 'ia' ? 'M2M JSON-RPC' : 'All-in-One Enterprise'}
              </span>
              <button
                type="button"
                onClick={() => setShaderPausado(!shaderPausado)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 border border-white/15 text-[10px] text-white/80 active:text-white"
              >
                {shaderPausado ? <Play className="w-2.5 h-2.5 text-emerald-400" /> : <Pause className="w-2.5 h-2.5 text-amber-400" />}
                <span>{shaderPausado ? 'Shader OFF' : 'Shader ON'}</span>
              </button>
            </div>

            <h2 className="text-base font-extrabold tracking-tight text-white uppercase font-display leading-snug">
              {modoVisao === 'ia'
                ? 'Operação Autônoma para Agentes de IA'
                : 'Guia Completo Client Hunter PRO'}
            </h2>

            <p className="text-[11px] text-white/80 font-light leading-relaxed">
              {modoVisao === 'ia'
                ? '24 MCP tools, APIs REST e playbooks para rodar no piloto automático.'
                : 'Mineração Maps, Score 0-100, Dossiê de Sócios e Cold E-mail integrado.'}
            </p>

            {heroExpandidoMobile && (
              <p className="text-[11px] text-white/70 font-light leading-relaxed pt-1.5 border-t border-white/10 animate-in fade-in duration-200">
                {modoVisao === 'ia'
                  ? 'Compatível com Antigravity, Claude Desktop, Cursor e n8n. Todas as chamadas operam com stdio JSON-RPC ou endpoints HTTP com idempotência.'
                  : 'Este manual unifica a extração de dados do Google Maps com o SendPortal. Não há necessidade de ferramentas externas; tudo é orquestrado no cluster da VPS.'}
              </p>
            )}

            <button
              type="button"
              onClick={() => setHeroExpandidoMobile(!heroExpandidoMobile)}
              className="text-[10px] font-mono font-bold text-destaque flex items-center gap-1 pt-0.5 active:opacity-75"
            >
              <span>{heroExpandidoMobile ? 'Recolher detalhes' : 'Ver mais detalhes do sistema'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${heroExpandidoMobile ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {modoVisao === 'ia' ? (
          <div className="p-4 sm:p-8 lg:p-10">
            <DocumentacaoIaView />
          </div>
        ) : (
          /* ==============================================================================
              ESTRUTURA: SUMÁRIO LATERAL STICKY + CONTEÚDO DETALHADO (HUMANO)
              ============================================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[800px]">
          {/* Navegação / Sumário Rápido DESKTOP (LG+) */}
          <aside
            className="hidden lg:block lg:col-span-4 xl:col-span-3 border-r p-4 sm:p-5 space-y-1.5 bg-black/20"
            style={{ borderColor: 'rgba(255, 255, 255, 0.10)' }}
          >
            <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-white/40 mb-3">
              Índice de Módulos &amp; Tópicos
            </p>
            {secoes.map((sec) => {
              const Icon = sec.icone;
              const ativa = secaoAtiva === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => mudarSecao(sec.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs transition-all cursor-pointer ${
                    ativa
                      ? 'bg-destaque/25 text-white font-bold border border-destaque/50 shadow-inner'
                      : 'text-white/70 hover:text-white hover:bg-white/[0.06] border border-transparent'
                  }`}
                  style={
                    ativa
                      ? {
                          backdropFilter: 'blur(16px)',
                          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.20)',
                        }
                      : {}
                  }
                >
                  <Icon className={`w-4 h-4 shrink-0 ${ativa ? 'text-destaque' : 'text-white/50'}`} />
                  <span className="truncate">{sec.titulo}</span>
                </button>
              );
            })}

            {/* Card de Atalho para Código */}
            <div
              className="mt-6 p-4 rounded-2xl border text-xs space-y-2 bg-white/[0.02]"
              style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
            >
              <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
                <Terminal className="w-3.5 h-3.5 text-destaque" />
                <span>Comando Rápido CLI</span>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed font-light">
                Para rodar uma prospecção de teste direto pelo terminal da VPS ou local:
              </p>
              <div className="relative group">
                <pre className="p-2 rounded-lg bg-black/50 border border-white/10 font-mono text-[10px] text-white/90 overflow-x-auto">
                  node prospectar.mjs
                </pre>
                <button
                  type="button"
                  onClick={() => copiar('cli-quick', 'node prospectar.mjs')}
                  className="absolute right-1.5 top-1.5 p-1 rounded bg-white/10 text-white/70 hover:text-white"
                >
                  {codigoCopiado === 'cli-quick' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </aside>

          {/* Área Principal de Conteúdo Explicativo */}
          <main className="lg:col-span-8 xl:col-span-9 p-4 sm:p-6 lg:p-10 pt-0 sm:pt-6 space-y-6 sm:space-y-10">
            {/* Âncora para scroll suave mobile */}
            <div id="conteudo-manual-topo" className="scroll-mt-20" />

            {/* ====================================================================
                MOBILE STICKY NAVIGATION HUD (LG-)
                Design ultra-ergonômico: seletor de módulo + touch prev/next + carousel de pills
                ==================================================================== */}
            <div className="lg:hidden sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 py-2.5 bg-[#090b10]/95 backdrop-blur-xl border-b border-white/15 shadow-xl space-y-2">
              {/* Linha 1: Seletor de Módulo (Abre Bottom Sheet) + Setas Prev/Next */}
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setModalIndiceAberto(true)}
                  className="flex-1 flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-destaque/15 active:bg-destaque/25 border border-destaque/35 text-white text-xs font-semibold shadow-sm min-h-[44px] cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Menu className="w-4 h-4 text-destaque shrink-0" />
                    <span className="font-mono text-destaque text-[11px] font-bold shrink-0">
                      Módulo {secaoCorrente.num}/11
                    </span>
                    <span className="text-white/80 font-normal truncate text-xs">
                      · {secaoCorrente.curto}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-white/60 shrink-0" />
                </button>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={!secaoAnterior}
                    onClick={() => secaoAnterior && mudarSecao(secaoAnterior.id)}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${
                      secaoAnterior
                        ? 'bg-white/10 active:bg-white/20 border-white/20 text-white cursor-pointer'
                        : 'bg-white/[0.02] border-white/5 text-white/20 cursor-not-allowed'
                    }`}
                    aria-label="Módulo anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    disabled={!proximaSecao}
                    onClick={() => proximaSecao && mudarSecao(proximaSecao.id)}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${
                      proximaSecao
                        ? 'bg-destaque text-white border-destaque shadow-md active:opacity-85 cursor-pointer'
                        : 'bg-white/[0.02] border-white/5 text-white/20 cursor-not-allowed'
                    }`}
                    aria-label="Próximo módulo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Linha 2: Carrossel Horizontal Deslizável com os 11 Módulos */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {secoes.map((sec) => {
                  const SecIcon = sec.icone;
                  const ativa = secaoAtiva === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => mudarSecao(sec.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] whitespace-nowrap shrink-0 transition-all cursor-pointer min-h-[32px] ${
                        ativa
                          ? 'bg-destaque text-white font-bold shadow-md border border-destaque/50'
                          : 'bg-white/[0.05] text-white/65 border border-white/10 active:bg-white/15'
                      }`}
                    >
                      <SecIcon className={`w-3 h-3 ${ativa ? 'text-white' : 'text-destaque/80'}`} />
                      <span>{sec.num}. {sec.curto}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            {/* --------------------------------------------------------------------------
                SEÇÃO 1: VISÃO GERAL & FLUXO
                -------------------------------------------------------------------------- */}
            {secaoAtiva === 'fluxo-geral' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-destaque tracking-wider">
                    Fundamentos &amp; Arquitetura
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mt-1 font-display">
                    1. O Que É o Client Hunter PRO &amp; Como Ele Opera
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 font-light mt-1.5 leading-relaxed">
                    O Client Hunter é uma fusão completa entre dois antigos sistemas: o motor de mineração do <strong>Google Maps Scraper</strong> e o motor de automação de e-mails <strong>SendPortal</strong>. Em vez de contratar 4 ferramentas separadas (extrator, enriquecedor, CRM e disparador), você tem tudo conectado em um único banco de dados.
                  </p>
                </div>

                {/* Diagrama Visual em Vidro das 5 Etapas */}
                <div
                  className="p-6 rounded-2xl border space-y-4"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                  }}
                >
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                    <Layers className="w-4 h-4 text-destaque" />
                    O Pipeline Completo de Conversão em 5 Fases
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
                    {[
                      { num: '01', tit: 'Mineração', desc: 'Raspagem do Google Maps com telefones, emails e redes sociais.', icon: MapPin },
                      { num: '02', tit: 'Score 0-100', desc: 'Avaliação dos 9 sinais digitais com separação em Classes A/B/C/D.', icon: Target },
                      { num: '03', tit: 'BI & Sócios', desc: 'Consulta na Receita Federal para puxar CNPJ, capital e donos.', icon: Sparkles },
                      { num: '04', tit: 'Abordagem', desc: 'WhatsApp 1-click com DDI limpo e cadência de 3 mensagens.', icon: Send },
                      { num: '05', tit: 'Cold Email', desc: 'Campanhas no SendPortal via 8 contas Resend (24k/dia).', icon: Mail },
                    ].map((step, idx) => {
                      const StepIcon = step.icon;
                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border bg-black/30 flex flex-col justify-between"
                          style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-mono font-bold text-destaque bg-destaque/10 px-1.5 py-0.5 rounded border border-destaque/30">
                                {step.num}
                              </span>
                              <StepIcon className="w-3.5 h-3.5 text-white/50" />
                            </div>
                            <p className="font-bold text-white text-xs mb-1">{step.tit}</p>
                            <p className="text-[11px] text-white/60 font-light leading-relaxed">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* As 3 Regras de Ouro */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border bg-emerald-500/[0.04] border-emerald-500/20 space-y-1.5">
                    <p className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Sem Custo de API do Google
                    </p>
                    <p className="text-[11px] text-white/70 font-light leading-relaxed">
                      O motor utiliza scraping avançado headless (Botasaurus / Omkar) e o cluster SuperPool, não consumindo créditos caros da Google Cloud Places API.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border bg-blue-500/[0.04] border-blue-500/20 space-y-1.5">
                    <p className="font-bold text-blue-400 text-xs flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      Fale com o Dono, Não a Recepção
                    </p>
                    <p className="text-[11px] text-white/70 font-light leading-relaxed">
                      Com o Dossiê de BI, o sistema traz os nomes reais dos administradores registrados na Receita Federal para você nunca mais abordar dizendo &quot;Aos cuidados do responsável&quot;.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border bg-amber-500/[0.04] border-amber-500/20 space-y-1.5">
                    <p className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                      <Zap className="w-4 h-4" />
                      Entregabilidade Blindada
                    </p>
                    <p className="text-[11px] text-white/70 font-light leading-relaxed">
                      O SendPortal rotaciona 8 contas e domínios no Resend. Se um domínio aquecido tiver oscilação, os outros absorvem a carga sem cair em spam.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------------
                SEÇÃO 2: SIMULADOR DE CONVERSÃO & ROI B2B
                -------------------------------------------------------------------------- */}
            {secaoAtiva === 'simulador-roi' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-destaque tracking-wider">
                    Planejamento Financeiro &amp; Projeção de Pipeline
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mt-1 font-display flex items-center gap-2">
                    <Flame className="w-5 h-5 text-destaque" />
                    2. Simulador Interativo de Faturamento &amp; Conversão
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 font-light mt-1.5 leading-relaxed">
                    Ajuste os parâmetros abaixo para calcular o potencial de faturamento mensal e anual que o Client Hunter PRO pode gerar para a sua operação comercial com custo zero de infraestrutura.
                  </p>
                </div>

                {/* Grid com Controles Sliders e Painel de Resultados */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Controles Sliders */}
                  <div
                    className="lg:col-span-6 p-6 rounded-2xl border space-y-5"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                    }}
                  >
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-destaque" />
                      Parâmetros da Operação Comercial
                    </h4>

                    {/* Slider 1: Leads Minerados */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/80 font-medium">Leads Minerados por Semana:</span>
                        <span className="font-mono font-bold text-destaque">{simLeadsSemana} leads ({leadsMes}/mês)</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="600"
                        step="10"
                        value={simLeadsSemana}
                        onChange={(e) => setSimLeadsSemana(Number(e.target.value))}
                        className="w-full accent-destaque cursor-pointer"
                      />
                    </div>

                    {/* Slider 2: Taxa de Resposta */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/80 font-medium">Taxa de Resposta (WhatsApp / E-mail):</span>
                        <span className="font-mono font-bold text-amber-300">{simTaxaResposta}% ({respostasMes} respostas)</span>
                      </div>
                      <input
                        type="range"
                        min="3"
                        max="40"
                        step="1"
                        value={simTaxaResposta}
                        onChange={(e) => setSimTaxaResposta(Number(e.target.value))}
                        className="w-full accent-destaque cursor-pointer"
                      />
                      <p className="text-[10px] text-white/40 font-light">Média com dossiê de sócios do BI: 12% a 22%</p>
                    </div>

                    {/* Slider 3: Agendamento de Reunião */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/80 font-medium">Conversão em Reunião Agendada:</span>
                        <span className="font-mono font-bold text-cyan-400">{simTaxaReuniao}% ({reunioesMes} reuniões)</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        step="5"
                        value={simTaxaReuniao}
                        onChange={(e) => setSimTaxaReuniao(Number(e.target.value))}
                        className="w-full accent-destaque cursor-pointer"
                      />
                    </div>

                    {/* Slider 4: Fechamento de Contrato */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/80 font-medium">Taxa de Fechamento em Reunião:</span>
                        <span className="font-mono font-bold text-emerald-400">{simTaxaFechamento}% ({fechamentosMes} clientes)</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="60"
                        step="5"
                        value={simTaxaFechamento}
                        onChange={(e) => setSimTaxaFechamento(Number(e.target.value))}
                        className="w-full accent-destaque cursor-pointer"
                      />
                    </div>

                    {/* Slider 5: Ticket Médio */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/80 font-medium">Ticket Médio por Cliente (R$):</span>
                        <span className="font-mono font-bold text-white">R$ {simTicketMedio.toLocaleString('pt-BR')}</span>
                      </div>
                      <input
                        type="range"
                        min="500"
                        max="15000"
                        step="250"
                        value={simTicketMedio}
                        onChange={(e) => setSimTicketMedio(Number(e.target.value))}
                        className="w-full accent-destaque cursor-pointer"
                      />
                      <div className="flex gap-2 pt-1">
                        {[
                          { rotulo: 'Site R$ 1.5k', val: 1500 },
                          { rotulo: 'Tráfego R$ 2.5k', val: 2500 },
                          { rotulo: 'SaaS R$ 4.5k', val: 4500 },
                          { rotulo: 'Solar R$ 8k', val: 8000 },
                        ].map((p, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => setSimTicketMedio(p.val)}
                            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white/60 hover:text-white border border-white/10 transition-colors"
                          >
                            {p.rotulo}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Painel de Resultados */}
                  <div
                    className="lg:col-span-6 p-6 rounded-2xl border flex flex-col justify-between"
                    style={{
                      background: 'rgba(0, 0, 0, 0.45)',
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.20)',
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <Activity className="w-4 h-4" />
                          Resultado Mensal Projetado
                        </span>
                        <span className="text-[10px] font-mono text-white/40">Base de 30 dias</span>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                          <div>
                            <p className="text-[11px] text-white/60">Novos Clientes Fechados / Mês</p>
                            <p className="text-2xl font-bold text-white font-mono">{fechamentosMes} clientes</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] text-white/60">Reuniões Realizadas</p>
                            <p className="text-lg font-bold text-cyan-400 font-mono">{reunioesMes}</p>
                          </div>
                        </div>

                        {/* Receita Mensal */}
                        <div
                          className="p-5 rounded-2xl border relative overflow-hidden"
                          style={{
                            background: 'linear-gradient(135deg, rgba(var(--accent-rgb, 250, 66, 0), 0.15) 0%, rgba(0, 0, 0, 0.6) 100%)',
                            borderColor: 'rgba(var(--accent-rgb, 250, 66, 0), 0.40)',
                          }}
                        >
                          <p className="text-xs font-mono font-bold uppercase tracking-wider text-destaque mb-1">
                            Receita Nova Mensal Estimada
                          </p>
                          <p className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                            R$ {receitaNovaMes.toLocaleString('pt-BR')},00
                          </p>
                          <p className="text-xs text-white/60 font-light mt-1">
                            Projeção Anual: <strong className="text-white font-semibold">R$ {receitaAnual.toLocaleString('pt-BR')},00/ano</strong>
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                            <p className="text-[10px] text-white/50 uppercase font-mono">Custo de Software</p>
                            <p className="text-sm font-bold text-emerald-400 font-mono">R$ 0,00</p>
                            <p className="text-[10px] text-white/40 font-light">SuperPool 58 chaves free</p>
                          </div>
                          <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                            <p className="text-[10px] text-white/50 uppercase font-mono">Margem Líquida</p>
                            <p className="text-sm font-bold text-emerald-400 font-mono">100%</p>
                            <p className="text-[10px] text-white/40 font-light">Retorno de capital infinito</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between text-xs text-white/60">
                      <span>💡 Leads da <strong>Classe A</strong> fecham com até 3x mais velocidade.</span>
                      <Link href="/maps-scraper" className="text-destaque hover:underline font-semibold flex items-center gap-1">
                        <span>Iniciar Prospecção</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------------
                SEÇÃO 3: GOOGLE MAPS WEB SCRAPER
                -------------------------------------------------------------------------- */}
            {secaoAtiva === 'maps-scraper' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-destaque tracking-wider">
                    Módulo de Mineração Primária
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mt-1 font-display">
                    3. Google Maps Web Scraper: Como Extrair com Precisão
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 font-light mt-1.5 leading-relaxed">
                    Localizado na rota <code className="text-destaque">/maps-scraper</code>, este módulo é o motor de captação em massa. Ele emula um navegador Chromium de alta fidelidade sem carregar imagens pesadas, permitindo minerar dezenas de estabelecimentos em segundos.
                  </p>
                </div>

                {/* Passo a Passo Explicado */}
                <div className="space-y-4">
                  <div
                    className="p-5 rounded-2xl border space-y-3"
                    style={{
                      background: 'rgba(255, 255, 255, 0.025)',
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                    }}
                  >
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-destaque" />
                      Configurando os Campos de Busca (Inputs)
                    </h4>

                    <div className="space-y-3 text-xs text-white/80">
                      <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                        <p className="font-bold text-white flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-destaque" />
                          Campo 1: Search Queries (Consultas de Busca ou Links)
                        </p>
                        <p className="text-white/60 font-light leading-relaxed">
                          Digite o nicho desejado acompanhado da cidade e estado. Exemplos recomendados:
                          <br />
                          <code className="text-amber-300 font-mono text-[11px]">
                            &quot;Clínicas Odontológicas e Ortodontia em Campinas, SP&quot;
                          </code>
                          <br />
                          Você também pode colar URLs diretas de busca do Google Maps (<code className="text-cyan-400 font-mono text-[11px]">https://maps.google.com/?q=...</code>). Pressione <strong>Enter</strong> ou clique em <strong>Adicionar Query</strong>.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                        <p className="font-bold text-white flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-destaque" />
                          Campo 2: Extract Cities by Country (Escala Nacional)
                        </p>
                        <p className="text-white/60 font-light leading-relaxed">
                          Se você não quer digitar cidade por cidade, abra esta seção retrátil, selecione <strong>Brasil</strong> e defina a quantidade de cidades (ex: 20 maiores capitais). O motor criará automaticamente a fila de consultas para você.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                        <p className="font-bold text-white flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Toggle: Email and Social Links Extraction (Enriquecimento B2B)
                        </p>
                        <p className="text-white/60 font-light leading-relaxed">
                          <strong>Mantenha sempre ativado!</strong> Quando ligado, o robô visita o website oficial de cada empresa encontrada no Maps e varre o código HTML em busca de links de Instagram, Facebook, LinkedIn, Twitter/X e e-mails comerciais no rodapé ou página de contato.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                        <p className="font-bold text-white flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-destaque" />
                          Toggle: Reviews Extraction (Avaliações do Google)
                        </p>
                        <p className="text-white/60 font-light leading-relaxed">
                          Extrai as notas, a quantidade de avaliações, data de postagem e os comentários dos clientes. Comentários negativos de clientes são ganchos de ouro para vender melhorias operacionais.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border bg-amber-500/10 border-amber-500/30 text-xs space-y-1 text-white/80">
                    <p className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4" />
                      Dica de Ouro de Conversão: Fichas Não Reivindicadas
                    </p>
                    <p className="font-light leading-relaxed text-white/70">
                      O extrator identifica o atributo <code className="text-destaque font-mono font-bold">pode_reivindicar: true</code>. Isso significa que o negócio nunca reivindicou o perfil no Google Meu Negócio. Qualquer pessoa pode roubar a ficha ou mudar o telefone! Esta é a venda mais fácil do mundo: ligue e ofereça a regularização da ficha.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------------
                SEÇÃO 4: LEADS QUALIFICADOS & SCORE
                -------------------------------------------------------------------------- */}
            {secaoAtiva === 'leads-crm' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-destaque tracking-wider">
                    CRM &amp; Triagem Inteligente
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mt-1 font-display">
                    4. Gestão da Base &amp; A Régua do Score (0 a 100)
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 font-light mt-1.5 leading-relaxed">
                    Na tela principal (<code className="text-destaque">/</code>), você tem o consolidado de todos os leads minerados. Cada empresa recebe uma nota automática de 0 a 100 baseada na maturidade da sua presença digital.
                  </p>
                </div>

                {/* As 4 Classes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold font-mono text-emerald-400">CLASSE A</span>
                      <span className="text-[10px] font-mono text-white/50">Score 75 a 100</span>
                    </div>
                    <p className="text-xs font-bold text-white mb-1">Quente (Abordagem Imediata)</p>
                    <p className="text-[11px] text-white/60 font-light leading-relaxed">
                      Tem site no ar, celular/WhatsApp, e-mail e Instagram ativo. Alta probabilidade de resposta rápida.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border bg-blue-500/10 border-blue-500/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold font-mono text-blue-400">CLASSE B</span>
                      <span className="text-[10px] font-mono text-white/50">Score 50 a 74</span>
                    </div>
                    <p className="text-xs font-bold text-white mb-1">Bom (Cold Outreach)</p>
                    <p className="text-[11px] text-white/60 font-light leading-relaxed">
                      Tem e-mail ou telefone comercial e presença estabelecida, mas pode faltar um canal secundário.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border bg-amber-500/10 border-amber-500/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold font-mono text-amber-400">CLASSE C</span>
                      <span className="text-[10px] font-mono text-white/50">Score 25 a 49</span>
                    </div>
                    <p className="text-xs font-bold text-white mb-1">Fraco (Requer Investigação)</p>
                    <p className="text-[11px] text-white/60 font-light leading-relaxed">
                      Canais incompletos, site com erro ou apenas telefone fixo. Exige enriquecimento de BI para encontrar sócio.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border bg-rose-500/10 border-rose-500/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold font-mono text-rose-400">CLASSE D</span>
                      <span className="text-[10px] font-mono text-white/50">Score &lt; 25</span>
                    </div>
                    <p className="text-xs font-bold text-white mb-1">Descarte ou Reativação</p>
                    <p className="text-[11px] text-white/60 font-light leading-relaxed">
                      Apenas nome e endereço físico sem dados de contato ativos. Fica oculto por padrão no painel.
                    </p>
                  </div>
                </div>

                {/* Como Usar os Filtros */}
                <div
                  className="p-5 rounded-2xl border space-y-3"
                  style={{
                    background: 'rgba(255, 255, 255, 0.025)',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                  }}
                >
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                    <Filter className="w-4 h-4 text-destaque" />
                    Como Filtrar e Selecionar Leads em Lote
                  </h4>
                  <ul className="text-xs text-white/80 space-y-2 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-destaque mt-1.5 shrink-0" />
                      <span>
                        <strong>Filtro por Canal:</strong> Escolha entre <em>Google Maps</em>, <em>Instagram</em>, <em>LinkedIn</em> ou <em>Web Crawler</em>.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-destaque mt-1.5 shrink-0" />
                      <span>
                        <strong>Filtro por Oportunidade:</strong> Veja apenas quem não tem site (&quot;Sem Site&quot;), quem tem site fora do ar (&quot;Site Fora do Ar&quot;) ou quem não tem Pixel instalado (&quot;Sem Meta Pixel&quot;).
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-destaque mt-1.5 shrink-0" />
                      <span>
                        <strong>Ações em Lote:</strong> Marque múltiplos checkboxes para abrir a barra flutuante inferior. Com 1 clique você pode <em>Disparar E-mail Rápido</em> para 30 leads ou <em>Criar Campanha</em> direto no SendPortal.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------------
                SEÇÃO 5: BUSINESS INTELLIGENCE
                -------------------------------------------------------------------------- */}
            {secaoAtiva === 'bi-enriquecimento' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-destaque tracking-wider">
                    Inteligência Corporativa &amp; Receita Federal
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mt-1 font-display">
                    5. Dossiê de Business Intelligence (BI 1-Click)
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 font-light mt-1.5 leading-relaxed">
                    O maior diferencial do Client Hunter PRO. Na ficha individual de qualquer lead (<code className="text-destaque">/lead/[id]</code>), o botão <strong>Enriquecer com BI</strong> cruza fontes públicas e privadas para gerar um raio-x completo do negócio sem nenhum custo extra.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className="p-5 rounded-2xl border space-y-2.5"
                    style={{
                      background: 'rgba(255, 255, 255, 0.025)',
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                    }}
                  >
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-400" />
                      Dados Oficiais da Receita Federal
                    </h4>
                    <ul className="text-xs text-white/70 space-y-1.5 font-light leading-relaxed">
                      <li>• <strong>Razão Social &amp; Nome Fantasia:</strong> Identifica a empresa matriz real.</li>
                      <li>• <strong>CNPJ &amp; Idade da Empresa:</strong> Descubra há quantos anos o negócio opera.</li>
                      <li>• <strong>Capital Social Declarado:</strong> Permite estimar o porte financeiro do lead.</li>
                      <li>• <strong>Quadro de Sócios (QSA):</strong> Nomes completos dos donos e diretores legais.</li>
                    </ul>
                  </div>

                  <div
                    className="p-5 rounded-2xl border space-y-2.5"
                    style={{
                      background: 'rgba(255, 255, 255, 0.025)',
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                    }}
                  >
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-cyan-400" />
                      Auditoria de Tech Stack &amp; Pixels
                    </h4>
                    <ul className="text-xs text-white/70 space-y-1.5 font-light leading-relaxed">
                      <li>• <strong>CMS &amp; Plataforma:</strong> Detecta WordPress, Shopify, Nuvemshop, etc.</li>
                      <li>• <strong>Pixels de Anúncio:</strong> Meta Pixel, TikTok Ads, Google Tag Manager.</li>
                      <li>• <strong>Análise de Gaps:</strong> Se a empresa roda anúncio mas o site não tem pixel, ela está jogando dinheiro no lixo (argumento de venda imbatível).</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-purple-500/10 border-purple-500/25 text-xs text-white/80 space-y-1">
                  <p className="font-bold text-purple-400">Como Usar o Nome do Sócio na Abordagem:</p>
                  <p className="font-light leading-relaxed text-white/70">
                    Nunca comece dizendo: <em>&quot;Olá, você é o responsável pela clínica?&quot;</em>.
                    <br />
                    Comece assim: <em>&quot;Oi [Nome do Sócio], vi que você e a sua equipe cuidam da [Nome da Empresa] aqui em [Cidade]...&quot;</em>. A taxa de resposta sobe de 12% para mais de 58% instantaneamente.
                  </p>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------------
                SEÇÃO 6: ABORDAGEM WHATSAPP & SCRIPTS
                -------------------------------------------------------------------------- */}
            {secaoAtiva === 'abordagem-whatsapp' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-destaque tracking-wider">
                    Conversão em Vendas
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mt-1 font-display">
                    6. Abordagem WhatsApp com DDI Limpo &amp; Cadência em 3 Passos
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 font-light mt-1.5 leading-relaxed">
                    O Client Hunter possui um botão nativo de WhatsApp em todas as tabelas e na ficha do lead. O sistema trata automaticamente a formatação do número de telefone brasileiro para não dar erro de link inválido.
                  </p>
                </div>

                {/* Explicação da Sanitização do DDI */}
                <div
                  className="p-5 rounded-2xl border space-y-2"
                  style={{
                    background: 'rgba(255, 255, 255, 0.025)',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                  }}
                >
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Como Funciona a Sanitização Internacional de Telefone
                  </h4>
                  <p className="text-xs text-white/70 font-light leading-relaxed">
                    Muitos números no Google Maps vêm cadastrados sem DDD, ou com espaços, parênteses e traços (<code className="text-amber-300 font-mono">(11) 98765-4321</code>), ou duplicando o DDI (+55 55 11...).
                    A função interna <code className="text-destaque font-mono font-bold">whatsappNum()</code> sanitiza a string e garante o formato internacional padrão <code className="text-emerald-400 font-mono">5511987654321</code>. Assim, o link do <code className="text-cyan-400 font-mono">wa.me</code> nunca quebra.
                  </p>
                </div>

                {/* Cadência dos 3 Passos */}
                <div className="space-y-3">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                    A Cadência Testada de 3 Mensagens (Inclusa na Ficha do Lead)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl border bg-black/30 border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-destaque bg-destaque/10 px-2 py-0.5 rounded">
                          PASSO 1: Curiosidade
                        </span>
                        <Clock className="w-3.5 h-3.5 text-white/40" />
                      </div>
                      <p className="text-xs font-bold text-white">Gancho Inicial Rápido</p>
                      <p className="text-[11px] text-white/60 font-light leading-relaxed">
                        Mensagem curta de 2 linhas focada em confirmar se o número pertence ao decisor e apontar uma dúvida rápida sobre o serviço dele.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border bg-black/30 border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                          PASSO 2: Diagnóstico
                        </span>
                        <Clock className="w-3.5 h-3.5 text-white/40" />
                      </div>
                      <p className="text-xs font-bold text-white">A Dor Específica</p>
                      <p className="text-[11px] text-white/60 font-light leading-relaxed">
                        Apresenta o gap auditado (ex: site lento, ausência de pixel ou ficha não reivindicada) sem tom arrogante, oferecendo uma solução prática.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border bg-black/30 border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          PASSO 3: Chamada
                        </span>
                        <Clock className="w-3.5 h-3.5 text-white/40" />
                      </div>
                      <p className="text-xs font-bold text-white">Convite para Reunião</p>
                      <p className="text-[11px] text-white/60 font-light leading-relaxed">
                        Convite leve de 10 minutos para mostrar a oportunidade na prática, eliminando qualquer risco para o cliente.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------------
                SEÇÃO 7: SENDPORTAL DISPARO
                -------------------------------------------------------------------------- */}
            {secaoAtiva === 'sendportal-disparo' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-destaque tracking-wider">
                    Motor Enterprise de Disparo
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mt-1 font-display">
                    7. SendPortal: Campanhas de Cold E-mail em Massa
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 font-light mt-1.5 leading-relaxed">
                    O SendPortal gerencia campanhas, templates dinâmicos, listas de inscritos, tags e o cluster de despacho de 8 contas Resend em anel (Round-Robin), garantindo até 24.000 disparos diários com máxima entregabilidade.
                  </p>
                </div>

                {/* Wizard 4 Etapas */}
                <div
                  className="p-5 rounded-2xl border space-y-3"
                  style={{
                    background: 'rgba(255, 255, 255, 0.025)',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                  }}
                >
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                    <Mail className="w-4 h-4 text-destaque" />
                    O Wizard de 4 Etapas para Criar Campanhas (/campanhas/nova)
                  </h4>

                  <div className="space-y-3 text-xs text-white/80">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <p className="font-bold text-white">Etapa 1: Dados Básicos &amp; Remetente</p>
                      <p className="text-white/60 font-light leading-relaxed">
                        Dê um nome interno para a campanha (ex: <em>&quot;Campinas - Energia Solar Fev/26&quot;</em>), escreva o assunto do e-mail (dica: assuntos em minúsculas com 2 ou 3 palavras como <code className="text-amber-300 font-mono">&quot;uma dúvida rápida&quot;</code> batem recorde de abertura) e selecione o remetente cadastrado.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <p className="font-bold text-white">Etapa 2: Segmentação de Audiência</p>
                      <p className="text-white/60 font-light leading-relaxed">
                        Escolha as Tags ou Listas para onde disparar. O sistema calcula automaticamente quantos inscritos ativos e aptos receberão a mensagem, descartando quem já solicitou descadastro.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <p className="font-bold text-white">Etapa 3: Template Dinâmico &amp; Variáveis</p>
                      <p className="text-white/60 font-light leading-relaxed">
                        Escolha um template HTML da biblioteca. O editor exibe o preview simultâneo em Desktop (600px) e Mobile (375px). Você pode usar as variáveis dinâmicas:
                        <br />
                        <code className="text-destaque font-mono font-bold">
                          {'{{nome}}'}, {'{{empresa}}'}, {'{{cidade}}'}, {'{{nicho}}'}
                        </code>.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <p className="font-bold text-white">Etapa 4: Agendamento &amp; Disparo</p>
                      <p className="text-white/60 font-light leading-relaxed">
                        Revise os parâmetros e clique em <strong>Disparar Campanha</strong>. O cluster do SuperPool distribui as mensagens com intervalos inteligentes para não sofrer penalização de spam.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pixel e LGPD */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border bg-black/30 border-white/10 space-y-1.5 text-xs">
                    <p className="font-bold text-cyan-400 flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      Pixel Transparente 1x1 de Abertura
                    </p>
                    <p className="text-white/60 font-light leading-relaxed">
                      Cada e-mail enviado recebe um pixel transparente de 1 pixel embutido no HTML (<code className="text-cyan-300 font-mono">/api/track/open/[token]</code>). No momento em que o lead abre a mensagem, o sistema registra data, hora e IP na tela de <strong>Logs de Mensagens</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border bg-black/30 border-white/10 space-y-1.5 text-xs">
                    <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Descadastro 1-Click LGPD Obrigatório
                    </p>
                    <p className="text-white/60 font-light leading-relaxed">
                      O motor injeta automaticamente no rodapé de cada disparo o link com token criptográfico de opt-out (<code className="text-emerald-300 font-mono">/api/unsubscribe/[token]</code>). Se o lead clicar, ele é marcado instantaneamente como descadastrado, evitando processos e denúncias de spam.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------------
                SEÇÃO 8: SUPERPOOL & INFRAESTRUTURA
                -------------------------------------------------------------------------- */}
            {secaoAtiva === 'superpool-infra' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-destaque tracking-wider">
                    Cluster de Alta Resiliência
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mt-1 font-display">
                    8. O SuperPool de 58 Chaves de API &amp; Telemetria
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 font-light mt-1.5 leading-relaxed">
                    Localizado na aba <code className="text-destaque">/provedores</code>, o SuperPool é a infraestrutura que mantém o Client Hunter PRO funcionando de forma ininterrupta e com custo zero de mensalidade para o operador.
                  </p>
                </div>

                <div
                  className="p-5 rounded-2xl border space-y-3"
                  style={{
                    background: 'rgba(255, 255, 255, 0.025)',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                  }}
                >
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                    <Zap className="w-4 h-4 text-destaque" />
                    Distribuição das 58 Chaves de API no Cluster
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                      <p className="font-mono text-emerald-400 font-bold text-lg">13 Chaves</p>
                      <p className="font-bold text-white text-xs mt-1">Apify Actors</p>
                      <p className="text-[11px] text-white/50 font-light mt-1">Extração social, scraping profundo e enriquecimento.</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                      <p className="font-mono text-cyan-400 font-bold text-lg">8 Chaves</p>
                      <p className="font-bold text-white text-xs mt-1">Resend Cluster</p>
                      <p className="text-[11px] text-white/50 font-light mt-1">Disparo de cold emails com rotação em anel.</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                      <p className="font-mono text-purple-400 font-bold text-lg">12 Chaves</p>
                      <p className="font-bold text-white text-xs mt-1">Serper &amp; Search</p>
                      <p className="text-[11px] text-white/50 font-light mt-1">Busca Google instantânea de CNPJ e dados de site.</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                      <p className="font-mono text-amber-400 font-bold text-lg">25 Chaves</p>
                      <p className="font-bold text-white text-xs mt-1">Scrapers &amp; Proxies</p>
                      <p className="text-[11px] text-white/50 font-light mt-1">Nós residenciais e rotação de headers anti-bloqueio.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/25 text-xs text-white/80 space-y-1">
                  <p className="font-bold text-emerald-400">Failover Automático Silencioso:</p>
                  <p className="font-light leading-relaxed text-white/70">
                    Se uma das contas gratuitas atingir o limite mensal de requisições, o sistema detecta o erro 429 (Rate Limit) e desvia o tráfego instantaneamente para a próxima chave saudável da fila, sem interromper sua extração e sem travar a interface.
                  </p>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------------
                SEÇÃO 9: SHADERS VISUAL
                -------------------------------------------------------------------------- */}
            {secaoAtiva === 'shaders-visual' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-destaque tracking-wider">
                    Design System &amp; WebGL Engine
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mt-1 font-display">
                    9. Engine Visual Liquid Glass &amp; 37 Shaders WebGL
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 font-light mt-1.5 leading-relaxed">
                    O Client Hunter implementa uma interface cinematográfica baseada em Glassmorphism Apple puro acelerado por placa de vídeo, garantindo legibilidade com contraste AAA e sensação tátil moderna.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className="p-5 rounded-2xl border space-y-3"
                    style={{
                      background: 'rgba(255, 255, 255, 0.025)',
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                    }}
                  >
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-destaque" />
                      Como Customizar Cores Hex Primária e Secundária
                    </h4>
                    <p className="text-xs text-white/70 font-light leading-relaxed">
                      Acesse a tela <strong>Configurações &amp; Cores</strong> (<code className="text-destaque">/configuracoes</code>). Você pode escolher entre presets de cores corporativas (Laranja Padrão, Ruby, Cyber Violet, Azul Elétrico) ou digitar qualquer código HEX personalizado. As cores são aplicadas instantaneamente em botões, bordas, destaques e nos shaders WebGL ativos.
                    </p>
                  </div>

                  <div
                    className="p-5 rounded-2xl border space-y-3"
                    style={{
                      background: 'rgba(255, 255, 255, 0.025)',
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                    }}
                  >
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      O Seletor Flutuante de Shaders (Rodapé Direito)
                    </h4>
                    <p className="text-xs text-white/70 font-light leading-relaxed">
                      No canto inferior direito de qualquer tela, você verá o pill flutuante <em>&quot;Strands Luminosos (Liquid Glass)&quot;</em>. Clicando nele, abre-se a gaveta com 37 shaders matemáticos (Aurora Boreal, Ferrofluid, Plasma, Grid Cyberpunk) e galerias de wallpapers em alta definição com transição suave.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------------
                SEÇÃO 10: AUTOMAÇÃO IA & MCP
                -------------------------------------------------------------------------- */}
            {secaoAtiva === 'automacao-ia' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-destaque tracking-wider">
                    Controle por Linguagem Natural
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mt-1 font-display">
                    10. Automação via IA: Claude Code, Antigravity &amp; n8n
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 font-light mt-1.5 leading-relaxed">
                    Você não precisa ficar clicando na tela se preferir comandar a máquina por conversa. O Client Hunter possui paridade completa com servidores MCP (Model Context Protocol).
                  </p>
                </div>

                <div
                  className="p-5 rounded-2xl border space-y-3"
                  style={{
                    background: 'rgba(255, 255, 255, 0.025)',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                  }}
                >
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-destaque" />
                    Exemplos de Prompts para o Agente IA Executar Sozinho
                  </h4>

                  <div className="space-y-2 text-xs">
                    {[
                      {
                        rotulo: 'Mineração Completa de Nicho',
                        prompt: 'Procure 30 clínicas de cirurgia plástica em Florianópolis com extração de redes sociais e e-mails ativada.',
                      },
                      {
                        rotulo: 'Enriquecimento com BI em Lote',
                        prompt: 'Enriqueça todos os leads de Energia Solar da Classe A que ainda não possuem dossiê de sócios.',
                      },
                      {
                        rotulo: 'Criação e Disparo de Campanha',
                        prompt: 'Monte uma campanha de cold e-mail para os leads de Odontologia de São Paulo usando o template de dúvida rápida.',
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-white text-[11px] mb-0.5">{item.rotulo}</p>
                          <p className="text-white/60 font-mono text-[11px]">&quot;{item.prompt}&quot;</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => copiar(`prompt-${idx}`, item.prompt)}
                          className="px-2.5 py-1 rounded bg-white/10 text-white/70 hover:text-white text-[11px] font-mono shrink-0 transition-colors"
                        >
                          {codigoCopiado === `prompt-${idx}` ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------------
                SEÇÃO 11: FAQ & TROUBLESHOOTING
                -------------------------------------------------------------------------- */}
            {secaoAtiva === 'faq-troubleshooting' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-destaque tracking-wider">
                    Suporte &amp; Resolução
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mt-1 font-display">
                    11. Dúvidas Frequentes &amp; Resolução de Problemas
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 font-light mt-1.5 leading-relaxed">
                    Respostas cirúrgicas para as principais dúvidas do operador diário.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  {[
                    {
                      q: 'O que fazer se uma busca no Google Maps retornar menos empresas do que o esperado?',
                      a: 'Cidades muito pequenas têm baixa densidade comercial no Google Maps. Aumente o raio de busca ou use termos mais amplos (ex: em vez de "implante zigomático campinas", busque "dentista campinas"). Outra opção é ativar a extração por país selecionando múltiplas cidades vizinhas.',
                    },
                    {
                      q: 'Por que alguns leads aparecem com situação do site "sem site"?',
                      a: 'Muitos negócios locais dependem apenas de ficha no Maps ou perfil no Instagram e nunca criaram um site. Isso é uma excelente oportunidade para você vender a criação de uma página moderna de alta conversão.',
                    },
                    {
                      q: 'Como garantir que a taxa de entrega dos e-mails não caia?',
                      a: '1. Nunca envie mais de 500 mensagens por domínio nas primeiras 2 semanas sem aquecimento prévio.\n2. Não use palavras apelativas no assunto como "GRÁTIS", "URGENTE", "DINHEIRO FÁCIL".\n3. Remova periodicamente inscritos que nunca abriram seus e-mails após 3 tentativas.',
                    },
                    {
                      q: 'Onde ficam gravados todos os dados minerados?',
                      a: 'Os dados residem de forma unificada no banco SQLite local e espelhados no Supabase, garantindo que mesmo reiniciando o servidor ou a VPS nenhum lead seja perdido.',
                    },
                  ].map((faq, fIdx) => (
                    <div
                      key={fIdx}
                      className="p-4 rounded-xl border space-y-1.5 bg-black/30"
                      style={{ borderColor: 'rgba(255, 255, 255, 0.10)' }}
                    >
                      <p className="font-bold text-white flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-destaque shrink-0" />
                        {faq.q}
                      </p>
                      <p className="text-white/70 font-light leading-relaxed pl-6 whitespace-pre-line">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Rodapé Sequencial de Navegação Mobile & Desktop */}
            <div className="pt-8 mt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              {secaoAnterior ? (
                <button
                  type="button"
                  onClick={() => mudarSecao(secaoAnterior.id)}
                  className="w-full sm:w-auto flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/[0.05] hover:bg-white/10 active:bg-white/15 border border-white/15 text-white/80 hover:text-white text-xs font-semibold transition-all cursor-pointer min-h-[48px]"
                >
                  <ChevronLeft className="w-4 h-4 text-destaque shrink-0" />
                  <div className="text-left min-w-0">
                    <span className="block text-[10px] text-white/40 uppercase font-mono">Módulo Anterior ({secaoAnterior.num}/11)</span>
                    <span className="truncate block font-bold text-white">{secaoAnterior.curto}</span>
                  </div>
                </button>
              ) : <div className="hidden sm:block" />}

              {proximaSecao && (
                <button
                  type="button"
                  onClick={() => mudarSecao(proximaSecao.id)}
                  className="w-full sm:w-auto flex items-center justify-end gap-2.5 px-4 py-3 rounded-xl bg-destaque hover:bg-destaque/90 active:opacity-90 border border-destaque/40 text-white text-xs font-bold transition-all shadow-lg shadow-destaque/25 cursor-pointer ml-auto min-h-[48px]"
                >
                  <div className="text-right min-w-0">
                    <span className="block text-[10px] text-white/80 uppercase font-mono">Próximo Módulo ({proximaSecao.num}/11)</span>
                    <span className="truncate block font-extrabold">{proximaSecao.curto}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white shrink-0" />
                </button>
              )}
            </div>
          </main>
        </div>
        )}
      </div>

      {/* ==============================================================================
          BOTTOM SHEET MODAL: ÍNDICE COMPLETO (MOBILE LG-)
          ============================================================================== */}
      {modalIndiceAberto && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md transition-all lg:hidden animate-in fade-in duration-200">
          <div
            className="w-full max-h-[82vh] flex flex-col rounded-t-[28px] bg-[#0c0f17] border-t border-white/20 shadow-2xl p-4 sm:p-6 overflow-hidden animate-in slide-in-from-bottom duration-300"
            style={{
              boxShadow: '0 -20px 60px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.25)',
            }}
          >
            {/* Grab bar */}
            <div className="w-12 h-1 rounded-full bg-white/25 mx-auto mb-3" />

            {/* Top Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-destaque" />
                <h3 className="text-sm font-bold text-white uppercase font-display">
                  Índice de Módulos (11)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalIndiceAberto(false)}
                className="w-9 h-9 rounded-xl bg-white/10 text-white/70 hover:text-white flex items-center justify-center cursor-pointer active:bg-white/20"
                aria-label="Fechar índice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lista com Scroll Suave */}
            <div className="overflow-y-auto space-y-2 pr-1 py-1 flex-1">
              {secoes.map((sec) => {
                const SecIcon = sec.icone;
                const ativa = secaoAtiva === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => mudarSecao(sec.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer min-h-[50px] ${
                      ativa
                        ? 'bg-destaque/25 border border-destaque text-white font-bold shadow-md'
                        : 'bg-white/[0.03] border border-white/10 text-white/70 active:text-white active:bg-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono shrink-0 ${
                        ativa ? 'bg-destaque text-white font-bold' : 'bg-white/10 text-white/60'
                      }`}>
                        {sec.num}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                          <SecIcon className={`w-3.5 h-3.5 shrink-0 ${ativa ? 'text-destaque' : 'text-white/40'}`} />
                          <span>{sec.titulo}</span>
                        </p>
                        <p className="text-[11px] text-white/40 font-light truncate">
                          {sec.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${ativa ? 'text-destaque' : 'text-white/30'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Pagina>
  );
}
