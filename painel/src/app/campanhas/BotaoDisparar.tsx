'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BotaoDisparar({ campanhaId, status }: { campanhaId: string; status: string }) {
  const router = useRouter();
  const [disparando, setDisparando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [emailTeste, setEmailTeste] = useState('');
  const [modo, setModo] = useState<'real' | 'teste'>('teste');
  const [msgResultado, setMsgResultado] = useState<string | null>(null);

  const executarDisparo = async () => {
    setDisparando(true);
    setMsgResultado(null);

    try {
      const res = await fetch(`/api/sendportal/campanhas/${campanhaId}/disparar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teste_email: modo === 'teste' ? emailTeste : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao processar disparo');

      if (modo === 'teste') {
        setMsgResultado(`✓ E-mail de teste enviado com sucesso para ${emailTeste}!`);
      } else {
        setMsgResultado(`🎉 Disparo em massa concluído! ${data.totalEnviados || 0} enviados.`);
        setTimeout(() => {
          setModalAberto(false);
          router.refresh();
        }, 1500);
      }
    } catch (err: any) {
      setMsgResultado(`✗ Erro: ${err.message}`);
    } finally {
      setDisparando(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setModalAberto(true);
          setMsgResultado(null);
        }}
        disabled={disparando || status === 'enviando'}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer disabled:opacity-50"
      >
        {status === 'concluida' ? 'Reenviar / Testar' : 'Disparar'}
      </button>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="cartao border border-white/20 p-6 rounded-2xl max-w-md w-full shadow-2xl backdrop-blur-2xl">
            <h3 className="text-lg font-bold mb-2">Disparar Campanha</h3>
            <p className="text-xs text-apagado mb-4 font-mono">ID: {campanhaId}</p>

            {msgResultado && (
              <div className={`p-3 rounded-lg text-xs mb-4 ${msgResultado.startsWith('✓') || msgResultado.startsWith('🎉') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                {msgResultado}
              </div>
            )}

            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setModo('teste')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${modo === 'teste' ? 'bg-blue-600 text-white border-blue-500' : 'bg-fundo text-apagado border-borda'}`}
              >
                Envio de Teste
              </button>
              <button
                type="button"
                onClick={() => setModo('real')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${modo === 'real' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-fundo text-apagado border-borda'}`}
              >
                Disparo em Massa
              </button>
            </div>

            {modo === 'teste' ? (
              <div className="mb-4">
                <label className="block text-xs text-apagado mb-1">E-mail para receber o teste:</label>
                <input
                  type="email"
                  value={emailTeste}
                  onChange={(e) => setEmailTeste(e.target.value)}
                  placeholder="seu-email@dominio.com"
                  className="w-full bg-fundo border border-borda rounded-lg px-3 py-2 text-sm text-texto focus:outline-none focus:border-destaque"
                />
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-destaque/10 border border-destaque/20 text-destaque text-xs mb-4">
                ⚠️ O disparo em massa enviará e-mails com rotação pelo SuperPool Resend para todos os contatos ativos desta campanha.
              </div>
            )}

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="px-4 py-2 rounded-lg text-xs text-apagado hover:text-texto transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executarDisparo}
                disabled={disparando || (modo === 'teste' && !emailTeste)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {disparando ? 'Enviando...' : (modo === 'teste' ? 'Enviar Teste' : 'Iniciar Disparo')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
