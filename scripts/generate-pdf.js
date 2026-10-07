const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('MilkIQ PDF Tanıtım Kataloğu hazırlanıyor...');

const publicDir = path.join(__dirname, '..', 'public');
const logoPath = path.join(publicDir, 'logo.png');
let logoBase64 = '';

if (fs.existsSync(logoPath)) {
  const logoBuffer = fs.readFileSync(logoPath);
  logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
}

const htmlContent = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>MilkIQ - Akıllı Süt Sığırcılığı Rasyon & Kârlılık Yönetim Sistemi | Ürün Tanıtım Kataloğu</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background-color: #ffffff;
      line-height: 1.5;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    @page {
      size: A4 portrait;
      margin: 12mm 15mm 15mm 15mm;
    }

    @page :first {
      margin: 0;
    }

    .page {
      width: 100%;
      min-height: 270mm;
      position: relative;
      page-break-after: always;
      break-after: page;
      padding-bottom: 25px;
    }

    .page:last-child {
      page-break-after: avoid;
      break-after: avoid;
    }

    /* COVER PAGE SPECIFICS */
    .cover-page {
      min-height: 297mm;
      height: 297mm;
      background: linear-gradient(135deg, #090e17 0%, #0d1527 50%, #061f1a 100%);
      color: #ffffff;
      padding: 28mm 22mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }

    .cover-glow-1 {
      position: absolute;
      top: -100px;
      right: -100px;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0) 70%);
      border-radius: 50%;
      pointer-events: none;
    }

    .cover-glow-2 {
      position: absolute;
      bottom: -100px;
      left: -100px;
      width: 450px;
      height: 450px;
      background: radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, rgba(14, 165, 233, 0) 70%);
      border-radius: 50%;
      pointer-events: none;
    }

    .badge {
      display: inline-block;
      padding: 5px 14px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .badge-emerald {
      background-color: #064e3b;
      color: #34d399;
      border: 1px solid #059669;
    }

    .badge-sky {
      background-color: #0c4a6e;
      color: #38bdf8;
      border: 1px solid #0284c7;
    }

    .badge-amber {
      background-color: #78350f;
      color: #fbbf24;
      border: 1px solid #d97706;
    }

    .badge-slate {
      background-color: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      margin-bottom: 18px;
      border-bottom: 1.5px solid #e2e8f0;
    }

    .page-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .page-header-title {
      font-size: 12px;
      font-weight: 800;
      color: #047857;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .page-header-meta {
      font-size: 10px;
      color: #64748b;
      font-weight: 600;
    }

    .page-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      font-size: 9.5px;
      color: #64748b;
      font-weight: 600;
    }

    h1, h2, h3, h4 {
      letter-spacing: -0.02em;
      color: #0f172a;
    }

    .main-heading {
      font-size: 24px;
      font-weight: 900;
      line-height: 1.2;
      color: #0f172a;
      margin-bottom: 6px;
    }

    .sub-heading {
      font-size: 13px;
      color: #475569;
      font-weight: 500;
      margin-bottom: 18px;
      line-height: 1.5;
    }

    /* CARDS & GRIDS */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
    }

    .grid-4 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 10px;
    }

    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }

    .card-emerald {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
    }

    .card-sky {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
    }

    .card-amber {
      background: #fffbeb;
      border: 1px solid #fde68a;
    }

    .card-dark {
      background: #0f172a;
      color: #ffffff;
      border: 1px solid #1e293b;
    }

    .card-title {
      font-size: 13px;
      font-weight: 800;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .card-p {
      font-size: 11px;
      color: #475569;
      line-height: 1.5;
    }

    .card-dark .card-p {
      color: #94a3b8;
    }

    /* DATA TABLES */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 10.5px;
    }

    th {
      background-color: #0f172a;
      color: #ffffff;
      text-align: left;
      padding: 7px 10px;
      font-weight: 700;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    td {
      padding: 7px 10px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }

    tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    .kpi-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 10px;
      text-align: center;
    }

    .kpi-val {
      font-size: 18px;
      font-weight: 900;
      color: #0f172a;
    }

    .kpi-lbl {
      font-size: 9.5px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 2px;
    }

    .bullet-list {
      list-style: none;
      margin: 8px 0;
    }

    .bullet-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 11px;
      color: #334155;
      margin-bottom: 8px;
      line-height: 1.45;
    }

    .bullet-icon {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      background: #10b981;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
      margin-top: 1px;
    }

    .bullet-icon-sky {
      background: #0284c7;
    }

    .bullet-icon-amber {
      background: #d97706;
    }

    .alert-box {
      border-radius: 10px;
      padding: 10px 14px;
      margin: 12px 0;
      display: flex;
      gap: 10px;
      align-items: flex-start;
    }

    .alert-amber {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      color: #92400e;
    }

    .alert-rose {
      background: #fff1f2;
      border-left: 4px solid #e11d48;
      color: #9f1239;
    }

    .alert-emerald {
      background: #ecfdf5;
      border-left: 4px solid #10b981;
      color: #065f46;
    }
  </style>
