import { NextRequest, NextResponse } from 'next/server';
import { obterLiveResources } from '@/lib/superpool';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === '1' || searchParams.get('refresh') === 'true';

    const data = await obterLiveResources(forceRefresh);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Erro interno ao consultar telemetria' },
      { status: 500 }
    );
  }
}
