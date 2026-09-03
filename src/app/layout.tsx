import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import ClientStoreInitializer from '@/components/ClientStoreInitializer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ad, Soyad — Multiplayer Word Game',
  description:
    'A minimalist, real-time multiplayer word game crafted with Apple Human Interface Guidelines. Clean, serene, and functional.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="az" className={`dark ${inter.variable}`}>
      <body className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] text-neutral-900 dark:text-neutral-100 font-sans antialiased selection:bg-[#007AFF]/20 selection:text-[#007AFF] relative flex flex-col">
        <ClientStoreInitializer />
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        
        <footer className="py-6 text-center text-xs text-neutral-500 dark:text-neutral-500 border-t border-black/[0.04] dark:border-white/[0.04]">
          <p className="font-normal tracking-normal">
            Ad, Soyad, Şəhər · Crafted with Cupertino-tier Human Interface Design
          </p>
        </footer>
      </body>
    </html>
  );
}