</head>
<body>

  <!-- ========================================================================= -->
  <!-- SAYFA 1: KAPAK SAYFASI (EXECUTIVE COVER)                                   -->
  <!-- ========================================================================= -->
  <div class="page cover-page">
    <div class="cover-glow-1"></div>
    <div class="cover-glow-2"></div>

    <!-- Üst Başlık & Rozet -->
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <span class="badge badge-emerald">BİLİMSEL HAYVANCILIK & FİNANSAL ZEKA</span>
      </div>

      <!-- Logo & Başlıklar -->
      <div style="display: flex; align-items: center; gap: 24px; margin-top: 20px;">
        ${logoBase64 ? `<img src="${logoBase64}" alt="MilkIQ Logo" style="width: 110px; height: 110px; border-radius: 24px; border: 2px solid rgba(16,185,129,0.5); background: #0f172a; padding: 10px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);" />` : ''}
        <div>
          <h1 style="font-size: 54px; font-weight: 900; line-height: 1; color: #ffffff; letter-spacing: -0.04em;">
            Milk<span style="color: #34d399;">IQ</span>
          </h1>
          <p style="font-size: 19px; font-weight: 600; color: #38bdf8; margin-top: 8px;">
            Akıllı Süt Sığırcılığı Rasyon ve Kârlılık Yönetim Platformu
          </p>
          <p style="font-size: 13px; color: #94a3b8; margin-top: 4px; max-width: 500px;">
            Aile Tipi Süt İşletmeleri İçin Geleceğin Bilimsel Besleme, TMR Mikser ve Finansal Analiz Sistemi
          </p>
        </div>
      </div>
    </div>

    <!-- 3 Ana Sütun Kartı -->
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin: 30px 0;">
      <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 16px; padding: 18px;">
        <div style="color: #34d399; font-size: 13px; font-weight: 800; margin-bottom: 6px;">
          🔬 Bilimsel Besleme Modeli
        </div>
        <p style="font-size: 11px; color: #cbd5e1; line-height: 1.5;">
          NRC ve CNCPS standartlarında KM tüketim kapasitesi, ham protein, nişasta dengesi ve rumen asidozu emniyet mekanizması.
        </p>
      </div>

      <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 16px; padding: 18px;">
        <div style="color: #38bdf8; font-size: 13px; font-weight: 800; margin-bottom: 6px;">
          ⚖️ TMR Mikser Reçetesi
        </div>
        <p style="font-size: 11px; color: #cbd5e1; line-height: 1.5;">
          Karma vagonu operatörünün kantar sıfırlamadan hatasız tartım yapmasını sağlayan kümülatif terazi hedefi ve A4 baskı reçetesi.
        </p>
      </div>

      <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(251, 191, 36, 0.4); border-radius: 16px; padding: 18px;">
        <div style="color: #fbbf24; font-size: 13px; font-weight: 800; margin-bottom: 6px;">
          💰 Gerçek 1L Süt Maliyeti
        </div>
        <p style="font-size: 11px; color: #cbd5e1; line-height: 1.5;">
          Yem masrafının yanı sıra elektrik, mazot, veteriner ve işçilik genel giderlerini süte paylaştıran kuruşu kuruşuna kâr analizi.
        </p>
      </div>
    </div>

    <!-- Alt Bilgi & Geliştirici İmzası -->
    <div style="border-top: 1px solid rgba(255, 255, 255, 0.15); padding-top: 18px; display: flex; justify-content: space-between; align-items: flex-end;">
      <div>
        <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Geliştirici & Sistem Mimarı</div>
        <div style="font-size: 16px; font-weight: 900; color: #ffffff; margin-top: 2px;">Veteriner Hekim Erkan Erdem</div>
        <div style="font-size: 11px; color: #38bdf8; font-weight: 600; margin-top: 2px;">
          Full Stack Yazılım Mimarı • Tarım & Hayvancılık Teknolojileri Geliştiricisi
        </div>
        <div style="font-size: 12px; color: #34d399; font-weight: 600; margin-top: 4px;">
          🌐 <a href="https://erkanerdem.online" style="color: #34d399; text-decoration: none;">https://erkanerdem.online</a>
        </div>
      </div>

      <div style="text-align: right;">
        <div style="font-size: 11px; color: #94a3b8; font-weight: 600;">Canlı Platform Erişimi</div>
        <div style="font-size: 13px; font-weight: 800; color: #38bdf8; margin-top: 2px;">https://milkiq.erkanerdem.online</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 4px;">7/24 Kesintisiz İzleme & Geliştirici Desteği</div>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SAYFA 2: YÖNETİCİ ÖZETİ & SEKTÖREL ÇÖZÜM                                   -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-header">
      <div class="page-header-left">
        <span class="badge badge-slate">BÖLÜM 1</span>
        <span class="page-header-title">YÖNETİCİ ÖZETİ & SEKTÖREL ÇÖZÜM</span>
      </div>
      <span class="page-header-meta">MilkIQ Ürün Rehberi • Sayfa 2</span>
    </div>

    <h2 class="main-heading">Süt Hayvancılığında Yeni Bir Çağ: MilkIQ Vizyonu</h2>
    <p class="sub-heading">
      Türkiye ve dünya süt sığırcılığında işletmelerin ayakta kalabilmesi, kârlılıklarını şansa bırakmamalarına ve bilimsel rasyon disiplinine bağlıdır.
    </p>

    <div class="grid-2" style="margin-bottom: 16px;">
      <div class="card" style="border-left: 4px solid #ef4444;">
        <div class="card-title" style="color: #b91c1c;">
          ⚠️ Geleneksel Çiftlik Yönetiminin Tuzakları
        </div>
        <ul class="bullet-list">
          <li class="bullet-item">
            <span class="bullet-icon" style="background: #ef4444;">✕</span>
            <span><strong>Göz Kararı Yemleme:</strong> Kuru madde ve besin değerleri hesaplanmadığı için inekler ya aç kalır ya da yemlikte kokuşup küflenen yemler israf olur.</span>
          </li>
          <li class="bullet-item">
            <span class="bullet-icon" style="background: #ef4444;">✕</span>
            <span><strong>Gizli Asidoz (SARA) Tehdidi:</strong> Süt artsın diye aşırı tahıl ve fabrika yemi verilmesi işkembeyi asitleştirir; tırnak yangısı, topallık ve döl tutmama felaketine yol açar.</span>
          </li>
          <li class="bullet-item">
            <span class="bullet-icon" style="background: #ef4444;">✕</span>
            <span><strong>Eksik Maliyet Hesabı:</strong> Sadece yem parası hesaplanıp elektrik, mazot, veteriner ve işçilik unutulduğu için işletmeler kâr ettiklerini sanırken sermayeden yerler.</span>
          </li>
        </ul>
      </div>

      <div class="card card-emerald" style="border-left: 4px solid #10b981;">
        <div class="card-title" style="color: #047857;">
          🛡️ MilkIQ İle Gelen Bütünsel Çözüm
        </div>
        <ul class="bullet-list">
          <li class="bullet-item">
            <span class="bullet-icon">✓</span>
            <span><strong>Bilimsel Rasyon Matematiği:</strong> Hayvanın canlı ağırlığı ve hedef sütüne göre kuru madde, ham protein, nişasta ve enerji ihtiyaçları kusursuz dengelenir.</span>
          </li>
          <li class="bullet-item">
            <span class="bullet-icon">✓</span>
            <span><strong>%40 Kaba Yem Güvenlik Kalkanı:</strong> Sistem, rasyondaki kaba yem oranı kritik seviyenin altına indiğinde otomatik kırmızı asidoz uyarısı verir.</span>
          </li>
          <li class="bullet-item">
            <span class="bullet-icon">✓</span>
            <span><strong>Tam Maliyet ve Parite Analizi:</strong> 1 Litre sütün gerçek yem maliyeti ve litreye düşen genel gider payı kuruşu kuruşuna hesaplanır; Süt/Yem paritesi anlık gösterilir.</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="card card-dark" style="margin-bottom: 16px; border: 1.5px solid rgba(16, 185, 129, 0.4);">
      <div style="font-size: 13px; font-weight: 800; color: #38bdf8; margin-bottom: 6px;">
        🎯 MilkIQ Kimler İçin Tasarlandı?
      </div>
      <div style="background: #1e293b; padding: 14px; border-radius: 10px; margin-top: 8px;">
        <strong style="color: #34d399; font-size: 13px; display: block; margin-bottom: 4px;">
          Süt Üreticileri & Aile İşletmeleri (10 Baştan 1000 Başa Kadar)
        </strong>
        <p style="font-size: 11px; color: #e2e8f0; line-height: 1.6;">
          MilkIQ; 10 baştan 1000 başa kadar yem maliyetini düşürmek ve süt verimini korumak isteyen tüm üreticiler ve aile işletmeleri için <strong>özel olarak tasarlandı</strong>. Karmaşık akademik formüllerle üreticiyi yormadan, sahada doğrudan ahırda ve traktör başında kullanabilmesi için <strong>kullanıcı dostu, son derece kolay kullanımlı, sade ve pratik bir arayüzle</strong> sunulmuştur.
        </p>
      </div>
    </div>

    <div class="page-footer">
      <span>MilkIQ • Akıllı Süt Sığırcılığı Rasyon ve Kârlılık Sistemi</span>
      <span>Developed by Erkan Erdem | erkanerdem.online</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SAYFA 3: BİLİMSEL RASYON STÜDYOSU & BESLENME DENETİMİ                      -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-header">
      <div class="page-header-left">
        <span class="badge badge-emerald">BÖLÜM 2</span>
        <span class="page-header-title">BİLİMSEL RASYON STÜDYOSU</span>
      </div>
      <span class="page-header-meta">MilkIQ Ürün Rehberi • Sayfa 3</span>
    </div>

    <h2 class="main-heading">Fizyolojik Denge, Tolerans Denetimi & Asidoz Koruması</h2>
    <p class="sub-heading">
      Rasyon Stüdyosu, ineklerinizin biyolojik sınırlarını korurken en yüksek süt verimini en düşük maliyetle elde etmenizi sağlayan merkezi analiz motorudur.
    </p>

    <!-- 4 Adımlı Süreç -->
    <div class="grid-4" style="margin-bottom: 16px;">
      <div class="kpi-box">
        <div class="kpi-val" style="color: #047857;">1. Parametre</div>
        <div class="kpi-lbl">Canlı Ağırlık & Hedef Süt</div>
        <p style="font-size: 9.5px; color: #64748b; margin-top: 4px;">600 kg inek ve 28 L hedef süt verimi gibi işletme ortalamaları girilir.</p>
      </div>
      <div class="kpi-box">
        <div class="kpi-val" style="color: #0284c7;">2. Yem Seçimi</div>
        <div class="kpi-lbl">Kaba ve Kesif Yemler</div>
        <p style="font-size: 9.5px; color: #64748b; margin-top: 4px;">Yonca, silaj, saman ile fabrika süt yemi ve tahıl miktarları (kg) belirlenir.</p>
      </div>
      <div class="kpi-box">
        <div class="kpi-val" style="color: #d97706;">3. Güvenlik</div>
        <div class="kpi-lbl">Asidoz & KM Toleransı</div>
        <p style="font-size: 9.5px; color: #64748b; margin-top: 4px;">Kaba yem oranı (&gt;%40) ve kuru madde aşım/artık riskleri denetlenir.</p>
      </div>
      <div class="kpi-box">
        <div class="kpi-val" style="color: #7c3aed;">4. Optimizasyon</div>
        <div class="kpi-lbl">Maliyet & 1L Süt Yemi</div>
        <p style="font-size: 9.5px; color: #64748b; margin-top: 4px;">1 Litre süt yem maliyeti ve potansiyel süt dengesi kuruş hassasiyetinde raporlanır.</p>
      </div>
    </div>

    <div class="grid-2" style="margin-bottom: 14px;">
      <div class="card card-emerald">
        <div class="card-title" style="color: #047857;">
          🌾 Rasyon Stüdyosunda Denetlenen Kritik Kriterler
        </div>
        <ul class="bullet-list">
          <li class="bullet-item">
            <span class="bullet-icon">1</span>
            <span><strong>Kuru Madde (KM) Tüketim Kapasitesi:</strong> İneğin midesinin alabileceği gerçek nemsiz yem miktarı. Hedef aşılırsa yemlikte artık kalır; eksik kalırsa açlık ve süt kaybı yaşanır.</span>
          </li>
          <li class="bullet-item">
            <span class="bullet-icon">2</span>
            <span><strong>Kaba Yem Oranı (%40 Kuralı):</strong> Toplam rasyon kuru maddesinin en az %40'ı geviş getirmeyi tetikleyen kaliteli kaba yemlerden oluşmalıdır.</span>
          </li>
          <li class="bullet-item">
            <span class="bullet-icon">3</span>
            <span><strong>Ham Protein (HP) Dengesi:</strong> Yaşama payı ve sağılan süt için gereken protein miktarı gramı gramına karşılaştırılır.</span>
          </li>
          <li class="bullet-item">
            <span class="bullet-icon">4</span>
            <span><strong>Nişasta ve Enerji Seviyesi:</strong> Arpa, mısır ve hazır yem kaynaklı nişastanın %28'i aşarak işkembeyi yakması engellenir.</span>
          </li>
        </ul>
      </div>

      <div class="card card-amber">
        <div class="card-title" style="color: #92400e;">
          ⚠️ Akıllı Güvenlik Uyarı Sistemi
        </div>
        <div class="alert-box alert-rose" style="margin-top: 6px; padding: 8px;">
          <div style="font-size: 10.5px; line-height: 1.4;">
            <strong>🚨 Kırmızı Asidoz Alarmı:</strong> Kaba yem oranı %40 altına düştüğünde sistem yetiştiriciyi uyarır: <em>"İşkembe asitleşmesi, topallık ve süt yağı çöküş riski! Kaba yemi artırın."</em>
          </div>
        </div>
        <div class="alert-box alert-amber" style="padding: 8px;">
          <div style="font-size: 10.5px; line-height: 1.4;">
            <strong>⚠️ Kuru Madde & Kokuşma Uyarısı:</strong> Tüketim kapasitesi %15'in üzerinde aşıldığında: <em>"Hayvan yemi bitiremez. Yemlikte kalan artıklar fermente olup kokuşur ve küflenir!"</em>
          </div>
        </div>
        <div class="alert-box alert-emerald" style="padding: 8px;">
          <div style="font-size: 10.5px; line-height: 1.4;">
            <strong>✅ İdeal Denge:</strong> %48-65 Kaba yem, dengeli protein ve nişasta ile maksimum süt verimi ve sağlıklı sürü.
          </div>
        </div>
      </div>
    </div>

    <!-- Hızlı Grup Seçici & Laktasyon Beslenme Tavsiyeleri -->
    <div class="card" style="background: #f8fafc; border: 1.5px solid #cbd5e1;">
      <div style="font-size: 12px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
        💡 Hızlı Grup Seçici & Laktasyon Beslenme Tavsiyeleri
      </div>
      <p style="font-size: 10.5px; color: #475569; line-height: 1.45;">
        Tek tıkla <strong>Erken Laktasyon (Pik Dönem)</strong>, <strong>Orta Laktasyon</strong>, <strong>Geç Laktasyon</strong> ve <strong>Kuru Dönem</strong> fizyolojik parametrelerine geçiş yapın. Sistem rasyonun enerji, protein ve kaba/kesif dengesine göre hayvanın laktasyon evresine özel yönlendirici tavsiyelerde bulunur.
      </p>
    </div>

    <div class="page-footer">
      <span>MilkIQ • Akıllı Süt Sığırcılığı Rasyon ve Kârlılık Sistemi</span>
      <span>Developed by Erkan Erdem | erkanerdem.online</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SAYFA 4: TMR MİKSER VAGONU OPERATÖR REÇETESİ                              -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-header">
      <div class="page-header-left">
        <span class="badge badge-sky">BÖLÜM 3</span>
        <span class="page-header-title">TMR MİKSER YÖNETİMİ & SAHA OPERASYONU</span>
      </div>
      <span class="page-header-meta">MilkIQ Ürün Rehberi • Sayfa 4</span>
    </div>

    <h2 class="main-heading">Karma Vagonu Başında Sıfır Hata: Operatör Reçetesi</h2>
    <p class="sub-heading">
      Hazırlanan rasyonun kağıt üzerinde kalmaması için TMR mikser vagonuna yüklenirken hayvan sayısı ve öğün adedine göre kümülatif terazi tablosuna dönüştürülür.
    </p>

    <div class="grid-2" style="margin-bottom: 16px;">
      <div class="card card-sky">
        <div class="card-title" style="color: #0369a1;">
          🚜 Kümülatif Terazi Yükleme Mantığı Nedir?
        </div>
        <p class="card-p">
          Mikser vagonunu yükleyen kepçe veya traktör operatörü her yem maddesinde kantar göstergesini sıfırlamakla uğraşmaz. MilkIQ operatör reçetesinde <strong>"Terazi Hedefi (Kümülatif)"</strong> sütunu yer alır. Operatör sıradaki yemi eklerken kantar göstergesi tabloda yazan kümülatif kiloya gelene kadar doldurur.
        </p>
      </div>

      <div class="card card-emerald">
        <div class="card-title" style="color: #047857;">
          ⏱️ Homojen Karışım Yükleme Sırası Protokolü
        </div>
        <p class="card-p">
          <strong>1. Kuru Kaba Yemler (Saman, Yonca):</strong> 3-5 dakika kıyılır.<br>
          <strong>2. Sulu Kaba Yemler (Mısır Silajı, Yaş Küspe):</strong> Nem ve tutuculuk sağlar.<br>
          <strong>3. Fabrika Yemi & Tahıllar (Süt Yemi, Arpa):</strong> En son eklenir; aşırı unlaşmaması için 5-7 dakika karıştırılıp hemen servis edilir.
        </p>
      </div>
    </div>

    <!-- Örnek Mikser Tablosu -->
    <div style="margin-bottom: 14px;">
      <div style="font-size: 12px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">
        📋 Örnek Mikser Yükleme Çizelgesi (30 Baş Sürü • 1 Öğün)
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 8%;">Sıra</th>
            <th style="width: 32%;">Yem Adı</th>
            <th style="width: 15%;">İnek Başı (kg)</th>
            <th style="width: 20%;">Öğünlük Tartım (kg)</th>
            <th style="width: 25%;">Terazi Hedefi (Kümülatif)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-weight: bold;">1</td>
            <td><strong>Saman (Buğday)</strong></td>
            <td>1.5 kg</td>
            <td>45 kg</td>
            <td style="font-weight: bold; color: #0369a1;">45 kg</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">2</td>
            <td><strong>Yonca Kuru Otu</strong></td>
            <td>4.0 kg</td>
            <td>120 kg</td>
            <td style="font-weight: bold; color: #0369a1;">165 kg (45 + 120)</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">3</td>
            <td><strong>Mısır Silajı (İyi Kalite)</strong></td>
            <td>22.0 kg</td>
            <td>660 kg</td>
            <td style="font-weight: bold; color: #0369a1;">825 kg (165 + 660)</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">4</td>
            <td><strong>Pancar Posası (Yaş Küspe)</strong></td>
            <td>5.0 kg</td>
            <td>150 kg</td>
            <td style="font-weight: bold; color: #0369a1;">975 kg (825 + 150)</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">5</td>
            <td><strong>19 HP Süt Yemi (Pelet)</strong></td>
            <td>8.0 kg</td>
            <td>240 kg</td>
            <td style="font-weight: bold; color: #0369a1;">1.215 kg (975 + 240)</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">6</td>
            <td><strong>Arpa Kırması</strong></td>
            <td>2.0 kg</td>
            <td>60 kg</td>
            <td style="font-weight: bold; color: #0369a1;">1.275 kg (1.215 + 60)</td>
          </tr>
          <tr style="background-color: #f1f5f9; font-weight: bold;">
            <td colspan="3" style="text-align: right; color: #0f172a;">TOPLAM ÖĞÜNLÜK KARIŞIM:</td>
            <td colspan="2" style="color: #047857; font-size: 12px;">1.275 kg / öğün (Hayvan Başı: 42.5 kg Taze Yem)</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card" style="border: 1.5px dashed #0284c7; background: #f0f9ff; display: flex; align-items: center; justify-content: space-between;">
      <div>
        <strong style="color: #0369a1; font-size: 12px;">🖨️ A4 Tek Tıkla Yazdırma & Operatör Panosu</strong>
        <p style="font-size: 10.5px; color: #475569; margin-top: 2px;">
          "Mikser Reçetesini PDF Çıkar / Yazdır" butonuyla hazır operatör çizelgesini kantar panosuna asmak üzere çıktı alabilirsiniz.
        </p>
      </div>
      <span class="badge badge-sky" style="font-size: 10px;">A4 ÇIKTI UYUMLU</span>
    </div>

    <div class="page-footer">
      <span>MilkIQ • Akıllı Süt Sığırcılığı Rasyon ve Kârlılık Sistemi</span>
      <span>Developed by Erkan Erdem | erkanerdem.online</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SAYFA 5: YEM KATALOĞU & TÜRKİYE FABRİKA SÜT YEMLERİ ENVENTARİ            -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-header">
      <div class="page-header-left">
        <span class="badge badge-amber">BÖLÜM 4</span>
        <span class="page-header-title">YEM KATALOĞU & FABRİKA YEMLERİ</span>
      </div>
      <span class="page-header-meta">MilkIQ Ürün Rehberi • Sayfa 5</span>
    </div>

    <h2 class="main-heading">Kapsamlı Yem Kütüphanesi & 14 Fabrika Analizi</h2>
    <p class="sub-heading">
      MilkIQ, Türkiye şartlarındaki kaba yemlerin laboratuvar ortalamalarını ve piyasadaki lider 14 yem fabrikasının 92 tescilli süt yemini hazır sunar.
    </p>

    <div class="grid-2" style="margin-bottom: 16px;">
      <div class="card">
        <div class="card-title" style="color: #0f172a;">
          🌾 Ortalama Kaba Yem Değerleri Kataloğu
        </div>
        <p class="card-p" style="margin-bottom: 8px;">
          Elinizde yem tahlili olmadığında hata yapmanızı önlemek için hazırlanmış referans değerler:
        </p>
        <ul class="bullet-list">
          <li class="bullet-item">
            <span class="bullet-icon">1</span>
            <span><strong>1. Sınıf & 2. Sınıf Kalite Seçimi:</strong> Yonca, silaj, saman veya pancar posasında hem normal kalite hem de orta kalite analiz seçenekleri.</span>
          </li>
          <li class="bullet-item">
            <span class="bullet-icon">2</span>
            <span><strong>Piyasa Referans Fiyatları:</strong> Güncel piyasa tonaj ve kg alış fiyatları (₺/kg) tek tıkla işletme envanterine aktarılır.</span>
          </li>
          <li class="bullet-item">
            <span class="bullet-icon">3</span>
            <span><strong>Özelleştirilebilir Besin Değerleri:</strong> Laboratuvar sonucu geldiğinde KM, Ham Protein, Nişasta ve birim fiyat anında revize edilebilir.</span>
          </li>
        </ul>
      </div>

      <div class="card" style="background: #f8fafc;">
        <div class="card-title" style="color: #0f172a;">
          🏭 14 Lider Yem Fabrikası & 92 Tescilli Süt Yemi
        </div>
        <p class="card-p" style="margin-bottom: 8px;">
          Fabrikaların tescilli etiket değerleri doğrudan sisteme entegredir:
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px;">
          <span class="badge badge-slate" style="font-size: 9px;">CP Yem</span>
          <span class="badge badge-slate" style="font-size: 9px;">Abalıoğlu</span>
          <span class="badge badge-slate" style="font-size: 9px;">Proyem</span>
          <span class="badge badge-slate" style="font-size: 9px;">Matlı</span>
          <span class="badge badge-slate" style="font-size: 9px;">Tarım Kredi</span>
          <span class="badge badge-slate" style="font-size: 9px;">Eriş Yem</span>
          <span class="badge badge-slate" style="font-size: 9px;">Toros Yem</span>
          <span class="badge badge-slate" style="font-size: 9px;">Ofis Yem</span>
          <span class="badge badge-slate" style="font-size: 9px;">Özlem Yem</span>
        </div>
        <p class="card-p">
          18 HP, 19 HP, 20 HP, 21 HP standart süt yemlerinin yanı sıra jelatinize patlamış mısır (Crown Flake / Expander) gibi yüksek enerjili özel ürünlerin de değerleri incelenebilir ve tek tuşla rasyona dahil edilebilir.
        </p>
      </div>
    </div>

    <!-- Fabrika Yemleri Tablosu -->
    <div style="margin-bottom: 14px;">
      <div style="font-size: 12px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">
        📊 Katalogdan Seçilmiş Örnek Süt Yemi Analizleri
      </div>
      <table>
        <thead>
          <tr>
            <th>Marka</th>
            <th>Yem Adı / Çeşidi</th>
            <th>Ham Protein</th>
            <th>Nişasta</th>
            <th>Kuru Madde</th>
            <th>ME Enerji</th>
            <th>Ref. Fiyat</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Proyem</strong></td>
            <td>Proyem 21 Süt Yemi</td>
            <td>%21.0</td>
            <td>%24.0</td>
            <td>%88.0</td>
            <td>2.750 kcal</td>
            <td>~20.00 ₺/kg</td>
          </tr>
          <tr>
            <td><strong>CP Yem</strong></td>
            <td>CP Şampiyon Süt 20 HP</td>
            <td>%20.0</td>
            <td>%26.0</td>
            <td>%88.0</td>
            <td>2.700 kcal</td>
            <td>~19.50 ₺/kg</td>
          </tr>
          <tr>
            <td><strong>Abalıoğlu</strong></td>
            <td>Abalıoğlu Bol Süt 19 HP</td>
            <td>%19.0</td>
            <td>%25.5</td>
            <td>%88.0</td>
            <td>2.650 kcal</td>
            <td>~18.50 ₺/kg</td>
          </tr>
          <tr>
            <td><strong>Tarım Kredi</strong></td>
            <td>TK Koop Süt 18 HP</td>
            <td>%18.0</td>
            <td>%27.0</td>
            <td>%88.0</td>
            <td>2.600 kcal</td>
            <td>~17.00 ₺/kg</td>
          </tr>
          <tr>
            <td><strong>Eriş Yem</strong></td>
            <td>Crown Patlamış Mısır (Jelatinize)</td>
            <td>%8.8</td>
            <td>%68.0</td>
            <td>%88.5</td>
            <td>3.220 kcal</td>
            <td>~23.75 ₺/kg</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="page-footer">
      <span>MilkIQ • Akıllı Süt Sığırcılığı Rasyon ve Kârlılık Sistemi</span>
      <span>Developed by Erkan Erdem | erkanerdem.online</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SAYFA 6: 1L SÜT MALİYETİ, GENEL GİDERLER & KÂRLILIK MATEMATİĞİ           -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-header">
      <div class="page-header-left">
        <span class="badge badge-emerald">BÖLÜM 5</span>
        <span class="page-header-title">FİNANSAL ANALİZ & KÂRLILIK YÖNETİMİ</span>
      </div>
      <span class="page-header-meta">MilkIQ Ürün Rehberi • Sayfa 6</span>
    </div>

    <h2 class="main-heading">1 Litre Sütün Gerçek Maliyeti ve Net Kâr Marjı</h2>
    <p class="sub-heading">
      Süt hayvancılığı ticari bir yatırımdır. MilkIQ, yem gideri ile genel çiftlik masraflarını harmanlayarak kuruşu kuruşuna başabaş ve kâr analizini çıkarır.
    </p>

    <!-- Formül Kartı -->
    <div class="card card-dark" style="margin-bottom: 16px; padding: 16px;">
      <div style="font-size: 11px; font-weight: 700; color: #34d399; text-transform: uppercase; letter-spacing: 0.05em;">
        BİLİMSEL MALİYET FORMÜLÜ
      </div>
      <div style="font-size: 16px; font-weight: 900; color: #ffffff; margin-top: 4px;">
        1 Litre Süt Toplam Maliyeti = 1L Süt Yem Maliyeti + 1L Genel Gider Payı
      </div>
      <p style="font-size: 11px; color: #94a3b8; margin-top: 6px;">
        Net Kâr Marjı (₺/L) = Süt Satış Fiyatı (₺) - 1 Litre Süt Toplam Maliyeti (₺)
      </p>
    </div>

    <div class="grid-2" style="margin-bottom: 16px;">
      <div class="card">
        <div class="card-title" style="color: #0f172a;">
          🧾 Genel İşletme Giderleri Modülü
        </div>
        <p class="card-p" style="margin-bottom: 8px;">
          Yem dışındaki tüm çiftlik harcamaları kategorilerine göre kaydedilir ve aylık toplam süte bölünerek litreye paylaştırılır:
        </p>
        <div class="grid-2" style="gap: 6px; font-size: 10px; color: #334155;">
          <div style="background: #f1f5f9; padding: 6px 8px; border-radius: 6px;">⚡ <strong>Elektrik & Su:</strong> Soğutma tankı ve sağım</div>
          <div style="background: #f1f5f9; padding: 6px 8px; border-radius: 6px;">🚜 <strong>Mazot & Yakıt:</strong> Traktör ve mikser</div>
          <div style="background: #f1f5f9; padding: 6px 8px; border-radius: 6px;">💉 <strong>Veteriner & İlaç:</strong> Sağlık giderleri</div>
          <div style="background: #f1f5f9; padding: 6px 8px; border-radius: 6px;">🧬 <strong>Suni Tohumlama:</strong> Genetik ıslah</div>
          <div style="background: #f1f5f9; padding: 6px 8px; border-radius: 6px;">👷 <strong>İşçilik & Personel:</strong> Sağımcı ve bakıcı</div>
          <div style="background: #f1f5f9; padding: 6px 8px; border-radius: 6px;">🏗️ <strong>Amortisman & Bakım:</strong> Ekipman yıpranması</div>
        </div>
      </div>

      <div class="card card-emerald">
        <div class="card-title" style="color: #047857;">
          📈 Süt / Yem Paritesi İndikatörü
        </div>
        <p class="card-p" style="margin-bottom: 8px;">
          1 Litre süt satıldığında kaç kg fabrika süt yemi alınabildiğini gösteren evrensel kârlılık pusulasıdır:
        </p>
        <div style="background: #ffffff; padding: 10px; border-radius: 8px; border: 1px solid #bbf7d0; margin-bottom: 8px;">
          <div style="font-size: 11px; font-weight: 800; color: #047857;">Parite = 1L Süt Fiyatı (₺) / 1 kg Süt Yemi Fiyatı (₺)</div>
          <div style="font-size: 10px; color: #475569; margin-top: 4px;">
            Örn: 16.50 ₺ Süt / 12.00 ₺ Yem = <strong>1.38 Parite (Kârlı Seviye)</strong>
          </div>
        </div>
        <ul class="bullet-list" style="margin: 0;">
          <li class="bullet-item" style="margin-bottom: 4px;">
            <span class="bullet-icon">&gt;</span>
            <span><strong>Parite &gt; 1.50:</strong> Çok yüksek kârlılık ve büyüme fırsatı.</span>
          </li>
          <li class="bullet-item" style="margin-bottom: 4px;">
            <span class="bullet-icon bullet-icon-sky">=</span>
            <span><strong>Parite 1.30 - 1.50:</strong> Sağlıklı sürdürülebilir çiftlik dengesi.</span>
          </li>
          <li class="bullet-item" style="margin-bottom: 0;">
            <span class="bullet-icon bullet-icon-amber">&lt;</span>
            <span><strong>Parite &lt; 1.00:</strong> Zarar eşiği! İşletme sermayeden tüketir.</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Simülatör ve Arşivleme -->
    <div class="card" style="background: #f8fafc; border: 1px solid #e2e8f0;">
      <div style="font-size: 12px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
        📅 Dinamik Fiyat Simülatörü & Aylık Maliyet Arşivi
      </div>
      <p style="font-size: 10.5px; color: #475569; line-height: 1.45;">
        Süt satış fiyatı değiştiğinde (örneğin 16.50 ₺'den 18.00 ₺'ye yükseldiğinde) tek kaydırıcıyla anlık net kâr marjınızın, günlük ve aylık cironuzun nasıl değiştiğini simüle edin. Her ayın sonunda "Maliyeti Arşive Kaydet" butonu ile geçmiş dönem kârlılık karnenizi kalıcı olarak saklayın ve kıyaslayın.
      </p>
    </div>

    <div class="page-footer">
      <span>MilkIQ • Akıllı Süt Sığırcılığı Rasyon ve Kârlılık Sistemi</span>
      <span>Developed by Erkan Erdem | erkanerdem.online</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SAYFA 7: GÜVENLİK, AUDIT LOG & BULUT MİMARİSİ                              -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-header">
      <div class="page-header-left">
        <span class="badge badge-sky">BÖLÜM 6</span>
        <span class="page-header-title">KURUMSAL GÜVENLİK & SİSTEM MİMARİSİ</span>
      </div>
      <span class="page-header-meta">MilkIQ Ürün Rehberi • Sayfa 7</span>
    </div>

    <h2 class="main-heading">Kurumsal Denetim, 7/24 Alarm & Yüksek Güvenlik</h2>
    <p class="sub-heading">
      MilkIQ yalnızca bir hesaplama aracı değil; verilerinizin güvenliğini sağlayan, denetim izi tutan ve 7/24 geliştirici takibinde olan kurumsal bir platformdur.
    </p>

    <div class="grid-2" style="margin-bottom: 16px;">
      <div class="card" style="border-left: 4px solid #0284c7;">
        <div class="card-title" style="color: #0369a1;">
          🛡️ Kurumsal Audit Log (Denetim Kayıtları)
        </div>
        <p class="card-p" style="margin-bottom: 8px;">
          Sistemde yapılan her eylem kurumsal şeffaflıkla kayıt altına alınır:
        </p>
        <ul class="bullet-list">
          <li class="bullet-item">
            <span class="bullet-icon bullet-icon-sky">✓</span>
            <span><strong>Tüm Hareketler:</strong> Rasyon hesaplama, yem fiyatı güncelleme, gider ekleme/silme ve kullanıcı girişleri loglanır.</span>
          </li>
          <li class="bullet-item">
            <span class="bullet-icon bullet-icon-sky">✓</span>
            <span><strong>Cihaz & Tarayıcı Tespiti:</strong> Masaüstü, cep telefonu veya tablet bilgisi kaydedilir.</span>
          </li>
          <li class="bullet-item">
            <span class="bullet-icon bullet-icon-sky">✓</span>
            <span><strong>IP & Şehir/Ülke Lokasyonu:</strong> İşlemin yapıldığı IP adresi üzerinden coğrafi konum analizi yapılır.</span>
          </li>
          <li class="bullet-item">
            <span class="bullet-icon bullet-icon-sky">✓</span>
            <span><strong>Filtrelenebilir Yönetim Paneli:</strong> Kategori (Rasyon, Yem, Gider, Sistem) ve log seviyesine (INFO, WARN, ERROR) göre arama.</span>
          </li>
        </ul>
      </div>

      <div class="card" style="border-left: 4px solid #10b981;">
        <div class="card-title" style="color: #047857;">
          📧 Otomatik Hata Alarmı & 7/24 Geliştirici Takibi
        </div>
        <p class="card-p" style="margin-bottom: 8px;">
          Beklenmeyen herhangi bir sistem hatası oluştuğunda:
        </p>
        <ul class="bullet-list">
          <li class="bullet-item">
            <span class="bullet-icon">✓</span>
            <span><strong>Anında SMTP Bildirimi:</strong> Hata meydana geldiği saniyede sistem mimarı <strong>Erkan Erdem</strong>'e teknik ayrıntılar ve stack trace iletilir.</span>
          </li>
          <li class="bullet-item">
            <span class="bullet-icon">✓</span>
            <span><strong>Kullanıcı Kesintisi Olmadan Müdahale:</strong> Sistem proaktif olarak izlendiği için sorunlar kullanıcı fark etmeden hızla çözülür.</span>
          </li>
          <li class="bullet-item">
            <span class="bullet-icon">✓</span>
            <span><strong>Özel Güvenlikli Yapılandırma:</strong> Şifreli kimlik doğrulama katmanı ile korunan SMTP yönetim menüsü.</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Teknoloji Yığını -->
    <div class="card card-dark" style="margin-bottom: 14px;">
      <div style="font-size: 12px; font-weight: 800; color: #34d399; margin-bottom: 8px;">
        ⚡ Yüksek Performanslı Modern Teknoloji Mimarisi
      </div>
      <div class="grid-4" style="gap: 8px;">
        <div style="background: #1e293b; padding: 8px; border-radius: 6px; text-align: center;">
          <div style="font-size: 11px; font-weight: bold; color: #ffffff;">Next.js 15</div>
          <div style="font-size: 9px; color: #94a3b8;">App Router & SSR</div>
        </div>
        <div style="background: #1e293b; padding: 8px; border-radius: 6px; text-align: center;">
          <div style="font-size: 11px; font-weight: bold; color: #ffffff;">React 19 & TS</div>
          <div style="font-size: 9px; color: #94a3b8;">Tip Güvenli Altyapı</div>
        </div>
        <div style="background: #1e293b; padding: 8px; border-radius: 6px; text-align: center;">
          <div style="font-size: 11px; font-weight: bold; color: #ffffff;">PostgreSQL / Prisma</div>
          <div style="font-size: 9px; color: #94a3b8;">İlişkisel Sağlam Veritabanı</div>
        </div>
        <div style="background: #1e293b; padding: 8px; border-radius: 6px; text-align: center;">
          <div style="font-size: 11px; font-weight: bold; color: #ffffff;">Tailwind CSS</div>
          <div style="font-size: 9px; color: #94a3b8;">Mobil Uyumlu Responsive</div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>MilkIQ • Akıllı Süt Sığırcılığı Rasyon ve Kârlılık Sistemi</span>
      <span>Developed by Erkan Erdem | erkanerdem.online</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SAYFA 8: İLETİŞİM, DESTEK & KÜNYE                                          -->
  <!-- ========================================================================= -->
  <div class="page" style="display: flex; flex-direction: column; justify-content: space-between;">
    <div>
      <div class="page-header">
        <div class="page-header-left">
          <span class="badge badge-emerald">BÖLÜM 7</span>
          <span class="page-header-title">İLETİŞİM & TEKNİK DESTEK</span>
        </div>
        <span class="page-header-meta">MilkIQ Ürün Rehberi • Sayfa 8</span>
      </div>

      <h2 class="main-heading">Geleceğin Akıllı Çiftliği İçin Yanınızdayız</h2>
      <p class="sub-heading">
        MilkIQ, süt üreticilerinin kârlılığını artırmak ve Türkiye hayvancılığına katma değer sağlamak amacıyla sürekli geliştirilmektedir.
      </p>

      <div style="margin-bottom: 20px;">
        <!-- Geliştirici Kartı -->
        <div class="card" style="border: 2px solid #10b981; background: #f0fdf4; padding: 18px;">
          <div style="font-size: 11px; font-weight: 800; color: #047857; text-transform: uppercase; letter-spacing: 0.05em;">
            GELİŞTİRİCİ & SİSTEM MİMARI
          </div>
          <h3 style="font-size: 22px; font-weight: 900; color: #0f172a; margin-top: 4px;">Veteriner Hekim Erkan Erdem</h3>
          <p style="font-size: 13px; color: #047857; font-weight: 700; margin-top: 2px;">
            Full Stack Yazılım Mimarı • Tarım & Hayvancılık Teknolojileri Geliştiricisi
          </p>
          <p style="font-size: 11.5px; color: #475569; margin-top: 6px; line-height: 1.5;">
            Hayvan besleme, sürü sağlığı ve hayvancılık işletme ekonomisi alanlarındaki saha tecrübesini modern yazılım mimarisiyle birleştirerek aile tipi süt işletmeleri için pratik ve kârlı çözümler sunar.
          </p>

          <div style="margin-top: 16px; border-top: 1px solid #bbf7d0; padding-top: 12px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; font-size: 11px;">
            <div>
              <div style="color: #64748b; font-weight: 600; font-size: 10px;">KİŞİSEL PORTAL</div>
              <a href="https://erkanerdem.online" style="color: #047857; font-weight: bold; text-decoration: none; font-size: 12px;">https://erkanerdem.online</a>
            </div>
            <div>
              <div style="color: #64748b; font-weight: 600; font-size: 10px;">E-POSTA DESTEK</div>
              <span style="color: #0f172a; font-weight: bold; font-size: 12px;">erkanerdem8254@gmail.com</span>
            </div>
            <div>
              <div style="color: #64748b; font-weight: 600; font-size: 10px;">CANLI UYGULAMA</div>
              <a href="https://milkiq.erkanerdem.online" style="color: #0369a1; font-weight: bold; text-decoration: none; font-size: 12px;">milkiq.erkanerdem.online</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Bilimsel Yasal Uyarı -->
      <div class="card" style="background: #f8fafc; border: 1px solid #e2e8f0; font-size: 10px; color: #64748b; line-height: 1.5;">
        <strong style="color: #334155;">Bilimsel & Yasal Bilgilendirme:</strong> MilkIQ tarafından sunulan rasyon hesaplamaları, kuru madde tahminleri ve besleme önerileri uluslararası NRC (National Research Council) ve CNCPS standartları temel alınarak matematiksel simülasyon olarak üretilmiştir. Sahada yem ham maddelerinin nem ve sindirilebilirlik oranları dönemsel olarak değişebileceğinden, büyük rasyon değişikliklerinde işletmenizin ziraat/veteriner danışmanlarının ve laboratuvar tahlillerinin dikkate alınması tavsiye edilir.
      </div>
    </div>

    <!-- Telif ve Alt Künye -->
    <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; text-align: center; font-size: 10.5px; color: #64748b;">
      <div>© 2026 <strong>MilkIQ</strong> • Developed by <a href="https://erkanerdem.online" style="color: #10b981; font-weight: bold; text-decoration: none;">Erkan Erdem</a></div>
      <div style="margin-top: 2px;">Tüm hakları saklıdır. Bu katalog tanıtım, eğitim ve operasyonel rehberlik amacıyla hazırlanmıştır.</div>
    </div>
  </div>

