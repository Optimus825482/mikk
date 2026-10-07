'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Search, 
  Plus, 
  Check, 
  Wheat, 
  Zap, 
  ShieldCheck, 
  ArrowUpDown, 
  Sparkles,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { FactoryFeed, Feed } from '@/types';

export default function FactoryFeedsPage() {
  const [factoryFeeds, setFactoryFeeds] = useState<FactoryFeed[]>([]);
  const [myFeeds, setMyFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState<'protein' | 'starch' | 'energy' | 'price'>('protein');

  // Modal for importing with custom price
  const [importModalFeed, setImportModalFeed] = useState<FactoryFeed | null>(null);
  const [customPrice, setCustomPrice] = useState('');
  const [importing, setImporting] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState('');

  // Modal for adding a new factory feed
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBrand, setNewBrand] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'SUT_YEMI' | 'DENGELIYICI' | 'DUVE_BUZAGI' | 'KURU_DONEM'>('SUT_YEMI');
  const [newProtein, setNewProtein] = useState('19');
  const [newStarch, setNewStarch] = useState('26');
  const [newEnergy, setNewEnergy] = useState('2700');
  const [newCellulose, setNewCellulose] = useState('9.0');
  const [newPrice, setNewPrice] = useState('14.0');
  const [newDesc, setNewDesc] = useState('');
  const [savingNew, setSavingNew] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [facRes, myRes] = await Promise.all([
        fetch('/api/factory-feeds'),
        fetch('/api/feeds')
      ]);
      const facData = await facRes.json();
      const myData = await myRes.json();
      setFactoryFeeds(facData);
      setMyFeeds(myData);
    } catch (e) {
      console.error('Veri yükleme hatası:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Brands list
  const brands = useMemo(() => {
    const list = Array.from(new Set(factoryFeeds.map(f => f.brand)));
    return ['ALL', ...list];
  }, [factoryFeeds]);

  // Is feed already in my farm feeds?
  const isFeedInMyFarm = (feedName: string) => {
    return myFeeds.some(f => f.name.trim().toLowerCase() === feedName.trim().toLowerCase());
  };

  // Filtered & Sorted feeds
  const filteredFeeds = useMemo(() => {
    let list = factoryFeeds.filter(f => {
      const matchBrand = selectedBrand === 'ALL' || f.brand.toLowerCase() === selectedBrand.toLowerCase();
      const matchCategory = selectedCategory === 'ALL' || f.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
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
  }, [factoryFeeds, selectedBrand, selectedCategory, searchQuery, sortBy]);

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
        setImportSuccessMsg(`"${importModalFeed.name}" çiftlik yemlerinize eklendi!`);
        setTimeout(() => setImportSuccessMsg(''), 4000);
        setImportModalFeed(null);
        await loadData();
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
    if (!newBrand || !newName) {
      alert('Marka ve ürün adı zorunludur.');
      return;
    }

    setSavingNew(true);
    try {
      const res = await fetch('/api/factory-feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: newBrand.trim(),
          name: newName.trim(),
          category: newCategory,
          protein: parseFloat(newProtein) || 19,
          starch: parseFloat(newStarch) || 26,
          energyME: parseFloat(newEnergy) || 2700,
          cellulose: parseFloat(newCellulose) || 9.0,
          approxPrice: parseFloat(newPrice) || 14.0,
          description: newDesc.trim() || `${newBrand} ${newName}`,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewName('');
        setNewBrand('');
        setNewDesc('');
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Kaydedilemedi.');
      }
    } catch {
      alert('Bağlantı hatası.');
    } finally {
      setSavingNew(false);
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner / Heading */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide">
              <Building2 className="w-3.5 h-3.5" />
              <span>TÜRKİYE FABRİKA YEMLERİ VERİTABANI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Fabrika Yemleri Protein & Nişasta Kataloğu
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Proyem, CP, Abalıoğlu, Matlı, Toros, Eriş ve Özlem gibi önde gelen markaların süt yemlerinin 
              <span className="text-emerald-400 font-semibold"> Ham Protein (%)</span>, 
              <span className="text-amber-400 font-semibold"> Nişasta (%)</span> ve 
              <span className="text-blue-400 font-semibold"> Metabolik Enerji</span> analiz değerleri. 
              Beğendiğiniz yemi tek tıkla çiftliğinizin aktif rasyonuna aktarabilirsiniz.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/yemler"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center space-x-2 transition-colors"
            >
              <Wheat className="w-4 h-4 text-emerald-400" />
              <span>Çiftlik Yemlerim</span>
            </Link>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-2 transition-all shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Fabrika Yemi Ekle</span>
            </button>
          </div>
        </div>

        {/* Quick Besleme Insight Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-slate-400 block font-medium">Standart Süt Yemleri</span>
            <span className="text-white font-bold text-sm">%18 - %19 Protein</span>
            <span className="text-emerald-300/80 block mt-0.5">%25-27 Nişasta</span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-slate-400 block font-medium">Yüksek Verim & Pik</span>
            <span className="text-white font-bold text-sm">%21 - %23 Protein</span>
            <span className="text-amber-300/80 block mt-0.5">%28-30 Nişasta</span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-slate-400 block font-medium">Protein Dengeleyiciler</span>
            <span className="text-white font-bold text-sm">%28 Protein Konsantre</span>
            <span className="text-blue-300/80 block mt-0.5">Silajı zenginleştirir</span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-slate-400 block font-medium">Kuru Dönem & Düve</span>
            <span className="text-white font-bold text-sm">%15 - %16 Protein</span>
            <span className="text-teal-300/80 block mt-0.5">Düşük Ca (Süt humması önler)</span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {importSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-emerald-800 font-bold text-sm shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-emerald-600" />
            <span>{importSuccessMsg}</span>
          </div>
          <Link
            href="/rasyon"
            className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs hover:bg-emerald-800 transition-colors flex items-center space-x-1"
          >
            <span>Rasyona Git</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Search, Filter & Sort Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Marka, ürün adı veya protein ara (örn: Proyem, CP 21, Nişasta...)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
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

        {/* Brand Filters */}
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

        {/* Category Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs border-t border-slate-100 pt-2.5">
          <span className="text-slate-400 font-bold px-1 whitespace-nowrap">Grup:</span>
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

      {/* Feed Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 font-medium">
          Fabrika yemleri yükleniyor...
        </div>
      ) : filteredFeeds.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700">Aradığınız kriterlere uygun fabrika yemi bulunamadı</h3>
          <p className="text-sm text-slate-500">
            Arama filtrenizi temizleyebilir veya yeni bir fabrika yemi ekleyebilirsiniz.
          </p>
          <button
            onClick={() => { setSelectedBrand('ALL'); setSelectedCategory('ALL'); setSearchQuery(''); }}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
          >
            Filtreleri Sıfırla
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFeeds.map((feed) => {
            const inMyFarm = isFeedInMyFarm(feed.name);
            return (
              <div
                key={feed.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Header & Badges */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${getBrandBadgeColor(feed.brand)}`}>
                      {feed.brand}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {feed.categoryLabel || 'Karma Yem'}
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

                  {/* Primary Nutrition Metrics (Protein & Starch) */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {/* Protein Block */}
                    <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-2.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-blue-700">Ham Protein</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div className="flex items-baseline space-x-1 mt-1">
                        <span className="text-2xl font-black text-blue-900 leading-none">
                          %{feed.protein.toFixed(1)}
                        </span>
                      </div>
                      {/* Bar indicator */}
                      <div className="w-full bg-blue-200/70 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full" 
                          style={{ width: `${Math.min(100, (feed.protein / 30) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Starch Block */}
                    <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-800">Nişasta Oranı</span>
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <div className="flex items-baseline space-x-1 mt-1">
                        <span className="text-2xl font-black text-amber-900 leading-none">
                          %{feed.starch.toFixed(1)}
                        </span>
                      </div>
                      {/* Bar indicator */}
                      <div className="w-full bg-amber-200/70 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="bg-amber-600 h-full rounded-full" 
                          style={{ width: `${Math.min(100, (feed.starch / 35) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Secondary Specs: Energy & Fiber */}
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-center">
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
                        {feed.approxPrice.toFixed(2)} ₺
                      </span>
                      <span className="text-[9px] text-slate-400">/ kg</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Button */}
                <div className="p-3 bg-slate-50/70 border-t border-slate-100">
                  {inMyFarm ? (
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

      {/* Modal: Import Feed with Custom Price */}
      {importModalFeed && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-black text-slate-900">Rasyona Yem Aktar</h3>
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
                  Çiftliğe Alış Fiyatınız (₺ / kg)
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
                    ₺ / kg
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  50 kg çuval bedeli: yaklaşık {(parseFloat(customPrice || '0') * 50).toFixed(1)} ₺
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
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={importing}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
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

      {/* Modal: Add New Custom Factory Feed */}
      {showAddModal && (
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
                onClick={() => setShowAddModal(false)}
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
                    placeholder="Örn: Toros Yem, Şenpiliç..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Yem Adı / Çeşidi</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Örn: 20 HP Süt Yemi"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="SUT_YEMI">Standart Süt Yemi</option>
                    <option value="DENGELIYICI">Protein Dengeleyici</option>
                    <option value="KURU_DONEM">Kuru Dönem</option>
                    <option value="DUVE_BUZAGI">Düve / Buzağı</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Piyasa Ref. Fiyat (₺/kg)</label>
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
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={savingNew}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {savingNew ? (
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
    </div>
  );
}
