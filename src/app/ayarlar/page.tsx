'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Settings, 
  KeyRound, 
  Sliders, 
  Database, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  BookOpen,
  BookMarked,
  Search,
  Info,
  Wheat,
  Calculator,
  Scale,
  Receipt,
  TrendingUp,
  HeartHandshake,
  Lightbulb,
  Building2,
  Printer,
  Tractor,
  FolderArchive
} from 'lucide-react';
import { SystemSetting } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/calculator';
import { GLOSSARY_TERMS } from '@/lib/glossary';

function AyarlarContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'ayarlar' | 'kilavuz' | 'sozluk' | 'hakkinda') || 'ayarlar';
  const [activeTab, setActiveTab] = useState<'ayarlar' | 'kilavuz' | 'sozluk' | 'hakkinda'>(initialTab);

  // Glossary Tab State
  const [glossarySearch, setGlossarySearch] = useState('');
  const [glossaryCategory, setGlossaryCategory] = useState<'all' | 'besleme' | 'saglik' | 'ekonomi'>('all');

  const [settings, setSettings] = useState<SystemSetting>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // PIN Change State
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newPinConfirm, setNewPinConfirm] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');
  const [changingPin, setChangingPin] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'kilavuz' || tabParam === 'hakkinda' || tabParam === 'ayarlar' || tabParam === 'sozluk') {
      setActiveTab(tabParam as 'ayarlar' | 'kilavuz' | 'sozluk' | 'hakkinda');
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milkSalePrice: settings.milkSalePrice,
          proteinPerLiter: settings.proteinPerLiter,
          maintenanceProteinFactor: settings.maintenanceProteinFactor,
          defaultLiveWeight: settings.defaultLiveWeight,
          defaultTargetMilk: settings.defaultTargetMilk,
        }),
      });

      if (res.ok) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');

    if (newPin !== newPinConfirm) {
      setPinError('Yeni şifreler birbiriyle eşleşmiyor!');
      return;
    }

    if (newPin.length < 4) {
      setPinError('Yeni şifre en az 4 haneli olmalıdır!');
      return;
    }

    setChangingPin(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_pin',
          oldPin,
          newPin,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPinSuccess('Şifreniz (PIN) başarıyla güncellendi!');
        setOldPin('');
        setNewPin('');
        setNewPinConfirm('');
      } else {
        setPinError(data.error || 'Şifre değiştirilemedi!');
      }
    } catch {
      setPinError('Bağlantı hatası oluştu!');
    } finally {
      setChangingPin(false);
    }
  };

  const filteredGlossaryTerms = GLOSSARY_TERMS.filter((item) => {
    const matchesCategory = glossaryCategory === 'all' || item.category === glossaryCategory;
    const q = glossarySearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.term.toLowerCase().includes(q) ||
      (item.subTitle && item.subTitle.toLowerCase().includes(q)) ||
      item.definition.toLowerCase().includes(q) ||
      item.importance.toLowerCase().includes(q) ||
      (item.examplesOrFormula && item.examplesOrFormula.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Settings className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ayarlar & Bilgi</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Sistem ayarları, kullanım kılavuzu ve MilkIQ hakkında detaylı bilgiler.
          </p>
        </div>

        {/* 4 TABS SELECTOR */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('ayarlar')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'ayarlar'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Sistem Ayarları</span>
          </button>
          <button
            onClick={() => setActiveTab('kilavuz')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'kilavuz'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Kullanım Kılavuzu</span>
          </button>
          <button
            onClick={() => setActiveTab('sozluk')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'sozluk'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Terimler Sözlüğü</span>
          </button>
          <button
            onClick={() => setActiveTab('hakkinda')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'hakkinda'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Hakkında</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SİSTEM AYARLARI */}
      {activeTab === 'ayarlar' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PIN CODE CHANGE */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <KeyRound className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base font-black text-slate-900">Giriş Şifresi (PIN) Değiştir</h2>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Uygulamaya girişte kullanılan 4 haneli şifreyi (varsayılan: <strong>1234</strong>) buradan değiştirebilirsiniz.
                </p>

                {pinError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{pinError}</span>
                  </div>
                )}

                {pinSuccess && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{pinSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleChangePin} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                      Mevcut Şifre
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      required
                      placeholder="Mevcut PIN (örn: 1234)"
                      value={oldPin}
                      onChange={(e) => setOldPin(e.target.value)}
                      className="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-center tracking-widest text-lg focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                      Yeni Şifre
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      required
                      placeholder="Yeni 4 haneli PIN"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      className="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-center tracking-widest text-lg focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                      Yeni Şifre (Tekrar)
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      required
                      placeholder="Yeni PIN'i tekrar girin"
                      value={newPinConfirm}
                      onChange={(e) => setNewPinConfirm(e.target.value)}
                      className="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-center tracking-widest text-lg focus:bg-white"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={changingPin}
                      className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 flex items-center justify-center space-x-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{changingPin ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* RATION & REVENUE COEFFICIENTS */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Sliders className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base font-black text-slate-900">Rasyon & Süt Katsayıları</h2>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Hesaplama motorunun kullandığı besleme normlarını ve süt satış fiyatını belirleyin.
                </p>

                {settingsSaved && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Katsayılar başarıyla kaydedildi!</span>
                  </div>
                )}

                <form onSubmit={handleSaveSettings} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                      1 Litre Süt İçin Gereken Protein (gram)
                    </label>
                    <input
                      type="number"
                      step="1"
                      required
                      value={settings.proteinPerLiter}
                      onChange={(e) => setSettings(prev => ({ ...prev, proteinPerLiter: parseFloat(e.target.value) || 90 }))}
                      className="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-center focus:bg-white"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">Standart: 85 - 95 gram</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                      Yaşama Payı Protein Katsayısı (g / kg CA)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={settings.maintenanceProteinFactor}
                      onChange={(e) => setSettings(prev => ({ ...prev, maintenanceProteinFactor: parseFloat(e.target.value) || 0.67 }))}
                      className="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-center focus:bg-white"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">600 kg inek için ~400 gram yaşama payı</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                      Varsayılan Süt Satış Fiyatı (TL / Litre)
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      required
                      value={settings.milkSalePrice}
                      onChange={(e) => setSettings(prev => ({ ...prev, milkSalePrice: parseFloat(e.target.value) || 16.5 }))}
                      className="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-center focus:bg-white"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 flex items-center justify-center space-x-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>{savingSettings ? 'Kaydediliyor...' : 'Katsayıları Kaydet'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* DATABASE STATUS */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-black">Veritabanı & Sistem Altyapısı</h2>
            </div>
            <p className="text-xs text-slate-300">
              <strong>MilkIQ</strong>; yerel PostgreSQL 17 veritabanı ve güvenli depolama mimarisiyle sıfır kesinti ve anlık reaktif hesaplama sağlar.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: KULLANIM KILAVUZU */}
      {activeTab === 'kilavuz' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200/80 p-5 rounded-2xl text-emerald-950 flex items-start space-x-3">
            <Lightbulb className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold">MilkIQ ile Ulaşacağınız Temel Hedefler:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs text-emerald-900">
                <li>Hayvanlarınızı rumen asidozundan koruyarak sağlıklı, yüksek verimli ve dengeli besleyin.</li>
                <li>Türkiye&apos;nin önde gelen 14 yem fabrikasının 92 çeşit süt yeminin protein ve nişasta analizlerini karşılaştırıp rasyonunuza aktarın.</li>
                <li>Yem karma vagonu (mikser) başında 1 öğünde miksere atılacak net kilogramları hatasız tartın ve A4 PDF çıktısı alın.</li>
                <li>1 Litre sütün yemleme ve genel işletme maliyetini anlık kuruşu kuruşuna bilerek kârlılığınızı güvenceye alın.</li>
              </ul>
            </div>
          </div>

          {/* ADIM 1: YEMLER & FABRİKA YEMLERİ KATALOĞU */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
                1
              </span>
              <div className="flex items-center space-x-2">
                <Wheat className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-black text-slate-900">
                  Yem Yönetimi & Fabrika Yemleri Kataloğu (Yemler Menüsü)
                </h2>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-11">
              <strong>Yemler</strong> menüsü iki ana sekmeden oluşur:
            </p>
            <div className="pl-11 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <strong className="text-emerald-800 block font-bold mb-1">🌾 Çiftlik Yemlerim:</strong>
                İşletmenizde fiilen bulunan kaba ve kesif yemlerin (silaj, yonca, saman, arpa, fabrika yemi vb.) besin değerlerini ve alış fiyatlarını yönetin.
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <strong className="text-blue-800 block font-bold mb-1">🏭 Fabrika Yemleri Kataloğu (92 Çeşit):</strong>
                Proyem, CP, Tarım Kredi, Abalıoğlu, Matlı, Toros, Ofis, Çamlı, Eriş, Özlem ve Trakya Birlik süt yemlerinin Ham Protein (%), Nişasta (%), Enerji (ME) ve Selüloz değerlerini inceleyin; beğendiğiniz yemi tek tıkla çiftliğinize aktarın.
              </div>
            </div>
            <div className="pl-11 pt-1">
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-emerald-950 text-xs">
                🌾 <strong>Yem Referans Rehberi (Kaba Yem & Hububat Kırmaları):</strong> Laboratuvar analizi yaptırmanıza gerek kalmadan; yonca, mısır silajı, pancar posası, saman, fiğ, korunga, reygras gibi kaba yemlerin yanı sıra çiftlikte kullanılan <strong>Arpa Kırması</strong>, <strong>Mısır Kırması</strong> ve <strong>Buğday Kırması</strong> için hem <strong>1. Sınıf (Normal/Dolgun)</strong> hem de <strong>2. Sınıf (Orta Kalite/Cılız)</strong> zooteknik standart KM, Protein, Nişasta ve güvenli üst sınır değerlerini tek tıkla yeni yem ekleme formuna aktarabilirsiniz.
              </div>
            </div>
            <p className="text-[11px] text-slate-500 pl-11">
              💡 <em>İpucu: Sağ üstteki <strong>&quot;Standart Yemler&quot;</strong> butonuna basarak Türkiye koşullarına uygun kaba ve kesif yemleri sıfırlayıp yeniden yükleyebilirsiniz.</em>
            </p>
          </div>

          {/* ADIM 2: RASYON HAZIRLAMA */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
                2
              </span>
              <div className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-black text-slate-900">
                  Rasyon Hazırlayın ve Dengeleyin (Rasyon Stüdyosu)
                </h2>
              </div>
            </div>
            <div className="pl-11 space-y-2 text-xs text-slate-600">
              <p>
                <strong>1. Hayvan Bilgilerini Girin:</strong> İneklerinizin ortalama canlı ağırlığını (örn: 600 kg) ve hedeflediğiniz günlük süt ortalamasını (örn: 25 Litre) belirleyin.
              </p>
              <p>
                <strong>2. Günlük Taze Yem Miktarlarını Girin:</strong> Her yemin karşısındaki kutuya hayvan başına günlük verilecek kilogramı yazın veya <strong>+1kg</strong>, <strong>+0.5kg</strong> butonlarıyla hızlıca artırıp azaltın.
              </p>
              <p>
                <strong>3. &quot;Rasyonu Hesapla & Raporla&quot; Butonuna Basın:</strong> Sistem anında rasyonun toplam Kuru Maddesini (KM), Ham Proteinini, Nişasta miktarını, potansiyel süt verimini ve 1 Litre sütün yem maliyetini hesaplar.
              </p>
            </div>
          </div>

          {/* ADIM 3: KURU MADDE TOLERANSI, KABA YEM & MAKSİMUM TÜKETİM SINIRLARI */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
                3
              </span>
              <div className="flex items-center space-x-2">
                <Scale className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-black text-slate-900">
                  Kuru Madde Tüketim Toleransı, Yem Artığı Koruması & Asidoz Güvenliği
                </h2>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-11">
              İneklerin sağlıklı süt üretebilmesi ve sindirim sisteminin bozulmaması için MilkIQ üç aşamalı zooteknik güvenlik kontrolü uygular:
            </p>
            <div className="pl-11 space-y-2.5 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-950 font-medium">
                🟢 <strong>Kuru Madde Tüketim Toleransı (±%7 Eşik):</strong> Hedeflenen kuru madde ile hesaplanan kuru madde karşılaştırılır. ±%7 aralığında rasyon tam dengelidir.
              </div>
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-950 font-medium">
                🔴 <strong>Aşırı Kuru Madde & Yemlikte Kokuşma Riski (+%15 Üzeri):</strong> Hayvan kapasitesinin üzerinde yem verilirse yemlikte yem artar; fermente olup kokuşur ve küflenir. Kokuşmuş yemlerin üzerine yeni yem dökülmesi asidoz, ketozis ve abomazum deplasmanına neden olur. Sistem bu durumda kırmızı uyarı verir.
              </div>
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-950 font-medium">
                🔴 <strong>Yetersiz Kuru Madde & Açlık Stresi (-%15 Altı):</strong> Yem erkenden biter, hayvan doymadığı için açlık stresine girer ve ani süt verim kaybı yaşanır.
              </div>
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-950 font-medium">
                ⚠️ <strong>Kaba Yem & Zooteknik Yem Üst Sınırları:</strong> Kaba yem oranı %40 altına indiğinde asidoz riski bildirilir; ayrıca 40 kg silaj veya 3 kg üzeri saman gibi riskli tekil miktarlar zooteknik limit sistemiyle anında uyarılır.
              </div>
            </div>
          </div>

          {/* ADIM 4: SÜRÜ YEM KARMA & MİKSER VAGONU HESABI (YENİ ÖZELLİK) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
                4
              </span>
              <div className="flex items-center space-x-2">
                <Tractor className="w-5 h-5 text-emerald-700" />
                <h2 className="text-base font-black text-slate-900">
                  Sürü Yem Karma & Mikser Vagonu Dağıtım Hesabı (Öğünlük Tartım)
                </h2>
              </div>
            </div>
            <div className="pl-11 space-y-2 text-xs text-slate-600">
              <p>
                Rasyon onaylandıktan sonra çiftlik operasyonunu yönetmek için:
              </p>
              <ul className="list-disc list-inside pl-2 space-y-1 text-slate-700 font-medium">
                <li><strong>Toplam Hayvan Sayısını (Baş)</strong> girin (Hızlı butonlar: 10, 20, 30, 50, 75, 100 Baş).</li>
                <li><strong>Günde Kaç Öğün Yemleme</strong> yapıldığını seçin (Günde 1 Öğün, 2 Öğün - Sabah/Akşam veya 3 Öğün).</li>
                <li>Sistem otomatik olarak <strong>yem karma vagonu (mikser) başında operatörün tek seferde atacağı kilogramları</strong> (Mikser Tartım Çizelgesi) hesaplar.</li>
                <li>1 Öğünlük mikser dolum maliyeti ve sürünün günlük toplam yem bütçesi anında görüntülenir.</li>
              </ul>
            </div>
          </div>

          {/* ADIM 5: PROFESYONEL A4 PDF RASYON REÇETESİ (YENİ ÖZELLİK) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
                5
              </span>
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-black text-slate-900">
                  A4 PDF Rasyon Reçetesi Çıktısı (Yazdır / PDF)
                </h2>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-11">
              Rasyon Stüdyosu&apos;ndaki <strong>&quot;🖨️ Rasyonu PDF / Yazdır Olarak Al&quot;</strong> butonuna basarak;
            </p>
            <div className="pl-11 space-y-1.5 text-xs text-slate-700">
              <p>• Sayfadaki tüm menüler gizlenir, temiz ve gölgesiz profesyonel bir A4 reçete sayfası oluşturulur.</p>
              <p>• Çıktıda hayvan başı taze ve KM değerleri, sürü günlük toplamı, 1 öğünlük mikser vagonu tartımı ve sürü besleme notları yer alır.</p>
              <p>• Tarayıcının yazdırma ekranında <em>&quot;PDF Olarak Kaydet&quot;</em> seçilerek arşivlenebilir veya doğrudan yemleme personeline verilebilir.</p>
            </div>
          </div>

          {/* ADIM 6: TARİH DAMGALI RASYON KAYDETME & ARŞİV */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
                6
              </span>
              <div className="flex items-center space-x-2">
                <FolderArchive className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-black text-slate-900">
                  Rasyon Kaydetme & Arşivden Geri Yükleme
                </h2>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-11">
              Hazırladığınız rasyonu dilediğiniz bir isimle (örn: <em>&quot;Bahar Laktasyon 28L&quot;</em>) <strong>&quot;Rasyonu Kaydet&quot;</strong> butonuna basarak tarih damgasıyla sisteme kaydedebilirsiniz. Geçmişte kaydettiğiniz tüm rasyonları dilediğiniz zaman tek tıkla tekrar aktif rasyon olarak yükleyebilirsiniz.
            </p>
          </div>

          {/* ADIM 7: GENEL GİDERLER & SÜT ÜRETİMİ */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
                7
              </span>
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-black text-slate-900">
                  Genel Giderler ve Süt Üretimi Takibi
                </h2>
              </div>
            </div>
            <div className="pl-11 space-y-2 text-xs text-slate-600">
              <p>
                <strong>Giderler Menüsü:</strong> Yem harici elektrik faturası, hayvan sağlığı / veteriner-ilaç, mazot, işçilik gibi masraflarınızı kaydedin. Sistem o ayın gün sayısına bölerek <strong>günlük işletme genel giderinizi</strong> çıkarır.
              </p>
              <p>
                <strong>Süt Üretimi Menüsü:</strong> Günlük sağılan toplam süt miktarını ve inek sayısını girerek sürü ortalama veriminizi takip edin.
              </p>
            </div>
          </div>

          {/* ADIM 8: AYLIK MALİYET, KÂRLILIK & RAPOR ARŞİVİ */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
                8
              </span>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-black text-slate-900">
                  Aylık Maliyet, Kârlılık Zekası & Rapor Arşivi (Maliyet Menüsü)
                </h2>
              </div>
            </div>
            <div className="pl-11 space-y-2 text-xs text-slate-600">
              <p>
                <strong>Maliyet & Kâr Menüsü</strong>, ana sayfadaki kalabalığı önlemek amacıyla işletmenizin tüm finansal analizlerini tek çatı altında toplar:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800 font-bold my-2">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  🥛 <strong>1L Yem Maliyeti:</strong> Rasyon reçetenizin 1 litre süte düşen net yem maliyeti ve inek başı günlük yem tutarı.
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  ⚡ <strong>1L Genel Gider Payı:</strong> O ayki elektrik, mazot, veteriner ve işçilik harcamalarınızın sağılan süte düşen payı.
                </div>
                <div className="bg-slate-900 text-white p-2.5 rounded-xl">
                  🏷️ <strong>1L Toplam Maliyet:</strong> Yem + Genel gider toplamı (Çiftliğin başabaş satış eşiği).
                </div>
                <div className="bg-emerald-50 text-emerald-950 p-2.5 rounded-xl border border-emerald-300">
                  💰 <strong>1L Net Kâr Marjı:</strong> Süt satış fiyatından tüm masraflar düşüldükten sonra kalan net kazanç.
                </div>
              </div>
              <p>
                <strong>Aylık Bazda İnceleme & Arşiv:</strong> İstediğiniz ayı (Ekim, Eylül, Ağustos vb.) seçebilir, o ayın verilerini tek tıkla <strong>&quot;Raporu Arşivle&quot;</strong> butonuyla kaydedebilir ve geçmiş ayların raporlarını dilediğiniz zaman inceleyip A4 PDF çıktısı alabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TERİMLER SÖZLÜĞÜ */}
      {activeTab === 'sozluk' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                  <BookMarked className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Süt Hayvancılığı Terimler Sözlüğü
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    MilkIQ içerisinde ve süt sığırcılığında sıkça kullanılan temel kavramların zooteknik ve veteriner hekimlik açıklamaları.
                  </p>
                </div>
              </div>

              <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
                {filteredGlossaryTerms.length} / {GLOSSARY_TERMS.length} Terim
              </div>
            </div>

            {/* Search & Category Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Terim veya açıklama ara (örn: rasyon, asidoz, kaba yem)..."
                  value={glossarySearch}
                  onChange={(e) => setGlossarySearch(e.target.value)}
                  className="w-full pl-10 pr-16 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
                />
                {glossarySearch && (
                  <button
                    onClick={() => setGlossarySearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    Temizle
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setGlossaryCategory('all')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    glossaryCategory === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tümü ({GLOSSARY_TERMS.length})
                </button>
                <button
                  onClick={() => setGlossaryCategory('besleme')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    glossaryCategory === 'besleme'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  Yem & Besleme
                </button>
                <button
                  onClick={() => setGlossaryCategory('saglik')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    glossaryCategory === 'saglik'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  Sağlık & Fizyoloji
                </button>
                <button
                  onClick={() => setGlossaryCategory('ekonomi')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    glossaryCategory === 'ekonomi'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  Ekonomi & Maliyet
                </button>
              </div>
            </div>
          </div>

          {/* Terms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGlossaryTerms.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-all space-y-3"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-black text-slate-900 tracking-tight">
                        {item.term}
                      </h3>
                      {item.subTitle && (
                        <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                          {item.subTitle}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                        item.category === 'besleme'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.category === 'saglik'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.categoryLabel}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    {item.definition}
                  </p>

                  {item.examplesOrFormula && (
                    <div className="text-[11px] font-mono bg-slate-50 text-slate-700 p-2.5 rounded-xl border border-slate-200/70 leading-relaxed">
                      {item.examplesOrFormula}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="bg-emerald-50/90 border-l-3 border-emerald-600 p-2.5 rounded-r-xl text-emerald-950 flex items-start space-x-2 text-[11px] leading-relaxed">
                    <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item.importance}</span>
                  </div>
                </div>
              </div>
            ))}

            {filteredGlossaryTerms.length === 0 && (
              <div className="col-span-1 md:col-span-2 bg-white p-12 text-center rounded-3xl border border-slate-200">
                <BookMarked className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">Eşleşen terim bulunamadı</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Arama kriterlerinizi değiştirerek veya kategori filtrelerini kaldırarak tekrar deneyebilirsiniz.
                </p>
                <button
                  onClick={() => { setGlossarySearch(''); setGlossaryCategory('all'); }}
                  className="mt-4 px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800 transition-all"
                >
                  Filtreleri Temizle
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: HAKKINDA */}
      {activeTab === 'hakkinda' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 p-2 flex items-center justify-center shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icon.svg" alt="MilkIQ" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  MilkIQ Hakkında
                </h2>
                <p className="text-xs font-semibold text-emerald-700">
                  Akıllı Süt, Rasyon & Maliyet Zekası Platformu
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-700 leading-relaxed font-normal">
              <p>
                <strong>MilkIQ</strong>, başta aile tipi süt sığırcılığı işletmeleri olmak üzere hayvancılıkla uğraşan üreticiler için geliştirilmiş bir karar destek platformudur. İşletmenin en büyük gider kalemi olan yemleme maliyetlerini kolayca hesaplar, yapılan tüm harcamaları tek bir yerde kayıt altına alır ve böylece <strong>1 litre sütün gerçek maliyetini</strong> pratik biçimde ortaya koyar.
              </p>

              <div className="bg-amber-50/90 border-l-4 border-amber-500 p-4 sm:p-5 rounded-r-2xl text-amber-950 text-xs sm:text-sm font-medium shadow-xs">
                <p className="font-bold mb-1.5 text-amber-900 text-sm sm:text-base italic">
                  &quot;Üreterek para kazanmanın yegâne yolu; ya pahalıya satmak ya da ucuza mal etmektir.&quot;
                </p>
                <p className="text-amber-900/90 text-xs sm:text-sm leading-relaxed">
                  Sütün satış fiyatı büyük ölçüde piyasa tarafından belirlendiği için, kârlılığı korumanın en güvenilir yolu maliyetleri kontrol altında tutmak; yani ucuza mal etmek ve verimliliği artırmaktır. MilkIQ tam da bu noktada devreye girer: Üreticinin elinde bulunan yem maddelerinden doğru karışımlar oluşturarak hayvanların yaşam payı ve süt verimi ihtiyaçlarını eksiksiz karşılamayı, böylece verimliliği en üst düzeye çıkarmayı hedefler.
                </p>
              </div>

              <p>
                Platform, rasyonun kuru madde, ham protein ve nişasta oranlarını otomatik olarak dengeler. Rumen sağlığını güvence altına alan kaba yem tolerans göstergesi sayesinde asidoz ve metabolik risklerin önüne geçer. Yem dışındaki elektrik, hayvan sağlığı, işçilik ve mazot gibi genel giderleri de sağılan süt miktarına oranlayarak işletmenin net maliyetini ve anlık kâr marjını yetiştiricinin önüne şeffaf biçimde koyar.
              </p>
            </div>

            {/* DEDICATION BANNER */}
            <div className="mt-6 pt-6 border-t border-slate-100 bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white p-6 sm:p-7 rounded-2xl shadow-md">
              <div className="flex items-start space-x-3.5">
                <HeartHandshake className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block">
                    Geliştirme & İthaf
                  </span>
                  <p className="text-base sm:text-lg font-bold tracking-tight text-white leading-snug">
                    <span className="text-emerald-400 font-black">MilkIQ</span>, <span className="text-white font-black">Veteriner Hekim Erkan Erdem</span> tarafından <span className="text-emerald-300 font-black">Fatih Dinç</span> için geliştirilmiştir. <span className="text-emerald-200">Hayvan besleme, sürü yönetimi ve hayvancılık işletme ekonomisi alanlarındaki saha tecrübesinin modern yazılım teknolojisiyle sentezinden doğmuştur.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500 font-semibold">
        Yükleniyor...
      </div>
    }>
      <AyarlarContent />
    </Suspense>
  );
}
