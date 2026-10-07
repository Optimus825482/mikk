'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  Save, 
  Scale, 
  Milk, 
  AlertTriangle, 
  AlertCircle,
  CheckCircle2, 
  Info, 
  Plus, 
  Minus, 
  Sparkles, 
  RotateCcw,
  History,
  Calendar,
  Trash2,
  Star,
  X,
  Printer,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Check,
  ChevronRight,
  TrendingUp,
  Receipt,
  Users,
  Layers
} from 'lucide-react';
import { 
  Feed, 
  Ration, 
  RationCalculationResult, 
  SystemSetting, 
  FEED_CATEGORY_CONFIG 
} from '@/types';
import { calculateRation, DEFAULT_SETTINGS } from '@/lib/calculator';
import ConfirmModal, { ConfirmVariant } from '@/components/ConfirmModal';

const LACTATION_GROUPS = [
  {
    id: 'erken',
    name: 'Erken Laktasyon (Pik)',
    dim: 'DIM: 1 - 100 Gün',
    phase: 'Faz 1 (Pik Dönemi)',
    color: 'border-rose-400 bg-rose-50/70 text-rose-800',
    activeBorder: 'border-rose-500 ring-2 ring-rose-400/50 bg-rose-50/90 shadow-md',
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
    defaultLiveWeight: 650,
    defaultTargetMilk: 34,
    description: 'Doğum sonrası negatif enerji dengesini önleyen yüksek enerjili yoğun rasyon. Karaciğer ve rumen koruyucu premiksler.',
    targetNote: 'Maksimum pik verimi ve kilo kaybını sınırlama'
  },
  {
    id: 'orta',
    name: 'Orta Laktasyon (Plato)',
    dim: 'DIM: 101 - 200 Gün',
    phase: 'Faz 2 (Plato Dönemi)',
    color: 'border-sky-400 bg-sky-50/70 text-sky-800',
    activeBorder: 'border-sky-500 ring-2 ring-sky-400/50 bg-sky-50/90 shadow-md',
    badge: 'bg-sky-100 text-sky-800 border-sky-300',
    defaultLiveWeight: 620,
    defaultTargetMilk: 26,
    description: 'Yem tüketim kapasitesinin en üst düzeye ulaştığı dönem. Süt verimi platosunu uzatan dengeli kaba/kesif yem oranı.',
    targetNote: 'Düzenli verim ve tohumlama başarısı'
  },
  {
    id: 'gec',
    name: 'Geç Laktasyon & Kuru Dönem',
    dim: 'DIM: 200+ & Kuru',
    phase: 'Faz 3 (Yenilenme)',
    color: 'border-emerald-400 bg-emerald-50/70 text-emerald-800',
    activeBorder: 'border-emerald-500 ring-2 ring-emerald-400/50 bg-emerald-50/90 shadow-md',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    defaultLiveWeight: 680,
    defaultTargetMilk: 14,
    description: 'Aşırı yağlanmayı önleyen yüksek lifli, düşük enerjili kaba yem ağırlıklı rasyon. Anyonik tuz dengesi ve meme dokusu yenilenmesi.',
    targetNote: 'Sorunsuz doğum ve sağlıklı yeni buzağı'
  }
];

