# 🥛 MilkIQ: Akıllı Süt, Rasyon & Maliyet Zekası Sistemi

**MilkIQ**, küçük ve orta ölçekli süt hayvancılığı işletmeleri için tasarlanmış, **rasyon hazırlama**, **kaba yem asidoz tolerans kontrolü**, **potansiyel süt verimi tahmini**, **aylık genel gider takibi** ve **1 litre sütün anlık net maliyeti ile kârlılık analizini** bir araya getiren yeni nesil, mobil öncelikli (PWA) bir karar destek platformudur.

---

## 🌟 Öne Çıkan Özellikler

1. **🔐 Hızlı & Pratik PIN Girişi:**
   - Kullanıcı adı gerekmez, sadece 4 haneli PIN ile hızlı giriş (Varsayılan PIN: `1234`).
   - Ayarlar menüsünden istenildiği zaman değiştirilebilir.

2. **🌾 Kapsamlı Yem Yönetimi:**
   - Kaba yemler (Silaj, Yonca, Saman, Kuru Ot) ve Kesif yemler (Süt Yemi, Arpa, Küspe, Kepek) ayrı kategorize edilir.
   - Her yem için Kuru Madde (KM %), Ham Protein (HP %), Nişasta (%) ve Birim Fiyat (TL/kg) kaydedilir.
   - Türkiye standartlarına uygun 13 adet hazır yem kütüphanesi tek tıkla yüklenebilir.

3. **⚡ Gerçek Zamanlı (Real-Time) Zooteknik Rasyon Motoru:**
   - Hayvanın canlı ağırlığı (kg) ve hedeflenen günlük süt verimi (L) girilir.
   - Seçilen yemlerin taze miktarları girildikçe veya `+/-` butonlarına basıldıkça anında:
     - Toplam Kuru Madde (KM) tüketimi,
     - Kaba Yem / Kesif Yem oranı ve **Asidoz Riski Renkli Tolerans Göstergesi** (Yeşil: İdeal, Sarı: Dikkat, Kırmızı: Asidoz Tehlikesi),
     - Ham Protein ve Nişasta yüzdeleri,
     - Rasyonun üretebileceği **Potansiyel Süt Miktarı** (Litre),
     - İnek başı günlük **Rasyon Maliyeti (TL/baş)** ve **1 Litre Süt Yem Maliyeti (TL/L)** hesaplanır.

4. **📊 Aylık Genel Gider Kayıt Sistemi:**
   - Yem haricindeki elektrik, su, veteriner/ilaç, işçilik, mazot/traktör, tohumlama vb. masraflar kaydedilir.
   - Sistem aylık toplam gideri ayın gün sayısına (28, 30, 31) bölerek **Günlük Ortalama Genel Gideri** bulur.
   - Günlük toplam sağılan süte oranlayarak **1 Litre Süte Düşen Genel Gider Payını (TL/L)** anlık hesaplar.

5. **🥛 Günlük Süt Üretim Takibi:**
   - Sağılan toplam süt ve inek sayısı girişi.
   - İnek başına günlük ortalama litre takibi.

6. **💰 Entegre Maliyet & Kârlılık Zekası:**
   - 1 Litre Süt Yem Maliyeti + 1 Litre Genel Gider Payı = **1 Litre Sütün Net Toplam Maliyeti**.
   - Süt Satış Fiyatı simülatörü ile **Litre Başı Net Kâr Marjı**, **Günlük Net İşletme Kârı** ve **Aylık Tahmini Kâr**.

7. **📖 Kullanım Kılavuzu & Hakkında (Ayarlar Menüsü İçinde):**
   - Neyin nasıl yapıldığını adım adım anlatan pratik saha rehberi.
   - MilkIQ, Veteriner Hekim Erkan Erdem tarafından Fatih Dinç için geliştirilmiştir. Hayvan besleme, sürü yönetimi ve hayvancılık işletme ekonomisi alanlarındaki saha tecrübesinin modern yazılım teknolojisiyle sentezinden doğmuştur.

8. **📱 PWA & Mobil Öncelikli Akıllı Yükleme Deneyimi:**
   - **Otomatik Yükleme Dialogu:** Mobil cihazdan giriş yapıldığında ve henüz uygulama olarak yüklenmemişse kullanıcıya özel yükleme penceresi açılır.
   - **Android / Chrome:** Tek tıkla doğrudan ana ekrana "Uygulama Olarak Yükle" desteği.
   - **iPhone / iOS Safari Algılama:** Cihaz iOS olduğunda otomatik tespit edilerek Paylaş ($\uparrow$) $\rightarrow$ "Ana Ekrana Ekle" adımlarını gösteren görsel Türkçe rehber.
   - **"Bir daha gösterme" Seçeneği:** Kullanıcı tercihini hatırlar ve tekrarlamaz.
   - **Tam PWA İkon Seti:** 192x192, 512x512 ve Apple Touch Icon PNG formatında üretilmiştir.
   - **İlk Girişte Açılan "Hakkında" Penceresi:** Uygulama açılışında vizyon ve ithaf metnini kullanıcıya sunar ("Bir daha gösterme" seçeneğiyle).

---

## 🛠️ Kurulum ve Çalıştırma

### 1. Geliştirme Modunda Çalıştırma:
```bash
npm run dev
```
Uygulama `http://localhost:3000` adresinde açılır.

### 2. Canlı (Production) Modunda Çalıştırma:
```bash
npm run build
npm start
```

### 3. PostgreSQL Yapılandırması:
Proje kök dizinindeki `.env` dosyasında veritabanı bağlantı adresinizi güncelleyebilirsiniz:
```env
DATABASE_URL="postgresql://postgres:PAROLA@localhost:5432/milkiq_db?schema=public"
DEFAULT_PIN="1234"
```
*Not: Sistem, PostgreSQL servisiniz yapılandırılana kadar otomatik olarak yerel güvenli depolama (`data/milkiq_store.json`) ile kesintisiz çalışacak şekilde hibrit tasarlanmıştır.*

---

## 🔑 Varsayılan Giriş Bilgileri
* **Giriş PIN Kodu:** `1234`
