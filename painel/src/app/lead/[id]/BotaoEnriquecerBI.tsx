'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { nativeVibrate, nativeToast } from '@/lib/native';

export function BotaoEnriquecerBI({ leadId, jaEnriquecido }: { leadId: string; jaEnriquecido?: boolean }) {
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();

  async function handleEnriquecer() {
    setCarregando(true);
    setMensagem('Varrendo Apify Actors, LinkedIn Dorking e Tech Stack...');
    setErro(null);

    try {
      const res = await fetch('/api/prospeccao/enriquecer-bi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId }),
      });

      const data = await res.json();
      if (!res.ok || !data.sucesso) {
        throw new Error(data.erro || 'Falha ao enriquecer lead com Business Intelligence.');
      }

      nativeVibrate(50);
      nativeToast('✓ Dossiê de BI concluído com sucesso!');
      setMensagem('Dossiê de BI concluído com sucesso!');
      router.refresh();
      setTimeout(() => {
        setMensagem(null);
        setCarregando(false);
      }, 2500);
    } catch (e: any) {
      setErro(e.message || 'Erro inesperado.');
      setCarregando(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <button
        onClick={handleEnriquecer}
        disabled={carregando}
        className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
          carregando
            ? 'bg-azul/20 text-azul border border-azul/40 cursor-wait'
            : jaEnriquecido
            ? 'bg-roxo/10 hover:bg-roxo/20 text-roxo border border-roxo/30'
            : 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 text-cyan-300 border border-cyan-500/40'
        }`}
      >
        {carregando ? (
          <>
            <Loader2 size={16} className="animate-spin text-cyan-400" />
            <span>{mensagem || 'Processando BI...'}</span>
          </>
        ) : (
          <>
            <Sparkles size={16} className={jaEnriquecido ? 'text-roxo' : 'text-cyan-400 animate-pulse'} />
            <span>{jaEnriquecido ? 'Atualizar Dossiê de BI' : '⚡ Enriquecer com BI (Apify & Decisores)'}</span>
          </>
        )}
      </button>

      {erro && (
        <span className="text-xs text-red-400 flex items-center gap-1.5 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
          <AlertCircle size={14} /> {erro}
        </span>
      )}

      {mensagem && !carregando && (
        <span className="text-xs text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
          <CheckCircle2 size={14} /> {mensagem}
        </span>
      )}
    </div>
  );
}