export default function RationPage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [settings, setSettings] = useState<SystemSetting>(DEFAULT_SETTINGS);
  const [liveWeight, setLiveWeight] = useState<number>(650);
  const [targetMilk, setTargetMilk] = useState<number>(34);
  const [selectedLactationGroup, setSelectedLactationGroup] = useState<string>('erken');

  // Confirm Modal State
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
  const [rationTitle, setRationTitle] = useState<string>('Günlük Süt Rasyonu');
  const [feedAmounts, setFeedAmounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'kaba' | 'kesif' | 'tum'>('tum');

  // Rapor ve Hesaplama Durumu
  const [showReport, setShowReport] = useState<boolean>(false);
  const [reportTimestamp, setReportTimestamp] = useState<string>('');

  // Sürü ve Öğün Parametreleri
  const [animalCount, setAnimalCount] = useState<number>(20);
  const [mealCount, setMealCount] = useState<number>(2);

  // Kayıtlı Rasyonlar Geçmişi
  const [savedRations, setSavedRations] = useState<Ration[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [activeRationId, setActiveRationId] = useState<string>('');

  // Load feeds and saved rations from API
  const loadData = async () => {
    try {
      const [feedsRes, rationRes, settingsRes] = await Promise.all([
        fetch('/api/feeds'),
        fetch('/api/ration?all=true'),
        fetch('/api/settings'),
      ]);

      const feedsData = await feedsRes.json();
      const rationData = await rationRes.json();
      const settingsData = await settingsRes.json();

      setFeeds(feedsData);
      if (settingsData) {
        setSettings(prev => ({ ...prev, ...settingsData }));
      }

      if (rationData) {
        const active = rationData.active || rationData;
        const list = rationData.list || [];
        setSavedRations(list);

        if (active) {
          setActiveRationId(active.id);
          setRationTitle(active.title || 'Günlük Süt Rasyonu');
          setLiveWeight(active.liveWeight || 600);
          setTargetMilk(active.targetMilk || 25);
          
          const amounts: Record<string, number> = {};
          if (active.items && Array.isArray(active.items)) {
            active.items.forEach((item: any) => {
              amounts[item.feedId] = item.freshAmount;
            });
          }
          setFeedAmounts(amounts);
        }
      }
    } catch (e) {
      console.error('Veri yükleme hatası:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Format feed items for calculation
  const itemsForCalc = useMemo(() => {
    return Object.entries(feedAmounts).map(([feedId, freshAmount]) => ({
      feedId,
      freshAmount: Number(freshAmount) || 0,
    })).filter(i => i.freshAmount > 0);
  }, [feedAmounts]);

  // Calculation Result
  const results: RationCalculationResult = useMemo(() => {
    return calculateRation(itemsForCalc, feeds, liveWeight, targetMilk, settings);
  }, [itemsForCalc, feeds, liveWeight, targetMilk, settings]);

  // Sürü ve Öğün Hesaplamaları
  const safeAnimalCount = Math.max(1, Number(animalCount) || 1);
  const safeMealCount = Math.max(1, Number(mealCount) || 1);

  const herdMetrics = useMemo(() => {
    const dailyHerdFreshKg = results.totalFreshKg * safeAnimalCount;
    const mealMixerFreshKg = dailyHerdFreshKg / safeMealCount;
    const dailyHerdCost = results.dailyFeedCostPerCow * safeAnimalCount;
    const mealMixerCost = dailyHerdCost / safeMealCount;

    const breakdown = itemsForCalc.map(item => {
      const feed = feeds.find(f => f.id === item.feedId);
      if (!feed) return null;
      const perCowDaily = item.freshAmount;
      const perCowMeal = perCowDaily / safeMealCount;
      const herdDaily = perCowDaily * safeAnimalCount;
      const herdMeal = herdDaily / safeMealCount;
      const costDaily = herdDaily * feed.unitPrice;
      const costMeal = costDaily / safeMealCount;

      return {
        feedId: feed.id,
        feedName: feed.name,
        feedType: feed.type,
        category: feed.category,
        unitPrice: feed.unitPrice,
        perCowDaily,
        perCowMeal,
        herdMeal,
        herdDaily,
        costDaily,
        costMeal,
      };
    }).filter(Boolean) as {
      feedId: string;
      feedName: string;
      feedType: string;
      category?: string;
      unitPrice: number;
      perCowDaily: number;
      perCowMeal: number;
      herdMeal: number;
      herdDaily: number;
      costDaily: number;
      costMeal: number;
    }[];

    // Mikser operatörünün TMR yükleme sıralaması (Kuru Kaba -> Sulu Kaba -> Kesif & Hububat)
    const getCategoryPriority = (category?: string, feedType?: string) => {
      if (category === 'KURU_OT' || category === 'SAMAN') return 1;
      if (category === 'SILAJ' || category === 'YAS_KUSPE') return 2;
      if (category === 'HAZIR_YEM' || category === 'HUBUBAT' || category === 'KUSPE' || category === 'YAN_URUN') return 3;
      return feedType === 'KABA' ? 1 : 3;
    };

    const getStageName = (category?: string, feedType?: string) => {
      if (category === 'KURU_OT' || category === 'SAMAN') return '1. Aşama: Kuru Kaba (Önce Kıyın)';
      if (category === 'SILAJ' || category === 'YAS_KUSPE') return '2. Aşama: Sulu Kaba (Nemlendirin)';
      if (category === 'HAZIR_YEM') return '3. Aşama: Fabrika Süt Yemi';
      if (category === 'HUBUBAT') return '3. Aşama: Hububat Kırması';
      if (category === 'KUSPE') return '3. Aşama: Protein Küspesi';
      return feedType === 'KABA' ? '1. Aşama: Kaba Yem' : '3. Aşama: Kesif Yem';
    };

    const sortedForMixer = [...breakdown].sort((a, b) => {
      const pA = getCategoryPriority(a.category, a.feedType);
      const pB = getCategoryPriority(b.category, b.feedType);
      if (pA !== pB) return pA - pB;
      return b.herdMeal - a.herdMeal;
    });

    let runningScaleKg = 0;
    const sortedWithCumulative = sortedForMixer.map((item, index) => {
      runningScaleKg += item.herdMeal;
      return {
        ...item,
        orderIndex: index + 1,
        stageName: getStageName(item.category, item.feedType),
        cumulativeScaleKg: runningScaleKg,
      };
    });

    return {
      dailyHerdFreshKg,
      mealMixerFreshKg,
      dailyHerdCost,
      mealMixerCost,
      breakdown,
      sortedWithCumulative,
    };
  }, [itemsForCalc, feeds, safeAnimalCount, safeMealCount, results]);

  // Feed amounts change handlers
  const handleAmountChange = (feedId: string, val: string) => {
    const num = parseFloat(val);
    setFeedAmounts(prev => ({
      ...prev,
      [feedId]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  const adjustAmount = (feedId: string, delta: number) => {
    setFeedAmounts(prev => {
      const current = prev[feedId] || 0;
      const next = Math.max(0, Number((current + delta).toFixed(1)));
      return { ...prev, [feedId]: next };
    });
  };

  // Rasyonu Hesapla & Raporu Göster
  const handleCalculateReport = () => {
    const now = new Date();
    const formatted = now.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    setReportTimestamp(formatted);
    setShowReport(true);

    setTimeout(() => {
      const el = document.getElementById('rasyon-raporu');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Rasyonu Tarih Damgasıyla Yeni Olarak Kaydet
  const handleSaveRation = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      const items = Object.entries(feedAmounts)
        .filter(([, amount]) => amount > 0)
        .map(([feedId, freshAmount]) => ({ feedId, freshAmount }));

      if (items.length === 0) {
        alert('Lütfen rasyona en az bir yem ekleyin.');
        setSaving(false);
        return;
      }

      const res = await fetch('/api/ration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_new',
          title: rationTitle.trim() || undefined,
          liveWeight,
          targetMilk,
          items,
          isActive: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccess(true);
        setSaveMessage('Rasyon tarih damgasıyla başarıyla arşivlendi!');
        if (data.ration) {
          setActiveRationId(data.ration.id);
        }
        if (data.list) {
          setSavedRations(data.list);
        }
        setTimeout(() => setSaveSuccess(false), 3500);
      }
    } catch (e) {
      console.error('Kayıt hatası:', e);
      alert('Kayıt işlemi sırasında hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  // Geçmiş Rasyonu Yükle
  const handleLoadSavedRation = (saved: Ration) => {
    setActiveRationId(saved.id);
    setRationTitle(saved.title);
    setLiveWeight(saved.liveWeight || 600);
    setTargetMilk(saved.targetMilk || 25);

    const amounts: Record<string, number> = {};
    if (saved.items && Array.isArray(saved.items)) {
      saved.items.forEach(item => {
        amounts[item.feedId] = item.freshAmount;
      });
    }
    setFeedAmounts(amounts);
    setShowHistoryModal(false);

    // Otomatik olarak raporu güncelle
    const formatted = new Date(saved.createdAt || new Date()).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    setReportTimestamp(formatted);
    setShowReport(true);
  };

  // Aktif Rasyon Yap
  const handleSetActive = async (id: string) => {
    try {
      const res = await fetch('/api/ration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_active', id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActiveRationId(id);
        if (data.list) setSavedRations(data.list);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Rasyon Sil
  const handleDeleteRation = (id: string, title: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Rasyonu Sil',
      message: `"${title}" adlı rasyonu geçmişten silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      confirmText: 'Evet, Sil',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/ration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            if (data.list) setSavedRations(data.list);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const resetRation = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Yem Miktarlarını Sıfırla',
      message: 'Tablodaki tüm yem miktarlarını sıfırlamak istediğinize emin misiniz? Mevcut değerler temizlenecektir.',
      confirmText: 'Evet, Sıfırla',
      variant: 'warning',
      onConfirm: () => {
        setFeedAmounts({});
        setShowReport(false);
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Mikser Reçetesi Özel A4 Yazdırma Fonksiyonu
  const handlePrintMixerRecipe = () => {
    document.title = `TMR_Mikser_Recetesi_${safeAnimalCount}Bas_${new Date().toISOString().slice(0, 10)}`;
    document.body.classList.remove('print-mode-report');
    document.body.classList.add('print-mode-mixer');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Rasyon Analiz Raporu Özel A4 Yazdırma Fonksiyonu
  const handlePrintRationReport = () => {
    document.title = `Rasyon_Analiz_Raporu_${liveWeight}kg_${targetMilk}L_${new Date().toISOString().slice(0, 10)}`;
    document.body.classList.remove('print-mode-mixer');
    document.body.classList.add('print-mode-report');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  useEffect(() => {
    const handleBeforePrint = () => {
      if (!document.body.classList.contains('print-mode-mixer') && !document.body.classList.contains('print-mode-report')) {
        document.body.classList.add('print-mode-report');
      }
    };
    const handleAfterPrint = () => {
      document.body.classList.remove('print-mode-mixer');
      document.body.classList.remove('print-mode-report');
      document.title = 'MilkIQ - Akıllı Süt, Rasyon & Maliyet Asistanı';
    };
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const kabaFeeds = feeds.filter(f => f.type === 'KABA');
  const kesifFeeds = feeds.filter(f => f.type === 'KESIF');

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-semibold text-sm">Rasyon Stüdyosu Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* EKRAN ARAYÜZÜ (MİKSER YAZDIRMA ESNASINDA GİZLENİR) */}
      <div id="rasyon-screen-ui" className="space-y-6">
        {/* Title & History Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <Calculator className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Rasyon Stüdyosu</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Yem miktarlarını belirleyin, üst limitleri denetleyin ve <strong>&quot;Hesapla & Raporla&quot;</strong> butonu ile kapsamlı raporunuzu oluşturun.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Kayıtlı Rasyonlar Butonu */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-xs"
          >
            <History className="w-4 h-4 text-emerald-600" />
            <span>Kayıtlı Rasyonlarım ({savedRations.length})</span>
          </button>

          <button
            onClick={resetRation}
            title="Miktarları Sıfırla"
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ANIMAL INPUTS: Canlı Ağırlık & Hedef Süt */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>1. Adım: Hayvan Bilgileri & Süt Hedefi</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Laktasyon fazına ve hedeflere göre rasyon optimizasyonu
          </span>
        </div>

        {/* LAKTASYON DİNAMİKLERİ VE SÜRÜ GRUBU SEÇİMİ (NRC) */}
        <div className="mb-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sürü Laktasyon Evresi & Besleme Şablonu (NRC)</span>
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Grup seçerek canlı ağırlık ve hedef sütü otomatik ayarlayabilirsiniz
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {LACTATION_GROUPS.map((g) => {
              const isSelected = selectedLactationGroup === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setSelectedLactationGroup(g.id);
                    setLiveWeight(g.defaultLiveWeight);
                    setTargetMilk(g.defaultTargetMilk);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all active:scale-[0.99] flex flex-col justify-between space-y-2 relative ${
                    isSelected
                      ? g.activeBorder
                      : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${g.badge}`}>
                      {g.dim}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <Check className="w-3 h-3" /> Seçili
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-tight">
                      {g.name}
                    </h3>
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-snug">
                      {g.description}
                    </p>
                  </div>

                  <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Hedef:</span>
                    <span className="font-bold text-slate-800">
                      {g.defaultLiveWeight} kg • {g.defaultTargetMilk} L
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Canlı Ağırlık */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Ortalama Canlı Ağırlık (kg)
              </label>
              <span className="text-xs text-slate-500">Siyah Alaca / Simental</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setLiveWeight(w => Math.max(250, w - 25))}
                className="w-10 h-10 rounded-lg bg-white border border-slate-300 font-black text-slate-700 hover:bg-slate-100 flex items-center justify-center text-lg active:scale-95 shadow-xs"
              >
                -
              </button>
              <input
                type="number"
                inputMode="decimal"
                value={liveWeight || ''}
                onChange={(e) => setLiveWeight(parseFloat(e.target.value) || 0)}
                className="flex-1 h-10 text-center font-black text-xl text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setLiveWeight(w => w + 25)}
                className="w-10 h-10 rounded-lg bg-white border border-slate-300 font-black text-slate-700 hover:bg-slate-100 flex items-center justify-center text-lg active:scale-95 shadow-xs"
              >
                +
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Kuru madde kapasitesi: <strong>{results.targetDryMatterKg} kg KM/gün</strong>
            </p>
          </div>

          {/* Hedeflenen Süt Ortalaması */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase flex items-center space-x-1">
                <Milk className="w-3.5 h-3.5 text-blue-600" />
                <span>Hedef Süt Ortalaması (Litre/gün)</span>
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setTargetMilk(m => Math.max(0, m - 1))}
                className="w-10 h-10 rounded-lg bg-white border border-slate-300 font-black text-slate-700 hover:bg-slate-100 flex items-center justify-center text-lg active:scale-95 shadow-xs"
              >
                -
              </button>
              <input
                type="number"
                inputMode="decimal"
                value={targetMilk || ''}
                onChange={(e) => setTargetMilk(parseFloat(e.target.value) || 0)}
                className="flex-1 h-10 text-center font-black text-xl text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setTargetMilk(m => m + 1)}
                className="w-10 h-10 rounded-lg bg-white border border-slate-300 font-black text-slate-700 hover:bg-slate-100 flex items-center justify-center text-lg active:scale-95 shadow-xs"
              >
                +
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Hedef için gereken protein: <strong>{Math.round(results.maintenanceProteinGrams + (targetMilk * (settings.proteinPerLiter || 90)))} g HP</strong>
            </p>
          </div>
        </div>
      </div>

      {/* FEED SELECTION TABS & LIMIT INFO BANNER */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('tum')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'tum'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tüm Yemler ({feeds.length})
            </button>
            <button
              onClick={() => setActiveTab('kaba')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'kaba'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              <span>Kaba Yemler ({kabaFeeds.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('kesif')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'kesif'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              <span>Kesif Yemler ({kesifFeeds.length})</span>
            </button>
          </div>

          <span className="text-xs font-semibold text-slate-500">
            2. Adım: Günlük verilecek taze miktarları (kg) girin
          </span>
        </div>

        {/* Global Limit Warnings Banner (if any feed is exceeded) */}
        {results.limitWarnings.length > 0 && (
          <div className="p-3.5 bg-amber-50 border-l-4 border-amber-500 rounded-r-2xl text-amber-950 text-xs flex items-start space-x-2.5 shadow-xs">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">
                {results.limitWarnings.length} yem maddesinde önerilen güvenli üst sınır aşıldı!
              </p>
              <p className="text-amber-800/90 text-[11px] mt-0.5">
                Biyolojik ve sindirim dengesini korumak için aşağıdaki yem kartlarındaki sarı uyarıları inceleyip miktarları revize edebilirsiniz.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 1: KABA YEMLER */}
      {(activeTab === 'tum' || activeTab === 'kaba') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-emerald-950 flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600" />
              <span>Kaba Yemler (Silaj, Yonca, Saman, Ot, Pancar Posası)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {kabaFeeds.map(feed => (
              <FeedCard
                key={feed.id}
                feed={feed}
                amount={feedAmounts[feed.id] || 0}
                onAmountChange={(val) => handleAmountChange(feed.id, val)}
                onAdjust={(delta) => adjustAmount(feed.id, delta)}
              />
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: KESİF YEMLER */}
      {(activeTab === 'tum' || activeTab === 'kesif') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-amber-950 flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-600" />
              <span>Kesif Yemler (Fabrika Yemi, Hububat, Küspe, Kepek)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {kesifFeeds.map(feed => (
              <FeedCard
                key={feed.id}
                feed={feed}
                amount={feedAmounts[feed.id] || 0}
                onAmountChange={(val) => handleAmountChange(feed.id, val)}
                onAdjust={(delta) => adjustAmount(feed.id, delta)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ACTION BAR: "HESAPLA & RAPOR OLUŞTUR" BUTTON */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border-2 border-emerald-500 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0 font-black">
            {itemsForCalc.length}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              {itemsForCalc.length > 0 ? `${itemsForCalc.length} çeşit yem seçildi` : 'Henüz yem seçilmedi'}
            </p>
            <p className="text-[11px] text-slate-500">
              Toplam Taze Yem: <strong>{results.totalFreshKg.toFixed(1)} kg</strong> | KM:{' '}
              <strong className={
                results.dryMatterStatus === 'CRITICAL_HIGH' || results.dryMatterStatus === 'CRITICAL_LOW'
                  ? 'text-rose-600 font-black'
                  : results.dryMatterStatus === 'SLIGHT_HIGH' || results.dryMatterStatus === 'SLIGHT_LOW'
                  ? 'text-amber-600 font-black'
                  : 'text-emerald-700 font-black'
              }>
                {results.totalDryMatterKg.toFixed(1)} kg
              </strong>
              {' '}(Hedef: {results.targetDryMatterKg.toFixed(1)} kg
              {results.dryMatterDiffPercent !== 0 && (
                <span className={`ml-1 font-bold ${
                  results.dryMatterStatus === 'CRITICAL_HIGH' || results.dryMatterStatus === 'CRITICAL_LOW'
                    ? 'text-rose-600'
                    : results.dryMatterStatus === 'SLIGHT_HIGH' || results.dryMatterStatus === 'SLIGHT_LOW'
                    ? 'text-amber-600'
                    : 'text-emerald-700'
                }`}>
                  {results.dryMatterDiffPercent > 0 ? `+${results.dryMatterDiffPercent}%` : `${results.dryMatterDiffPercent}%`}
                </span>
              )})
            </p>
          </div>
        </div>

        <button
          onClick={handleCalculateReport}
          className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-700/25 active:scale-95 transition-all flex items-center justify-center space-x-2"
        >
          <Calculator className="w-5 h-5" />
          <span>Rasyonu Hesapla & Rapor Oluştur</span>
        </button>
      </div>

      {/* DETAYLI RASYON RAPORU BÖLÜMÜ */}
      {showReport && (
        <div id="rasyon-raporu" className="space-y-6 pt-6 border-t-2 border-emerald-500/30 animate-in fade-in zoom-in-95">
          {/* Rapor Header */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md shrink-0">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Rasyon Analiz & Uygunluk Raporu
                    </h2>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md">
                      ONAYLI
                    </span>
                    {selectedLactationGroup && (
                      <span className="px-2 py-0.5 bg-slate-900 text-emerald-400 text-[10px] font-bold rounded-md hidden sm:inline-block">
                        {LACTATION_GROUPS.find(g => g.id === selectedLactationGroup)?.name} • {LACTATION_GROUPS.find(g => g.id === selectedLactationGroup)?.dim}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 flex items-center space-x-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Oluşturulma: {reportTimestamp || 'Bugün'}</span>
                  </p>
                </div>
              </div>

              {/* Yazdır Butonları */}
              <div className="flex items-center space-x-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handlePrintMixerRecipe}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center space-x-1.5 shadow-sm transition-all active:scale-95"
                  title="A4 Mikser Yükleme ve Operatör Tartım Reçetesini Yazdır"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Mikser Reçetesi (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintRationReport}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs active:scale-95"
                  title="A4 Rasyon Analiz Raporunu Yazdır / PDF Çıkar"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>Rasyon Raporu (PDF)</span>
                </button>
              </div>
            </div>

            {/* Rapor Metrik Kartları */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* 1L Süt Yem Maliyeti */}
              <div className="bg-gradient-to-br from-emerald-700 to-teal-900 text-white p-4 sm:p-5 rounded-2xl shadow-md">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200 block">
                  1 Litre Süt Yem Maliyeti
                </span>
                <div className="mt-2 flex items-baseline space-x-1">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight">
                    {results.feedCostPerLiter.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-emerald-200">TL / Litre</span>
                </div>
                <p className="text-[11px] text-emerald-100/80 mt-1">
                  Hedef {targetMilk} L süt üzerinden
                </p>
              </div>

              {/* Günlük İnek Başı Yem Tutarı */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Günlük Yem Masrafı
                </span>
                <div className="mt-2 flex items-baseline space-x-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {results.dailyFeedCostPerCow.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-slate-500">TL / baş / gün</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {results.totalFreshKg.toFixed(1)} kg taze karma
                </p>
              </div>

              {/* Tahmini Süt Potansiyeli */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Tahmini Süt Potansiyeli
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="mt-2 flex items-baseline space-x-1">
                  <span className="text-3xl sm:text-4xl font-black text-blue-600 tracking-tight">
                    {results.potentialMilkLiters.toFixed(1)}
                  </span>
                  <span className="text-xs font-bold text-slate-500">Litre / gün</span>
                </div>
                <p className="text-[11px] font-bold mt-1">
                  {results.milkDeficitOrSurplus >= 0 ? (
                    <span className="text-emerald-700">Hedefin +{results.milkDeficitOrSurplus.toFixed(1)} L üzerinde</span>
                  ) : (
                    <span className="text-rose-700">Hedefin {Math.abs(results.milkDeficitOrSurplus).toFixed(1)} L altında</span>
                  )}
                </p>
              </div>

              {/* Kaba Yem & Asidoz Durumu */}
              <div className={`p-4 sm:p-5 rounded-2xl border ${
                results.roughageStatus === 'CRITICAL_ACIDOSIS'
                  ? 'bg-rose-50 border-rose-300 text-rose-950'
                  : results.roughageStatus === 'WARNING_LOW'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-950'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                    Kaba Yem Oranı
                  </span>
                  {results.roughageStatus === 'CRITICAL_ACIDOSIS' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div className="mt-2 flex items-baseline space-x-1">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight">
                    %{results.roughagePercentage.toFixed(0)}
                  </span>
                  <span className="text-xs font-bold opacity-75">
                    (Kesif: %{results.concentratePercentage.toFixed(0)})
                  </span>
                </div>
                <p className="text-[11px] font-bold mt-1 line-clamp-1">
                  {results.roughageStatus === 'CRITICAL_ACIDOSIS' ? 'Asidoz Riski! Lif Az' :
                   results.roughageStatus === 'WARNING_LOW' ? 'Kaba Yem Sınırda' : 'İdeal Rumen Dengesi'}
                </p>
              </div>
            </div>

            {/* Zooteknik Biyolojik Parametreler Çubuğu */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 block text-[11px]">Kuru Madde Tüketimi</span>
                  {results.dryMatterStatus === 'CRITICAL_HIGH' ? (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-500/25 text-rose-300 border border-rose-500/40">
                      +% {results.dryMatterDiffPercent} AŞIRI
                    </span>
                  ) : results.dryMatterStatus === 'SLIGHT_HIGH' ? (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/25 text-amber-300 border border-amber-500/40">
                      +% {results.dryMatterDiffPercent} SINIRDA
                    </span>
                  ) : results.dryMatterStatus === 'CRITICAL_LOW' ? (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-500/25 text-rose-300 border border-rose-500/40">
                      % {results.dryMatterDiffPercent} EKSİK
                    </span>
                  ) : results.dryMatterStatus === 'SLIGHT_LOW' ? (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/25 text-amber-300 border border-amber-500/40">
                      % {results.dryMatterDiffPercent} AZ
                    </span>
                  ) : (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/25 text-emerald-300 border border-emerald-500/40">
                      DENGELİ
                    </span>
                  )}
                </div>
                <strong className={`text-base font-black mt-1 block ${
                  results.dryMatterStatus === 'CRITICAL_HIGH' || results.dryMatterStatus === 'CRITICAL_LOW'
                    ? 'text-rose-400'
                    : results.dryMatterStatus === 'SLIGHT_HIGH' || results.dryMatterStatus === 'SLIGHT_LOW'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}>
                  {results.totalDryMatterKg} kg
                </strong>
                <span className="text-slate-400 text-[10px] block">Hedef: {results.targetDryMatterKg} kg</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-slate-400 block text-[11px]">Rasyon Ham Proteini</span>
                <strong className="text-emerald-400 text-base font-black mt-1 block">%{results.proteinPercentageOfRation}</strong>
                <span className="text-slate-400 text-[10px] block">{results.totalProteinGrams} g HP</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 block text-[11px]">Nişasta Seviyesi</span>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                    results.starchStatus === 'HIGH' ? 'bg-rose-500/25 text-rose-300' : 'bg-emerald-500/25 text-emerald-300'
                  }`}>
                    {results.starchStatus === 'IDEAL' ? 'GÜVENLİ' : 'YÜKSEK'}
                  </span>
                </div>
                <strong className={`text-base font-black mt-1 block ${results.starchStatus === 'HIGH' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  %{results.starchPercentageOfRation}
                </strong>
                <span className="text-slate-400 text-[10px] block">Güvenli Eşik: %22-28</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-slate-400 block text-[11px]">Kaba Yem Kuru Maddesi</span>
                <strong className="text-emerald-400 text-base font-black mt-1 block">{results.roughageDryMatterKg} kg</strong>
                <span className="text-slate-400 text-[10px] block">Min: {results.minRoughageDryMatterKg} kg</span>
              </div>
            </div>

            {/* Kuru Madde Kapasite & Yem Bozulma/Kokuşma Tolerans Denetim Kartı */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              results.dryMatterStatus === 'CRITICAL_HIGH' || results.dryMatterStatus === 'CRITICAL_LOW'
                ? 'bg-rose-50 border-rose-300 text-rose-950 shadow-xs'
                : results.dryMatterStatus === 'SLIGHT_HIGH' || results.dryMatterStatus === 'SLIGHT_LOW'
                ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-xs'
                : 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
            }`}>
              <div className="flex items-start space-x-3">
                {results.dryMatterStatus === 'CRITICAL_HIGH' || results.dryMatterStatus === 'CRITICAL_LOW' ? (
                  <div className="w-10 h-10 rounded-xl bg-rose-200/80 flex items-center justify-center shrink-0 text-rose-700 font-black">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                ) : results.dryMatterStatus === 'SLIGHT_HIGH' || results.dryMatterStatus === 'SLIGHT_LOW' ? (
                  <div className="w-10 h-10 rounded-xl bg-amber-200/80 flex items-center justify-center shrink-0 text-amber-700 font-black">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-emerald-200/80 flex items-center justify-center shrink-0 text-emerald-700 font-black">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <h4 className="text-xs sm:text-sm font-black uppercase tracking-tight">
                      {results.dryMatterStatus === 'CRITICAL_HIGH'
                        ? `AŞIRI KURU MADDE: YEMLİKTE ARTIK, KOKUŞMA VE SİNDİRİM BOZUKLUĞU RİSKİ (+%${results.dryMatterDiffPercent})`
                        : results.dryMatterStatus === 'CRITICAL_LOW'
                        ? `YETERSİZ KURU MADDE: YEM ERKEN BİTMESİ, AÇLIK STRESİ VE VERİM KAYBI (-%${Math.abs(results.dryMatterDiffPercent)})`
                        : results.dryMatterStatus === 'SLIGHT_HIGH'
                        ? `KURU MADDE KAPASİTE SINIRINDA (+%${results.dryMatterDiffPercent})`
                        : results.dryMatterStatus === 'SLIGHT_LOW'
                        ? `KURU MADDE HAFİF YETERSİZ (-%${Math.abs(results.dryMatterDiffPercent)})`
                        : 'KURU MADDE TÜKETİM DENGESİ: İDEAL VE GÜVENLİ (±%7 TOLERANS)'}
                    </h4>
                    <span className="text-[11px] font-bold opacity-75">
                      Hedef: {results.targetDryMatterKg} kg | Hesaplanan: {results.totalDryMatterKg} kg
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    {results.dryMatterStatusMessage}
                  </p>
                </div>
              </div>
            </div>

            {/* Limit ve Güvenlik Denetimi Kutusu */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Yem Tüketim Güvenlik & Üst Sınır Denetimi</span>
              </h3>

              {results.limitWarnings.length > 0 ? (
                <div className="space-y-2">
                  {results.limitWarnings.map((warn, i) => (
                    <div key={i} className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">{warn.feedName}: {warn.freshAmount} kg verildi (Önerilen Azami Sınır: {warn.maxLimitKg} kg)</strong>
                        <p className="text-[11px] text-rose-800 mt-0.5">{warn.warningNote}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">
                    Tebrikler! Rasyondaki tüm yem maddeleri önerilen güvenli fizyolojik ve zooteknik sınırlar içerisindedir.
                  </span>
                </div>
              )}
            </div>

            {/* Rasyondaki Yem Maddeleri Tablosu */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Rasyon Reçetesi & Yem Dökümü
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Yem Adı</th>
                      <th className="p-3">Sınıf</th>
                      <th className="p-3 text-right">Taze Miktar</th>
                      <th className="p-3 text-right">Kuru Madde</th>
                      <th className="p-3 text-right">Ham Protein</th>
                      <th className="p-3 text-right">Nişasta</th>
                      <th className="p-3 text-right">Tutar (TL)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {itemsForCalc.map(item => {
                      const feed = feeds.find(f => f.id === item.feedId);
                      if (!feed) return null;
                      const dmKg = item.freshAmount * (feed.dryMatter / 100);
                      const prG = dmKg * (feed.protein / 100) * 1000;
                      const stG = dmKg * (feed.starch / 100) * 1000;
                      const cost = item.freshAmount * feed.unitPrice;

                      return (
                        <tr key={item.feedId} className="hover:bg-slate-50/70">
                          <td className="p-3 font-bold text-slate-900">{feed.name}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              feed.type === 'KABA' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {feed.type === 'KABA' ? 'Kaba' : 'Kesif'}
                            </span>
                          </td>
                          <td className="p-3 text-right font-black text-slate-900">{item.freshAmount} kg</td>
                          <td className="p-3 text-right text-slate-600">{dmKg.toFixed(2)} kg</td>
                          <td className="p-3 text-right text-emerald-700 font-bold">{Math.round(prG)} g</td>
                          <td className="p-3 text-right text-amber-700 font-bold">{Math.round(stG)} g</td>
                          <td className="p-3 text-right font-black text-slate-900">{cost.toFixed(2)} TL</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-100/80 font-black text-slate-900 border-t border-slate-200">
                    <tr>
                      <td colSpan={2} className="p-3">TOPLAM GÜNLÜK RASYON</td>
                      <td className="p-3 text-right">{results.totalFreshKg.toFixed(1)} kg</td>
                      <td className="p-3 text-right">{results.totalDryMatterKg.toFixed(2)} kg</td>
                      <td className="p-3 text-right text-emerald-800">{results.totalProteinGrams} g</td>
                      <td className="p-3 text-right text-amber-800">{results.totalStarchGrams} g</td>
                      <td className="p-3 text-right text-emerald-800 text-sm">{results.dailyFeedCostPerCow.toFixed(2)} TL</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* SÜRÜ VE MİKSER KARMA BÖLÜMÜ */}
            <div id="suru-karma-recetesi" className="pt-6 border-t-2 border-slate-200/90 space-y-5">
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-5 sm:p-6 rounded-3xl shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center space-x-2">
                        <span>Sürü Yem Karma & Mikser Dağıtım Hesabı</span>
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-md border border-emerald-500/30">
                          ÖĞÜNLÜK TARTIM
                        </span>
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Toplam sağmal hayvan sayısını ve günde kaç öğün besleme yaptığınızı girin; vagon/mikser hazırlama tartım listeniz anında hesaplansın.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handlePrintMixerRecipe}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 self-start sm:self-auto shrink-0 print-include active:scale-95"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Mikser Reçetesini PDF Çıkar / Yazdır</span>
                  </button>
                </div>

                {/* Sürü Parametre Girdi Butonları */}
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Toplam Hayvan Sayısı */}
                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-300 uppercase flex items-center space-x-1.5">
                        <Users className="w-4 h-4 text-emerald-400" />
                        <span>Toplam Hayvan Sayısı (Baş)</span>
                      </label>
                      <span className="text-[11px] text-emerald-400 font-bold">Sağmal Sürü</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setAnimalCount(c => Math.max(1, c - 5))}
                        className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 font-black text-white flex items-center justify-center text-sm active:scale-95"
                      >
                        -5
                      </button>
                      <button
                        type="button"
                        onClick={() => setAnimalCount(c => Math.max(1, c - 1))}
                        className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 font-black text-white flex items-center justify-center text-lg active:scale-95"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={animalCount || ''}
                        onChange={(e) => setAnimalCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="flex-1 h-10 text-center font-black text-xl text-white bg-slate-900 border border-slate-600 rounded-xl focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setAnimalCount(c => c + 1)}
                        className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 font-black text-white flex items-center justify-center text-lg active:scale-95"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => setAnimalCount(c => c + 5)}
                        className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 font-black text-white flex items-center justify-center text-sm active:scale-95"
                      >
                        +5
                      </button>
                    </div>

                    {/* Hızlı Seçim Rozetleri */}
                    <div className="mt-2.5 flex items-center space-x-1.5 overflow-x-auto">
                      <span className="text-[10px] text-slate-400 mr-1">Hızlı:</span>
                      {[10, 20, 30, 50, 75, 100].map(cnt => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setAnimalCount(cnt)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                            animalCount === cnt
                              ? 'bg-emerald-500 text-slate-950 font-black'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {cnt} Baş
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Öğün Sayısı */}
                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-300 uppercase flex items-center space-x-1.5">
                        <Layers className="w-4 h-4 text-emerald-400" />
                        <span>Günlük Öğün Sayısı</span>
                      </label>
                      <span className="text-[11px] text-emerald-400 font-bold">Karma Frekansı</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { count: 1, label: '1 Öğün', sub: 'Tek Seferlik' },
                        { count: 2, label: '2 Öğün', sub: 'Sabah - Akşam' },
                        { count: 3, label: '3 Öğün', sub: 'Sabah-Öğle-Akşam' },
                      ].map(opt => (
                        <button
                          key={opt.count}
                          type="button"
                          onClick={() => setMealCount(opt.count)}
                          className={`p-2 rounded-xl border text-center transition-all ${
                            mealCount === opt.count
                              ? 'bg-emerald-600 text-white border-emerald-400 shadow-md font-black'
                              : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          <span className="text-xs font-bold block">{opt.label}</span>
                          <span className="text-[10px] opacity-80 block">{opt.sub}</span>
                        </button>
                      ))}
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2.5">
                      Toplam günlük yem <strong>{safeMealCount} eşit öğüne</strong> bölünerek tek seferlik mikser yükleme miktarı bulunur.
                    </p>
                  </div>
                </div>

                {/* Sürü Özet Göstergeleri */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-slate-800 text-xs">
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-emerald-500/40">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase block">1 ÖĞÜN MİKSER KARMASI</span>
                    <strong className="text-xl sm:text-2xl font-black text-white block mt-0.5">
                      {herdMetrics.mealMixerFreshKg.toFixed(1)} <span className="text-xs font-normal text-emerald-300">kg/öğün</span>
                    </strong>
                    <span className="text-[10px] text-slate-400">{safeAnimalCount} baş için tek tartım</span>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">GÜNLÜK TOPLAM TÜKETİM</span>
                    <strong className="text-xl sm:text-2xl font-black text-white block mt-0.5">
                      {herdMetrics.dailyHerdFreshKg.toFixed(1)} <span className="text-xs font-normal text-slate-400">kg/gün</span>
                    </strong>
                    <span className="text-[10px] text-slate-400">24 saatlik toplam yem</span>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">1 ÖĞÜN MİKSER TARTIMI</span>
                    <strong className="text-xl sm:text-2xl font-black text-emerald-400 block mt-0.5">
                      {herdMetrics.mealMixerFreshKg.toFixed(1)} <span className="text-xs font-normal text-slate-400">kg/öğün</span>
                    </strong>
                    <span className="text-[10px] text-slate-400">1 vagon yükleme hedefi</span>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">1 İNEK GÜNLÜK TMR PAYI</span>
                    <strong className="text-xl sm:text-2xl font-black text-emerald-300 block mt-0.5">
                      {results.totalFreshKg.toFixed(1)} <span className="text-xs font-normal text-slate-400">kg/inek</span>
                    </strong>
                    <span className="text-[10px] text-slate-400">Öğün başı {(results.totalFreshKg / safeMealCount).toFixed(2)} kg</span>
                  </div>
                </div>
              </div>

              {/* MİKSER TARTIM & DAĞITIM REÇETESİ TABLOSU */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>Mikser Tartım Çizelgesi ({safeAnimalCount} Baş - Günde {safeMealCount} Öğün)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Operatör Tartım Sırası: Kuru Kaba Yemler → Silaj & Posalar → Kesif & Tahıllar
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-black border-b border-slate-200 uppercase text-[11px]">
                      <tr>
                        <th className="p-3 text-center w-10">Sıra</th>
                        <th className="p-3">Yükleme Aşaması & Yem</th>
                        <th className="p-3 text-right">1 İnek / Öğün</th>
                        <th className="p-3 text-right bg-emerald-100 text-emerald-950 font-black border-x border-emerald-200">
                          ⭐ MİKSERE ATILACAK (1 ÖĞÜN)
                        </th>
                        <th className="p-3 text-right bg-slate-200 text-slate-900 font-black">
                          ⚖️ TERAZİ HEDEFİ (KÜMÜLATİF)
                        </th>
                        <th className="p-3 text-right">SÜRÜ GÜNLÜK TOPLAM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {herdMetrics.sortedWithCumulative.map((item) => (
                        <tr key={item.feedId} className="hover:bg-slate-50">
                          <td className="p-3 text-center font-black text-slate-500">
                            #{item.orderIndex}
                          </td>
                          <td className="p-3 font-bold text-slate-900">
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-emerald-800 font-bold block">
                                {item.stageName}
                              </span>
                              <div className="flex items-center space-x-2">
                                <span>{item.feedName}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  item.feedType === 'KABA' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                  {item.feedType === 'KABA' ? 'Kaba' : 'Kesif'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div className="font-bold text-slate-800 text-sm">{item.perCowMeal.toFixed(2)} kg</div>
                            <div className="text-[10px] text-slate-400 font-normal">Günlük: {item.perCowDaily.toFixed(1)} kg</div>
                          </td>
                          <td className="p-3 text-right bg-emerald-50/80 text-emerald-950 font-black text-sm border-x border-emerald-200">
                            {item.herdMeal.toFixed(1)} kg
                          </td>
                          <td className="p-3 text-right bg-slate-100 text-slate-950 font-black text-sm">
                            {item.cumulativeScaleKg.toFixed(1)} kg
                          </td>
                          <td className="p-3 text-right font-black text-slate-900 text-sm">{item.herdDaily.toFixed(1)} kg</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                      <tr>
                        <td colSpan={2} className="p-3 uppercase">TOPLAM MİKSER KARMASI</td>
                        <td className="p-3 text-right">
                          <div className="font-black text-slate-900 text-sm">{(results.totalFreshKg / safeMealCount).toFixed(2)} kg</div>
                          <div className="text-[10px] text-slate-500 font-normal">Günlük: {results.totalFreshKg.toFixed(1)} kg</div>
                        </td>
                        <td className="p-3 text-right bg-emerald-200/90 text-emerald-950 font-black text-base border-x border-emerald-300">
                          {herdMetrics.mealMixerFreshKg.toFixed(1)} kg
                        </td>
                        <td className="p-3 text-right bg-slate-200 text-slate-950 font-black text-base">
                          {herdMetrics.mealMixerFreshKg.toFixed(1)} kg
                        </td>
                        <td className="p-3 text-right text-slate-950 font-black text-sm">{herdMetrics.dailyHerdFreshKg.toFixed(1)} kg</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px] leading-relaxed flex items-start space-x-2">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Karma ve Dağıtım Notu:</strong> Homojen bir TMR (Tam Karma Rasyon) için önce kuru ot ve samanları miksere atıp 3-5 dakika kıyın, ardından silaj ve sulu küspeleri ekleyin, son aşamada fabrika süt yemi ve tahıl kırmalarını ekleyip 5-7 dakika karıştırarak yemliğe dağıtın.
                  </span>
                </div>
              </div>
            </div>

            {/* RASYONU TARİH DAMGASIYLA KAYDETME BÖLÜMÜ */}
            <div className="pt-4 border-t border-slate-100 bg-slate-50 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:flex-1 space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase block">
                  Rasyon Başlığı / Not (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  placeholder="örn: Ekim 2026 Sağmal Rasyonu veya Yonca + Silaj Karması"
                  value={rationTitle}
                  onChange={(e) => setRationTitle(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 text-xs sm:text-sm focus:border-emerald-500"
                />
              </div>

              <button
                onClick={handleSaveRation}
                disabled={saving}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 shrink-0 ${
                  saveSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Tarih Damgasıyla Kaydedildi!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{saving ? 'Kaydediliyor...' : 'Sonucu & Rasyonu Kaydet'}</span>
                  </>
                )}
              </button>
            </div>

            {saveSuccess && saveMessage && (
              <p className="text-xs font-bold text-emerald-700 text-center animate-in fade-in">
                {saveMessage}
              </p>
            )}
          </div>
        </div>
      )}

      {/* MODAL: GEÇMİŞ KAYITLI RASYONLAR LİSTESİ */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <History className="w-6 h-6 text-emerald-600" />
                <div>
                  <h2 className="text-lg font-black text-slate-900">Kayıtlı Rasyonlar Arşivi</h2>
                  <p className="text-xs text-slate-500">Tarih damgalı olarak kaydedilmiş rasyonlarınız</p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 py-4 space-y-3">
              {savedRations.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  Henüz kaydedilmiş bir rasyon bulunmuyor.
                </div>
              ) : (
                savedRations.map((ration) => {
                  const isCurrentActive = ration.id === activeRationId;
                  const dateStr = ration.createdAt
                    ? new Date(ration.createdAt).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Kayıtlı';

                  return (
                    <div
                      key={ration.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCurrentActive
                          ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-slate-900 text-sm">{ration.title}</h3>
                          {isCurrentActive && (
                            <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                              AKTİF RASYON
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 flex items-center space-x-2">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{dateStr}</span>
                          </span>
                          <span>•</span>
                          <span>Hedef: {ration.targetMilk || 25} L Süt</span>
                          <span>•</span>
                          <span>Canlı Ağırlık: {ration.liveWeight || 600} kg</span>
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {ration.items?.length || 0} çeşit yem maddesi
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                        <button
                          onClick={() => handleLoadSavedRation(ration)}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                        >
                          Rasyona Yükle & Görüntüle
                        </button>

                        {!isCurrentActive && (
                          <button
                            onClick={() => handleSetActive(ration.id)}
                            title="Aktif Rasyon Olarak Belirle"
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteRation(ration.id, ration.title)}
                          title="Sil"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirm Modal */}
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
      {/* A4 YAZDIRILABİLİR MİKSER YEM KARMA & DAĞITIM REÇETESİ         */}
      {/* SADECE YAZDIRILIRKEN GÖRÜNÜR, TÜM WEB ARAYÜZÜ GİZLENİR        */}
      {/* ============================================================== */}
      <div id="printable-mixer-recipe" lang="tr" dir="ltr" className="hidden">
        <div className="bg-white text-slate-900 p-2 sm:p-4 text-xs font-sans space-y-3">
          {/* Çiftlik & Sistem Anteti */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
            <div className="flex items-center space-x-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon-192.png" alt="MilkIQ Logo" className="w-14 h-14 object-contain" />
              <div>
                <h1 className="text-xl font-black text-slate-950 uppercase tracking-tight">
                  {(settings.farmName ? settings.farmName : 'MilkIQ Süt Sığırcılığı İşletmesi')}
                </h1>
                <p className="text-xs font-black text-emerald-800 tracking-wide uppercase">
                  TMR MİKSER YEM KARMA & OPERATÖR TARTIM REÇETESİ
                </p>
                <p className="text-[10px] text-slate-600 font-semibold">
                  Günlük Sürü Besleme & Vagon Yükleme Emri
                </p>
              </div>
            </div>

            <div className="text-right text-[11px] text-slate-700 space-y-0.5 border-l border-slate-300 pl-4">
              <div><strong className="text-slate-900">Tarih:</strong> {new Date().toLocaleDateString('tr-TR')}</div>
              <div><strong className="text-slate-900">Saat:</strong> {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">
                Reçete No: TMR-{new Date().getFullYear()}{String(new Date().getMonth()+1).padStart(2,'0')}{String(new Date().getDate()).padStart(2,'0')}-{safeAnimalCount}B
              </div>
            </div>
          </div>

          {/* Rasyon & Sürü Temel Parametre Göstergeleri */}
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl border border-slate-300 bg-slate-50/80">
              <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Rasyon Grubu</span>
              <strong className="text-slate-900 text-sm block truncate">
                {rationTitle || 'Sağmal Sürü Rasyonu'}
              </strong>
              <span className="text-[10px] text-slate-600 font-medium">Hedef: {targetMilk} L | {liveWeight} kg CA</span>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-300 bg-slate-50/80">
              <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Sağmal Hayvan</span>
              <strong className="text-slate-900 text-base font-black block">
                {safeAnimalCount} Baş İnek
              </strong>
              <span className="text-[10px] text-slate-600 font-medium">Aktif sağmal sürü</span>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-300 bg-slate-50/80">
              <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Karma Frekansı</span>
              <strong className="text-slate-900 text-sm font-black block">
                {safeMealCount} Eşit Öğün / Gün
              </strong>
              <span className="text-[10px] text-slate-600 font-medium">
                {safeMealCount === 1 ? 'Günde tek sefer' : safeMealCount === 2 ? 'Sabah - Akşam' : 'Sabah - Öğle - Akşam'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl border-2 border-emerald-700 bg-emerald-50 text-emerald-950">
              <span className="text-[9px] text-emerald-800 font-black block uppercase tracking-wider">1 ÖĞÜN MİKSER TARTIMI</span>
              <strong className="text-emerald-950 text-lg font-black block">
                {herdMetrics.mealMixerFreshKg.toFixed(1)} kg
              </strong>
              <span className="text-[10px] text-emerald-800 font-bold">1 vagon yükleme hedefi</span>
            </div>
          </div>

          {/* Mikser Operatörü Sıralı Tartım Tablosu */}
          <div className="border border-slate-400 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 flex items-center justify-between text-[11px]">
              <strong className="text-slate-900 font-black uppercase tracking-wider">
                Vagon Tartım & Yükleme Çizelgesi ({safeAnimalCount} Baş | {safeMealCount} Öğün)
              </strong>
              <span className="text-slate-600 font-bold text-[10px]">
                Operatör Kuralı: Kuru Kaba → Sulu Kaba → Fabrika & Hububat
              </span>
            </div>

            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-200 text-slate-950 text-[10px] font-black uppercase border-b border-slate-400">
                  <th className="p-2 text-center w-8 border-r border-slate-300">Sıra</th>
                  <th className="p-2 border-r border-slate-300">Yükleme Aşaması</th>
                  <th className="p-2 border-r border-slate-300">Yem Maddesi</th>
                  <th className="p-2 text-right border-r border-slate-300">1 İnek / Öğün</th>
                  <th className="p-2 text-right bg-emerald-200 text-emerald-950 font-black text-xs border-r-2 border-emerald-500">
                    MİKSERE ATILACAK (1 ÖĞÜN)
                  </th>
                  <th className="p-2 text-right bg-slate-300 text-slate-950 font-black text-xs border-r border-slate-400">
                    TERAZİ HEDEFİ (KÜMÜLATİF)
                  </th>
                  <th className="p-2 text-right">SÜRÜ GÜNLÜK TOPLAM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {herdMetrics.sortedWithCumulative.map((item) => (
                  <tr key={item.feedId} className="even:bg-slate-50/70">
                    <td className="p-2 text-center font-black text-slate-800 border-r border-slate-300">
                      #{item.orderIndex}
                    </td>
                    <td className="p-2 font-bold text-emerald-900 text-[11px] border-r border-slate-300 whitespace-nowrap">
                      {item.stageName}
                    </td>
                    <td className="p-2 font-black text-slate-950 border-r border-slate-300">
                      <span>{item.feedName}</span>
                    </td>
                    <td className="p-2 text-right font-medium text-slate-800 border-r border-slate-300">
                      <span className="font-bold">{item.perCowMeal.toFixed(2)} kg</span>
                      <span className="block text-[9px] text-slate-500 font-normal">Günlük: {item.perCowDaily.toFixed(1)} kg</span>
                    </td>
                    <td className="p-2 text-right bg-emerald-50 text-emerald-950 font-black text-sm border-r-2 border-emerald-400">
                      {item.herdMeal.toFixed(1)} kg
                    </td>
                    <td className="p-2 text-right bg-slate-100 text-slate-950 font-black text-sm border-r border-slate-300">
                      {item.cumulativeScaleKg.toFixed(1)} kg
                    </td>
                    <td className="p-2 text-right font-black text-slate-900 text-xs">
                      {item.herdDaily.toFixed(1)} kg
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-200 font-black text-slate-950 border-t-2 border-slate-400">
                <tr>
                  <td colSpan={3} className="p-2.5 text-slate-950 uppercase tracking-wider text-xs border-r border-slate-300">
                    TOPLAM MİKSER KARMASI (1 VAGON)
                  </td>
                  <td className="p-2.5 text-right border-r border-slate-300">
                    <span className="font-black">{(results.totalFreshKg / safeMealCount).toFixed(2)} kg</span>
                    <span className="block text-[9px] text-slate-600 font-normal">Günlük: {results.totalFreshKg.toFixed(1)} kg</span>
                  </td>
                  <td className="p-2.5 text-right bg-emerald-300 text-emerald-950 font-black text-base border-r-2 border-emerald-500">
                    {herdMetrics.mealMixerFreshKg.toFixed(1)} kg
                  </td>
                  <td className="p-2.5 text-right bg-slate-300 text-slate-950 font-black text-base border-r border-slate-400">
                    {herdMetrics.mealMixerFreshKg.toFixed(1)} kg
                  </td>
                  <td className="p-2.5 text-right font-black text-sm">
                    {herdMetrics.dailyHerdFreshKg.toFixed(1)} kg
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Operatör TMR Yükleme ve Karıştırma Talimatı */}
          <div className="p-3 rounded-xl border border-slate-300 bg-slate-50 text-[10px] text-slate-800 leading-normal space-y-1">
            <strong className="text-slate-950 block font-black text-[11px] uppercase tracking-wider">
              TMR MİKSER OPERATÖRÜ YÜKLEME VE KARIŞTIRMA KURALLARI:
            </strong>
            <p>
              <strong>1. Kuru Kaba Yemler (Yonca / Saman / Kuru Ot):</strong> Miksere ilk sırada yüklenir. Partikül uzunluğu 3-5 cm oluncaya kadar 3-5 dakika kıyıcı bıçaklar devrede çalıştırılır.
            </p>
            <p>
              <strong>2. Sulu Kaba Yemler (Mısır Silajı / Yaş Pancar Posası):</strong> İkinci aşamada eklenir. Kuru kaba yemin yüzeyini nemlendirerek yemlikte seçilmeyi (sorting) ve tozlaşmayı önler.
            </p>
            <p>
              <strong>3. Fabrika Süt Yemi & Hububat Kırmaları:</strong> En son aşamada miksere dökülür. Aşırı karıştırmaktan kaçının (en fazla 5-7 dakika karıştırın); fazla karıştırma yapısal lifi un eder, asidoz ve süt yağı düşüşüne yol açar.
            </p>
            <p>
              <strong>4. Yem Dağıtımı:</strong> Yem yoluna homojen yükseklikte dökülmeli, tüm hayvanların eşit miktarda rasyona ulaşması sağlanmalıdır.
            </p>
          </div>

          <div className="pt-2 text-center text-[9px] text-slate-500 font-medium border-t border-slate-200">
            MilkIQ Akıllı Süt, Rasyon & Maliyet Sistemi tarafından otomatik üretilmiştir.
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* A4 YAZDIRILABİLİR RASYON ANALİZ & ZOOTEKNİK RAPORU             */}
      {/* SADECE YAZDIRILIRKEN GÖRÜNÜR, TÜM WEB ARAYÜZÜ GİZLENİR        */}
      {/* TEK SAYFA (SINGLE-PAGE) FORMATINA TAM OPTİMİZE EDİLMİŞTİR     */}
      {/* ============================================================== */}
      <div id="printable-ration-report" lang="tr" dir="ltr" className="hidden">
        <div className="bg-white text-slate-900 p-1 font-sans space-y-2">
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
                  RASYON ANALİZ & ZOOTEKNİK UYGUNLUK RAPORU
                </p>
                <p className="text-[9px] text-slate-500 font-semibold leading-tight">
                  Besleme Rasyonu Uygunluk, Biyolojik Denge ve Maliyet Değerlendirmesi
                </p>
              </div>
            </div>

            <div className="text-right text-[10px] text-slate-700 space-y-0.5 border-l border-slate-300 pl-3 shrink-0">
              <div><strong className="text-slate-900">Tarih:</strong> {reportTimestamp || new Date().toLocaleDateString('tr-TR')}</div>
              <div className="text-[9px] text-slate-500 font-bold uppercase">
                Rapor No: RAS-{new Date().getFullYear()}{String(new Date().getMonth()+1).padStart(2,'0')}{String(new Date().getDate()).padStart(2,'0')}-{liveWeight}KG
              </div>
              <div className="inline-block px-1.5 py-0.2 bg-emerald-100 text-emerald-900 text-[9px] font-black rounded border border-emerald-300">
                ZOOTEKNİK RAPOR ONAYLANDI
              </div>
            </div>
          </div>

          {/* Rasyon & Verim & Biyolojik Denge Kompakt Göstergeleri (2x4 Grid) */}
          <div className="space-y-1.5">
            {/* Üst Sıra: Verim & Maliyet Hedefleri */}
            <div className="grid grid-cols-4 gap-1.5 text-[10px]">
              <div className="p-1.5 rounded-lg border border-slate-300 bg-slate-50/90">
                <span className="text-[8px] text-slate-500 font-bold block uppercase tracking-wider">Rasyon Grubu</span>
                <strong className="text-slate-900 text-xs block truncate leading-tight">
                  {rationTitle || 'Sağmal Sürü Rasyonu'}
                </strong>
                <span className="text-[9px] text-slate-600 font-medium">Canlı Ağırlık: {liveWeight} kg CA</span>
              </div>

              <div className="p-1.5 rounded-lg border border-slate-300 bg-slate-50/90">
                <span className="text-[8px] text-slate-500 font-bold block uppercase tracking-wider">Hedef & Potansiyel Süt</span>
                <strong className="text-slate-900 text-xs font-black block leading-tight">
                  Hedef: {targetMilk} L | Potansiyel: {results.potentialMilkLiters.toFixed(1)} L
                </strong>
                <span className="text-[9px] font-bold block text-slate-700">
                  {results.milkDeficitOrSurplus >= 0 ? `+${results.milkDeficitOrSurplus.toFixed(1)} L hedef üzeri` : `${results.milkDeficitOrSurplus.toFixed(1)} L hedef altı`}
                </span>
              </div>

              <div className="p-1.5 rounded-lg border border-slate-300 bg-slate-50/90">
                <span className="text-[8px] text-slate-500 font-bold block uppercase tracking-wider">1L Süt Yem Maliyeti</span>
                <strong className="text-emerald-900 text-sm font-black block leading-tight">
                  {results.feedCostPerLiter.toFixed(2)} TL / L
                </strong>
                <span className="text-[9px] text-slate-600 font-medium">Hedef {targetMilk} L süt bazlı</span>
              </div>

              <div className="p-1.5 rounded-lg border border-slate-300 bg-slate-50/90">
                <span className="text-[8px] text-slate-500 font-bold block uppercase tracking-wider">İnek Başı Günlük Yem</span>
                <strong className="text-slate-900 text-sm font-black block leading-tight">
                  {results.dailyFeedCostPerCow.toFixed(2)} TL / gün
                </strong>
                <span className="text-[9px] text-slate-600 font-medium">{results.totalFreshKg.toFixed(1)} kg taze TMR</span>
              </div>
            </div>

            {/* Alt Sıra: Biyolojik & Zooteknik Rumen Dengesi */}
            <div className="grid grid-cols-4 gap-1.5 text-[10px]">
              <div className="p-1.5 bg-slate-50/90 rounded-lg border border-slate-200">
                <span className="text-[8px] text-slate-500 uppercase font-bold block">Kuru Madde Tüketimi (KM)</span>
                <strong className="text-xs font-black text-slate-900 block leading-tight">
                  {results.totalDryMatterKg} kg
                </strong>
                <span className="text-[9px] text-slate-600 block">Hedef: {results.targetDryMatterKg} kg ({results.dryMatterDiffPercent >= 0 ? `+${results.dryMatterDiffPercent}%` : `${results.dryMatterDiffPercent}%`})</span>
              </div>

              <div className="p-1.5 bg-slate-50/90 rounded-lg border border-slate-200">
                <span className="text-[8px] text-slate-500 uppercase font-bold block">Kaba Yem / Lif Dengesi</span>
                <strong className="text-xs font-black text-slate-900 block leading-tight">
                  %{results.roughagePercentage.toFixed(0)} <span className="text-[9px] font-normal text-slate-500">(Kesif %{results.concentratePercentage.toFixed(0)})</span>
                </strong>
                <span className="text-[9px] text-slate-600 block truncate">
                  {results.roughageStatus === 'CRITICAL_ACIDOSIS' ? 'Asidoz Riski! Lif Az' : results.roughageStatus === 'WARNING_LOW' ? 'Kaba Yem Sınırda' : 'İdeal Rumen Dengesi'}
                </span>
              </div>

              <div className="p-1.5 bg-slate-50/90 rounded-lg border border-slate-200">
                <span className="text-[8px] text-slate-500 uppercase font-bold block">Rasyon Ham Proteini (HP)</span>
                <strong className="text-xs font-black text-slate-900 block leading-tight">
                  %{results.proteinPercentageOfRation}
                </strong>
                <span className="text-[9px] text-slate-600 block">{results.totalProteinGrams} g Ham Protein</span>
              </div>

              <div className="p-1.5 bg-slate-50/90 rounded-lg border border-slate-200">
                <span className="text-[8px] text-slate-500 uppercase font-bold block">Nişasta Düzeyi</span>
                <strong className="text-xs font-black text-slate-900 block leading-tight">
                  %{results.starchPercentageOfRation}
                </strong>
                <span className="text-[9px] text-slate-600 block">Güvenli: %22-28 ({results.starchStatus === 'HIGH' ? 'Yüksek' : 'Güvenli'})</span>
              </div>
            </div>
          </div>

          {/* Rumen Doluluğu & Sindirim Değerlendirmesi Notu */}
          <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-300 text-[9px] leading-tight text-slate-800">
            <strong className="text-slate-950 font-bold">Rumen Doluluğu & Sindirim Değerlendirmesi: </strong>
            <span>{results.dryMatterStatusMessage}</span>
          </div>

          {/* Rasyondaki Yem Maddeleri Detay Tablosu (Kompakt Tek Sayfa) */}
          <div className="border border-slate-400 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-2.5 py-1 border-b border-slate-300 flex items-center justify-between text-[10px]">
              <strong className="text-slate-900 font-black uppercase tracking-wider">
                Rasyon Reçetesi ve Besin Maddeleri Dağılımı (1 İnek / Günlük)
              </strong>
              <span className="text-slate-600 font-bold text-[9px]">
                {itemsForCalc.length} Çeşit Yem Maddesi
              </span>
            </div>

            <table className="w-full text-[10px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-200 text-slate-950 text-[9px] font-black uppercase border-b border-slate-400">
                  <th className="py-1 px-1.5 text-center w-6 border-r border-slate-300">#</th>
                  <th className="py-1 px-2 border-r border-slate-300">Yem Maddesi</th>
                  <th className="py-1 px-1.5 border-r border-slate-300">Sınıf</th>
                  <th className="py-1 px-2 text-right border-r border-slate-300">Taze Miktar</th>
                  <th className="py-1 px-2 text-right border-r border-slate-300">Kuru Madde</th>
                  <th className="py-1 px-2 text-right border-r border-slate-300">Ham Protein</th>
                  <th className="py-1 px-2 text-right border-r border-slate-300">Nişasta</th>
                  <th className="py-1 px-2 text-right border-r border-slate-300">Birim Fiyat</th>
                  <th className="py-1 px-2 text-right">Günlük Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {itemsForCalc.map((item, idx) => {
                  const feed = feeds.find(f => f.id === item.feedId);
                  if (!feed) return null;
                  const dmKg = item.freshAmount * (feed.dryMatter / 100);
                  const prG = dmKg * (feed.protein / 100) * 1000;
                  const stG = dmKg * (feed.starch / 100) * 1000;
                  const cost = item.freshAmount * feed.unitPrice;

                  return (
                    <tr key={item.feedId} className="even:bg-slate-50/70">
                      <td className="py-1 px-1.5 text-center font-bold text-slate-700 border-r border-slate-300">
                        {idx + 1}
                      </td>
                      <td className="py-1 px-2 font-black text-slate-950 border-r border-slate-300">
                        {feed.name}
                      </td>
                      <td className="py-1 px-1.5 border-r border-slate-300">
                        <span className={`px-1 py-0.2 rounded text-[8px] font-bold ${
                          feed.type === 'KABA' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                          {feed.type === 'KABA' ? 'Kaba' : 'Kesif'}
                        </span>
                      </td>
                      <td className="py-1 px-2 text-right font-black text-slate-950 border-r border-slate-300">
                        {item.freshAmount.toFixed(1)} kg
                      </td>
                      <td className="py-1 px-2 text-right text-slate-800 border-r border-slate-300">
                        {dmKg.toFixed(2)} kg
                      </td>
                      <td className="py-1 px-2 text-right text-slate-800 border-r border-slate-300">
                        {Math.round(prG)} g
                      </td>
                      <td className="py-1 px-2 text-right text-slate-800 border-r border-slate-300">
                        {Math.round(stG)} g
                      </td>
                      <td className="py-1 px-2 text-right text-slate-600 border-r border-slate-300">
                        {feed.unitPrice.toFixed(2)} TL
                      </td>
                      <td className="py-1 px-2 text-right font-black text-slate-900">
                        {cost.toFixed(2)} TL
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-200 font-black text-slate-950 border-t-2 border-slate-400">
                <tr>
                  <td colSpan={3} className="py-1 px-2 uppercase tracking-wider text-[9px] border-r border-slate-300">
                    TOPLAM GÜNLÜK RASYON (1 İNEK)
                  </td>
                  <td className="py-1 px-2 text-right font-black text-xs border-r border-slate-300">
                    {results.totalFreshKg.toFixed(1)} kg
                  </td>
                  <td className="py-1 px-2 text-right font-black text-xs border-r border-slate-300">
                    {results.totalDryMatterKg.toFixed(2)} kg
                  </td>
                  <td className="py-1 px-2 text-right font-black text-xs border-r border-slate-300">
                    {results.totalProteinGrams} g
                  </td>
                  <td className="py-1 px-2 text-right font-black text-xs border-r border-slate-300">
                    {results.totalStarchGrams} g
                  </td>
                  <td className="py-1 px-2 text-right border-r border-slate-300 text-slate-700">
                    -
                  </td>
                  <td className="py-1 px-2 text-right font-black text-xs text-emerald-900">
                    {results.dailyFeedCostPerCow.toFixed(2)} TL
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Güvenlik & Fizyolojik Limit Denetimi Notu */}
          <div className="p-1.5 rounded-lg border border-slate-300 bg-slate-50 text-[9px] leading-tight space-y-0.5">
            <strong className="text-slate-950 font-bold uppercase tracking-wider">
              Yem Tüketim Güvenlik & Fizyolojik Üst Sınır Denetimi:
            </strong>
            {results.limitWarnings.length > 0 ? (
              <div className="space-y-0.5">
                {results.limitWarnings.map((warn, i) => (
                  <p key={i} className="text-amber-950 font-semibold">
                    • <strong>{warn.feedName}:</strong> {warn.freshAmount} kg verildi (Önerilen azami sınır: {warn.maxLimitKg} kg) — {warn.warningNote}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-emerald-900 font-semibold">
                • Tebrikler! Rasyonda kullanılan tüm yemler zooteknik ve fizyolojik üst sınır limitleri dahilindedir.
              </p>
            )}
          </div>

          <div className="text-center text-[8px] text-slate-500 font-medium pt-1 border-t border-slate-200">
            MilkIQ Akıllı Süt, Rasyon & Maliyet Sistemi tarafından otomatik üretilmiştir.
          </div>
        </div>
      </div>
    </div>
  );
}

// INDIVIDUAL FEED INPUT CARD COMPONENT (WITH LIMIT CHECK)
function FeedCard({
  feed,
  amount,
  onAmountChange,
  onAdjust,
}: {
  feed: Feed;
  amount: number;
  onAmountChange: (val: string) => void;
  onAdjust: (delta: number) => void;
}) {
  const isSelected = amount > 0;
  const dryMatterKg = amount * (feed.dryMatter / 100);
  const proteinGrams = dryMatterKg * (feed.protein / 100) * 1000;
  const starchGrams = dryMatterKg * (feed.starch / 100) * 1000;
  const cost = amount * feed.unitPrice;

  // Üst Limit Denetimi
  const catMeta = feed.category ? FEED_CATEGORY_CONFIG[feed.category] : null;
  const maxLimit = feed.maxLimitKg ?? catMeta?.defaultMaxLimit;
  const isLimitExceeded = Boolean(maxLimit && amount > maxLimit);

  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      isLimitExceeded
        ? 'bg-amber-50/50 border-amber-400 shadow-xs ring-1 ring-amber-400/40'
        : isSelected
        ? 'bg-white border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
        : 'bg-white border-slate-200 hover:border-slate-300'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
              feed.type === 'KABA' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {feed.type === 'KABA' ? 'KABA YEM' : 'KESİF YEM'}
            </span>
            {catMeta && (
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md border border-slate-200">
                {catMeta.label.split(' ')[0]}
              </span>
            )}
            {maxLimit && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                isLimitExceeded
                  ? 'bg-rose-100 text-rose-800 font-black'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                Üst Sınır: {maxLimit} kg
              </span>
            )}
          </div>
          <h3 className="font-bold text-slate-900 text-sm tracking-tight">
            {feed.name}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            KM %{feed.dryMatter} • Protein %{feed.protein} • Nişasta %{feed.starch}
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
            {feed.unitPrice.toFixed(2)} TL/kg
          </span>
        </div>
      </div>

      {/* Input & Adjust Buttons */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => onAdjust(-1)}
            disabled={amount <= 0}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm disabled:opacity-40"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onAdjust(-0.5)}
            disabled={amount <= 0}
            className="px-1.5 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs disabled:opacity-40"
          >
            -0.5
          </button>
        </div>

        <div className="flex items-center space-x-1.5 flex-1 max-w-[130px]">
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="0"
            value={amount || ''}
            onChange={(e) => onAmountChange(e.target.value)}
            className={`w-full h-10 text-center font-black text-lg rounded-xl border transition-all ${
              isLimitExceeded
                ? 'bg-amber-100/70 border-amber-500 text-amber-950 font-black'
                : isSelected
                ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                : 'bg-white border-slate-300 text-slate-700'
            }`}
          />
          <span className="text-xs font-bold text-slate-500">kg</span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => onAdjust(0.5)}
            className="px-1.5 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
          >
            +0.5
          </button>
          <button
            type="button"
            onClick={() => onAdjust(1)}
            className="w-8 h-8 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold flex items-center justify-center text-sm"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Limit Aşımı Uyarısı */}
      {isLimitExceeded && (
        <div className="mt-2.5 p-2 bg-amber-100/80 border border-amber-300 rounded-xl text-amber-950 text-xs flex items-start space-x-1.5 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Önerilen Üst Sınır Aşıldı: {maxLimit} kg</strong>
            <p className="text-[11px] text-amber-900/90 mt-0.5">
              {catMeta?.warningNote || `${feed.name} için önerilen günlük maksimum miktar ${maxLimit} kg'dır.`}
            </p>
          </div>
        </div>
      )}

      {/* Calculated Feed Nutrients (if selected) */}
      {isSelected && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-4 gap-1 text-center text-[10px]">
          <div className="bg-slate-50 p-1 rounded-md">
            <span className="text-slate-400 block">KM</span>
            <strong className="text-slate-700 font-bold">{dryMatterKg.toFixed(2)} kg</strong>
          </div>
          <div className="bg-slate-50 p-1 rounded-md">
            <span className="text-slate-400 block">HP</span>
            <strong className="text-slate-700 font-bold">{Math.round(proteinGrams)} g</strong>
          </div>
          <div className="bg-slate-50 p-1 rounded-md">
            <span className="text-slate-400 block">Nişasta</span>
            <strong className="text-slate-700 font-bold">{Math.round(starchGrams)} g</strong>
          </div>
          <div className="bg-emerald-50 p-1 rounded-md">
            <span className="text-emerald-600 block">Maliyet</span>
            <strong className="text-emerald-800 font-bold">{cost.toFixed(2)} TL</strong>
          </div>
        </div>
      )}
    </div>
  );
}
