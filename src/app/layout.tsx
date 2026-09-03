import type { Metadata } from 'next';
import { Syne, JetBrains_Mono, Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import ClientStoreInitializer from '@/components/ClientStoreInitializer';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['700', '800'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AD // SOYAD // ŞƏHƏR — Neo-Industrial Multiplayer Deck',
  description:
    'Tactile hardware instrument for real-time word category synthesis. Swiss typography, Bloomberg-tier telemetry, and split-flap reel letter selection.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="az" className={`dark ${syne.variable} ${jetbrainsMono.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-[#090A0C] text-[#E1E4EA] font-sans antialiased selection:bg-[#FF4800] selection:text-black relative overflow-x-hidden">
        {/* Physical Tangible Micro-Noise Layer */}
        <div
          className="pointer-events-none fixed inset-0 z-50 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Global Hairline Crosshair Reference Grid */}
        <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        <div className="relative z-10 flex min-h-screen flex-col">
          <ClientStoreInitializer />
          <Navbar />
          <main className="flex-1">{children}</main>
          
          <footer className="border-t border-white/[0.06] bg-[#07080A] py-4 px-6 text-[10px] font-mono tracking-tracked text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="inline-block h-1.5 w-1.5 bg-[#D4FF00] shadow-[0_0_6px_#D4FF00]" />
              <span>SYS_REV: 4.1.0 // ENGINE: UPSTASH_REST</span>
            </div>
            <span>SPEC: TEENAGE_ENGINEERING × SWISS_SYSTEM</span>
            <span>© {new Date().getFullYear()} AD_SOYAD // AUTONOMOUS_DECK</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
