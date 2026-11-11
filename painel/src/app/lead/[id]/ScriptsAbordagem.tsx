'use client';

import { useState } from 'react';
import { MessageCircle, Mail, Users, Copy, Check, ExternalLink, Sparkles, Send, ShieldCheck, Flame, ChevronRight, Clock, Award, Share2 } from 'lucide-react';
import { nativeCopy, nativeVibrate, nativeShare } from '@/lib/native';
import { whatsappNum } from '@/lib/fmt';

interface ScriptsAbordagemProps {
  ganchoWhatsApp?: string;
  ganchoEmail?: string;
  ganchoEmailPasso1?: string;
  ganchoEmailPasso2?: string;
  ganchoEmailPasso3?: string;
  ganchoLinkedin?: string;
  melhorCanal?: string;
  celular?: string | null;
  email?: string | null;
  linkedinUrl?: string | null;
  nomeDecisor?: string | null;
}

export function ScriptsAbordagem({
  ganchoWhatsApp,
  ganchoEmail,
  ganchoEmailPasso1,
  ganchoEmailPasso2,
  ganchoEmailPasso3,
  ganchoLinkedin,
  melhorCanal,
  celular,
  email,
  linkedinUrl,
  nomeDecisor,
}: ScriptsAbordagemProps) {
  // Define a aba inicial com base no melhor canal recomendado
  const canalInicial = melhorCanal?.toLowerCase().includes('whatsapp')
    ? 'whatsapp'
    : melhorCanal?.toLowerCase().includes('email')
    ? 'email'
    : melhorCanal?.toLowerCase().includes('linkedin')
    ? 'linkedin'
    : 'email';

  const [abaAtiva, setAbaAtiva] = useState<'email' | 'whatsapp' | 'linkedin'>(canalInicial);
  const [passoEmail, setPassoEmail] = useState<1 | 2 | 3>(1);
  const [copiado, setCopiado] = useState(false);
  const [copiadoTudo, setCopiadoTudo] = useState(false);

  async function handleCopiar(texto: string) {
    await nativeCopy(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  // Textos dos passos
  const p1 = ganchoEmailPasso1 || ganchoEmail || 'Script de abordagem inicial não disponível.';
  const p2 = ganchoEmailPasso2 || `Oi ${nomeDecisor ? nomeDecisor.split(' ')[0] : ''},\n\nSó complementando: na semana passada estruturamos isso para outra operação do setor e eles geraram 3x mais contatos no primeiro mês.\n\nAinda faz sentido te enviar aquele resumo de 90 segundos que preparei?\n\nCelestino PRO`;
  const p3 = ganchoEmailPasso3 || `Oi ${nomeDecisor ? nomeDecisor.split(' ')[0] : ''},\n\nImagino que sua rotina esteja super corrida ou que a captação de clientes não seja o foco da empresa agora.\n\nVou fechar seu arquivo por aqui para não te incomodar mais. Se as coisas mudarem por aí no futuro, só me avisar por aqui.\n\nSucesso na operação!\nCelestino PRO`;

  const scriptAtual =
    abaAtiva === 'whatsapp'
      ? ganchoWhatsApp || ''
      : abaAtiva === 'linkedin'
      ? ganchoLinkedin || ''
      : passoEmail === 1
      ? p1
      : passoEmail === 2
      ? p2
      : p3;

  const contagemPalavras = scriptAtual.trim() ? scriptAtual.trim().split(/\s+/).length : 0;
  const contagemCaracteres = scriptAtual.length;

  const cleanPhone = whatsappNum(celular);
  const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(scriptAtual)}` : null;

  function handleCompartilhar() {
    const titulo = `Script de Abordagem - ${nomeDecisor || 'Decisor'}`;
    nativeShare(titulo, scriptAtual, waLink || undefined);
  }

  const assuntoEmail = passoEmail === 1 ? 'uma dúvida rápida' : 'Re: uma dúvida rápida';

  async function handleCopiarCadenciaCompleta() {
    const cadenciaCompleta = `=== CADÊNCIA COLD EMAIL 2026/2027 (ALEX HORMOZI & 10M TESTED) ===
Destinatário: ${email || 'lead'} | Decisor: ${nomeDecisor || 'Diretoria'}

--- TOQUE 1: A LANÇA / CAVALO DE TROIA (DIA 1) ---
Assunto: uma dúvida rápida
${p1}

--- TOQUE 2: O BUMP COM PROVA SOCIAL (DIA 3 OU 4 - MESMA THREAD) ---
Assunto: Re: uma dúvida rápida
${p2}

--- TOQUE 3: O BREAKUP ELEGANTE / FECHAMENTO DE ARQUIVO (DIA 7 A 9) ---
Assunto: Re: uma dúvida rápida
${p3}
`;
    await handleCopiar(cadenciaCompleta);
    setCopiadoTudo(true);
    setTimeout(() => setCopiadoTudo(false), 2000);
  }

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-b from-black/60 to-black/40 overflow-hidden mt-5 shadow-2xl">
      {/* Barra de Seleção de Canais */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-black/60 border border-white/10 text-xs font-medium">
          <button
            onClick={() => setAbaAtiva('email')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              abaAtiva === 'email'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-inner'
                : 'text-apagado hover:text-white'
            }`}
          >
            <Mail size={14} className="text-cyan-400" />
            <span>Cold E-mail (2026)</span>
            <span className="text-[10px] px-1 rounded bg-cyan-500/30 text-cyan-200 font-mono">3 Toques</span>
          </button>

          <button
            onClick={() => setAbaAtiva('whatsapp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              abaAtiva === 'whatsapp'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-semibold shadow-inner'
                : 'text-apagado hover:text-white'
            }`}
          >
            <MessageCircle size={14} className="text-emerald-400" />
            <span>WhatsApp</span>
            {melhorCanal?.toLowerCase().includes('whatsapp') && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            )}
          </button>

          <button
            onClick={() => setAbaAtiva('linkedin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              abaAtiva === 'linkedin'
                ? 'bg-[#0A66C2]/20 text-[#0A66C2] border border-[#0A66C2]/40 font-semibold shadow-inner'
                : 'text-apagado hover:text-white'
            }`}
          >
            <Users size={14} className="text-[#0A66C2]" />
            <span>LinkedIn</span>
            {melhorCanal?.toLowerCase().includes('linkedin') && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#0A66C2] animate-pulse ml-0.5" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {melhorCanal && (
            <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-medium px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              <Sparkles size={12} className="text-cyan-400 animate-pulse" />
              <span>Canal Sugerido: <strong>{melhorCanal}</strong></span>
            </div>
          )}
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-destaque/90 font-mono px-2 py-0.5 rounded bg-destaque/10 border border-destaque/20">
            <Award size={12} />
            <span>Playbook NotebookLM</span>
          </div>
        </div>
      </div>

      {/* Sub-Navegação de Passos da Cadência de Cold E-mail */}
      {abaAtiva === 'email' && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-black/40 border-b border-white/5 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-apagado text-[11px] uppercase tracking-wider font-semibold">Cadência:</span>
            
            <button
              onClick={() => setPassoEmail(1)}
              className={`px-2.5 py-1 rounded border text-xs transition-all flex items-center gap-1.5 ${
                passoEmail === 1
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                  : 'bg-white/5 text-apagado border-white/10 hover:text-white'
              }`}
            >
              <span>1. A Lança / Troia</span>
              <span className="text-[10px] opacity-70">(Dia 1)</span>
            </button>

            <ChevronRight size={12} className="text-white/20" />

            <button
              onClick={() => setPassoEmail(2)}
              className={`px-2.5 py-1 rounded border text-xs transition-all flex items-center gap-1.5 ${
                passoEmail === 2
                  ? 'bg-destaque/20 text-destaque border-destaque/50 font-bold'
                  : 'bg-white/5 text-apagado border-white/10 hover:text-white'
              }`}
            >
              <span>2. O Bump</span>
              <span className="text-[10px] opacity-70">(Dia 3)</span>
            </button>

            <ChevronRight size={12} className="text-white/20" />

            <button
              onClick={() => setPassoEmail(3)}
              className={`px-2.5 py-1 rounded border text-xs transition-all flex items-center gap-1.5 ${
                passoEmail === 3
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold'
                  : 'bg-white/5 text-apagado border-white/10 hover:text-white'
              }`}
            >
              <span>3. Breakup</span>
              <span className="text-[10px] opacity-70">(Dia 7)</span>
            </button>
          </div>

          {/* Badges de Otimização e Deliverability */}
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <ShieldCheck size={12} />
              Zero Links · Plain Text
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${
              contagemPalavras <= 75 ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}>
              <Flame size={12} />
              {contagemPalavras} palavras {contagemPalavras <= 75 ? '(Faixa Ouro)' : '(Reduzir)'}
            </span>
          </div>
        </div>
      )}

      {/* Conteúdo do Script */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-apagado flex items-center gap-1.5">
              <span>Script Personalizado</span>
              {nomeDecisor && <span className="text-white">para {nomeDecisor}</span>}
              {abaAtiva === 'email' && (
                <span className="text-cyan-400 font-mono text-[11px]">
                  · Assunto: &ldquo;{assuntoEmail}&rdquo;
                </span>
              )}
            </p>
            <p className="text-[11px] text-apagado/70 font-light mt-0.5">
              {abaAtiva === 'email' && passoEmail === 1 && 'Oferta Cavalo de Troia (Alex Hormozi) · Nível 3º ano · Foco exclusivo em permissão'}
              {abaAtiva === 'email' && passoEmail === 2 && 'Follow-up na mesma thread · Prova social tangível sem cobrança passiva'}
              {abaAtiva === 'email' && passoEmail === 3 && 'E-mail de fechamento de arquivo · Ativa gatilho de aversão à perda (gera 30% das respostas)'}
              {abaAtiva === 'whatsapp' && 'Abordagem conversacional para WhatsApp comercial · Objetivo e sem textão'}
              {abaAtiva === 'linkedin' && `Nota de conexão (${contagemCaracteres}/300 caracteres) · Respeita o limite do LinkedIn`}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/15 font-mono text-xs text-gray-200 leading-relaxed whitespace-pre-wrap select-all shadow-inner">
          {scriptAtual || 'Nenhum script gerado para este canal.'}
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mt-4 pt-3 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleCopiar(scriptAtual)}
              disabled={!scriptAtual}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all active:scale-95"
            >
              {copiado && !copiadoTudo ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copiado && !copiadoTudo ? 'Copiado!' : 'Copiar Passo'}</span>
            </button>

            <button
              onClick={handleCompartilhar}
              disabled={!scriptAtual}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-white/90 border border-white/15 transition-all active:scale-95"
              title="Compartilhar via Android Share Sheet"
            >
              <Share2 size={14} className="text-destaque" />
              <span>Compartilhar</span>
            </button>

            {abaAtiva === 'email' && (
              <button
                onClick={handleCopiarCadenciaCompleta}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition-all active:scale-95"
              >
                {copiadoTudo ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>Copiar Todos os 3 Passos</span>
              </button>
            )}

            {abaAtiva === 'whatsapp' && waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md active:scale-95"
              >
                <Send size={14} />
                <span>Abrir no WhatsApp</span>
              </a>
            )}

            {abaAtiva === 'email' && email && (
              <a
                href={`mailto:${email}?subject=${encodeURIComponent(assuntoEmail)}&body=${encodeURIComponent(scriptAtual)}`}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md active:scale-95"
              >
                <Mail size={14} />
                <span>Disparar via E-mail</span>
              </a>
            )}

            {abaAtiva === 'linkedin' && linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white transition-all shadow-md active:scale-95"
              >
                <ExternalLink size={14} />
                <span>Abrir Perfil no LinkedIn</span>
              </a>
            )}
          </div>

          <div className="text-[11px] text-apagado font-mono flex items-center gap-1">
            <Clock size={12} className="text-apagado/70" />
            <span>Tempo estimado de leitura: ~15 segundos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
