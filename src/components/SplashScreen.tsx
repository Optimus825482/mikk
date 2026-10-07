'use client';

import { useState, useEffect } from 'react';

export default function SplashScreen() {
  const [stage, setStage] = useState<'enter' | 'visible' | 'exit' | 'done'>('enter');
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // 1. Giriş animasyonunu tetikle (Fade-in + Smooth Zoom)
    const tEnter = setTimeout(() => {
      setStage('visible');
    }, 60);

    // 2. Yükleme barı mikro-ilerlemesi
    const tProg1 = setTimeout(() => {
      setProgress(75);
    }, 450);

    const tProg2 = setTimeout(() => {
      setProgress(100);
    }, 950);

    // 3. Çıkış animasyonunu başlat (Smooth Fade-out + Soft Scale)
    const tExit = setTimeout(() => {
      setStage('exit');
    }, 1350);

    // 4. DOM'dan tamamen kaldır
    const tDone = setTimeout(() => {
      setStage('done');
    }, 1950);

    return () => {
      clearTimeout(tEnter);
      clearTimeout(tProg1);
      clearTimeout(tProg2);
      clearTimeout(tExit);
      clearTimeout(tDone);
    };
  }, []);

  // Kullanıcı ekrana dokunursa veya tıklarsa beklemeden anında geçiş yapabilsin
  const handleDismiss = () => {
    if (stage !== 'exit' && stage !== 'done') {
      setStage('exit');
      setTimeout(() => setStage('done'), 400);
    }
  };

  if (stage === 'done') {
    return null;
  }

  const isVisible = stage === 'visible' || stage === 'exit';

  return (
    <div
      onClick={handleDismiss}
      role="presentation"
      aria-label="MilkIQ Başlangıç Ekranı"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none cursor-pointer bg-gradient-to-b from-[#08121f] via-[#05191a] to-[#020d0b] transition-all duration-600 ease-in-out ${
        stage === 'exit'
          ? 'opacity-0 pointer-events-none scale-105'
          : 'opacity-100 scale-100'
      }`}
    >
      {/* Arka Plan Ambient Neon Işık Aurası */}
      <div className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-48 h-48 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

      {/* Merkez Logo ve Marka Kartı */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Logo Çerçevesi ve Görseli */}
        <div
          className={`relative mb-5 transition-all duration-700 ease-out transform ${
            isVisible
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-85 translate-y-4'
          }`}
        >
          {/* Logo arkası neon ışıma */}
          <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/35 to-teal-400/35 rounded-full blur-2xl opacity-80 animate-pulse pointer-events-none" />
          
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center filter drop-shadow-[0_15px_30px_rgba(16,185,129,0.4)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon-512.png"
              alt="MilkIQ Logo"
              className="w-full h-full object-contain"
              loading="eager"
            />
          </div>
        </div>

        {/* Marka Adı ve Tipografi */}
        <div
          className={`space-y-1.5 transition-all duration-700 delay-150 ease-out transform ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wider flex items-center justify-center space-x-0.5">
            <span>Milk</span>
            <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">IQ</span>
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-emerald-100/90 tracking-wide max-w-xs">
            Akıllı Süt, Rasyon & Maliyet Asistanı
          </p>
        </div>

        {/* Mikro İlerleme Göstergesi */}
        <div
          className={`mt-7 flex flex-col items-center space-y-2.5 transition-all duration-700 delay-300 ease-out ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Neon Çizgi İlerleme Çubuğu */}
          <div className="w-36 sm:w-44 h-1.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-emerald-900/50">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(52,211,153,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className="text-[10px] sm:text-[11px] font-medium text-emerald-300/80 tracking-widest uppercase animate-pulse">
            Sistem Başlatılıyor...
          </span>
        </div>
      </div>

      {/* Alt Bilgi */}
      <div
        className={`absolute bottom-6 text-center text-[10px] text-slate-400/80 font-medium transition-opacity duration-700 delay-500 ${
          isVisible ? 'opacity-70' : 'opacity-0'
        }`}
      >
        Dokunarak atlayabilirsiniz
      </div>
    </div>
  );
}
