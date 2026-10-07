import fs from 'fs';
import path from 'path';
import { Feed, Ration, MonthlyExpense, DailyProduction, SystemSetting, FactoryFeed, MonthlyCostReport } from '@/types';
import { DEFAULT_FEEDS } from './default-feeds';
import { FACTORY_FEEDS } from './factory-feeds';
import { DEFAULT_SETTINGS } from './calculator';
import { PrismaClient } from '@prisma/client';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'milkiq_store.json');

// Prisma Client Singleton
let globalPrisma: PrismaClient | null = null;
function getPrisma(): PrismaClient | null {
  if (process.env.DATABASE_URL) {
    if (!globalPrisma) {
      try {
        globalPrisma = new PrismaClient();
      } catch {
        globalPrisma = null;
      }
    }
  }
  return globalPrisma;
}

interface LocalStoreData {
  settings: SystemSetting;
  feeds: Feed[];
  rations: Ration[];
  expenses: MonthlyExpense[];
  dailyProductions: DailyProduction[];
  factoryFeeds?: FactoryFeed[];
  costReports?: MonthlyCostReport[];
}

function getInitialStore(): LocalStoreData {
  return {
    settings: { ...DEFAULT_SETTINGS },
    feeds: [...DEFAULT_FEEDS],
    factoryFeeds: [...FACTORY_FEEDS],
    rations: [
      {
        id: 'default-active-ration',
        title: 'Standart Laktasyon Rasyonu',
        liveWeight: 600,
        targetMilk: 25,
        isActive: true,
        notes: '600 kg canlı ağırlık ve 25 L süt için dengelenmiş başlangıç rasyonu.',
        items: [
          { feedId: 'kaba-misir-silaji', freshAmount: 22.0 },
          { feedId: 'kaba-yonca-kuru-otu', freshAmount: 4.5 },
          { feedId: 'kaba-bugday-samani', freshAmount: 1.5 },
          { feedId: 'kesif-sut-yemi-19', freshAmount: 7.0 },
          { feedId: 'kesif-arpa-ezmesi', freshAmount: 2.0 },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    expenses: [
      {
        id: 'exp-1',
        category: 'ELEKTRIK',
        amount: 3200,
        month: new Date().toISOString().slice(0, 7),
        description: 'Sağımhane ve soğutma tankı elektrik faturası',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'exp-2',
        category: 'VETERINER_ILAC',
        amount: 2500,
        month: new Date().toISOString().slice(0, 7),
        description: 'Aşı ve genel sürü sağlığı giderleri',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'exp-3',
        category: 'MAZOT_TRAKTOR',
        amount: 4000,
        month: new Date().toISOString().slice(0, 7),
        description: 'Yem karma vagonu ve traktör yakıtı',
        createdAt: new Date().toISOString(),
      },
    ],
    dailyProductions: [
      {
        id: 'prod-today',
        date: new Date().toISOString().slice(0, 10),
        totalMilk: 500,
        milkingCows: 20,
        averagePerCow: 25.0,
        notes: 'Sabah ve akşam sağımı toplamı',
      }
    ],
  };
}

function readLocalStore(): LocalStoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const initial = getInitialStore();
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    const store = JSON.parse(content) as LocalStoreData;
    if (!store.factoryFeeds || store.factoryFeeds.length === 0) {
      store.factoryFeeds = [...FACTORY_FEEDS];
      writeLocalStore(store);
    } else {
      const existingIds = new Set(store.factoryFeeds.map(f => f.id));
      let hasNew = false;
      for (const ff of FACTORY_FEEDS) {
        if (!existingIds.has(ff.id)) {
          store.factoryFeeds.push(ff);
          hasNew = true;
        }
      }
      if (hasNew) {
        writeLocalStore(store);
      }
    }
    return store;
  } catch {
    return getInitialStore();
  }
}

function writeLocalStore(data: LocalStoreData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Local store write error:', e);
  }
}

