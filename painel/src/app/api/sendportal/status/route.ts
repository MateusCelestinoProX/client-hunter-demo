import { NextResponse } from 'next/server';
import { obterMetricasGeraisPainel } from '@/lib/sendportal';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const metricas = obterMetricasGeraisPainel();
    return NextResponse.json({
      status: 'online',
      result: {
        status: 'online',
        counts: {
          total_subscribers: metricas.total_inscritos,
          total_campaigns: metricas.total_campanhas,
          total_messages: metricas.total_enviados,
        },
        metrics: metricas,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', error: err.message }, { status: 500 });
  }
}
