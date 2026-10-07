import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import ClientModals from '@/components/ClientModals';
import SplashScreen from '@/components/SplashScreen';

export const metadata: Metadata = {
  title: 'MilkIQ - Akıllı Süt, Rasyon & Maliyet Asistanı',
  description: 'Süt sığırcılığı işletmeleri için rasyon hazırlama, kaba yem yeterlilik kontrolü, süt potansiyeli ve anlık 1 litre süt maliyeti hesaplama sistemi.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MilkIQ',
  },
};

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full">
      <body className="h-full flex flex-col font-sans bg-slate-50 text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">
        <SplashScreen />
        <ClientModals />
        <Navbar />
        <main className="flex-1 pb-24 md:pb-12">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
