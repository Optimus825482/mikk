'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  HeartHandshake, 
  X, 
  Check, 
  Sparkles 
} from 'lucide-react';

interface AboutModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function AboutModal({ forceOpen = false, onClose }: AboutModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // 1. Kullanıcı bizzat butona basıp açmak istediyse (forceOpen = true), tercihe bakılmaksızın aç
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    try {
      const hidePref = localStorage.getItem('milkiq_hide_about_modal');
      
      // Kullanıcı "Bir daha gösterme" demişse ASLA otomatik açma
      if (hidePref === 'true') {
        setIsOpen(false);
        return;
      }

      // İlk girişte kısa bir gecikmeyle aç
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    } catch (e) {
      console.error(e);
    }
  }, [forceOpen]);

  // ESC tuşu ile kapatma
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dontShowAgain]);

  const handleCheckboxChange = (checked: boolean) => {
    setDontShowAgain(checked);
    try {
      if (checked) {
        localStorage.setItem('milkiq_hide_about_modal', 'true');
      } else {
        localStorage.removeItem('milkiq_hide_about_modal');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClose = () => {
    try {
      if (dontShowAgain) {
        localStorage.setItem('milkiq_hide_about_modal', 'true');
      }
    } catch (e) {
      console.error(e);
    }
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 relative flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-12 h-12 flex items-center justify-center shrink-0 drop-shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon-192.png" alt="MilkIQ Logo" className="w-12 h-12 object-contain" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-1.5">
                <span>MilkIQ Hakkında</span>
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </h2>
              <p className="text-xs font-semibold text-emerald-700">
                Akıllı Süt, Rasyon & Maliyet Zekası Platformu
              </p>
            </div>
          </div>

          {/* Body Content */}
          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <p>
              <strong>MilkIQ</strong>, başta aile tipi süt sığırcılığı işletmeleri olmak üzere hayvancılıkla uğraşan üreticiler için geliştirilmiş bir karar destek platformudur. İşletmenin en büyük gider kalemi olan yemleme maliyetlerini kolayca hesaplar, yapılan tüm harcamaları tek bir yerde kayıt altına alır ve böylece <strong>1 litre sütün gerçek maliyetini</strong> pratik biçimde ortaya koyar.
            </p>

            {/* Economic Principle Banner */}
            <div className="bg-amber-50/90 border-l-4 border-amber-500 p-4 rounded-r-2xl text-amber-950 font-medium">
              <p className="font-bold text-amber-900 text-xs sm:text-sm italic">
                &quot;Üreterek para kazanmanın yegâne yolu; ya pahalıya satmak ya da ucuza mal etmektir.&quot;
              </p>
              <p className="text-amber-900/90 text-xs mt-1.5 leading-relaxed">
                Sütün satış fiyatı büyük ölçüde piyasa tarafından belirlendiği için, kârlılığı korumanın en güvenilir yolu maliyetleri kontrol altında tutmak; yani ucuza mal etmek ve verimliliği artırmaktır. MilkIQ tam da bu noktada devreye girer: Üreticinin elinde bulunan yem maddelerinden doğru karışımlar oluşturarak hayvanların yaşam payı ve süt verimi ihtiyaçlarını eksiksiz karşılamayı, böylece verimliliği en üst düzeye çıkarmayı hedefler.
              </p>
            </div>

            <p>
              Platform, rasyonun kuru madde, ham protein ve nişasta oranlarını otomatik olarak dengeler. Rumen sağlığını güvence altına alan kaba yem tolerans göstergesi sayesinde asidoz ve metabolik risklerin önüne geçer. Yem dışındaki elektrik, hayvan sağlığı, işçilik ve mazot gibi genel giderleri de sağılan süt miktarına oranlayarak işletmenin net maliyetini ve anlık kâr marjını yetiştiricinin önüne şeffaf biçimde koyar.
            </p>
          </div>

          {/* DEDICATION BANNER */}
          <div className="pt-4 border-t border-slate-100 bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white p-5 rounded-2xl shadow-md">
            <div className="flex items-start space-x-3">
              <HeartHandshake className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                  Geliştirme & İthaf
                </span>
                <p className="text-xs sm:text-sm font-bold tracking-tight text-white leading-snug">
                  <span className="text-emerald-400 font-black">MilkIQ</span>, <span className="text-white font-black">Veteriner Hekim Erkan Erdem</span> tarafından <span className="text-emerald-300 font-black">Fatih Dinç</span> için geliştirilmiştir. <span className="text-emerald-200">Hayvan besleme, sürü yönetimi ve hayvancılık işletme ekonomisi alanlarındaki saha tecrübesinin modern yazılım teknolojisiyle sentezinden doğmuştur.</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer & Checkbox */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <label className="flex items-center space-x-2 text-xs text-slate-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => handleCheckboxChange(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
            />
            <span>Bir daha gösterme</span>
          </label>

          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Uygulamayı Kullanmaya Başla</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
