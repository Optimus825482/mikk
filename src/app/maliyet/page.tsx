'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Milk, 
  Wheat, 
  Receipt, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Calendar,
  Save,
  Printer,
  History,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  Feed, 
  MonthlyExpense, 
  DailyProduction, 
  SystemSetting, 
  MonthlyCostReport,
  ExpenseCategory 
} from '@/types';
import { calculateRation, DEFAULT_SETTINGS } from '@/lib/calculator';
import ConfirmModal, { ConfirmVariant } from '@/components/ConfirmModal';

const CATEGORY_NAMES: Record<ExpenseCategory, string> = {
  ELEKTRIK: 'Elektrik',
  SU: 'Su',
  VETERINER_ILAC: 'Hayvan Sağlığı & Veteriner',
  ISCILIK: 'İşçilik & Personel',
  MAZOT_TRAKTOR: 'Mazot & Makine/Traktör',
  TOHUMLAMA: 'Suni Tohumlama & Islah',
  BAKIM_ONARIM: 'Bakım, Onarım & Tesisat',
  DIGER: 'Diğer Genel Giderler',
};

export default function CostAnalysisPage() {
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [activeTab, setActiveTab] = useState<'analiz' | 'arsiv'>('analiz');

  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [ration, setRation] = useState<any>(null);
  const [expenses, setExpenses] = useState<MonthlyExpense[]>([]);
  const [productions, setProductions] = useState<DailyProduction[]>([]);
  const [costReports, setCostReports] = useState<MonthlyCostReport[]>([]);
  const [settings, setSettings] = useState<SystemSetting>(DEFAULT_SETTINGS);
  const [milkSalePrice, setMilkSalePrice] = useState<number>(16.5);
  const [reportNotes, setReportNotes] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(true);
  const [savingReport, setSavingReport] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string>('');

  // Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    variant?: ConfirmVariant;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Seçilen aya ait verileri ve genel verileri yükle
  const loadData = useCallback(async (monthToLoad: string) => {
    try {
      setLoading(true);
      const [feedsRes, rationRes, expRes, prodRes, setRes, reportsRes] = await Promise.all([
        fetch('/api/feeds'),
        fetch('/api/ration'),
        fetch(`/api/expenses?month=${monthToLoad}`),
        fetch('/api/production'),
        fetch('/api/settings'),
        fetch('/api/cost-reports'),
      ]);

      const [fData, rData, eData, pData, sData, repData] = await Promise.all([
        feedsRes.json(),
        rationRes.json(),
        expRes.json(),
        prodRes.json(),
        setRes.json(),
        reportsRes.json(),
      ]);

      setFeeds(fData || []);
      setRation(rData || null);
      setExpenses(eData || []);
      setProductions(pData || []);
      setCostReports(Array.isArray(repData) ? repData : []);
      if (sData) {
        setSettings(sData);
        if (sData.milkSalePrice) setMilkSalePrice(sData.milkSalePrice);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(selectedMonth);
  }, [selectedMonth, loadData]);

  // Ay Geçişleri (< Önceki Ay / Sonraki Ay >)
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    setSelectedMonth(date.toISOString().slice(0, 7));
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    setSelectedMonth(date.toISOString().slice(0, 7));
  };

  const handleCurrentMonth = () => {
    setSelectedMonth(currentMonthStr);
  };

  // Seçilen aydaki gün sayısı
  const daysInMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  }, [selectedMonth]);

  // Formatlı ay başlığı (örn: "Ekim 2026")
  const formattedMonthTitle = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
  }, [selectedMonth]);

  // 1. Rasyon Yem Maliyetleri (Aktif Rasyon üzerinden)
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
  const dailyFeedCostPerCow = rationCalc.dailyFeedCostPerCow;

  // 2. Seçilen Ayın Süt Üretimi
  const monthProductions = useMemo(() => {
    return productions.filter(p => p.date && p.date.startsWith(selectedMonth));
  }, [productions, selectedMonth]);

  const { monthTotalMilk, dailyAverageMilk, averageMilkingCows } = useMemo(() => {
    if (monthProductions.length > 0) {
      const total = monthProductions.reduce((sum, p) => sum + (p.totalMilk || 0), 0);
      const avgDaily = total / monthProductions.length;
      const totalCows = monthProductions.reduce((sum, p) => sum + (p.milkingCows || 0), 0);
      const avgCows = Math.round(totalCows / monthProductions.length);
      return {
        monthTotalMilk: Math.round(total),
        dailyAverageMilk: Number(avgDaily.toFixed(1)),
        averageMilkingCows: avgCows > 0 ? avgCows : 20,
      };
    }

    // Eğer o ay henüz üretim girilmemişse aktif rasyon hedefiyle hesapla (tahmini 20 sağmal)
    const cows = 20;
    const dailyTarget = (ration?.targetMilk || 25) * cows;
    return {
      monthTotalMilk: Math.round(dailyTarget * daysInMonth),
      dailyAverageMilk: Number(dailyTarget.toFixed(1)),
      averageMilkingCows: cows,
    };
  }, [monthProductions, ration, daysInMonth]);

  // 3. Seçilen Ayın Genel Giderleri
  const totalMonthlyExpense = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [expenses]);

  // Gider Dağılımı (Kategori bazında)
  const expenseBreakdown = useMemo(() => {
    const map = new Map<ExpenseCategory, number>();
    expenses.forEach(e => {
      const cur = map.get(e.category) || 0;
      map.set(e.category, cur + (e.amount || 0));
    });

    const list: {
      category: ExpenseCategory;
      categoryLabel: string;
      amount: number;
      percentage: number;
    }[] = [];

    map.forEach((amount, cat) => {
      const percentage = totalMonthlyExpense > 0 ? (amount / totalMonthlyExpense) * 100 : 0;
      list.push({
        category: cat,
        categoryLabel: CATEGORY_NAMES[cat] || cat,
        amount: Number(amount.toFixed(2)),
        percentage: Number(percentage.toFixed(1)),
      });
    });

    return list.sort((a, b) => b.amount - a.amount);
  }, [expenses, totalMonthlyExpense]);

  // 4. Litre Başına 4 Temel Metrik
  const overheadCostPerLiter = monthTotalMilk > 0 
    ? totalMonthlyExpense / monthTotalMilk 
    : 0;

  const totalCostPerLiter = feedCostPerLiter + overheadCostPerLiter;
  const netProfitPerLiter = milkSalePrice - totalCostPerLiter;

  // 5. Aylık Toplam Bütçe ve Kârlılık Rakamları
  const totalMonthlyFeedCost = feedCostPerLiter * monthTotalMilk;
  const totalMonthlyOperatingCost = totalMonthlyFeedCost + totalMonthlyExpense;
  const totalMonthlyRevenue = milkSalePrice * monthTotalMilk;
  const totalMonthlyNetProfit = totalMonthlyRevenue - totalMonthlyOperatingCost;

  // Maliyet Yüzdesi (Yem vs Genel Gider)
  const feedCostPercent = totalCostPerLiter > 0 ? (feedCostPerLiter / totalCostPerLiter) * 100 : 0;
  const overheadPercent = totalCostPerLiter > 0 ? (overheadCostPerLiter / totalCostPerLiter) * 100 : 0;
  const marginPercent = totalCostPerLiter > 0 ? (netProfitPerLiter / totalCostPerLiter) * 100 : 0;

  // Aylık Raporu Arşive Kaydet
  const handleSaveReport = async () => {
    setSavingReport(true);
    setSaveSuccess('');
    try {
      const payload: Omit<MonthlyCostReport, 'id' | 'createdAt'> = {
        month: selectedMonth,
        title: `${formattedMonthTitle} Çiftlik Maliyet & Kârlılık Raporu`,
        daysInMonth,
        totalMilkProduction: monthTotalMilk,
        dailyAverageMilk,
        milkingCowsCount: averageMilkingCows,

        feedCostPerLiter: Number(feedCostPerLiter.toFixed(2)),
        dailyFeedCostPerCow: Number(dailyFeedCostPerCow.toFixed(2)),
        overheadCostPerLiter: Number(overheadCostPerLiter.toFixed(2)),
        totalCostPerLiter: Number(totalCostPerLiter.toFixed(2)),
        netProfitPerLiter: Number(netProfitPerLiter.toFixed(2)),
        milkSalePrice: Number(milkSalePrice.toFixed(2)),

        totalFeedCost: Math.round(totalMonthlyFeedCost),
        totalOverheadCost: Math.round(totalMonthlyExpense),
        totalOperatingCost: Math.round(totalMonthlyOperatingCost),
        totalRevenue: Math.round(totalMonthlyRevenue),
        netProfitTotal: Math.round(totalMonthlyNetProfit),

        expenseBreakdown,
        notes: reportNotes || undefined,
      };

      const res = await fetch('/api/cost-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveSuccess(`"${formattedMonthTitle}" maliyet raporu başarıyla arşivlendi!`);
        // Listeyi yenile
        const reportsRes = await fetch('/api/cost-reports');
        const data = await reportsRes.json();
        setCostReports(Array.isArray(data) ? data : []);
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingReport(false);
    }
  };

  // Arşivden Rapor Silme
  const handleDeleteReport = (id: string, monthName: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Aylık Maliyet Raporunu Sil',
      message: `"${monthName}" dönemine ait arşivlenmiş maliyet raporunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      confirmText: 'Raporu Sil',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/cost-reports?id=${id}`, { method: 'DELETE' });
          if (res.ok) {
            setCostReports(prev => prev.filter(r => r.id !== id));
          }
        } catch (e) {
          console.error(e);
        }
      },
    });
  };

  // Özel A4 Tek Sayfa Maliyet Raporu Yazdırma
  const handlePrintCostReport = () => {
    const originalTitle = document.title;
    document.title = `MilkIQ_Maliyet_Raporu_${selectedMonth}`;
    document.body.classList.add('print-mode-cost');

    const cleanup = () => {
      document.body.classList.remove('print-mode-cost');
      document.title = originalTitle;
      window.removeEventListener('afterprint', cleanup);
    };

    window.addEventListener('afterprint', cleanup);
    window.print();

    // Fallback cleanup
    setTimeout(cleanup, 1500);
  };

  if (loading && feeds.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-semibold">Maliyet & Kârlılık Verileri Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div>
      {/* SCREEN UI (YAZDIRIRKEN GİZLENİR) */}
      <div id="maliyet-screen-ui" className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* HEADER & AY SEÇİCİ */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Maliyet & Kârlılık Sistemi
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Rasyon yem maliyeti ile aylık genel giderlerin sağılan süte net dağılımı ve kâr marjı.
          </p>
        </div>

        {/* TAB BUTTONS (ANALİZ / ARŞİV) */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTab('analiz')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'analiz'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Aylık Analiz</span>
          </button>
          <button
            onClick={() => setActiveTab('arsiv')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'arsiv'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Rapor Arşivi ({costReports.length})</span>
          </button>
        </div>
      </div>

      {/* MONTH SELECTOR BAR */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-4 sm:p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
              Hesaplama & Rapor Dönemi
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white capitalize">
              {formattedMonthTitle}
            </h2>
          </div>
        </div>

        {/* AY DEĞİŞTİRME KONTROLLERİ */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
            title="Önceki Ay"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => e.target.value && setSelectedMonth(e.target.value)}
            className="h-9 px-3 bg-slate-800 border border-slate-700 text-white font-bold text-xs rounded-xl focus:border-emerald-500 text-center"
          />

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
            title="Sonraki Ay"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {selectedMonth !== currentMonthStr && (
            <button
              type="button"
              onClick={handleCurrentMonth}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-xs"
            >
              Cari Ay
            </button>
          )}

          <button
            type="button"
            onClick={handlePrintCostReport}
            className="px-3.5 py-2 rounded-xl border border-slate-600 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs active:scale-95"
            title="A4 Maliyet & Bilanço Raporunu Yazdır / PDF Çıkar"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Yazdır / PDF</span>
          </button>
        </div>
      </div>

      {/* SUCCESS BANNER */}
      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* TAB 1: AYLIK ANALİZ */}
      {activeTab === 'analiz' && (
        <div id="maliyet-raporu" className="space-y-6">
          {/* 4 TEMEL METRİK KARTI (KULLANICININ İSTEDİĞİ METRİKLER) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* KART 1: 1L YEM MALİYETİ */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  1L Yem Maliyeti
                </span>
                <div className="mt-2 flex items-baseline space-x-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {feedCostPerLiter.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-slate-500">TL/L</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 font-bold mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span>İnek başı:</span>
                <span className="text-emerald-700">{dailyFeedCostPerCow.toFixed(2)} TL / gün</span>
              </p>
            </div>

            {/* KART 2: 1L GENEL GİDER PAYI */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  1L Genel Gider Payı
                </span>
                <div className="mt-2 flex items-baseline space-x-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {overheadCostPerLiter.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-slate-500">TL/L</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold mt-2 pt-2 border-t border-slate-100 truncate">
                Elektrik, mazot, veteriner
              </p>
            </div>

            {/* KART 3: 1L TOPLAM MALİYET */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                  1L Toplam Maliyet
                </span>
                <div className="mt-2 flex items-baseline space-x-1">
                  <span className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                    {totalCostPerLiter.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-slate-400">TL/L</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 font-semibold mt-2 pt-2 border-t border-slate-800">
                Yem + Genel İşletme
              </p>
            </div>

            {/* KART 4: 1L NET KÂR MARJI */}
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-xs flex flex-col justify-between ${
              netProfitPerLiter >= 0
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-80 block">
                  1L Net Kâr Marjı
                </span>
                <div className="mt-2 flex items-baseline space-x-1">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight">
                    {netProfitPerLiter >= 0 ? '+' : ''}{netProfitPerLiter.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold opacity-80">TL/L</span>
                </div>
              </div>
              <p className="text-[11px] font-bold mt-2 pt-2 border-t border-black/10 flex items-center justify-between">
                <span>Süt Satış:</span>
                <span>{milkSalePrice.toFixed(2)} TL</span>
              </p>
            </div>
          </div>

          {/* AYLIK ÇİFTLİK BÜTÇESİ & KÂR/ZARAR TABLOSU (TOPLAM DEĞERLER) */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center space-x-2">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  <span>{formattedMonthTitle} Çiftlik Gelir, Gider & Net Bilanço Özeti</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ay içinde sağılan toplam <strong>{monthTotalMilk.toLocaleString('tr-TR')} Litre</strong> süt üzerinden hesaplanmıştır.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 font-semibold">
                  {daysInMonth} Gün ({averageMilkingCows} Baş Sağmal)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block font-semibold text-[11px]">Toplam Süt Geliri</span>
                <strong className="text-lg sm:text-xl font-black text-slate-900 block mt-0.5">
                  {Math.round(totalMonthlyRevenue).toLocaleString('tr-TR')} TL
                </strong>
                <span className="text-[10px] text-slate-500">{monthTotalMilk} L × {milkSalePrice.toFixed(2)} TL</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block font-semibold text-[11px]">Toplam Yem Gideri</span>
                <strong className="text-lg sm:text-xl font-black text-amber-700 block mt-0.5">
                  {Math.round(totalMonthlyFeedCost).toLocaleString('tr-TR')} TL
                </strong>
                <span className="text-[10px] text-slate-500">Maliyetin %{feedCostPercent.toFixed(0)}&apos;i</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block font-semibold text-[11px]">Genel İşletme Gideri</span>
                <strong className="text-lg sm:text-xl font-black text-indigo-700 block mt-0.5">
                  {Math.round(totalMonthlyExpense).toLocaleString('tr-TR')} TL
                </strong>
                <span className="text-[10px] text-slate-500">Elektrik, mazot, veteriner vb.</span>
              </div>

              <div className={`p-3.5 rounded-2xl border ${
                totalMonthlyNetProfit >= 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}>
                <span className="opacity-80 block font-bold text-[11px]">Aylık Net Kâr</span>
                <strong className="text-lg sm:text-xl font-black block mt-0.5">
                  {totalMonthlyNetProfit >= 0 ? '+' : ''}{Math.round(totalMonthlyNetProfit).toLocaleString('tr-TR')} TL
                </strong>
                <span className="text-[10px] opacity-75">Tüm masraflar düşüldükten sonra</span>
              </div>
            </div>
          </div>

          {/* GİDER KATEGORİLERİ DÖKÜMÜ & SÜT SATIŞ FİYATI SİMÜLATÖRÜ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* GİDER KATEGORİLERİ DAĞILIMI */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center space-x-2">
                    <PieChart className="w-4 h-4 text-emerald-600" />
                    <span>{formattedMonthTitle} Genel Gider Dökümü</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Toplam {expenses.length} adet gider kaydı ({totalMonthlyExpense.toLocaleString('tr-TR')} TL)
                  </p>
                </div>

                <Link
                  href="/giderler"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
                >
                  <span>Giderleri Yönet</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {expenseBreakdown.length === 0 ? (
                <div className="p-6 text-center space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">
                    Bu ay için henüz elektrik, mazot veya veteriner gideri girilmedi.
                  </p>
                  <Link
                    href="/giderler"
                    className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                  >
                    Gider Kaydı Ekle
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {expenseBreakdown.map((item) => (
                    <div key={item.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{item.categoryLabel}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-500 text-[11px]">%{item.percentage}</span>
                          <strong className="font-black text-slate-900">{item.amount.toLocaleString('tr-TR')} TL</strong>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, item.percentage)}%` }}
                          className="h-full bg-emerald-600 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SÜT SATIŞ FİYATI SİMÜLASYONU */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center space-x-2">
                      <Sliders className="w-4 h-4 text-emerald-600" />
                      <span>Süt Satış Fiyatı Simülasyonu</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Fiyat değişimlerinin litre başı kârlılığa etkisini anlık test edin.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-600 block">Süt Satış Fiyatı</span>
                    <span className="text-[11px] text-slate-400">Ulusal Süt Konseyi / Fabrika</span>
                  </div>

                  <div className="flex items-center space-x-2 bg-white p-1 rounded-xl border border-slate-300 shadow-xs">
                    <button
                      type="button"
                      onClick={() => setMilkSalePrice(p => Math.max(5, Number((p - 0.5).toFixed(2))))}
                      className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 font-black flex items-center justify-center text-sm active:scale-95"
                    >
                      -
                    </button>
                    <div className="px-2 text-center min-w-16">
                      <span className="text-lg font-black text-slate-900">{milkSalePrice.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-500 ml-1">TL</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMilkSalePrice(p => Number((p + 0.5).toFixed(2)))}
                      className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 font-black flex items-center justify-center text-sm active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Maliyet vs Satış Dağılım Çubuğu */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Yem: {feedCostPerLiter.toFixed(2)} TL</span>
                    <span>Gider: {overheadCostPerLiter.toFixed(2)} TL</span>
                    <span className={netProfitPerLiter >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                      Kâr: {netProfitPerLiter.toFixed(2)} TL
                    </span>
                  </div>

                  <div className="w-full h-5 bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                    <div
                      style={{ width: `${Math.min(100, (feedCostPerLiter / milkSalePrice) * 100)}%` }}
                      className="bg-emerald-600 h-full flex items-center justify-center text-[10px] font-bold text-white truncate"
                    >
                      Yem
                    </div>
                    <div
                      style={{ width: `${Math.min(100 - (feedCostPerLiter / milkSalePrice) * 100, (overheadCostPerLiter / milkSalePrice) * 100)}%` }}
                      className="bg-indigo-600 h-full flex items-center justify-center text-[10px] font-bold text-white truncate"
                    >
                      Gider
                    </div>
                    {netProfitPerLiter > 0 && (
                      <div
                        style={{ width: `${Math.max(0, (netProfitPerLiter / milkSalePrice) * 100)}%` }}
                        className="bg-amber-400 h-full flex items-center justify-center text-[10px] font-black text-slate-900 truncate"
                      >
                        Kâr
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-[11px] mt-4">
                💡 <strong>Başabaş Noktası:</strong> Çiftliğinizin zarar etmemesi için 1 litre sütü en az <strong>{totalCostPerLiter.toFixed(2)} TL</strong>&apos;ye satması gerekir.
              </div>
            </div>
          </div>

          {/* RAPORU TARİH DAMGASIYLA ARŞİVLEME FORMU */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Save className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                {formattedMonthTitle} Maliyet Raporunu Arşive Kaydet
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="Rapor açıklaması veya notu (örn: Süt yemi zammı sonrası Ekim ayı net bilançosu)"
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                className="w-full sm:flex-1 h-11 px-4 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500"
              />

              <button
                type="button"
                onClick={handleSaveReport}
                disabled={savingReport}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingReport ? 'Kaydediliyor...' : 'Bu Ayın Raporunu Arşivle'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GEÇMİŞ AYLAR RAPOR ARŞİVİ */}
      {activeTab === 'arsiv' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center space-x-2">
                  <History className="w-5 h-5 text-emerald-600" />
                  <span>Kayıtlı Aylık Maliyet Raporları Arşivi</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tarih damgalı olarak saklanan geçmiş ayların kârlılık ve maliyet raporları.
                </p>
              </div>
            </div>

            {costReports.length === 0 ? (
              <div className="p-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Henüz arşivlenmiş bir aylık rapor bulunmuyor.</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  &quot;Aylık Analiz&quot; sekmesine gidip ilgili ayı seçtikten sonra <strong>&quot;Bu Ayın Raporunu Arşivle&quot;</strong> butonuna basarak raporlarınızı kaydedebilirsiniz.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('analiz')}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Analiz Sayfasına Dön
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {costReports.map((rep) => {
                  const isCurrentSelected = rep.month === selectedMonth;
                  const [y, m] = rep.month.split('-');
                  const monthDate = new Date(Number(y), Number(m) - 1, 1);
                  const displayMonthName = monthDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

                  return (
                    <div
                      key={rep.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isCurrentSelected
                          ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-black text-slate-900 text-base capitalize">
                            {displayMonthName}
                          </h4>
                          {isCurrentSelected && (
                            <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                              SEÇİLİ DÖNEM
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
                            ({new Date(rep.createdAt).toLocaleDateString('tr-TR')} kaydedildi)
                          </span>
                        </div>

                        {rep.notes && (
                          <p className="text-xs text-slate-600 italic">
                            &quot;{rep.notes}&quot;
                          </p>
                        )}

                        {/* Metrik Rozetleri */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-bold">
                            1L Yem: {rep.feedCostPerLiter.toFixed(2)} TL
                          </span>
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-bold">
                            1L Genel Gider: {rep.overheadCostPerLiter.toFixed(2)} TL
                          </span>
                          <span className="bg-slate-900 text-emerald-400 px-2.5 py-1 rounded-lg font-bold">
                            1L Toplam: {rep.totalCostPerLiter.toFixed(2)} TL
                          </span>
                          <span className={`px-2.5 py-1 rounded-lg font-black ${
                            rep.netProfitPerLiter >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            Net Kâr: {rep.netProfitPerLiter >= 0 ? '+' : ''}{rep.netProfitPerLiter.toFixed(2)} TL/L
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-end md:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMonth(rep.month);
                            setActiveTab('analiz');
                          }}
                          className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1"
                        >
                          <span>Dönemi Yükle</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteReport(rep.id, displayMonthName)}
                          title="Raporu Sil"
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
      </div>

      {/* ============================================================== */}
      {/* A4 YAZDIRILABİLİR AYLIK MALİYET & KÂRLILIK RAPORU              */}
      {/* SADECE YAZDIRILIRKEN GÖRÜNÜR, TÜM WEB ARAYÜZÜ GİZLENİR        */}
      {/* TEK SAYFA (SINGLE-PAGE) FORMATINA TAM OPTİMİZE EDİLMİŞTİR     */}
      {/* ============================================================== */}
      <div id="printable-cost-report" lang="tr" dir="ltr" className="hidden">
        <div className="bg-white text-slate-900 p-2 font-sans space-y-3">
          {/* Çiftlik & Sistem Anteti */}
          <div className="flex items-center justify-between pb-2 border-b-2 border-slate-900">
            <div className="flex items-center space-x-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon-192.png" alt="MilkIQ Logo" className="w-10 h-10 object-contain shrink-0" />
              <div>
                <h1 className="text-base font-black text-slate-950 uppercase tracking-tight leading-tight">
                  {(settings.farmName ? settings.farmName : 'MilkIQ Süt Sığırcılığı İşletmesi')}
                </h1>
                <p className="text-[11px] font-black text-emerald-800 tracking-wide uppercase leading-tight">
                  AYLIK SÜT MALİYET & KÂRLILIK BİLANÇO RAPORU
                </p>
                <p className="text-[9px] text-slate-500 font-semibold leading-tight">
                  Rasyon Yem Maliyetleri ve İşletme Genel Giderlerinin Süte Yansıması
                </p>
              </div>
            </div>
            <div className="text-right text-[10px] space-y-0.5">
              <div className="bg-slate-900 text-white font-black px-2 py-0.5 rounded text-[10px] inline-block uppercase">
                DÖNEM: {formattedMonthTitle.toLocaleUpperCase('tr-TR')}
              </div>
              <p className="text-[9px] text-slate-600 font-bold">Rapor Tarihi: {new Date().toLocaleDateString('tr-TR')}</p>
              <p className="text-[9px] text-slate-500">Dönem Gün Sayısı: {daysInMonth} Gün</p>
            </div>
          </div>

          {/* Sürü ve Üretim Temel Verileri Barı */}
          <div className="grid grid-cols-4 gap-2 bg-slate-100 p-2 rounded-lg border border-slate-300 text-center text-[10px]">
            <div>
              <span className="text-slate-500 font-medium block text-[9px]">Sağmal Sürü</span>
              <strong className="text-slate-900 text-xs font-black">{averageMilkingCows} Baş</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block text-[9px]">Aylık Süt Üretimi</span>
              <strong className="text-slate-900 text-xs font-black">{monthTotalMilk.toLocaleString('tr-TR')} Litre</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block text-[9px]">Günlük Ort. Süt</span>
              <strong className="text-slate-900 text-xs font-black">{dailyAverageMilk.toFixed(1)} L / Gün</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block text-[9px]">Çiğ Süt Satış Fiyatı</span>
              <strong className="text-emerald-800 text-xs font-black">{milkSalePrice.toFixed(2)} TL / Litre</strong>
            </div>
          </div>

          {/* 1 Litre Süt Maliyet & Kârlılık Kırılımı (4'lü Kart) */}
          <div>
            <div className="text-[10px] font-black uppercase text-slate-700 mb-1">
              1. BİRİM LİTRE (1L) SÜT MALİYET & KÂR KIRILIMI
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="p-2 rounded-lg border border-emerald-300 bg-emerald-50/60 text-center">
                <span className="text-[9px] font-bold text-emerald-800 block">1L YEM MALİYETİ</span>
                <div className="text-sm font-black text-emerald-950 mt-0.5">{feedCostPerLiter.toFixed(2)} TL</div>
                <span className="text-[8px] text-emerald-700 font-semibold">Pay: %{feedCostPercent.toFixed(0)}</span>
              </div>
              <div className="p-2 rounded-lg border border-indigo-300 bg-indigo-50/60 text-center">
                <span className="text-[9px] font-bold text-indigo-800 block">1L GENEL GİDER</span>
                <div className="text-sm font-black text-indigo-950 mt-0.5">{overheadCostPerLiter.toFixed(2)} TL</div>
                <span className="text-[8px] text-indigo-700 font-semibold">Pay: %{overheadPercent.toFixed(0)}</span>
              </div>
              <div className="p-2 rounded-lg border border-slate-400 bg-slate-100 text-center">
                <span className="text-[9px] font-bold text-slate-800 block">1L TOPLAM MALİYET</span>
                <div className="text-sm font-black text-slate-950 mt-0.5">{totalCostPerLiter.toFixed(2)} TL</div>
                <span className="text-[8px] text-slate-600 font-semibold">Başabaş Satış Eşiği</span>
              </div>
              <div className={`p-2 rounded-lg border text-center ${netProfitPerLiter >= 0 ? 'border-emerald-500 bg-emerald-100/70' : 'border-rose-400 bg-rose-50'}`}>
                <span className={`text-[9px] font-bold block ${netProfitPerLiter >= 0 ? 'text-emerald-900' : 'text-rose-800'}`}>1L NET KÂR MARJI</span>
                <div className={`text-sm font-black mt-0.5 ${netProfitPerLiter >= 0 ? 'text-emerald-900' : 'text-rose-950'}`}>
                  {netProfitPerLiter >= 0 ? '+' : ''}{netProfitPerLiter.toFixed(2)} TL
                </div>
                <span className={`text-[8px] font-bold ${netProfitPerLiter >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
                  Kâr Oranı: %{marginPercent.toFixed(0)}
                </span>
              </div>
            </div>
          </div>

          {/* Aylık Çiftlik Bütçesi ve Bilanço Özeti (4'lü Kart) */}
          <div>
            <div className="text-[10px] font-black uppercase text-slate-700 mb-1">
              2. DÖNEMLİK TOPLAM BÜTÇE & NET BİLANÇO
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-slate-50 border border-slate-300 rounded-lg">
                <span className="text-[8px] text-slate-500 font-bold block">TOPLAM SÜT GELİRİ</span>
                <div className="text-xs font-black text-slate-900 mt-0.5">{Math.round(totalMonthlyRevenue).toLocaleString('tr-TR')} TL</div>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-300 rounded-lg">
                <span className="text-[8px] text-slate-500 font-bold block">TOPLAM YEM GİDERİ</span>
                <div className="text-xs font-black text-slate-900 mt-0.5">{Math.round(totalMonthlyFeedCost).toLocaleString('tr-TR')} TL</div>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-300 rounded-lg">
                <span className="text-[8px] text-slate-500 font-bold block">TOPLAM GENEL GİDER</span>
                <div className="text-xs font-black text-slate-900 mt-0.5">{Math.round(totalMonthlyExpense).toLocaleString('tr-TR')} TL</div>
              </div>
              <div className={`p-2 border rounded-lg ${totalMonthlyNetProfit >= 0 ? 'bg-emerald-50 border-emerald-400' : 'bg-rose-50 border-rose-400'}`}>
                <span className={`text-[8px] font-black block ${totalMonthlyNetProfit >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>DÖNEMLİK NET KÂR</span>
                <div className={`text-xs font-black mt-0.5 ${totalMonthlyNetProfit >= 0 ? 'text-emerald-950' : 'text-rose-950'}`}>
                  {totalMonthlyNetProfit >= 0 ? '+' : ''}{Math.round(totalMonthlyNetProfit).toLocaleString('tr-TR')} TL
                </div>
              </div>
            </div>
          </div>

          {/* 3. İki Kolonlu Detay: Sol Genel Gider Tablosu / Sağ Aktif Rasyon Özeti & Notlar */}
          <div className="grid grid-cols-2 gap-3 text-[10px]">
            {/* Sol: Genel Gider Tablosu */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-slate-100 px-2 py-1 font-black text-[9px] text-slate-800 border-b border-slate-300 uppercase flex justify-between">
                <span>Aylık Genel Gider Kalemleri</span>
                <span>Toplam: {Math.round(totalMonthlyExpense).toLocaleString('tr-TR')} TL</span>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[8px] text-slate-500 border-b border-slate-200">
                    <th className="py-1 px-2">Gider Türü</th>
                    <th className="py-1 px-1 text-right">Tutar (TL)</th>
                    <th className="py-1 px-1 text-right">Pay (%)</th>
                    <th className="py-1 px-2 text-right">1L Payı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[9px]">
                  {expenseBreakdown.map((item) => (
                    <tr key={item.category}>
                      <td className="py-0.5 px-2 font-medium text-slate-800">{item.categoryLabel}</td>
                      <td className="py-0.5 px-1 text-right font-bold text-slate-900">{Math.round(item.amount).toLocaleString('tr-TR')} ₺</td>
                      <td className="py-0.5 px-1 text-right text-slate-600">%{item.percentage.toFixed(1)}</td>
                      <td className="py-0.5 px-2 text-right font-bold text-indigo-900">
                        {(monthTotalMilk > 0 ? item.amount / monthTotalMilk : 0).toFixed(2)} ₺
                      </td>
                    </tr>
                  ))}
                  {expenseBreakdown.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-2 text-center text-slate-400 text-[9px]">Bu ay için gider kaydı bulunmuyor</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Sağ: Rasyon Parametreleri & Çiftlik Notları */}
            <div className="border border-slate-300 rounded-lg p-2 space-y-2 flex flex-col justify-between">
              <div>
                <div className="font-black text-[9px] text-slate-800 uppercase pb-1 border-b border-slate-200">
                  Rasyon ve Başabaş Değerlendirmesi
                </div>
                <div className="space-y-1.5 mt-1.5 text-[9px]">
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                    <span className="text-slate-600">1 İnek Günlük Rasyon Maliyeti:</span>
                    <strong className="text-slate-900 font-bold">{dailyFeedCostPerCow.toFixed(2)} TL / Gün</strong>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                    <span className="text-slate-600">Aktif Rasyondaki Yem Çeşidi:</span>
                    <strong className="text-slate-900 font-bold">{ration?.items?.length || 0} Çeşit</strong>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                    <span className="text-slate-600">İşletme Başabaş Noktası (Eşik):</span>
                    <strong className="text-slate-900 font-black">{totalCostPerLiter.toFixed(2)} TL / Litre</strong>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded border border-slate-200 text-[8.5px] text-slate-600 leading-tight">
                    💡 <strong>Not:</strong> 1 litre sütün satış fiyatı <strong>{totalCostPerLiter.toFixed(2)} TL</strong> altına düşerse işletme zarar eder. Mevcut {milkSalePrice.toFixed(2)} TL satış fiyatı ile litre başı <strong>{netProfitPerLiter.toFixed(2)} TL</strong> kâr elde edilmektedir.
                  </div>
                </div>
              </div>

              {reportNotes && (
                <div className="p-1.5 bg-amber-50 rounded border border-amber-200 text-[8.5px] text-amber-900">
                  <strong>Dönem Notu:</strong> {reportNotes}
                </div>
              )}
            </div>
          </div>

          {/* Alt Bilgi */}
          <div className="pt-1.5 text-center text-[8px] text-slate-500 font-medium border-t border-slate-200">
            MilkIQ Akıllı Süt, Rasyon & Maliyet Sistemi tarafından otomatik üretilmiştir.
          </div>
        </div>
      </div>
    </div>
  );
}
