import Link from 'next/link';
import {
  listarProspeccao, nichosProspeccao, resumir, nomeNicho, situacaoSite, classeInfo, logoDoSite, nomeOportunidade,
  canalInfo, CANAIS, CLASSES, SITUACOES_SITE, OPORTUNIDADES, type FiltroProspeccao,
} from '@/lib/prospeccao';
import { telefone as fmtTel, num } from '@/lib/fmt';
import { Pagina, Titulo, Metrica, Vazio } from '@/components/ui';
import { FiltroLeads } from '@/components/FiltroLeads';
import { SeloClasse } from '@/components/SeloClasse';
import { LogoEmpresa } from '@/components/LogoEmpresa';
import { SuperPoolBadge } from '@/components/SuperPoolBadge';
import { PainelLeadsHeader } from '@/components/PainelLeadsHeader';
import { TabelaLeadsComAcoes } from '@/components/TabelaLeadsComAcoes';
import { obterSuperPoolStats } from '@/lib/superpool';
import { Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Prospeccao({ searchParams }: { searchParams: Promise<FiltroProspeccao> }) {
  const filtro = await searchParams;
  const [leads, nichos, superpoolStats] = await Promise.all([
    listarProspeccao(filtro),
    nichosProspeccao(),
    obterSuperPoolStats(),
  ]);
  const r = resumir(leads);

  return (
    <Pagina>
      <PainelLeadsHeader superpoolStats={superpoolStats} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <Metrica rotulo="Na lista" valor={num(r.total)} nota="com os filtros de agora" />
        <Metrica rotulo="Classe A" valor={num(r.classeA)} nota="nota 75 ou mais" destaque />
        <Metrica rotulo="Com celular" valor={num(r.comCelular)} nota="dá para chamar no WhatsApp" />
        <Metrica rotulo="Com Instagram" valor={num(r.comInstagram)} nota="dá para ver o perfil antes de chamar" />
      </div>

      <FiltroLeads
        rota="/"
        placeholder="Empresa, cidade, decisor ou celular"
        filtro={filtro}
        grupos={[
          { chave: 'nicho', rotulo: 'Nicho', opcoes: nichos.map((n: any) => ({ id: n.nicho, rotulo: `${nomeNicho(n.nicho)} · ${n.total}` })) },
          { chave: 'canal', rotulo: 'Canal', opcoes: CANAIS.map((c) => ({ id: c.id, rotulo: c.rotulo })) },
          { chave: 'classe', rotulo: 'Classe', opcoes: CLASSES.map((c) => ({ id: c.id, rotulo: c.rotulo })) },
          { chave: 'site', rotulo: 'Site', opcoes: SITUACOES_SITE.map((s) => ({ id: s.id, rotulo: s.rotulo })) },
          { chave: 'oportunidade', rotulo: 'Oportunidade', opcoes: OPORTUNIDADES.map((o) => ({ id: o.id, rotulo: o.rotulo })) },
          { chave: 'lista', rotulo: 'Lista', rotuloTodos: 'Só os aptos', opcoes: [{ id: 'todos', rotulo: 'Incluir fora do nicho e reprovados' }] },
        ]}
      />

      {leads.length === 0 ? (
        <div className="cartao mt-5">
          <Vazio>Nenhum lead de prospecção com esse filtro.</Vazio>
        </div>
      ) : (
        <div className="mt-5">
          <TabelaLeadsComAcoes leads={leads} />
        </div>
      )}

      <p className="text-xs text-apagado/70 mt-4 font-light">
        {leads.length} {leads.length === 1 ? 'lead' : 'leads'}, da nota maior para a menor
        {leads.length === 500 ? ' (mostrando os 500 primeiros)' : ''}. Quem grava aqui é o prospectar.mjs;
        este painel só lê.
      </p>
    </Pagina>
  );
}
