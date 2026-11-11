'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Template, Tag } from '@/lib/sendportal-types';

export default function FormNovaCampanha({ templates, tags }: { templates: Template[]; tags: Tag[] }) {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [assunto, setAssunto] = useState('');
  const [templateId, setTemplateId] = useState(templates[0]?.id || '');
  const [tagAlvo, setTagAlvo] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !assunto) return;

    setCarregando(true);
    setMensagem(null);

    try {
      const res = await fetch('/api/sendportal/campanhas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          assunto,
          template_id: templateId || null,
          tag_alvo: tagAlvo || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao criar campanha');
      }

      setMensagem({ tipo: 'ok', texto: 'Campanha criada com sucesso!' });
      setNome('');
      setAssunto('');
      router.refresh();
    } catch (err: any) {
      setMensagem({ tipo: 'erro', texto: err.message });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mensagem && (
        <div className={`p-3 rounded-lg text-xs ${mensagem.tipo === 'ok' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
          {mensagem.texto}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-apagado mb-1 uppercase">Nome da Campanha</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Prospecção Solar Q4"
          required
          className="w-full bg-fundo border border-borda rounded-lg px-3 py-2 text-sm text-texto focus:outline-none focus:border-destaque"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-apagado mb-1 uppercase">Assunto do E-mail</label>
        <input
          type="text"
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
          placeholder="Ex: Oportunidade para a {{company}}"
          required
          className="w-full bg-fundo border border-borda rounded-lg px-3 py-2 text-sm text-texto focus:outline-none focus:border-destaque"
        />
        <span className="text-[11px] text-apagado mt-0.5 block">Suporta <code>{"{{first_name}}"}</code>, <code>{"{{company}}"}</code></span>
      </div>

      <div>
        <label className="block text-xs font-semibold text-apagado mb-1 uppercase">Modelo / Template</label>
        <select
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          className="w-full bg-fundo border border-borda rounded-lg px-3 py-2 text-sm text-texto focus:outline-none focus:border-destaque"
        >
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-apagado mb-1 uppercase">Público / Tag Alvo</label>
        <select
          value={tagAlvo}
          onChange={(e) => setTagAlvo(e.target.value)}
          className="w-full bg-fundo border border-borda rounded-lg px-3 py-2 text-sm text-texto focus:outline-none focus:border-destaque"
        >
          <option value="">Todos os Inscritos Ativos</option>
          {tags.map((tg) => (
            <option key={tg.id} value={tg.id}>
              {tg.nome} ({tg.total_inscritos || 0} contatos)
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={carregando}
        className="w-full bg-destaque hover:bg-destaque/90 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {carregando ? 'Criando Campanha...' : 'Criar Campanha'}
      </button>
    </form>
  );
}
