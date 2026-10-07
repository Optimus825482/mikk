export type FeedType = 'KABA' | 'KESIF';

export type FeedCategory = 
  | 'SILAJ'       // Silajlar (Mısır silajı, sorgum vb.)
  | 'KURU_OT'     // Kuru Otlar (Yonca, çayır otu, korunga vb.)
  | 'SAMAN'       // Saman ve saplar
  | 'YAS_KUSPE'   // Yaş pancar posası (sulu kaba yem)
  | 'HAZIR_YEM'   // Fabrika süt yemleri
  | 'HUBUBAT'     // Hububat & Tane Kırmaları (Arpa ezmesi, dane mısır, mısır flake)
  | 'KUSPE'       // Yağlı tohum küspeleri (Soya, ATK vb.)
  | 'YAN_URUN';   // Kepek ve diğer yan ürünler

export interface FeedCategoryMeta {
  key: FeedCategory;
  label: string;
  type: FeedType;
  defaultMaxLimit: number; // kg/baş/gün önerilen üst sınır
  unit: string;
  warningNote: string;
}

export const FEED_CATEGORY_CONFIG: Record<FeedCategory, FeedCategoryMeta> = {
  SILAJ: {
    key: 'SILAJ',
    label: 'Silaj (Mısır, Ot vb.)',
    type: 'KABA',
    defaultMaxLimit: 28.0,
    unit: 'kg/gün',
    warningNote: 'Aşırı silaj tüketimi (>28 kg) yüksek su ve asit yükü oluşturarak kuru madde alımını kısıtlar.'
  },
  KURU_OT: {
    key: 'KURU_OT',
    label: 'Kuru Ot (Yonca, Çayır vb.)',
    type: 'KABA',
    defaultMaxLimit: 7.0,
    unit: 'kg/gün',
    warningNote: '7-8 kg üzeri kuru ot verilmesi hayvanın yüksek süt verimi için gereken enerjiyi tüketmesini engeller.'
  },
  SAMAN: {
    key: 'SAMAN',
    label: 'Saman & Saplar',
    type: 'KABA',
    defaultMaxLimit: 2.5,
    unit: 'kg/gün',
    warningNote: '2.5 kg üzeri saman verilmesi işkembeyi tıkar (impaction) ve sindirimi bloke eder. İdeal miktar 1-1.5 kg\'dır.'
  },
  YAS_KUSPE: {
    key: 'YAS_KUSPE',
    label: 'Yaş Pancar Posası (Sulu Kaba Yem)',
    type: 'KABA',
    defaultMaxLimit: 15.0,
    unit: 'kg/gün',
    warningNote: 'Yaş pancar posasında 15 kg üzeri sulu dışkılamaya ve kuru madde alımının düşmesine neden olur.'
  },
  HAZIR_YEM: {
    key: 'HAZIR_YEM',
    label: 'Fabrika Süt Yemi',
    type: 'KESIF',
    defaultMaxLimit: 12.0,
    unit: 'kg/gün',
    warningNote: 'Günde 12 kg üzeri hazır kesif yem karaciğer yükünü ve asidoz riskini ciddi oranda artırır.'
  },
  HUBUBAT: {
    key: 'HUBUBAT',
    label: 'Hububat & Tane Kırmaları (Arpa, Mısır, Flake)',
    type: 'KESIF',
    defaultMaxLimit: 5.0,
    unit: 'kg/gün',
    warningNote: '5 kg üzeri tahıl (arpa/mısır) aşırı nişasta yüklemesi yaparak akut ve subakut asidoza (SARA) yol açar.'
  },
  KUSPE: {
    key: 'KUSPE',
    label: 'Yağlı Tohum Küspeleri (Soya, ATK vb.)',
    type: 'KESIF',
    defaultMaxLimit: 3.5,
    unit: 'kg/gün',
    warningNote: '3.5 kg üzeri küspe aşırı protein ve rumen amonyağı yaratarak böbrekleri yorar ve döl tutmayı bozar.'
  },
  YAN_URUN: {
    key: 'YAN_URUN',
    label: 'Kepek & Diğer Yan Ürünler',
    type: 'KESIF',
    defaultMaxLimit: 3.0,
    unit: 'kg/gün',
    warningNote: 'Günde 3 kg üzeri kepek verilmesi fosfor-kalsiyum dengesizliğine ve hafif laksatif etkiye yol açar.'
  }
};

