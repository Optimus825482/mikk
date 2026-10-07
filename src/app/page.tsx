'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Calculator, 
  Wheat, 
  Receipt, 
  Milk, 
  TrendingUp, 
  ChevronRight, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight,
  ShieldCheck,
  Plus,
  ExternalLink
} from 'lucide-react';
import { Feed, MonthlyExpense, DailyProduction, SystemSetting } from '@/types';
import { calculateRation, DEFAULT_SETTINGS } from '@/lib/calculator';
import AboutModal from '@/components/AboutModal';

export default function DashboardPage() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [ration, setRation] = useState<any>(null);
  const [expenses, setExpenses] = useState<MonthlyExpense[]>([]);
  const [productions, setProductions] = useState<DailyProduction[]>([]);
  const [settings, setSettings] = useState<SystemSetting>(DEFAULT_SETTINGS);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      try {
        const [fRes, rRes, eRes, pRes, sRes] = await Promise.all([
          fetch('/api/feeds'),
          fetch('/api/ration'),
          fetch(`/api/expenses?month=${currentMonth}`),
          fetch('/api/production'),
          fetch('/api/settings'),
        ]);

        const [fData, rData, eData, pData, sData] = await Promise.all([
          fRes.json(),
          rRes.json(),
          eRes.json(),
          pRes.json(),
          sRes.json(),
        ]);

        setFeeds(fData || []);
        setRation(rData || null);
        setExpenses(eData || []);
        setProductions(pData || []);
        if (sData) setSettings(sData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [currentMonth]);

  // Days in month
  const daysInMonth = useMemo(() => {
    const [year, month] = currentMonth.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  }, [currentMonth]);

  // Calculations
  const rationCalc = useMemo(() => {
    if (!ration || !ration.items) {
      return calculateRation([], feeds, 600, 25, settings);
    }
    const items = ration.items.map((i: any) => ({
      feedId: i.feedId,
      freshAmount: i.freshAmount || 0,
    }));
    return calculateRation(items, feeds, ration.liveWeight || 600, ration.targetMilk || 25, settings);
  }, [ration, feeds, settings]);

  const feedCostPerLiter = rationCalc.feedCostPerLiter;

  // Latest milk production
  const latestProd = productions[productions.length - 1];
  const dailyTotalMilk = latestProd ? latestProd.totalMilk : (ration?.targetMilk || 25) * 20;

  // Monthly Expenses
  const totalMonthlyExpense = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [expenses]);

  const dailyOverheadExpense = daysInMonth > 0 ? totalMonthlyExpense / daysInMonth : 0;
  const overheadCostPerLiter = dailyTotalMilk > 0 ? dailyOverheadExpense / dailyTotalMilk : 0;

  const totalCostPerLiter = feedCostPerLiter + overheadCostPerLiter;
  const milkSalePrice = settings.milkSalePrice || 16.5;
  const netProfitPerLiter = milkSalePrice - totalCostPerLiter;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-semibold">MilkIQ Hazırlanıyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Süt Çiftliği Karar Destek Sistemi</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Süt, Rasyon & Maliyet Sistemi
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base mt-2">
            Rasyon dengesini koruyun, asidozu önleyin ve 1 litre sütünüzün gerçek maliyetini anlık olarak kontrol altında tutun.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              href="/rasyon"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-md active:scale-95 flex items-center space-x-1.5"
            >
              <Calculator className="w-4 h-4" />
              <span>Rasyon Hazırla</span>
            </Link>
            <Link
              href="/maliyet"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-all border border-white/20 flex items-center space-x-1.5"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Maliyet Analizi</span>
            </Link>
            <Link
              href="/ayarlar?tab=kilavuz"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-all border border-white/20 flex items-center space-x-1.5"
            >
              <span>Kullanım Kılavuzu</span>
            </Link>
            <button
              type="button"
              onClick={() => setShowAboutModal(true)}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-all border border-white/20 flex items-center space-x-1.5 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Hakkında</span>
            </button>
          </div>
        </div>

        {/* Decorative SVG Cow Silhouette in background */}
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none w-72 h-72">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* 2. GÖRSELDEKİ KISIM: HIZLI ERİŞİM KARTLARI (QUICK ACTIONS GRID) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Link
          href="/rasyon"
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all group flex flex-col items-center text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Calculator className="w-6 h-6" />
          </div>
          <strong className="text-slate-900 font-black text-sm tracking-tight">Rasyon Hazırla</strong>
          <span className="text-[11px] text-slate-500 mt-0.5">Yem & Denge Hesapla</span>
        </Link>

        <Link
          href="/yemler"
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all group flex flex-col items-center text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Wheat className="w-6 h-6" />
          </div>
          <strong className="text-slate-900 font-black text-sm tracking-tight">Yem Yönetimi</strong>
          <span className="text-[11px] text-slate-500 mt-0.5">{feeds.length} Kayıtlı Yem</span>
        </Link>

        <Link
          href="/giderler"
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all group flex flex-col items-center text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Receipt className="w-6 h-6" />
          </div>
          <strong className="text-slate-900 font-black text-sm tracking-tight">Genel Giderler</strong>
          <span className="text-[11px] text-slate-500 mt-0.5">Elektrik, Mazot vb.</span>
        </Link>

        <Link
          href="/uretim"
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all group flex flex-col items-center text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Milk className="w-6 h-6" />
          </div>
          <strong className="text-slate-900 font-black text-sm tracking-tight">Süt Üretimi</strong>
          <span className="text-[11px] text-slate-500 mt-0.5">Günlük Sağılan Süt</span>
        </Link>
      </div>

      {/* ACTIVE RATION LIVE STATUS SUMMARY */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Aktif Sürü Rasyonu
            </span>
            <h2 className="text-lg font-black text-slate-900 mt-1 tracking-tight">
              {ration?.title || 'Standart Laktasyon Rasyonu'}
            </h2>
          </div>

          <Link
            href="/rasyon"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
          >
            <span>Rasyonu Düzenle</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-400 block font-semibold">Canlı Ağırlık</span>
            <strong className="text-lg font-black text-slate-900">{ration?.liveWeight || 600} kg</strong>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-400 block font-semibold">Hedef Süt</span>
            <strong className="text-lg font-black text-slate-900">{ration?.targetMilk || 25} L / gün</strong>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-400 block font-semibold">Kuru Madde</span>
            <strong className="text-lg font-black text-slate-900">{rationCalc.totalDryMatterKg} kg</strong>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-400 block font-semibold">Potansiyel Süt</span>
            <strong className="text-lg font-black text-blue-600">{rationCalc.potentialMilkLiters} L</strong>
          </div>
        </div>

        {/* Roughage Status Banner */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold ${
          rationCalc.roughageStatus === 'CRITICAL_ACIDOSIS'
            ? 'bg-rose-50 border-rose-300 text-rose-900'
            : rationCalc.roughageStatus === 'WARNING_LOW'
            ? 'bg-amber-50 border-amber-300 text-amber-900'
            : 'bg-emerald-50 border-emerald-300 text-emerald-900'
        }`}>
          <div className="flex items-center space-x-2">
            {rationCalc.roughageStatus === 'CRITICAL_ACIDOSIS' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{rationCalc.roughageStatusMessage}</span>
          </div>
          <span className="hidden sm:inline">Kaba Yem: %{rationCalc.roughagePercentage}</span>
        </div>
      </div>

      {/* COST ANALYSIS HIGHLIGHT BANNER (NAVIGATE TO MALIYET PAGE) */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 sm:p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Aylık Maliyet, Genel Gider & Kârlılık Raporu
              </h2>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-md border border-emerald-500/30">
                AYLIK ARŞİV
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              1L Süt Yem Maliyeti, Genel Gider Payı, Toplam Maliyet ve Net Kâr Marjı analizlerini <strong>Maliyet</strong> sayfasından aylık bazda inceleyebilir ve arşivleyebilirsiniz.
            </p>
          </div>
        </div>

        <Link
          href="/maliyet"
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95 flex items-center space-x-1.5 self-start sm:self-auto shrink-0"
        >
          <span>Maliyet Sayfasına Git</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* DEDICATION & ABOUT FOOTER BANNER */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">
              MilkIQ, Veteriner Hekim{' '}
              <a
                href="https://erkanerdem.online"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:text-emerald-800 underline underline-offset-2 font-black transition-colors"
              >
                Erkan Erdem
              </a>{' '}
              tarafından Fatih Dinç için geliştirilmiştir.
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Hayvan besleme, sürü yönetimi ve hayvancılık işletme ekonomisi alanlarındaki saha tecrübesinin modern yazılım teknolojisiyle sentezinden doğmuştur.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/tanitim"
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <span>Tanıtım & PDF Katalog →</span>
          </Link>
          <Link
            href="/ayarlar?tab=kilavuz"
            className="px-3.5 py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-bold text-xs rounded-xl transition-all border border-slate-200 hover:border-emerald-300"
          >
            Kullanım Kılavuzu
          </Link>
          <Link
            href="/ayarlar?tab=sozluk"
            className="px-3.5 py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-bold text-xs rounded-xl transition-all border border-slate-200 hover:border-emerald-300"
          >
            Terimler Sözlüğü
          </Link>
          <button
            type="button"
            onClick={() => setShowAboutModal(true)}
            className="px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs rounded-xl transition-all border border-emerald-300"
          >
            Hakkında & Vizyon
          </button>
        </div>
      </div>

      {/* COPYRIGHT & DEVELOPER FOOTER */}
      <footer className="pt-4 pb-12 sm:pb-6 border-t border-slate-200/80 text-center space-y-1">
        <p className="text-xs font-semibold text-slate-500 tracking-wide">
          © {new Date().getFullYear()} <span className="font-bold text-slate-800">MilkIQ</span>. Tüm hakları saklıdır.
        </p>
        <p className="text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1.5">
          <span>Developed by</span>
          <a
            href="https://erkanerdem.online"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/90 transition-all px-2 py-0.5 rounded-md border border-emerald-200/70 shadow-2xs inline-flex items-center gap-1 group"
          >
            <span>Erkan Erdem</span>
            <ExternalLink className="w-3 h-3 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </p>
      </footer>

      {/* MilkIQ HAKKINDA MODAL PENCERESİ */}
      <AboutModal
        forceOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />
    </div>
  );
}
