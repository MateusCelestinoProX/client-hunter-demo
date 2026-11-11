export function Titulo({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-7">
      <div className="w-12 h-1 bg-gradient-to-r from-destaque to-destaque-hover rounded-full mb-4 shadow-sm shadow-destaque/50" />
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase font-display drop-shadow-sm">
        {children}
      </h1>
      {sub && <p className="text-white/60 text-xs sm:text-sm mt-1.5 font-light leading-relaxed">{sub}</p>}
    </div>
  );
}

/** `larga` tira o teto de largura, para uma tela que precise de mais colunas. */
export function Pagina({ children, larga }: { children: React.ReactNode; larga?: boolean }) {
  return (
    <div className={`p-3.5 sm:p-6 lg:p-9 pb-40 md:pb-9 ${larga ? '' : 'max-w-[1600px]'} mx-auto relative z-10`}>
      {children}
      {/* Espaçador defensivo mobile para evitar sobreposição do botão central flutuante SCRAPER */}
      <div className="h-24 md:hidden pointer-events-none" />
    </div>
  );
}

export function Metrica({
  rotulo, valor, nota, destaque,
}: { rotulo: string; valor: string | number; nota?: string; destaque?: boolean }) {
  return (
    <div 
      className="p-5 rounded-2xl relative overflow-hidden group hover:scale-[1.01] transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.10) 0%, rgba(14, 18, 28, 0.35) 100%)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.30)',
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <p className="text-[11px] font-bold uppercase tracking-wider text-white/60 mb-2">{rotulo}</p>
      <p className={`text-3xl font-bold font-mono tracking-tight leading-none ${destaque ? 'text-destaque drop-shadow-[0_2px_12px_rgba(var(--accent-rgb),0.35)]' : 'text-white'}`}>
        {valor}
      </p>
      {nota && <p className="text-xs text-white/50 mt-2 font-light">{nota}</p>}
    </div>
  );
}

export function Vazio({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-white/50 font-light py-10 text-center">{children}</p>;
}

export function Campo({ rotulo, valor }: { rotulo: string; valor: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">{rotulo}</p>
      <p className="text-sm text-white">{valor ?? '—'}</p>
    </div>
  );
}