export interface Feed {
  id: string;
  name: string;
  type: FeedType;
  category?: FeedCategory;
  maxLimitKg?: number; // Önerilen günlük maksimum taze kg sınırı
  dryMatter: number;   // Kuru Madde % (örn: 32.0 silaj, 88.0 kuru ot, 90.0 arpa)
  protein: number;     // Ham Protein % (KM üzerinden, örn: 8.5 silaj, 17.5 yonca, 19.0 süt yemi)
  starch: number;      // Nişasta % (KM üzerinden, örn: 30.0 silaj, 55.0 arpa)
  unitPrice: number;   // TL/kg taze yem alış fiyatı
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FactoryFeed {
  id: string;
  brand: string;         // Marka: Proyem, CP Yem, Abalıoğlu, Matlı, Toros, Eriş vb.
  name: string;          // Ürün adı
  category: 'SUT_YEMI' | 'DENGELIYICI' | 'DUVE_BUZAGI' | 'KURU_DONEM';
  categoryLabel?: string;
  protein: number;       // % Ham Protein (min)
  starch: number;        // % Nişasta (tahmini zooteknik değer)
  dryMatter: number;     // % Kuru Madde (standart %88-89)
  energyME: number;      // kcal/kg Metabolik Enerji
  cellulose: number;     // % Ham Selüloz (max)
  calcium?: number;      // % Kalsiyum
  phosphorus?: number;   // % Fosfor
  approxPrice: number;   // Referans piyasa kg fiyatı (TL/kg)
  bagWeight?: number;    // Çuval kg (standart 50 kg)
  description: string;   // Ürün açıklaması ve laktasyon tavsiyesi
  createdAt?: string;
}

export interface RationItemInput {
  feedId: string;
  freshAmount: number; // Günlük verilen taze miktar kg/baş/gün
}

export interface RationItemWithFeed extends RationItemInput {
  feed: Feed;
  dryMatterKg: number;    // Hesaplanan KM miktarı (kg)
  proteinKg: number;       // Hesaplanan Ham Protein (kg)
  starchKg: number;        // Hesaplanan Nişasta (kg)
  costTL: number;          // Taze miktar * birim fiyat (TL)
}

export interface Ration {
  id: string;
  title: string;
  liveWeight: number;      // Ortalama Canlı Ağırlık kg (örn: 600)
  targetMilk: number;      // Hedeflenen Günlük Süt Ortalaması L/gün (örn: 25)
  isActive: boolean;
  notes?: string;
  items: {
    feedId: string;
    freshAmount: number;
    feed?: Feed;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FeedLimitWarning {
  feedId: string;
  feedName: string;
  category?: FeedCategory;
  freshAmount: number;
  maxLimitKg: number;
  warningNote: string;
}

export interface RationCalculationResult {
  // Kuru Madde
  totalFreshKg: number;
  totalDryMatterKg: number;
  targetDryMatterKg: number;
  dryMatterPercentageOfBodyWeight: number; // KM / Canlı Ağırlık %

  // Kuru Madde Tolerans & Durum
  dryMatterStatus: 'IDEAL' | 'SLIGHT_HIGH' | 'CRITICAL_HIGH' | 'SLIGHT_LOW' | 'CRITICAL_LOW';
  dryMatterDiffPercent: number; // Hedefe göre % sapma (+16.2 veya -12.0)
  dryMatterStatusMessage: string;

  // Kaba Yem vs Kesif Yem
  roughageDryMatterKg: number;
  concentrateDryMatterKg: number;
  roughagePercentage: number;   // Kaba yem KM oranı %
  concentratePercentage: number;// Kesif yem KM oranı %
  minRoughageDryMatterKg: number; // Minimum gereken kaba yem KM'si

  // Tolerans & Durum
  roughageStatus: 'IDEAL' | 'WARNING_LOW' | 'CRITICAL_ACIDOSIS' | 'WARNING_HIGH';
  roughageStatusMessage: string;

  // Protein
  totalProteinKg: number;
  totalProteinGrams: number;
  maintenanceProteinGrams: number;
  productionProteinGrams: number;
  proteinPercentageOfRation: number; // Rasyondaki Ham Protein % (KM bazında)

  // Nişasta
  totalStarchKg: number;
  totalStarchGrams: number;
  starchPercentageOfRation: number;  // Rasyondaki Nişasta % (KM bazında)
  starchStatus: 'IDEAL' | 'LOW' | 'HIGH';
  starchStatusMessage: string;

  // Süt Potansiyeli
  potentialMilkLiters: number;       // Bilimsel zooteknik potansiyel (Yaşama payı düşüldükten sonra)
  rawProteinPotentialMilkLiters: number; // Toplam protein / katsayı sadeleştirilmiş hesap
  milkDeficitOrSurplus: number;      // Potansiyel Süt - Hedef Süt

  // Finans ve Maliyet
  dailyFeedCostPerCow: number;       // Günlük yemleme maliyeti TL/baş/gün
  feedCostPerLiter: number;          // 1 Litre sütün yem maliyeti TL/L

  // Üst Sınır / Güvenlik Uyarıları
  limitWarnings: FeedLimitWarning[];
}

export type ExpenseCategory = 
  | 'ELEKTRIK'
  | 'SU'
  | 'VETERINER_ILAC'
  | 'ISCILIK'
  | 'MAZOT_TRAKTOR'
  | 'TOHUMLAMA'
  | 'BAKIM_ONARIM'
  | 'DIGER';

export interface MonthlyExpense {
  id: string;
  category: ExpenseCategory;
  amount: number;         // Tutar TL
  month: string;          // YYYY-MM
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DailyProduction {
  id: string;
  date: string;           // YYYY-MM-DD
  totalMilk: number;      // Toplam litre
  milkingCows: number;    // Sağılan inek sayısı
  averagePerCow: number;  // İnek başı ortalama litre
  notes?: string;
}

export interface SystemSetting {
  id: string;
  farmName?: string;                 // Çiftlik / İşletme Adı
  pinCode: string;
  milkSalePrice: number;             // TL/Litre
  proteinPerLiter: number;           // 1L süt için gram Ham Protein (varsayılan: 90)
  maintenanceProteinFactor: number;  // Canlı ağırlık başına yaşama payı (varsayılan: 0.67 g/kg)
  defaultLiveWeight: number;         // Varsayılan canlı ağırlık (600 kg)
  defaultTargetMilk: number;         // Varsayılan hedef süt (25 L)
}

export interface MonthlyCostReport {
  id: string;
  month: string;                     // YYYY-MM örn: "2026-10"
  title: string;                     // örn: "Ekim 2026 Çiftlik Maliyet & Kârlılık Raporu"
  daysInMonth: number;
  totalMilkProduction: number;       // Litre
  dailyAverageMilk: number;          // Litre/gün
  milkingCowsCount: number;          // Sağılan inek sayısı

  // Litre Başına 4 Temel Metrik
  feedCostPerLiter: number;          // TL/L (ör: 8.72)
  dailyFeedCostPerCow: number;       // TL/baş/gün (ör: 218.05)
  overheadCostPerLiter: number;      // TL/L (ör: 0.63)
  totalCostPerLiter: number;         // TL/L (ör: 9.35)
  netProfitPerLiter: number;         // TL/L (ör: +7.15)
  milkSalePrice: number;             // TL/L (ör: 16.50)

  // Aylık Toplamlar
  totalFeedCost: number;             // TL
  totalOverheadCost: number;         // TL
  totalOperatingCost: number;        // TL (Yem + Genel)
  totalRevenue: number;              // TL (Süt Satış Geliri)
  netProfitTotal: number;            // TL (Net kâr)

  // Gider Kategorisi Dağılımı
  expenseBreakdown: {
    category: ExpenseCategory;
    categoryLabel: string;
    amount: number;
    percentage: number;
  }[];

  notes?: string;
  createdAt: string;
}

