const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

async function createPresentation() {
  console.log('Sunum oluşturuluyor...');
  const pres = new pptxgen();

  pres.layout = 'LAYOUT_16x9';
  pres.author = 'Erkan Erdem';
  pres.company = 'MilkIQ - erkanerdem.online';
  pres.subject = 'MilkIQ Akıllı Süt Sığırcılığı Rasyon & Karlılık Yönetim Sistemi';
  pres.title = 'MilkIQ Ürün ve Özellik Tanıtım Sunumu';

  // Ortak Renk Paleti
  const BG_DARK = '0B1329';
  const CARD_BG = '1E293B';
  const CARD_BORDER = '334155';
  const EMERALD = '10B981';
  const EMERALD_LIGHT = '34D399';
  const BLUE = '38BDF8';
  const WHITE = 'FFFFFF';
  const TEXT_MUTED = '94A3B8';
  const GOLD = 'F59E0B';

  const logoPath = path.join(__dirname, '..', 'public', 'logo.png');
  const hasLogo = fs.existsSync(logoPath);

  // Ortak Footer Fonksiyonu
  function addFooter(slide, currentSlide, totalSlides = 10) {
    slide.addShape(pres.ShapeType.line, {
      x: 0.8,
      y: 7.0,
      w: 11.7,
      h: 0,
      line: { color: '1E293B', width: 1 }
    });

    slide.addText('MilkIQ • Akıllı Süt Sığırcılığı Rasyon & Karlılık Sistemi', {
      x: 0.8,
      y: 7.05,
      w: 6.0,
      h: 0.35,
      fontSize: 9,
      color: TEXT_MUTED,
      fontFace: 'Segoe UI'
    });

    slide.addText(`Developed by Erkan Erdem (erkanerdem.online)  |  ${currentSlide} / ${totalSlides}`, {
      x: 6.8,
      y: 7.05,
      w: 5.7,
      h: 0.35,
      align: 'right',
      fontSize: 9,
      color: TEXT_MUTED,
      fontFace: 'Segoe UI'
    });
  }

  // ==========================================
  // SLAYT 1: KAPAK (Title Slide)
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: BG_DARK };

    // Arka plan dekoratif şekiller
    slide.addShape(pres.ShapeType.roundRect, {
      x: 8.5,
      y: -1.0,
      w: 6.0,
      h: 6.0,
      rectRadius: 0.5,
      fill: { color: '10B981', transparency: 92 },
      line: { color: '10B981', width: 1, transparency: 80 }
    });

    if (hasLogo) {
      slide.addImage({
        path: logoPath,
        x: 1.0,
        y: 1.2,
        w: 1.6,
        h: 1.6
      });
    }

    slide.addText('AKILLI SÜT SIĞIRCILIĞI TEKNOLOJİSİ', {
      x: 1.0,
      y: 3.1,
      w: 8.0,
      h: 0.4,
      fontSize: 12,
      fontFace: 'Segoe UI',
      color: EMERALD_LIGHT,
      bold: true,
      charSpacing: 2
    });

    slide.addText('MilkIQ', {
      x: 1.0,
      y: 3.5,
      w: 8.0,
      h: 1.2,
      fontSize: 54,
      fontFace: 'Segoe UI',
      color: WHITE,
      bold: true
    });

    slide.addText('Rasyon, Karlılık & Sürü Yönetim Sistemi', {
      x: 1.0,
      y: 4.7,
      w: 10.0,
      h: 0.6,
      fontSize: 22,
      fontFace: 'Segoe UI',
      color: TEXT_MUTED
    });

    slide.addText('NRC Standartlarında Bilimsel Besleme • Dinamik Süt/Yem Paritesi • Kapsamlı Maliyet Denetimi', {
      x: 1.0,
      y: 5.4,
      w: 10.0,
      h: 0.5,
      fontSize: 13,
      fontFace: 'Segoe UI',
      color: BLUE
    });

    // Alt künye kartı
    slide.addShape(pres.ShapeType.roundRect, {
      x: 1.0,
      y: 6.2,
      w: 5.5,
      h: 0.8,
      rectRadius: 0.2,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1 }
    });

    slide.addText('Geliştirici: Erkan Erdem | erkanerdem.online\nSürüm: v1.0 Production Ready • PWA & Mobil Uyumlu', {
      x: 1.2,
      y: 6.25,
      w: 5.1,
      h: 0.7,
      fontSize: 10,
      fontFace: 'Segoe UI',
      color: WHITE
    });
  }

  // ==========================================
  // SLAYT 2: SEKTÖREL SORUN & MilkIQ ÇÖZÜMÜ
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: BG_DARK };

    slide.addText('SEKTÖREL GERÇEKLER & STRATEJİK DEĞER', {
      x: 0.8,
      y: 0.6,
      w: 10.0,
      h: 0.3,
      fontSize: 11,
      color: EMERALD_LIGHT,
      bold: true,
      fontFace: 'Segoe UI'
    });

    slide.addText('Geleneksel Çiftlik Yönetimi vs. MilkIQ', {
      x: 0.8,
      y: 0.9,
      w: 10.0,
      h: 0.6,
      fontSize: 26,
      color: WHITE,
      bold: true,
      fontFace: 'Segoe UI'
    });

    // Sol Kart: Geleneksel Yöntemler (Kırmızı Vurgulu)
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.8,
      w: 5.6,
      h: 4.8,
      rectRadius: 0.25,
      fill: { color: '1E1B24' },
      line: { color: '7F1D1D', width: 1.5 }
    });

    slide.addText('Geleneksel Besleme Zorlukları', {
      x: 1.1,
      y: 2.1,
      w: 5.0,
      h: 0.4,
      fontSize: 16,
      color: 'F87171',
      bold: true,
      fontFace: 'Segoe UI'
    });

    const traditionalPoints = [
      'Yem maliyeti çiftlik cirosunun %70\'ini oluşturur; plansız alımlar zarara yol açar.',
      'Göz kararı veya sabit reçeteler nedeniyle gizli asidoz ve metabolik hastalıklar yaşanır.',
      '1 litre sütün anlık yem maliyeti ve hayvan başı net karı hesaplanamaz.',
      'Tahıl ve kaba yem fiyat dalgalanmalarına karşı anlık rasyon revizyonu yapılamaz.',
      'Veriler kağıt veya karışık tablolarda kaybolur, geriye dönük analiz yapılamaz.'
    ];

    traditionalPoints.forEach((point, i) => {
      slide.addText(`•  ${point}`, {
        x: 1.1,
        y: 2.7 + i * 0.72,
        w: 5.0,
        h: 0.65,
        fontSize: 11,
        color: 'E2E8F0',
        fontFace: 'Segoe UI'
      });
    });

    // Sağ Kart: MilkIQ Çözümü (Yeşil Vurgulu)
    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.8,
      y: 1.8,
      w: 5.6,
      h: 4.8,
      rectRadius: 0.25,
      fill: { color: CARD_BG },
      line: { color: EMERALD, width: 2 }
    });

    slide.addText('MilkIQ ile Akıllı Dönüşüm', {
      x: 7.1,
      y: 2.1,
      w: 5.0,
      h: 0.4,
      fontSize: 16,
      color: EMERALD_LIGHT,
      bold: true,
      fontFace: 'Segoe UI'
    });

    const milkiqPoints = [
      'Bilimsel NRC standartlarında hassas Kuru Madde, Protein ve Enerji optimizasyonu.',
      'Dinamik Süt/Yem Paritesi takibiyle minimum maliyetle maksimum pik verimi.',
      'Fabrika yemleri ve yerel yemlerin güncel borsa/piyasa fiyatlarıyla anlık kıyaslanması.',
      'Laktasyon dönemi ve canlı ağırlığa göre otomatik besin ihtiyacı simülasyonu.',
      'Tüm cihazlardan (cep telefonu, tablet, PC) bulut senkronizasyonu ile 7/24 erişim.'
    ];

    milkiqPoints.forEach((point, i) => {
      slide.addText(`✔  ${point}`, {
        x: 7.1,
        y: 2.7 + i * 0.72,
        w: 5.0,
        h: 0.65,
        fontSize: 11,
        color: WHITE,
        fontFace: 'Segoe UI'
      });
    });

    addFooter(slide, 2);
  }

  // ==========================================
  // SLAYT 3: AKILLI RASYON OPTİMİZASYONU
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: BG_DARK };

    slide.addText('TEMEL MODÜL 1', {
      x: 0.8,
      y: 0.6,
      w: 10.0,
      h: 0.3,
      fontSize: 11,
      color: EMERALD_LIGHT,
      bold: true,
      fontFace: 'Segoe UI'
    });

    slide.addText('Bilimsel Rasyon Hesaplama & Optimizasyon', {
      x: 0.8,
      y: 0.9,
      w: 10.0,
      h: 0.6,
      fontSize: 26,
      color: WHITE,
      bold: true,
      fontFace: 'Segoe UI'
    });

    // 4 Önemli Besin Parametre Kartı
    const nutrients = [
      { name: 'Kuru Madde (KM)', desc: 'İşkembe kapasitesine uygun optimum tokluk ve sindirim.', color: EMERALD },
      { name: 'Ham Protein (HP)', desc: 'Süt verimi ve kas dokusu için gerekli bypass & ruminal protein.', color: BLUE },
      { name: 'Net Enerji (ME / NEL)', desc: 'Pik süt verimi ve kondisyon kaybını önleyen enerji dengesi.', color: GOLD },
      { name: 'Lif Dengesi (NDF / ADF)', desc: 'Rumen sağlığı, geviş getirme ve asidoz önleyici yapısal lif.', color: 'EC4899' }
    ];

    nutrients.forEach((n, i) => {
      const colX = 0.8 + i * 2.95;
      slide.addShape(pres.ShapeType.roundRect, {
        x: colX,
        y: 1.8,
        w: 2.8,
        h: 2.1,
        rectRadius: 0.2,
        fill: { color: CARD_BG },
        line: { color: n.color, width: 1.5 }
      });

      slide.addText(n.name, {
        x: colX + 0.2,
        y: 2.0,
        w: 2.4,
        h: 0.4,
        fontSize: 13,
        bold: true,
        color: WHITE,
        fontFace: 'Segoe UI'
      });

      slide.addText(n.desc, {
        x: colX + 0.2,
        y: 2.5,
        w: 2.4,
        h: 1.2,
        fontSize: 10,
        color: TEXT_MUTED,
        fontFace: 'Segoe UI'
      });
    });

    // Alt Detay Kartı
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 4.2,
      w: 11.6,
      h: 2.4,
      rectRadius: 0.2,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1 }
    });

    slide.addText('Hassas Hayvan & Üretim Parametreleri Uyarlaması', {
      x: 1.1,
      y: 4.4,
      w: 10.0,
      h: 0.4,
      fontSize: 15,
      bold: true,
      color: EMERALD_LIGHT,
      fontFace: 'Segoe UI'
    });

    const features = [
      '• Canlı Ağırlık (kg), Günlük Hedef Süt Verimi (L), Süt Yağ Oranı (%) ve Protein (%) girişi.',
      '• Laktasyon Günü (DIM) ve Gebelik Ayına göre otomatik gereksinim artışı hesaplama.',
      '• Gerçek zamanlı Kalsiyum (Ca), Fosfor (P) ve Tuz mineral oranı uyarı sistemi.',
      '• "Rasyonu Kaydet", "Rasyonu Kopyala" ve tek tıkla Excel/PDF formatında çıktı alma.'
    ];

    features.forEach((feat, idx) => {
      slide.addText(feat, {
        x: 1.1,
        y: 4.9 + idx * 0.4,
        w: 11.0,
        h: 0.35,
        fontSize: 11,
        color: WHITE,
        fontFace: 'Segoe UI'
      });
    });

    addFooter(slide, 3);
  }

  // ==========================================
  // SLAYT 4: KAPSAMLI YEM VE FABRİKA YEMLERİ KÜTÜPHANESİ
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: BG_DARK };

    slide.addText('TEMEL MODÜL 2', {
      x: 0.8,
      y: 0.6,
      w: 10.0,
      h: 0.3,
      fontSize: 11,
      color: EMERALD_LIGHT,
      bold: true,
      fontFace: 'Segoe UI'
    });

    slide.addText('Dinamik Yem & Fabrika Yemleri Kataloğu', {
      x: 0.8,
      y: 0.9,
      w: 10.0,
      h: 0.6,
      fontSize: 26,
      color: WHITE,
      bold: true,
      fontFace: 'Segoe UI'
    });

    // 3 Kategori Kartı
    const categories = [
      {
        title: 'Kaba Yemler & Silajlar',
        items: ['Mısır Silajı (KM: %32)', 'Yonca Kuru Otu (HP: %18)', 'Saman & Çayır Otu', 'Fiğ & Tritikale Silajı'],
        badge: 'Temel Rumen Lif Kaynağı'
      },
      {
        title: 'Tahıllar & Sanayi Yan Ürünleri',
        items: ['Mısır Flake & Arpa Kırması', 'Soya Küspesi (HP: %44-%48)', 'Ayçiçeği Küspesi (HP: %32)', 'Pancar Posası & Melas'],
        badge: 'Yüksek Enerji & Protein'
      },
      {
        title: 'Tescilli Fabrika Yemleri',
        items: ['Eriş Sığır Süt A (19 HP / 2800 ME)', 'Eriş Crown Patlamış Mısır', 'Özel Düve & Geçiş Dönemi Yemleri', 'Premiksler, Mermer Tozu & Tuz'],
        badge: 'Hazır & Dengeli Karışımlar'
      }
    ];

    categories.forEach((cat, idx) => {
      const cardX = 0.8 + idx * 3.95;
      slide.addShape(pres.ShapeType.roundRect, {
        x: cardX,
        y: 1.8,
        w: 3.75,
        h: 4.8,
        rectRadius: 0.25,
        fill: { color: CARD_BG },
        line: { color: CARD_BORDER, width: 1 }
      });

      slide.addText(cat.badge.toUpperCase(), {
        x: cardX + 0.25,
        y: 2.1,
        w: 3.2,
        h: 0.3,
        fontSize: 9,
        bold: true,
        color: EMERALD_LIGHT,
        fontFace: 'Segoe UI'
      });

      slide.addText(cat.title, {
        x: cardX + 0.25,
        y: 2.4,
        w: 3.2,
        h: 0.5,
        fontSize: 15,
        bold: true,
        color: WHITE,
        fontFace: 'Segoe UI'
      });

      cat.items.forEach((item, itemIdx) => {
        slide.addText(`• ${item}`, {
          x: cardX + 0.25,
          y: 3.1 + itemIdx * 0.6,
          w: 3.2,
          h: 0.5,
          fontSize: 11,
          color: 'CBD5E1',
          fontFace: 'Segoe UI'
        });
      });

      // Alt not
      slide.addShape(pres.ShapeType.roundRect, {
        x: cardX + 0.25,
        y: 5.6,
        w: 3.25,
        h: 0.7,
        rectRadius: 0.15,
        fill: { color: '0F172A' },
        line: { color: '334155', width: 1 }
      });

      slide.addText('Fiyat & Besin Değeri Düzenlenebilir', {
        x: cardX + 0.3,
        y: 5.75,
        w: 3.15,
        h: 0.4,
        fontSize: 9,
        color: TEXT_MUTED,
        align: 'center',
        fontFace: 'Segoe UI'
      });
    });

    addFooter(slide, 4);
  }

  // ==========================================
  // SLAYT 5: FİNANSAL ANALİZ VE SÜT/YEM PARİTESİ
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: BG_DARK };

    slide.addText('FİNANSAL ZEKA & KARLILIK', {
      x: 0.8,
      y: 0.6,
      w: 10.0,
      h: 0.3,
      fontSize: 11,
      color: EMERALD_LIGHT,
      bold: true,
      fontFace: 'Segoe UI'
    });

    slide.addText('Süt / Yem Paritesi & Kar Marjı Yönetimi', {
      x: 0.8,
      y: 0.9,
      w: 10.0,
      h: 0.6,
      fontSize: 26,
      color: WHITE,
      bold: true,
      fontFace: 'Segoe UI'
    });

    // 3 Metrik Gösterge Kutusu
    const metrics = [
      {
        title: '1 Litre Süt Yem Maliyeti',
        value: '₺ 7.85 / L',
        subtext: 'Rasyondaki toplam günlük yem tutarının günlük süt verimine oranı.',
        color: BLUE
      },
      {
        title: 'Günlük Hayvan Başı Net Kar',
        value: '+ ₺ 142.50 / Gün',
        subtext: 'Süt geliri - (Yem gideri + Günlük amortisman ve genel giderler).',
        color: EMERALD
      },
      {
        title: 'Süt / Yem Paritesi',
        value: '1.48 (İdeal Aralık)',
        subtext: '1 kg süt satışı ile kaç kg yem alınabileceğini gösteren kritik katsayı.',
        color: GOLD
      }
    ];

    metrics.forEach((m, idx) => {
      const boxX = 0.8 + idx * 3.95;
      slide.addShape(pres.ShapeType.roundRect, {
        x: boxX,
        y: 1.8,
        w: 3.75,
        h: 2.2,
        rectRadius: 0.25,
        fill: { color: CARD_BG },
        line: { color: m.color, width: 2 }
      });

      slide.addText(m.title, {
        x: boxX + 0.2,
        y: 2.0,
        w: 3.35,
        h: 0.35,
        fontSize: 12,
        bold: true,
        color: TEXT_MUTED,
        fontFace: 'Segoe UI'
      });

      slide.addText(m.value, {
        x: boxX + 0.2,
        y: 2.4,
        w: 3.35,
        h: 0.65,
        fontSize: 22,
        bold: true,
        color: m.color,
        fontFace: 'Segoe UI'
      });

      slide.addText(m.subtext, {
        x: boxX + 0.2,
        y: 3.1,
        w: 3.35,
        h: 0.75,
        fontSize: 9.5,
        color: 'E2E8F0',
        fontFace: 'Segoe UI'
      });
    });

    // Alt Analiz Paneli
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 4.3,
      w: 11.6,
      h: 2.3,
      rectRadius: 0.2,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1 }
    });

    slide.addText('Finansal Karar Destek Mekanizması', {
      x: 1.1,
      y: 4.5,
      w: 8.0,
      h: 0.35,
      fontSize: 14,
      bold: true,
      color: WHITE,
      fontFace: 'Segoe UI'
    });

    const finPoints = [
      '• Yem fiyatları arttığında aynı besin değerini koruyarak en ekonomik alternatif hammaddeleri önerir.',
      '• Süt fiyatı düştüğünde işletmenin başa baş (break-even) noktasını otomatik simüle eder.',
      '• Sürü genelinde aylık ve yıllık tahmini ciro & net kar projeksiyonları sunar.',
      '• Çiftliğin finansal sağlığını renk kodlu grafik ve KPI kartlarıyla anlık özetler.'
    ];

    finPoints.forEach((fp, i) => {
      slide.addText(fp, {
        x: 1.1,
        y: 4.95 + i * 0.38,
        w: 11.0,
        h: 0.35,
        fontSize: 10.5,
        color: 'CBD5E1',
        fontFace: 'Segoe UI'
      });
    });

    addFooter(slide, 5);
  }

  // ==========================================
  // SLAYT 6: SÜRÜ & ÜRETİM TAKİBİ
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: BG_DARK };

    slide.addText('SÜRÜ & ÜRETİM YÖNETİMİ', {
      x: 0.8,
      y: 0.6,
      w: 10.0,
      h: 0.3,
      fontSize: 11,
      color: EMERALD_LIGHT,
      bold: true,
      fontFace: 'Segoe UI'
    });

    slide.addText('Laktasyon Gruplandırma & Verim Projeksiyonu', {
      x: 0.8,
      y: 0.9,
      w: 10.0,
      h: 0.6,
      fontSize: 26,
      color: WHITE,
      bold: true,
      fontFace: 'Segoe UI'
    });

    const herdGroups = [
      {
        title: '1. Erken Laktasyon (Pik Dönemi)',
        dim: 'DIM: 1 - 100 Gün',
        desc: 'Negatif enerji dengesini önlemek için yüksek enerjili yoğun rasyon. Karaciğer ve rumen koruyucu premiksler.',
        color: 'EF4444'
      },
      {
        title: '2. Orta Laktasyon (Plato Dönemi)',
        dim: 'DIM: 101 - 200 Gün',
        desc: 'Dengeli kondisyon skoru muhafazası, süt proteini ve yağını maksimize eden optimum kaba/kesif yem oranı.',
        color: BLUE
      },
      {
        title: '3. Geç Laktasyon & Kuru Dönem',
        dim: 'DIM: 201+ Gün & Doğuma 60 Gün',
        desc: 'Yağlanmayı önleyici yüksek lifli rasyon. Doğum felcini (hipokalsemi) engelleyen anyonik tuz stratejileri.',
        color: EMERALD
      }
    ];

    herdGroups.forEach((group, idx) => {
      const gX = 0.8 + idx * 3.95;
      slide.addShape(pres.ShapeType.roundRect, {
        x: gX,
        y: 1.8,
        w: 3.75,
        h: 4.8,
        rectRadius: 0.25,
        fill: { color: CARD_BG },
        line: { color: CARD_BORDER, width: 1 }
      });

      slide.addShape(pres.ShapeType.roundRect, {
        x: gX + 0.25,
        y: 2.1,
        w: 3.25,
        h: 0.45,
        rectRadius: 0.1,
        fill: { color: group.color, transparency: 85 },
        line: { color: group.color, width: 1 }
      });

      slide.addText(group.dim, {
        x: gX + 0.3,
        y: 2.18,
        w: 3.15,
        h: 0.3,
        fontSize: 10,
        bold: true,
        color: group.color,
        align: 'center',
        fontFace: 'Segoe UI'
      });

      slide.addText(group.title, {
        x: gX + 0.25,
        y: 2.7,
        w: 3.25,
        h: 0.6,
        fontSize: 14,
        bold: true,
        color: WHITE,
        fontFace: 'Segoe UI'
      });

      slide.addText(group.desc, {
        x: gX + 0.25,
        y: 3.4,
        w: 3.25,
        h: 1.5,
        fontSize: 11,
        color: TEXT_MUTED,
        fontFace: 'Segoe UI'
      });

      slide.addShape(pres.ShapeType.line, {
        x: gX + 0.25,
        y: 5.1,
        w: 3.25,
        h: 0,
        line: { color: '334155', width: 1 }
      });

      slide.addText('Grup Bazlı Rasyon Ataması Aktif', {
        x: gX + 0.25,
        y: 5.3,
        w: 3.25,
        h: 0.4,
        fontSize: 10,
        color: EMERALD_LIGHT,
        bold: true,
        align: 'center',
        fontFace: 'Segoe UI'
      });
    });

    addFooter(slide, 6);
  }

  // ==========================================
  // SLAYT 7: ÇİFTLİK GENEL GİDERLERİ VE GERÇEK MALİYET
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: BG_DARK };

    slide.addText('BÜTÇE & GİDER MODÜLÜ', {
      x: 0.8,
      y: 0.6,
      w: 10.0,
      h: 0.3,
      fontSize: 11,
      color: EMERALD_LIGHT,
      bold: true,
      fontFace: 'Segoe UI'
    });

    slide.addText('Görünmeyen Maliyetleri Görünür Kılın', {
      x: 0.8,
      y: 0.9,
      w: 10.0,
      h: 0.6,
      fontSize: 26,
      color: WHITE,
      bold: true,
      fontFace: 'Segoe UI'
    });

    // 2 Ana Kolon: Sol giderler listesi, Sağ gerçek maliyet formülasyonu
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.8,
      w: 5.6,
      h: 4.8,
      rectRadius: 0.25,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1 }
    });

    slide.addText('Kapsamlı Gider Kategorileri', {
      x: 1.1,
      y: 2.1,
      w: 5.0,
      h: 0.4,
      fontSize: 15,
      bold: true,
      color: EMERALD_LIGHT,
      fontFace: 'Segoe UI'
    });

    const expenseCategories = [
      { name: 'Veteriner & Sağlık', detail: 'Aşılar, tohumlama, tırnak bakımı ve ilaç masrafları' },
      { name: 'İşçilik & Personel', detail: 'Sağımcı, bakıcı maaşları ve SGK primleri' },
      { name: 'Enerji & Yakıt', detail: 'Elektrik, jeneratör yakıtı ve traktör mazotu' },
      { name: 'Bakım & Amortisman', detail: 'Sağımhane revizyonu, yem karma makinesi amortismanı' }
    ];

    expenseCategories.forEach((cat, i) => {
      slide.addText(`📌 ${cat.name}`, {
        x: 1.1,
        y: 2.65 + i * 0.95,
        w: 5.0,
        h: 0.3,
        fontSize: 12,
        bold: true,
        color: WHITE,
        fontFace: 'Segoe UI'
      });

      slide.addText(cat.detail, {
        x: 1.4,
        y: 2.98 + i * 0.95,
        w: 4.7,
        h: 0.5,
        fontSize: 10,
        color: TEXT_MUTED,
        fontFace: 'Segoe UI'
      });
    });

    // Sağ Kolon: Birim Maliyet Hesaplama
    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.8,
      y: 1.8,
      w: 5.6,
      h: 4.8,
      rectRadius: 0.25,
      fill: { color: CARD_BG },
      line: { color: BLUE, width: 1.5 }
    });

    slide.addText('1 Litre Sütün Gerçek Maliyeti Formülü', {
      x: 7.1,
      y: 2.1,
      w: 5.0,
      h: 0.4,
      fontSize: 15,
      bold: true,
      color: BLUE,
      fontFace: 'Segoe UI'
    });

    slide.addShape(pres.ShapeType.roundRect, {
      x: 7.1,
      y: 2.65,
      w: 5.0,
      h: 1.0,
      rectRadius: 0.15,
      fill: { color: '0F172A' },
      line: { color: '334155', width: 1 }
    });

    slide.addText('Gerçek Birim Maliyet = Yem Maliyeti + (Genel Giderler / Toplam Üretim)', {
      x: 7.2,
      y: 2.9,
      w: 4.8,
      h: 0.5,
      fontSize: 10.5,
      bold: true,
      color: EMERALD_LIGHT,
      align: 'center',
      fontFace: 'Consolas'
    });

    const expPoints = [
      '✔ Yalnızca yem değil, işletmenin tüm operasyonel yükü tek bir ekranda toplanır.',
      '✔ Aylık gider raporları ve kategorik pasta grafiklerle bütçe kaçakları engellenir.',
      '✔ Süt satış fiyatı pazarlığında çiftlik sahibine gerçek maliyet tabanlı tam müzakere gücü verir.'
    ];

    expPoints.forEach((ep, i) => {
      slide.addText(ep, {
        x: 7.1,
        y: 3.9 + i * 0.75,
        w: 5.0,
        h: 0.65,
        fontSize: 11,
        color: WHITE,
        fontFace: 'Segoe UI'
      });
    });

    addFooter(slide, 7);
  }

  // ==========================================
  // SLAYT 8: AUDIT LOG, GÜVENLİK & GMAIL BİLDİRİM
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: BG_DARK };

    slide.addText('GÜVENLİK & DENETİM ALTYAPISI', {
      x: 0.8,
      y: 0.6,
      w: 10.0,
      h: 0.3,
      fontSize: 11,
      color: EMERALD_LIGHT,
      bold: true,
      fontFace: 'Segoe UI'
    });

    slide.addText('Kurumsal Audit Log & Anlık Hata Bildirimi', {
      x: 0.8,
      y: 0.9,
      w: 10.0,
      h: 0.6,
      fontSize: 26,
      color: WHITE,
      bold: true,
      fontFace: 'Segoe UI'
    });

    const securityCards = [
      {
        title: 'Tam Kapsamlı Audit Log',
        subtitle: 'Kim, Ne Zaman, Hangi Değişikliği Yaptı?',
        bullets: [
          'Rasyon kayıt, güncelleme ve silme logları.',
          'Yem fiyat ve besin parametresi güncellemeleri.',
          'Gider kayıtları ve kullanıcı oturum hareketleri.'
        ],
        icon: '📋'
      },
      {
        title: 'IP, Konum & Cihaz Tespiti',
        subtitle: 'Coğrafi ve Donanımsal İzlenebilirlik',
        bullets: [
          'Kullanıcının bağlandığı IP adresi ve ISP bilgisi.',
          'Şehir/Ülke düzeyinde geo-location sorgulama.',
          'Cihaz tipi (Mobil / Tablet / Desktop) ve tarayıcı tespiti.'
        ],
        icon: '📍'
      },
      {
        title: 'Gmail Hata Bildirim Servisi',
        subtitle: 'Kritik Sistem Alarmları Anında Cebinizde',
        bullets: [
          'Olası API veya veritabanı hatalarında otomatik tetikleme.',
          'Geliştirici Erkan Erdem\'e hata detayları anında iletilir (7/24 Takip).',
          'PIN korumalı güvenli SMTP yönetim paneli (/mailayar).'
        ],
        icon: '✉️'
      }
    ];

    securityCards.forEach((card, idx) => {
      const cX = 0.8 + idx * 3.95;
      slide.addShape(pres.ShapeType.roundRect, {
        x: cX,
        y: 1.8,
        w: 3.75,
        h: 4.8,
        rectRadius: 0.25,
        fill: { color: CARD_BG },
        line: { color: CARD_BORDER, width: 1 }
      });

      slide.addText(card.icon, {
        x: cX + 0.3,
        y: 2.1,
        w: 1.0,
        h: 0.5,
        fontSize: 24
      });

      slide.addText(card.title, {
        x: cX + 0.3,
        y: 2.7,
        w: 3.15,
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: WHITE,
        fontFace: 'Segoe UI'
      });

      slide.addText(card.subtitle, {
        x: cX + 0.3,
        y: 3.15,
        w: 3.15,
        h: 0.4,
        fontSize: 10,
        color: EMERALD_LIGHT,
        bold: true,
        fontFace: 'Segoe UI'
      });

      card.bullets.forEach((b, bi) => {
        slide.addText(`• ${b}`, {
          x: cX + 0.3,
          y: 3.7 + bi * 0.7,
          w: 3.15,
          h: 0.65,
          fontSize: 10.5,
          color: TEXT_MUTED,
          fontFace: 'Segoe UI'
        });
      });
    });

    addFooter(slide, 8);
  }

  // ==========================================
  // SLAYT 9: BULUT, MOBİL VE DEPLOYMENT MİMARİSİ
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: BG_DARK };

    slide.addText('TEKNOLOJİ & DAĞITIM ALTYAPISI', {
      x: 0.8,
      y: 0.6,
      w: 10.0,
      h: 0.3,
      fontSize: 11,
      color: EMERALD_LIGHT,
      bold: true,
      fontFace: 'Segoe UI'
    });

    slide.addText('Docker, Coolify & Mobil PWA Mimarisi', {
      x: 0.8,
      y: 0.9,
      w: 10.0,
      h: 0.6,
      fontSize: 26,
      color: WHITE,
      bold: true,
      fontFace: 'Segoe UI'
    });

    const stackItems = [
      { title: 'Next.js 15 & React 19', desc: 'Ultra hızlı SSR & App Router mimarisi ile kusursuz kullanıcı deneyimi.', color: WHITE },
      { title: 'PostgreSQL & Prisma ORM', desc: 'İlişkisel, güvenilir ve yüksek performanslı veri tabanı altyapısı.', color: BLUE },
      { title: 'Docker & Docker Compose', desc: 'Uygulama ve veritabanı bağımsız izole containerlarda sıfır konfigürasyonla çalışır.', color: EMERALD },
      { title: 'Coolify Entegrasyonu', desc: 'GitHub üzerinden otomatik CI/CD ve tek tıkla canlıya alma (milkiq.erkanerdem.online).', color: GOLD }
    ];

    stackItems.forEach((st, i) => {
      const sY = 1.8 + i * 1.25;
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8,
        y: sY,
        w: 11.6,
        h: 1.05,
        rectRadius: 0.2,
        fill: { color: CARD_BG },
        line: { color: CARD_BORDER, width: 1 }
      });

      slide.addText(st.title, {
        x: 1.1,
        y: sY + 0.15,
        w: 4.5,
        h: 0.35,
        fontSize: 13,
        bold: true,
        color: st.color,
        fontFace: 'Segoe UI'
      });

      slide.addText(st.desc, {
        x: 1.1,
        y: sY + 0.5,
        w: 10.5,
        h: 0.45,
        fontSize: 10.5,
        color: TEXT_MUTED,
        fontFace: 'Segoe UI'
      });
    });

    addFooter(slide, 9);
  }

  // ==========================================
  // SLAYT 10: SONUÇ, KAZANIMLAR & ERİŞİM
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: BG_DARK };

    slide.addText('STRATEJİK KAZANIMLAR & HEMEN BAŞLAYIN', {
      x: 0.8,
      y: 0.6,
      w: 10.0,
      h: 0.3,
      fontSize: 11,
      color: EMERALD_LIGHT,
      bold: true,
      fontFace: 'Segoe UI'
    });

    slide.addText('MilkIQ ile Çiftliğinizin Geleceğini Yönetin', {
      x: 0.8,
      y: 0.9,
      w: 10.0,
      h: 0.6,
      fontSize: 26,
      color: WHITE,
      bold: true,
      fontFace: 'Segoe UI'
    });

    // 3 Öne Çıkan Değer Kartı
    const roiCards = [
      { value: '%15 - 25', label: 'Yem Maliyeti Tasarrufu', desc: 'Fazladan protein/enerji israfının bilimsel olarak önlenmesi.' },
      { value: '+%12', label: 'Süt Verim Artışı', desc: 'Dengeli rumen pH ve optimum laktasyon piki yönetimi.' },
      { value: '360°', label: 'Uçtan Uca Finansal Kontrol', desc: '1 Litre sütün gerçek maliyeti ve günlük hayvan başı net kar.' }
    ];

    roiCards.forEach((r, idx) => {
      const rX = 0.8 + idx * 3.95;
      slide.addShape(pres.ShapeType.roundRect, {
        x: rX,
        y: 1.8,
        w: 3.75,
        h: 2.4,
        rectRadius: 0.25,
        fill: { color: CARD_BG },
        line: { color: EMERALD, width: 1.5 }
      });

      slide.addText(r.value, {
        x: rX + 0.2,
        y: 2.0,
        w: 3.35,
        h: 0.7,
        fontSize: 32,
        bold: true,
        color: EMERALD_LIGHT,
        align: 'center',
        fontFace: 'Segoe UI'
      });

      slide.addText(r.label, {
        x: rX + 0.2,
        y: 2.75,
        w: 3.35,
        h: 0.4,
        fontSize: 13,
        bold: true,
        color: WHITE,
        align: 'center',
        fontFace: 'Segoe UI'
      });

      slide.addText(r.desc, {
        x: rX + 0.2,
        y: 3.2,
        w: 3.35,
        h: 0.8,
        fontSize: 9.5,
        color: TEXT_MUTED,
        align: 'center',
        fontFace: 'Segoe UI'
      });
    });

    // Alt Çağrı & İletişim Kartı
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 4.5,
      w: 11.6,
      h: 2.1,
      rectRadius: 0.25,
      fill: { color: CARD_BG },
      line: { color: BLUE, width: 2 }
    });

    slide.addText('Canlı Uygulama & İletişim', {
      x: 1.2,
      y: 4.75,
      w: 6.0,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: WHITE,
      fontFace: 'Segoe UI'
    });

    slide.addText('Canlı Sistem: https://milkiq.erkanerdem.online\nGeliştirici Portfolyosu: https://erkanerdem.online\n7/24 Kesintisiz Geliştirici Takibi & Teknik Destek', {
      x: 1.2,
      y: 5.25,
      w: 6.5,
      h: 1.1,
      fontSize: 11,
      color: 'CBD5E1',
      fontFace: 'Segoe UI'
    });

    slide.addShape(pres.ShapeType.roundRect, {
      x: 8.4,
      y: 4.95,
      w: 3.6,
      h: 1.2,
      rectRadius: 0.2,
      fill: { color: EMERALD }
    });

    slide.addText('MilkIQ İle Başlayın\nAkıllı Çiftlik Yönetimi', {
      x: 8.5,
      y: 5.2,
      w: 3.4,
      h: 0.7,
      fontSize: 13,
      bold: true,
      color: WHITE,
      align: 'center',
      fontFace: 'Segoe UI'
    });

    addFooter(slide, 10);
  }

  const outputPath = path.join(__dirname, '..', 'public', 'MilkIQ_Tanitim_Sunumu.pptx');
  await pres.writeFile({ fileName: outputPath });
  console.log(`Sunum başarıyla kaydedildi: ${outputPath}`);
}

createPresentation().catch(err => {
  console.error('Hata:', err);
  process.exit(1);
});
