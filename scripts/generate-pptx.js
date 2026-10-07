const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

async function createPresentation() {
  console.log('Sunum oluşturuluyor (Widescreen 16:9 - 13.33" x 7.5")...');
  const pres = new pptxgen();

  // Widescreen 16:9 Standartı (13.333" x 7.5" - Google Slides & PowerPoint HD Uyumlu)
  pres.layout = 'LAYOUT_WIDE';
  pres.author = 'Erkan Erdem';
  pres.company = 'MilkIQ - erkanerdem.online';
  pres.subject = 'MilkIQ Akıllı Süt Sığırcılığı Rasyon & Karlılık Yönetim Sistemi';
  pres.title = 'MilkIQ Ürün ve Özellik Tanıtım Sunumu';

  // Renk Paleti (Yüksek Kontrast, Modern SaaS Teması)
  const BG_DARK = '0B1329';
  const CARD_BG = '152238';
  const CARD_BG_LIGHT = '1E293B';
  const CARD_BORDER = '283852';
  const EMERALD = '10B981';
  const EMERALD_LIGHT = '34D399';
  const BLUE = '38BDF8';
  const BLUE_LIGHT = '7DD3FC';
  const WHITE = 'FFFFFF';
  const TEXT_MUTED = '94A3B8';
  const TEXT_LIGHT = 'E2E8F0';
  const GOLD = 'F59E0B';
  const RED_BORDER = '7F1D1D';
  const RED_TEXT = 'F87171';
  const RED_BG = '1E1B24';

  const logoPath = path.join(__dirname, '..', 'public', 'logo.png');
  const hasLogo = fs.existsSync(logoPath);

  // Standart Genişlik ve Hizalama Sabitleri (Toplam genişlik: 13.333", Yükseklik: 7.5")
  const MARGIN_LEFT = 0.8;
  const CONTENT_WIDTH = 11.733; // 0.8 + 11.733 = 12.533 (Sağ boşluk: 0.8")

  // Ortak Header Fonksiyonu
  function addHeader(slide, categoryText, titleText) {
    slide.addText(categoryText.toUpperCase(), {
      x: MARGIN_LEFT,
      y: 0.45,
      w: CONTENT_WIDTH,
      h: 0.3,
      fontSize: 10.5,
      color: EMERALD_LIGHT,
      bold: true,
      fontFace: 'Segoe UI',
      charSpacing: 1.5
    });

    slide.addText(titleText, {
      x: MARGIN_LEFT,
      y: 0.75,
      w: CONTENT_WIDTH,
      h: 0.6,
      fontSize: 24,
      color: WHITE,
      bold: true,
      fontFace: 'Segoe UI'
    });
  }

  // Ortak Footer Fonksiyonu (Slide alt sınır: 7.5", Footer y: 6.9" -> mükemmel sığar)
  function addFooter(slide, currentSlide, totalSlides = 10) {
    slide.addShape(pres.ShapeType.line, {
      x: MARGIN_LEFT,
      y: 6.85,
      w: CONTENT_WIDTH,
      h: 0,
      line: { color: '233348', width: 1 }
    });

    slide.addText('MilkIQ • Akıllı Süt Sığırcılığı Rasyon & Karlılık Sistemi', {
      x: MARGIN_LEFT,
      y: 6.92,
      w: 6.0,
      h: 0.35,
      fontSize: 9,
      color: TEXT_MUTED,
      fontFace: 'Segoe UI'
    });

    slide.addText(`Developed by Erkan Erdem (erkanerdem.online)  |  ${currentSlide} / ${totalSlides}`, {
      x: MARGIN_LEFT + 6.0,
      y: 6.92,
      w: CONTENT_WIDTH - 6.0,
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

    // Sol Alan: Logo, Başlık, Alt Başlık ve Geliştirici Bilgisi
    if (hasLogo) {
      slide.addImage({
        path: logoPath,
        x: 1.0,
        y: 0.9,
        w: 1.5,
        h: 1.5
      });
    }

    slide.addText('AKILLI SÜT SIĞIRCILIĞI TEKNOLOJİSİ', {
      x: 1.0,
      y: 2.6,
      w: 6.2,
      h: 0.35,
      fontSize: 11,
      fontFace: 'Segoe UI',
      color: EMERALD_LIGHT,
      bold: true,
      charSpacing: 2
    });

    slide.addText('MilkIQ', {
      x: 1.0,
      y: 2.95,
      w: 6.2,
      h: 1.1,
      fontSize: 54,
      fontFace: 'Segoe UI',
      color: WHITE,
      bold: true
    });

    slide.addText('Rasyon, Karlılık & Sürü Yönetim Sistemi', {
      x: 1.0,
      y: 4.15,
      w: 6.2,
      h: 0.5,
      fontSize: 18,
      fontFace: 'Segoe UI',
      color: TEXT_MUTED
    });

    slide.addText('NRC Standartlarında Bilimsel Besleme  •  Dinamik Süt/Yem Paritesi  •  Net Maliyet Analizi', {
      x: 1.0,
      y: 4.75,
      w: 6.2,
      h: 0.6,
      fontSize: 11.5,
      fontFace: 'Segoe UI',
      color: BLUE
    });

    // Alt Künye Kartı
    slide.addShape(pres.ShapeType.roundRect, {
      x: 1.0,
      y: 5.65,
      w: 6.0,
      h: 0.95,
      rectRadius: 0.15,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1.5 }
    });

    slide.addText('Geliştirici: Erkan Erdem  |  erkanerdem.online\nSürüm: v1.0 Production Ready • PWA & Mobil Uyumlu • 7/24 Kesintisiz Takip', {
      x: 1.2,
      y: 5.75,
      w: 5.6,
      h: 0.75,
      fontSize: 10,
      fontFace: 'Segoe UI',
      color: TEXT_LIGHT
    });

    // Sağ Alan: Öne Çıkan Yetenekler Paneli (SaaS Dashboard Tarzı)
    slide.addShape(pres.ShapeType.roundRect, {
      x: 7.6,
      y: 0.9,
      w: 4.9,
      h: 5.7,
      rectRadius: 0.25,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1.5 }
    });

    slide.addText('ÖNE ÇIKAN YETENEKLER', {
      x: 7.9,
      y: 1.2,
      w: 4.3,
      h: 0.3,
      fontSize: 10,
      color: EMERALD_LIGHT,
      bold: true,
      fontFace: 'Segoe UI',
      charSpacing: 1.5
    });

    slide.addText('Yeni Nesil Karar Destek Platformu', {
      x: 7.9,
      y: 1.5,
      w: 4.3,
      h: 0.45,
      fontSize: 15,
      bold: true,
      color: WHITE,
      fontFace: 'Segoe UI'
    });

    const coverHighlights = [
      { icon: '🌿', title: 'Hassas Rasyon Hesaplama', desc: 'KM, HP, Nişasta ve Kaba/Kesif dengesi canlı simülasyonu.' },
      { icon: '📊', title: 'Dinamik Süt / Yem Paritesi', desc: '1 Litre sütün yem maliyeti ve başa baş katsayı takibi.' },
      { icon: '🌾', title: 'Geniş Yem & Fabrika Kataloğu', desc: '13+ standart hammadde ve Türkiye tescilli fabrika yemleri.' },
      { icon: '💰', title: 'Çiftlik Bütçe & Net Karlılık', desc: 'Genel giderler ile harmanlanmış gerçek 1L süt maliyeti.' },
      { icon: '🛡️', title: 'Audit Log & 7/24 Takip', desc: 'Kullanıcı hareket denetimi ve otomatik Gmail hata bildirimi.' }
    ];

    coverHighlights.forEach((item, idx) => {
      const rowY = 2.1 + idx * 0.86;
      slide.addShape(pres.ShapeType.roundRect, {
        x: 7.9,
        y: rowY,
        w: 4.3,
        h: 0.75,
        rectRadius: 0.1,
        fill: { color: '0D1728' },
        line: { color: '233348', width: 1 }
      });

      slide.addText(item.icon, {
        x: 8.05,
        y: rowY + 0.12,
        w: 0.45,
        h: 0.5,
        fontSize: 16
      });

      slide.addText(item.title, {
        x: 8.55,
        y: rowY + 0.1,
        w: 3.5,
        h: 0.28,
        fontSize: 11,
        bold: true,
        color: WHITE,
        fontFace: 'Segoe UI'
      });

      slide.addText(item.desc, {
        x: 8.55,
        y: rowY + 0.38,
        w: 3.5,
        h: 0.32,
        fontSize: 9,
        color: TEXT_MUTED,
        fontFace: 'Segoe UI'
      });
    });
  }

  // ==========================================
  // SLAYT 2: SEKTÖREL SORUN & MilkIQ ÇÖZÜMÜ
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: BG_DARK };

    addHeader(slide, 'Sektörel Gerçekler & Stratejik Değer', 'Geleneksel Çiftlik Yönetimi vs. MilkIQ');

    const colWidth = 5.65;
    const colHeight = 5.1;
    const cardTopY = 1.5;

    // Sol Kart: Geleneksel Yöntemler (Kırmızı Temalı)
    slide.addShape(pres.ShapeType.roundRect, {
      x: MARGIN_LEFT,
      y: cardTopY,
      w: colWidth,
      h: colHeight,
      rectRadius: 0.2,
      fill: { color: RED_BG },
      line: { color: RED_BORDER, width: 1.5 }
    });

    slide.addText('Geleneksel Besleme Zorlukları', {
      x: MARGIN_LEFT + 0.3,
      y: cardTopY + 0.25,
      w: colWidth - 0.6,
      h: 0.4,
      fontSize: 16,
      color: RED_TEXT,
      bold: true,
      fontFace: 'Segoe UI'
    });

    const traditionalPoints = [
      'Yem maliyeti çiftlik cirosunun %70\'ini oluşturur; plansız alımlar doğrudan zarara yol açar.',
      'Göz kararı veya sabit reçeteler nedeniyle gizli asidoz ve metabolik hastalıklar yaşanır.',
      '1 litre sütün anlık yem maliyeti ve hayvan başı net karı net olarak hesaplanamaz.',
      'Tahıl ve kaba yem piyasasındaki fiyat dalgalanmalarına karşı anlık rasyon revizyonu yapılamaz.',
      'Veriler kağıt veya karışık tablolarda kaybolur; geriye dönük veri analizi yapılamaz.'
    ];

    traditionalPoints.forEach((point, i) => {
      slide.addText(`•  ${point}`, {
        x: MARGIN_LEFT + 0.3,
        y: cardTopY + 0.8 + i * 0.82,
        w: colWidth - 0.6,
        h: 0.72,
        fontSize: 10.5,
        color: TEXT_LIGHT,
        fontFace: 'Segoe UI'
      });
    });

    // Sağ Kart: MilkIQ Çözümü (Yeşil Temalı)
    const rightX = MARGIN_LEFT + colWidth + 0.433;
    slide.addShape(pres.ShapeType.roundRect, {
      x: rightX,
      y: cardTopY,
      w: colWidth,
      h: colHeight,
      rectRadius: 0.2,
      fill: { color: CARD_BG },
      line: { color: EMERALD, width: 2 }
    });

    slide.addText('MilkIQ ile Akıllı Dönüşüm', {
      x: rightX + 0.3,
      y: cardTopY + 0.25,
      w: colWidth - 0.6,
      h: 0.4,
      fontSize: 16,
      color: EMERALD_LIGHT,
      bold: true,
      fontFace: 'Segoe UI'
    });

    const milkiqPoints = [
      'Bilimsel NRC standartlarında hassas Kuru Madde, Protein ve Enerji optimizasyonu sağlanır.',
      'Dinamik Süt/Yem Paritesi takibiyle minimum maliyetle maksimum pik süt verimi elde edilir.',
      'Fabrika yemleri ve yerel yemlerin güncel borsa ve piyasa fiyatlarıyla anlık kıyaslanması yapılır.',
      'Laktasyon dönemi ve canlı ağırlığa göre otomatik besin ihtiyacı simülasyonu çalıştırılır.',
      'Tüm cihazlardan (cep telefonu, tablet, PC) bulut senkronizasyonu ile 7/24 kesintisiz erişilir.'
    ];

    milkiqPoints.forEach((point, i) => {
      slide.addText(`✔  ${point}`, {
        x: rightX + 0.3,
        y: cardTopY + 0.8 + i * 0.82,
        w: colWidth - 0.6,
        h: 0.72,
        fontSize: 10.5,
        color: WHITE,
        fontFace: 'Segoe UI'
      });
    });

    addFooter(slide, 2);
  }

  // ==========================================
  // SLAYT 3: BİLİMSEL RASYON HESAPLAMA & OPTİMİZASYON
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: BG_DARK };

    addHeader(slide, 'Temel Modül 1', 'Bilimsel Rasyon Hesaplama & Optimizasyon');

    // 4 Önemli Besin Parametre Kartı
    const nutrients = [
      { name: 'Kuru Madde (KM)', desc: 'İşkembe kapasitesine uygun optimum tokluk ve fizyolojik sindirim.', color: EMERALD },
      { name: 'Ham Protein (HP)', desc: 'Süt verimi ve kas dokusu için gerekli bypass & ruminal protein.', color: BLUE },
      { name: 'Net Enerji (ME / NEL)', desc: 'Pik süt verimi ve kondisyon kaybını önleyen kritik enerji dengesi.', color: GOLD },
      { name: 'Lif Dengesi (NDF / ADF)', desc: 'Rumen sağlığı, geviş getirme ve asidoz önleyici yapısal lif.', color: 'EC4899' }
    ];

    const cardW = 2.75;
    const cardGap = 0.244;
    const topCardY = 1.5;

    nutrients.forEach((n, i) => {
      const colX = MARGIN_LEFT + i * (cardW + cardGap);
      slide.addShape(pres.ShapeType.roundRect, {
        x: colX,
        y: topCardY,
        w: cardW,
        h: 2.3,
        rectRadius: 0.15,
        fill: { color: CARD_BG },
        line: { color: n.color, width: 1.5 }
      });

      slide.addText(n.name, {
        x: colX + 0.2,
        y: topCardY + 0.2,
        w: cardW - 0.4,
        h: 0.4,
        fontSize: 13,
        bold: true,
        color: WHITE,
        fontFace: 'Segoe UI'
      });

      slide.addText(n.desc, {
        x: colX + 0.2,
        y: topCardY + 0.65,
        w: cardW - 0.4,
        h: 1.4,
        fontSize: 10,
        color: TEXT_MUTED,
        fontFace: 'Segoe UI'
      });
    });

    // Alt Detay Kartı
    const bottomCardY = 4.0;
    slide.addShape(pres.ShapeType.roundRect, {
      x: MARGIN_LEFT,
      y: bottomCardY,
      w: CONTENT_WIDTH,
      h: 2.6,
      rectRadius: 0.15,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1.5 }
    });

    slide.addText('Hassas Hayvan & Üretim Parametreleri Uyarlaması', {
      x: MARGIN_LEFT + 0.3,
      y: bottomCardY + 0.2,
      w: CONTENT_WIDTH - 0.6,
      h: 0.35,
      fontSize: 15,
      bold: true,
      color: EMERALD_LIGHT,
      fontFace: 'Segoe UI'
    });

    const features = [
      '• Canlı Ağırlık (kg), Günlük Hedef Süt Verimi (L), Süt Yağ Oranı (%) ve Protein (%) parametreleri girilir.',
      '• Laktasyon Günü (DIM) ve Gebelik Ayına göre otomatik bilimsel besin gereksinim artışı hesaplanır.',
      '• Gerçek zamanlı Kalsiyum (Ca), Fosfor (P) ve Tuz mineral oranı güvenlik uyarı sistemi devrededir.',
      '• "Rasyonu Kaydet", "Rasyonu Kopyala" ve tek tıkla A4 Mikser Reçetesi formatında çıktı imkânı sunar.'
    ];

    features.forEach((feat, idx) => {
      slide.addText(feat, {
        x: MARGIN_LEFT + 0.3,
        y: bottomCardY + 0.65 + idx * 0.44,
        w: CONTENT_WIDTH - 0.6,
        h: 0.4,
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

    addHeader(slide, 'Temel Modül 2', 'Dinamik Yem & Fabrika Yemleri Kataloğu');

    const categories = [
      {
        title: 'Kaba Yemler & Silajlar',
        items: ['Mısır Silajı (KM: %32)', 'Yonca Kuru Otu (HP: %18)', 'Saman & Çayır Otu', 'Fiğ & Tritikale Silajı'],
        badge: 'Temel Rumen Lif Kaynağı'
      },
      {
        title: 'Tahıllar & Küspeler',
        items: ['Mısır Flake & Arpa Kırması', 'Soya Küspesi (HP: %44-%48)', 'Ayçiçeği Küspesi (HP: %32)', 'Pancar Posası & Melas'],
        badge: 'Yüksek Enerji & Protein'
      },
      {
        title: 'Tescilli Fabrika Yemleri',
        items: ['Eriş Sığır Süt A (19 HP / 2800 ME)', 'Eriş Crown Patlamış Mısır', 'Özel Düve & Geçiş Yemleri', 'Premiksler & Mineral Katkıları'],
        badge: 'Hazır & Dengeli Karışımlar'
      }
    ];

    const cW = 3.75;
    const cGap = 0.241;
    const cY = 1.5;

    categories.forEach((cat, idx) => {
      const cardX = MARGIN_LEFT + idx * (cW + cGap);
      slide.addShape(pres.ShapeType.roundRect, {
        x: cardX,
        y: cY,
        w: cW,
        h: 5.1,
        rectRadius: 0.2,
        fill: { color: CARD_BG },
        line: { color: CARD_BORDER, width: 1.5 }
      });

      slide.addText(cat.badge.toUpperCase(), {
        x: cardX + 0.25,
        y: cY + 0.25,
        w: cW - 0.5,
        h: 0.3,
        fontSize: 9.5,
        bold: true,
        color: EMERALD_LIGHT,
        fontFace: 'Segoe UI'
      });

      slide.addText(cat.title, {
        x: cardX + 0.25,
        y: cY + 0.55,
        w: cW - 0.5,
        h: 0.45,
        fontSize: 15,
        bold: true,
        color: WHITE,
        fontFace: 'Segoe UI'
      });

      cat.items.forEach((item, itemIdx) => {
        slide.addText(`• ${item}`, {
          x: cardX + 0.25,
          y: cY + 1.2 + itemIdx * 0.65,
          w: cW - 0.5,
          h: 0.55,
          fontSize: 11,
          color: 'CBD5E1',
          fontFace: 'Segoe UI'
        });
      });

      // Alt Bilgi Notu Kutusu
      slide.addShape(pres.ShapeType.roundRect, {
        x: cardX + 0.25,
        y: cY + 4.1,
        w: cW - 0.5,
        h: 0.7,
        rectRadius: 0.12,
        fill: { color: '0D1728' },
        line: { color: '233348', width: 1 }
      });

      slide.addText('Fiyat & Besin Değerleri Düzenlenebilir', {
        x: cardX + 0.3,
        y: cY + 4.25,
        w: cW - 0.6,
        h: 0.4,
        fontSize: 9.5,
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

    addHeader(slide, 'Finansal Analiz & Karlılık', 'Süt / Yem Paritesi & Kar Marjı Yönetimi');

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

    const mW = 3.75;
    const mGap = 0.241;
    const mY = 1.5;

    metrics.forEach((m, idx) => {
      const boxX = MARGIN_LEFT + idx * (mW + mGap);
      slide.addShape(pres.ShapeType.roundRect, {
        x: boxX,
        y: mY,
        w: mW,
        h: 2.3,
        rectRadius: 0.18,
        fill: { color: CARD_BG },
        line: { color: m.color, width: 2 }
      });

      slide.addText(m.title, {
        x: boxX + 0.2,
        y: mY + 0.2,
        w: mW - 0.4,
        h: 0.35,
        fontSize: 12,
        bold: true,
        color: TEXT_MUTED,
        fontFace: 'Segoe UI'
      });

      slide.addText(m.value, {
        x: boxX + 0.2,
        y: mY + 0.55,
        w: mW - 0.4,
        h: 0.65,
        fontSize: 22,
        bold: true,
        color: m.color,
        fontFace: 'Segoe UI'
      });

      slide.addText(m.subtext, {
        x: boxX + 0.2,
        y: mY + 1.25,
        w: mW - 0.4,
        h: 0.85,
        fontSize: 10,
        color: TEXT_LIGHT,
        fontFace: 'Segoe UI'
      });
    });

    // Alt Analiz Paneli
    const pY = 4.0;
    slide.addShape(pres.ShapeType.roundRect, {
      x: MARGIN_LEFT,
      y: pY,
      w: CONTENT_WIDTH,
      h: 2.6,
      rectRadius: 0.18,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1.5 }
    });

    slide.addText('Finansal Karar Destek Mekanizması', {
      x: MARGIN_LEFT + 0.3,
      y: pY + 0.2,
      w: CONTENT_WIDTH - 0.6,
      h: 0.35,
      fontSize: 15,
      bold: true,
      color: WHITE,
      fontFace: 'Segoe UI'
    });

    const finPoints = [
      '• Yem fiyatları arttığında aynı besin değerini koruyarak en ekonomik alternatif hammaddeleri önerir.',
      '• Süt fiyatı dalgalandığında işletmenin başa baş (break-even) üretim noktasını otomatik simüle eder.',
      '• Sürü genelinde aylık ve yıllık tahmini ciro & net kar projeksiyonları sunar.',
      '• Çiftliğin finansal sağlığını renk kodlu göstergeler ve net KPI kartlarıyla anlık özetler.'
    ];

    finPoints.forEach((fp, i) => {
      slide.addText(fp, {
        x: MARGIN_LEFT + 0.3,
        y: pY + 0.65 + i * 0.44,
        w: CONTENT_WIDTH - 0.6,
        h: 0.4,
        fontSize: 11,
        color: 'CBD5E1',
        fontFace: 'Segoe UI'
      });
    });

    addFooter(slide, 5);
  }

  // ==========================================
  // SLAYT 6: SÜRÜ & LAKTASYON YÖNETİMİ
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: BG_DARK };

    addHeader(slide, 'Sürü & Üretim Yönetimi', 'Laktasyon Gruplandırma & Besleme Tavsiyeleri');

    const herdGroups = [
      {
        title: '1. Erken Laktasyon (Pik Dönemi)',
        dim: 'DIM: 1 - 100 Gün',
        desc: 'Negatif enerji dengesini önlemek için yüksek enerjili yoğun rasyon. Karaciğer ve rumen koruyucu premiksler ile asidoz kontrolü.',
        color: 'EF4444'
      },
      {
        title: '2. Orta Laktasyon (Plato Dönemi)',
        dim: 'DIM: 101 - 200 Gün',
        desc: 'Dengeli kondisyon skoru muhafazası, süt proteini ve yağını maksimize eden optimum kaba/kesif yem dengesi.',
        color: BLUE
      },
      {
        title: '3. Geç Laktasyon & Kuru Dönem',
        dim: 'DIM: 201+ Gün & Doğuma 60 Gün',
        desc: 'Aşırı yağlanmayı önleyici yüksek lifli rasyon. Doğum felcini (hipokalsemi) engelleyen anyonik besleme stratejileri.',
        color: EMERALD
      }
    ];

    const gW = 3.75;
    const gGap = 0.241;
    const gY = 1.5;

    herdGroups.forEach((group, idx) => {
      const gX = MARGIN_LEFT + idx * (gW + gGap);
      slide.addShape(pres.ShapeType.roundRect, {
        x: gX,
        y: gY,
        w: gW,
        h: 5.1,
        rectRadius: 0.2,
        fill: { color: CARD_BG },
        line: { color: CARD_BORDER, width: 1.5 }
      });

      // DIM Badge
      slide.addShape(pres.ShapeType.roundRect, {
        x: gX + 0.25,
        y: gY + 0.25,
        w: gW - 0.5,
        h: 0.45,
        rectRadius: 0.1,
        fill: { color: '0D1728' },
        line: { color: group.color, width: 1 }
      });

      slide.addText(group.dim, {
        x: gX + 0.3,
        y: gY + 0.32,
        w: gW - 0.6,
        h: 0.3,
        fontSize: 10.5,
        bold: true,
        color: group.color,
        align: 'center',
        fontFace: 'Segoe UI'
      });

      slide.addText(group.title, {
        x: gX + 0.25,
        y: gY + 0.85,
        w: gW - 0.5,
        h: 0.6,
        fontSize: 14.5,
        bold: true,
        color: WHITE,
        fontFace: 'Segoe UI'
      });

      slide.addText(group.desc, {
        x: gX + 0.25,
        y: gY + 1.55,
        w: gW - 0.5,
        h: 1.8,
        fontSize: 11,
        color: TEXT_MUTED,
        fontFace: 'Segoe UI'
      });

      slide.addShape(pres.ShapeType.line, {
        x: gX + 0.25,
        y: gY + 4.2,
        w: gW - 0.5,
        h: 0,
        line: { color: '233348', width: 1 }
      });

      slide.addText('Grup Bazlı Rasyon Ataması Aktif', {
        x: gX + 0.25,
        y: gY + 4.4,
        w: gW - 0.5,
        h: 0.4,
        fontSize: 10.5,
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

    addHeader(slide, 'Bütçe & Gider Modülü', 'Görünmeyen Maliyetleri Görünür Kılın');

    const colW = 5.65;
    const colH = 5.1;
    const cY = 1.5;

    // Sol Kolon: Gider Kategorileri
    slide.addShape(pres.ShapeType.roundRect, {
      x: MARGIN_LEFT,
      y: cY,
      w: colW,
      h: colH,
      rectRadius: 0.2,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1.5 }
    });

    slide.addText('Kapsamlı Gider Kategorileri', {
      x: MARGIN_LEFT + 0.3,
      y: cY + 0.25,
      w: colW - 0.6,
      h: 0.4,
      fontSize: 16,
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
        x: MARGIN_LEFT + 0.3,
        y: cY + 0.8 + i * 1.0,
        w: colW - 0.6,
        h: 0.3,
        fontSize: 12.5,
        bold: true,
        color: WHITE,
        fontFace: 'Segoe UI'
      });

      slide.addText(cat.detail, {
        x: MARGIN_LEFT + 0.6,
        y: cY + 1.15 + i * 1.0,
        w: colW - 0.9,
        h: 0.5,
        fontSize: 10.5,
        color: TEXT_MUTED,
        fontFace: 'Segoe UI'
      });
    });

    // Sağ Kolon: Birim Maliyet Hesaplama
    const rightX = MARGIN_LEFT + colW + 0.433;
    slide.addShape(pres.ShapeType.roundRect, {
      x: rightX,
      y: cY,
      w: colW,
      h: colH,
      rectRadius: 0.2,
      fill: { color: CARD_BG },
      line: { color: BLUE, width: 1.5 }
    });

    slide.addText('1 Litre Sütün Gerçek Maliyeti Formülü', {
      x: rightX + 0.3,
      y: cY + 0.25,
      w: colW - 0.6,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: BLUE_LIGHT,
      fontFace: 'Segoe UI'
    });

    slide.addShape(pres.ShapeType.roundRect, {
      x: rightX + 0.3,
      y: cY + 0.8,
      w: colW - 0.6,
      h: 1.0,
      rectRadius: 0.12,
      fill: { color: '0D1728' },
      line: { color: '233348', width: 1 }
    });

    slide.addText('Gerçek Birim Maliyet = Yem Maliyeti + (Genel Giderler / Toplam Üretim)', {
      x: rightX + 0.4,
      y: cY + 1.05,
      w: colW - 0.8,
      h: 0.5,
      fontSize: 10.5,
      bold: true,
      color: EMERALD_LIGHT,
      align: 'center',
      fontFace: 'Consolas'
    });

    const expPoints = [
      '✔ Yalnızca yem değil, işletmenin tüm operasyonel gider yükü tek bir ekranda toplanır.',
      '✔ Aylık gider raporları ve kategorik grafiklerle bütçe kaçakları anında engellenir.',
      '✔ Süt satış fiyatı pazarlığında çiftlik sahibine gerçek maliyet tabanlı tam müzakere gücü verir.'
    ];

    expPoints.forEach((ep, i) => {
      slide.addText(ep, {
        x: rightX + 0.3,
        y: cY + 2.15 + i * 0.9,
        w: colW - 0.6,
        h: 0.75,
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

    addHeader(slide, 'Güvenlik & Denetim Altyapısı', 'Kurumsal Audit Log & Anlık Hata Bildirimi');

    const securityCards = [
      {
        title: 'Tam Kapsamlı Audit Log',
        subtitle: 'Kim, Ne Zaman, Hangi Değişikliği Yaptı?',
        bullets: [
          'Rasyon kayıt, güncelleme ve silme işlemleri anlık kaydedilir.',
          'Yem fiyat ve besin parametresi revizyonları kayıt altındadır.',
          'Gider kayıtları ve kullanıcı oturum hareketleri detaylı izlenir.'
        ],
        icon: '📋'
      },
      {
        title: 'IP, Konum & Cihaz Tespiti',
        subtitle: 'Coğrafi ve Donanımsal İzlenebilirlik',
        bullets: [
          'Kullanıcının bağlandığı IP adresi ve ISP bilgisi yakalanır.',
          'Şehir/Ülke düzeyinde geo-location harita sorgulaması yapılır.',
          'Cihaz tipi (Mobil / Tablet / PC) ve tarayıcı tespiti kaydedilir.'
        ],
        icon: '📍'
      },
      {
        title: 'Gmail Hata Bildirim Servisi',
        subtitle: 'Kritik Sistem Alarmları 7/24 Takipte',
        bullets: [
          'Olası API veya veritabanı hatalarında otomatik tetikleme çalışır.',
          'Geliştirici Erkan Erdem\'e hata detayları anında mail olarak iletilir.',
          'Uygulama 7/24 geliştirici takibindedir; PIN korumalı SMTP paneli mevcuttur.'
        ],
        icon: '✉️'
      }
    ];

    const sW = 3.75;
    const sGap = 0.241;
    const sY = 1.5;

    securityCards.forEach((card, idx) => {
      const cX = MARGIN_LEFT + idx * (sW + sGap);
      slide.addShape(pres.ShapeType.roundRect, {
        x: cX,
        y: sY,
        w: sW,
        h: 5.1,
        rectRadius: 0.2,
        fill: { color: CARD_BG },
        line: { color: CARD_BORDER, width: 1.5 }
      });

      slide.addText(card.icon, {
        x: cX + 0.3,
        y: sY + 0.25,
        w: 1.0,
        h: 0.5,
        fontSize: 24
      });

      slide.addText(card.title, {
        x: cX + 0.3,
        y: sY + 0.85,
        w: sW - 0.6,
        h: 0.4,
        fontSize: 14.5,
        bold: true,
        color: WHITE,
        fontFace: 'Segoe UI'
      });

      slide.addText(card.subtitle, {
        x: cX + 0.3,
        y: sY + 1.3,
        w: sW - 0.6,
        h: 0.4,
        fontSize: 10,
        color: EMERALD_LIGHT,
        bold: true,
        fontFace: 'Segoe UI'
      });

      card.bullets.forEach((b, bi) => {
        slide.addText(`• ${b}`, {
          x: cX + 0.3,
          y: sY + 1.85 + bi * 0.95,
          w: sW - 0.6,
          h: 0.85,
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

    addHeader(slide, 'Teknoloji & Dağıtım Altyapısı', 'Docker, Coolify & Mobil PWA Mimarisi');

    const stackItems = [
      { title: 'Next.js 15 & React 19', desc: 'Ultra hızlı SSR & App Router mimarisi ile mobil cihazlarda ve masaüstünde akıcı kullanıcı deneyimi.', color: WHITE },
      { title: 'PostgreSQL & Prisma ORM', desc: 'İlişkisel, güvenilir ve yüksek performanslı veri tabanı altyapısı; tip güvenli veri sorgulama.', color: BLUE },
      { title: 'Docker & Docker Compose', desc: 'Uygulama ve veritabanı bağımsız izole containerlarda sıfır konfigürasyon bağımlılığı ile çalışır.', color: EMERALD },
      { title: 'Coolify Entegrasyonu', desc: 'GitHub üzerinden otomatik CI/CD ve tek tıkla canlıya alma (milkiq.erkanerdem.online).', color: GOLD }
    ];

    const rowH = 1.15;
    const rowGap = 0.12;
    const startY = 1.5;

    stackItems.forEach((st, i) => {
      const sY = startY + i * (rowH + rowGap);
      slide.addShape(pres.ShapeType.roundRect, {
        x: MARGIN_LEFT,
        y: sY,
        w: CONTENT_WIDTH,
        h: rowH,
        rectRadius: 0.15,
        fill: { color: CARD_BG },
        line: { color: CARD_BORDER, width: 1.5 }
      });

      slide.addText(st.title, {
        x: MARGIN_LEFT + 0.3,
        y: sY + 0.18,
        w: 5.0,
        h: 0.35,
        fontSize: 13.5,
        bold: true,
        color: st.color,
        fontFace: 'Segoe UI'
      });

      slide.addText(st.desc, {
        x: MARGIN_LEFT + 0.3,
        y: sY + 0.55,
        w: CONTENT_WIDTH - 0.6,
        h: 0.5,
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

    addHeader(slide, 'Stratejik Kazanımlar & Hemen Başlayın', 'MilkIQ ile Çiftliğinizin Geleceğini Yönetin');

    const roiCards = [
      { value: '%15 - 25', label: 'Yem Maliyeti Tasarrufu', desc: 'Fazladan protein ve enerji israfının bilimsel olarak önlenmesi.' },
      { value: '+%12', label: 'Süt Verim Artışı', desc: 'Dengeli rumen pH ve optimum laktasyon piki yönetimi.' },
      { value: '360°', label: 'Uçtan Uca Finansal Kontrol', desc: '1 Litre sütün gerçek maliyeti ve günlük hayvan başı net kar.' }
    ];

    const rW = 3.75;
    const rGap = 0.241;
    const rY = 1.5;

    roiCards.forEach((r, idx) => {
      const rX = MARGIN_LEFT + idx * (rW + rGap);
      slide.addShape(pres.ShapeType.roundRect, {
        x: rX,
        y: rY,
        w: rW,
        h: 2.3,
        rectRadius: 0.18,
        fill: { color: CARD_BG },
        line: { color: EMERALD, width: 1.5 }
      });

      slide.addText(r.value, {
        x: rX + 0.2,
        y: rY + 0.2,
        w: rW - 0.4,
        h: 0.65,
        fontSize: 30,
        bold: true,
        color: EMERALD_LIGHT,
        align: 'center',
        fontFace: 'Segoe UI'
      });

      slide.addText(r.label, {
        x: rX + 0.2,
        y: rY + 0.9,
        w: rW - 0.4,
        h: 0.35,
        fontSize: 13,
        bold: true,
        color: WHITE,
        align: 'center',
        fontFace: 'Segoe UI'
      });

      slide.addText(r.desc, {
        x: rX + 0.2,
        y: rY + 1.3,
        w: rW - 0.4,
        h: 0.8,
        fontSize: 10,
        color: TEXT_MUTED,
        align: 'center',
        fontFace: 'Segoe UI'
      });
    });

    // Alt Çağrı & İletişim Kartı
    const ctaY = 4.0;
    slide.addShape(pres.ShapeType.roundRect, {
      x: MARGIN_LEFT,
      y: ctaY,
      w: CONTENT_WIDTH,
      h: 2.6,
      rectRadius: 0.2,
      fill: { color: CARD_BG },
      line: { color: BLUE, width: 2 }
    });

    slide.addText('Canlı Uygulama & İletişim', {
      x: MARGIN_LEFT + 0.4,
      y: ctaY + 0.3,
      w: 6.5,
      h: 0.4,
      fontSize: 16.5,
      bold: true,
      color: WHITE,
      fontFace: 'Segoe UI'
    });

    slide.addText('Canlı Sistem: https://milkiq.erkanerdem.online\nGeliştirici Portfolyosu: https://erkanerdem.online\n7/24 Kesintisiz Geliştirici Takibi & Teknik Destek', {
      x: MARGIN_LEFT + 0.4,
      y: ctaY + 0.85,
      w: 6.5,
      h: 1.3,
      fontSize: 11.5,
      color: 'CBD5E1',
      fontFace: 'Segoe UI'
    });

    slide.addShape(pres.ShapeType.roundRect, {
      x: MARGIN_LEFT + 7.4,
      y: ctaY + 0.65,
      w: 3.8,
      h: 1.3,
      rectRadius: 0.18,
      fill: { color: EMERALD }
    });

    slide.addText('MilkIQ İle Başlayın\nAkıllı Çiftlik Yönetimi', {
      x: MARGIN_LEFT + 7.5,
      y: ctaY + 0.85,
      w: 3.6,
      h: 0.85,
      fontSize: 14,
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
