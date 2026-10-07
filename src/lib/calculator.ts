import { 
  Feed, 
  RationItemInput, 
  RationCalculationResult, 
  SystemSetting, 
  FEED_CATEGORY_CONFIG, 
  FeedLimitWarning 
} from '@/types';

export const DEFAULT_SETTINGS: SystemSetting = {
  id: 'singleton',
  pinCode: '1234',
  milkSalePrice: 16.5,              // TL/Litre
  proteinPerLiter: 90.0,             // 1 Litre süt için gram Ham Protein
  maintenanceProteinFactor: 0.67,    // Canlı ağırlık başına yaşama payı (g/kg)
  defaultLiveWeight: 600.0,          // 600 kg canlı ağırlık
  defaultTargetMilk: 25.0,           // 25 Litre hedef süt
};

export function calculateRation(
  items: RationItemInput[],
  allFeeds: Feed[],
  liveWeight: number = 600,
  targetMilk: number = 25,
  settings: SystemSetting = DEFAULT_SETTINGS
): RationCalculationResult {
  const safeLiveWeight = Math.max(200, liveWeight || 600);
  const safeTargetMilk = Math.max(0, targetMilk || 0);

  // Hayvanın tahmini günlük kuru madde tüketim kapasitesi (KMT)
  // Formül: Canlı Ağırlık * %2.5 + Hedef Süt * %10
  const targetDryMatterKg = (safeLiveWeight * 0.025) + (safeTargetMilk * 0.10);

  // İşkembe (Rumen) sağlığı için asgari gereken kaba yem kuru maddesi
  // Canlı ağırlığın %1.2 - 1.4'ü kadar kaba yem KM'si
  const minRoughageDryMatterKg = safeLiveWeight * 0.013;

  let totalFreshKg = 0;
  let totalDryMatterKg = 0;
  let roughageDryMatterKg = 0;
  let concentrateDryMatterKg = 0;

  let totalProteinKg = 0;
  let totalStarchKg = 0;
  let dailyFeedCostPerCow = 0;

  const feedMap = new Map<string, Feed>();
  allFeeds.forEach(f => feedMap.set(f.id, f));

  items.forEach(item => {
    const freshAmount = Math.max(0, item.freshAmount || 0);
    if (freshAmount <= 0) return;

    const feed = feedMap.get(item.feedId);
    if (!feed) return;

    totalFreshKg += freshAmount;
    dailyFeedCostPerCow += freshAmount * (feed.unitPrice || 0);

    // Kuru Madde Hesabı
    const feedDryMatterKg = freshAmount * (feed.dryMatter / 100);
    totalDryMatterKg += feedDryMatterKg;

    if (feed.type === 'KABA') {
      roughageDryMatterKg += feedDryMatterKg;
    } else {
      concentrateDryMatterKg += feedDryMatterKg;
    }

    // Besin Maddeleri (KM üzerinden hesaplanır)
    const feedProteinKg = feedDryMatterKg * (feed.protein / 100);
    const feedStarchKg = feedDryMatterKg * (feed.starch / 100);

    totalProteinKg += feedProteinKg;
    totalStarchKg += feedStarchKg;
  });

  // Kaba Yem vs Kesif Yem Yüzdesi
  const roughagePercentage = totalDryMatterKg > 0
    ? (roughageDryMatterKg / totalDryMatterKg) * 100
    : 0;

  const concentratePercentage = totalDryMatterKg > 0
    ? (concentrateDryMatterKg / totalDryMatterKg) * 100
    : 0;

  const dryMatterPercentageOfBodyWeight = safeLiveWeight > 0
    ? (totalDryMatterKg / safeLiveWeight) * 100
    : 0;

  // Kuru Madde Tolerans ve Besleme Değerlendirmesi (Hedef vs Gerçekleşen)
  let dryMatterStatus: RationCalculationResult['dryMatterStatus'] = 'IDEAL';
  let dryMatterDiffPercent = 0;
  let dryMatterStatusMessage = 'Rasyona yem ekleyerek kuru madde dengesini görüntüleyin.';

  if (targetDryMatterKg > 0 && totalDryMatterKg > 0) {
    dryMatterDiffPercent = Number((((totalDryMatterKg - targetDryMatterKg) / targetDryMatterKg) * 100).toFixed(1));

    if (dryMatterDiffPercent > 15) {
      dryMatterStatus = 'CRITICAL_HIGH';
      dryMatterStatusMessage = `🔴 AŞIRI YEM ARTIĞI & KOKUŞMA TEHLİKESİ (+%${dryMatterDiffPercent}): Hayvan bu miktardaki kuru maddeyi (${totalDryMatterKg.toFixed(2)} kg / hedef ${targetDryMatterKg.toFixed(2)} kg) tüketemez! Yemlikte yem artar, fermente olup kokuşur ve küflenir. Kokuşmuş yemlerin üzerine yeni yem dökülmesi asidoz, ketozis ve abomazum deplasmanı gibi ciddi sindirim sorunlarına yol açar. Taze yem miktarlarını düşürün!`;
    } else if (dryMatterDiffPercent > 7) {
      dryMatterStatus = 'SLIGHT_HIGH';
      dryMatterStatusMessage = `🟡 KAPASİTE SINIRINDA (+%${dryMatterDiffPercent}): Kuru madde miktarı hedefin üzerindedir. İşkembede aşırı dolgunluk oluşur ve yemlikte artık kalabilir; tüketim hızını izleyin.`;
    } else if (dryMatterDiffPercent < -15) {
      dryMatterStatus = 'CRITICAL_LOW';
      dryMatterStatusMessage = `🔴 AÇLIK STRESİ & VERİM KAYBI (-%${Math.abs(dryMatterDiffPercent)}): Verilen kuru madde (${totalDryMatterKg.toFixed(2)} kg / hedef ${targetDryMatterKg.toFixed(2)} kg) işkembe kapasitesinin çok altındadır! Yem erkenden biter, hayvanlar açlık stresine girer ve ani süt verim kaybı yaşanır. Kaba yem miktarını artırarak işkembeyi doldurun!`;
    } else if (dryMatterDiffPercent < -7) {
      dryMatterStatus = 'SLIGHT_LOW';
      dryMatterStatusMessage = `🟡 YETERSİZ TÜKETİM (-%${Math.abs(dryMatterDiffPercent)}): Kuru madde miktarı hedefin altındadır. Yem erken bitebilir, tokluk hissi tam karşılanmayabilir.`;
    } else {
      dryMatterStatus = 'IDEAL';
      dryMatterStatusMessage = `✅ DENGELİ TÜKETİM (±%7 Tolerans İçinde): Kuru madde miktarı (${totalDryMatterKg.toFixed(2)} kg), hedeflenen fizyolojik işkembe kapasitesiyle (${targetDryMatterKg.toFixed(2)} kg) tam uyumludur. Yemlik artığı ve açlık riski yoktur.`;
    }
  }

  // Tolerans & Kaba Yem Değerlendirmesi
  let roughageStatus: RationCalculationResult['roughageStatus'] = 'IDEAL';
  let roughageStatusMessage = '✅ Mükemmel: Kaba yem ve kesif yem dengesi ideal (%50-60). Rumen sağlığı ve geviş getirme güvende.';

  if (totalDryMatterKg > 0) {
    if (roughagePercentage < 40 || roughageDryMatterKg < (minRoughageDryMatterKg * 0.85)) {
      roughageStatus = 'CRITICAL_ACIDOSIS';
      roughageStatusMessage = '🔴 TEHLİKE: Kaba yem oranı %40\'ın altında veya miktar yetersiz! Asidoz (işkembe ekşimesi) ve sindirim felci riski yüksek. Kaba yemi artırın!';
    } else if (roughagePercentage < 48 || roughageDryMatterKg < minRoughageDryMatterKg) {
      roughageStatus = 'WARNING_LOW';
      roughageStatusMessage = '🟡 DİKKAT: Kaba yem asgari sınırda (%40-48). Rumen geviş sağlığı için yonca veya kuru ot takviyesi faydalı olur.';
    } else if (roughagePercentage > 70) {
      roughageStatus = 'WARNING_HIGH';
      roughageStatusMessage = 'ℹ️ BİLGİ: Kaba yem oranı yüksek (%70+). Hayvan doyar ancak hedeflenen yüksek süt için kesif yem enerjisi gerekebilir.';
    }
  } else {
    roughageStatusMessage = 'Rasyona yem ekleyerek analiz sonuçlarını görüntüleyin.';
  }

  // Protein Hesaplamaları
  const totalProteinGrams = totalProteinKg * 1000;
  const maintenanceProteinGrams = safeLiveWeight * (settings.maintenanceProteinFactor || 0.67);
  const productionProteinGrams = Math.max(0, totalProteinGrams - maintenanceProteinGrams);
  const proteinPerLiter = Math.max(10, settings.proteinPerLiter || 90);

  // Süt Potansiyeli
  const potentialMilkLiters = Math.max(0, productionProteinGrams / proteinPerLiter);
  const rawProteinPotentialMilkLiters = Math.max(0, totalProteinGrams / proteinPerLiter);
  const milkDeficitOrSurplus = potentialMilkLiters - safeTargetMilk;

  const proteinPercentageOfRation = totalDryMatterKg > 0
    ? (totalProteinKg / totalDryMatterKg) * 100
    : 0;

  // Nişasta Hesaplamaları
  const totalStarchGrams = totalStarchKg * 1000;
  const starchPercentageOfRation = totalDryMatterKg > 0
    ? (totalStarchKg / totalDryMatterKg) * 100
    : 0;

  let starchStatus: RationCalculationResult['starchStatus'] = 'IDEAL';
  let starchStatusMessage = '✅ Nişasta Dengeli: Enerji ve sindirim seviyesi uyumlu (%22-28).';

  if (totalDryMatterKg > 0) {
    if (starchPercentageOfRation > 28.5) {
      starchStatus = 'HIGH';
      starchStatusMessage = '⚠️ Nişasta Yüksek (%28+): Arpa/mısır miktarı fazla olabilir, asidoz riski yaratabilir.';
    } else if (starchPercentageOfRation < 20.0) {
      starchStatus = 'LOW';
      starchStatusMessage = '⚠️ Nişasta Düşük (%20 altı): Enerji açığı oluşabilir, süt verimi sınırlanabilir.';
    }
  } else {
    starchStatusMessage = 'Rasyon nişasta dengesi.';
  }

  // 1 Litre Sütün Yem Maliyeti
  const feedCostPerLiter = safeTargetMilk > 0
    ? dailyFeedCostPerCow / safeTargetMilk
    : dailyFeedCostPerCow;

  // Yem Üst Sınır (Limit) Denetimi
  const limitWarnings: FeedLimitWarning[] = [];
  items.forEach(item => {
    const freshAmount = Math.max(0, item.freshAmount || 0);
    if (freshAmount <= 0) return;
    const feed = feedMap.get(item.feedId);
    if (!feed) return;

    const cat = feed.category;
    const catMeta = cat ? FEED_CATEGORY_CONFIG[cat] : null;
    const maxLimit = feed.maxLimitKg ?? catMeta?.defaultMaxLimit;

    if (maxLimit && freshAmount > maxLimit) {
      limitWarnings.push({
        feedId: feed.id,
        feedName: feed.name,
        category: cat,
        freshAmount: Number(freshAmount.toFixed(1)),
        maxLimitKg: Number(maxLimit.toFixed(1)),
        warningNote: catMeta?.warningNote || `${feed.name} için önerilen günlük güvenli üst sınır ${maxLimit} kg'dır.`,
      });
    }
  });

  return {
    totalFreshKg: Number(totalFreshKg.toFixed(2)),
    totalDryMatterKg: Number(totalDryMatterKg.toFixed(2)),
    targetDryMatterKg: Number(targetDryMatterKg.toFixed(2)),
    dryMatterPercentageOfBodyWeight: Number(dryMatterPercentageOfBodyWeight.toFixed(2)),
    dryMatterStatus,
    dryMatterDiffPercent,
    dryMatterStatusMessage,

    roughageDryMatterKg: Number(roughageDryMatterKg.toFixed(2)),
    concentrateDryMatterKg: Number(concentrateDryMatterKg.toFixed(2)),
    roughagePercentage: Number(roughagePercentage.toFixed(1)),
    concentratePercentage: Number(concentratePercentage.toFixed(1)),
    minRoughageDryMatterKg: Number(minRoughageDryMatterKg.toFixed(2)),

    roughageStatus,
    roughageStatusMessage,

    totalProteinKg: Number(totalProteinKg.toFixed(2)),
    totalProteinGrams: Math.round(totalProteinGrams),
    maintenanceProteinGrams: Math.round(maintenanceProteinGrams),
    productionProteinGrams: Math.round(productionProteinGrams),
    proteinPercentageOfRation: Number(proteinPercentageOfRation.toFixed(1)),

    totalStarchKg: Number(totalStarchKg.toFixed(2)),
    totalStarchGrams: Math.round(totalStarchGrams),
    starchPercentageOfRation: Number(starchPercentageOfRation.toFixed(1)),
    starchStatus,
    starchStatusMessage,

    potentialMilkLiters: Number(potentialMilkLiters.toFixed(1)),
    rawProteinPotentialMilkLiters: Number(rawProteinPotentialMilkLiters.toFixed(1)),
    milkDeficitOrSurplus: Number(milkDeficitOrSurplus.toFixed(1)),

    dailyFeedCostPerCow: Number(dailyFeedCostPerCow.toFixed(2)),
    feedCostPerLiter: Number(feedCostPerLiter.toFixed(2)),
    limitWarnings,
  };
}