</body>
</html>
`;

const htmlFilePath = path.join(publicDir, 'MilkIQ_Tanitim_Katalogu.html');
const pdfFilePath = path.join(publicDir, 'MilkIQ_Tanitim_Katalogu.pdf');

fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
console.log(`HTML şablonu oluşturuldu: ${htmlFilePath}`);

// Headless Chrome, Chromium veya Edge ile PDF oluştur
const isWindows = process.platform === 'win32';
let browserPath = '';

if (isWindows) {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  if (fs.existsSync(chromePath)) {
    browserPath = chromePath;
  } else if (fs.existsSync(edgePath)) {
    browserPath = edgePath;
  }
} else {
  // Linux / Alpine ortamları için arama
  const linuxBrowsers = ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable'];
  for (const p of linuxBrowsers) {
    if (fs.existsSync(p)) {
      browserPath = p;
      break;
    }
  }
}

if (!browserPath) {
  console.warn('⚠️ Bilgi: Sistemde Chrome veya Edge tarayıcısı bulunamadı. HTML şablonu hazırlandı, mevcut PDF korundu.');
  process.exit(0);
}

console.log(`Tarayıcı kullanılarak PDF derleniyor (${browserPath})...`);

try {
  let command = '';
  if (isWindows) {
    command = `powershell -NoProfile -Command "Start-Process -FilePath '${browserPath}' -ArgumentList '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--run-all-compositor-stages-before-draw', '--print-to-pdf=${pdfFilePath}', 'file:///${htmlFilePath.replace(/\\\\/g, '/')}' -Wait"`;
  } else {
    command = `"${browserPath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfFilePath}" "file://${htmlFilePath}"`;
  }
  execSync(command, { stdio: 'inherit' });

  if (fs.existsSync(pdfFilePath)) {
    const stats = fs.statSync(pdfFilePath);
    console.log(`✅ PDF başarıyla oluşturuldu: ${pdfFilePath} (${(stats.size / 1024).toFixed(1)} KB)`);
  }
} catch (err) {
  console.warn('⚠️ Uyarı: PDF dönüştürme adımı tamamlanamadı, mevcut PDF korundu:', err.message);
  process.exit(0);
}

