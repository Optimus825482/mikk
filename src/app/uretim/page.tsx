'use client';

import { useState, useEffect } from 'react';
import { Milk, Plus, Calendar, Save, CheckCircle2 } from 'lucide-react';
import { DailyProduction } from '@/types';

export default function ProductionPage() {
  const [productions, setProductions] = useState<DailyProduction[]>([]);
  const [loading, setLoading] = useState(true);

  // Today's entry form
  const todayStr = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(todayStr);
  const [totalMilk, setTotalMilk] = useState('500');
  const [milkingCows, setMilkingCows] = useState('20');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadProductions = async () => {
    try {
      const res = await fetch('/api/production');
      const data = await res.json();
      setProductions(data);
      if (data && data.length > 0) {
        const last = data[data.length - 1];
        setTotalMilk(last.totalMilk.toString());
        setMilkingCows(last.milkingCows.toString());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductions();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          totalMilk: parseFloat(totalMilk),
          milkingCows: parseInt(milkingCows, 10),
          notes,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        loadProductions();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const currentAverage = milkingCows && parseFloat(milkingCows) > 0
    ? (parseFloat(totalMilk || '0') / parseFloat(milkingCows)).toFixed(1)
    : '0.0';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-2">
          <Milk className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Günlük Süt Üretim Kaydı</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          İşletmede sağılan günlük toplam sütü girin; litre başı maliyet analizleri otomatik güncellensin.
        </p>
      </div>

      {/* FORM: Today's Milk Entry */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-base font-black text-slate-900 mb-4 flex items-center space-x-2">
          <span>Günlük Süt Girişi</span>
          {saved && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Kaydedildi</span>
            </span>
          )}
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Tarih */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                Tarih
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl px-3 h-12">
                <Calendar className="w-5 h-5 text-slate-400 mr-2" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent font-bold text-slate-900 text-sm focus:outline-none w-full"
                />
              </div>
            </div>

            {/* Günlük Toplam Süt (Litre) */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                Günlük Toplam Süt (Litre)
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  required
                  placeholder="500"
                  value={totalMilk}
                  onChange={(e) => setTotalMilk(e.target.value)}
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-300 rounded-xl font-black text-slate-900 text-xl focus:bg-white"
                />
                <span className="absolute right-3 top-3 text-xs font-bold text-slate-400">
                  Litre
                </span>
              </div>
            </div>

            {/* Sağılan İnek Sayısı */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                Sağılan İnek Sayısı (Baş)
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  required
                  placeholder="20"
                  value={milkingCows}
                  onChange={(e) => setMilkingCows(e.target.value)}
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-300 rounded-xl font-black text-slate-900 text-xl focus:bg-white"
                />
                <span className="absolute right-3 top-3 text-xs font-bold text-slate-400">
                  Baş İnek
                </span>
              </div>
            </div>
          </div>

          {/* Average Badge and Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl flex items-center justify-between sm:col-span-1">
              <div>
                <span className="text-[11px] font-bold text-blue-800 uppercase block">İnek Başı Ortalama</span>
                <span className="text-2xl font-black text-blue-950">{currentAverage} L</span>
              </div>
              <Milk className="w-8 h-8 text-blue-500 opacity-60" />
            </div>

            <div className="sm:col-span-2 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Güne ait not (Hava sıcaklığı, sağım aksaklığı vb.)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex-1 h-12 px-4 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
              />
              <button
                type="submit"
                disabled={saving}
                className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md flex items-center space-x-2 shrink-0 transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* RECENT PRODUCTION LOGS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900">Geçmiş Süt Kayıtları</h2>
          <span className="text-xs font-bold text-slate-500">{productions.length} Kayıt</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Yükleniyor...</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {productions.slice().reverse().map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                    {p.date.slice(8, 10)}.{p.date.slice(5, 7)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {p.totalMilk} Litre Süt
                    </h3>
                    <p className="text-xs text-slate-500">
                      {p.milkingCows} İnek | İnek Başı: <strong className="text-slate-700">{p.averagePerCow} L</strong>
                    </p>
                  </div>
                </div>

                {p.notes && (
                  <span className="text-xs text-slate-400 italic hidden sm:block">
                    {p.notes}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
