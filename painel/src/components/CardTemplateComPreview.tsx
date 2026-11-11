'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Template } from '@/lib/sendportal-types';
import { Monitor, Smartphone, Send, Copy, Check, Code, ShieldCheck, Flame, Award, FileText } from 'lucide-react';

export function CardTemplateComPreview({ tpl }: { tpl: Template }) {
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [copiado, setCopiado] = useState(false);
  const [copiadoTexto, setCopiadoTexto] = useState(false);

  const getHtmlPreview = () => {
    return tpl.conteudo_html
      .replace(/\{\{\s*first_name\s*\}\}/g, 'Carlos')
      .replace(/\{\{\s*company\s*\}\}/g, 'Solar Prime')
      .replace(/\{\{\s*cargo\s*\}\}/g, 'Diretor de Operações')
      .replace(/\{\{\s*nicho\s*\}\}/g, 'Energia Solar')
      .replace(/\{\{\s*cidade\s*\}\}/g, 'Curitiba')
      .replace(/\{\{\s*unsubscribe_url\s*\}\}/g, '#descadastro');
  };

  const copiarHtml = () => {
    navigator.clipboard.writeText(tpl.conteudo_html);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const textoPuro = tpl.conteudo_texto || tpl.conteudo_html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const contagemPalavras = textoPuro.trim().split(/\s+/).filter(Boolean).length;

  const copiarTextoPuro = () => {
    navigator.clipboard.writeText(textoPuro);
    setCopiadoTexto(true);
    setTimeout(() => setCopiadoTexto(false), 2000);
  };

  const isHormozi = tpl.id.includes('hormozi') || tpl.nome.toLowerCase().includes('hormozi') || tpl.nome.toLowerCase().includes('troia');
  const isSpear = tpl.id.includes('spear') || tpl.nome.toLowerCase().includes('lança');
  const isFollowup = tpl.id.includes('followup') || tpl.id.includes('breakup') || tpl.nome.toLowerCase().includes('passo');

  return (
    <div className="rounded-xl border border-white/16 bg-gradient-to-br from-white/[0.09] to-white/[0.03] backdrop-blur-xl flex flex-col justify-between overflow-hidden shadow-lg hover:border-white/28 transition group">
      {/* Header */}
      <div className="p-5 border-b border-borda/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-destaque/15 text-destaque border border-destaque/30 font-mono font-medium">
              {tpl.id}
            </span>
            {isHormozi && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-destaque/15 text-destaque border border-destaque/30 font-mono flex items-center gap-1">
                <Award size={10} /> Hormozi 2026
              </span>
            )}
            {isSpear && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono flex items-center gap-1">
                <Flame size={10} /> 10M Tested
              </span>
            )}
            {isFollowup && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono">
                Cadência Multi-Toque
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <ShieldCheck size={11} />
            <span>{contagemPalavras} palavras</span>
          </div>
        </div>

        <h2 className="text-base font-bold text-white mb-1 font-display tracking-tight group-hover:text-destaque transition">
          {tpl.nome}
        </h2>
        <p className="text-xs text-apagado">
          Assunto: &ldquo;<span className="text-white font-medium font-mono">{tpl.assunto_padrao || '—'}</span>&rdquo;
        </p>

        {/* Dynamic Tags */}
        <div className="mt-3">
          <p className="text-[10px] font-bold text-apagado/60 uppercase tracking-wider mb-1.5">
            Variáveis Dinâmicas
          </p>
          <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
            {['{{first_name}}', '{{company}}', '{{nicho}}', '{{cidade}}', '{{unsubscribe_url}}'].map((v) => (
              <span key={v} className="px-2 py-0.5 rounded bg-black/40 border border-borda text-zinc-300">
                {v}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Preview Container */}
      <div className="p-4 bg-black/50 flex flex-col items-center">
        {/* Viewport Switcher */}
        <div className="w-full flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase font-bold text-apagado tracking-wider flex items-center gap-1.5">
            Pré-visualização da Caixa de Entrada
          </span>
          <div className="flex items-center gap-1 bg-black/50 p-0.5 rounded-lg border border-borda">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded text-xs transition ${
                viewport === 'desktop' ? 'bg-destaque text-white shadow' : 'text-apagado hover:text-white'
              }`}
              title="Desktop (600px)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded text-xs transition ${
                viewport === 'mobile' ? 'bg-destaque text-white shadow' : 'text-apagado hover:text-white'
              }`}
              title="Mobile (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Screen simulator */}
        <div
          className={`bg-white rounded-lg shadow-xl overflow-hidden border border-zinc-300 transition-all duration-300 ${
            viewport === 'mobile' ? 'w-[320px]' : 'w-full'
          }`}
        >
          <div className="bg-zinc-100 border-b border-zinc-200 px-3 py-1.5 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>Para: carlos@solarprime.com.br</span>
            <span>Gmail / M365</span>
          </div>
          <div
            className="p-4 text-xs font-sans text-zinc-800 overflow-y-auto max-h-[220px]"
            dangerouslySetInnerHTML={{ __html: getHtmlPreview() }}
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-black/40 border-t border-borda/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copiarTextoPuro}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-mono font-medium border border-borda transition"
          >
            {copiadoTexto ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5 text-cyan-400" />}
            {copiadoTexto ? 'Texto Copiado!' : 'Copiar Plain Text'}
          </button>

          <button
            type="button"
            onClick={copiarHtml}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-mono font-medium border border-borda transition"
          >
            {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code className="w-3.5 h-3.5 text-destaque" />}
            {copiado ? 'HTML Copiado!' : 'Copiar HTML'}
          </button>
        </div>

        <Link
          href={`/campanhas/nova?template_id=${tpl.id}`}
          className="flex items-center gap-1.5 px-3.5 py-1.5 btn-primario rounded-lg text-xs font-semibold shadow-md transition ml-auto"
        >
          <Send className="w-3.5 h-3.5" />
          Usar em Campanha
        </Link>
      </div>
    </div>
  );
}
