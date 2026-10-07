# MilkIQ: Akıllı Süt, Rasyon & Maliyet Zekası Sistemi
## Detaylı Uygulama Mimarisi, Zooteknik Hesaplama ve Geliştirme Planı

---

### 1. Proje Özeti ve Vizyonu
**MilkIQ**, süt sığırcılığı işletmelerinde **besleme (rasyon zekası)** ile **finansal maliyet yönetimini (1 litre süt maliyeti, genel giderler, anlık kârlılık)** tek bir çatı altında birleştiren yeni nesil, teknolojik, yüksek kontrastlı ve mobil öncelikli (PWA) bir karar destek platformudur.

Yetiştirici;
1. Elindeki kaba ve kesif yemleri (Kuru Madde, Ham Protein, Nişasta ve Fiyat) sisteme bir kez tanımlar.
2. Hayvanların canlı ağırlığını ve hedeflenen süt verimini girer.
3. Kaba ve kesif yemlerin günlük verilecek taze miktarlarını girdikçe, **anlık (real-time)** olarak:
   - Toplam Kuru Madde (KM) tüketimi,
   - Toplam Ham Protein (HP) ve Nişasta miktarları ile rasyon yüzdeleri,
   - Kaba yem / Kesif yem dengesi,
   - Rasyonun kaba yem açısından **yeterlilik durumu** (Yeşil/Sarı/Kırmızı asidoz ve lif uyarıları),
   - Rasyonun üretebileceği **potansiyel süt miktarı**,
   - İnek başına günlük **rasyon maliyeti** ve **1 litre sütün yemleme maliyeti** hesaplanır.
4. Yemleme dışındaki elektrik, su, veteriner, işçilik, mazot gibi **aylık genel giderleri** kaydeder; MilkIQ bu giderleri ayın gün sayısına bölerek ve günlük sağılan toplam süte oranlayarak **1 litre süte düşen genel gider maliyetini** bulur.
5. Yem maliyeti ile genel gider maliyeti birleşerek yetiştiriciye **1 litre sütün toplam net maliyetini** ve süt satış fiyatına göre **net kâr marjını** anlık gösterir.

---

### 2. İsim, Marka Kimliği ve Logo Konsepti
* **Uygulama Adı:** **MilkIQ**
* **Alt Başlık / Slogan:** *Akıllı Süt, Rasyon & Maliyet Zekası*
* **Logo Tasarımı:**
  - Modern zümrüt yeşili, teknolojik veri ağı/bağlantı noktaları, süt damlası ve inek silüeti sentezi.
  - Mobil ana ekran ve PWA için yüksek kontrastlı App Icon (192x192, 512x512, SVG & PNG).

---

### 3. Kullanıcı Arayüzü & Deneyim Prensipleri (Farmer-First UX)
* **PWA & Mobil Uyumluluk:** Tek elle kullanım, büyük dokunmatik hedefler (minimum 48px), mobil tarayıcılarda adres çubuğunu gizleyen `standalone` PWA modu.
* **Güneş Işığı & Ahır Ortamı Uyumu:** Yüksek kontrastlı renkler (WCAG AAA uyumlu), net yazılar, kafa karıştırmayan sade kartlar.
* **Sayısal Girdi Kolaylığı:** Mobil klavyede doğrudan ondalıklı sayı tuş takımını açan `inputmode="decimal"` yapısı ve hızlı +/- artırma butonları.
* **Anlık Reaktif Hesaplama:** "Hesapla" butonuna basmaya gerek kalmadan, kullanıcı gram/kilo değiştirdiği milisaniyede tüm grafik ve göstergelerin akıcı şekilde güncellenmesi.
* **Görsel Durum Göstergeleri:** Karmaşık zooteknik terimler yerine:
  - 🟢 **Mükemmel / Yeterli:** Kaba yem oranı ve protein dengeli.
  - 🟡 **Dikkat / Sınırda:** Kaba yem biraz düşük veya nişasta yüksek.
  - 🔴 **Kritik / Tehlike:** Kaba yem çok düşük (Asidoz riski!) veya protein çok yetersiz.
* **Hazır Yem Kütüphanesi:** Çiftçinin tek tek değer aramaması için Türkiye şartlarına uygun standart hazır yemler (Mısır Silajı, Yonca Kuru Otu, Buğday Samanı, Süt Yemi 19/2700, Arpa Ezmesi, Ayçiçeği Küspesi vb.) tek tıkla eklenebilir hazır şablon olarak sunulacaktır.

---

### 4. Teknoloji Mimarisi

