'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Wheat, 
  Plus, 
  Pencil, 
  Trash2, 
  RotateCcw, 
  Check, 
  X, 
  AlertCircle,
  ShieldAlert,
  Building2,
  Search,
  ArrowUpDown,
  Sparkles,
  Zap,
  ShieldCheck,
  Info,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { Feed, FeedType, FeedCategory, FEED_CATEGORY_CONFIG, FactoryFeed } from '@/types';
import ConfirmModal, { ConfirmVariant } from '@/components/ConfirmModal';
import { 
  ROUGHAGE_REFERENCE_CATALOG, 
  RoughageReferenceFeed, 
  RoughageQualityOption 
} from '@/lib/roughage-catalog';

function FeedsPageContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'katalog' ? 'KATALOG' : 'CIFTLIK';
  const [activeMainTab, setActiveMainTab] = useState<'CIFTLIK' | 'KATALOG'>(initialTab);

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

  // --- FARM FEEDS STATE ---
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loadingFeeds, setLoadingFeeds] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'KABA' | 'KESIF'>('ALL');

  // Modal / Form state for farm feed
  const [showModal, setShowModal] = useState(false);
  const [editingFeed, setEditingFeed] = useState<Feed | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'KABA' as FeedType,
    category: 'KURU_OT' as FeedCategory,
    maxLimitKg: '7.0',
    dryMatter: '',
    protein: '',
    starch: '',
    unitPrice: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // --- FACTORY FEEDS (CATALOG) STATE ---
  const [factoryFeeds, setFactoryFeeds] = useState<FactoryFeed[]>([]);
  const [loadingFactory, setLoadingFactory] = useState(true);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState<'protein' | 'starch' | 'energy' | 'price'>('protein');

  // Import factory feed modal state
  const [importModalFeed, setImportModalFeed] = useState<FactoryFeed | null>(null);
  const [customPrice, setCustomPrice] = useState('');
  const [importing, setImporting] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState('');

  // Add custom factory feed modal state
  const [showAddFactoryModal, setShowAddFactoryModal] = useState(false);
  const [newBrand, setNewBrand] = useState('');
  const [newFeedName, setNewFeedName] = useState('');
  const [newCat, setNewCat] = useState<'SUT_YEMI' | 'DENGELIYICI' | 'DUVE_BUZAGI' | 'KURU_DONEM'>('SUT_YEMI');
  const [newProtein, setNewProtein] = useState('19');
  const [newStarch, setNewStarch] = useState('26');
  const [newEnergy, setNewEnergy] = useState('2700');
  const [newCellulose, setNewCellulose] = useState('9.0');
  const [newPrice, setNewPrice] = useState('14.0');
  const [newDesc, setNewDesc] = useState('');
  const [savingNewFactory, setSavingNewFactory] = useState(false);

  // --- ROUGHAGE REFERENCE CATALOG STATE ---
  const [showRoughageModal, setShowRoughageModal] = useState(false);
  const [roughageSearch, setRoughageSearch] = useState('');
  const [roughageCategoryFilter, setRoughageCategoryFilter] = useState<string>('ALL');

  // Filtered roughage reference feeds
  const filteredRoughageFeeds = useMemo(() => {
    return ROUGHAGE_REFERENCE_CATALOG.filter(item => {
      const matchCat = roughageCategoryFilter === 'ALL' || item.category === roughageCategoryFilter;
      const q = roughageSearch.trim().toLowerCase();
      const matchSearch = !q ||
        item.name.toLowerCase().includes(q) ||
        item.generalInfo.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [roughageSearch, roughageCategoryFilter]);

  // Forma aktarma işlemi
  const handleSelectRoughageQuality = (refFeed: RoughageReferenceFeed, quality: RoughageQualityOption) => {
    setFormData({
      name: `${refFeed.name} (${quality.qualityGrade === '1_SINIF' ? '1. Kalite Normal' : '2. Kalite Orta'})`,
      type: refFeed.feedType || 'KABA',
      category: refFeed.category,
      maxLimitKg: quality.maxLimitKg.toString(),
      dryMatter: quality.dryMatter.toString(),
      protein: quality.protein.toString(),
      starch: quality.starch.toString(),
      unitPrice: quality.approxPriceTL.toString(),
    });
    setShowRoughageModal(false);
    setShowModal(true);
  };

  // Load farm feeds
  const loadFeeds = async () => {
    try {
      setLoadingFeeds(true);
      const res = await fetch('/api/feeds');
      const data = await res.json();
      setFeeds(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFeeds(false);
    }
  };

  // Load factory feeds
  const loadFactoryFeeds = async () => {
    try {
      setLoadingFactory(true);
      const res = await fetch('/api/factory-feeds');
      const data = await res.json();
      setFactoryFeeds(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFactory(false);
    }
  };

  useEffect(() => {
    loadFeeds();
    loadFactoryFeeds();
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'katalog') {
      setActiveMainTab('KATALOG');
    }
  }, [searchParams]);

  // Brand list for filters
  const brands = useMemo(() => {
    const list = Array.from(new Set(factoryFeeds.map(f => f.brand)));
    return ['ALL', ...list];
  }, [factoryFeeds]);

  // Check if factory feed already exists in farm feeds
  const isFeedInMyFarm = (feedName: string) => {
    return feeds.some(f => f.name.trim().toLowerCase() === feedName.trim().toLowerCase());
  };

  // Filtered factory feeds
  const filteredFactoryFeeds = useMemo(() => {
    let list = factoryFeeds.filter(f => {
      const matchBrand = selectedBrand === 'ALL' || f.brand.toLowerCase() === selectedBrand.toLowerCase();
      const matchCategory = selectedCategory === 'ALL' || f.category === selectedCategory;
      const q = catalogSearch.trim().toLowerCase();
      const matchSearch = !q || 
        f.name.toLowerCase().includes(q) || 
        f.brand.toLowerCase().includes(q) || 
        f.description.toLowerCase().includes(q) ||
        f.protein.toString().includes(q);
      return matchBrand && matchCategory && matchSearch;
    });

    list.sort((a, b) => {
      if (sortBy === 'protein') return b.protein - a.protein;
      if (sortBy === 'starch') return b.starch - a.starch;
      if (sortBy === 'energy') return b.energyME - a.energyME;
      if (sortBy === 'price') return a.approxPrice - b.approxPrice;
      return 0;
    });

    return list;
  }, [factoryFeeds, selectedBrand, selectedCategory, catalogSearch, sortBy]);

  // --- FARM FEED ACTIONS ---
  const openAddModal = (type: FeedType = 'KABA') => {
    setEditingFeed(null);
    const defaultCat: FeedCategory = type === 'KABA' ? 'KURU_OT' : 'HAZIR_YEM';
    const catMeta = FEED_CATEGORY_CONFIG[defaultCat];
    setFormData({
      name: '',
      type,
      category: defaultCat,
      maxLimitKg: catMeta.defaultMaxLimit.toString(),
      dryMatter: type === 'KABA' ? '35' : '89',
      protein: '12',
      starch: '20',
      unitPrice: '5.00',
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (feed: Feed) => {
    setEditingFeed(feed);
    const cat = feed.category || (feed.type === 'KABA' ? 'KURU_OT' : 'HAZIR_YEM');
    const defaultLimit = feed.maxLimitKg ?? FEED_CATEGORY_CONFIG[cat]?.defaultMaxLimit ?? 10;
    setFormData({
      name: feed.name,
      type: feed.type,
      category: cat,
      maxLimitKg: defaultLimit.toString(),
      dryMatter: feed.dryMatter.toString(),
      protein: feed.protein.toString(),
      starch: feed.starch.toString(),
      unitPrice: feed.unitPrice.toString(),
    });
    setError('');
    setShowModal(true);
  };

  const handleCategorySelect = (cat: FeedCategory) => {
    const meta = FEED_CATEGORY_CONFIG[cat];
    setFormData(prev => ({
      ...prev,
      category: cat,
      type: meta.type,
      maxLimitKg: meta.defaultMaxLimit.toString(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        category: formData.category,
        maxLimitKg: parseFloat(formData.maxLimitKg) || FEED_CATEGORY_CONFIG[formData.category]?.defaultMaxLimit || 10,
        dryMatter: parseFloat(formData.dryMatter),
        protein: parseFloat(formData.protein),
        starch: parseFloat(formData.starch),
        unitPrice: parseFloat(formData.unitPrice),
      };

      if (!payload.name) {
        throw new Error('Yem adı zorunludur');
      }

      if (editingFeed) {
        const res = await fetch(`/api/feeds/${editingFeed.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Güncelleme başarısız');
      } else {
        const res = await fetch('/api/feeds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Ekleme başarısız');
      }

      setShowModal(false);
      loadFeeds();
    } catch (err: any) {
      setError(err.message || 'Kayıt sırasında hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Yemi Sil',
      message: `"${name}" yemini çiftlik listenizden silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      confirmText: 'Evet, Sil',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/feeds/${id}`, { method: 'DELETE' });
          if (res.ok) {
            loadFeeds();
          }
        } catch (e) {
          console.error(e);
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleResetDefaults = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Standart Yemleri Sıfırla',
      message: 'Tüm standart Türkiye yemleri yeniden yüklenecektir. Mevcut çiftlik yem listeniz fabrika varsayılanlarına dönecektir. Onaylıyor musunuz?',
      confirmText: 'Evet, Yeniden Yükle',
      variant: 'warning',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/feeds', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'reset' }),
          });
          if (res.ok) {
            loadFeeds();
          }
        } catch (e) {
          console.error(e);
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // --- FACTORY FEED IMPORT ACTIONS ---
  const handleOpenImport = (feed: FactoryFeed) => {
    setImportModalFeed(feed);
    setCustomPrice(feed.approxPrice.toString());
  };

  const handleExecuteImport = async () => {
    if (!importModalFeed) return;
    setImporting(true);
    try {
      const res = await fetch('/api/factory-feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import',
          factoryFeedId: importModalFeed.id,
          customPrice: parseFloat(customPrice) || importModalFeed.approxPrice,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setImportSuccessMsg(`"${importModalFeed.name}" başarıyla çiftlik yemlerinize eklendi!`);
        setTimeout(() => setImportSuccessMsg(''), 4000);
        setImportModalFeed(null);
        await loadFeeds();
      } else {
        alert(data.message || data.error || 'Yem eklenirken bir hata oluştu.');
      }
    } catch (e) {
      console.error(e);
      alert('Bağlantı hatası.');
    } finally {
      setImporting(false);
    }
  };

  const handleCreateNewFactoryFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand || !newFeedName) {
      alert('Marka ve ürün adı zorunludur.');
      return;
    }

    setSavingNewFactory(true);
    try {
      const res = await fetch('/api/factory-feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: newBrand.trim(),
          name: newFeedName.trim(),
          category: newCat,
          protein: parseFloat(newProtein) || 19,
          starch: parseFloat(newStarch) || 26,
          energyME: parseFloat(newEnergy) || 2700,
          cellulose: parseFloat(newCellulose) || 9.0,
          approxPrice: parseFloat(newPrice) || 14.0,
          description: newDesc.trim() || `${newBrand} ${newFeedName}`,
        }),
      });

      if (res.ok) {
        setShowAddFactoryModal(false);
        setNewFeedName('');
        setNewBrand('');
        setNewDesc('');
        loadFactoryFeeds();
      } else {
        const err = await res.json();
        alert(err.error || 'Kaydedilemedi.');
      }
    } catch {
      alert('Bağlantı hatası.');
    } finally {
      setSavingNewFactory(false);
    }
  };

  const getBrandBadgeColor = (brand: string) => {
    const b = brand.toLowerCase();
    if (b.includes('proyem')) return 'bg-emerald-50 text-emerald-700 border-emerald-300';
    if (b.includes('cp')) return 'bg-red-50 text-red-700 border-red-300';
    if (b.includes('tarım kredi')) return 'bg-green-100 text-green-800 border-green-400';
    if (b.includes('abalıoğlu')) return 'bg-amber-50 text-amber-700 border-amber-300';
    if (b.includes('matlı')) return 'bg-blue-50 text-blue-700 border-blue-300';
    if (b.includes('ofis')) return 'bg-cyan-50 text-cyan-800 border-cyan-300';
    if (b.includes('çamlı')) return 'bg-lime-50 text-lime-800 border-lime-300';
    if (b.includes('toros')) return 'bg-indigo-50 text-indigo-700 border-indigo-300';
    if (b.includes('eriş')) return 'bg-purple-50 text-purple-700 border-purple-300';
    if (b.includes('özlem')) return 'bg-teal-50 text-teal-700 border-teal-300';
    if (b.includes('trakya')) return 'bg-yellow-50 text-yellow-800 border-yellow-300';
    if (b.includes('pehlivan')) return 'bg-orange-50 text-orange-800 border-orange-300';
    if (b.includes('şenpiliç')) return 'bg-rose-50 text-rose-800 border-rose-300';
    if (b.includes('hekimoğlu')) return 'bg-sky-50 text-sky-800 border-sky-300';
    return 'bg-slate-100 text-slate-800 border-slate-300';
  };

  const filteredFeeds = feeds.filter(f => {
    if (activeFilter === 'KABA') return f.type === 'KABA';
    if (activeFilter === 'KESIF') return f.type === 'KESIF';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <Wheat className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Yem Yönetimi & Kütüphane</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Çiftliğinizdeki rasyon yemlerini yönetin veya 92 çeşit fabrika yemi analiz kataloğunu inceleyin.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {activeMainTab === 'CIFTLIK' ? (
            <>
              <button
                type="button"
                onClick={() => setShowRoughageModal(true)}
                title="1. ve 2. Kalite Yem Referans Rehberi (Kaba Yem & Hububat Kırmaları)"
                className="px-3.5 py-2.5 rounded-xl border border-emerald-500 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs sm:text-sm flex items-center space-x-1.5 transition-all shadow-xs active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">Yem Referans Rehberi</span>
                <span className="sm:hidden">Rehber</span>
              </button>
              <button
                onClick={handleResetDefaults}
                title="Standart Yemleri Yeniden Yükle"
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-xs flex items-center space-x-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Standart Yemler</span>
              </button>
              <button
                onClick={() => openAddModal('KABA')}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow-md active:scale-95 text-xs sm:text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Yem Ekle</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAddFactoryModal(true)}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow-md active:scale-95 text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Fabrika Yemi Ekle</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Two Navigation Tabs */}
      <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
        <button
          onClick={() => setActiveMainTab('CIFTLIK')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center space-x-2 transition-all ${
            activeMainTab === 'CIFTLIK'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wheat className="w-4 h-4 text-emerald-600" />
          <span>🌾 Çiftlik Yemlerim ({feeds.length})</span>
        </button>
        <button
          onClick={() => setActiveMainTab('KATALOG')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center space-x-2 transition-all ${
            activeMainTab === 'KATALOG'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span>🏭 Fabrika Yemleri Kataloğu ({factoryFeeds.length} Çeşit)</span>
          <span className="hidden md:inline-block px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px]">
            Protein & Nişasta
          </span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {importSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-emerald-800 font-bold text-sm shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-emerald-600" />
            <span>{importSuccessMsg}</span>
          </div>
          <button
            onClick={() => setActiveMainTab('CIFTLIK')}
            className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs hover:bg-emerald-800 transition-colors"
          >
            Yemlerimde Gör
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: ÇİFTLİK YEMLERİM */}
      {/* ========================================================================= */}
      {activeMainTab === 'CIFTLIK' && (
        <div className="space-y-4">
          {/* Promotion mini-banner for catalog */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-4 rounded-2xl text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-emerald-500/20">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-300">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Türkiye Fabrika Süt Yemleri Kataloğu (92 Çeşit)
                </h4>
                <p className="text-xs text-slate-300">
                  Proyem, CP, Tarım Kredi, Abalıoğlu, Matlı, Ofis, Çamlı, Toros yemlerinin protein ve nişasta oranlarını inceleyin.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveMainTab('KATALOG')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap self-start sm:self-auto"
            >
              <span>Kataloğa Geç</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filter Sub-Tabs */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Tümü ({feeds.length})
            </button>
            <button
              onClick={() => setActiveFilter('KABA')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeFilter === 'KABA'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              Kaba Yemler ({feeds.filter(f => f.type === 'KABA').length})
            </button>
            <button
              onClick={() => setActiveFilter('KESIF')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeFilter === 'KESIF'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              Kesif Yemler ({feeds.filter(f => f.type === 'KESIF').length})
            </button>
          </div>

          {/* Farm Feeds Cards */}
          {loadingFeeds ? (
            <div className="text-center py-12 text-slate-500 font-medium">Yemler yükleniyor...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredFeeds.map((feed) => (
                <div
                  key={feed.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          feed.type === 'KABA'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        {feed.type === 'KABA' ? 'KABA YEM' : 'KESİF YEM'}
                      </span>
                      {feed.category && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {FEED_CATEGORY_CONFIG[feed.category]?.label || feed.category}
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-slate-900 text-base mt-2 leading-snug">
                      {feed.name}
                    </h3>

                    {/* Max Limit Warning Badge */}
                    {feed.maxLimitKg && feed.maxLimitKg > 0 && (
                      <div className="mt-1 flex items-center space-x-1 text-[11px] font-semibold text-slate-500">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                        <span>Önerilen Üst Sınır: <strong>{feed.maxLimitKg} kg/gün</strong></span>
                      </div>
                    )}

                    {/* Specs Table */}
                    <div className="grid grid-cols-3 gap-1.5 mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">KM</span>
                        <span className="font-extrabold text-slate-700">%{feed.dryMatter}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Protein</span>
                        <span className="font-black text-blue-700">%{feed.protein}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Nişasta</span>
                        <span className="font-black text-amber-700">%{feed.starch}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Birim Fiyat</span>
                      <span className="text-base font-black text-emerald-800">
                        {feed.unitPrice.toFixed(2)} <span className="text-xs font-semibold text-slate-500">TL/kg</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(feed)}
                        className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(feed.id, feed.name)}
                        className="p-2 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FABRİKA YEMLERİ KATALOĞU */}
      {/* ========================================================================= */}
      {activeMainTab === 'KATALOG' && (
        <div className="space-y-5">
          {/* Info Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide">
                <Building2 className="w-3.5 h-3.5" />
                <span>TÜRKİYE FABRİKA YEMLERİ VERİTABANI</span>
              </div>
              <h2 className="text-2xl font-black text-white">
                Fabrika Yemleri Protein & Nişasta Kataloğu
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                Proyem, CP, Tarım Kredi, Abalıoğlu, Matlı, Toros, Ofis, Çamlı ve Eriş gibi önde gelen markaların 
                tüm süt yemlerinin <span className="text-emerald-400 font-bold">Ham Protein (%)</span>, 
                <span className="text-amber-400 font-bold"> Nişasta (%)</span> ve 
                <span className="text-blue-400 font-bold"> Metabolik Enerji</span> değerleri. 
                Beğendiğiniz yemi tek tıkla kendi çiftlik yemlerinize ekleyip rasyonda kullanabilirsiniz.
              </p>
            </div>

            {/* Quick Besleme Insight Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-5 pt-5 border-t border-white/10 text-xs">
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <span className="text-slate-400 block font-medium">Standart Süt Yemleri</span>
                <span className="text-white font-bold text-sm">%18 - %19 Protein</span>
                <span className="text-emerald-300/80 block mt-0.5">%25-27 Nişasta</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <span className="text-slate-400 block font-medium">Yüksek Verim & Pik</span>
                <span className="text-white font-bold text-sm">%21 - %23 Protein</span>
                <span className="text-amber-300/80 block mt-0.5">%28-30 Nişasta</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <span className="text-slate-400 block font-medium">Protein Konsantreleri</span>
                <span className="text-white font-bold text-sm">%24 - %41 Protein</span>
                <span className="text-blue-300/80 block mt-0.5">Silajı dengeler</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <span className="text-slate-400 block font-medium">Kuru Dönem & Düve</span>
                <span className="text-white font-bold text-sm">%15 - %16 Protein</span>
                <span className="text-teal-300/80 block mt-0.5">Süt humması önler</span>
              </div>
            </div>
          </div>

          {/* Search, Filter & Sort Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search Box */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Marka, yem adı veya protein ara (örn: Proyem, CP, 21, Tarım Kredi, Nişasta...)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm font-medium"
                />
              </div>

              {/* Sort Selector */}
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <div className="flex items-center space-x-1 text-xs text-slate-500 font-bold whitespace-nowrap">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>Sırala:</span>
                </div>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
                >
                  <option value="protein">Ham Protein (% Yüksekten Düşüğe)</option>
                  <option value="starch">Nişasta (% Yüksekten Düşüğe)</option>
                  <option value="energy">Metabolik Enerji (ME Yüksek)</option>
                  <option value="price">Fiyat (En Uygun)</option>
                </select>
              </div>
            </div>

            {/* Brand Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
              <span className="text-slate-400 font-bold px-1 whitespace-nowrap">Marka:</span>
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                    selectedBrand === b
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {b === 'ALL' ? 'Tüm Markalar' : b}
                </button>
              ))}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs border-t border-slate-100 pt-2.5">
              <span className="text-slate-400 font-bold px-1 whitespace-nowrap">Kategori:</span>
              {[
                { id: 'ALL', label: 'Tüm Gruplar' },
                { id: 'SUT_YEMI', label: 'Süt Yemleri' },
                { id: 'DENGELIYICI', label: 'Protein Dengeleyiciler' },
                { id: 'KURU_DONEM', label: 'Kuru Dönem' },
                { id: 'DUVE_BUZAGI', label: 'Düve Geliştirme' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-emerald-50/60 text-emerald-800 hover:bg-emerald-100/60'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Cards Grid */}
          {loadingFactory ? (
            <div className="text-center py-16 text-slate-500 font-medium">Fabrika yemleri yükleniyor...</div>
          ) : filteredFactoryFeeds.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700">Kriterlere uygun fabrika yemi bulunamadı</h3>
              <button
                onClick={() => { setSelectedBrand('ALL'); setSelectedCategory('ALL'); setCatalogSearch(''); }}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Filtreleri Sıfırla
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredFactoryFeeds.map((feed) => {
                const inFarm = isFeedInMyFarm(feed.name);
                return (
                  <div
                    key={feed.id}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${getBrandBadgeColor(feed.brand)}`}>
                          {feed.brand}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {feed.categoryLabel || 'Karma Süt Yemi'}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-black text-slate-900 leading-snug">
                          {feed.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {feed.description}
                        </p>
                      </div>

                      {/* Primary Nutrition Metrics */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {/* Protein */}
                        <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-2.5 flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-blue-700">Ham Protein</span>
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <div className="mt-1">
                            <span className="text-2xl font-black text-blue-900 leading-none">
                              %{feed.protein.toFixed(1)}
                            </span>
                          </div>
                          <div className="w-full bg-blue-200/70 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div 
                              className="bg-blue-600 h-full rounded-full" 
                              style={{ width: `${Math.min(100, (feed.protein / 30) * 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Starch */}
                        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-800">Nişasta</span>
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          </div>
                          <div className="mt-1">
                            <span className="text-2xl font-black text-amber-900 leading-none">
                              %{feed.starch.toFixed(1)}
                            </span>
                          </div>
                          <div className="w-full bg-amber-200/70 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div 
                              className="bg-amber-600 h-full rounded-full" 
                              style={{ width: `${Math.min(100, (feed.starch / 35) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Energy & Fiber & Price */}
                      <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200/60 text-center">
                        <div>
                          <span className="text-[10px] text-slate-500 block font-bold">Enerji (ME)</span>
                          <span className="text-xs font-black text-slate-800 flex items-center justify-center space-x-0.5">
                            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>{feed.energyME}</span>
                          </span>
                          <span className="text-[9px] text-slate-400">kcal/kg</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 block font-bold">Ham Selüloz</span>
                          <span className="text-xs font-black text-slate-800">
                            %{feed.cellulose ? feed.cellulose.toFixed(1) : '9.0'}
                          </span>
                          <span className="text-[9px] text-slate-400">max lif</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 block font-bold">Ref. Fiyat</span>
                          <span className="text-xs font-black text-emerald-700">
                            ₺{feed.approxPrice.toFixed(2)}
                          </span>
                          <span className="text-[9px] text-slate-400">TL / kg</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="p-3 bg-slate-50/70 border-t border-slate-100">
                      {inFarm ? (
                        <div className="w-full py-2 px-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center justify-center space-x-1.5">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Çiftliğinizde Ekli (Rasyonda Aktif)</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenImport(feed)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs active:scale-95 group"
                        >
                          <Plus className="w-4 h-4 text-emerald-400 group-hover:text-white" />
                          <span>Çiftlik Yemlerime Ekle (Rasyonda Kullan)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT FARM FEED */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                {editingFeed ? 'Yemi Düzenle' : 'Yeni Yem Ekle'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              {/* KABA YEM REFERANS KATALOĞUNDAN DEĞER ÇEKME ÇAĞRISI */}
              <div className="p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs">
                <div className="flex items-center space-x-2.5">
                  <span className="text-2xl shrink-0">🌿</span>
                  <div>
                    <strong className="text-xs font-black text-emerald-950 block">
                      Kuru Madde, Protein & Nişastayı Bilmiyor Musunuz?
                    </strong>
                    <p className="text-[11px] text-emerald-800 leading-tight mt-0.5">
                      Analiz gerekmeden; Kaba Yemler veya Kırmalar (Arpa, Buğday, Mısır) için 1. ve 2. Kalite standart değerleri tek tıkla forma aktarın.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRoughageModal(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-black text-xs rounded-xl shadow-sm transition-all active:scale-95 shrink-0 flex items-center justify-center space-x-1.5 self-start sm:self-auto"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Rehberden Seç</span>
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Yem Adı</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Örn: Mısır Silajı (İdeal)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Yem Türü</label>
                  <select
                    value={formData.type}
                    onChange={(e: any) => {
                      const newType = e.target.value as FeedType;
                      const defaultCat = newType === 'KABA' ? 'KURU_OT' : 'HAZIR_YEM';
                      handleCategorySelect(defaultCat);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="KABA">KABA YEM</option>
                    <option value="KESIF">KESİF YEM</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e: any) => handleCategorySelect(e.target.value as FeedCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {Object.values(FEED_CATEGORY_CONFIG)
                      .filter(c => c.type === formData.type)
                      .map(cat => (
                        <option key={cat.key} value={cat.key}>
                          {cat.label}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">KM (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.dryMatter}
                    onChange={(e) => setFormData(prev => ({ ...prev, dryMatter: e.target.value }))}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-blue-700 mb-1">Protein (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.protein}
                    onChange={(e) => setFormData(prev => ({ ...prev, protein: e.target.value }))}
                    className="w-full px-2.5 py-2 rounded-xl border border-blue-200 font-bold text-center bg-blue-50/50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-amber-700 mb-1">Nişasta (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.starch}
                    onChange={(e) => setFormData(prev => ({ ...prev, starch: e.target.value }))}
                    className="w-full px-2.5 py-2 rounded-xl border border-amber-200 font-bold text-center bg-amber-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Birim Fiyat (TL/kg)</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={formData.unitPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Maksimum Sınır (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.maxLimitKg}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxLimitKg: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: IMPORT FACTORY FEED TO FARM */}
      {/* ========================================================================= */}
      {importModalFeed && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-black text-slate-900">Çiftlik Yemlerime Aktar</h3>
              </div>
              <button
                onClick={() => setImportModalFeed(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-xs text-slate-400 font-bold uppercase">{importModalFeed.brand}</span>
                <h4 className="font-black text-slate-900 text-base">{importModalFeed.name}</h4>
                <div className="flex items-center space-x-4 mt-2 text-xs font-bold text-slate-700">
                  <span className="text-blue-700">HP: %{importModalFeed.protein}</span>
                  <span className="text-amber-700">Nişasta: %{importModalFeed.starch}</span>
                  <span className="text-slate-600">ME: {importModalFeed.energyME} kcal</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Çiftliğe Alış Fiyatınız (TL / kg)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-black text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="14.50"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    TL / kg
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  50 kg çuval bedeli: yaklaşık {(parseFloat(customPrice || '0') * 50).toFixed(1)} TL
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 leading-relaxed">
                <Info className="w-4 h-4 text-emerald-600 inline mr-1 -mt-0.5" />
                Bu yem çiftliğinizin <strong>Kesif Yem</strong> listesine eklenecek ve hemen 
                <strong> Rasyon Stüdyosu</strong> ekranında ineğinize verilecek miktarı seçebileceksiniz.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setImportModalFeed(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={importing}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {importing ? (
                  <span>Ekleniyor...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Çiftlik Yemlerime Ekle</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD CUSTOM FACTORY FEED */}
      {/* ========================================================================= */}
      {showAddFactoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form 
            onSubmit={handleCreateNewFactoryFeed}
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-black text-slate-900">Yeni Fabrika Yemi Kaydet</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddFactoryModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fabrika / Marka</label>
                  <input
                    type="text"
                    required
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="Örn: Balıkesir Yem, Birlik..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Yem Adı / Çeşidi</label>
                  <input
                    type="text"
                    required
                    value={newFeedName}
                    onChange={(e) => setNewFeedName(e.target.value)}
                    placeholder="Örn: 20 HP Süt Yemi"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={newCat}
                    onChange={(e: any) => setNewCat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="SUT_YEMI">Standart Süt Yemi</option>
                    <option value="DENGELIYICI">Protein Dengeleyici</option>
                    <option value="KURU_DONEM">Kuru Dönem</option>
                    <option value="DUVE_BUZAGI">Düve / Buzağı</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Piyasa Ref. Fiyat (TL/kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Lab / Tag Analysis */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 block">Çuval Etiketi Analiz Değerleri</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-blue-800 mb-1">Ham Protein (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newProtein}
                      onChange={(e) => setNewProtein(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-blue-200 font-black text-blue-900 bg-blue-50/50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="19.0"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-amber-800 mb-1">Nişasta Oranı (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newStarch}
                      onChange={(e) => setNewStarch(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-200 font-black text-amber-900 bg-amber-50/50 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      placeholder="26.0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Metabolik Enerji (kcal/kg)</label>
                    <input
                      type="number"
                      value={newEnergy}
                      onChange={(e) => setNewEnergy(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="2700"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Ham Selüloz (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newCellulose}
                      onChange={(e) => setNewCellulose(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="9.0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kullanım & Laktasyon Notu</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Hangi rasyonlarda veya süt veriminde önerildiğini yazın..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddFactoryModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={savingNewFactory}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {savingNewFactory ? (
                  <span>Kaydediliyor...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Veritabanına Kaydet</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: KABA YEM REFERANS KATALOĞU (1. VE 2. SINIF KALİTE DEĞERLERİ) */}
      {/* ========================================================================= */}
      {showRoughageModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                  🌾
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      Yem Referans Rehberi (Kaba Yem & Hububat Kırmaları)
                    </h3>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md">
                      ZOOTEKNİK STANDART
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Laboratuvar analizine gerek kalmadan; kaba yemler ve tane kırmaları (Arpa, Mısır, Buğday) için 1. Sınıf (Normal) ve 2. Sınıf (Orta Kalite) standart KM, Protein ve Nişasta değerlerini tek tıkla forma aktarın.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRoughageModal(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Arama & Kategori Filtreleri */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Yem ara (örn: arpa kırması, mısır kırması, buğday, yonca, silaj, pancar posası, saman...)"
                  value={roughageSearch}
                  onChange={(e) => setRoughageSearch(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Kategori Filtre Butonları */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
                {[
                  { key: 'ALL', label: 'Tüm Yemler' },
                  { key: 'HUBUBAT', label: '🌾 Hububat & Kırmalar' },
                  { key: 'SILAJ', label: '🌽 Silajlar' },
                  { key: 'KURU_OT', label: '🌿 Kuru Otlar' },
                  { key: 'SAMAN', label: '🌾 Samanlar' },
                  { key: 'YAS_KUSPE', label: '🍯 Yaş Küspeler & Posalar' },
                ].map(cat => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setRoughageCategoryFilter(cat.key)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                      roughageCategoryFilter === cat.key
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Yem Maddeleri Listesi */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {filteredRoughageFeeds.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Aramanıza uygun yem maddesi bulunamadı.
                </div>
              ) : (
                filteredRoughageFeeds.map(item => (
                  <div key={item.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3 hover:border-slate-300 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm sm:text-base">{item.name}</h4>
                          <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                            {item.categoryLabel}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 max-w-md sm:text-right font-medium">
                        {item.generalInfo}
                      </p>
                    </div>

                    {/* 1. Sınıf ve 2. Sınıf Yan Yana Kartlar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* 🟢 1. SINIF (NORMAL / KALİTELİ) */}
                      <div className="p-3.5 bg-white rounded-2xl border-2 border-emerald-400/80 shadow-xs flex flex-col justify-between space-y-2.5">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                              🟢 1. Sınıf (Normal / Kaliteli)
                            </span>
                            <span className="text-xs font-black text-slate-900">
                              ~{item.qualities.firstGrade.approxPriceTL.toFixed(2)} TL/kg
                            </span>
                          </div>

                          {/* Besin Değerleri Izgarası */}
                          <div className="grid grid-cols-4 gap-1.5 my-2 text-center text-xs">
                            <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                              <span className="text-[9px] text-slate-500 block font-bold">KM</span>
                              <strong className="text-slate-900 font-black">%{item.qualities.firstGrade.dryMatter}</strong>
                            </div>
                            <div className="bg-blue-50/70 p-1.5 rounded-lg border border-blue-200">
                              <span className="text-[9px] text-blue-700 block font-bold">Protein</span>
                              <strong className="text-blue-950 font-black">%{item.qualities.firstGrade.protein}</strong>
                            </div>
                            <div className="bg-amber-50/70 p-1.5 rounded-lg border border-amber-200">
                              <span className="text-[9px] text-amber-700 block font-bold">Nişasta</span>
                              <strong className="text-amber-950 font-black">%{item.qualities.firstGrade.starch}</strong>
                            </div>
                            <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                              <span className="text-[9px] text-slate-500 block font-bold">Üst Sınır</span>
                              <strong className="text-slate-900 font-black">{item.qualities.firstGrade.maxLimitKg} kg</strong>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-600 leading-snug">
                            🔍 <strong>Sahada Tanıma:</strong> {item.qualities.firstGrade.fieldDescription}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectRoughageQuality(item, item.qualities.firstGrade)}
                          className="w-full py-2 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center space-x-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>1. Sınıf Değerleri Forma Aktar</span>
                        </button>
                      </div>

                      {/* 🟡 2. SINIF (ORTA KALİTE / GEÇ HASAT) */}
                      <div className="p-3.5 bg-white rounded-2xl border-2 border-amber-400/80 shadow-xs flex flex-col justify-between space-y-2.5">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                              🟡 2. Sınıf (Orta Kalite / Geç Biçim)
                            </span>
                            <span className="text-xs font-black text-slate-900">
                              ~{item.qualities.secondGrade.approxPriceTL.toFixed(2)} TL/kg
                            </span>
                          </div>

                          {/* Besin Değerleri Izgarası */}
                          <div className="grid grid-cols-4 gap-1.5 my-2 text-center text-xs">
                            <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                              <span className="text-[9px] text-slate-500 block font-bold">KM</span>
                              <strong className="text-slate-900 font-black">%{item.qualities.secondGrade.dryMatter}</strong>
                            </div>
                            <div className="bg-blue-50/70 p-1.5 rounded-lg border border-blue-200">
                              <span className="text-[9px] text-blue-700 block font-bold">Protein</span>
                              <strong className="text-blue-950 font-black">%{item.qualities.secondGrade.protein}</strong>
                            </div>
                            <div className="bg-amber-50/70 p-1.5 rounded-lg border border-amber-200">
                              <span className="text-[9px] text-amber-700 block font-bold">Nişasta</span>
                              <strong className="text-amber-950 font-black">%{item.qualities.secondGrade.starch}</strong>
                            </div>
                            <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                              <span className="text-[9px] text-slate-500 block font-bold">Üst Sınır</span>
                              <strong className="text-slate-900 font-black">{item.qualities.secondGrade.maxLimitKg} kg</strong>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-600 leading-snug">
                            🔍 <strong>Sahada Tanıma:</strong> {item.qualities.secondGrade.fieldDescription}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectRoughageQuality(item, item.qualities.secondGrade)}
                          className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center space-x-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>2. Sınıf Değerleri Forma Aktar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Alt Kapat Butonu */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRoughageModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
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
  );
}

export default function FeedsPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto py-12 text-center text-slate-500 font-medium">Yükleniyor...</div>}>
      <FeedsPageContent />
    </Suspense>
  );
}
