import Link from 'next/link';
import { listarTemplatesPainel } from '@/lib/sendportal';
import { CardTemplateComPreview } from '@/components/CardTemplateComPreview';
import { FileText, PlusCircle, ShieldCheck, Flame, Award, ChevronRight, Zap } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
  const templates = listarTemplatesPainel();

  return (
    <div className="p-6 lg:p-9 max-w-[1600px] mx-auto space-y-7">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-destaque shadow-sm shadow-destaque/40" />
            <span className="text-xs font-mono uppercase tracking-wider text-apagado">
              SendPortal & Cold Outreach Suite · Playbook 2026/2027
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase font-display flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-destaque" />
            Modelos de E-mail (Templates de Alta Conversão)
          </h1>
          <p className="text-xs text-apagado mt-1">
            Modelos calibrados pela análise de 10 milhões de cold emails e a metodologia de ofertas irresistíveis de Alex Hormozi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/campanhas/nova"
            className="flex items-center gap-2 px-4 py-2 btn-primario rounded-lg text-xs font-semibold shadow-lg shadow-destaque/20 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Nova Campanha
          </Link>
        </div>
      </div>

      {/* Banner Metodológico: As 4 Regras de Ouro de Deliverability & Conversão */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl border border-white/18 bg-gradient-to-r from-white/[0.08] via-white/[0.04] to-white/[0.08] backdrop-blur-xl shadow-xl">
        <div className="flex items-start gap-3 p-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Zero Links no 1º E-mail</h2>
            <p className="text-[11px] text-apagado mt-0.5 leading-snug">
              Sem links ou botões no primeiro contato. Garante entrega na Caixa Principal e 0% de spam triggers.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-2">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">35 a 75 Palavras (A Lança)</h2>
            <p className="text-[11px] text-apagado mt-0.5 leading-snug">
              Extensão cirúrgica. E-mails curtos parecem digitados à mão no celular e convertem 40% a mais.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-2">
          <div className="p-2 rounded-lg bg-destaque/10 border border-destaque/20 text-destaque shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Trojan Horse (Hormozi)</h2>
            <p className="text-[11px] text-apagado mt-0.5 leading-snug">
              Reduza o atrito a zero. Ofereça um vídeo de 90s ou auditoria pronta e peça apenas permissão para enviar.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-2">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Cadência em 3 Toques</h2>
            <p className="text-[11px] text-apagado mt-0.5 leading-snug">
              Dia 1 (A Lança) → Dia 3 (Bump com Prova Social) → Dia 7 (Breakup elegante que gera 30% das respostas).
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Interactive Templates */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {templates.map((tpl) => (
          <CardTemplateComPreview key={tpl.id} tpl={tpl} />
        ))}
      </div>
    </div>
  );
}
