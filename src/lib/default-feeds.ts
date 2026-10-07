import { Feed } from '@/types';

export const DEFAULT_FEEDS: Feed[] = [
  // --- KABA YEMLER ---
  {
    id: 'kaba-misir-silaji',
    name: 'Mısır Silajı (İdeal Kalite)',
    type: 'KABA',
    category: 'SILAJ',
    maxLimitKg: 28.0,
    dryMatter: 32.0,   // %32 Kuru Madde
    protein: 8.5,      // %8.5 Ham Protein (KM bazında)
    starch: 30.0,      // %30 Nişasta
    unitPrice: 2.80,   // 2.80 TL/kg taze
    isDefault: true,
  },
  {
    id: 'kaba-yonca-kuru-otu',
    name: 'Yonca Kuru Otu (%17 HP)',
    type: 'KABA',
    category: 'KURU_OT',
    maxLimitKg: 7.0,
    dryMatter: 88.0,   // %88 Kuru Madde
    protein: 17.5,     // %17.5 Ham Protein
    starch: 2.5,       // %2.5 Nişasta
    unitPrice: 8.50,   // 8.50 TL/kg
    isDefault: true,
  },
  {
    id: 'kaba-bugday-samani',
    name: 'Buğday Samanı',
    type: 'KABA',
    category: 'SAMAN',
    maxLimitKg: 2.5,
    dryMatter: 90.0,   // %90 Kuru Madde
    protein: 3.5,      // %3.5 Ham Protein
    starch: 1.0,       // %1.0 Nişasta
    unitPrice: 2.20,   // 2.20 TL/kg
    isDefault: true,
  },
  {
    id: 'kaba-cayir-otu',
    name: 'Çayır Kuru Otu / Yulaf Otu',
    type: 'KABA',
    category: 'KURU_OT',
    maxLimitKg: 7.0,
    dryMatter: 86.0,
    protein: 10.5,
    starch: 3.0,
    unitPrice: 5.50,
    isDefault: true,
  },
  {
    id: 'kaba-ryegrass-silaji',
    name: 'Ryegrass (İtalyan Çimi Silajı)',
    type: 'KABA',
    category: 'SILAJ',
    maxLimitKg: 25.0,
    dryMatter: 40.0,
    protein: 14.0,
    starch: 4.5,
    unitPrice: 3.60,
    isDefault: true,
  },
  {
    id: 'kaba-seker-pancari-posasi',
    name: 'Şeker Pancarı Posası (Yaş Küspe)',
    type: 'KABA',
    category: 'YAS_KUSPE',
    maxLimitKg: 15.0,
    dryMatter: 18.0,   // %18 Kuru Madde (Sulu Kaba Yem)
    protein: 9.0,      // %9.0 Ham Protein (KM bazında)
    starch: 1.5,       // %1.5 Nişasta
    unitPrice: 1.50,   // 1.50 TL/kg
    isDefault: true,
  },

  // --- KESİF YEMLER ---
  {
    id: 'kesif-sut-yemi-19',
    name: 'Süt Yemi (19 Protein / 2700 ME)',
    type: 'KESIF',
    category: 'HAZIR_YEM',
    maxLimitKg: 12.0,
    dryMatter: 89.0,
    protein: 19.0,
    starch: 26.0,
    unitPrice: 13.50,  // 13.50 TL/kg
    isDefault: true,
  },
  {
    id: 'kesif-sut-yemi-21',
    name: 'Süt Yemi (21 Protein / 2800 ME)',
    type: 'KESIF',
    category: 'HAZIR_YEM',
    maxLimitKg: 12.0,
    dryMatter: 89.0,
    protein: 21.0,
    starch: 28.0,
    unitPrice: 14.80,
    isDefault: true,
  },
  {
    id: 'kesif-arpa-ezmesi',
    name: 'Arpa Ezmesi',
    type: 'KESIF',
    category: 'HUBUBAT',
    maxLimitKg: 4.0,
    dryMatter: 88.0,
    protein: 11.5,
    starch: 56.0,
    unitPrice: 10.20,
    isDefault: true,
  },
  {
    id: 'kesif-misir-kirmasi',
    name: 'Mısır Kırması',
    type: 'KESIF',
    category: 'HUBUBAT',
    maxLimitKg: 5.0,
    dryMatter: 87.0,
    protein: 9.0,
    starch: 68.0,
    unitPrice: 10.80,
    isDefault: true,
  },
  {
    id: 'kesif-misir-flake',
    name: 'Mısır Flake',
    type: 'KESIF',
    category: 'HUBUBAT',
    maxLimitKg: 5.0,
    dryMatter: 88.0,
    protein: 8.8,
    starch: 70.0,
    unitPrice: 11.50,
    isDefault: true,
  },
  {
    id: 'kesif-aycicek-kuspesi',
    name: 'Ayçiçeği Tohumu Küspesi (%36 HP)',
    type: 'KESIF',
    category: 'KUSPE',
    maxLimitKg: 3.5,
    dryMatter: 90.0,
    protein: 36.0,
    starch: 4.0,
    unitPrice: 12.00,
    isDefault: true,
  },
  {
    id: 'kesif-soya-kuspesi',
    name: 'Soya Fasulyesi Küspesi (%46 HP)',
    type: 'KESIF',
    category: 'KUSPE',
    maxLimitKg: 3.0,
    dryMatter: 89.0,
    protein: 46.0,
    starch: 5.0,
    unitPrice: 19.50,
    isDefault: true,
  },
  {
    id: 'kesif-bugday-kepegi',
    name: 'Buğday Kepeği',
    type: 'KESIF',
    category: 'YAN_URUN',
    maxLimitKg: 3.0,
    dryMatter: 88.0,
    protein: 15.0,
    starch: 18.0,
    unitPrice: 8.00,
    isDefault: true,
  },
];
