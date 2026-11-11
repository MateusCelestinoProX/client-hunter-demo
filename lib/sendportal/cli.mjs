import {
  listarTemplates,
  salvarTemplate,
  listarTags,
  listarInscritos,
  sincronizarLeadsParaInscritos,
  listarCampanhas,
  obterCampanha,
  criarCampanha,
  dispararCampanha
} from './index.mjs';

export async function comandoSendPortal(o) {
  const subacao = o._[1] || 'campanhas';

  switch (subacao) {
    case 'sync': {
      console.log('\n📥 [SendPortal] Sincronizando leads captados para a base de contatos...');
      const res = sincronizarLeadsParaInscritos({
        nicho: o.nicho || null,
        classe: o.classe ? String(o.classe).toUpperCase() : null,
        canal: o.canal || null,
      });
      console.log(`\n✓ Concluído!`);
      console.log(`  Leads analisados: ${res.totalLeadsAnalisados}`);
      console.log(`  Contatos sincronizados: ${res.totalContatosProcessados}`);
      console.log(`  Novos contatos adicionados: ${res.novosContatos}\n`);
      break;
    }

    case 'inscritos': {
      const lista = listarInscritos({
        tag: o.tag || null,
        status: o.status || null,
        limite: o.limite ? parseInt(o.limite, 10) : 20,
      });
      console.log(`\n📋 [SendPortal] ${lista.length} inscritos cadastrados:\n`);
      console.log('  STATUS     E-MAIL                                    NOME / EMPRESA              TAGS');
      console.log('  ────────────────────────────────────────────────────────────────────────────────────────');
      for (const i of lista) {
        const status = (i.status === 'ativo' ? '🟢 ativo   ' : '🔴 ' + i.status).padEnd(10);
        const email = i.email.slice(0, 40).padEnd(41);
        const ident = `${i.primeiro_nome || ''} (${i.empresa || '—'})`.slice(0, 26).padEnd(27);
        const tags = (i.tags_nomes || '—').slice(0, 30);
        console.log(`  ${status} ${email} ${ident} ${tags}`);
      }
      console.log();
      break;
    }

    case 'templates': {
      const templates = listarTemplates();
      console.log(`\n📑 [SendPortal] ${templates.length} templates disponíveis:\n`);
      for (const t of templates) {
        console.log(`  • [${t.id}] ${t.nome}`);
        console.log(`    Assunto padrão: ${t.assunto_padrao || '(sem assunto padrão)'}`);
        console.log(`    Criado em: ${t.created_at}\n`);
      }
      break;
    }

    case 'campanhas': {
      const campanhas = listarCampanhas();
      console.log(`\n✉️ [SendPortal] ${campanhas.length} campanhas de e-mail cadastradas:\n`);
      console.log('  ID             STATUS      ENVIADOS  ABERTURAS  CLIQUES  NOME / ASSUNTO');
      console.log('  ────────────────────────────────────────────────────────────────────────────────────────');
      for (const c of campanhas) {
        const id = c.id.padEnd(14);
        const st = c.status.padEnd(11);
        const env = String(c.total_enviados || 0).padStart(8);
        const ab = String(c.total_aberturas || 0).padStart(9);
        const cl = String(c.total_cliques || 0).padStart(7);
        console.log(`  ${id} ${st} ${env}  ${ab}  ${cl}   ${c.nome} ("${c.assunto}")`);
      }
      console.log();
      break;
    }

    case 'criar': {
      if (!o.nome || !o.assunto) {
        throw new Error('Uso: node prospectar.mjs sendportal criar --nome "Nome da Campanha" --assunto "Assunto do Email" [--template <id>] [--tag <tag>]');
      }
      const camp = criarCampanha({
        nome: o.nome,
        assunto: o.assunto,
        template_id: o.template || 'tpl_cold_outreach_b2b',
        tag_alvo: o.tag || null,
        remetente_nome: o.remetente || 'LeadPulse Outreach',
        remetente_email: o.email || 'prospeccao@resend.dev',
      });
      console.log(`\n✓ Campanha criada com sucesso! ID: ${camp.id}`);
      console.log(`  Nome: "${camp.nome}"`);
      console.log(`  Assunto: "${camp.assunto}"`);
      console.log(`  Template: ${camp.template_nome || camp.template_id}\n`);
      break;
    }

    case 'disparar': {
      const campId = o.campanha || o._[2];
      if (!campId) {
        throw new Error('Uso: node prospectar.mjs sendportal disparar --campanha <id> [--teste <email>]');
      }
      await dispararCampanha(campId, {
        testeEmail: o.teste || null,
        urlBase: o.url || 'http://localhost:3333',
      });
      break;
    }

    default:
      console.log(`\nSubcomandos do SendPortal:`);
      console.log(`  sync        Sincroniza leads qualificados para a base de contatos com tags`);
      console.log(`  inscritos   Lista contatos/assinantes`);
      console.log(`  templates   Lista modelos de e-mail`);
      console.log(`  campanhas   Lista campanhas existentes e métricas`);
      console.log(`  criar       Cria uma nova campanha (--nome, --assunto, --template, --tag)`);
      console.log(`  disparar    Dispara uma campanha via SuperPool Resend (--campanha, --teste)\n`);
      break;
  }
}
