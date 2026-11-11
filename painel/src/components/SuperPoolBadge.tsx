import React from 'react';
import { type SuperPoolStats } from '@/lib/superpool';
import { Server, Activity, ShieldCheck, Zap } from 'lucide-react';

export function SuperPoolBadge({ stats }: { stats: SuperPoolStats | null }) {
  if (!stats) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono bg-zinc-800/80 border border-zinc-700/60 text-zinc-400">
        <Server className="w-3.5 h-3.5 text-zinc-500" />
        <span>SuperPool Local / Standalone</span>
      </div>
    );
  }

  const apify = stats.providers?.apify?.active_keys ?? 0;
  const firecrawl = stats.providers?.firecrawl?.active_keys ?? 0;
  const exa = stats.providers?.exa?.active_keys ?? 0;
  const resend = stats.providers?.resend?.active_keys ?? 0;

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-3 py-1.5 rounded-lg text-xs font-mono bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 shadow-sm max-w-full">
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-semibold text-emerald-200">SuperPool VPS</span>
      </div>
      <div className="hidden sm:block h-3 w-px bg-emerald-500/30"></div>
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] text-emerald-300/90">
        <span title="Contas ativas do Apify (Instagram / Ads / SERP)">Apify: <strong>{apify}</strong></span>
        <span>•</span>
        <span title="Contas ativas do Firecrawl (Markdown / Anti-Bot)">Firecrawl: <strong>{firecrawl}</strong></span>
        <span>•</span>
        <span title="Contas ativas do Exa AI (Busca Neural)">Exa: <strong>{exa}</strong></span>
        <span>•</span>
        <span title="Contas ativas do Resend (E-mail)">Resend: <strong>{resend}</strong></span>
      </div>
    </div>
  );
}
