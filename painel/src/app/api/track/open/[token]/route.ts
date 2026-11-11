import { NextResponse } from 'next/server';
import path from 'node:path';

// 1x1 GIF transparente em base64
const PIXEL_GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || null;
    const userAgent = req.headers.get('user-agent') || null;

    const corePath = path.join(process.cwd(), '..', 'lib', 'sendportal', 'index.mjs');
    const { registrarAbertura } = await import(/* webpackIgnore: true */ corePath);

    registrarAbertura(token, { ip, userAgent });
  } catch (err) {
    // silencioso para não quebrar a exibição do e-mail no cliente
  }

  return new NextResponse(PIXEL_GIF, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': String(PIXEL_GIF.length),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
