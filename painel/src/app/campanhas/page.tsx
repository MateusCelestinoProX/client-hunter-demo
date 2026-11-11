import { Pagina, Titulo, Metrica, Vazio } from '@/components/ui';
import { listarCampanhasPainel, obterMetricasGeraisPainel, listarTemplatesPainel, listarTagsPainel } from '@/lib/sendportal';
import Link from 'next/link';
import FormNovaCampanha from './FormNovaCampanha';
import BotaoDisparar from './BotaoDisparar';
import { Mail, PlusCircle, Clock, ExternalLink, Send, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CampanhasPage() {
  const [campanhas, metricas, templates, tags] = await Promise.all([
    listarCampanhasPainel(),
    obterMetricasGeraisPainel(),
    listarTemplatesPainel(),
    listarTagsPainel(),
  ]);

  return (
    <Pagina>
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-destaque shadow-sm shadow-destaque/40" />
            <span className="text-xs font-mono uppercase tracking-wider text-apagado">
              SendPortal Campaign Hub
            </span>
          </div>
          <Titulo sub="Disparos em lote, templates dinâmicos e rastreamento analítico pelo SuperPool Resend">
            Campanhas SendPortal
          </Titulo>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/campanhas/nova"
            className="flex items-center gap-2 px-4 py-2 btn-primario rounded-lg text-xs font-semibold shadow-lg shadow-destaque/20 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Criar Campanha no Wizard
          </Link>
        </div>
      </div>

      {/* Grid de Métricas SendPortal */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-9">
        <Metrica rotulo="CAMPANHAS" valor={metricas.total_campanhas} nota="Total criadas" />
        <Metrica rotulo="ENVIADOS" valor={metricas.total_enviados} nota="E-mails entregues" destaque />
        <Metrica rotulo="TAXA ABERTURA" valor={`${metricas.taxa_abertura_media}%`} nota="Média global" />
        <Metrica rotulo="TAXA CLIQUES" valor={`${metricas.taxa_clique_media}%`} nota="CTR global" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de Campanhas (2 colunas) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider font-display">
              Campanhas Cadastradas
            </h2>
            <span className="text-xs text-apagado font-mono">{campanhas.length} cadastradas</span>
          </div>

          {campanhas.length === 0 ? (
            <div className="cartao p-8">
              <Vazio>Nenhuma campanha criada ainda. Utilize o Wizard ou o formulário ao lado para começar!</Vazio>
            </div>
          ) : (
            <div className="space-y-4">
              {campanhas.map((c) => {
                const statusColor = 
                  c.status === 'concluida' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  c.status === 'enviando' ? 'bg-destaque/10 text-destaque border-destaque/20' :
                  'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';

                return (
                  <div key={c.id} className="cartao p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-borda-forte transition">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border ${statusColor} font-mono uppercase font-semibold`}>
                          {c.status}
                        </span>
                        {c.tag_alvo && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                            {c.tag_alvo}
                          </span>
                        )}
                        <span className="text-[11px] text-apagado font-mono">{c.id}</span>
                      </div>
                      
                      <h3 className="text-base font-bold text-white truncate">{c.nome}</h3>
                      <p className="text-xs text-apagado mt-0.5 truncate">Assunto: &ldquo;{c.assunto}&rdquo;</p>
                      
                      {/* Métricas individuais */}
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-apagado">
                        <span>Enviados: <strong className="text-white">{c.total_enviados}</strong></span>
                        <span>Aberturas: <strong className="text-emerald-400">{c.total_aberturas} ({c.taxa_abertura}%)</strong></span>
                        <span>Cliques: <strong className="text-blue-400">{c.total_cliques} ({c.taxa_clique}%)</strong></span>
                        {c.total_unsubscribes > 0 && (
                          <span>Descadastros: <strong className="text-rose-400">{c.total_unsubscribes}</strong></span>
                        )}
                      </div>

                      {/* Link para Logs da Campanha */}
                      <div className="mt-3 pt-2.5 border-t border-borda/60 flex items-center gap-4">
                        <Link
                          href={`/mensagens?campanha=${c.id}`}
                          className="inline-flex items-center gap-1.5 text-xs text-destaque hover:underline font-medium"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Ver Logs Individuais de Mensagens</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                      <BotaoDisparar campanhaId={c.id} status={c.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Formulário de Criação Rápida (1 coluna) */}
        <div>
          <div className="cartao p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-borda">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Criação Rápida
              </h2>
              <Link
                href="/campanhas/nova"
                className="text-xs text-destaque hover:underline flex items-center gap-1"
              >
                Abrir Wizard <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <FormNovaCampanha templates={templates} tags={tags} />
          </div>
        </div>
      </div>
    </Pagina>
  );
}
