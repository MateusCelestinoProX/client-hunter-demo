import Link from 'next/link';
import { listarTemplatesPainel, listarTagsPainel } from '@/lib/sendportal';
import { WizardNovaCampanha } from '@/components/WizardNovaCampanha';
import { ArrowLeft, Send } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NovaCampanhaPage() {
  const [templates, tags] = await Promise.all([
    listarTemplatesPainel(),
    listarTagsPainel(),
  ]);

  return (
    <div className="p-6 lg:p-9 max-w-[1600px] mx-auto space-y-7">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/campanhas"
              className="text-xs text-apagado hover:text-white flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar para Campanhas
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase font-display flex items-center gap-2.5">
            <Send className="w-6 h-6 text-destaque" />
            Nova Campanha SendPortal
          </h1>
          <p className="text-xs text-apagado mt-1">
            Criação guiada em 4 etapas com pré-visualização responsiva (Desktop vs Mobile), segmentação e disparo via SuperPool Resend.
          </p>
        </div>
      </div>

      {/* Wizard */}
      <WizardNovaCampanha templates={templates} tags={tags} />
    </div>
  );
}
