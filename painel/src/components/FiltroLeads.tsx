'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

/** `rotuloTodos` troca o "Todos" do chip sem filtro — na prospeccao, sem filtro e "so os aptos". */
type Grupo = { chave: string; rotulo: string; rotuloTodos?: string; opcoes: { id: string; rotulo: string }[] };

export function FiltroLeads({
  filtro,
  grupos,
  rota = '/leads',
  placeholder = 'Nome, telefone, empresa ou nicho',
}: {
  filtro: Record<string, string | undefined>;
  grupos: Grupo[];
  rota?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [texto, setTexto] = useState(filtro.busca ?? '');

  // Busca com atraso: sem isso cada tecla vira uma consulta ao banco.
  useEffect(() => {
    const t = setTimeout(() => {
      const p = new URLSearchParams(params.toString());
      texto ? p.set('busca', texto) : p.delete('busca');
      router.replace(`${rota}?${p.toString()}`);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto]);

  function filtrar(chave: string, id: string | null) {
    const p = new URLSearchParams(params.toString());
    id ? p.set(chave, id) : p.delete(chave);
    router.replace(`${rota}?${p.toString()}`);
  }

  const chip = (ativo: boolean) =>
    `text-[11px] sm:text-[12px] px-3 py-1.5 rounded-xl border transition-all duration-200 whitespace-nowrap cursor-pointer select-none font-medium flex items-center gap-1.5 shrink-0 ${
      ativo
        ? 'border-destaque/70 text-destaque bg-destaque/20 shadow-[0_0_16px_rgba(var(--accent-rgb),0.25),inset_0_1px_0_rgba(255,255,255,0.25)] scale-[1.02]'
        : 'border-white/10 text-white/70 bg-white/[0.04] hover:bg-white/[0.09] hover:border-white/20 hover:text-white backdrop-blur-md'
    }`;

  return (
    <div className="flex flex-col gap-3.5">
      {/* Campo de Busca Responsivo */}
      <div className="relative w-full sm:w-[380px]">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-10 py-3 rounded-2xl border text-sm text-white placeholder-white/35 outline-none transition-all duration-200 focus:border-destaque focus:ring-2 focus:ring-destaque/20"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderColor: 'rgba(255, 255, 255, 0.14)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 4px 20px rgba(0, 0, 0, 0.25)',
          }}
          aria-label="Buscar lead"
        />
        {texto && (
          <button
            type="button"
            onClick={() => setTexto('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Grupos de Filtros com Scroll Horizontal no Mobile */}
      <div className="space-y-2">
        {grupos.map((g) => (
          <div key={g.chave} className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-white/40 w-20 shrink-0 select-none">
              {g.rotulo}
            </span>
            <button onClick={() => filtrar(g.chave, null)} className={chip(!filtro[g.chave])}>
              {g.rotuloTodos ?? 'Todos'}
            </button>
            {g.opcoes.map((o) => (
              <button key={o.id} onClick={() => filtrar(g.chave, o.id)} className={chip(filtro[g.chave] === o.id)}>
                {o.rotulo}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
