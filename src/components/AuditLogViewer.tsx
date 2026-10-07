'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Laptop,
  Smartphone,
  Globe,
  Mail,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { AuditLogItem } from '@/lib/audit';
import ConfirmModal from '@/components/ConfirmModal';

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [level, setLevel] = useState('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '100');
      if (category !== 'ALL') params.set('category', category);
      if (level !== 'ALL') params.set('level', level);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Audit log yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [category, level]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleClearLogs = async () => {
    setClearing(true);
    try {
      const res = await fetch('/api/audit-logs', { method: 'DELETE' });
      if (res.ok) {
        setShowClearConfirm(false);
        fetchLogs();
      }
    } catch (err) {
      console.error('Log temizleme hatası:', err);
    } finally {
      setClearing(false);
    }
  };

  // Seviye Rozet Stili
  const getLevelBadge = (lvl: string) => {
    switch (lvl) {
      case 'ERROR':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-red-100 text-red-800 border border-red-200">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            <span>HATA</span>
          </span>
        );
      case 'WARN':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
            <ShieldAlert className="w-3 h-3 text-amber-600" />
            <span>UYARI</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>BİLGİ</span>
          </span>
        );
    }
  };

  // Kategori Etiket Stili
  const getCategoryBadge = (cat: string) => {
    const colors: Record<string, string> = {
      AUTH: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      RASYON: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      YEM: 'bg-amber-50 text-amber-700 border-amber-200',
      GIDER: 'bg-rose-50 text-rose-700 border-rose-200',
      URETIM: 'bg-blue-50 text-blue-700 border-blue-200',
      AYARLAR: 'bg-purple-50 text-purple-700 border-purple-200',
      SISTEM: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return (
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${colors[cat] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        {cat}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* ÜST BİLGİ & MAİL AYARLARI KÖPRÜSÜ */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Sistem Güvenlik & İşlem Günlüğü (Audit Log)
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Kullanıcı girişleri, rasyon değişiklikleri, yem/gider güncellemeleri ve tüm sistem olayları; IP adresi, konum ve cihaz bilgileriyle birlikte kayıt altına alınır.
          </p>
        </div>

        <Link
          href="/mailayar"
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 shrink-0"
        >
          <Mail className="w-4 h-4" />
          <span>Gmail Hata Bildirim Ayarları →</span>
        </Link>
      </div>

      {/* FİLTRE VE ARAMA ÇUBUĞU */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Arama Formu */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="İşlem, mesaj, IP veya cihaz ara..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-20 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1 bg-slate-200 hover:bg-emerald-600 hover:text-white text-slate-700 font-bold text-xs rounded-lg transition-all"
            >
              Ara
            </button>
          </form>

          {/* Aksiyon Butonları */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={fetchLogs}
              disabled={loading}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 flex items-center space-x-1"
              title="Yenile"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
              <span className="hidden sm:inline">Yenile</span>
            </button>

            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              disabled={logs.length === 0}
              className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all border border-rose-200 flex items-center space-x-1 disabled:opacity-50"
              title="Logları Temizle"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Temizle</span>
            </button>
          </div>
        </div>

        {/* Kategori ve Seviye Filtre Butonları */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Kategori:
            </span>
            {[
              { id: 'ALL', label: 'Tümü' },
              { id: 'AUTH', label: 'Girişler' },
              { id: 'RASYON', label: 'Rasyon' },
              { id: 'YEM', label: 'Yemler' },
              { id: 'GIDER', label: 'Giderler' },
              { id: 'URETIM', label: 'Üretim' },
              { id: 'AYARLAR', label: 'Ayarlar' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategory(tab.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  category === tab.id
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1">Seviye:</span>
            {[
              { id: 'ALL', label: 'Tümü' },
              { id: 'INFO', label: 'Bilgi' },
              { id: 'WARN', label: 'Uyarı' },
              { id: 'ERROR', label: 'Hata' },
            ].map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setLevel(lvl.id)}
                className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                  level === lvl.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LOG LİSTESİ */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-black text-slate-900">Kayıtlı İşlem Geçmişi</h3>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
              {total} Olay
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Son 100 işlem gösteriliyor</span>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Güvenlik ve işlem kayıtları yükleniyor...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Info className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Kayıt bulunamadı</p>
            <p className="text-xs text-slate-400">Seçilen filtrelere uygun herhangi bir audit log kaydı mevcut değil.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const dateStr = new Date(log.createdAt).toLocaleString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div
                  key={log.id}
                  className={`p-4 sm:p-5 transition-colors ${
                    log.level === 'ERROR'
                      ? 'bg-red-50/30 hover:bg-red-50/50'
                      : log.level === 'WARN'
                      ? 'bg-amber-50/30 hover:bg-amber-50/50'
                      : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      {/* Başlık ve Rozetler */}
                      <div className="flex flex-wrap items-center gap-2">
                        {getLevelBadge(log.level)}
                        {getCategoryBadge(log.category)}
                        <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {log.action}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3" />
                          {dateStr}
                        </span>
                      </div>

                      {/* Mesaj */}
                      <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                        {log.message}
                      </p>

                      {/* IP, Konum ve Cihaz Rozetleri */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                        {log.ipAddress && (
                          <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md font-mono">
                            <Globe className="w-3 h-3 text-slate-400" />
                            <span>{log.ipAddress}</span>
                          </span>
                        )}
                        {log.location && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2 py-0.5 rounded-md font-medium">
                            <span>📍 {log.location}</span>
                          </span>
                        )}
                        {log.device && (
                          <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                            {log.device.includes('Mobil') ? (
                              <Smartphone className="w-3 h-3 text-slate-400" />
                            ) : (
                              <Laptop className="w-3 h-3 text-slate-400" />
                            )}
                            <span>{log.device}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Detay Açma Butonu */}
                    {log.details && (
                      <button
                        type="button"
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="self-start px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 shrink-0"
                      >
                        <span>{isExpanded ? 'Detayı Kapat' : 'Detay'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  {/* AKORDEON DETAY PANELİ */}
                  {isExpanded && log.details && (
                    <div className="mt-3 p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto shadow-inner">
                      <pre className="text-[11px] whitespace-pre-wrap word-break">
                        {typeof log.details === 'object'
                          ? JSON.stringify(log.details, null, 2)
                          : String(log.details)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* LOGLARI TEMİZLEME ONAY MODALI */}
      <ConfirmModal
        isOpen={showClearConfirm}
        title="İşlem Günlüğünü Temizle"
        message="Tüm sistem denetim ve işlem geçmişi (Audit Logs) kalıcı olarak silinecektir. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?"
        confirmText={clearing ? 'Temizleniyor...' : 'Evet, Tümünü Temizle'}
        cancelText="Vazgeç"
        onConfirm={handleClearLogs}
        onCancel={() => setShowClearConfirm(false)}
        variant="danger"
      />
    </div>
  );
}
