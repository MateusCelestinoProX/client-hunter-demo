'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Titulo } from '@/components/ui';
import { SuperPoolBadge } from '@/components/SuperPoolBadge';
import { ModalNovoScraper } from '@/components/ModalNovoScraper';
import { ModalGoogleMapsScraper } from '@/components/ModalGoogleMapsScraper';
import { Zap, MapPin } from 'lucide-react';

interface PainelLeadsHeaderProps {
  superpoolStats: any;
}

export function PainelLeadsHeader({ superpoolStats }: PainelLeadsHeaderProps) {
  const [modalGeralAberto, setModalGeralAberto] = useState(false);
  const [modalMapsAberto, setModalMapsAberto] = useState(false);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <Titulo sub="Empresas captadas e qualificadas pela inteligência multicanal do Client Hunter. A nota diz em qual encostar primeiro.">
          Leads de prospecção
        </Titulo>

        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <SuperPoolBadge stats={superpoolStats} />

          {/* Botão Dedicado: Google Maps Web Scraper (Página Dedicada) */}
          <Link
            href="/maps-scraper"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer border border-white/25 active:scale-[0.98]"
            style={{
              background: 'var(--accent-gradient)',
              boxShadow: '0 4px 18px rgba(var(--accent-rgb, 250, 66, 0), 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
            }}
          >
            <MapPin className="w-3.5 h-3.5 fill-white" />
            <span>Google Maps Scraper</span>
          </Link>

          {/* Botão Geral: Novo Scraper Multicanal */}
          <button
            type="button"
            onClick={() => setModalGeralAberto(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-white text-xs font-bold hover:brightness-110 active:scale-[0.98] transition-all border border-white/20 cursor-pointer"
            style={{
              background: 'var(--accent-gradient)',
              boxShadow: '0 4px 18px rgba(var(--accent-rgb, 250, 66, 0), 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.30)',
            }}
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>+ Novo Scraper (Multicanal)</span>
          </button>
        </div>
      </div>

      <ModalNovoScraper
        aberto={modalGeralAberto}
        aoFechar={() => setModalGeralAberto(false)}
      />

      <ModalGoogleMapsScraper
        aberto={modalMapsAberto}
        aoFechar={() => setModalMapsAberto(false)}
      />
    </>
  );
}
