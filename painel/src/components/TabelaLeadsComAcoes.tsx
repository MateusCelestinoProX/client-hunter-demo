'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LeadProspeccao, canalInfo, classeInfo, logoDoSite, situacaoSite, nomeOportunidade, nomeNicho } from '@/lib/prospeccao-types';
import { telefone as fmtTel, num, whatsappNum } from '@/lib/fmt';
import { nativeVibrate, nativeCopy, nativeToast, nativeShare } from '@/lib/native';
import { SeloClasse } from '@/components/SeloClasse';
import { LogoEmpresa } from '@/components/LogoEmpresa';
import {
  Star,
  Mail,
  Send,
  CheckSquare,
  Square,
  Sparkles,
  X,
  ExternalLink,
  MessageCircle,
  ChevronRight,
  Phone,
  Check,
  Share2,
} from 'lucide-react';

export function TabelaLeadsComAcoes({ leads }: { leads: LeadProspeccao[] }) {
  const router = useRouter();
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [modalCampanha, setModalCampanha] = useState(false);
  const [modalEmailRapido, setModalEmailRapido] = useState(false);
  const [leadIndividual, setLeadIndividual] = useState<LeadProspeccao | null>(null);

  // Form states
  const [nomeCampanha, setNomeCampanha] = useState('');
  const [assunto, setAssunto] = useState('');
  const [templateId, setTemplateId] = useState('tpl_cold_outreach_b2b');
  const [enviando, setEnviando] = useState(false);
  const [msgFeedback, setMsgFeedback] = useState<string | null>(null);

  const toggleLead = (id: string) => {
    nativeVibrate(20);
    const novo = new Set(selecionados);
    if (novo.has(id)) novo.delete(id);
    else novo.add(id);
    setSelecionados(novo);
  };

  const selecionarTodos = () => {
    nativeVibrate(30);
    if (selecionados.size === leads.length) {
      setSelecionados(new Set());
    } else {
      setSelecionados(new Set(leads.map((l) => l.id)));
    }
  };

  const selecionarClasseA = () => {
    nativeVibrate(30);
    const classeAIds = leads.filter((l) => l.classificacao === 'A').map((l) => l.id);
    setSelecionados(new Set(classeAIds));
  };

  // 1. Criar Campanha SendPortal com os leads selecionados
  const handleCriarCampanha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeCampanha || !assunto) return;

    setEnviando(true);
    setMsgFeedback(null);

    try {
      const res = await fetch('/api/sendportal/campanhas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nomeCampanha,
          assunto,
          template_id: templateId,
          leads_ids: Array.from(selecionados),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao criar campanha');

      nativeVibrate(60);
      nativeToast('🎉 Campanha criada com sucesso!');
      setMsgFeedback('🎉 Campanha criada com sucesso! Redirecionando...');
      setTimeout(() => {
        router.push('/campanhas');
      }, 1200);
    } catch (err: any) {
      setMsgFeedback(`✗ ${err.message}`);
      setEnviando(false);
    }
  };

  // 2. Disparar E-mail Rápido Direto
  const handleEnviarEmailRapido = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setMsgFeedback(null);

    const alvos = leadIndividual ? [leadIndividual.id] : Array.from(selecionados);

    try {
      let sucessos = 0;
      let erros = 0;

      for (const id of alvos) {
        const res = await fetch('/api/sendportal/email-rapido', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lead_id: id,
            assunto: assunto || undefined,
            template_id: templateId,
          }),
        });

        if (res.ok) sucessos++;
        else erros++;
      }

      if (sucessos > 0) {
        nativeVibrate(50);
        nativeToast(`✓ ${sucessos} e-mails despachados via SuperPool!`);
      }
      setMsgFeedback(`✓ Envio concluído: ${sucessos} entregues via SuperPool Resend (${erros} falhas).`);
      setTimeout(() => {
        setModalEmailRapido(false);
        setLeadIndividual(null);
        setSelecionados(new Set());
        setMsgFeedback(null);
        setEnviando(false);
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setMsgFeedback(`✗ ${err.message}`);
      setEnviando(false);
    }
  };

  // 3. Enriquecer BI em lote com Apify Actors e LinkedIn Dorking
  const handleEnriquecerBISelecionados = async () => {
    if (selecionados.size === 0) return;
    setEnviando(true);
    setMsgFeedback(`⚡ Varrendo Apify Actors e LinkedIn para ${selecionados.size} leads...`);

    try {
      const res = await fetch('/api/prospeccao/enriquecer-bi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_ids: Array.from(selecionados) }),
      });
      const data = await res.json();
      if (!res.ok || !data.sucesso) throw new Error(data.erro || 'Falha no enriquecimento de BI.');

      setMsgFeedback(`✓ ${data.total} leads enriquecidos com Dossiê BI e Decisores!`);
      setTimeout(() => {
        setMsgFeedback(null);
        setEnviando(false);
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setMsgFeedback(`✗ ${err.message}`);
      setEnviando(false);
    }
  };

  const handleEnriquecerBIIndividual = async (leadId: string) => {
    setEnviando(true);
    setMsgFeedback('⚡ Varrendo Apify Actors, Decisores e Tech Stack...');

    try {
      const res = await fetch('/api/prospeccao/enriquecer-bi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId }),
      });
      const data = await res.json();
      if (!res.ok || !data.sucesso) throw new Error(data.erro || 'Falha ao enriquecer com BI.');

      nativeVibrate(50);
      nativeToast('✓ Dossiê de BI atualizado!');
      setMsgFeedback('✓ Dossiê de Business Intelligence gerado com sucesso!');
      setTimeout(() => {
        setMsgFeedback(null);
        setEnviando(false);
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setMsgFeedback(`✗ ${err.message}`);
      setEnviando(false);
    }
  };

  return (
    <>
      {/* Barra de Seleção Rápida no Topo da Tabela */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={selecionarTodos}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer min-h-[40px] select-none"
          >
            {selecionados.size === leads.length && leads.length > 0 ? (
              <CheckSquare size={15} className="text-destaque" />
            ) : (
              <Square size={15} />
            )}
            <span>{selecionados.size === leads.length && leads.length > 0 ? 'Desmarcar Todos' : 'Selecionar Todos'}</span>
          </button>

          <button
            type="button"
            onClick={selecionarClasseA}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition-all cursor-pointer min-h-[40px] font-semibold select-none"
          >
            <Sparkles size={14} />
            <span>Só Classe A ({leads.filter((l) => l.classificacao === 'A').length})</span>
          </button>
        </div>

        {selecionados.size > 0 && (
          <span className="text-white/60 font-mono text-xs">
            <strong className="text-white">{selecionados.size}</strong> de {leads.length} selecionados
          </span>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. VISUALIZAÇÃO DESKTOP: TABELA COMPLETA (Hidden em telas < 768px)         */}
      {/* ========================================================================= */}
      <div className="hidden md:block cartao overflow-x-auto">
        <table className="w-full text-sm min-w-[1100px]">
          <thead>
            <tr className="text-white/50 text-[11px] uppercase tracking-wider border-b border-white/10 bg-black/20">
              <th className="w-10 px-3 py-3 text-center">
                <input
                  type="checkbox"
                  checked={selecionados.size === leads.length && leads.length > 0}
                  onChange={selecionarTodos}
                  className="rounded border-white/20 bg-white/5 text-destaque focus:ring-0 cursor-pointer w-4 h-4 accent-destaque"
                />
              </th>
              <th className="text-left font-medium px-4 py-3">Empresa</th>
              <th className="text-left font-medium px-4 py-3">Nota</th>
              <th className="text-left font-medium px-4 py-3">Contato & E-mail</th>
              <th className="text-left font-medium px-4 py-3">Site</th>
              <th className="text-left font-medium px-4 py-3">Oportunidade</th>
              <th className="text-left font-medium px-4 py-3">Google</th>
              <th className="text-left font-medium px-4 py-3">Ações SendPortal</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => {
              const selecionado = selecionados.has(l.id);
              const fora = l.aderente_nicho === false || l.requisitos_ok === false;
              const cInfo = canalInfo(l.canal_origem || (l.id.startsWith('linkedin:') ? 'linkedin' : l.id.startsWith('instagram:') ? 'instagram' : l.id.startsWith('web:') ? 'web' : 'maps'));
              const temEmail = Boolean(l.emails && l.emails.length > 0);

              return (
                <tr
                  key={l.id}
                  className={`border-b border-white/5 transition-colors ${
                    selecionado ? 'bg-destaque/10' : 'hover:bg-white/[0.03]'
                  } ${fora ? 'opacity-55' : ''}`}
                >
                  <td className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selecionado}
                      onChange={() => toggleLead(l.id)}
                      className="rounded border-white/20 bg-white/5 text-destaque focus:ring-0 cursor-pointer w-4 h-4 accent-destaque"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/lead/${l.id}`} className="flex items-center gap-3">
                      <LogoEmpresa
                        src={logoDoSite(l.site_url_final ?? l.site)}
                        nome={l.nome_empresa ?? l.nome ?? '?'}
                        cor={classeInfo(l.classificacao).cor}
                        tamanho={38}
                      />
                      <span className="min-w-0">
                        <p className="font-medium flex items-center gap-2 flex-wrap text-white">
                          <span>{l.nome_empresa ?? l.nome ?? '(sem nome)'}</span>
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-medium tracking-wider px-2 py-0.5 rounded-full border shrink-0"
                            style={{ color: cInfo.cor, borderColor: (cInfo as any).borda || `${cInfo.cor}40`, backgroundColor: cInfo.bg }}
                          >
                            <span>{cInfo.icone}</span>
                            <span>{cInfo.rotulo}</span>
                          </span>
                        </p>
                        <p className="text-xs text-white/50 font-light">
                          {[l.nome_pessoa ?? l.decisor, [l.cidade, l.uf].filter(Boolean).join('/')].filter(Boolean).join(' · ') || '—'}
                        </p>
                        {l.bi_dossier && (
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              <Sparkles size={10} /> BI {l.bi_dossier.score_bi}
                            </span>
                            {l.decisores && l.decisores.length > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                👤 {l.decisores[0].nome.split(' ')[0]}
                              </span>
                            )}
                          </div>
                        )}
                        {fora && (
                          <p className="text-[11px] text-destaque/80 font-light">
                            {l.aderente_nicho === false ? 'fora do nicho' : 'reprovado nos requisitos'}
                          </p>
                        )}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <SeloClasse classe={l.classificacao} score={l.score} />
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <p className="text-white/80">{fmtTel(l.celular ?? l.whatsapp ?? l.telefone_google)}</p>
                    <p className={`font-light truncate max-w-[220px] ${temEmail ? 'text-sky-400 font-mono font-medium' : 'text-white/40'}`}>
                      {l.emails?.[0] ? `✉ ${l.emails[0]}` : '—'}
                    </p>
                  </td>
                  <td className={`px-4 py-3 text-xs ${l.situacao_site === 'com_site' ? 'text-white/60' : 'text-destaque'}`}>
                    {situacaoSite(l.situacao_site)}
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs">{nomeOportunidade(l.oportunidade)}</td>
                  <td className="px-4 py-3 text-white/50 text-xs">
                    {l.avaliacao ? (
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <Star size={13} className="text-destaque fill-current" />
                        <span className="text-white font-medium">
                          {Number(l.avaliacao).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                        </span>
                        · {num(l.total_avaliacoes)}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {temEmail && (
                        <button
                          type="button"
                          onClick={() => {
                            setLeadIndividual(l);
                            setAssunto(`Oportunidade para a ${l.nome_empresa || l.nome}`);
                            setModalEmailRapido(true);
                          }}
                          title="Enviar e-mail direto pelo SendPortal"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                        >
                          <Mail size={12} />
                          <span>Cold Mail</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleEnriquecerBIIndividual(l.id)}
                        title="Enriquecer com Business Intelligence (Apify & Decisores)"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded transition-colors cursor-pointer text-xs ${
                          l.bi_dossier
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25'
                            : 'bg-white/5 text-white/70 border border-white/10 hover:bg-cyan-600 hover:text-white'
                        }`}
                      >
                        <Sparkles size={11} className={l.bi_dossier ? 'text-cyan-400' : ''} />
                        <span>{l.bi_dossier ? `BI ${l.bi_dossier.score_bi}` : '✨ BI'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* 2. VISUALIZAÇÃO MOBILE: CARDS TOUCH-FIRST ERGONÔMICOS (md:hidden)        */}
      {/* ========================================================================= */}
      <div className="md:hidden space-y-3">
        {leads.map((l) => {
          const selecionado = selecionados.has(l.id);
          const cInfo = canalInfo(l.canal_origem || (l.id.startsWith('linkedin:') ? 'linkedin' : l.id.startsWith('instagram:') ? 'instagram' : l.id.startsWith('web:') ? 'web' : 'maps'));
          const temEmail = Boolean(l.emails && l.emails.length > 0);
          const telefoneRaw = l.celular ?? l.whatsapp ?? l.telefone_google;
          const telWhats = whatsappNum(telefoneRaw);
          const temSite = Boolean(l.site_url_final || l.site);
          const siteUrl = l.site_url_final || l.site || '';

          return (
            <div
              key={l.id}
              className={`p-4 rounded-2xl border transition-all relative overflow-hidden select-none ${
                selecionado
                  ? 'border-destaque/70 bg-destaque/15 shadow-lg shadow-destaque/20'
                  : 'border-white/18 bg-gradient-to-br from-white/[0.10] to-white/[0.04]'
              }`}
              style={{
                backdropFilter: 'blur(28px) saturate(190%)',
                WebkitBackdropFilter: 'blur(28px) saturate(190%)',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
              }}
            >
              {/* Header do Card Mobile */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 min-w-0">
                  {/* Checkbox de seleção com touch target amplo */}
                  <button
                    type="button"
                    onClick={() => toggleLead(l.id)}
                    className="p-1 -ml-1 text-white/60 hover:text-white cursor-pointer"
                    aria-label="Selecionar lead"
                  >
                    {selecionado ? (
                      <div className="w-5 h-5 rounded-md bg-destaque text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-md border border-white/30 bg-white/5" />
                    )}
                  </button>

                  <LogoEmpresa
                    src={logoDoSite(l.site_url_final ?? l.site)}
                    nome={l.nome_empresa ?? l.nome ?? '?'}
                    cor={classeInfo(l.classificacao).cor}
                    tamanho={36}
                  />

                  <div className="min-w-0">
                    <Link href={`/lead/${l.id}`}>
                      <h4 className="font-bold text-sm text-white truncate hover:text-destaque transition-colors">
                        {l.nome_empresa ?? l.nome ?? '(sem nome)'}
                      </h4>
                    </Link>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span
                        className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.2 rounded-full border shrink-0"
                        style={{ color: cInfo.cor, borderColor: (cInfo as any).borda || `${cInfo.cor}40`, backgroundColor: cInfo.bg }}
                      >
                        <span>{cInfo.icone}</span>
                        <span>{cInfo.rotulo}</span>
                      </span>
                      <span className="text-[11px] text-white/50 truncate">
                        {[l.cidade, l.uf].filter(Boolean).join('/') || 'Brasil'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score & Selo */}
                <div className="shrink-0">
                  <SeloClasse classe={l.classificacao} score={l.score} />
                </div>
              </div>

              {/* Informações Centrais */}
              <div className="text-xs text-white/70 space-y-1 mb-3 bg-white/[0.05] p-2.5 rounded-xl border border-white/10 backdrop-blur-sm">
                {l.nome_pessoa || l.decisor ? (
                  <p className="truncate">
                    <strong className="text-white/90">Decisor:</strong> {l.nome_pessoa ?? l.decisor}
                  </p>
                ) : null}

                {telefoneRaw ? (
                  <p className="flex items-center gap-1.5 text-white/80">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{fmtTel(telefoneRaw)}</span>
                  </p>
                ) : null}

                {temEmail ? (
                  <p className="flex items-center gap-1.5 text-sky-400 font-mono truncate">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{l.emails?.[0]}</span>
                  </p>
                ) : null}

                {l.avaliacao ? (
                  <div className="flex items-center gap-1 text-[11px] text-destaque pt-0.5">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{Number(l.avaliacao).toFixed(1)}</span>
                    <span className="text-white/40">({num(l.total_avaliacoes)} avaliações)</span>
                  </div>
                ) : null}

                {l.bi_dossier && (
                  <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" /> BI {l.bi_dossier.score_bi} ({l.bi_dossier.maturidade_digital.split(' ')[0]})
                    </span>
                    {l.decisores && l.decisores.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        👤 {l.decisores[0].nome.split(' ')[0]} ({l.decisores[0].cargo?.split(' ')[0] || 'Decisor'})
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Barra de Ações Rápidas Mobile (Touch Target >= 44px) */}
              <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-white/5">
                {/* 1. WhatsApp / Celular */}
                {telWhats ? (
                  <a
                    href={`https://wa.me/${telWhats}?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20sobre%20a%20${encodeURIComponent(l.nome_empresa || l.nome || '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => nativeVibrate(30)}
                    className="flex items-center justify-center gap-1 py-2.5 px-1 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-semibold text-xs active:bg-emerald-600 active:text-white transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Whats</span>
                  </a>
                ) : (
                  <div className="flex items-center justify-center py-2.5 px-1 rounded-xl bg-white/[0.02] text-white/30 text-xs border border-white/5">
                    Sem Tel
                  </div>
                )}

                {/* 2. Cold Mail */}
                {temEmail ? (
                  <button
                    type="button"
                    onClick={() => {
                      setLeadIndividual(l);
                      setAssunto(`Oportunidade para a ${l.nome_empresa || l.nome}`);
                      setModalEmailRapido(true);
                    }}
                    className="flex items-center justify-center gap-1 py-2.5 px-1 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold text-xs active:bg-blue-600 active:text-white transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Mail</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-center py-2.5 px-1 rounded-xl bg-white/[0.02] text-white/30 text-xs border border-white/5">
                    Sem Mail
                  </div>
                )}

                {/* 3. Site ou Perfil */}
                {temSite ? (
                  <a
                    href={siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 py-2.5 px-1 rounded-xl bg-white/10 text-white border border-white/15 font-semibold text-xs active:bg-white/20 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Site</span>
                  </a>
                ) : (
                  <Link
                    href={`/lead/${l.id}`}
                    className="flex items-center justify-center gap-1 py-2.5 px-1 rounded-xl bg-white/10 text-white border border-white/15 font-semibold text-xs active:bg-white/20 transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span>Ver</span>
                  </Link>
                )}

                {/* 4. Business Intelligence */}
                <button
                  type="button"
                  onClick={() => handleEnriquecerBIIndividual(l.id)}
                  className={`flex items-center justify-center gap-1 py-2.5 px-1 rounded-xl font-semibold text-xs transition-colors ${
                    l.bi_dossier
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 active:bg-cyan-500/30'
                      : 'bg-white/10 text-white/80 border border-white/15 hover:bg-cyan-600 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{l.bi_dossier ? `BI ${l.bi_dossier.score_bi}` : 'BI'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. BARRA FLUTUANTE DE AÇÃO EM MASSA (Safe-zone acima da bottom bar)      */}
      {/* ========================================================================= */}
      {selecionados.size > 0 && (
        <div
          className="fixed bottom-22 md:bottom-7 left-3 right-3 md:left-1/2 md:right-auto md:-translate-x-1/2 z-40 p-3 sm:px-6 sm:py-3.5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between sm:justify-start gap-3 animate-in fade-in slide-in-from-bottom-5 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(14, 18, 28, 0.52) 100%)',
            backdropFilter: 'blur(36px) saturate(210%)',
            WebkitBackdropFilter: 'blur(36px) saturate(210%)',
            borderColor: 'rgba(255, 255, 255, 0.22)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
          }}
        >
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-destaque animate-pulse shadow-sm shadow-destaque/50" />
              <span>{selecionados.size} leads marcados</span>
            </span>

            <button
              type="button"
              onClick={() => setSelecionados(new Set())}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition sm:hidden"
            >
              <X size={16} />
            </button>
          </div>

          <div className="hidden sm:block h-5 w-px bg-white/15" />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              disabled={enviando}
              onClick={handleEnriquecerBISelecionados}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-600/25 border border-white/20"
            >
              <Sparkles size={13} className="text-cyan-200 animate-pulse" />
              <span>{enviando ? 'Varrendo BI...' : `✨ Enriquecer BI (${selecionados.size})`}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setNomeCampanha(`Campanha Outbound (${selecionados.size} leads)`);
                setAssunto('Soluções personalizadas para a {{company}}');
                setModalCampanha(true);
              }}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl text-xs font-bold btn-primario flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-destaque/25 border border-white/20"
            >
              <Send size={13} />
              <span>+ Campanha</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLeadIndividual(null);
                setAssunto('Oportunidade de eficiência para a {{company}}');
                setModalEmailRapido(true);
              }}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/25 border border-white/20"
            >
              <Mail size={13} />
              <span>E-mail Rápido</span>
            </button>

            <button
              type="button"
              onClick={() => setSelecionados(new Set())}
              className="hidden sm:flex p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Limpar seleção"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL 1: CRIAR CAMPANHA SENDPORTAL (Liquid Glass Translúcido)          */}
      {/* ========================================================================= */}
      {modalCampanha && (
        <div 
          className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200"
          style={{
            background: 'rgba(0, 0, 0, 0.35)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
          onClick={(e) => { if (e.target === e.currentTarget && !enviando) setModalCampanha(false); }}
        >
          <div 
            className="w-full max-w-lg rounded-3xl border p-5 sm:p-6 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 space-y-4"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(14, 18, 28, 0.50) 100%)',
              backdropFilter: 'blur(36px) saturate(200%)',
              WebkitBackdropFilter: 'blur(36px) saturate(200%)',
              borderColor: 'rgba(255, 255, 255, 0.18)',
              boxShadow: '0 32px 100px -20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-destaque to-destaque-hover flex items-center justify-center text-white shadow-md">🚀</span>
                <span>Nova Campanha SendPortal</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalCampanha(false)}
                className="p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer border border-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-white/70">
              A campanha será criada no SendPortal Hub com <strong className="text-white">{selecionados.size} leads</strong> selecionados e pronta para disparo escalonado.
            </p>

            {msgFeedback && (
              <div className={`p-3.5 rounded-xl text-xs font-semibold ${msgFeedback.startsWith('🎉') ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'}`}>
                {msgFeedback}
              </div>
            )}

            <form onSubmit={handleCriarCampanha} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1.5">Nome da Campanha</label>
                <input
                  type="text"
                  value={nomeCampanha}
                  onChange={(e) => setNomeCampanha(e.target.value)}
                  placeholder="Ex: Prospecção Q4 - Energia Solar"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white placeholder-white/40 text-sm focus:outline-none focus:border-destaque"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1.5">Assunto do E-mail</label>
                <input
                  type="text"
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  placeholder="Ex: Oportunidade para a {{company}}"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white placeholder-white/40 text-sm focus:outline-none focus:border-destaque"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1.5">Modelo / Template</label>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/15 bg-zinc-950 text-white text-sm focus:outline-none focus:border-destaque"
                >
                  <option value="tpl_cold_outreach_b2b">Cold Outreach B2B - Redução de Custos e Eficiência</option>
                  <option value="tpl_diagnostico_gratuito">Convite para Diagnóstico Gratuito de Presença Digital</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalCampanha(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/15 text-white/70 hover:text-white bg-white/5 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando}
                  className="px-5 py-2.5 rounded-xl btn-primario text-white font-bold text-xs shadow-lg shadow-destaque/25 transition flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>{enviando ? 'Criando...' : 'Criar Campanha'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL 2: E-MAIL RÁPIDO 1x1 (Liquid Glass Translúcido)                  */}
      {/* ========================================================================= */}
      {modalEmailRapido && (
        <div 
          className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200"
          style={{
            background: 'rgba(0, 0, 0, 0.35)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
          onClick={(e) => { if (e.target === e.currentTarget && !enviando) setModalEmailRapido(false); }}
        >
          <div 
            className="w-full max-w-lg rounded-3xl border p-5 sm:p-6 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 space-y-4"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(14, 18, 28, 0.50) 100%)',
              backdropFilter: 'blur(36px) saturate(200%)',
              WebkitBackdropFilter: 'blur(36px) saturate(200%)',
              borderColor: 'rgba(255, 255, 255, 0.18)',
              boxShadow: '0 32px 100px -20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">✉️</span>
                <span>Disparo de Cold Mail Direto</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalEmailRapido(false)}
                className="p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer border border-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-white/70">
              {leadIndividual ? (
                <>Destinatário: <strong className="text-white">{leadIndividual.emails?.[0]}</strong> ({leadIndividual.nome_empresa || leadIndividual.nome})</>
              ) : (
                <>Disparando para <strong className="text-white">{selecionados.size} leads selecionados</strong> com rotação pelas contas do SuperPool Resend.</>
              )}
            </p>

            {msgFeedback && (
              <div className={`p-3.5 rounded-xl text-xs font-semibold ${msgFeedback.startsWith('✓') ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'}`}>
                {msgFeedback}
              </div>
            )}

            <form onSubmit={handleEnviarEmailRapido} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1.5">Assunto</label>
                <input
                  type="text"
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  placeholder="Ex: Oportunidade para a {{company}}"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white placeholder-white/40 text-sm focus:outline-none focus:border-destaque"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1.5">Modelo / Template</label>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/15 bg-zinc-950 text-white text-sm focus:outline-none focus:border-destaque"
                >
                  <option value="tpl_cold_outreach_b2b">Cold Outreach B2B - Redução de Custos e Eficiência</option>
                  <option value="tpl_diagnostico_gratuito">Convite para Diagnóstico Gratuito de Presença Digital</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
                ℹ️ O e-mail receberá pixel invisível 1x1 de abertura e link de opt-out em conformidade com a LGPD.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalEmailRapido(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/15 text-white/70 hover:text-white bg-white/5 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-blue-500/25 hover:brightness-110 transition flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>{enviando ? 'Enviando...' : 'Disparar Agora'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
