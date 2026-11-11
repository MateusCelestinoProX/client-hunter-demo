import { NextResponse } from 'next/server';
import path from 'node:path';

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  let emailDesinscrito = 'seu e-mail';
  try {
    const { token } = await params;
    const corePath = path.join(process.cwd(), '..', 'lib', 'sendportal', 'index.mjs');
    const { processarOptOut } = await import(/* webpackIgnore: true */ corePath);

    const sub = processarOptOut(token);
    if (sub && sub.email) {
      emailDesinscrito = sub.email;
    }
  } catch (err) {
    //
  }

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Descadastro Confirmado - Client Hunter</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0f19; color: #f3f4f6; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .card { background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 32px; max-width: 440px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .icon { font-size: 40px; margin-bottom: 16px; }
    h1 { font-size: 20px; margin: 0 0 12px; color: #fff; }
    p { font-size: 14px; color: #9ca3af; line-height: 1.5; margin: 0 0 20px; }
    .email-box { background: #1f2937; padding: 8px 12px; border-radius: 6px; font-family: monospace; font-size: 13px; color: #60a5fa; display: inline-block; margin-bottom: 20px; }
    .footer { font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✅</div>
    <h1>Descadastro Confirmado</h1>
    <p>O endereço abaixo foi removido com sucesso de todas as nossas listas de disparo:</p>
    <div class="email-box">${emailDesinscrito}</div>
    <p>Você não receberá mais comunicações ou ofertas desta campanha.</p>
    <div class="footer">Client Hunter · Conformidade LGPD & Anti-Spam</div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
