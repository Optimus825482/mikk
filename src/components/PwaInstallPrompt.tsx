'use client';

import { useState, useEffect } from 'react';
import { 
  Download, 
  Share, 
  PlusSquare, 
  X, 
  Smartphone, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

interface PwaInstallPromptProps {
  onClosed?: () => void;
}

export default function PwaInstallPrompt({ onClosed }: PwaInstallPromptProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Check if user chose "Don't show again"
    const hidePref = localStorage.getItem('milkiq_hide_install_prompt');
    if (hidePref === 'true') {
      if (onClosed) onClosed();
      return;
    }

    // 2. Check if already installed (standalone mode)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      if (onClosed) onClosed();
      return;
    }

    // 3. Detect mobile device & iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isMobileDevice = /iphone|ipad|ipod|android|mobile/.test(ua);
    const isAppleDevice = /iphone|ipad|ipod/.test(ua);

    setIsIOS(isAppleDevice);

    // 4. Capture beforeinstallprompt for Android/Chrome
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (isMobileDevice) {
        setIsOpen(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // On iOS Safari, beforeinstallprompt does not exist, so show prompt directly on mobile
    if (isAppleDevice && isMobileDevice) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }

    // For Android if beforeinstallprompt takes a moment or for standard mobile browsers
    const fallbackTimer = setTimeout(() => {
      if (isMobileDevice) {
        setIsOpen(true);
      }
    }, 1200);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        closeModal();
      }
      setDeferredPrompt(null);
    } else {
      // If prompt is not supported directly, provide guidance
      alert('Tarayıcınızın menüsünden (üç nokta simgesi) "Ana Ekrana Ekle" veya "Uygulamayı Yükle" seçeneğine dokunabilirsiniz.');
      closeModal();
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setDontShowAgain(checked);
    try {
      if (checked) {
        localStorage.setItem('milkiq_hide_install_prompt', 'true');
      } else {
        localStorage.removeItem('milkiq_hide_install_prompt');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const closeModal = () => {
    try {
      if (dontShowAgain) {
        localStorage.setItem('milkiq_hide_install_prompt', 'true');
      }
    } catch (e) {
      console.error(e);
    }
    setIsOpen(false);
    if (onClosed) onClosed();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm sm:max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 relative flex flex-col justify-between">
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          {/* Header Icon & Title */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-14 h-14 flex items-center justify-center shrink-0 drop-shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon-192.png" alt="MilkIQ Logo" className="w-14 h-14 object-contain" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-black text-slate-900 tracking-tight">MilkIQ</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Mobil Uygulama
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Telefonunuza yükleyin, ahırda ve sahada tek dokunuşla açın!
              </p>
            </div>
          </div>

          {/* Platform Specific Body */}
          {isIOS ? (
            /* iOS Safari Instructions */
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 my-4 space-y-3">
              <div className="flex items-center space-x-2 text-slate-800 text-xs font-bold uppercase tracking-wider">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>iPhone / iPad Ana Ekrana Ekleme:</span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <p className="leading-snug">
                    Safari tarayıcısının alt kısmındaki <strong>Paylaş</strong> simgesine dokunun:
                    <span className="inline-flex items-center mx-1 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-blue-600">
                      <Share className="w-3 h-3 mr-0.5" /> Paylaş
                    </span>
                  </p>
                </div>

                <div className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <p className="leading-snug">
                    Açılan menüde aşağı kaydırarak <strong>&quot;Ana Ekrana Ekle&quot;</strong> seçeneğine dokunun:
                    <span className="inline-flex items-center mx-1 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-700 font-semibold">
                      <PlusSquare className="w-3 h-3 mr-0.5 text-slate-600" /> Ana Ekrana Ekle
                    </span>
                  </p>
                </div>

                <div className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <p className="leading-snug">
                    Sağ üstteki <strong>&quot;Ekle&quot;</strong> butonuna basın. MilkIQ artık ana ekranınızda bir uygulama gibi hazır!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Android / Chrome One-Click Install */
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 my-4 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-950 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Tek Tıkla Uygulama Olarak Yükleyin</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                MilkIQ uygulamasını ana ekranınıza yükleyerek tam ekran deneyimi, hızlı açılış ve kolay rasyon takibi elde edin.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {isIOS ? (
              <button
                type="button"
                onClick={closeModal}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Anladım</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black rounded-xl text-sm transition-all shadow-lg shadow-emerald-700/25 active:scale-95 flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Uygulama Olarak Yükle</span>
              </button>
            )}
          </div>
        </div>

        {/* Don't show again checkbox */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <label className="flex items-center space-x-2 text-xs text-slate-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => handleCheckboxChange(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
            />
            <span>Bir daha gösterme</span>
          </label>

          {!isIOS && (
            <button
              type="button"
              onClick={closeModal}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Şimdi Değil
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