| Katman | Teknoloji | Açıklama |
| :--- | :--- | :--- |
| **Frontend & Framework** | **Next.js 15+ (App Router)** | Modern SSR/CSR hibrit yapı, yüksek performans |
| **Dil** | **TypeScript** | Tip güvenliği ve sıfır çalışma zamanı hesaplama hatası |
| **Stil & Arayüz** | **Tailwind CSS + Lucide Icons** | Hızlı, hafif ve modern mobil bileşenler |
| **Veritabanı** | **PostgreSQL 17** | Güvenilir ilişkisel veritabanı (yerel servis hazır) |
| **ORM** | **Prisma ORM** | Tip güvenli veritabanı şeması ve sorgular |
| **PWA Desteği** | **Web App Manifest + Service Worker** | Telefona uygulama olarak yüklenebilir (Installable) |
| **Kimlik Doğrulama** | **PIN / Şifre Tabanlı Basit Auth** | Kullanıcı adı yok, sadece 4 haneli PIN (Varsayılan: `1234`), ayarlardan değiştirilebilir |

---

### 5. Zooteknik Hesaplama Motoru (Rasyon Algoritmaları)

#### A. Kuru Madde (KM) Tüketimi
Hayvanın biyolojik doygunluk sınırı ve besin alımı su hariç **Kuru Madde (KM)** üzerinden hesaplanır:
$$KM_{\text{yem}} = \text{Taze Miktar (kg)} \times \frac{\text{KM Oranı (\%)}}{100}$$
$$\text{Toplam KM (kg)} = \sum KM_{\text{yem}}$$

* **Tahmini Günlük KM İhtiyacı (KMT):**
  $$KMT (\text{kg}) = (\text{Canlı Ağırlık} \times 0.025) + (\text{Hedef Süt} \times 0.10)$$
  *(Örnek: 600 kg inek, 25 L süt verimi için: $15 + 2.5 = 17.5 \text{ kg KM}$)*

#### B. Kaba Yem İhtiyacı ve Rumen Sağlığı Toleransı
İşkembe (rumen) sağlığı ve asidozu önlemek için ineğin canlı ağırlığının en az %1.2 - %1.4'ü kadar kaba yem kuru maddesi tüketmesi gerekir:
$$\text{Minimum Kaba Yem KM İhtiyacı} = \text{Canlı Ağırlık} \times 0.013$$
* **Kaba Yem Oranı:**
  $$\text{Kaba Yem Oranı (\%)} = \left(\frac{\text{Kaba Yem KM Toplamı}}{\text{Toplam KM}}\right) \times 100$$
* **Tolerans ve Durum Değerlendirmesi:**
  - $\text{Kaba Yem KM} < \text{İhtiyaç} \times 0.90$ veya $\text{Oran} < \%40$ $\rightarrow$ **🔴 ASİDOZ RİSKİ! Kaba yem çok yetersiz.**
  - $\%40 \le \text{Oran} \le \%65$ ve $\text{Kaba Yem KM} \ge \text{İhtiyaç} \times 0.95$ $\rightarrow$ **🟢 İDEAL DENGELİ BESLEME.**
  - $\text{Oran} > \%70$ $\rightarrow$ **🟡 KABA YEM YÜKSEK (Düşük Enerji Riski):** Yüksek süt için kesif yem takviyesi gerekebilir.

#### C. Protein ve Üretilebilir Süt Miktarı
Besin maddeleri kuru madde üzerinden hesaplanır:
$$\text{Ham Protein (HP, kg)} = KM_{\text{yem}} \times \frac{\text{Protein Oranı (\%)}}{100}$$
$$\text{Toplam HP (gram)} = \sum \text{HP (kg)} \times 1000$$

* **Süt Potansiyeli Hesabı:**
  - **Yaşama Payı Protein İhtiyacı:** $\approx \text{Canlı Ağırlık} \times 0.67 \text{ gram}$ (600 kg için $\approx 400 \text{ g}$)
  - **1 Litre Süt İçin Gerekli HP:** $\approx 90 \text{ gram}$ (Kullanıcı ayarlarından özelleştirilebilir, varsayılan 90g)
  - **Üretilebilir Süt Potansiyeli (Litre):**
    $$\text{Potansiyel Süt (L)} = \frac{\text{Toplam HP (g)} - \text{Yaşama Payı HP (g)}}{\text{1 L Süt İçin Gereken HP (90g)}}$$
  *(Not: Uygulamada hem bu zooteknik net süt potansiyeli hem de kullanıcının talep ettiği sadeleştirilmiş oranlama bir arada gösterilir).*

#### D. Nişasta Dengesi
$$\text{Nişasta (kg)} = KM_{\text{yem}} \times \frac{\text{Nişasta Oranı (\%)}}{100}$$
$$\text{Rasyondaki Nişasta Oranı (\%)} = \left(\frac{\text{Toplam Nişasta (kg)}}{\text{Toplam KM (kg)}}\right) \times 100$$
* İdeal Aralık: **%22 - %28**
* %28 üzeri $\rightarrow$ **⚠️ Nişasta Yüksek (Subakut Rumen Asidozu / SARA riski)**
* %20 altı $\rightarrow$ **⚠️ Nişasta Düşük (Enerji açığı, süt verimi düşebilir)**

