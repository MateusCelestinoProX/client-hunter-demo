import { DocumentacaoView } from '../DocumentacaoView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Protocolo para Agentes de IA & MCP · Client Hunter PRO',
  description: 'Especificação técnica, catálogo de 24 ferramentas MCP, endpoints REST e JSON Schemas para agentes autônomos.',
};

export default function DocumentacaoIaPage() {
  return <DocumentacaoView modoInicial="ia" />;
}
