'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Calculator, 
  Wheat, 
  Receipt, 
  TrendingUp,
  Settings
} from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/tanitim') return null;

  const mobileNav = [
    { href: '/', label: 'Ana Sayfa', icon: Home },
    { href: '/rasyon', label: 'Rasyon', icon: Calculator },
    { href: '/yemler', label: 'Yemler', icon: Wheat },
    { href: '/giderler', label: 'Giderler', icon: Receipt },
    { href: '/maliyet', label: 'Maliyet', icon: TrendingUp },
    { href: '/ayarlar', label: 'Ayarlar', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-safe">
      <div className="flex items-center justify-around h-16 px-1">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-700 font-bold'
                  : 'text-slate-500 hover:text-slate-900 active:scale-95'
              }`}
            >
              <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-emerald-100 text-emerald-700' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold text-emerald-800' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
