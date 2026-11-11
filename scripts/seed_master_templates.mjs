import { salvarTemplate } from '../lib/sendportal/templates.mjs';

const templates = [
  {
    id: 'tpl_hormozi_trojan_horse',
    nome: 'O Cavalo de Troia · Alex Hormozi (Vídeo de 90s & Zero Links)',
    assunto_padrao: '{{company}}',
    conteudo_texto: `Oi {{first_name}},

Reparei que a {{company}} ainda não tem uma estrutura ativa para reter clientes que buscam por {{nicho}} em {{cidade}}.

Gravei um vídeo rápido de 90 segundos mostrando exatamente 3 vazamentos comerciais onde vocês estão perdendo contratos para concorrentes locais.

Faz sentido te mandar o link aqui?

Se não for prioridade agora, sem problemas.

Celestino PRO`,
    conteudo_html: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; color: #111; line-height: 1.6; max-width: 580px;">
  <p>Oi {{first_name}},</p>
  <p>Reparei que a {{company}} ainda não tem uma estrutura ativa para reter clientes que buscam por {{nicho}} em {{cidade}}.</p>
  <p>Gravei um vídeo rápido de 90 segundos mostrando exatamente 3 vazamentos comerciais onde vocês estão perdendo contratos para concorrentes locais.</p>
  <p>Faz sentido te mandar o link aqui?</p>
  <p style="color: #666;">Se não for prioridade agora, sem problemas.<br><br>Celestino PRO</p>
  <p style="margin-top: 30px; font-size: 11px; color: #999;"><a href="{{unsubscribe_url}}" style="color: #999;">descadastrar</a></p>
</div>`
  },
  {
    id: 'tpl_spear_10m_tested',
    nome: 'A Lança de Precisão · 10M Testados (45 Palavras & Dor Técnica)',
    assunto_padrao: 'uma dúvida rápida',
    conteudo_texto: `Oi {{first_name}},

Vi que o site da {{company}} tem ótima reputação em {{cidade}}, mas reparei que vocês ainda não possuem um canal direto de captura via WhatsApp e anúncios integrados.

Recentemente estruturamos isso para uma operação de {{nicho}} e eles geraram 3x mais contatos no primeiro mês.

Vale a pena te mandar uma prévia de 2 minutos mostrando como funcionaria para a {{company}}?

Abraço,
Celestino PRO`,
    conteudo_html: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; color: #111; line-height: 1.6; max-width: 580px;">
  <p>Oi {{first_name}},</p>
  <p>Vi que o site da {{company}} tem ótima reputação em {{cidade}}, mas reparei que vocês ainda não possuem um canal direto de captura via WhatsApp e anúncios integrados.</p>
  <p>Recentemente estruturamos isso para uma operação de {{nicho}} e eles geraram 3x mais contatos no primeiro mês.</p>
  <p>Vale a pena te mandar uma prévia de 2 minutos mostrando como funcionaria para a {{company}}?</p>
  <p>Abraço,<br>Celestino PRO</p>
  <p style="margin-top: 30px; font-size: 11px; color: #999;"><a href="{{unsubscribe_url}}" style="color: #999;">descadastrar</a></p>
</div>`
  },
  {
    id: 'tpl_competitor_angle',
    nome: 'O Ângulo do Concorrente · Curiosidade & Posicionamento Local',
    assunto_padrao: 'concorrente de vocês',
    conteudo_texto: `Oi {{first_name}},

Acompanhando o mercado de {{nicho}} em {{cidade}}, vi que algumas empresas da região começaram a rodar estratégias agressivas para capturar clientes antes mesmo de chegarem até a {{company}}.

Mapeamos exatamente o que eles estão fazendo e como vocês podem se posicionar na frente gastando menos.

Posso te mandar um comparativo rápido de 1 página?

Celestino PRO`,
    conteudo_html: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; color: #111; line-height: 1.6; max-width: 580px;">
  <p>Oi {{first_name}},</p>
  <p>Acompanhando o mercado de {{nicho}} em {{cidade}}, vi que algumas empresas da região começaram a rodar estratégias agressivas para capturar clientes antes mesmo de chegarem até a {{company}}.</p>
  <p>Mapeamos exatamente o que eles estão fazendo e como vocês podem se posicionar na frente gastando menos.</p>
  <p>Posso te mandar um comparativo rápido de 1 página?</p>
  <p>Celestino PRO</p>
  <p style="margin-top: 30px; font-size: 11px; color: #999;"><a href="{{unsubscribe_url}}" style="color: #999;">descadastrar</a></p>
</div>`
  },
  {
    id: 'tpl_followup_bump_proof',
    nome: 'Follow-up Passo 2 · O Bump de Prova Social (+3 a 4 Dias)',
    assunto_padrao: 'Re: {{company}}',
    conteudo_texto: `Oi {{first_name}},

Só complementando: na semana passada finalizamos essa implementação para outra empresa de {{nicho}} e eles fecharam 12 novos contratos logo nos primeiros dias.

Ainda faz sentido te enviar aquele resumo de 90 segundos que preparei para a {{company}}?

Celestino PRO`,
    conteudo_html: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; color: #111; line-height: 1.6; max-width: 580px;">
  <p>Oi {{first_name}},</p>
  <p>Só complementando: na semana passada finalizamos essa implementação para outra empresa de {{nicho}} e eles fecharam 12 novos contratos logo nos primeiros dias.</p>
  <p>Ainda faz sentido te enviar aquele resumo de 90 segundos que preparei para a {{company}}?</p>
  <p>Celestino PRO</p>
  <p style="margin-top: 30px; font-size: 11px; color: #999;"><a href="{{unsubscribe_url}}" style="color: #999;">descadastrar</a></p>
</div>`
  },
  {
    id: 'tpl_breakup_permission',
    nome: 'Follow-up Passo 3 · O Breakup Elegante (Fechamento de Arquivo)',
    assunto_padrao: 'Re: {{company}}',
    conteudo_texto: `Oi {{first_name}},

Imagino que sua rotina esteja super corrida ou que a captação de clientes não seja o foco da {{company}} agora.

Vou fechar seu arquivo por aqui para não te incomodar mais. Se as coisas mudarem no futuro, só me avisar por aqui.

Muito sucesso na operação!

Celestino PRO`,
    conteudo_html: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; color: #111; line-height: 1.6; max-width: 580px;">
  <p>Oi {{first_name}},</p>
  <p>Imagino que sua rotina esteja super corrida ou que a captação de clientes não seja o foco da {{company}} agora.</p>
  <p>Vou fechar seu arquivo por aqui para não te incomodar mais. Se as coisas mudarem no futuro, só me avisar por aqui.</p>
  <p>Muito sucesso na operação!<br><br>Celestino PRO</p>
  <p style="margin-top: 30px; font-size: 11px; color: #999;"><a href="{{unsubscribe_url}}" style="color: #999;">descadastrar</a></p>
</div>`
  }
];

for (const t of templates) {
  salvarTemplate(t);
  console.log('[Template Seeded]:', t.id, '-', t.nome);
}

console.log('Todos os templates do Playbook NotebookLM foram inseridos com sucesso!');
