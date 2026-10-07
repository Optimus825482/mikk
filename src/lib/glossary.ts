export interface GlossaryTerm {
  id: string;
  term: string;
  subTitle?: string;
  category: 'besleme' | 'saglik' | 'ekonomi';
  categoryLabel: string;
  definition: string;
  importance: string;
  examplesOrFormula?: string;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'rasyon',
    term: 'Rasyon',
    subTitle: 'Günlük Dengeli Yem Karması',
    category: 'besleme',
    categoryLabel: 'Yem & Besleme',
    definition:
      'Bir sağmal hayvanın 24 saatlik süre (bir tam gün) boyunca yaşamını sağlıklı sürdürebilmesi ve hedeflenen günlük süt miktarını üretebilmesi için ihtiyaç duyduğu tüm besin maddelerini (kuru madde, enerji, ham protein, nişasta, lif, mineral ve vitamin) içeren dengeli yem karmasıdır.',
    importance:
      'Veteriner Notu: Rasyon hazırlarken yem maddelerinin ıslak (tartı) ağırlığına değil; içerdikleri gerçek kuru madde ve ham protein oranlarına odaklanılmalıdır. Dengeli bir rasyon, en düşük maliyetle en yüksek süt verimini sağlar.',
    examplesOrFormula: 'Örnek: 20 kg Mısır Silajı + 4 kg Yonca Otu + 1 kg Saman + 8 kg Süt Yemi + 1.5 kg Arpa Ezmesi.'
  },
  {
    id: 'asidoz',
    term: 'Asidoz (Rumen Asidozu / SARA)',
    subTitle: 'İşkembe Asitleşmesi & Sindirim Bozukluğu',
    category: 'saglik',
    categoryLabel: 'Sağlık & Fizyoloji',
    definition:
      'İşkembede (rumen) arpa, mısır, buğday veya fabrika süt yemi gibi hızlı fermente olan nişastalı kesif yemlerin aşırı verilmesi; buna karşılık geviş getirmeyi sağlayan lifli kaba yemlerin yetersiz kalması sonucu rumen pH değerinin tehlikeli seviyelere (pH 5.5 altına) düşmesidir.',
    importance:
      'Veteriner Notu: Asidoz; iştah kaybı, sarı-köpüklü ishal, topallık (tırnak yangısı/laminitis), karaciğer apseleri ve süt yağ oranında ani çöküşe yol açar. MilkIQ rasyon analizinde kaba yem oranı %40 altına indiğinde sistem otomatik kırmızı asidoz uyarısı verir.',
    examplesOrFormula: 'Kritik Eşik: Rumen pH < 5.5 | Kaba yem kuru maddesi < %40 | Nişasta oranı > %28'
  },
  {
    id: 'kaba-yem',
    term: 'Kaba Yem',
    subTitle: 'Lif Zengini, Geviş Uyarıcı Temel Yemler',
    category: 'besleme',
    categoryLabel: 'Yem & Besleme',
    definition:
      'Kuru maddesinde yüksek oranda ham lif (%18\'den fazla) barındıran, hacimli ve ineğin geviş getirmesini tetikleyerek bol miktarda bikarbonat içeren sindirim tükürüğü salgılamasını sağlayan doğal yem maddeleridir.',
    importance:
      'Veteriner Notu: Kaba yem olmadan geviş getiren bir hayvanın sindirim sistemi çalışamaz. İşkembe hareketlerini canlı tutarak asidozun en güçlü kalkanı görevini üstlenir.',
    examplesOrFormula: 'Başlıca Kaba Yemler: Yonca kuru otu, mısır silajı, şeker pancarı posası (yaş küspe), korunga, çayır otu, fiğ otu ve saman.'
  },
  {
    id: 'kesif-yem',
    term: 'Kesif Yem (Konsantre Yem)',
    subTitle: 'Yoğun Enerji & Protein Kaynağı',
    category: 'besleme',
    categoryLabel: 'Yem & Besleme',
    definition:
      'Lif içeriği düşük, ancak birim ağırlığında yüksek düzeyde metabolize edilebilir enerji ve/veya ham protein barındıran yoğunlaştırılmış konsantre yem maddeleridir.',
    importance:
      'Veteriner Notu: Yüksek süt verimine sahip ineklerin sadece kaba yemle enerji ihtiyacını karşılaması imkansızdır; verim farkı kesif yemle kapatılır. Ancak aşırı verilmesi işkembeyi yakabilir (asidoz).',
    examplesOrFormula: 'Örnekler: Fabrika süt yemleri (18-19-21 HP), mısır flake, arpa ezmesi, dane mısır, buğday, soya küspesi, ayçiçeği küspesi (ATK), kepek.'
  },
  {
    id: 'laktasyon',
    term: 'Laktasyon',
    subTitle: 'Doğumdan Kuruya Çıkana Kadarki Sağım Dönemi',
    category: 'saglik',
    categoryLabel: 'Sağlık & Fizyoloji',
    definition:
      'İneğin buzağılamasından (doğum yapması) itibaren başlayıp, bir sonraki doğuma hazırlanmak üzere kuruya çıkarılana kadar süren süt verme periyodudur. Süt sığırcılığında standart laktasyon süresi 305 gün (yaklaşık 10 ay) olarak kabul edilir.',
    importance:
      'Veteriner Notu: Laktasyonun ilk 60-90 gününde inek en yüksek süt verimine (pik) ulaşır. Bu dönemde hayvan tükettiğinden fazla süt verdiği için "negatif enerji dengesi" yaşar ve rasyonunun çok iyi dengelenmesi gerekir.',
    examplesOrFormula: 'Dönemler: Erken Laktasyon (1-100 gün), Orta Laktasyon (101-200 gün), Geç Laktasyon (201-305 gün).'
  },
  {
    id: 'kuru-madde',
    term: 'Kuru Madde (KM)',
    subTitle: 'Yemin Nemsiz / Gerçek Besin Ağırlığı',
    category: 'besleme',
    categoryLabel: 'Yem & Besleme',
    definition:
      'Bir yemin içerisindeki suyun (nemi) tamamen buharlaştırılıp uçurulmasından sonra geriye kalan gerçek besleyici katı kısımdır. Hayvanlar suyu değil, kuru maddeyi tüketerek yaşamını sürdürür ve süt üretir.',
    importance:
      'Veteriner Notu: Örneğin %70 neme sahip mısır silajının kuru maddesi %30\'dur. Yani tekneye dökülen 10 kg silajın sadece 3 kg\'ı gerçek besindir, 7 kg\'ı sudur. Tüm rasyon hesapları kuru madde üzerinden yapılır.',
    examplesOrFormula: 'Tüketim Kapasitesi: 600 kg ağırlığındaki bir süt ineği günde ortalama 18 - 22 kg Kuru Madde (KM) tüketebilir.'
  },
  {
    id: 'ham-protein',
    term: 'Ham Protein (HP)',
    subTitle: 'Azotlu Bileşikler & Doku Yapı Taşı',
    category: 'besleme',
    categoryLabel: 'Yem & Besleme',
    definition:
      'Yem maddelerinde bulunan gerçek proteinler ile protein yapısında olmayan diğer azotlu bileşiklerin toplamıdır. Süt proteini (kazein), kas dokusu, enzimler ve rumen mikroorganizmalarının çoğalması için ana hammaddedir.',
    importance:
      'Veteriner Notu: Yüksek süt verimli ineklerin toplam rasyonunda kuru maddede %16 - %18 ham protein bulunmalıdır. Protein eksikliği sütü düşürürken, aşırı protein böbrekleri yorar ve döl tutmayı zorlaştırır.',
    examplesOrFormula: 'Zengin Kaynaklar: Soya küspesi (%44-48 HP), Ayçiçeği küspesi (%28-36 HP), Kaliteli Yonca (%16-20 HP).'
  },
  {
    id: 'yasam-payi',
    term: 'Yaşam Payı',
    subTitle: 'Canlı Kalmak İçin Zorunlu Asgari İhtiyaç',
    category: 'besleme',
    categoryLabel: 'Yem & Besleme',
    definition:
      'Hayvanın hiç süt vermediği ve kilo alıp vermediği varsayıldığında; yalnızca organlarının çalışması, solunum yapması, dolaşım sistemi ve vücut sıcaklığını koruması için her gün harcamak zorunda olduğu asgari besin maddesi ihtiyacıdır.',
    importance:
      'Veteriner Notu: Yaşam payı hayvanın canlı ağırlığına göre hesaplanır (örneğin 600 kg bir Holstein inek için günde yaklaşık 6 - 7 kg KM ve temel bakım enerjisi gerekir). Yaşam payı karşılanmadan süt verimi elde edilemez.',
    examplesOrFormula: 'Canlı Ağırlık Artışı = Yaşam payı yem ihtiyacını doğrudan artırır.'
  },
  {
    id: 'verim-payi',
    term: 'Verim Payı',
    subTitle: 'Üretilen Süt İçin Gereken İlave Besin',
    category: 'besleme',
    categoryLabel: 'Yem & Besleme',
    definition:
      'Yaşam payının üzerine, üretilen her 1 litre süt ve sütün içerdiği yağ/protein miktarı doğrultusunda rasyona eklenmesi zorunlu olan ilave enerji, protein ve besin maddeleri bütünüdür.',
    importance:
      'Veteriner Notu: Genel pratik kural olarak, sağılan her 2 - 2.5 litre süt için yaşam payının üzerine yaklaşık 1 kg kaliteli süt yemi karşılığı verim payı besini rasyona eklenmelidir.',
    examplesOrFormula: '1 Litre Süt Üretimi ≈ Yaklaşık 85-90 g Ham Protein ve 0.45-0.50 Mcal Net Enerji gerektirir.'
  },
  {
    id: 'kaba-yem-toleransi',
    term: 'Kaba Yem Toleransı (%40 Kuralı)',
    subTitle: 'Rumen Sağlığı ve Asidoz Emniyet Sübabı',
    category: 'saglik',
    categoryLabel: 'Sağlık & Fizyoloji',
    definition:
      'Günlük rasyonda tüketilen toplam kuru maddenin asgari yüzde kaçının kaba yemlerden gelmesi gerektiğini belirleyen güvenlik göstergesidir.',
    importance:
      'Veteriner Notu: Rasyondaki kaba yem kuru maddesi %40\'ın altına düştüğünde rumen geviş hareketi durma noktasına gelir, asidoz riski kırmızıya döner. İdeal oran %50 - %60 kaba yem, %40 - %50 kesif yemdir.',
    examplesOrFormula: 'Değerlendirme: < %40 Riskli (Asidoz) | %40 - %48 Hassas Denge | %48 - %65 İdeal Sağlık'
  },
  {
    id: 'sut-yem-paritesi',
    term: 'Süt / Yem Paritesi',
    subTitle: 'Hayvancılık İşletmesinin Temel Kârlılık Ölçütü',
    category: 'ekonomi',
    categoryLabel: 'Ekonomi & Maliyet',
    definition:
      '1 litre çiğ süt satıldığında elinize geçen parayla kaç kilogram fabrika süt yemi (örneğin 18 veya 19 HP süt yemi) satın alabildiğinizi gösteren ekonomik orandır.',
    importance:
      'Veteriner Notu: Dünya genelinde kabul gören sürdürülebilir kârlılık eşiği 1.3 - 1.5 seviyesidir. Yani 1 litre süt ile en az 1.3 - 1.5 kg yem alınabilmelidir. Parite 1.0 altına indiğinde işletme cepten yemeye başlar.',
    examplesOrFormula: 'Formül: Parite = 1 Litre Çiğ Süt Satış Fiyatı (TL) / 1 Kg Süt Yemi Fiyatı (TL)'
  },
  {
    id: 'kuru-donem',
    term: 'Kuru Dönem (Kuruya Çıkarma)',
    subTitle: 'Gelecek Laktasyon İçin 60 Günlük Dinlenme',
    category: 'saglik',
    categoryLabel: 'Sağlık & Fizyoloji',
    definition:
      'İneğin bir sonraki doğumuna yaklaşık 60 gün (8 hafta) kala sağımının tamamen sonlandırıldığı, meme dokusunun dinlendiği ve karnındaki buzağının en hızlı büyüdüğü kritik hazırlık periyodudur.',
    importance:
      'Veteriner Notu: Kuru döneme alınmayan veya eksik süre kuruda kalan inekler, bir sonraki laktasyonda süt verimlerinin en az %20-30\'unu peşinen kaybeder. Kuru dönem beslemesinde aşırı yağlanmadan kaçınılmalıdır.',
    examplesOrFormula: 'İdeal Süre: Doğumdan önce 50 - 60 gün.'
  },
  {
    id: 'genel-gider-payi',
    term: 'Genel Gider Payı (Sabit Maliyet)',
    subTitle: 'Litre Başına Düşen İşletme Masrafı',
    category: 'ekonomi',
    categoryLabel: 'Ekonomi & Maliyet',
    definition:
      'Yem gideri haricinde işletmede yapılan elektrik, hayvan sağlığı (veteriner, ilaç, aşı), işçilik, mazot, amortisman ve bakım harcamalarının o ay sağılan toplam süt miktarına oranlanmasıyla bulunan litre başı ek maliyettir.',
    importance:
      'Veteriner Notu: Birçok yetiştirici maliyeti sadece "yediği yem" sanır. Oysa genel giderler litre başına 1.5 - 3.5 TL ek yük getirebilir. MilkIQ bu kalemi net olarak hesaplayarak gerçek kârı gösterir.',
    examplesOrFormula: 'Formül: Litre Başı Genel Gider = Aylık Toplam Harcamalar / Aylık Toplam Sağılan Süt Litresi'
  },
  {
    id: 'nisasta-orani',
    term: 'Nişasta Oranı',
    subTitle: 'Hızlı Fermente Karbonhidrat Seviyesi',
    category: 'besleme',
    categoryLabel: 'Yem & Besleme',
    definition:
      'Tane hububatlarda (arpa, mısır, buğday) bolca bulunan, rumende mikroorganizmalar tarafından hızla propiyonik aside parçalanarak süte enerji ve laktoz sağlayan bir karbonhidrattır.',
    importance:
      'Veteriner Notu: Rasyondaki toplam nişasta oranının %26 - %28 seviyesini aşması rumende hızlı laktik asit birikimine ve akut/subakut asidoza neden olur. Karışımda mısır ve arpa dikkatli tartılmalıdır.',
    examplesOrFormula: 'İdeal Sınır: Rasyon Kuru Maddesinde %22 - %26 Nişasta.'
  },
  {
    id: 'kuru-madde-toleransi-kokusma',
    term: 'Kuru Madde Tüketim Toleransı & Yemlikte Kokuşma Riski',
    subTitle: 'İşkembe Kapasitesi, Yem Artığı ve Açlık Stresi Dengesi',
    category: 'saglik',
    categoryLabel: 'Sağlık & Fizyoloji',
    definition:
      'İneğin canlı ağırlığı ve günlük süt verimine bağlı fizyolojik kuru madde tüketim kapasitesi ile rasyonda hazırlanan gerçek kuru madde miktarı arasındaki dengedir. MilkIQ bu dengeyi ±%7 tolerans aralığında denetler.',
    importance:
      'Veteriner Notu: Hedeflenen kuru maddeden fazla yem verilirse (+%15 üzeri), hayvan fizyolojik olarak yemi bitiremez ve yemlikte artık kalır. Bu artıklar hava, nem ve sıcaklıkla fermente olarak hızla kokuşur ve küflenir. Kokuşmuş yemlerin üzerine yeni yem dökülmesi asidoz, ketozis, abomazum deplasmanı ve sindirim felcine yol açar. Tersine hedeften az kuru madde verilirse (-%15 altı), yem erkenden biter; hayvan açlık stresine girer ve ani süt kaybı yaşanır.',
    examplesOrFormula: 'İdeal Eşik: Hedef Kuru Madde ± %7 tolerans | > +%15 Yem Artığı & Kokuşma Riski | < -%15 Açlık Stresi'
  }
];

