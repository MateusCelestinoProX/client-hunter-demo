import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { McpOsBackgroundProvider } from '@/components/McpOsBackgroundProvider';
import { MobileNavigation } from '@/components/MobileNavigation';
import { DesktopTopBar } from '@/components/DesktopTopBar';
import { CommandPaletteModal } from '@/components/CommandPaletteModal';
import { DemoIntroOverlay } from '@/components/DemoIntroOverlay';
import { Target } from 'lucide-react';
import { SuperPoolBadge } from '@/components/SuperPoolBadge';

const display = { variable: 'font-display' };
const body = { variable: 'font-body' };

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#080a0f',
};

export const metadata: Metadata = {
  title: 'Client Hunter · Maps Scraper & Cold Outreach Suite',
  description: 'Plataforma unificada de extração do Google Maps, qualificação multicanal e disparo de cold email marketing com SendPortal e SuperPool.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Client Hunter PRO',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable}`}>
      <body className="text-texto min-h-screen md:h-screen md:overflow-hidden antialiased flex flex-col md:flex-row selection:bg-destaque/30 selection:text-white relative bg-transparent">
        {/* MCP OS WebGL Shaders & Dynamic Wallpapers Engine */}
        <McpOsBackgroundProvider />

        {/* Global Demo Intro Baseline Screen & Cinema Transition */}
        <DemoIntroOverlay />

        {/* Global Command Palette HUD (Cmd+K) */}
        <CommandPaletteModal />

        {/* Mobile Header Ultralight (Apple Glassmorphism Claro) */}
        <header 
          className="md:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-40 demo-cascade-top"
          style={{
            background: 'rgba(14, 18, 28, 0.45)',
            backdropFilter: 'blur(30px) saturate(190%)',
            WebkitBackdropFilter: 'blur(30px) saturate(190%)',
            borderColor: 'rgba(255, 255, 255, 0.16)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25), inset 0 -1px 0 rgba(255, 255, 255, 0.15)',
          }}
        >
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-destaque to-destaque-hover flex items-center justify-center text-white shadow-md shadow-destaque/25 border border-white/20">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5 font-display">
                Client Hunter <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-destaque/20 text-destaque border border-destaque/30">PRO</span>
              </span>
              <span className="text-[10px] text-white/50 block font-mono">B2B Outreach Suite</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              DEMO OK
            </span>
          </div>
        </header>

        {/* Desktop Enterprise Sidebar (Apple Liquid Glass) - Fixa e Imutável */}
        <div className="hidden md:flex shrink-0 h-screen sticky top-0 z-30 demo-cascade-sidebar">
          <Sidebar />
        </div>

        {/* Main Workspace Area (Floating Glass Content) - Rolagem Independente */}
        <div className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-y-auto overflow-x-hidden relative z-20">
          {/* Desktop Glass HUD / Breadcrumbs Bar */}
          <div className="demo-cascade-top">
            <DesktopTopBar />
          </div>

          {/* pb-24 no mobile garante que o conteúdo nunca fique escondido pela bottom bar */}
          <main className="flex-1 pb-24 md:pb-16 demo-cascade-main">
            {children}
          </main>
        </div>

        {/* Mobile Touch-First Bottom Navigation Bar & Drawer */}
        <MobileNavigation />
      </body>
    </html>
  );
}
