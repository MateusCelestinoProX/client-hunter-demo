import { listarProspeccao } from '@/lib/prospeccao';
import { obterSuperPoolStats } from '@/lib/superpool';
import { GoogleMapsScraperView } from './GoogleMapsScraperView';

export const dynamic = 'force-dynamic';

export default async function MapsScraperPage() {
  const [leadsMaps, superpoolStats] = await Promise.all([
    listarProspeccao({ canal: 'maps' }).catch(() => []),
    obterSuperPoolStats().catch(() => null),
  ]);

  return (
    <GoogleMapsScraperView
      leadsIniciais={leadsMaps || []}
      superpoolStats={superpoolStats}
    />
  );
}
