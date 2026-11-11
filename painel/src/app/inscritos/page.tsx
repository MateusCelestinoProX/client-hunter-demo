import { Pagina, Titulo, Vazio } from '@/components/ui';
import { listarInscritosPainel, listarTagsPainel } from '@/lib/sendportal';
import BotaoSincronizar from './BotaoSincronizar';

export const dynamic = 'force-dynamic';

export default function InscritosPage() {
  const inscritos = listarInscritosPainel({ limite: 100 });
  const tags = listarTagsPainel();

  return (
    <Pagina>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-7">
        <Titulo sub="Base unificada de contatos B2B segmentados por tags, nicho e canais de captação">
          Inscritos & Assinantes
        </Titulo>
        <BotaoSincronizar />
      </div>

      {/* Nuvem de Tags */}
      {tags.length > 0 && (
        <div className="cartao p-4 mb-6">
          <p className="text-xs font-semibold text-apagado uppercase mb-2">Segmentos & Tags Ativas</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t.id}
                className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono flex items-center gap-1.5"
              >
                <span>🏷️</span>
                <span>{t.nome}</span>
                <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded-full text-[10px]">
                  {t.total_inscritos || 0}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabela de Inscritos */}
      <div className="cartao overflow-hidden">
        {inscritos.length === 0 ? (
          <div className="p-8">
            <Vazio>Nenhum inscrito na base. Clique no botão acima para sincronizar os leads captados!</Vazio>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-apagado uppercase text-[11px] font-semibold bg-white/[0.04]">
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">E-mail</th>
                  <th className="py-3 px-4">Contato / Decisor</th>
                  <th className="py-3 px-4">Empresa</th>
                  <th className="py-3 px-4">Tags & Segmentação</th>
                  <th className="py-3 px-4">Cadastrado em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borda">
                {inscritos.map((ins) => {
                  const statusBadge =
                    ins.status === 'ativo'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20';

                  return (
                    <tr key={ins.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-semibold uppercase ${statusBadge}`}>
                          {ins.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-texto">
                        {ins.email}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-texto">{ins.primeiro_nome || '—'}</div>
                        {ins.cargo && <div className="text-[11px] text-apagado">{ins.cargo}</div>}
                      </td>
                      <td className="py-3 px-4 text-texto">
                        {ins.empresa || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {ins.tags_nomes ? (
                            ins.tags_nomes.split(', ').map((tn, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-mono"
                              >
                                {tn}
                              </span>
                            ))
                          ) : (
                            <span className="text-apagado">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-apagado font-mono text-[11px]">
                        {ins.created_at}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Pagina>
  );
}
