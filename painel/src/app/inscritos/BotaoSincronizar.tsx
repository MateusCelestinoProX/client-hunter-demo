'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BotaoSincronizar() {
  const router = useRouter();
  const [sincronizando, setSincronizando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const executarSync = async () => {
    setSincronizando(true);
    setMsg(null);

    try {
      const res = await fetch('/api/sendportal/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao sincronizar');

      setMsg(`✓ ${data.totalContatosProcessados || 0} contatos sincronizados (${data.novosContatos || 0} novos)!`);
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setMsg(`✗ Erro: ${err.message}`);
    } finally {
      setSincronizando(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {msg && (
        <span className={`text-xs px-2.5 py-1 rounded-lg border ${msg.startsWith('✓') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
          {msg}
        </span>
      )}
      <button
        onClick={executarSync}
        disabled={sincronizando}
        className="px-4 py-2 rounded-lg text-xs font-semibold bg-destaque hover:bg-destaque/90 text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
      >
        <span>🔄</span>
        <span>{sincronizando ? 'Sincronizando...' : 'Sincronizar Leads do Client Hunter'}</span>
      </button>
    </div>
  );
}
