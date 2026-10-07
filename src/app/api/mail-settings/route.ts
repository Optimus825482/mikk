import { NextResponse } from 'next/server';
import { getMailSettings, saveMailSettings, sendEmail } from '@/lib/mailer';
import { logAuditEvent } from '@/lib/audit';

function verifyPin(req: Request, bodyPin?: string): boolean {
  const adminPin = process.env.MAIL_ADMIN_PIN || '518518';
  const headerPin = req.headers.get('x-mail-pin');
  const queryPin = new URL(req.url).searchParams.get('pin');
  const provided = bodyPin || headerPin || queryPin;
  return Boolean(provided && provided.trim() === adminPin.trim());
}

export async function GET(request: Request) {
  try {
    if (!verifyPin(request)) {
      return NextResponse.json({ error: 'Geçersiz yetki şifresi (PIN).' }, { status: 401 });
    }

    const settings = await getMailSettings();
    return NextResponse.json({
      smtpHost: settings.smtpHost,
      smtpPort: settings.smtpPort,
      smtpSecure: settings.smtpSecure,
      smtpUser: settings.smtpUser,
      // Şifrenin var olduğunu belirt ama tam metni gizle
      hasPassword: Boolean(settings.smtpPass && settings.smtpPass.length > 0),
      fromEmail: settings.fromEmail,
      toEmail: settings.toEmail,
      isEnabled: settings.isEnabled,
    });
  } catch (error: any) {
    console.error('Mail settings GET hatası:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pin, ...updateData } = body;

    if (!verifyPin(request, pin)) {
      await logAuditEvent({
        action: 'MAIL_CONFIG_DENIED',
        category: 'AYARLAR',
        level: 'WARN',
        message: 'Mail ayarlarına yetkisiz erişim denemesi (Hatalı PIN).',
        req: request,
      });
      return NextResponse.json({ error: 'Geçersiz yetki şifresi (PIN).' }, { status: 401 });
    }

    // Eğer şifre alanı boş bırakılmışsa veya ****** gelmişse mevcut şifreyi koru
    if (updateData.smtpPass === '******' || updateData.smtpPass === '') {
      delete updateData.smtpPass;
    }

    const saved = await saveMailSettings(updateData);

    await logAuditEvent({
      action: 'MAIL_CONFIG_UPDATE',
      category: 'AYARLAR',
      level: 'INFO',
      message: `Mail ayarları güncellendi. (Aktif: ${saved.isEnabled ? 'Evet' : 'Hayır'}, Kullanıcı: ${saved.smtpUser})`,
      details: {
        smtpHost: saved.smtpHost,
        smtpPort: saved.smtpPort,
        smtpUser: saved.smtpUser,
        toEmail: saved.toEmail,
        isEnabled: saved.isEnabled,
      },
      req: request,
    });

    return NextResponse.json({
      success: true,
      message: 'Mail ayarları veritabanına başarıyla kaydedildi.',
      settings: {
        smtpHost: saved.smtpHost,
        smtpPort: saved.smtpPort,
        smtpSecure: saved.smtpSecure,
        smtpUser: saved.smtpUser,
        hasPassword: Boolean(saved.smtpPass && saved.smtpPass.length > 0),
        fromEmail: saved.fromEmail,
        toEmail: saved.toEmail,
        isEnabled: saved.isEnabled,
      },
    });
  } catch (error: any) {
    console.error('Mail settings POST hatası:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// TEST E-POSTASI GÖNDERME
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { pin } = body;

    if (!verifyPin(request, pin)) {
      return NextResponse.json({ error: 'Geçersiz yetki şifresi (PIN).' }, { status: 401 });
    }

    const settings = await getMailSettings();
    if (!settings.smtpUser || !settings.smtpPass) {
      return NextResponse.json(
        { error: 'SMTP kullanıcı adı ve şifresi tanımlanmadan test e-postası gönderilemez.' },
        { status: 400 }
      );
    }

    const now = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
    const result = await sendEmail({
      to: settings.toEmail,
      subject: '✅ MilkIQ E-posta Bildirim Testi Başarılı!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #10b981; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #059669; margin-top: 0;">🎉 Tebrikler! MilkIQ Mail Sistemi Çalışıyor</h2>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            Bu e-posta, <strong>MilkIQ</strong> karar destek sisteminizin SMTP ve hata bildirim mekanizmasının sorunsuz çalıştığını doğrulamak amacıyla gönderilmiştir.
          </p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 14px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #166534;">
            <strong>Test Zamanı:</strong> ${now}<br/>
            <strong>SMTP Sunucu:</strong> ${settings.smtpHost}:${settings.smtpPort}<br/>
            <strong>Gönderici:</strong> ${settings.smtpUser}<br/>
            <strong>Alıcı:</strong> ${settings.toEmail}
          </div>
          <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">
            Artık sistemde meydana gelebilecek kritik istisna ve hatalar otomatik olarak bu adrese bildirilecektir.
          </p>
        </div>
      `,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await logAuditEvent({
      action: 'MAIL_TEST_SENT',
      category: 'AYARLAR',
      level: 'INFO',
      message: `Test e-postası başarıyla gönderildi: ${settings.toEmail}`,
      req: request,
    });

    return NextResponse.json({
      success: true,
      message: `Test e-postası başarıyla gönderildi (${settings.toEmail}). Lütfen gelen kutunuzu kontrol edin.`,
    });
  } catch (error: any) {
    console.error('Mail test hatası:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