// --- SETTINGS & AUTH ---
export async function getSettings(): Promise<SystemSetting> {
  const prisma = getPrisma();
  if (prisma) {
    try {
      const s = await prisma.systemSetting.findUnique({ where: { id: 'singleton' } });
      if (s) {
        return {
          id: s.id,
          pinCode: s.pinCode,
          milkSalePrice: s.milkSalePrice,
          proteinPerLiter: s.proteinPerLiter,
          maintenanceProteinFactor: s.maintenanceProteinFactor,
          defaultLiveWeight: s.defaultLiveWeight,
          defaultTargetMilk: s.defaultTargetMilk,
        };
      }
    } catch {
      // Fallback to local
    }
  }
  const store = readLocalStore();
  return store.settings;
}

export async function updateSettings(updates: Partial<SystemSetting>): Promise<SystemSetting> {
  const store = readLocalStore();
  store.settings = { ...store.settings, ...updates };
  writeLocalStore(store);

  const prisma = getPrisma();
  if (prisma) {
    try {
      await prisma.systemSetting.upsert({
        where: { id: 'singleton' },
        create: {
          id: 'singleton',
          pinCode: store.settings.pinCode,
          milkSalePrice: store.settings.milkSalePrice,
          proteinPerLiter: store.settings.proteinPerLiter,
          maintenanceProteinFactor: store.settings.maintenanceProteinFactor,
          defaultLiveWeight: store.settings.defaultLiveWeight,
          defaultTargetMilk: store.settings.defaultTargetMilk,
        },
        update: {
          pinCode: store.settings.pinCode,
          milkSalePrice: store.settings.milkSalePrice,
          proteinPerLiter: store.settings.proteinPerLiter,
          maintenanceProteinFactor: store.settings.maintenanceProteinFactor,
          defaultLiveWeight: store.settings.defaultLiveWeight,
          defaultTargetMilk: store.settings.defaultTargetMilk,
        },
      });
    } catch {
      // Handled via local
    }
  }

  return store.settings;
}

export async function verifyPin(pin: string): Promise<boolean> {
  const settings = await getSettings();
  return settings.pinCode === pin;
}

export async function changePin(oldPin: string, newPin: string): Promise<{ success: boolean; error?: string }> {
  const settings = await getSettings();
  if (settings.pinCode !== oldPin) {
    return { success: false, error: 'Mevcut şifre (PIN) hatalı!' };
  }
  if (!newPin || newPin.length < 4) {
    return { success: false, error: 'Yeni şifre en az 4 haneli olmalıdır!' };
  }
  await updateSettings({ pinCode: newPin });
  return { success: true };
}

// --- FEEDS ---
export async function getFeeds(): Promise<Feed[]> {
  const store = readLocalStore();
  return store.feeds;
}

