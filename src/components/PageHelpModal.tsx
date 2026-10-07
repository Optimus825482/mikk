'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { 
  X, 
  BookOpen, 
  CheckCircle2, 
  Lightbulb, 
  Calculator, 
  Wheat, 
  Receipt, 
  Milk, 
  TrendingUp, 
  Settings, 
  Home, 
  Building2,
  ExternalLink,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface PageHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
}

interface PageGuide {
  badge: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  purpose: string;
  steps: { title: string; desc: string }[];
  tips: string[];
  keyFeatures: string[];
}

export default function PageHelpModal({ isOpen, onClose, currentPath }: PageHelpModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  // URL patika eşleştirmesi
  const path = currentPath.split('?')[0];

  const guides: Record<string, PageGuide> = {
    '/': {
      badge: 'GENEL BAKIŞ & GÖSTERGE PANELİ',
      title: 'Ana Sayfa Kullanım Kılavuzu',
      subtitle: 'Çiftliğinizin günlük operasyonel özeti, maliyetleri ve hızlı eylemleri',
      icon: Home,
      purpose: 'Çiftliğinizin son süt verimini, 1L süt maliyetini, rasyon durumunu ve günlük genel göstergelerini tek bakışta incelemenizi sağlar.',
      steps: [
        {
          title: '1. Günlük Metrikleri Takip Edin',
          desc: '1 Litre süt yem maliyeti, günlük inek başı yem masrafı ve sürü toplam süt potansiyelini özet kartlardan kontrol edin.'
        },
        {
          title: '2. Hızlı Erişim Butonlarını Kullanın',
          desc: 'Doğrudan Rasyon Stüdyosuna geçebilir, yem fiyatlarını güncelleyebilir veya günlük süt tankı teslimatınızı kaydedebilirsiniz.'
        },
        {
          title: '3. Sistem Uyarılarını İnceleyin',
          desc: 'Kaba yem yetersizliği veya yemlikte kuru madde aşımı/kokuşma riski varsa gösterge panelindeki renkli uyarıları dikkate alın.'
        }
      ],
      tips: [
        'Her gün tanka dökülen sütü ve değişen yem fiyatlarını güncellerseniz gösterge paneli her zaman kuruşu kuruşuna doğru kârınızı gösterir.',
        'Maliyet sayfasında süt satış fiyatınızı girerek anlık litre başı net kâr marjınızı görebilirsiniz.'
      ],
      keyFeatures: [
        'Anlık 1 Litre Süt Yem Maliyeti',
        'Kuru Madde & Kaba Yem Güvenlik Göstergesi',
        'Tek Tıkla Rasyon ve Yem Menülerine Geçiş'
      ]
    },

    '/rasyon': {
      badge: 'RASYON STÜDYOSU & TMR MİKSER YÖNETİMİ',
      title: 'Rasyon Stüdyosu Kullanım Kılavuzu',
      subtitle: 'Akıllı rasyon hazırlama, asidoz denetimi ve mikser vagon tartım reçetesi',
      icon: Calculator,
      purpose: 'İneklerinizin canlı ağırlığına ve hedef süt verimine göre fizyolojik olarak dengeli rasyon oluşturmanızı, yemlik artık/kokuşma risklerini önlemenizi ve yem karma vagonu (mikser) tartım listesi almanızı sağlar.',
      steps: [
        {
          title: '1. Canlı Ağırlık ve Hedef Sütü Belirleyin',
          desc: 'İneklerin ortalama ağırlığını (örn: 600 kg) ve inek başı hedeflenen günlük süt miktarını (örn: 28 L) butonlarla veya sürgüyle ayarlayın.'
        },
        {
          title: '2. Kaba ve Kesif Yem Miktarlarını Girin',
          desc: 'Sol panelden kaba yemleri (yonca, mısır silajı, saman vb.), sağ panelden fabrika yemleri ve tahılları (süt yemi, arpa, mısır kırması vb.) inek başı günlük kg olarak belirleyin.'
        },
        {
          title: '3. Fizyolojik Sınırları ve KM Kapasitesini İzleyin',
          desc: 'Kaba yem oranının en az %40 olmasına dikkat edin. Kuru Madde (KM) hedefi aşılırsa yemlikte artık ve kokuşma uyarısı, az olursa açlık ve verim kaybı uyarısı verilir.'
        },
        {
          title: '4. "Hesapla & Raporla" Butonuna Basın',
          desc: 'Rasyonunuzu onaylayıp 1L süt maliyeti, potansiyel süt verimi ve ham protein/nişasta dengesini gösteren kapsamlı raporu açın.'
        },
        {
          title: '5. Sürü ve Mikser Parametrelerini Girin',
          desc: 'Sağmal hayvan sayısını (örn: 30 baş) ve günde kaç öğün karma yaptığınızı (1, 2 veya 3 öğün) seçin.'
        },
        {
          title: '6. Mikser Reçetesini veya Raporu PDF Olarak Alın',
          desc: '"Mikser Reçetesini PDF Çıkar / Yazdır" butonuyla operatör için terazi kümülatifi olan tartım çizelgesini, "Rasyon Raporu (PDF)" butonuyla ise tek sayfalık rasyon analiz raporunu yazdırın.'
        }
      ],
      tips: [
        'Mikserde homojen karışım için yükleme kuralı: 1. Kuru Kaba Yemler (3-5 dk kıyın) → 2. Sulu Silaj/Küspe (nemlendirin) → 3. Fabrika Süt Yemi & Tahıllar (en son ekleyin, aşırı unlaştırmamak için 5-7 dk karıştırın).',
        'Mikser reçetesinde operatör için "Terazi Hedefi (Kümülatif)" sütunu bulunur; kantar sıfırlanmadan traktörden tartım takip edilebilir.'
      ],
      keyFeatures: [
        'Hedeflenen KM Tolerans & Kokuşma/Verim Kaybı Uyarı Sistemi',
        'Operatör Odaklı Kümülatif Terazi Mikser Reçetesi (A4 PDF)',
        'Tek Sayfa (Single-Page) Rasyon Analiz Raporu',
        'Geçmiş Rasyonları Tarih Damgasıyla Kaydetme & Arşivleme'
      ]
    },

    '/yemler': {
      badge: 'YEM ENVANTERİ & BESİN DEĞERLERİ',
      title: 'Yemler & Katalog Kullanım Kılavuzu',
      subtitle: 'Kaba ve kesif yemlerin besin analizleri, fiyatları ve ortalama katalog rehberi',
      icon: Wheat,
      purpose: 'İşletmenizde kullanılan tüm yemlerin birim fiyatlarını (₺/kg), kuru madde, ham protein ve nişasta oranlarını yönetmenizi sağlar.',
      steps: [
        {
          title: '1. Yem Fiyatlarını Güncelleyin',
          desc: 'Yem kartlarındaki fiyat alanına güncel alış maliyetinizi yazıp yeşil kaydet butonuna basın. Tüm rasyon ve 1L süt maliyetleriniz otomatik güncellenir.'
        },
        {
          title: '2. "Yeni Yem Ekle" Butonunu Kullanın',
          desc: 'Listede olmayan özel bir yem, ot veya yan ürün kullanıyorsanız üstteki butona basarak formu doldurun.'
        },
        {
          title: '3. "Ortalama Kaba Yem Değerleri Kataloğu"ndan Faydalanın',
          desc: 'Yeni yem eklerken elinizde laboratuvar analizi yoksa açılan katalog penceresinden yeminizi (Yonca, Silaj, Saman, Yulaf, Fiğ vb.) seçin. "Normal" veya "2. Sınıf / Orta Kalite" değerlerini tek tıkla forma aktarın.'
        },
        {
          title: '4. "Fabrika Yemleri Kataloğu"na Erişin',
          desc: 'Sağ üstteki buton ile Türkiye genelindeki hazır fabrika süt yemlerinin hazır fabrika analizlerine ulaşın.'
        }
      ],
      tips: [
        'Arpa kırması, mısır kırması ve buğday kırması gibi tahıllar fabrika yemi değil, yoğun nişasta ve enerji sağlayan kırma yemlerdir.',
        'Saman ve düşük kaliteli otlarda kuru madde yüksek (%88-90), ancak protein ve sindirilebilirlik düşüktür.'
      ],
      keyFeatures: [
        'Kaba ve Kesif Yem Sınıflandırması',
        'Ortalama Kaba Yem Değerleri Kataloğu (Normal & 2. Sınıf Kalite)',
        'Fabrika Yemleri Analiz Kataloğuna Doğrudan Bağlantı',
        'Anlık Birim Fiyat (₺/kg) Değiştirme'
      ]
    },

    '/fabrika-yemleri': {
      badge: 'FABRİKA SÜT YEMLERİ KATALOĞU',
      title: 'Fabrika Yemleri Kataloğu Kılavuzu',
      subtitle: 'Türkiye lider yem üreticilerinin tescilli süt yemi besin değerleri',
      icon: Building2,
      purpose: 'CP, Abalıoğlu, Matlı, Proyem, Tarım Kredi, Eriş, Toros vb. önde gelen 14 fabrikanın 92 farklı süt yeminin protein ve nişasta değerlerini incelemenizi ve işletmenize eklemenizi sağlar.',
      steps: [
        {
          title: '1. Marka veya Yem Adına Göre Arayın',
          desc: 'Üstteki arama çubuğunu veya marka filtre butonlarını kullanarak kullandığınız fabrikayı seçin.'
        },
        {
          title: '2. Protein ve Nişasta Değerlerini Karşılaştırın',
          desc: '18 HP, 19 HP, 20 HP, 21 HP gibi süt yemlerinin ham protein ve nişasta yüzdelerini inceleyin.'
        },
        {
          title: '3. Yemi İşletmenize Ekleyin',
          desc: '"Yemlerime Ekle" butonuna basarak fabrika yemini kendi yem envanterinize aktarın ve fiyatını girin.'
        }
      ],
      tips: [
        'Yüksek süt verimi hedeflerinde nişastası dengelenmiş 19-21 protein fabrika yemleri tercih edilirken, kaba yemi kuvvetli işletmelerde 18 protein süt yemleri ekonomik denge sağlar.'
      ],
      keyFeatures: [
        '14 Lider Fabrika ve 92 Tescilli Süt Yemi',
        'Marka Filtresi ve Anlık Metin Araması',
        'Rasyon Stüdyosuna Tek Tıkla Aktarma'
      ]
    },

    '/maliyet': {
      badge: '1L SÜT MALİYETİ & KÂR ANALİZİ',
      title: 'Maliyet & Kâr Analizi Kullanım Kılavuzu',
      subtitle: '1 Litre sütün net maliyeti, genel gider payı, kâr marjı ve aylık arşivleme',
      icon: TrendingUp,
      purpose: '1 Litre süt üretmek için ne kadar yem ve ne kadar genel işletme masrafı (elektrik, mazot, veteriner vb.) harcadığınızı kuruşu kuruşuna gösterir ve aylık arşiv kayıtları tutmanızı sağlar.',
      steps: [
        {
          title: '1. Süt Satış Fiyatınızı Belirleyin',
          desc: 'Sütü mandıraya, kooperatife veya perakende sattığınız litre fiyatını (₺/L) girin.'
        },
        {
          title: '2. 1L Maliyet Dağılımını İnceleyin',
          desc: '1L Yem Maliyeti + 1L Genel Gider Payı toplanarak "1L Toplam Maliyet" ve "1L Net Kâr Marjı" hesaplanır.'
        },
        {
          title: '3. "Maliyeti Arşive Kaydet" Butonuna Basın',
          desc: 'O ayki maliyet verilerinizi tarih damgasıyla arşive ekleyin. Böylece aylar arasındaki kârlılık trendinizi kıyaslayabilirsiniz.'
        },
        {
          title: '4. Arşiv ve Raporları Yönetin',
          desc: 'Geçmiş dönem kayıtlarını inceleyebilir, silebilir veya çıktısını alabilirsiniz.'
        }
      ],
      tips: [
        'Süt sığırcılığında yem giderleri genellikle toplam maliyetin %65-75\'ini oluşturur; kalan %25-35 genel işletme masraflarıdır.',
        'Süt / Yem Paritesi 1.30 - 1.50 seviyesinin üzerindeyse işletmeniz sağlıklı kâr üretiyor demektir.'
      ],
      keyFeatures: [
        '1L Süt Yem Maliyeti ve Genel İşletme Payı Ayrımı',
        'Anlık Litre Başı Net Kâr Marjı',
        'Aylık Maliyet Arşivleme ve Geçmiş Dönem Raporları',
        'Süt / Yem Paritesi Göstergesi'
      ]
    },

    '/giderler': {
      badge: 'GENEL İŞLETME GİDERLERİ',
      title: 'Genel Giderler Yönetimi Kılavuzu',
      subtitle: 'Elektrik, mazot, veteriner, işçilik ve bakım masraflarının takibi',
      icon: Receipt,
      purpose: 'Yem dışındaki tüm çiftlik masraflarını kategorilerine göre kaydederek 1 litre süte düşen genel gider payını hassas biçimde hesaplamanızı sağlar.',
      steps: [
        {
          title: '1. Yeni Gider Kaydı Ekleyin',
          desc: '"Yeni Gider Ekle" butonuna basarak Elektrik, Mazot, Veteriner/İlaç, Tohumlama, İşçilik veya Amortisman kategorisini seçin.'
        },
        {
          title: '2. Tutar ve Tarih Belirleyin',
          desc: 'Fatura veya harcama tutarını yazıp kaydedin.'
        },
        {
          title: '3. Kategori Dağılımını İzleyin',
          desc: 'Hangi kaleme ayda ne kadar harcadığınızı grafik ve yüzdeler üzerinden takip edin.'
        }
      ],
      tips: [
        'Aylık sabit giderleri düzenli girmek, Maliyet sayfasındaki "1L Genel Gider Payı"nın gerçeğe en yakın çıkmasını sağlar.'
      ],
      keyFeatures: [
        'Kategorik Gider Ayrımı (Mazot, Elektrik, Sağlık vb.)',
        'Aylık Toplam ve Litre Başına Düşen Pay Hesabı',
        'Geçmiş Harcama Kayıtları'
      ]
    },

    '/uretim': {
      badge: 'SÜT ÜRETİMİ & SÜRÜ VERİMİ',
      title: 'Süt Üretimi Takip Kılavuzu',
      subtitle: 'Günlük sağım miktarı, tank kayıtları ve inek başı ortalama verim',
      icon: Milk,
      purpose: 'Çiftliğinizin günlük tank teslimatlarını ve inek başı ortalama süt verimini kayıt altına almanızı sağlar.',
      steps: [
        {
          title: '1. Günlük Süt Miktarını Girin',
          desc: 'Sabah ve akşam sağımlarının tank toplamını (Litre) sisteme ekleyin.'
        },
        {
          title: '2. Sağmal Hayvan Sayısını Teyit Edin',
          desc: 'O gün sağıma giren inek sayısını kontrol edin; sistem inek başı günlük ortalama verimi otomatik hesaplar.'
        },
        {
          title: '3. Verim Eğrilerini İnceleyin',
          desc: 'Rasyon değişimlerinin süt verimini artırıp artırmadığını üretim tablosundan gözlemleyin.'
        }
      ],
      tips: [
        'Yeni bir rasyona geçildiğinde işkembedeki mikroorganizmaların uyum sağlaması 7-10 gün sürer; verim artışı bu süreden sonra netleşir.'
      ],
      keyFeatures: [
        'Günlük Süt Tankı Kaydı',
        'İnek Başı Ortalama Litre Hesabı',
        'Üretim Trendi Takibi'
      ]
    },

    '/ayarlar': {
      badge: 'İŞLETME AYARLARI & PROFİL',
      title: 'Ayarlar & Çiftlik Profili Kılavuzu',
      subtitle: 'Çiftlik unvanı, sistem varsayılanları, güvenlik PIN ve besleme sözlüğü',
      icon: Settings,
      purpose: 'Çiftliğinizin adını belirlemenizi (reçete ve raporların antetinde çıkar), varsayılan canlı ağırlık/süt hedeflerini kaydetmenizi ve detaylı kullanım kılavuzu ile besleme sözlüğüne erişmenizi sağlar.',
      steps: [
        {
          title: '1. Çiftlik Adınızı Kaydedin',
          desc: '"Çiftlik / İşletme Adı" alanına işletmenizin unvanını yazın. Bu ad A4 Mikser Reçetesi ve Rasyon Raporu çıktılarında antet olarak yer alır.'
        },
        {
          title: '2. Varsayılan Hayvan Parametrelerini Ayarlayın',
          desc: 'Rasyon stüdyosunun her açılışında gelmesini istediğiniz Canlı Ağırlık ve Hedef Süt değerlerini kaydedin.'
        },
        {
          title: '3. Giriş PIN Kodunuzu Değiştirin',
          desc: 'Uygulama güvenliğiniz için 4 haneli erişim şifrenizi dilediğiniz zaman güncelleyin.'
        },
        {
          title: '4. Kullanım Kılavuzu & Sözlük Sekmelerini Ziyaret Edin',
          desc: 'Besleme terimleri sözlüğü (KM, HP, Nişasta, Rumen Asidozu vb.) ve detaylı rehberleri inceleyin.'
        }
      ],
      tips: [
        'Çiftlik adınızı güncellediğinizde yazıcıdan alacağınız tüm reçete ve raporlar işletmenize özel şık formatta basılır.'
      ],
      keyFeatures: [
        'Reçete & Rapor Antet Ayarı',
        'PIN / Şifre Güvenlik Yönetimi',
        'Kapsamlı Kullanım Kılavuzu & Terimler Sözlüğü'
      ]
    }
  };

  // Geçerli sayfanın rehberi veya varsayılan ana sayfa rehberi
  const guide = guides[path] || guides['/'];
  const IconComponent = guide.icon;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Başlığı (Header) */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 sm:p-6 relative shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 mt-0.5">
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 bg-emerald-500/30 text-emerald-200 text-[10px] font-black rounded-md tracking-wider border border-emerald-400/30 mb-1">
                  {guide.badge}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {guide.title}
                </h2>
                <p className="text-xs text-emerald-100/90 mt-0.5">
                  {guide.subtitle}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal İçeriği (Scrollable Body) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm leading-relaxed flex-1">
          {/* Amaç Kutusu */}
          <div className="p-4 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl text-emerald-950 flex items-start space-x-3">
            <Lightbulb className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-black text-emerald-900 block text-xs uppercase tracking-wider mb-1">
                Bu Sayfanın Temel Amacı Nedir?
              </strong>
              <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                {guide.purpose}
              </p>
            </div>
          </div>

          {/* Adım Adım Nasıl Kullanılır? */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Adım Adım Kullanım Rehberi</span>
            </h3>

            <div className="space-y-2">
              {guide.steps.map((step, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                  <strong className="text-xs font-black text-slate-900 block">
                    {step.title}
                  </strong>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Öne Çıkan Özellikler */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
            <strong className="text-xs font-black text-emerald-400 uppercase tracking-wider block flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Bu Sayfadaki Öne Çıkan Kolaylıklar:</span>
            </strong>
            <ul className="space-y-1 text-xs text-slate-200">
              {guide.keyFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Püf Noktaları & Saha Tavsiyeleri */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>Pratik Püf Noktaları & Saha İpuçları</span>
            </h3>

            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-950 text-xs space-y-1.5">
              {guide.tips.map((tip, idx) => (
                <p key={idx} className="leading-relaxed">
                  • {tip}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Alt Çubuğu (Footer) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <Link
            href="/ayarlar?tab=kilavuz"
            onClick={onClose}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1.5 hover:underline"
          >
            <BookOpen className="w-4 h-4" />
            <span>Kapsamlı Tüm Kılavuzu & Terimler Sözlüğünü İncele</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-colors shadow-sm"
          >
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