---

### 6. Finans ve Maliyet Hesaplama Motoru

#### A. Yemleme Maliyetleri (Günlük ve Litre Başı)
$$\text{Günlük Rasyon Maliyeti (TL/baş)} = \sum (\text{Taze Miktar (kg)} \times \text{Birim Fiyat (TL/kg)})$$
$$\text{1 Litre Sütün Yem Maliyeti (TL/L)} = \frac{\text{Günlük Rasyon Maliyeti}}{\text{Hedeflenen / Gerçekleşen Süt Ortalaması (L)}}$$

#### B. Aylık Genel Giderler ve Litre Başı Maliyet
Kayıt altına alınan giderler: Elektrik, Su, Veteriner & İlaç, İşçilik, Mazot & Traktör, Tohumlama, Bakım-Onarım, Diğer.
$$\text{Günlük Genel Gider (TL)} = \frac{\text{Aylık Toplam Genel Gider}}{\text{Ayın Gün Sayısı (örn: 30)}}$$
$$\text{1 Litre Süte Düşen Genel Gider (TL/L)} = \frac{\text{Günlük Genel Gider}}{\text{İşletmede Günlük Üretilen Toplam Süt (L)}}$$

#### C. Toplam Süt Maliyeti ve Kâr/Zarar
$$\text{1 Litre Sütün Toplam Maliyeti} = \text{Litre Başı Yem Maliyeti} + \text{Litre Başı Genel Gider}$$
$$\text{Litre Başı Net Kâr (TL/L)} = \text{Çiğ Süt Satış Fiyatı} - \text{1 Litre Sütün Toplam Maliyeti}$$
$$\text{Günlük Net İşletme Kârı (TL)} = \text{Litre Başı Net Kâr} \times \text{Günlük Toplam Süt (L)}$$

---

### 7. Veritabanı Şeması (PostgreSQL / Prisma)

```prisma
model SystemSetting {
  id                    String   @id @default("singleton")
  pinCode               String   @default("1234")
  milkSalePrice         Float    @default(15.5) // TL/Litre süt satış fiyatı
  proteinPerLiter       Float    @default(90.0) // 1L süt için gerekli protein (gram)
  maintenanceProteinFactor Float @default(0.67) // Canlı ağırlık başına yaşama payı çarpanı
  updatedAt             DateTime @updatedAt
}

enum FeedType {
  KABA   // Kaba Yem (Silaj, Yonca, Saman, Ot)
  KESIF  // Kesif Yem (Fabrika Yemi, Arpa, Küspe, Kepek)
}

model Feed {
  id          String       @id @default(cuid())
  name        String
  type        FeedType
  dryMatter   Float        // Kuru Madde % (ör. 30.0 mısır silajı, 88.0 kuru ot)
  protein     Float        // Ham Protein % (ör. 8.0 silaj, 16.0 yonca, 19.0 fabrika yemi)
  starch      Float        // Nişasta % (ör. 30.0 silaj, 55.0 arpa)
  unitPrice   Float        // TL/kg birim fiyat
  isDefault   Boolean      @default(false)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  rationItems RationItem[]
}

model Ration {
  id           String       @id @default(cuid())
  title        String
  liveWeight   Float        // Canlı Ağırlık (kg, ör. 600)
  targetMilk   Float        // Hedef Süt Ortalaması (L/gün, ör. 25)
  isActive     Boolean      @default(true)
  notes        String?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  items        RationItem[]
}

model RationItem {
  id          String   @id @default(cuid())
  rationId    String
  feedId      String
  freshAmount Float    // Günlük verilen taze miktar (kg)
  ration      Ration   @relation(fields: [rationId], references: [id], onDelete: Cascade)
  feed        Feed     @relation(fields: [feedId], references: [id], onDelete: Cascade)
}

enum ExpenseCategory {
  ELEKTRIK
  SU
  VETERINER_ILAC
  ISCILIK
  MAZOT_TRAKTOR
  TOHUMLAMA
  BAKIM_ONARIM
  DIGER
}

model MonthlyExpense {
  id          String          @id @default(cuid())
  category    ExpenseCategory
  amount      Float           // Tutar TL
  month       String          // YYYY-AA formatında (ör. "2026-10")
  description String?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}

model DailyProduction {
  id          String   @id @default(cuid())
  date        DateTime @unique @default(now())
  totalMilk   Float    // Günlük toplam üretilen süt (L)
  milkingCows Int      // Sağılan inek sayısı
  notes       String?
  createdAt   DateTime @default(now())
}
```

---

