import { DocumentacaoView } from './DocumentacaoView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Documentação & Manual Oficial · Client Hunter PRO',
  description: 'Manual completo de operação, catálogo de recursos e arquitetura visual Liquid Glass com WebGL Shaders.',
};

export default function DocumentacaoPage() {
  return <DocumentacaoView />;
}
