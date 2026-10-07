'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  Calendar, 
  Zap, 
  Droplet, 
  Stethoscope, 
  Users, 
  Fuel, 
  Sparkles, 
  Wrench, 
  HelpCircle,
  X,
  Check
} from 'lucide-react';
import { MonthlyExpense, ExpenseCategory, DailyProduction } from '@/types';
import ConfirmModal, { ConfirmVariant } from '@/components/ConfirmModal';

const CATEGORY_META: Record<ExpenseCategory, { label: string; icon: any; color: string }> = {
  ELEKTRIK: { label: 'Elektrik', icon: Zap, color: 'text-amber-500 bg-amber-50 border-amber-200' },
  SU: { label: 'Su', icon: Droplet, color: 'text-blue-500 bg-blue-50 border-blue-200' },
  VETERINER_ILAC: { label: 'Veteriner & İlaç', icon: Stethoscope, color: 'text-rose-500 bg-rose-50 border-rose-200' },
  ISCILIK: { label: 'İşçilik / Personel', icon: Users, color: 'text-indigo-500 bg-indigo-50 border-indigo-200' },
  MAZOT_TRAKTOR: { label: 'Mazot & Traktör', icon: Fuel, color: 'text-orange-500 bg-orange-50 border-orange-200' },
  TOHUMLAMA: { label: 'Suni Tohumlama', icon: Sparkles, color: 'text-purple-500 bg-purple-50 border-purple-200' },
  BAKIM_ONARIM: { label: 'Bakım & Onarım', icon: Wrench, color: 'text-slate-600 bg-slate-50 border-slate-200' },
  DIGER: { label: 'Diğer Genel Gider', icon: HelpCircle, color: 'text-teal-600 bg-teal-50 border-teal-200' },
};

export default function ExpensesPage() {
  const currentMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [expenses, setExpenses] = useState<MonthlyExpense[]>([]);
  const [productions, setProductions] = useState<DailyProduction[]>([]);
  const [loading, setLoading] = useState(true);

  // Confirm Modal State
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

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    category: 'ELEKTRIK' as ExpenseCategory,
    amount: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [expRes, prodRes] = await Promise.all([
        fetch(`/api/expenses?month=${selectedMonth}`),
        fetch('/api/production'),
      ]);
      const expData = await expRes.json();
      const prodData = await prodRes.json();
      setExpenses(expData);
      setProductions(prodData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  // Days in selected month
  const daysInMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  }, [selectedMonth]);

  // Calculations
  const totalMonthlyExpense = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [expenses]);

  const dailyAverageExpense = useMemo(() => {
    return daysInMonth > 0 ? totalMonthlyExpense / daysInMonth : 0;
  }, [totalMonthlyExpense, daysInMonth]);

  // Estimated daily milk production for the farm
  const latestProduction = productions[productions.length - 1];
  const dailyTotalMilkLiters = latestProduction ? latestProduction.totalMilk : 500;

  const overheadPerLiter = useMemo(() => {
    return dailyTotalMilkLiters > 0 ? dailyAverageExpense / dailyTotalMilkLiters : 0;
  }, [dailyAverageExpense, dailyTotalMilkLiters]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) return;
    setSaving(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: formData.category,
          amount: parseFloat(formData.amount),
          month: selectedMonth,
          description: formData.description,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ category: 'ELEKTRIK', amount: '', description: '' });
        loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Gider Kaydını Sil',
      message: 'Bu genel gider kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      confirmText: 'Evet, Sil',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
          if (res.ok) {
            loadData();
          }
        } catch (e) {
          console.error(e);
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <Receipt className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Genel Gider Kayıt Sistemi</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Yem dışındaki işletme masraflarını kaydedin, 1 litre süte düşen genel gider payını öğrenin.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Month selector */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-500 ml-2" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-800 pr-2 focus:outline-none"
            />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow-md active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Gider Ekle</span>
          </button>
        </div>
      </div>

      {/* OVERHEAD METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Aylık Toplam Gider */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Aylık Toplam Gider ({selectedMonth})
          </p>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {totalMonthlyExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-sm font-bold text-slate-500">TL</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Bu ay toplam {expenses.length} adet gider kaydı
          </p>
        </div>

        {/* Günlük Ortalama Gider */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Günlük Ortalama Gider
          </p>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {dailyAverageExpense.toFixed(2)}
            </span>
            <span className="text-sm font-bold text-slate-500">TL / gün</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Ayın {daysInMonth} gününe bölünerek hesaplandı
          </p>
        </div>

        {/* 1 Litre Süte Düşen Genel Gider */}
        <div className="bg-gradient-to-br from-indigo-700 to-slate-900 text-white p-5 rounded-2xl shadow-md">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-200">
            1 Litre Süte Düşen Genel Gider
          </p>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-3xl font-black tracking-tight text-white">
              {overheadPerLiter.toFixed(2)}
            </span>
            <span className="text-sm font-bold text-indigo-200">TL / Litre</span>
          </div>
          <p className="text-[11px] text-indigo-200/90 mt-1">
            Günlük {dailyTotalMilkLiters} L toplam süt üretimi bazında
          </p>
        </div>
      </div>

      {/* EXPENSES LIST */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900">
            {selectedMonth} Ayı Masraf Dökümü
          </h2>
          <span className="text-xs font-bold text-slate-500">
            Toplam {expenses.length} kayıt
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Giderler yükleniyor...</div>
        ) : expenses.length === 0 ? (
          <div className="p-8 text-center">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 font-bold">Bu ay için henüz gider kaydı yok</p>
            <p className="text-slate-400 text-xs mt-1">
              Yukarıdaki &quot;Gider Ekle&quot; butonuna basarak elektrik, veteriner veya mazot gideri ekleyin.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {expenses.map((expense) => {
              const meta = CATEGORY_META[expense.category] || CATEGORY_META.DIGER;
              const Icon = meta.icon;

              return (
                <div
                  key={expense.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${meta.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{meta.label}</h3>
                      {expense.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{expense.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="font-black text-slate-900 text-base">
                      {expense.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </span>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Sil"
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

      {/* ADD EXPENSE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">Yeni Gider Ekle</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="mt-4 space-y-4">
              {/* Kategori Seçimi */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Gider Kategorisi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(CATEGORY_META) as ExpenseCategory[]).map((catKey) => {
                    const cat = CATEGORY_META[catKey];
                    const Icon = cat.icon;
                    const isSelected = formData.category === catKey;

                    return (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: catKey }))}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center space-x-2 transition-all ${
                          isSelected
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tutar */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                  Gider Tutarı (TL)
                </label>
                <input
                  type="number"
                  step="1"
                  inputMode="decimal"
                  required
                  placeholder="örn: 3500"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-xl font-black text-slate-900 text-lg focus:bg-white"
                />
              </div>

              {/* Açıklama */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                  Açıklama / Not (Opsiyonel)
                </label>
                <input
                  type="text"
                  placeholder="örn: Sağımhane trafo faturası"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:bg-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirm Modal */}
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
