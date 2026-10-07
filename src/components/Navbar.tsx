'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home,
  Calculator, 
  Wheat, 
  Building2,
  Receipt, 
  Milk, 
  TrendingUp, 
  Settings, 
  LogOut,
  HelpCircle
} from 'lucide-react';
import { useState } from 'react';
import PageHelpModal from './PageHelpModal';

export default function Navbar() {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Don't show nav on login page
  if (pathname === '/login') return null;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  const navItems = [
    { href: '/', label: 'Ana Sayfa', icon: Home },
    { href: '/rasyon', label: 'Rasyon Stüdyosu', icon: Calculator },
    { href: '/yemler', label: 'Yemler', icon: Wheat },
    { href: '/giderler', label: 'Genel Giderler', icon: Receipt },
    { href: '/uretim', label: 'Süt Üretimi', icon: Milk },
    { href: '/maliyet', label: 'Maliyet & Kâr', icon: TrendingUp },
    { href: '/ayarlar', label: 'Ayarlar', icon: Settings },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 flex items-center justify-center group-hover:scale-105 transition-transform drop-shadow-sm shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon-192.png" alt="MilkIQ Logo" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-xl font-black text-slate-900 tracking-tight">Milk</span>
                <span className="text-xl font-black text-emerald-600 tracking-tight">IQ</span>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:block">
                Akıllı Süt & Rasyon Sistemi
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions / Help & Logout */}
          <div className="flex items-center space-x-2">
            {/* Sayfa Bazlı Kullanım Kılavuzu & Yardım Butonu */}
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              title="Bu Sayfa Nasıl Kullanılır? (Sayfa Rehberi & Yardım)"
              className="w-9 h-9 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-900 border border-emerald-300/80 flex items-center justify-center transition-all shadow-xs active:scale-95"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title="Çıkış Yap"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>

    {/* Sayfa Bazlı Kullanım Kılavuzu Modal Penceresi */}
    <PageHelpModal
      isOpen={showHelpModal}
      onClose={() => setShowHelpModal(false)}
      currentPath={pathname}
    />
  </>
  );
}
