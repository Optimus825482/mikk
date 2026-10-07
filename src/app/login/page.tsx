'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Delete, KeyRound, ShieldCheck, ArrowRight, Presentation } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError('');
      // Auto-submit if 4 digits entered
      if (nextPin.length === 4) {
        submitPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const submitPin = async (pinToSubmit: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', pin: pinToSubmit }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Hatalı PIN girdiniz!');
        setPin('');
      }
    } catch {
      setError('Bağlantı hatası oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Logo and Brand */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-2 shadow-xl shadow-emerald-500/20 flex items-center justify-center mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="MilkIQ Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center space-x-1">
            <span>Milk</span>
            <span className="text-emerald-400">IQ</span>
          </h1>
          <p className="text-sm font-medium text-emerald-300/80 mt-1">
            Akıllı Süt, Rasyon & Maliyet Sistemi
          </p>
        </div>

        {/* PIN Card */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-center space-x-2 text-slate-300 text-sm font-semibold mb-4">
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <span>Giriş Şifresi (PIN)</span>
          </div>

          {/* PIN Indicators */}
          <div className="flex justify-center space-x-4 mb-6">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  pin.length > idx
                    ? 'bg-emerald-400 scale-125 shadow-md shadow-emerald-400/50'
                    : 'bg-slate-700 border border-slate-600'
                }`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 text-center py-2 px-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs font-semibold animate-shake">
              {error}
            </div>
          )}

          {/* Prompt Info */}
          <p className="text-center text-[12px] text-slate-400 mb-6">
            Lütfen 4 haneli erişim şifrenizi girin
          </p>

          {/* Touch Numpad */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleDigit(num)}
                disabled={loading}
                className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-emerald-600 active:text-white text-white font-bold text-2xl border border-slate-700/60 transition-all flex items-center justify-center active:scale-95 shadow-sm"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              disabled={loading || pin.length === 0}
              className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-700 text-slate-400 font-semibold text-xs border border-slate-800 transition-all flex items-center justify-center active:scale-95"
            >
              TEMİZLE
            </button>
            <button
              type="button"
              onClick={() => handleDigit('0')}
              disabled={loading}
              className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-emerald-600 active:text-white text-white font-bold text-2xl border border-slate-700/60 transition-all flex items-center justify-center active:scale-95 shadow-sm"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading || pin.length === 0}
              className="h-14 rounded-2xl bg-slate-800/60 hover:bg-slate-700 text-rose-300 border border-slate-800 transition-all flex items-center justify-center active:scale-95"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>

          {/* Direct Submit Button if needed */}
          {pin.length >= 4 && (
            <button
              type="button"
              onClick={() => submitPin(pin)}
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-700/30 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tanıtım Sunumu Butonu */}
        <Link
          href="/tanitim"
          className="mt-4 w-full py-2.5 px-4 bg-slate-900/80 hover:bg-slate-800/90 text-slate-300 hover:text-white rounded-2xl border border-slate-800 text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-xs group"
        >
          <Presentation className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>MilkIQ Ürün Tanıtım Sunumu (Web & PPTX) →</span>
        </Link>

        {/* Security badge footer */}
        <div className="mt-6 flex items-center space-x-2 text-slate-500 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Güvenli Çiftlik Yönetim Sistemi</span>
        </div>
      </div>
    </div>
  );
}
