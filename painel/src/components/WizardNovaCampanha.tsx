'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Template, Tag } from '@/lib/sendportal-types';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Mail, 
  Eye, 
  Smartphone, 
  Monitor, 
  Users, 
  Send, 
  Sparkles, 
  AlertCircle,
  Code,
  Tag as TagIcon,
  CheckCircle2
} from 'lucide-react';

interface WizardProps {
  templates: Template[];
  tags: Tag[];
}

export function WizardNovaCampanha({ templates, tags }: WizardProps) {
  const router = useRouter();

  // Etapa atual (1 a 4)
  const [etapa, setEtapa] = useState<number>(1);

  // Dados do Formulário
  const [nome, setNome] = useState('');
  const [assunto, setAssunto] = useState('');
  const [remetenteNome, setRemetenteNome] = useState('Mateus Celestino | Client Hunter PRO');
  const [remetenteEmail, setRemetenteEmail] = useState('contato@clienthunter-demo.io');
  
  const [templateId, setTemplateId] = useState(templates[0]?.id || '');
  const [conteudoHtml, setConteudoHtml] = useState(templates[0]?.conteudo_html || '');
  const [tagAlvo, setTagAlvo] = useState(tags[0]?.nome || '');
  
  // Visualização Responsiva: 'desktop' ou 'mobile'
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [modoEditor, setModoEditor] = useState<'preview' | 'codigo'>('preview');

  // Estado de envio
  const [enviando, setEnviando] = useState(false);
  const [emailTeste, setEmailTeste] = useState('');
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Troca de template preenche o HTML e o assunto se vazio
  const aoMudarTemplate = (tId: string) => {
    setTemplateId(tId);
    const selecionado = templates.find((t) => t.id === tId);
    if (selecionado) {
      setConteudoHtml(selecionado.conteudo_html);
      if (!assunto && selecionado.assunto_padrao) {
        setAssunto(selecionado.assunto_padrao);
      }
    }
  };

  const inserirVariavel = (tag: string) => {
    setConteudoHtml((prev) => `${prev} ${tag}`);
  };

  // Preview com substituição de variáveis para visualização realista
  const getHtmlPreview = () => {
    return conteudoHtml
      .replace(/\{\{\s*first_name\s*\}\}/g, 'Roberto')
      .replace(/\{\{\s*last_name\s*\}\}/g, 'Almeida')
      .replace(/\{\{\s*company\s*\}\}/g, 'SolarMax Engenharia')
      .replace(/\{\{\s*cargo\s*\}\}/g, 'Diretor de Operações')
      .replace(/\{\{\s*nicho\s*\}\}/g, 'Energia Solar Fotovoltaica')
      .replace(/\{\{\s*cidade\s*\}\}/g, 'Curitiba - PR')
      .replace(/\{\{\s*unsubscribe_url\s*\}\}/g, '#descadastro-amostra');
  };

  const salvarCampanha = async (dispararImediato: boolean = false) => {
    if (!nome.trim() || !assunto.trim()) {
      setFeedback({ tipo: 'erro', texto: 'Por favor preencha o Nome e o Assunto da campanha.' });
      setEtapa(1);
      return;
    }

    setEnviando(true);
    setFeedback(null);

    try {
      // 1. Criar campanha
      const res = await fetch('/api/sendportal/campanhas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          assunto,
          template_id: templateId || null,
          tag_alvo: tagAlvo || null,
          remetente_nome: remetenteNome,
          remetente_email: remetenteEmail,
          conteudo_html: conteudoHtml,
        }),
      });

      const campCriada = await res.json();
      if (!res.ok) throw new Error(campCriada.error || 'Erro ao criar campanha');

      // 2. Se optou por disparar imediatamente
      if (dispararImediato) {
        const resDisparo = await fetch(`/api/sendportal/campanhas/${campCriada.id}/disparar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teste_email: emailTeste.trim() || null }),
        });
        const dispInfo = await resDisparo.json();
        if (!resDisparo.ok) throw new Error(dispInfo.error || 'Erro no motor de disparo');
        
        setFeedback({ 
          tipo: 'sucesso', 
          texto: `Campanha criada e disparada com sucesso! ${dispInfo.total_enviados || 0} e-mails processados via SuperPool Resend.` 
        });
      } else {
        setFeedback({ tipo: 'sucesso', texto: 'Campanha salva com sucesso em modo Rascunho!' });
      }

      setTimeout(() => {
        router.push(dispararImediato ? '/mensagens' : '/campanhas');
      }, 1500);

    } catch (e: any) {
      setFeedback({ tipo: 'erro', texto: e.message || 'Falha na comunicação com o servidor' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Stepper Header */}
      <div className="p-4 rounded-xl border border-white/16 bg-gradient-to-br from-white/[0.09] to-white/[0.03] backdrop-blur-xl shadow-lg">
        <div className="grid grid-cols-4 gap-2 text-xs">
          {[
            { num: 1, rotulo: '1. Geral & Remetente' },
            { num: 2, rotulo: '2. Template & Preview' },
            { num: 3, rotulo: '3. Audiência & Segmento' },
            { num: 4, rotulo: '4. Revisão & Disparo' },
          ].map((step) => {
            const ativo = etapa === step.num;
            const concluido = etapa > step.num;

            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setEtapa(step.num)}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                  ativo
                    ? 'border-destaque bg-destaque/15 text-white font-semibold shadow-inner'
                    : concluido
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400 font-medium'
                    : 'border-borda text-apagado/70 hover:text-white'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 ${
                    ativo
                      ? 'bg-destaque text-white'
                      : concluido
                      ? 'bg-emerald-500 text-black font-bold'
                      : 'bg-zinc-800 text-apagado'
                  }`}
                >
                  {concluido ? <Check className="w-3 h-3 stroke-[3]" /> : step.num}
                </div>
                <span className="truncate">{step.rotulo}</span>
              </button>
            );
          })}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-3 ${
            feedback.tipo === 'sucesso'
              ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/30 border-rose-500/50 text-rose-300'
          }`}
        >
          {feedback.tipo === 'sucesso' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
          <span>{feedback.texto}</span>
        </div>
      )}

      {/* ETAPA 1: GERAL & REMETENTE */}
      {etapa === 1 && (
        <div className="p-6 rounded-xl border border-white/16 bg-gradient-to-br from-white/[0.09] to-white/[0.03] backdrop-blur-xl shadow-lg space-y-6">
          <div className="border-b border-borda pb-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-display">
              Informações Básicas da Campanha
            </h2>
            <p className="text-xs text-apagado mt-0.5">
              Defina o identificador interno e a linha de assunto que o lead visualizará na caixa de entrada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-apagado font-medium">Nome Interno da Campanha *</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Cold Outreach Clínicas - Lote 01"
                className="campo"
              />
              <span className="text-[10px] text-apagado/60">Usado para relatórios e tracking no SendPortal.</span>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-apagado font-medium">Linha de Assunto do E-mail *</label>
              <input
                type="text"
                value={assunto}
                onChange={(e) => setAssunto(e.target.value)}
                placeholder="Ex: Oportunidade comercial para a {{company}}"
                className="campo"
              />
              <span className="text-[10px] text-apagado/60">Suporta variáveis dinâmicas como {'{{first_name}}'} e {'{{company}}'}.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-apagado font-medium">Nome do Remetente</label>
              <input
                type="text"
                value={remetenteNome}
                onChange={(e) => setRemetenteNome(e.target.value)}
                className="campo"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-apagado font-medium">E-mail do Remetente (From)</label>
              <input
                type="email"
                value={remetenteEmail}
                onChange={(e) => setRemetenteEmail(e.target.value)}
                className="campo"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-borda">
            <button
              type="button"
              onClick={() => setEtapa(2)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg btn-primario text-white text-xs font-semibold hover:brightness-110"
            >
              <span>Avançar para Template & Preview</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 2: TEMPLATE & PREVIEW RESPONSIVO */}
      {etapa === 2 && (
        <div className="p-6 rounded-xl border border-white/16 bg-gradient-to-br from-white/[0.09] to-white/[0.03] backdrop-blur-xl shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-borda pb-4">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider font-display">
                Conteúdo & Pré-visualização Responsiva
              </h2>
              <p className="text-xs text-apagado mt-0.5">
                Alterne entre Desktop e Mobile para garantir que seu layout se adapte a qualquer dispositivo.
              </p>
            </div>

            {/* Alternador Desktop vs Mobile */}
            <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-borda">
              <button
                type="button"
                onClick={() => setViewport('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all ${
                  viewport === 'desktop'
                    ? 'bg-destaque text-white font-semibold shadow'
                    : 'text-apagado hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                Desktop (600px)
              </button>
              <button
                type="button"
                onClick={() => setViewport('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all ${
                  viewport === 'mobile'
                    ? 'bg-destaque text-white font-semibold shadow'
                    : 'text-apagado hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Mobile (375px)
              </button>
            </div>
          </div>

          {/* Template Selector & Variable Chips */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-apagado font-medium">Modelo Pré-configurado</label>
              <select
                value={templateId}
                onChange={(e) => aoMudarTemplate(e.target.value)}
                className="campo"
              >
                <option value="">Personalizado (HTML Puro)</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-apagado font-medium flex items-center justify-between">
                <span>Variáveis Dinâmicas Disponíveis (Clique para inserir)</span>
                <span className="text-[10px] text-apagado/70 font-mono">LGPD Compliant</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { tag: '{{first_name}}', rotulo: 'Nome' },
                  { tag: '{{company}}', rotulo: 'Empresa' },
                  { tag: '{{cargo}}', rotulo: 'Cargo' },
                  { tag: '{{nicho}}', rotulo: 'Nicho' },
                  { tag: '{{cidade}}', rotulo: 'Cidade' },
                  { tag: '{{unsubscribe_url}}', rotulo: 'Link Opt-out' },
                ].map((v) => (
                  <button
                    key={v.tag}
                    type="button"
                    onClick={() => inserirVariavel(v.tag)}
                    className="px-2 py-1 rounded bg-black/40 border border-borda hover:border-destaque text-[11px] font-mono text-zinc-300 hover:text-white transition"
                  >
                    + {v.tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs: Visual Preview vs HTML Editor */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-borda text-xs pb-2">
              <button
                type="button"
                onClick={() => setModoEditor('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
                  modoEditor === 'preview'
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-apagado hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Visualização Real
              </button>
              <button
                type="button"
                onClick={() => setModoEditor('codigo')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
                  modoEditor === 'codigo'
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-apagado hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                Editar Código HTML
              </button>
            </div>

            {modoEditor === 'codigo' ? (
              <textarea
                value={conteudoHtml}
                onChange={(e) => setConteudoHtml(e.target.value)}
                rows={16}
                className="w-full font-mono text-xs p-3.5 bg-black/60 border border-borda rounded-lg text-emerald-300 focus:border-destaque outline-none"
              />
            ) : (
              <div className="bg-black/60 p-6 rounded-xl border border-borda flex justify-center items-center overflow-x-auto min-h-[460px]">
                <div
                  className={`bg-white rounded-lg shadow-2xl transition-all duration-300 overflow-hidden border border-zinc-300 ${
                    viewport === 'mobile' ? 'w-[375px]' : 'w-[640px]'
                  }`}
                >
                  <div className="bg-zinc-100 border-b border-zinc-200 px-3 py-2 flex items-center justify-between text-[11px] text-zinc-600 font-mono">
                    <span className="truncate max-w-[240px]">De: {remetenteEmail}</span>
                    <span className="text-[10px] bg-zinc-200 px-1.5 py-0.5 rounded">
                      {viewport === 'mobile' ? '375px' : '640px'}
                    </span>
                  </div>
                  <iframe
                    title="Preview E-mail"
                    srcDoc={getHtmlPreview()}
                    className="w-full h-[440px] border-0"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4 border-t border-borda">
            <button
              type="button"
              onClick={() => setEtapa(1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-borda text-apagado hover:text-white text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            <button
              type="button"
              onClick={() => setEtapa(3)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg btn-primario text-white text-xs font-semibold hover:brightness-110"
            >
              <span>Avançar para Audiência</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 3: AUDIÊNCIA & SEGMENTO */}
      {etapa === 3 && (
        <div className="p-6 rounded-xl border border-white/16 bg-gradient-to-br from-white/[0.09] to-white/[0.03] backdrop-blur-xl shadow-lg space-y-6">
          <div className="border-b border-borda pb-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-display">
              Segmentação & Audiência do SendPortal
            </h2>
            <p className="text-xs text-apagado mt-0.5">
              Escolha quais tags e nichos receberão este disparo. O sistema filtra automaticamente quem realizou opt-out.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-borda bg-black/30 space-y-2 cursor-pointer hover:border-destaque transition"
                 onClick={() => setTagAlvo('')}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-white">Todos os Contatos Ativos</span>
                <input
                  type="radio"
                  name="tagSelect"
                  checked={tagAlvo === ''}
                  onChange={() => setTagAlvo('')}
                />
              </div>
              <p className="text-[11px] text-apagado">
                Dispara para toda a base de inscritos que possuem e-mail válido e status ativo.
              </p>
            </div>

            {tags.map((t) => (
              <div
                key={t.id}
                onClick={() => setTagAlvo(t.nome)}
                className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
                  tagAlvo === t.nome
                    ? 'border-destaque bg-destaque/10 text-white'
                    : 'border-borda bg-black/30 hover:border-borda-forte text-apagado'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.cor || 'var(--accent-primary, #FA4200)' }} />
                    <span className="font-semibold text-xs text-white">{t.nome}</span>
                  </div>
                  <input
                    type="radio"
                    name="tagSelect"
                    checked={tagAlvo === t.nome}
                    onChange={() => setTagAlvo(t.nome)}
                  />
                </div>
                <p className="text-[11px] text-apagado">
                  {t.total_inscritos ?? 0} {t.total_inscritos === 1 ? 'destinatário vinculado' : 'destinatários vinculados'}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-borda">
            <button
              type="button"
              onClick={() => setEtapa(2)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-borda text-apagado hover:text-white text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            <button
              type="button"
              onClick={() => setEtapa(4)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg btn-primario text-white text-xs font-semibold hover:brightness-110"
            >
              <span>Avançar para Revisão & Disparo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 4: REVISÃO & DISPARO */}
      {etapa === 4 && (
        <div className="p-6 rounded-xl border border-white/16 bg-gradient-to-br from-white/[0.09] to-white/[0.03] backdrop-blur-xl shadow-lg space-y-6">
          <div className="border-b border-borda pb-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-display">
              Revisão Executiva & Lançamento
            </h2>
            <p className="text-xs text-apagado mt-0.5">
              Confira os parâmetros da campanha antes do disparo final através do SuperPool Resend.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-borda bg-black/30 space-y-3">
              <h3 className="font-semibold uppercase tracking-wider text-[11px] text-destaque">
                Configurações da Mensagem
              </h3>
              <div className="space-y-1.5 text-apagado">
                <div><strong className="text-white">Nome:</strong> {nome || 'Sem nome'}</div>
                <div><strong className="text-white">Assunto:</strong> {assunto || 'Sem assunto'}</div>
                <div><strong className="text-white">Remetente:</strong> {remetenteNome} &lt;{remetenteEmail}&gt;</div>
                <div><strong className="text-white">Template:</strong> {templateId || 'Personalizado'}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-borda bg-black/30 space-y-3">
              <h3 className="font-semibold uppercase tracking-wider text-[11px] text-destaque">
                Audiência & Roteamento ESP
              </h3>
              <div className="space-y-1.5 text-apagado">
                <div><strong className="text-white">Segmento Selecionado:</strong> {tagAlvo || 'Todos os contatos'}</div>
                <div><strong className="text-white">Tracking Ativo:</strong> Pixel 1x1 + Redirect 302 + Opt-out LGPD</div>
                <div><strong className="text-white">ESP Dispatcher:</strong> SuperPool Resend (8 contas rotativas)</div>
                <div><strong className="text-white">Gateway:</strong> Local + VPS Fallback com SLA 100%</div>
              </div>
            </div>
          </div>

          {/* Test Email Box */}
          <div className="p-4 rounded-xl border border-white/16 bg-white/[0.05] backdrop-blur-md space-y-2">
            <label className="text-xs text-white font-semibold flex items-center gap-2">
              <Mail className="w-4 h-4 text-destaque" />
              Enviar Amostra de Teste Antes (Opcional)
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={emailTeste}
                onChange={(e) => setEmailTeste(e.target.value)}
                placeholder="seu-email@dominio.com para testar na caixa de entrada"
                className="campo flex-1 text-xs"
              />
            </div>
            <p className="text-[10px] text-apagado/70">
              Se preenchido, apenas 1 e-mail de prova com tokens mockados será enviado antes da escala em massa.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-borda">
            <button
              type="button"
              onClick={() => setEtapa(3)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-borda text-apagado hover:text-white text-xs w-full sm:w-auto justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                disabled={enviando}
                onClick={() => salvarCampanha(false)}
                className="px-4 py-2.5 rounded-lg border border-borda hover:border-destaque text-white text-xs font-semibold disabled:opacity-50 w-full sm:w-auto"
              >
                Salvar como Rascunho
              </button>

              <button
                type="button"
                disabled={enviando}
                onClick={() => salvarCampanha(true)}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg btn-primario text-white text-xs font-semibold hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 w-full sm:w-auto"
              >
                <Send className="w-4 h-4" />
                <span>{enviando ? 'Disparando via SuperPool...' : '🚀 Salvar e Disparar Campanha'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
