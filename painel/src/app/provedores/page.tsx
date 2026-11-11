import { obterLiveResources } from '@/lib/superpool';
import { RecursosUsageView } from '@/components/RecursosUsageView';

export const dynamic = 'force-dynamic';

export default async function ProvedoresPage() {
  const dados = await obterLiveResources();
  return <RecursosUsageView dadosIniciais={dados} />;
}
