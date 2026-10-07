'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  Activity,
  Calculator,
  Wheat,
  Scale,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  Server,
  FileSpreadsheet
} from 'lucide-react';

interface SlideData {
  id: number;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

export default function TanitimPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Toplam slayt sayısı
  const TOTAL_SLIDES = 10;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev < TOTAL_SLIDES - 1 ? prev + 1 : 0));
  }, [TOTAL_SLIDES]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : TOTAL_SLIDES - 1));
  }, [TOTAL_SLIDES]);

  // Otomatik oynatma
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        nextSlide();
      }, 7000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, nextSlide]);

  // Klavye kontrolü
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Home') {
        setCurrentSlide(0);
      } else if (e.key === 'End') {
        setCurrentSlide(TOTAL_SLIDES - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, TOTAL_SLIDES]);

  // Dokunmatik Swipe Kontrolü
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Tam ekran kontrolü
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const slides: SlideData[] = [
    // ----------------------------------------------------
    // SLAYT 1: KAPAK
    // ----------------------------------------------------
    {
      id: 1,
      badge: 'BİLİMSEL HAYVANCILIK & FİNANSAL ZEKA',
      badgeColor: 'text-emerald-400 bg-emerald-950/80 border-emerald-800',
      title: 'MilkIQ',
      subtitle: 'Akıllı Süt Sığırcılığı Rasyon & Karlılık Yönetim Sistemi',
      content: (
        <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8 max-w-4xl mx-auto py-4">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition duration-1000"></div>
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-slate-900 border-2 border-emerald-500/50 p-3 shadow-2xl flex items-center justify-center overflow-hidden">
              <Image
                src="/logo.png"
                alt="MilkIQ Logo"
                width={120}
                height={120}
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none">
              Milk<span className="text-emerald-400">IQ</span>
            </h1>
            <p className="text-lg sm:text-2xl font-medium text-slate-300 max-w-2xl mx-auto">
              Modern Süt Çiftlikleri İçin Geleceğin Besleme ve Karlılık Platformu
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-3xl pt-2">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-left">
              <div className="text-emerald-400 font-bold text-sm mb-1 flex items-center gap-1.5">
                <Calculator className="w-4 h-4" /> NRC Standartları
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                KM, Protein, Enerji ve Lif dengesini bilimsel gereksinimlerle tam uyumlu optimize edin.
              </p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-left">
              <div className="text-sky-400 font-bold text-sm mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Süt / Yem Paritesi
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                1 Litre sütün anlık yem maliyetini ve hayvan başı net kar marjını dinamik izleyin.
              </p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-left">
              <div className="text-amber-400 font-bold text-sm mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Güvenlik & Denetim
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tüm hareketleri IP, konum ve cihaz bazında kaydeden kurumsal Audit Log ve Gmail hata altyapısı.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-slate-400">
            <span className="bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
              Geliştirici: <strong className="text-white">Erkan Erdem</strong>
            </span>
            <a
              href="https://erkanerdem.online"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline font-semibold flex items-center gap-1"
            >
              erkanerdem.online <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Kaydırmak için ekranı sola kaydırın veya sağ oku kullanın</span>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // SLAYT 2: SEKTÖREL SORUN & MilkIQ ÇÖZÜMÜ
    // ----------------------------------------------------
    {
      id: 2,
      badge: 'SEKTÖREL GERÇEKLER',
      badgeColor: 'text-amber-400 bg-amber-950/80 border-amber-800',
      title: 'Geleneksel Besleme vs. MilkIQ Çözümü',
      subtitle: 'Yem masrafları çiftlik cirosunun %70’idir. MilkIQ ile kayıpları kazanca dönüştürün.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full max-w-5xl mx-auto py-2">
          {/* Geleneksel */}
          <div className="bg-red-950/20 border-2 border-red-900/50 rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-red-900/40 pb-3">
              <div className="flex items-center gap-2 text-red-400 font-black text-base sm:text-lg">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>Geleneksel / Körleme Yönetim</span>
              </div>
              <span className="text-xs font-bold bg-red-950 text-red-300 border border-red-800 px-2.5 py-1 rounded-lg">
                Riskli & Verimsiz
              </span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold">✕</span>
                <span><strong>Gizli Asidoz Riski:</strong> Göz kararı veya sabit reçeteler nedeniyle rumen pH dalgalanmaları ve ani süt kayıpları.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold">✕</span>
                <span><strong>Bilinmeyen Birim Maliyet:</strong> 1 Litre sütün bugün kaça mal olduğu ve hayvan başı net kar tam bilinemez.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold">✕</span>
                <span><strong>Yüksek Protein/Enerji İsrafı:</strong> Hayvanın laktasyon fazına uymayan lüks tüketim sonucu yem israfı.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold">✕</span>
                <span><strong>Dağınık Kayıtlar:</strong> Kağıt notlar veya karmaşık Excel tablolarında veri kayıpları ve takip imkansızlığı.</span>
              </li>
            </ul>
          </div>

          {/* MilkIQ Çözümü */}
          <div className="bg-emerald-950/20 border-2 border-emerald-600/70 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-base sm:text-lg">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>MilkIQ İle Akıllı Dönüşüm</span>
              </div>
              <span className="text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 px-2.5 py-1 rounded-lg">
                Hassas & Karlı
              </span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Bilimsel Rasyon Dengesi:</strong> KM, HP, ME ve NDF/ADF lif parametreleri saniyeler içinde dengelenir.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Gerçek Zamanlı Parite:</strong> Süt/Yem paritesi anlık hesaplanır; pazar dalgalanmalarında anında aksiyon alınır.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>%15-25 Yem Tasarrufu:</strong> Optimum hammaddelerle rasyon maliyeti düşürülürken süt piki korunur.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>360° İzlenebilirlik:</strong> Mobil uyumlu PWA, bulut yedekleme ve denetimli kurumsal kayıt sistemi.</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // SLAYT 3: AKILLI RASYON OPTİMİZASYONU
    // ----------------------------------------------------
    {
      id: 3,
      badge: 'TEMEL MODÜL 1',
      badgeColor: 'text-emerald-400 bg-emerald-950/80 border-emerald-800',
      title: 'Bilimsel Rasyon Hesaplama & Optimizasyon',
      subtitle: 'Canlı ağırlık, süt verimi ve laktasyon gününe göre miligram hassasiyetinde besin dengesi.',
      content: (
        <div className="space-y-4 max-w-5xl mx-auto w-full py-2">
          {/* Parametre Kartları */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Kuru Madde (KM)
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">22.4 kg</div>
              <span className="text-[10px] text-slate-500">Optimum Rumen Kapasitesi</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Ham Protein (HP)
              </span>
              <div className="text-xl sm:text-2xl font-black text-sky-400">%16.8</div>
              <span className="text-[10px] text-slate-500">Hedef: %16.0 - %17.5</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Net Enerji (ME)
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-400">2.68 Mcal</div>
              <span className="text-[10px] text-slate-500">Pik Verim Enerjisi</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Yapısal Lif (NDF/ADF)
              </span>
              <div className="text-xl sm:text-2xl font-black text-purple-400">%32 / %20</div>
              <span className="text-[10px] text-slate-500">Geviş & Asidoz Koruması</span>
            </div>
          </div>

          {/* Rasyon Simülasyon Arayüzü Önizleme */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Hayvan Profili & Rasyon Hedefleme Simülasyonu</h4>
              </div>
              <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded-full font-mono">
                NRC 2001 / CNCPS Standartları
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <div className="text-slate-400">Canlı Ağırlık</div>
                <div className="text-white font-bold text-sm">650 kg</div>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <div className="text-slate-400">Günlük Süt Hedefi</div>
                <div className="text-emerald-400 font-bold text-sm">32.0 Litre</div>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <div className="text-slate-400">Süt Yağı / Protein</div>
                <div className="text-sky-400 font-bold text-sm">%3.8 / %3.2</div>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <div className="text-slate-400">Laktasyon Günü (DIM)</div>
                <div className="text-amber-400 font-bold text-sm">75 Gün (Pik Faz)</div>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-xl text-xs text-slate-300 flex items-center justify-between">
              <span>🌾 <strong>Otomatik Rasyon Karışımı:</strong> Mısır Silajı (18 kg), Yonca Otu (3.5 kg), Saman (1 kg), Fabrika Yemi & Konsantre (9 kg)</span>
              <span className="text-emerald-400 font-bold font-mono shrink-0 ml-2">Denge Skoru: %98.4</span>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // SLAYT 4: YEM & FABRİKA YEMLERİ KÜTÜPHANESİ
    // ----------------------------------------------------
    {
      id: 4,
      badge: 'TEMEL MODÜL 2',
      badgeColor: 'text-sky-400 bg-sky-950/80 border-sky-800',
      title: 'Zengin Yem & Fabrika Yemleri Kataloğu',
      subtitle: 'Kaba yemlerden tescilli fabrika yemlerine kadar yüzlerce hammadde, fiyat ve besin değeri.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto w-full py-2">
          {/* Kart 1: Kaba Yemler */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                🌾
              </div>
              <h4 className="text-base font-bold text-white">Kaba Yemler & Silajlar</h4>
              <p className="text-xs text-slate-400">
                Rumen mikrobiyal sağlığı ve geviş getirmeyi sağlayan temel lif kaynakları.
              </p>
              <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <div className="flex justify-between py-1"><span>Mısır Silajı (%32 KM)</span> <span className="font-bold text-emerald-400">₺2.80/kg</span></div>
                <div className="flex justify-between py-1"><span>Yonca Kuru Otu (%18 HP)</span> <span className="font-bold text-emerald-400">₺7.50/kg</span></div>
                <div className="flex justify-between py-1"><span>Buğday Samanı</span> <span className="font-bold text-emerald-400">₺2.50/kg</span></div>
                <div className="flex justify-between py-1"><span>Çavdar/Fiğ Silajı</span> <span className="font-bold text-emerald-400">₺3.10/kg</span></div>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 italic">Doğal fermantasyon & nem koruma</div>
          </div>

          {/* Kart 2: Tahıllar & Küspeler */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                🌽
              </div>
              <h4 className="text-base font-bold text-white">Tahıllar & Sanayi Yan Ürünleri</h4>
              <p className="text-xs text-slate-400">
                Yüksek nişasta ve protein desteğiyle süt miktarını ve kalitesini zirveye taşıyan öğeler.
              </p>
              <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <div className="flex justify-between py-1"><span>Mısır Flake (Yüksek Nişasta)</span> <span className="font-bold text-amber-400">₺9.80/kg</span></div>
                <div className="flex justify-between py-1"><span>Arpa Kırması</span> <span className="font-bold text-amber-400">₺8.50/kg</span></div>
                <div className="flex justify-between py-1"><span>Soya Küspesi (%46 HP)</span> <span className="font-bold text-amber-400">₺18.50/kg</span></div>
                <div className="flex justify-between py-1"><span>ATK Ayçiçeği Küspesi</span> <span className="font-bold text-amber-400">₺9.20/kg</span></div>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 italic">Bypass protein & enerji yoğunluğu</div>
          </div>

          {/* Kart 3: Fabrika Yemleri */}
          <div className="bg-slate-900 border-2 border-sky-500/40 rounded-3xl p-5 space-y-3 flex flex-col justify-between shadow-lg">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
                🏭
              </div>
              <h4 className="text-base font-bold text-white">Tescilli Fabrika Yemleri</h4>
              <p className="text-xs text-slate-400">
                Piyasadaki üretici markaların rasyon bileşenleri doğrudan sisteme entegre edilmiştir.
              </p>
              <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <div className="flex justify-between py-1"><span>Eriş Sığır Süt A (19 HP)</span> <span className="font-bold text-sky-400">₺12.40/kg</span></div>
                <div className="flex justify-between py-1"><span>Eriş Crown Patlamış Mısır</span> <span className="font-bold text-sky-400">₺11.80/kg</span></div>
                <div className="flex justify-between py-1"><span>Doğum Öncesi Geçiş Yemi</span> <span className="font-bold text-sky-400">₺13.50/kg</span></div>
                <div className="flex justify-between py-1"><span>Premiks & Mermer Tozu</span> <span className="font-bold text-sky-400">₺15.00/kg</span></div>
              </div>
            </div>
            <div className="text-[11px] text-sky-400 font-semibold">Tek tıkla rasyona dahil edilebilir</div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // SLAYT 5: FİNANSAL ANALİZ VE SÜT/YEM PARİTESİ
    // ----------------------------------------------------
    {
      id: 5,
      badge: 'FİNANSAL ANALİZ',
      badgeColor: 'text-amber-400 bg-amber-950/80 border-amber-800',
      title: 'Süt / Yem Paritesi & Kar Marjı Takibi',
      subtitle: 'Ürettiğiniz sütün yem maliyetini anlık görün, karlılığı şansa bırakmayın.',
      content: (
        <div className="space-y-5 max-w-5xl mx-auto w-full py-2">
          {/* Üç Büyük KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-center space-y-1">
              <span className="text-xs font-bold text-slate-400">1 L SÜTÜN YEM MALİYETİ</span>
              <div className="text-3xl sm:text-4xl font-black text-sky-400">₺ 7.85</div>
              <p className="text-xs text-slate-400 pt-1">
                Günlük toplam rasyon / 32 Litre günlük süt
              </p>
            </div>

            <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-5 text-center space-y-1 shadow-xl">
              <span className="text-xs font-bold text-emerald-400">HAYVAN BAŞI GÜNLÜK NET KAR</span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">+ ₺ 142.50</div>
              <p className="text-xs text-slate-300 pt-1">
                Süt Satış Geliri: ₺480 • Gider: ₺337.50
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-center space-y-1">
              <span className="text-xs font-bold text-amber-400">SÜT / YEM PARİTESİ</span>
              <div className="text-3xl sm:text-4xl font-black text-amber-400">1.48</div>
              <p className="text-xs text-slate-400 pt-1">
                Kritik Eşik: 1.30 • Çiftlik Durumu: <strong className="text-emerald-400">Çok Karlı</strong>
              </p>
            </div>
          </div>

          {/* Finansal Analiz Açıklaması */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Süt/Yem Paritesi Neden Hayati Önem Taşır?
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Süt/Yem paritesi, 1 kg çiğ süt satıldığında satın alınabilen karma yem miktarını temsil eder. Dünya ve Türkiye hayvancılık standartlarında <strong>1.30’un altı</strong> zarar sinyali verirken, <strong>1.50 ve üzeri</strong> işletmenin büyüme ve yatırım yapabilme kabiliyetini gösterir. MilkIQ bu oranı anlık olarak hesaplar ve parite düştüğünde alternatif yem önerileriyle karınızı korur.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span className="bg-red-950 text-red-300 border border-red-800 px-3 py-1 rounded-lg">
                &lt; 1.20 Kırmızı Alarm (Zarar)
              </span>
              <span className="bg-amber-950 text-amber-300 border border-amber-800 px-3 py-1 rounded-lg">
                1.20 - 1.35 Başa Baş Noktası
              </span>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-lg">
                &gt; 1.45 Yüksek Karlılık Bölgesi
              </span>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // SLAYT 6: SÜRÜ & ÜRETİM YÖNETİMİ
    // ----------------------------------------------------
    {
      id: 6,
      badge: 'SÜRÜ YÖNETİMİ',
      badgeColor: 'text-purple-400 bg-purple-950/80 border-purple-800',
      title: 'Laktasyon Dinamikleri & Sürü Grupları',
      subtitle: 'Sürüyü tek tip beslemek zarar getirir. Hayvanları laktasyon evrelerine göre gruplayın.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto w-full py-2">
          {/* Grup 1 */}
          <div className="bg-slate-900 border border-red-900/60 rounded-3xl p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-400 bg-red-950/80 border border-red-800 px-2 py-0.5 rounded-lg">
                  DIM: 1 - 100 Gün
                </span>
                <span className="text-xs text-slate-500">Faz 1</span>
              </div>
              <h4 className="text-base font-bold text-white">Erken Laktasyon (Pik)</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Doğum sonrası negatif enerji dengesinin en kritik olduğu evre. Yüksek enerjili kesif yem, kaliteli yonca ve karaciğer koruyucu premiksler gerekir.
              </p>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl text-[11px] text-red-300 border border-slate-800">
              Hedef: Maksimum pik verimi ve kilo kaybını sınırlama
            </div>
          </div>

          {/* Grup 2 */}
          <div className="bg-slate-900 border border-sky-900/60 rounded-3xl p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 bg-sky-950/80 border border-sky-800 px-2 py-0.5 rounded-lg">
                  DIM: 101 - 200 Gün
                </span>
                <span className="text-xs text-slate-500">Faz 2</span>
              </div>
              <h4 className="text-base font-bold text-white">Orta Laktasyon (Plato)</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Yem tüketim kapasitesinin en üst düzeye ulaştığı dönem. Süt verimi platosunu uzatmak ve kondisyon skorunu korumak için dengeli kaba/kesif yem oranı.
              </p>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl text-[11px] text-sky-300 border border-slate-800">
              Hedef: Düzenli verim ve tohumlama başarısı
            </div>
          </div>

          {/* Grup 3 */}
          <div className="bg-slate-900 border border-emerald-900/60 rounded-3xl p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-lg">
                  DIM: 200+ & Kuru Dönem
                </span>
                <span className="text-xs text-slate-500">Faz 3</span>
              </div>
              <h4 className="text-base font-bold text-white">Geç Laktasyon & Kuru Dönem</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Aşırı yağlanmayı önleyen yüksek lifli, düşük enerjili kaba yem ağırlıklı rasyon. Doğum felcine karşı anyonik tuz dengesi ve meme dokusu yenilenmesi.
              </p>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl text-[11px] text-emerald-300 border border-slate-800">
              Hedef: Sorunsuz doğum ve sağlıklı yeni buzağı
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // SLAYT 7: ÇİFTLİK GENEL GİDERLERİ & GERÇEK MALİYET
    // ----------------------------------------------------
    {
      id: 7,
      badge: 'BÜTÇE & MALİYET',
      badgeColor: 'text-amber-400 bg-amber-950/80 border-amber-800',
      title: 'Çiftlik Giderleri & Gerçek Süt Maliyeti',
      subtitle: 'Sadece yem değil; veteriner, işçilik, elektrik, mazot ve amortismanı da süte yansıtın.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto w-full py-2">
          {/* Gider Kalemleri */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-400" />
              Sabit ve Değişken Gider Kalemleri
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span>💉 <strong>Veteriner & İlaç:</strong> Aşı, tohumlama, tırnak bakımı</span>
                <span className="text-slate-400 font-mono">Aylık Takip</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span>👥 <strong>Personel & İşçilik:</strong> Sağımcı maaşları, SGK, primler</span>
                <span className="text-slate-400 font-mono">Birim Litreye Dağıtım</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span>⚡ <strong>Enerji & Yakıt:</strong> Sağımhane elektriği, traktör mazotu</span>
                <span className="text-slate-400 font-mono">Otomatik Paylaşım</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span>🚜 <strong>Bakım & Amortisman:</strong> Yem karma, traktör, bina yıpranması</span>
                <span className="text-slate-400 font-mono">Yıllık Dağılım</span>
              </div>
            </div>
          </div>

          {/* Formül ve Sonuç */}
          <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="text-base font-bold text-emerald-400">
                1 Litre Sütün Gerçek Toplam Maliyeti
              </h4>
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed">
                Toplam Litre Maliyeti = Yem Maliyeti + (Genel Çiftlik Giderleri / Toplam Üretilen Süt)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                MilkIQ, yem harici tüm çiftlik operasyonel masraflarını üretilen toplam süt litresine dağıtarak gerçek başa baş satış fiyatını hesaplar. Böylece sütü kaça satmanız gerektiğini tam olarak bilirsiniz.
              </p>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-700/60 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-[11px] text-emerald-400 font-bold uppercase">Hesaplanan Gerçek Maliyet</div>
                <div className="text-2xl font-black text-white font-mono">₺ 10.55 / Litre</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-400">Tavsiye Satış Fiyatı:</div>
                <div className="text-base font-bold text-emerald-400">₺ 14.50+ / Litre</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // SLAYT 8: KURUMSAL GÜVENLİK, AUDIT LOG & GMAIL ALARMI
    // ----------------------------------------------------
    {
      id: 8,
      badge: 'GÜVENLİK & DENETİM',
      badgeColor: 'text-emerald-400 bg-emerald-950/80 border-emerald-800',
      title: 'Kurumsal Audit Log & Anlık Gmail Bildirimi',
      subtitle: 'Her hareket IP, konum ve cihazıyla kayıt altında. Sistem hataları anında e-postanızda.',
      content: (
        <div className="space-y-4 max-w-5xl mx-auto w-full py-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                📜
              </div>
              <h4 className="text-base font-bold text-white">Detaylı Audit Log</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kim hangi rasyonu güncelledi, hangi yem fiyatı değiştirildi veya hangi gider silindi; saniyesi saniyesine kayıt altına alınır.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
                🌐
              </div>
              <h4 className="text-base font-bold text-white">IP & Konum Tespiti</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kullanıcının IP adresi, coğrafi konumu (Şehir/Ülke) ve bağlandığı cihaz/tarayıcı bilgisi otomatik loglanır.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 font-bold">
                🚨
              </div>
              <h4 className="text-base font-bold text-white">Gmail Hata Alarmı</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Uygulama geliştiricisi Erkan Erdem&apos;e hata detayları ve bilgileri anında gönderilir. Uygulama 7/24 geliştirici takibindedir.
              </p>
            </div>
          </div>

          {/* Audit Log Canlı Görünüm Simülasyonu */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-[11px] text-slate-300 space-y-1.5">
            <div className="text-slate-500 border-b border-slate-800 pb-1 mb-1">
              [CANLI AUDIT LOG ÖRNEĞİ]
            </div>
            <div className="flex flex-wrap items-center justify-between gap-1 text-emerald-400">
              <span>● [RATION_CALCULATE] &apos;Pik Grup Rasyonu v2&apos; hesaplandı</span>
              <span className="text-slate-500">IP: 88.241.xxx.xxx | İstanbul, TR | Chrome Mobile</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-1 text-sky-400">
              <span>● [FEED_UPDATE] Eriş Sığır Süt A fiyatı ₺12.40 olarak güncellendi</span>
              <span className="text-slate-500">IP: 88.241.xxx.xxx | İstanbul, TR | Desktop Windows</span>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // SLAYT 9: BULUT, MOBİL VE DEPLOYMENT MİMARİSİ
    // ----------------------------------------------------
    {
      id: 9,
      badge: 'MİMARİ & TEKNOLOJİ',
      badgeColor: 'text-sky-400 bg-sky-950/80 border-sky-800',
      title: 'Modern Bulut, Mobil PWA & Docker Altyapısı',
      subtitle: 'Next.js 15, PostgreSQL, Coolify ve Docker ile sıfır konfigürasyon, yüksek hız.',
      content: (
        <div className="space-y-4 max-w-5xl mx-auto w-full py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 mx-auto flex items-center justify-center text-white">
                <Cpu className="w-5 h-5 text-emerald-400" />
              </div>
              <h5 className="font-bold text-white text-sm">Next.js 15 & React 19</h5>
              <p className="text-xs text-slate-400">Ultra hızlı SSR, App Router ve modern web standartları.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 mx-auto flex items-center justify-center text-white">
                <Server className="w-5 h-5 text-sky-400" />
              </div>
              <h5 className="font-bold text-white text-sm">PostgreSQL & Prisma</h5>
              <p className="text-xs text-slate-400">İlişkisel, güvenli veri depolama ve otomatik migration altyapısı.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 mx-auto flex items-center justify-center text-white">
                <Layers className="w-5 h-5 text-amber-400" />
              </div>
              <h5 className="font-bold text-white text-sm">Docker & Coolify</h5>
              <p className="text-xs text-slate-400">milkiq.erkanerdem.online üzerinde izole container mimarisi.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 mx-auto flex items-center justify-center text-white">
                <Smartphone className="w-5 h-5 text-purple-400" />
              </div>
              <h5 className="font-bold text-white text-sm">%100 Mobil PWA</h5>
              <p className="text-xs text-slate-400">Telefona &apos;Ana Ekrana Ekle&apos; ile uygulama gibi tek dokunuşla kullanım.</p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 text-center space-y-2">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
              Canlı Adres: https://milkiq.erkanerdem.online
            </span>
            <p className="text-xs text-slate-300 max-w-xl mx-auto">
              Saha şartlarına uygun yüksek kontrastlı arayüz, tek elle kullanıma uygun butonlar ve çevrimdışı önbellekleme desteği.
            </p>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // SLAYT 10: SONUÇ, KAZANIMLAR & BAŞLAYIN
    // ----------------------------------------------------
    {
      id: 10,
      badge: 'STRATEJİK KAZANIMLAR',
      badgeColor: 'text-emerald-400 bg-emerald-950/80 border-emerald-800',
      title: 'MilkIQ ile Geleceği Bugünden Yönetin',
      subtitle: 'Bilimsel rasyonla maliyetleri düşürün, sürü sağlığını ve süt verimini kalıcı kılın.',
      content: (
        <div className="space-y-6 max-w-4xl mx-auto w-full py-2 text-center">
          {/* 3 Büyük Sonuç Metriği */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/90 border border-emerald-500/50 rounded-3xl p-5 space-y-2">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">%15 - %25</div>
              <div className="text-sm font-bold text-white">Yem Tasarrufu</div>
              <p className="text-xs text-slate-400">Gereksiz aşırı yemleme ve zayiatın önlenmesi</p>
            </div>

            <div className="bg-slate-900/90 border border-sky-500/50 rounded-3xl p-5 space-y-2">
              <div className="text-3xl sm:text-4xl font-black text-sky-400">+ %12</div>
              <div className="text-sm font-bold text-white">Süt Verim Artışı</div>
              <p className="text-xs text-slate-400">Rumen stabilitesi ve pik süresinin uzaması</p>
            </div>

            <div className="bg-slate-900/90 border border-amber-500/50 rounded-3xl p-5 space-y-2">
              <div className="text-3xl sm:text-4xl font-black text-amber-400">360°</div>
              <div className="text-sm font-bold text-white">Finansal Kontrol</div>
              <p className="text-xs text-slate-400">1 L sütün gerçek maliyeti ve hayvan başı net kar</p>
            </div>
          </div>

          {/* Eylem Butonları */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Sistemi Deneyimlemeye Hazır Mısınız?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
              MilkIQ paneline hemen geçerek rasyonunuzu hazırlayabilir, yem fiyatlarınızı girebilir ve paritenizi hesaplayabilirsiniz.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/"
                className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
              >
                <span>MilkIQ Uygulamasına Git</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="/MilkIQ_Tanitim_Sunumu.pptx"
                download="MilkIQ_Tanitim_Sunumu.pptx"
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-2xl border border-slate-700 shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>PPTX Sunumunu İndir</span>
              </a>
            </div>
          </div>

          {/* Alt Künye */}
          <div className="pt-2 text-xs text-slate-500 space-y-1">
            <div>
              Developed by{' '}
              <a
                href="https://erkanerdem.online"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline font-bold"
              >
                Erkan Erdem
              </a>
            </div>
            <div>https://milkiq.erkanerdem.online • 7/24 Geliştirici Takibi & Teknik Destek</div>
          </div>
        </div>
      ),
    },
  ];

  const current = slides[currentSlide];

  return (
    <div
      className="relative min-h-screen bg-[#080d1a] text-slate-100 flex flex-col justify-between overflow-x-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ARKA PLAN DEKORATİF IŞIMALAR */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[120px]" />
      </div>

      {/* 1. ÜST ARAÇ ÇUBUĞU (HEADER) */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-xl bg-slate-900 border border-emerald-500/40 p-1 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-contain" />
            </div>
            <span className="font-black text-lg text-white tracking-tight">
              Milk<span className="text-emerald-400">IQ</span>
            </span>
          </Link>
          <span className="hidden sm:inline-block text-slate-600">|</span>
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-400">
            Ürün & Özellik Tanıtım Sunumu
          </span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Otomatik Oynat Butonu */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              isPlaying
                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
            }`}
            title={isPlaying ? 'Durdur' : 'Otomatik Oynat (7 sn)'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="hidden md:inline">{isPlaying ? 'Durdur' : 'Oynat'}</span>
          </button>

          {/* PPTX İndir Butonu */}
          <a
            href="/MilkIQ_Tanitim_Sunumu.pptx"
            download="MilkIQ_Tanitim_Sunumu.pptx"
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700 transition-all flex items-center gap-1.5"
            title="PowerPoint (PPTX) İndir"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">PPTX İndir</span>
          </a>

          {/* Tam Ekran Butonu */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-xs font-bold bg-slate-900 text-slate-300 border border-slate-800 hover:text-white transition-all"
            title="Tam Ekran"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Uygulamaya Dön */}
          <Link
            href="/"
            className="px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-1"
          >
            <span>Uygulama</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* 2. ANA SLAYT İÇERİĞİ (GÖVDE) */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-8 py-4 sm:py-6 max-w-6xl mx-auto w-full">
        {/* Slayt Başlık Başlangıcı */}
        <div className="text-center space-y-2 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border tracking-wider uppercase font-mono shadow-xs">
            <span className={current.badgeColor.split(' ')[0]}>●</span>
            <span className={current.badgeColor}>{current.badge}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {current.title}
          </h2>

          <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto font-normal">
            {current.subtitle}
          </p>
        </div>

        {/* Dinamik Slayt Gövdesi */}
        <div className="transition-all duration-300 ease-in-out">
          {current.content}
        </div>
      </main>

      {/* 3. ALT NAVİGASYON VE İLERLEME ÇUBUĞU (FOOTER) */}
      <footer className="relative z-20 px-4 sm:px-8 py-3.5 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Sol: İlerleme & Slayt Sayaç */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
            <span className="font-mono text-xs font-black text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1 rounded-lg">
              {currentSlide + 1} / {TOTAL_SLIDES}
            </span>

            {/* Noktalar (Dots) */}
            <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSlide
                      ? 'w-6 bg-emerald-400'
                      : 'w-2 bg-slate-800 hover:bg-slate-700'
                  }`}
                  aria-label={`Slayt ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* İpucu (Mobil & Masaüstü) */}
          <div className="text-[11px] text-slate-500 hidden md:block">
            İpucu: Sola/Sağa kaydırabilir veya klavye ok tuşlarını kullanabilirsiniz.
          </div>

          {/* Sağ: İleri / Geri Butonları */}
          <div className="flex items-center space-x-2">
            <button
              onClick={prevSlide}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white transition-all active:scale-95 flex items-center gap-1 text-xs font-bold"
              aria-label="Önceki Slayt"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Önceki</span>
            </button>

            <button
              onClick={nextSlide}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all active:scale-95 flex items-center gap-1 text-xs font-black shadow-md"
              aria-label="Sonraki Slayt"
            >
              <span>{currentSlide === TOTAL_SLIDES - 1 ? 'Başa Dön' : 'Sonraki'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
