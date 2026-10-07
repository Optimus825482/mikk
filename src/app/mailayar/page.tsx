'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mail,
  Lock,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Send,
  Save,
  Eye,
  EyeOff,
  Server,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export default function MailAyarPage() {
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activePin, setActivePin] = useState('');

  // Form State
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(465);
  const [smtpSecure, setSmtpSecure] = useState(true);
  const [smtpUser, setSmtpUser] = useState('erkanerdem8254@gmail.com');
  const [smtpPass, setSmtpPass] = useState('');
  const [fromEmail, setFromEmail] = useState('MilkIQ Sistem Bildirimi <erkanerdem8254@gmail.com>');
  const [toEmail, setToEmail] = useState('erkanerdem8254@gmail.com');
  const [isEnabled, setIsEnabled] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);

  // UI State
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sayfa yüklendiğinde sessionStorage'dan oturumu hatırla
  useEffect(() => {
    const savedPin = sessionStorage.getItem('milkiq_mail_pin');
    if (savedPin) {
      loadSettingsWithPin(savedPin);
    }
  }, []);

  const loadSettingsWithPin = async (pin: string) => {
    setLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`/api/mail-settings?pin=${encodeURIComponent(pin)}`);
      if (res.ok) {
        const data = await res.json();
        setSmtpHost(data.smtpHost || 'smtp.gmail.com');
        setSmtpPort(data.smtpPort || 465);
        setSmtpSecure(data.smtpSecure ?? true);
        setSmtpUser(data.smtpUser || 'erkanerdem8254@gmail.com');
        setFromEmail(data.fromEmail || 'MilkIQ Sistem Bildirimi <erkanerdem8254@gmail.com>');
        setToEmail(data.toEmail || 'erkanerdem8254@gmail.com');
        setIsEnabled(Boolean(data.isEnabled));
        setHasPassword(Boolean(data.hasPassword));
        setIsAuthenticated(true);
        setActivePin(pin);
        sessionStorage.setItem('milkiq_mail_pin', pin);
      } else {
        const err = await res.json();
        setAuthError(err.error || 'Geçersiz yetki şifresi!');
        sessionStorage.removeItem('milkiq_mail_pin');
      }
    } catch {
      setAuthError('Sunucu bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) {
      setAuthError('Lütfen yetki şifresini girin.');
      return;
    }
    loadSettingsWithPin(pinInput.trim());
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/mail-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: activePin,
          smtpHost,
          smtpPort: Number(smtpPort),
          smtpSecure,
          smtpUser,
          smtpPass: smtpPass || (hasPassword ? '******' : ''),
          fromEmail,
          toEmail,
          isEnabled,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Mail ayarları veritabanına başarıyla kaydedildi!' });
        if (smtpPass) setHasPassword(true);
        setSmtpPass('');
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Kaydetme işlemi başarısız oldu.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestMail = async () => {
    setTesting(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/mail-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: activePin }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMsg({
          type: 'success',
          text: `Test e-postası başarıyla gönderildi (${toEmail})! Lütfen gelen kutunuzu (Spam dahil) kontrol edin.`,
        });
      } else {
        setStatusMsg({
          type: 'error',
          text: `Test maili gönderilemedi: ${data.error}`,
        });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: `Test maili hatası: ${err?.message}` });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ÜST BAŞLIK */}
        <div className="flex items-center justify-between">
          <Link
            href="/ayarlar"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ayarlar Menüsüne Dön</span>
          </Link>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
            Sistem Güvenlik Yönetimi
          </span>
        </div>

        {/* 1. GİRİŞ KİLİT EKRANI */}
        {!isAuthenticated ? (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            <div className="text-center space-y-3 mb-6">
              <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-2xl mx-auto flex items-center justify-center text-red-400">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Mail & Güvenlik Yönetim Girişi
              </h1>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Bu alana yalnızca sistem yöneticisi erişebilir. Lütfen özel yönetim şifrenizi giriniz.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Yetki Şifresi (PIN)
                </label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Şifreyi giriniz..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-center tracking-widest font-mono text-lg"
                    autoFocus
                  />
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black rounded-xl text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span>Doğrulanıyor...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Güvenli Giriş Yap</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* 2. MAİL AYARLARI YÖNETİM PANELİ */
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-white tracking-tight">
                      Gmail & Hata Bildirim Ayarları
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Uygulama geliştiricisi Erkan Erdem&apos;e hata detayları ve bilgileri anında gönderilir. Uygulama 7/24 geliştirici takibindedir.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black border ${
                      isEnabled
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                    <span>{isEnabled ? 'Bildirimler Aktif' : 'Bildirimler Pasif'}</span>
                  </span>
                </div>
              </div>

              {/* DURUM MESAJI */}
              {statusMsg && (
                <div
                  className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start space-x-3 ${
                    statusMsg.type === 'success'
                      ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-200'
                      : 'bg-red-950/60 border-red-700/80 text-red-200'
                  }`}
                >
                  {statusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{statusMsg.text}</span>
                </div>
              )}

              {/* FORM */}
              <form onSubmit={handleSave} className="space-y-5">
                {/* AKTİF / PASİF TOGGLE */}
                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <label htmlFor="enabled-switch" className="text-sm font-bold text-white block cursor-pointer">
                      E-Posta Hata Bildirim Servisi
                    </label>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Uygulamada beklenmeyen bir hata veya istisna oluştuğunda hemen bildirim maili gönder.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="enabled-switch"
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => setIsEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* SMTP HOST */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      SMTP Sunucu (Host)
                    </label>
                    <div className="relative">
                      <Server className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        placeholder="smtp.gmail.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* SMTP PORT */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      SMTP Port & Güvenlik
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(Number(e.target.value))}
                        className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-emerald-500 text-center"
                        required
                      />
                      <label className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 flex items-center justify-center space-x-1.5 text-xs text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={smtpSecure}
                          onChange={(e) => setSmtpSecure(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-0 bg-slate-900 border-slate-700"
                        />
                        <span>SSL (465)</span>
                      </label>
                    </div>
                  </div>

                  {/* GÖNDERİCİ GMAIL */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Gönderici Gmail Adresi
                    </label>
                    <input
                      type="email"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="erkanerdem8254@gmail.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                      required
                    />
                  </div>

                  {/* GMAIL UYGULAMA ŞİFRESİ */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Gmail Uygulama Şifresi (App Password)
                      </label>
                      {hasPassword && !smtpPass && (
                        <span className="text-[10px] text-emerald-400 font-medium">✓ Kayıtlı Şifre Mevcut</span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={smtpPass}
                        onChange={(e) => setSmtpPass(e.target.value)}
                        placeholder={hasPassword ? 'Mevcut şifreyi değiştirmek için yeni şifre yazın...' : '16 haneli uygulama şifresi'}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-3 pr-10 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* BİLDİRİM ALICI E-POSTA */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Hata Bildirimlerinin Gönderileceği Hedef E-Posta
                    </label>
                    <input
                      type="email"
                      value={toEmail}
                      onChange={(e) => setToEmail(e.target.value)}
                      placeholder="erkanerdem8254@gmail.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                      required
                    />
                  </div>
                </div>

                {/* BUTONLAR */}
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleSendTestMail}
                    disabled={testing || loading}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm transition-all border border-slate-700 flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4 text-emerald-400" />
                    <span>{testing ? 'Test E-postası Gönderiliyor...' : 'Test Maili Gönder'}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Kaydediliyor...' : 'Ayarları Veritabanına Kaydet'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* GMAIL REHBER KUTUSU */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-xs text-slate-400 space-y-3">
              <div className="flex items-center space-x-2 text-slate-200 font-bold">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>Gmail &quot;Uygulama Şifresi&quot; (App Password) Nasıl Alınır?</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1 leading-relaxed">
                <li>
                  Google Hesabınıza giriş yapın: <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline inline-flex items-center gap-0.5">Güvenlik Sayfası <ExternalLink className="w-3 h-3" /></a>
                </li>
                <li><strong>2 Adımlı Doğrulama</strong>&apos;nın açık olduğundan emin olun.</li>
                <li>
                  Arama çubuğuna <strong>&quot;Uygulama Şifreleri&quot;</strong> yazın veya <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline inline-flex items-center gap-0.5">bu bağlantıya gidin <ExternalLink className="w-3 h-3" /></a>.
                </li>
                <li>Uygulama adı olarak <strong>&quot;MilkIQ&quot;</strong> yazıp <strong>Oluştur</strong> butonuna basın.</li>
                <li>Google&apos;ın verdiği <strong>16 karakterlik özel şifreyi</strong> (örn: <code className="bg-slate-950 px-1 py-0.5 rounded text-emerald-300 font-mono">abcd efgh ijkl mnop</code>) kopyalayıp yukarıdaki şifre alanına yapıştırın.</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