export async function addFeed(feed: Omit<Feed, 'id'>): Promise<Feed> {
  const store = readLocalStore();
  const newFeed: Feed = {
    ...feed,
    id: 'feed-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.feeds.push(newFeed);
  writeLocalStore(store);
  return newFeed;
}

export async function updateFeed(id: string, updates: Partial<Feed>): Promise<Feed | null> {
  const store = readLocalStore();
  const index = store.feeds.findIndex(f => f.id === id);
  if (index === -1) return null;
  store.feeds[index] = { ...store.feeds[index], ...updates, updatedAt: new Date().toISOString() };
  writeLocalStore(store);
  return store.feeds[index];
}

export async function deleteFeed(id: string): Promise<boolean> {
  const store = readLocalStore();
  store.feeds = store.feeds.filter(f => f.id !== id);
  writeLocalStore(store);
  return true;
}

export async function resetFeedsToDefaults(): Promise<Feed[]> {
  const store = readLocalStore();
  store.feeds = [...DEFAULT_FEEDS];
  writeLocalStore(store);
  return store.feeds;
}

// --- RATIONS ---
export async function getActiveRation(): Promise<Ration> {
  const store = readLocalStore();
  const active = store.rations.find(r => r.isActive) || store.rations[0];
  if (!active) {
    const initial = getInitialStore().rations[0];
    store.rations.push(initial);
    writeLocalStore(store);
    return initial;
  }
  return active;
}

export async function getRations(): Promise<Ration[]> {
  const store = readLocalStore();
  return store.rations || [];
}

export async function createSavedRation(rationData: Partial<Ration>): Promise<Ration> {
  const store = readLocalStore();
  const id = 'ration-' + Date.now();
  
  // Set all others to inactive if newly saved ration is active
  const shouldBeActive = rationData.isActive ?? true;
  if (shouldBeActive) {
    store.rations.forEach(r => { r.isActive = false; });
  }

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('tr-TR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const newRation: Ration = {
    id,
    title: rationData.title?.trim() || `Rasyon (${dateFormatted})`,
    liveWeight: rationData.liveWeight || 600,
    targetMilk: rationData.targetMilk || 25,
    isActive: shouldBeActive,
    items: rationData.items || [],
    notes: rationData.notes || '',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  store.rations.unshift(newRation);
  writeLocalStore(store);
  return newRation;
}

export async function saveActiveRation(rationData: Partial<Ration>): Promise<Ration> {
  const store = readLocalStore();
  let active = store.rations.find(r => r.isActive);
  if (active) {
    active = {
      ...active,
      ...rationData,
      updatedAt: new Date().toISOString(),
    };
    const idx = store.rations.findIndex(r => r.id === active?.id);
    store.rations[idx] = active;
  } else {
    active = await createSavedRation(rationData);
    return active;
  }
  writeLocalStore(store);
  return active;
}

export async function setActiveRation(id: string): Promise<Ration | null> {
  const store = readLocalStore();
  const target = store.rations.find(r => r.id === id);
  if (!target) return null;
  store.rations.forEach(r => {
    r.isActive = (r.id === id);
  });
  writeLocalStore(store);
  return target;
}

export async function deleteRation(id: string): Promise<boolean> {
  const store = readLocalStore();
  if (store.rations.length <= 1) {
    return false; // Son rasyonu silme
  }
  const wasActive = store.rations.find(r => r.id === id)?.isActive;
  store.rations = store.rations.filter(r => r.id !== id);
  if (wasActive && store.rations.length > 0) {
    store.rations[0].isActive = true;
  }
  writeLocalStore(store);
  return true;
}

// --- EXPENSES ---
export async function getExpenses(month?: string): Promise<MonthlyExpense[]> {
  const store = readLocalStore();
  if (month) {
    return store.expenses.filter(e => e.month === month);
  }
  return store.expenses;
}

export async function addExpense(expense: Omit<MonthlyExpense, 'id'>): Promise<MonthlyExpense> {
  const store = readLocalStore();
  const newExp: MonthlyExpense = {
    ...expense,
    id: 'exp-' + Date.now(),
    createdAt: new Date().toISOString(),
  };
  store.expenses.push(newExp);
  writeLocalStore(store);
  return newExp;
}

export async function deleteExpense(id: string): Promise<boolean> {
  const store = readLocalStore();
  store.expenses = store.expenses.filter(e => e.id !== id);
  writeLocalStore(store);
  return true;
}

// --- DAILY PRODUCTIONS ---
export async function getDailyProductions(): Promise<DailyProduction[]> {
  const store = readLocalStore();
  return store.dailyProductions;
}

export async function saveDailyProduction(entry: Omit<DailyProduction, 'id' | 'averagePerCow'>): Promise<DailyProduction> {
  const store = readLocalStore();
  const averagePerCow = entry.milkingCows > 0
    ? Number((entry.totalMilk / entry.milkingCows).toFixed(1))
    : 0;

  const existingIdx = store.dailyProductions.findIndex(p => p.date === entry.date);
  const newEntry: DailyProduction = {
    ...entry,
    id: existingIdx >= 0 ? store.dailyProductions[existingIdx].id : 'prod-' + Date.now(),
    averagePerCow,
  };

  if (existingIdx >= 0) {
    store.dailyProductions[existingIdx] = newEntry;
  } else {
    store.dailyProductions.push(newEntry);
  }
  writeLocalStore(store);
  return newEntry;
}

// --- FACTORY FEEDS ---
export async function getFactoryFeeds(): Promise<FactoryFeed[]> {
  const store = readLocalStore();
  return store.factoryFeeds || [...FACTORY_FEEDS];
}

export async function addFactoryFeed(feed: Omit<FactoryFeed, 'id' | 'createdAt'>): Promise<FactoryFeed> {
  const store = readLocalStore();
  if (!store.factoryFeeds) {
    store.factoryFeeds = [...FACTORY_FEEDS];
  }
  const newFeed: FactoryFeed = {
    ...feed,
    id: 'factory-' + Date.now(),
    createdAt: new Date().toISOString(),
  };
  store.factoryFeeds.push(newFeed);
  writeLocalStore(store);
  return newFeed;
}

export async function importFactoryFeedToMyFeeds(
  factoryFeedId: string, 
  customPrice?: number
): Promise<{ success: boolean; feed?: Feed; message: string }> {
  const store = readLocalStore();
  const fFeeds = store.factoryFeeds || FACTORY_FEEDS;
  const target = fFeeds.find(f => f.id === factoryFeedId);
  
  if (!target) {
    return { success: false, message: 'Fabrika yemi bulunamadı.' };
  }

  // Kullanıcının mevcut yemlerinde aynı isimde var mı?
  const existing = store.feeds.find(f => f.name.toLowerCase() === target.name.toLowerCase());
  if (existing) {
    return { 
      success: false, 
      feed: existing,
      message: `"${target.name}" zaten çiftlik yem listenizde kayıtlı.` 
    };
  }

  const newFarmFeed: Feed = {
    id: 'kesif-' + Date.now(),
    name: target.name,
    type: 'KESIF',
    category: 'HAZIR_YEM',
    maxLimitKg: 12.0,
    dryMatter: target.dryMatter || 88.0,
    protein: target.protein,
    starch: target.starch,
    unitPrice: customPrice && customPrice > 0 ? customPrice : target.approxPrice,
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.feeds.push(newFarmFeed);
  writeLocalStore(store);

  return {
    success: true,
    feed: newFarmFeed,
    message: `"${target.name}" başarıyla çiftlik yemlerinize eklendi! Artık rasyonda kullanabilirsiniz.`
  };
}

// --- MONTHLY COST REPORTS ---
export async function getCostReports(): Promise<MonthlyCostReport[]> {
  const store = readLocalStore();
  const reports = store.costReports || [];
  return reports.sort((a, b) => b.month.localeCompare(a.month));
}

export async function saveCostReport(report: Omit<MonthlyCostReport, 'id' | 'createdAt'>): Promise<MonthlyCostReport> {
  const store = readLocalStore();
  if (!store.costReports) {
    store.costReports = [];
  }

  // Aynı ay için kayıt varsa güncelle, yoksa yeni ekle
  const existingIndex = store.costReports.findIndex(r => r.month === report.month);
  const newReport: MonthlyCostReport = {
    ...report,
    id: existingIndex >= 0 ? store.costReports[existingIndex].id : 'report-' + Date.now(),
    createdAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    store.costReports[existingIndex] = newReport;
  } else {
    store.costReports.push(newReport);
  }

  writeLocalStore(store);
  return newReport;
}

export async function deleteCostReport(id: string): Promise<boolean> {
  const store = readLocalStore();
  if (!store.costReports) return false;
  store.costReports = store.costReports.filter(r => r.id !== id);
  writeLocalStore(store);
  return true;
}

