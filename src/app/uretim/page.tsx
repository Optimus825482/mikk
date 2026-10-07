'use client';

import { useState, useEffect } from 'react';
import { 
  Milk, 
  Plus, 
  Calendar, 
  Save, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  X, 
  AlertTriangle, 
  Info,
  Clock
} from 'lucide-react';
import { DailyProduction } from '@/types';
import ConfirmModal, { ConfirmVariant } from '@/components/ConfirmModal';

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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit Modal State
  const [editingProduction, setEditingProduction] = useState<DailyProduction | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTotalMilk, setEditTotalMilk] = useState('');
  const [editMilkingCows, setEditMilkingCows] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    variant?: ConfirmVariant;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const loadProductions = async () => {
    try {
      const res = await fetch('/api/production');
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setProductions(list);
      if (list.length > 0) {
        const last = list[list.length - 1];
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

  // Seçilen tarihe ait mevcut bir kayıt var mı kontrolü (Aynı gün tek kayıt kuralı)
  const existingForSelectedDate = productions.find(p => p.date === date);

  // Otomatik olarak seçilen tarihteki verileri form alanına yükleme opsiyonu
  useEffect(() => {
    if (existingForSelectedDate) {
      setTotalMilk(existingForSelectedDate.totalMilk.toString());
      setMilkingCows(existingForSelectedDate.milkingCows.toString());
      setNotes(existingForSelectedDate.notes || '');
    }
  }, [date]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
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
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: 'success',
          text: existingForSelectedDate 
            ? `${date} tarihli süt kaydı başarıyla güncellendi.` 
            : `${date} tarihli yeni süt kaydı başarıyla eklendi.`
        });
        setTimeout(() => setMessage(null), 4000);
        await loadProductions();
      } else {
        setMessage({ type: 'error', text: data.error || 'Kaydetme sırasında bir hata oluştu.' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.message || 'Bağlantı hatası oluştu.' });
    } finally {
      setSaving(false);
    }
  };

  // Düzenleme Modalını Aç
  const handleOpenEdit = (p: DailyProduction) => {
    setEditingProduction(p);
    setEditDate(p.date);
    setEditTotalMilk(p.totalMilk.toString());
    setEditMilkingCows(p.milkingCows.toString());
    setEditNotes(p.notes || '');
    setEditError('');
  };

  // Düzenlemeyi Kaydet (PUT)
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduction) return;

    // Aynı gün için başka bir kayıt var mı kontrolü
    if (editDate !== editingProduction.date) {
      const duplicate = productions.find(p => p.date === editDate && p.id !== editingProduction.id);
      if (duplicate) {
        setEditError(`${editDate} tarihine ait zaten bir kayıt bulunmaktadır. Aynı gün için tek bir kayıt girilebilir!`);
        return;
      }
    }

    setEditSaving(true);
    setEditError('');
    try {
      const res = await fetch(`/api/production/${editingProduction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: editDate,
          totalMilk: parseFloat(editTotalMilk),
          milkingCows: parseInt(editMilkingCows, 10),
          notes: editNotes,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEditingProduction(null);
        setMessage({ type: 'success', text: `${editDate} tarihli kayıt başarıyla güncellendi.` });
        setTimeout(() => setMessage(null), 4000);
        await loadProductions();
      } else {
        setEditError(data.error || 'Güncelleme yapılamadı.');
      }
    } catch (e: any) {
      setEditError(e?.message || 'Bağlantı hatası oluştu.');
    } finally {
      setEditSaving(false);
    }
  };

  // Silme Onayı Aç (DELETE)
  const handleDeleteClick = (p: DailyProduction) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Süt Kaydını Sil',
      message: `${p.date} tarihli ${p.totalMilk} Litre süt üretim kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      confirmText: 'Evet, Sil',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/production/${p.id}`, { method: 'DELETE' });
          if (res.ok) {
            setMessage({ type: 'success', text: `${p.date} tarihli kayıt başarıyla silindi.` });
            setTimeout(() => setMessage(null), 4000);
            await loadProductions();
          } else {
            const data = await res.json();
            alert(data.error || 'Silme işlemi başarısız.');
          }
        } catch (e) {
          console.error(e);
          alert('Silme sırasında bir hata oluştu.');
        }
      },
    });
  };

  const currentAverage = milkingCows && parseFloat(milkingCows) > 0
    ? (parseFloat(totalMilk || '0') / parseFloat(milkingCows)).toFixed(1)
    : '0.0';

  const editAverage = editMilkingCows && parseFloat(editMilkingCows) > 0
    ? (parseFloat(editTotalMilk || '0') / parseFloat(editMilkingCows)).toFixed(1)
    : '0.0';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Milk className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Günlük Süt Üretim Kaydı</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            İşletmede sağılan günlük toplam sütü girin; litre başı maliyet ve kârlılık analizleri otomatik güncellensin.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
          <Info className="w-4 h-4 text-blue-700 shrink-0" />
          <span className="text-xs font-bold text-blue-900">
            Aynı gün için tek kayıt kuralı etkindir
          </span>
        </div>
      </div>

      {/* BILDIRIM MESAJI */}
      {message && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center space-x-2 animate-in fade-in ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* FORM: Süt Girişi */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
            <span>{existingForSelectedDate ? 'Mevcut Günlük Süt Kaydını Düzenle' : 'Yeni Günlük Süt Girişi'}</span>
          </h2>

          {existingForSelectedDate && (
            <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{date} tarihli kayıt zaten var (Güncelleme Modu)</span>
            </span>
          )}
        </div>

        {/* AYNI GÜN UYARISI BANNERI */}
        {existingForSelectedDate && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Bilgilendirme:</strong> Seçilen tarihe (<strong>{date}</strong>) ait sistemde zaten <strong>{existingForSelectedDate.totalMilk} Litre</strong> ({existingForSelectedDate.milkingCows} İnek) süt kaydı bulunmaktadır. Formu kaydederek mevcut kaydı güncelleyebilir veya aşağıdan dilediğiniz kaydı silebilirsiniz.
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Tarih */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                Tarih
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl px-3 h-12 focus-within:bg-white focus-within:border-blue-500">
                <Calendar className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
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
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-300 rounded-xl font-black text-slate-900 text-xl focus:bg-white focus:border-blue-500 min-w-0"
                />
                <span className="absolute right-3 top-3 text-xs font-bold text-slate-400 pointer-events-none">
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
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-300 rounded-xl font-black text-slate-900 text-xl focus:bg-white focus:border-blue-500 min-w-0"
                />
                <span className="absolute right-3 top-3 text-xs font-bold text-slate-400 pointer-events-none">
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
              <Milk className="w-8 h-8 text-blue-500 opacity-60 shrink-0" />
            </div>

            <div className="sm:col-span-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                placeholder="Güne ait not (Hava sıcaklığı, sağım aksaklığı vb.)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex-1 h-12 px-4 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={saving}
                className={`h-12 px-6 font-black rounded-xl shadow-md flex items-center justify-center space-x-2 shrink-0 transition-all active:scale-95 text-white ${
                  existingForSelectedDate
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>
                  {saving 
                    ? 'Kaydediliyor...' 
                    : existingForSelectedDate 
                    ? 'Mevcut Kaydı Güncelle' 
                    : 'Kaydet'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* RECENT PRODUCTION LOGS WITH EDIT & DELETE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900">Geçmiş Süt Kayıtları</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              İstediğiniz güne ait kaydı düzeltebilir veya silebilirsiniz
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Toplam {productions.length} Kayıt
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-semibold">Kayıtlar yükleniyor...</div>
        ) : productions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Milk className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-600">Henüz kaydedilmiş süt üretimi bulunmuyor.</p>
            <p className="text-xs text-slate-400">Yukarıdaki formdan ilk sağım kaydınızı oluşturabilirsiniz.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {productions
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((p) => {
                const [year, month, day] = p.date.split('-');
                return (
                  <div 
                    key={p.id} 
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Sol: Tarih & Metrikler */}
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col items-center justify-center text-blue-800 shrink-0 shadow-2xs">
                        <span className="text-xs font-black leading-none">{day}</span>
                        <span className="text-[10px] font-bold uppercase opacity-80 mt-0.5">
                          {month}.{year.slice(2)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-slate-900 text-base">
                            {p.totalMilk} Litre
                          </h3>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {p.milkingCows} İnek
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          İnek Başı Ortalama: <strong className="text-blue-700 font-black">{p.averagePerCow} L</strong>
                        </p>
                      </div>
                    </div>

                    {/* Orta: Not */}
                    {p.notes && (
                      <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 max-w-sm truncate self-start sm:self-auto">
                        <span className="font-semibold text-slate-400 mr-1">Not:</span>
                        <span>{p.notes}</span>
                      </div>
                    )}

                    {/* Sağ: Düzenle & Sil Butonları */}
                    <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="px-3 py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs rounded-xl border border-slate-200 hover:border-blue-300 transition-all active:scale-95 flex items-center space-x-1.5"
                        title="Kaydı Düzenle"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Düzenle</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteClick(p)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-200 active:scale-95"
                        title="Kaydı Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* DÜZENLEME MODALI */}
      {editingProduction && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">Süt Kaydını Düzenle</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduction(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs font-bold text-rose-900 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-3">
                {/* Tarih */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                    Tarih
                  </label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:bg-white focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    * Aynı gün için sadece bir kayıt bulunabilir.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Günlük Toplam Süt */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                      Toplam Süt (L)
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      required
                      value={editTotalMilk}
                      onChange={(e) => setEditTotalMilk(e.target.value)}
                      className="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-xl font-black text-slate-900 text-lg focus:bg-white focus:border-blue-500"
                    />
                  </div>

                  {/* Sağılan İnek Sayısı */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                      Sağılan İnek (Baş)
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      required
                      value={editMilkingCows}
                      onChange={(e) => setEditMilkingCows(e.target.value)}
                      className="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-xl font-black text-slate-900 text-lg focus:bg-white focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Hesaplanmış Ortalama */}
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-900">Hesaplanan İnek Başı Ortalama:</span>
                  <strong className="text-sm font-black text-blue-950">{editAverage} L</strong>
                </div>

                {/* Not */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                    Günlük Not
                  </label>
                  <input
                    type="text"
                    placeholder="Güne ait özel not..."
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProduction(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editSaving ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
