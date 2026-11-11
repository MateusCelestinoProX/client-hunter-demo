'use client';

import { useState } from 'react';
import { nativeVibrate, nativeToast } from '@/lib/native';
import {
  MapPin, X, Search, Globe, Phone, Star, ShieldCheck, CheckCircle2,
  Sparkles, Download, ArrowRight, Loader2, Navigation, Sliders, Layers
} from 'lucide-react';

interface ModalGoogleMapsScraperProps {
  aberto: boolean;
  aoFechar: () => void;
}

export function ModalGoogleMapsScraper({ aberto, aoFechar }: ModalGoogleMapsScraperProps) {
  // CAMPOS DE BUSCA 100% LIMPOS EM BRANCO (SEM MOCK DATA)
  const [termo, setTermo] = useState('');
  const [cidade, setCidade] = useState('');
  const [raio, setRaio] = useState(15);
  const [limite, setLimite] = useState(10);
  const [motor, setMotor] = useState<'superpool_apify' | 'google_places'>('superpool_apify');
  
  // Opções avançadas
  const [extrairAvaliacoes, setExtrairAvaliacoes] = useState(true);
  const [extrairContatos, setExtrairContatos] = useState(true);
  const [enriquecerSites, setEnriquecerSites] = useState(true);
  const [sincronizarSendPortal, setSincronizarSendPortal] = useState(true);

  // Estados de execução
  const [executando, setExecutando] = useState(false);
  const [progresso, setProgresso] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{
    sucesso: boolean;
    totalColetados: number;
    totalEnriquecidos: number;
    leads: any[];
    mensagem?: string;
  } | null>(null);

  if (!aberto) return null;

  async function handleIniciarScraper() {
    if (!termo.trim()) {
      alert('Por favor, informe a categoria ou termo de busca.');
      return;
    }
    if (!cidade.trim()) {
      alert('Por favor, informe a cidade ou localização geográfica.');
      return;
    }

    setExecutando(true);
    setResultado(null);
    setProgresso(`Conectando ao SuperPool Google Maps Scraper...`);
    nativeVibrate(40);
    nativeToast('📍 Conectando ao Google Maps Scraper...');

    try {
      const response = await fetch('/api/prospeccao/captar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canal: 'maps',
          nicho: termo.trim(),
          praca: cidade.trim(),
          limite: limite,
          enriquecer: enriquecerSites,
          sincronizarSendPortal: sincronizarSendPortal,
          opcoesAvancadas: {
            raioKm: raio,
            extrairReviews: extrairAvaliacoes,
            extrairContatos: extrairContatos,
            engine: motor
          }
        })
      });

      const data = await response.json();
      if (response.ok && data.sucesso) {
        nativeVibrate(60);
        nativeToast(`🎉 Google Maps: ${data?.novos || 0} novos estabelecimentos minerados!`);
        setResultado(data);
      } else {
        setResultado({
          sucesso: false,
          totalColetados: 0,
          totalEnriquecidos: 0,
          leads: [],
          mensagem: data.erro || 'Falha ao executar scraper do Google Maps.'
        });
      }
    } catch (err: any) {
      setResultado({
        sucesso: false,
        totalColetados: 0,
        totalEnriquecidos: 0,
        leads: [],
        mensagem: err.message || 'Erro de conexão com o servidor.'
      });
    } finally {
      setExecutando(false);
      setProgresso(null);
    }
  }

  function handleBaixarCsv() {
    if (!resultado?.leads?.length) return;
    const cabecalho = 'Nome,Telefone,WhatsApp,Site,Endereco,Nota,Avaliacoes,Score,Classe\n';
    const linhas = resultado.leads.map((l: any) => {
      const nome = `"${(l.nome || l.nome_empresa || '').replace(/"/g, '""')}"`;
      const tel = `"${l.telefone || l.telefone_google || ''}"`;
      const wpp = `"${l.celular || l.whatsapp || ''}"`;
      const site = `"${l.site || l.site_url_final || ''}"`;
      const end = `"${(l.endereco || '').replace(/"/g, '""')}"`;
      const nota = l.avaliacao || l.nota || '';
      const revs = l.total_avaliacoes || 0;
      const score = l.score || 0;
      const classe = l.classificacao || 'B';
      return [nome, tel, wpp, site, end, nota, revs, score, classe].join(',');
    }).join('\n');

    const blob = new Blob([cabecalho + linhas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `google-maps-leads-${termo.toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200">
      {/* Backdrop suave e translúcido que preserva a visibilidade do MCP OS */}
      <div
        className="fixed inset-0 transition-opacity"
        style={{
          background: 'rgba(0, 0, 0, 0.35)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
        onClick={() => !executando && aoFechar()}
      />

      {/* Janela Modal Apple Liquid Glass */}
      <div
        className="relative w-full max-w-3xl rounded-3xl overflow-hidden border shadow-2xl transition-all"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(8, 10, 15, 0.72) 100%)',
          backdropFilter: 'blur(36px) saturate(200%)',
          WebkitBackdropFilter: 'blur(36px) saturate(200%)',
          borderColor: 'rgba(255, 255, 255, 0.18)',
          boxShadow: '0 32px 100px -20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
        }}
      >
        {/* Shimmer especular superior */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, var(--accent-secondary, #FA4200) 50%, transparent 100%)',
          }}
        />

        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/25 shadow-lg text-white"
              style={{
                background: 'var(--accent-gradient)',
              }}
            >
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Google Maps Web Scraper
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-destaque/40 text-destaque bg-destaque/10">
                  Engine Oficial PRO
                </span>
              </div>
              <p className="text-xs text-white/60">
                Extração direta de locais, reviews, contatos e geolocalização profunda com SuperPool Apify.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={executando}
            onClick={aoFechar}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 cursor-pointer border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {resultado ? (
            /* Tela de Resultado */
            <div className="space-y-5">
              <div
                className={`p-5 rounded-2xl border ${
                  resultado.sucesso
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-red-500/30 bg-red-500/10 text-red-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {resultado.sucesso ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="w-6 h-6 text-red-400 shrink-0" />
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {resultado.sucesso ? 'Extração Concluída com Sucesso!' : 'Ocorreu um Erro'}
                    </h3>
                    <p className="text-xs opacity-80 mt-0.5">
                      {resultado.mensagem ||
                        `${resultado.totalColetados} estabelecimentos minerados e ${resultado.totalEnriquecidos} enriquecidos com dados de contato.`}
                    </p>
                  </div>
                </div>
              </div>

              {resultado.leads?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/70">
                      Estabelecimentos Minerados ({resultado.leads.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleBaixarCsv}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 text-xs text-white transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Exportar CSV
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {resultado.leads.map((lead: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">
                            {lead.nome || lead.nome_empresa}
                          </p>
                          <p className="text-[11px] text-white/50 truncate flex items-center gap-2 mt-0.5">
                            {lead.avaliacao && (
                              <span className="flex items-center gap-0.5 text-destaque">
                                <Star className="w-3 h-3 fill-current" /> {lead.avaliacao}
                              </span>
                            )}
                            {lead.celular || lead.whatsapp || lead.telefone ? (
                              <span className="text-emerald-400">
                                {lead.celular || lead.whatsapp || lead.telefone}
                              </span>
                            ) : null}
                            {lead.site && (
                              <span className="text-sky-400 truncate max-w-[150px]">
                                {lead.site}
                              </span>
                            )}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-white/20 bg-white/10 text-white shrink-0">
                          Score {lead.score || 80}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setResultado(null)}
                  className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-all cursor-pointer"
                >
                  Nova Extração do Maps
                </button>
                <button
                  type="button"
                  onClick={() => {
                    aoFechar();
                    window.location.reload();
                  }}
                  className="btn-primario flex items-center gap-2 px-5 py-2 rounded-xl text-white text-xs font-bold hover:brightness-110 transition-all cursor-pointer shadow-lg"
                >
                  <span>Ver Leads no Painel</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Formulário de Configuração */
            <div className="space-y-5">
              {/* Termo / Categoria (EM BRANCO / SEM MOCK DATA) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/80 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-destaque" />
                    Termo de Busca / Categoria no Google Maps
                  </span>
                  <span className="text-[10px] text-white/50 lowercase font-mono">campo em branco</span>
                </label>
                <input
                  type="text"
                  value={termo}
                  onChange={(e) => setTermo(e.target.value)}
                  placeholder="Digite a categoria ou atividade desejada..."
                  className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder-white/35 text-sm focus:outline-none focus:border-destaque transition-colors"
                  autoFocus
                />
              </div>

              {/* Localização & Praça (EM BRANCO / SEM MOCK DATA) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/80 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-destaque" />
                    Localização Geográfica (Cidade, Estado ou Bairro)
                  </span>
                  <span className="text-[10px] text-white/50 lowercase font-mono">campo em branco</span>
                </label>
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Digite a cidade, estado ou região desejada..."
                  className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder-white/35 text-sm focus:outline-none focus:border-destaque transition-colors"
                />
              </div>

              {/* Parâmetros Quantitativos (Raio e Limite) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                      Raio de Cobertura
                    </label>
                    <span className="text-xs font-bold text-destaque">{raio} km</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={50}
                    step={1}
                    value={raio}
                    onChange={(e) => setRaio(Number(e.target.value))}
                    className="w-full accent-destaque cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-white/40">
                    <span>2 km (Local)</span>
                    <span>15 km (Urbano)</span>
                    <span>50 km (Metropolitano)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Quantidade de Estabelecimentos
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 20, 50].map((qtd) => (
                      <button
                        key={qtd}
                        type="button"
                        onClick={() => setLimite(qtd)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          limite === qtd
                            ? 'border-destaque bg-destaque/20 text-destaque'
                            : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20'
                        }`}
                      >
                        {qtd}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Opções de Enriquecimento e Automação */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-semibold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-white/70" />
                  Módulos de Enriquecimento Ativos
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={extrairAvaliacoes}
                      onChange={(e) => setExtrairAvaliacoes(e.target.checked)}
                      className="accent-destaque rounded cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-medium text-white block">Avaliações & Reviews</span>
                      <span className="text-[10px] text-white/50 block">Nota média e comentários do Maps</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={extrairContatos}
                      onChange={(e) => setExtrairContatos(e.target.checked)}
                      className="accent-destaque rounded cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-medium text-white block">Telefones & WhatsApp</span>
                      <span className="text-[10px] text-white/50 block">Varredura de números corporativos</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={enriquecerSites}
                      onChange={(e) => setEnriquecerSites(e.target.checked)}
                      className="accent-destaque rounded cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-medium text-white block">Rastreamento de Pixels</span>
                      <span className="text-[10px] text-white/50 block">Meta Ads, Google Tag e GTM</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={sincronizarSendPortal}
                      onChange={(e) => setSincronizarSendPortal(e.target.checked)}
                      className="accent-destaque rounded cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-medium text-white block">SendPortal Sync</span>
                      <span className="text-[10px] text-white/50 block">Envio automático para listas de e-mail</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Seletor de Motor */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-white/60">Motor de Coleta Ativo:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMotor('superpool_apify')}
                    className={`px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                      motor === 'superpool_apify'
                        ? 'border-destaque bg-destaque/20 text-destaque'
                        : 'border-white/10 bg-white/5 text-white/50 hover:text-white'
                    }`}
                  >
                    SuperPool Apify (R$ 0)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMotor('google_places')}
                    className={`px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                      motor === 'google_places'
                        ? 'border-destaque bg-destaque/20 text-destaque'
                        : 'border-white/10 bg-white/5 text-white/50 hover:text-white'
                    }`}
                  >
                    Google Places API
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Disparo */}
        {!resultado && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Sparkles className="w-4 h-4 text-destaque" />
              <span>{progresso || 'SuperPool Apify conectado e pronto para extração.'}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={executando}
                onClick={aoFechar}
                className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 transition-all cursor-pointer disabled:opacity-30"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={executando}
                onClick={handleIniciarScraper}
                className="btn-primario flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-xs hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-lg disabled:opacity-50"
              >
                {executando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Minerando Locais...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 fill-white" />
                    <span>Iniciar Scraper do Maps</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
