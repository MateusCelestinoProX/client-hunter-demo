import Link from 'next/link';
import { 
  listarMensagensPainel, 
  obterResumoMensagensPainel, 
  listarEventosPainel, 
  listarCampanhasPainel 
} from '@/lib/sendportal';
import { 
  Mail, 
  CheckCircle2, 
  Eye, 
  MousePointerClick, 
  AlertTriangle, 
  Clock, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ExternalLink,
  RefreshCw,
  Send
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MensagensPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; busca?: string; campanha?: string }>;
}) {
  const { status, busca, campanha } = await searchParams;

  const [mensagens, resumo, eventos, campanhas] = await Promise.all([
    listarMensagensPainel({ status: status || '', busca: busca || '', campanha_id: campanha || '', limite: 100 }),
    obterResumoMensagensPainel(),
    listarEventosPainel(15),
    listarCampanhasPainel(),
  ]);

  const formatarData = (dataStr?: string | null) => {
    if (!dataStr) return '—';
    try {
      const d = new Date(dataStr);
      return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dataStr;
    }
  };

  const getStatusBadge = (msgStatus: string) => {
    switch (msgStatus) {
      case 'clicado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <MousePointerClick className="w-3.5 h-3.5" />
            Clicado
          </span>
        );
      case 'aberto':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <Eye className="w-3.5 h-3.5" />
            Aberto
          </span>
        );
      case 'enviado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Enviado
          </span>
        );
      case 'falha':
      case 'bounce':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            {msgStatus === 'bounce' ? 'Bounce' : 'Falha'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-destaque/15 text-destaque border border-destaque/30">
            <Clock className="w-3.5 h-3.5" />
            Pendente
          </span>
        );
    }
  };

  return (
    <div className="p-6 lg:p-9 max-w-[1600px] mx-auto space-y-7">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-destaque shadow-sm shadow-destaque/40" />
            <span className="text-xs font-mono uppercase tracking-wider text-apagado">SendPortal Logs & Rastreamento</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase font-display">
            Logs Detalhados de Mensagens
          </h1>
          <p className="text-xs text-apagado mt-1">
            Registro individual de cada disparo com pixel de rastreamento de abertura, cliques e auditoria de entrega ESP.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/campanhas/nova"
            className="flex items-center gap-2 px-4 py-2 btn-primario rounded-lg text-xs font-semibold shadow-lg shadow-destaque/20 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            Nova Campanha
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="cartao p-4">
          <span className="text-[11px] text-apagado uppercase font-medium">Total Gravado</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">{resumo.total}</div>
          <span className="text-[10px] text-apagado/70 font-light">mensagens</span>
        </div>

        <div className="cartao p-4">
          <span className="text-[11px] text-sky-400 uppercase font-medium">Enviados</span>
          <div className="text-2xl font-bold font-mono text-sky-300 mt-1">{resumo.enviados}</div>
          <span className="text-[10px] text-apagado/70 font-light">entregues ao ESP</span>
        </div>

        <div className="cartao p-4">
          <span className="text-[11px] text-purple-400 uppercase font-medium">Abertos</span>
          <div className="text-2xl font-bold font-mono text-purple-300 mt-1">{resumo.abertos}</div>
          <span className="text-[10px] text-apagado/70 font-light">pixel 1x1 disparado</span>
        </div>

        <div className="cartao p-4">
          <span className="text-[11px] text-emerald-400 uppercase font-medium">Clicados</span>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">{resumo.clicados}</div>
          <span className="text-[10px] text-apagado/70 font-light">redirecionamentos</span>
        </div>

        <div className="cartao p-4">
          <span className="text-[11px] text-destaque uppercase font-medium">Bounces</span>
          <div className="text-2xl font-bold font-mono text-destaque-hover mt-1">{resumo.bounces}</div>
          <span className="text-[10px] text-apagado/70 font-light">caixa inexistente</span>
        </div>

        <div className="cartao p-4">
          <span className="text-[11px] text-rose-400 uppercase font-medium">Falhas</span>
          <div className="text-2xl font-bold font-mono text-rose-300 mt-1">{resumo.falhas}</div>
          <span className="text-[10px] text-apagado/70 font-light">erros de rotação</span>
        </div>
      </div>

      {/* Main Content Layout: Table + Live Activity Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Messages Table (3 Columns) */}
        <div className="xl:col-span-3 space-y-4">
          {/* Filters Bar */}
          <div className="cartao p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto text-xs">
              <Link
                href="/mensagens"
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  !status
                    ? 'bg-destaque/15 text-destaque border-destaque/40 font-semibold'
                    : 'text-apagado border-borda hover:text-white'
                }`}
              >
                Todos ({resumo.total})
              </Link>
              <Link
                href="/mensagens?status=enviado"
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  status === 'enviado'
                    ? 'bg-sky-500/15 text-sky-400 border-sky-500/40 font-semibold'
                    : 'text-apagado border-borda hover:text-white'
                }`}
              >
                Enviados ({resumo.enviados})
              </Link>
              <Link
                href="/mensagens?status=aberto"
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  status === 'aberto'
                    ? 'bg-purple-500/15 text-purple-400 border-purple-500/40 font-semibold'
                    : 'text-apagado border-borda hover:text-white'
                }`}
              >
                Abertos ({resumo.abertos})
              </Link>
              <Link
                href="/mensagens?status=clicado"
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  status === 'clicado'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 font-semibold'
                    : 'text-apagado border-borda hover:text-white'
                }`}
              >
                Clicados ({resumo.clicados})
              </Link>
              <Link
                href="/mensagens?status=falha"
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  status === 'falha'
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/40 font-semibold'
                    : 'text-apagado border-borda hover:text-white'
                }`}
              >
                Falhas ({resumo.falhas})
              </Link>
            </div>

            <form method="GET" action="/mensagens" className="flex items-center gap-2 w-full sm:w-auto">
              {status && <input type="hidden" name="status" value={status} />}
              {campanha && <input type="hidden" name="campanha" value={campanha} />}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-apagado" />
                <input
                  type="text"
                  name="busca"
                  defaultValue={busca || ''}
                  placeholder="Buscar e-mail ou contato..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/40 border border-borda text-xs text-texto placeholder:text-apagado/50 focus:border-destaque outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs hover:bg-zinc-700 transition"
              >
                Filtrar
              </button>
            </form>
          </div>

          {/* Table Container */}
          <div className="cartao overflow-hidden">
            {mensagens.length === 0 ? (
              <div className="p-12 text-center text-apagado space-y-3">
                <Mail className="w-10 h-10 mx-auto text-apagado/40" />
                <p className="text-sm font-medium">Nenhum log de mensagem registrado com esses filtros.</p>
                <p className="text-xs text-apagado/70 max-w-md mx-auto">
                  Dispare uma campanha pelo SendPortal ou utilize a ação &quot;Enviar Cold Mail&quot; diretamente na tabela de leads de prospecção.
                </p>
                <div className="pt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg btn-primario text-white text-xs font-semibold"
                  >
                    Ir para Tabela de Leads
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-borda/80 bg-black/30 text-apagado/80 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Destinatário & Empresa</th>
                      <th className="py-3 px-4">Campanha</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Enviado em</th>
                      <th className="py-3 px-4">Aberto em</th>
                      <th className="py-3 px-4">Provedor ESP</th>
                      <th className="py-3 px-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-borda/50">
                    {mensagens.map((msg) => (
                      <tr key={msg.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            {msg.destinatario_email}
                          </div>
                          {(msg.primeiro_nome || msg.empresa) && (
                            <div className="text-[11px] text-apagado flex items-center gap-1.5 mt-0.5">
                              {msg.primeiro_nome && <span>{msg.primeiro_nome}</span>}
                              {msg.empresa && (
                                <span className="text-apagado/70">
                                  · <span className="text-white/80">{msg.empresa}</span>
                                </span>
                              )}
                              {msg.cargo && <span className="text-apagado/60">({msg.cargo})</span>}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-white font-medium truncate max-w-[200px]" title={msg.campanha_nome}>
                            {msg.campanha_nome}
                          </div>
                          <div className="text-[10px] text-apagado/70 truncate max-w-[200px]" title={msg.campanha_assunto}>
                            {msg.campanha_assunto}
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {getStatusBadge(msg.status)}
                          {msg.erro_detalhe && (
                            <p className="text-[10px] text-rose-400 mt-1 max-w-[160px] truncate" title={msg.erro_detalhe}>
                              {msg.erro_detalhe}
                            </p>
                          )}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap font-mono text-apagado text-[11px]">
                          {formatarData(msg.enviado_em || msg.created_at)}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {msg.aberto_em ? (
                            <div className="font-mono text-purple-300 text-[11px]">
                              {formatarData(msg.aberto_em)}
                            </div>
                          ) : (
                            <span className="text-apagado/40 font-mono">—</span>
                          )}
                          {msg.clicado_em && (
                            <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                              <MousePointerClick className="w-2.5 h-2.5" />
                              Clicou: {formatarData(msg.clicado_em)}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap font-mono text-[10px] text-apagado/80">
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                            {msg.provedor_id ? msg.provedor_id.slice(0, 16) : 'Resend-Pool'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            title="Reenviar este e-mail individualmente"
                            className="p-1.5 rounded-lg border border-borda text-apagado hover:text-white hover:border-destaque transition"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Live Activity Feed (1 Column) */}
        <div className="space-y-4">
          <div className="cartao p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-borda/80">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                  Feed de Atividade ao Vivo
                </h3>
              </div>
              <span className="text-[10px] font-mono text-apagado">Tempo Real</span>
            </div>

            {eventos.length === 0 ? (
              <p className="text-xs text-apagado text-center py-6">
                Nenhum evento registrado ainda. Os cliques e aberturas aparecerão aqui instantaneamente.
              </p>
            ) : (
              <div className="space-y-3">
                {eventos.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-2.5 rounded-lg border border-white/10 bg-white/[0.04] backdrop-blur-sm hover:border-white/20 transition text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-semibold">
                        {ev.tipo === 'clique' && (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <MousePointerClick className="w-3 h-3" /> Clique no Link
                          </span>
                        )}
                        {ev.tipo === 'abertura' && (
                          <span className="text-purple-400 flex items-center gap-1">
                            <Eye className="w-3 h-3" /> E-mail Aberto
                          </span>
                        )}
                        {ev.tipo === 'descadastro' && (
                          <span className="text-destaque flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Opt-out LGPD
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] font-mono text-apagado/60">
                        {formatarData(ev.created_at)}
                      </span>
                    </div>

                    <div className="text-[11px] text-white truncate font-medium">
                      {ev.email}
                    </div>

                    {ev.empresa && (
                      <div className="text-[10px] text-apagado/80">
                        Empresa: <span className="text-white">{ev.empresa}</span>
                      </div>
                    )}

                    {ev.url_destino && (
                      <div className="text-[10px] text-emerald-300/80 truncate font-mono bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-900/30">
                        🔗 {ev.url_destino}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Help Card */}
          <div className="cartao p-4 space-y-2 text-xs border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <span>💡</span> Como funciona o Tracking
            </h4>
            <p className="text-[11px] text-apagado leading-relaxed font-light">
              O SendPortal insere automaticamente um pixel transparente 1x1 em cada mensagem para detectar abertura e reescreve links para registrar cliques e redirecionar com código 302 sem adicionar atraso perceptível para o destinatário.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
