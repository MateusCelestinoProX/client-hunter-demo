import { NextResponse } from 'next/server';
import path from 'node:path';

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const urlObj = new URL(req.url);
  const targetUrl = urlObj.searchParams.get('url') || 'https://google.com';

  try {
    const { token } = await params;
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || null;
    const userAgent = req.headers.get('user-agent') || null;

    const corePath = path.join(process.cwd(), '..', 'lib', 'sendportal', 'index.mjs');
    const { registrarClique } = await import(/* webpackIgnore: true */ corePath);

    registrarClique(token, targetUrl, { ip, userAgent });
  } catch (err) {
    // Segue o redirect normalmente em caso de erro no tracking
  }

  return NextResponse.redirect(targetUrl, 302);
}
