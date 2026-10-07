import { RationCalculationResult } from '@/types';

export interface LactationAdvice {
  id: string;
  type: 'DANGER' | 'WARNING' | 'SUCCESS' | 'INFO';
  category: 'ENERJI' | 'PROTEIN' | 'KURU_MADDE' | 'KABA_KESIF' | 'GENEL';
  title: string;
  message: string;
  action: string;
}

export function generateLactationAdvice(
  groupId: string,
  results: RationCalculationResult,
  liveWeight: number,
  targetMilk: number
): LactationAdvice[] {
  const adviceList: LactationAdvice[] = [];

  // Rasyonda henüz yem yoksa bilgilendirme ver
  if (results.totalDryMatterKg <= 0) {
    return [
      {
        id: 'no_feed',
        type: 'INFO',
        category: 'GENEL',
        title: 'Rasyon Oluşturmaya Başlayın',
        message: 'Aşağıdaki yem kütüphanesinden yem miktarları ekleyerek seçilen laktasyon dönemine uygun akıllı besleme analizi ve tavsiyeleri görüntüleyin.',
        action: 'Kaba yemler (mısır silajı, yonca) ve kesif yemler ekleyerek rasyonunuzu dengeleyin.'
      }
    ];
  }

  // =========================================================================
  // 1. ERKEN LAKTASYON (PİK DÖNEMİ | DIM: 1 - 100 GÜN)
  // =========================================================================
  if (groupId === 'erken') {
    // A) ENERJİ & NİŞASTA KONTROLÜ
    if (results.starchPercentageOfRation < 22 || results.roughagePercentage > 58) {
      adviceList.push({
        id: 'erken_enerji_dusuk',
        type: 'WARNING',
        category: 'ENERJI',
        title: 'Pik Dönemi Enerji Açığı & Ketozis Riski',
        message: `Erken laktasyondaki (1-100 gün) yüksek süt verimi için rasyondaki nişasta/enerji oranı (%${results.starchPercentageOfRation}) yetersiz kalmaktadır. Hayvan negatif enerji dengesine (NEB) girerek aşırı vücut yağı yakabilir; bu da ketozis, karaciğer yağlanması ve pik veriminin erken düşmesine yol açar.`,
        action: 'Tavsiye: Rasyondaki Mısır Flake, Arpa Kırması veya 19-21 HP yüksek enerjili fabrika süt yemi miktarını 1.5 - 2.5 kg artırarak enerji yoğunluğunu yükseltin.'
      });
    } else if (results.starchPercentageOfRation > 28.5) {
      adviceList.push({
        id: 'erken_asidoz_riski',
        type: 'DANGER',
        category: 'ENERJI',
        title: 'Aşırı Nişasta & Subakut Rumen Asidozu (SARA) Tehlikesi',
        message: `Pik dönemi rasyonunda nişasta oranı %${results.starchPercentageOfRation} seviyesine çıkmış (üst sınır %28). Hızlı fermente olan tahıllar işkembe pH'ını 5.5 altına düşürerek sindirimi durdurabilir ve süt yağını düşürür.`,
        action: 'Tavsiye: Tane tahıl miktarını biraz kısın, kaliteli yonca kuru otu oranını artırın ve rasyona 100-150 gr sodyum bikarbonat (mısır sodası) ekleyin.'
      });
    } else {
      adviceList.push({
        id: 'erken_enerji_ideal',
        type: 'SUCCESS',
        category: 'ENERJI',
        title: 'Pik Enerji Yoğunluğu İdeal',
        message: `Nişasta ve enerji yoğunluğu (%${results.starchPercentageOfRation}) erken laktasyon pik süt verimi için optimum aralıktadır. Hayvan aşırı kilo kaybetmeden süt zirvesine ulaşabilir.`,
        action: 'Mevcut tahıl ve konsantre yem dengesini koruyun.'
      });
    }

    // B) PROTEİN KONTROLÜ
    if (results.proteinPercentageOfRation < 16.5) {
      adviceList.push({
        id: 'erken_protein_dusuk',
        type: 'WARNING',
        category: 'PROTEIN',
        title: 'Pik Süt Verimi İçin Ham Protein Yetersizliği',
        message: `Erken laktasyonda rasyondaki ham protein oranı en az %16.5 - %18.0 olmalıdır. Mevcut rasyonunuz %${results.proteinPercentageOfRation} ham protein sağlıyor. Protein yetersizliği pik süt veriminin 3-5 litre daha düşük kalmasına sebep olur.`,
        action: 'Tavsiye: Soya küspesi (%44-46 HP), ayçiçeği küspesi veya 19-21 HP yüksek proteinli süt yemi miktarını artırın.'
      });
    } else if (results.proteinPercentageOfRation > 19.5) {
      adviceList.push({
        id: 'erken_protein_fazla',
        type: 'INFO',
        category: 'PROTEIN',
        title: 'Aşırı Protein & Gereksiz Yem Masrafı',
        message: `Ham protein oranı (%${results.proteinPercentageOfRation}) pik ihtiyacının da üzerindedir. Aşırı protein idrarla üre olarak atılırken karaciğeri yorar ve gereksiz yem faturası oluşturur.`,
        action: 'Tavsiye: Pahalı küspeleri hafif azaltıp rasyon maliyetini düşürebilirsiniz.'
      });
    } else {
      adviceList.push({
        id: 'erken_protein_ideal',
        type: 'SUCCESS',
        category: 'PROTEIN',
        title: 'Pik Ham Proteini Mükemmel',
        message: `Rasyonun ham protein içeriği (%${results.proteinPercentageOfRation}) erken laktasyon süt verimini ve meme dokusu sağlığını eksiksiz destekliyor.`,
        action: 'Mevcut protein kaynaklarını koruyun.'
      });
    }

    // C) KABA / KESİF YEM DENGESİ
    if (results.roughagePercentage < 40) {
      adviceList.push({
        id: 'erken_kaba_yetersiz',
        type: 'DANGER',
        category: 'KABA_KESIF',
        title: 'Kaba Yem Eksikliği (Laminitis & Gevenme Riski)',
        message: `Kaba yem oranı (%${results.roughagePercentage}) kritik eşiğin (%40) altında. Geviş getirme süresi kısalır, tırnak iltihabı (laminitis) ve abomazum deplasmanı riski artar.`,
        action: 'Tavsiye: Rasyona en az 3-4 kg kaliteli yonca kuru otu ve 1 kg buğday samanı ekleyerek yapısal lif sağlayın.'
      });
    } else if (results.roughagePercentage > 58) {
      adviceList.push({
        id: 'erken_kaba_fazla',
        type: 'INFO',
        category: 'KABA_KESIF',
        title: 'Hacimli Kaba Yem Kısıtlaması',
        message: `Kaba yem oranı (%${results.roughagePercentage}) pik dönemi için fazla hacimli. İneğin işkembesi erken dolarak gereken yoğun enerjiyi tüketmesini engelleyebilir.`,
        action: 'Tavsiye: Kaba yem oranını %45-50 bandına çekip konsantre yem payını artırın.'
      });
    }
  }

  // =========================================================================
  // 2. ORTA LAKTASYON (PLATO DÖNEMİ | DIM: 101 - 200 GÜN)
  // =========================================================================
  else if (groupId === 'orta') {
    // A) PROTEİN VE DÖL TUTMA / TOHUMLAMA ETKİSİ
    if (results.proteinPercentageOfRation > 17.5) {
      adviceList.push({
        id: 'orta_protein_fazla_dol_tutma',
        type: 'WARNING',
        category: 'PROTEIN',
        title: 'Aşırı Protein & Döl Tutma (Tohumlama) Riski',
        message: `Orta laktasyon (101-200 gün) hayvanların tohumlandığı ve gebe kalması gereken en kritik dönemdir. Rasyondaki aşırı protein (%${results.proteinPercentageOfRation}) kan ve süt üre azotunu (BUN/MUN) yükselterek rahim içi pH dengesini bozar ve embriyo tutunmasını zorlaştırır.`,
        action: 'Tavsiye: Soya/küspe gibi pahalı protein kaynaklarını azaltın. Ham proteini %15.5 - %16.8 bandına çekerek döl tutma şansını artırın ve yem tasarrufu yapın.'
      });
    } else if (results.proteinPercentageOfRation < 15.0) {
      adviceList.push({
        id: 'orta_protein_dusuk',
        type: 'WARNING',
        category: 'PROTEIN',
        title: 'Plato Dönemi Protein Eksikliği',
        message: `Ham protein oranı (%${results.proteinPercentageOfRation}) plato süt verimini korumak için biraz düşük kalıyor. Süt verimi erken düşüşe geçebilir.`,
        action: 'Tavsiye: 1 - 1.5 kg dengeli fabrika süt yemi veya kaliteli küspe ilavesi yapın.'
      });
    } else {
      adviceList.push({
        id: 'orta_protein_ideal',
        type: 'SUCCESS',
        category: 'PROTEIN',
        title: 'Plato Dönemi Protein & Fertilite Dengesi İdeal',
        message: `Ham protein oranı (%${results.proteinPercentageOfRation}) hem süt verimini destekliyor hem de döl verimini riske atmıyor.`,
        action: 'Bu seviyeyi gebelik kontrolüne kadar koruyun.'
      });
    }

    // B) KABA / KESİF DENGESİ (İDEAL: %48 - %55 KABA)
    if (results.roughagePercentage < 45) {
      adviceList.push({
        id: 'orta_kaba_dusuk',
        type: 'WARNING',
        category: 'KABA_KESIF',
        title: 'Kaba Yem Oranını Artırın',
        message: `Orta laktasyonda kaba yem oranı (%${results.roughagePercentage}) düşük. Rumen sağlığı, geviş getirme ve süt yağı için lif oranını yükseltin.`,
        action: 'Tavsiye: Yonca ve mısır silajı takviyesiyle kaba yem oranını %50 seviyesine getirin.'
      });
    } else if (results.roughagePercentage >= 48 && results.roughagePercentage <= 56) {
      adviceList.push({
        id: 'orta_kaba_ideal',
        type: 'SUCCESS',
        category: 'KABA_KESIF',
        title: 'Optimum Plato Kaba/Kesif Dengesi',
        message: `Kaba yem oranı (%${results.roughagePercentage}) ve kesif yem dengesi orta laktasyon için son derece dengeli. Rumen stabilitesi ve süt yağı güvencede.`,
        action: 'Mevcut yem karma oranını koruyun.'
      });
    }
  }

  // =========================================================================
  // 3. GEÇ LAKTASYON & KURU DÖNEM (DIM: 200+ & KURU)
  // =========================================================================
  else if (groupId === 'gec') {
    // A) AŞIRI ENERJİ & YAĞLI İNEK SENDROMU UYARISI
    if (results.concentratePercentage > 35 || results.starchPercentageOfRation > 22) {
      adviceList.push({
        id: 'gec_asiri_enerji_yaglanma',
        type: 'DANGER',
        category: 'ENERJI',
        title: 'Aşırı Enerji & Yağlı İnek Sendromu Tehlikesi',
        message: `Geç laktasyonda veya kuru dönemde kesif yemin yüksek tutulması (%${results.concentratePercentage}) ve yüksek nişasta ineğin enerjiyi iç organ ve karaciğer yağına çevirmesine sebep olur. Yağlanan inekler bir sonraki doğumda güç doğum, plasenta atılamaması, abomazum deplasmanı ve ağır ketozis yaşar.`,
        action: 'Tavsiye: Tane mısır, arpa ve kesif yem miktarını derhal azaltın! Rasyonun ana gövdesini lifli kaba yemlere (buğday samanı, çayır otu) bırakın.'
      });
    } else {
      adviceList.push({
        id: 'gec_enerji_ideal',
        type: 'SUCCESS',
        category: 'ENERJI',
        title: 'Aşırı Yağlanma Başarıyla Önleniyor',
        message: `Geç laktasyon/kuru dönem enerji kontrolü son derece başarılı (%${results.starchPercentageOfRation} nişasta). Hayvanın ideal kondisyon skoru (BCS: 3.25 - 3.50) korunuyor.`,
        action: 'Mevcut düşük enerjili beslemeyi doğuma 3 hafta kalana kadar sürdürün.'
      });
    }

    // B) KABA YEM / LİF ORANI (İDEAL: EN AZ %60 - %75 KABA)
    if (results.roughagePercentage < 58) {
      adviceList.push({
        id: 'gec_kaba_yetersiz',
        type: 'WARNING',
        category: 'KABA_KESIF',
        title: 'Kaba Yem Oranı Artırılmalı',
        message: `Geç laktasyon ve kuru dönemde kaba yem oranı en az %60 - %75 olmalıdır (mevcut: %${results.roughagePercentage}). Hayvanın işkembesini hacimli ve düşük enerjili kaba yemlerle tok tutmalısınız.`,
        action: 'Tavsiye: Buğday samanı, kuru çayır otu veya kaliteli sap ilavesi yaparak kaba yem oranını yükseltin.'
      });
    }

    // C) GEREKSİZ PROTEİN VE MALİYET TASARRUFU
    if (results.proteinPercentageOfRation > 15.0) {
      adviceList.push({
        id: 'gec_protein_fazla_israf',
        type: 'INFO',
        category: 'PROTEIN',
        title: 'Gereksiz Protein Harcaması & Tasarruf Fırsatı',
        message: `Geç laktasyonda veya kuru dönemde %${results.proteinPercentageOfRation} ham protein fazladır. İhtiyaç %12.5 - %13.5 düzeyindedir. Yüksek protein böbrekleri yorar ve boşuna maliyettir.`,
        action: 'Tavsiye: Pahalı küspeleri kısıp kaba yem miktarını artırarak günlük yem maliyetinizi %15-25 doğrudan düşürebilirsiniz.'
      });
    }
  }

  // =========================================================================
  // GENEL: KURU MADDE KAPASİTE UYARISI
  // =========================================================================
  if (results.dryMatterStatus === 'CRITICAL_HIGH') {
    adviceList.push({
      id: 'genel_km_yuksek',
      type: 'WARNING',
      category: 'KURU_MADDE',
      title: 'İşkembe Kapasitesi Aşımı Riski',
      message: `Rasyondaki toplam kuru madde (${results.totalDryMatterKg} kg KM), hayvanın tüketim kapasitesinin (${results.targetDryMatterKg} kg KM) %${results.dryMatterDiffPercent} üzerinde. Yemlikte yem kalabilir ve zayiat artabilir.`,
      action: 'Tavsiye: Rasyondaki toplam taze yem miktarını kademeli olarak azaltın.'
    });
  } else if (results.dryMatterStatus === 'CRITICAL_LOW') {
    adviceList.push({
      id: 'genel_km_dusuk',
      type: 'WARNING',
      category: 'KURU_MADDE',
      title: 'Yetersiz Kuru Madde (Açlık Hissi)',
      message: `Rasyondaki toplam kuru madde (${results.totalDryMatterKg} kg KM), hayvanın kapasitesinin (${results.targetDryMatterKg} kg KM) çok altındadır. Hayvan doymayacak ve verim düşecektir.`,
      action: 'Tavsiye: Rasyona mısır silajı ve kuru ot ekleyerek kuru maddeyi doldurun.'
    });
  }

  return adviceList;
}
