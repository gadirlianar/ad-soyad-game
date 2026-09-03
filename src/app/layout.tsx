import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import ClientStoreInitializer from '@/components/ClientStoreInitializer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ad, Soyad, Şəhər - Real-Time Multiplayer Word Game',
  description:
    'Klassik "Ad, Soyad, Şəhər, Ölkə, Heyvan, Meyvə, Əşya" oyunu indi canlı multiplayer formatında! Dostlarınla oyna, STOP bas və qalib ol.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="az" className="dark">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-100 flex flex-col`}>
        <ClientStoreInitializer />
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Ad, Soyad... Real-time Multiplayer Word Category Game.</p>
        </footer>
      </body>
    </html>
  );
}