### 8. Ekran ve Sayfa Mimarisi
1. **`/login` (PIN Giriş Ekranı):**
   - 4 haneli PIN giriş arayüzü, büyük dokunmatik tuşlar, "Beni Hatırla" seçeneği.
2. **`/` (Dashboard / Ana Panel):**
   - Hızlı durum kartları: Aktif Rasyon, 1 Litre Süt Yem Maliyeti, 1 Litre Genel Gider, Toplam Süt Maliyeti, Net Kâr Göstergesi.
   - Hızlı aksiyon butonları: "Yeni Rasyon Hazırla", "Yem Ekle", "Gider Ekle", "Günlük Süt Gir".
3. **`/rasyon` (İnteraktif Rasyon Stüdyosu):**
   - Canlı ağırlık ve hedef süt girişi.
   - **Kaba Yemler** ve **Kesif Yemler** için ayrı, net gruplanmış yem seçim listeleri.
   - Gerçek zamanlı hesaplama paneli (KM, Protein, Nişasta, Kaba/Kesif Oranı, Yeterlilik Durumu Barı, Potansiyel Süt, Yem Maliyeti).
   - "Rasyonu Kaydet" ve "Şablon Olarak Sakla".
4. **`/yemler` (Yem Yönetimi):**
   - Kaba ve Kesif yemlerin filtrelenebilir listesi.
   - Yeni yem ekleme modalı (Ad, KM %, Protein %, Nişasta %, Fiyat).
   - "Standart Yemleri Yükle" (Silaj, yonca, arpa, fabrika yemi hazır kütüphane düğmesi).
5. **`/giderler` (Aylık Genel Giderler):**
   - Kategori bazlı gider listesi ve aylık toplamlar.
   - Günlük ortalama gider hesabı ($Toplam / Gün$).
   - Hızlı gider ekleme formu.
6. **`/uretim` (Günlük Süt Üretim Kaydı):**
   - Sağılan toplam süt ve inek sayısı girişi.
   - İşletme inek başı süt ortalaması.
7. **`/maliyet` (Finansal Analiz & Litre Maliyet Tablosu):**
   - 1 Litre sütün tam maliyet dökümü (Yem + Elektrik + İşçilik + Veteriner vb.).
   - Süt Satış Fiyatı simülasyonu ile kâr/zarar başabaş noktası (Break-even).
8. **`/ayarlar` (Ayarlar, Kılavuz & Hakkında):**
   - **Sekme 1: Sistem Ayarları & Güvenlik:** PIN şifresini değiştirme, 1L süt protein ihtiyacı, yaşama payı katsayısı, varsayılan süt satış fiyatı.
   - **Sekme 2: Kullanım Kılavuzu:** Yem tanımlama, rasyon hazırlama, kaba yem toleransı/asidoz güvenliği, giderler ve maliyet analizinin adım adım pratik saha rehberi.
   - **Sekme 3: Hakkında & Vizyon:** Hayvan besleme & sürü yönetimi ve hayvancılık işletme ekonomisi tecrübeleri ile modern yazılım teknolojisinin senteziyle geliştirilmiş; Veteriner Hekim Erkan Erdem tarafından Fatih Dinç için özel olarak üretilmiştir.

---

### 9. Aşamalı Uygulama ve Geliştirme Yol Haritası

* [x] **Faz 1: Araştırma, Algoritma Modelleme ve Planlama (Tamamlandı)**
* [ ] **Faz 2: Proje Altyapısı, Next.js & Tailwind Kurulumu, Prisma & PostgreSQL Konfigürasyonu**
* [ ] **Faz 3: Logo, İkonlar ve PWA Varlıklarının Üretilmesi (`manifest.json`, iconlar, favicon)**
* [ ] **Faz 4: Veritabanı Şeması, Migration ve Standart Yem Seed Verilerinin Hazırlanması**
* [ ] **Faz 5: PIN Tabanlı Kimlik Doğrulama ve Güvenlik Altyapısı**
* [ ] **Faz 6: Yem Yönetim Modülü (Kaba & Kesif Yem CRUD + Hazır Kütüphane)**
* [ ] **Faz 7: İnteraktif Rasyon Hesaplama Motoru & UI (Anlık KM, Protein, Nişasta, Tolerans Uyarıları, Süt Potansiyeli, Yem Maliyeti)**
* [ ] **Faz 8: Genel Gider ve Günlük Süt Üretim Modülleri (Aylık giderler, 1L süte düşen maliyet)**
* [ ] **Faz 9: Entegre Finansal Raporlama & Başabaş Analiz Ekranı**
* [ ] **Faz 10: Ayarlar Modülü (PIN Değiştirme, Katsayı Ayarları)**
* [ ] **Faz 11: Mobil UX İyileştirmeleri, PWA Testleri, Sayısal Doğrulamalar ve Teslimat**
