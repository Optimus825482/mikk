import nodemailer from 'nodemailer';
import { getPrisma } from '@/lib/storage';

export interface MailSettingData {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  toEmail: string;
  isEnabled: boolean;
}

const DEFAULT_MAIL_SETTING: MailSettingData = {
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: Number(process.env.SMTP_PORT) || 465,
  smtpSecure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true,
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  fromEmail: process.env.SMTP_FROM || 'MilkIQ Sistem Bildirimi <erkanerdem8254@gmail.com>',
  toEmail: process.env.NOTIFICATION_EMAIL || 'erkanerdem8254@gmail.com',
  isEnabled: process.env.SMTP_ENABLED === 'true' || false,
};

// Veritabanından veya Env'den güncel mail ayarlarını al
export async function getMailSettings(): Promise<MailSettingData> {
  const prisma = getPrisma();
  try {
    if (prisma) {
      const dbSetting = await prisma.mailSetting.findUnique({
        where: { id: 'singleton' },
      });
      if (dbSetting) {
        return {
          smtpHost: dbSetting.smtpHost || DEFAULT_MAIL_SETTING.smtpHost,
          smtpPort: dbSetting.smtpPort || DEFAULT_MAIL_SETTING.smtpPort,
          smtpSecure: dbSetting.smtpSecure ?? DEFAULT_MAIL_SETTING.smtpSecure,
          smtpUser: dbSetting.smtpUser || DEFAULT_MAIL_SETTING.smtpUser,
          smtpPass: dbSetting.smtpPass || DEFAULT_MAIL_SETTING.smtpPass,
          fromEmail: dbSetting.fromEmail || DEFAULT_MAIL_SETTING.fromEmail,
          toEmail: dbSetting.toEmail || DEFAULT_MAIL_SETTING.toEmail,
          isEnabled: dbSetting.isEnabled ?? DEFAULT_MAIL_SETTING.isEnabled,
        };
      }
    }
  } catch (err) {
    console.error('Mail ayarları veritabanından okunamadı, varsayılan kullanılıyor:', err);
  }
  return DEFAULT_MAIL_SETTING;
}

// Mail ayarlarını veritabanına kaydet/güncelle
export async function saveMailSettings(data: Partial<MailSettingData>): Promise<MailSettingData> {
  const current = await getMailSettings();
  const updated: MailSettingData = {
    smtpHost: data.smtpHost || current.smtpHost,
    smtpPort: data.smtpPort ? Number(data.smtpPort) : current.smtpPort,
    smtpSecure: data.smtpSecure !== undefined ? Boolean(data.smtpSecure) : current.smtpSecure,
    smtpUser: data.smtpUser !== undefined ? data.smtpUser : current.smtpUser,
    smtpPass: data.smtpPass !== undefined ? data.smtpPass : current.smtpPass,
    fromEmail: data.fromEmail || current.fromEmail,
    toEmail: data.toEmail || current.toEmail,
    isEnabled: data.isEnabled !== undefined ? Boolean(data.isEnabled) : current.isEnabled,
  };

  const prisma = getPrisma();
  if (prisma) {
    try {
      await prisma.mailSetting.upsert({
        where: { id: 'singleton' },
        update: {
          smtpHost: updated.smtpHost,
          smtpPort: updated.smtpPort,
          smtpSecure: updated.smtpSecure,
          smtpUser: updated.smtpUser,
          smtpPass: updated.smtpPass,
          fromEmail: updated.fromEmail,
          toEmail: updated.toEmail,
          isEnabled: updated.isEnabled,
        },
        create: {
          id: 'singleton',
          smtpHost: updated.smtpHost,
          smtpPort: updated.smtpPort,
          smtpSecure: updated.smtpSecure,
          smtpUser: updated.smtpUser,
          smtpPass: updated.smtpPass,
          fromEmail: updated.fromEmail,
          toEmail: updated.toEmail,
          isEnabled: updated.isEnabled,
        },
      });
    } catch (err) {
      console.error('Mail ayarları veritabanına kaydedilemedi:', err);
      throw err;
    }
  }

  return updated;
}

// E-posta gönderim fonksiyonu
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to?: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const settings = await getMailSettings();

    if (!settings.isEnabled) {
      return { success: false, error: 'E-posta bildirim sistemi devre dışı bırakılmış (isEnabled: false).' };
    }

    if (!settings.smtpUser || !settings.smtpPass) {
      return { success: false, error: 'SMTP kullanıcı adı veya şifresi yapılandırılmamış.' };
    }

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpSecure, // true for 465, false for 587
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass,
      },
      tls: {
        rejectUnauthorized: false, // Sertifika uyarılarında kopmayı engeller
      },
    });

    const info = await transporter.sendMail({
      from: settings.fromEmail || `MilkIQ <${settings.smtpUser}>`,
      to: to || settings.toEmail,
      subject,
      text: text || html.replace(/<[^>]+>/g, ''),
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('E-posta gönderim hatası:', error);
    return { success: false, error: error?.message || 'Bilinmeyen e-posta hatası' };
  }
}

// Uygulamada oluşan hataları erkanerdem8254@gmail.com adresine şık HTML formatında gönderir
export async function sendErrorNotificationMail({
  errorMessage,
  errorStack,
  category = 'GENEL_HATA',
  ipAddress,
  location,
  device,
  url,
}: {
  errorMessage: string;
  errorStack?: string;
  category?: string;
  ipAddress?: string;
  location?: string;
  device?: string;
  url?: string;
}) {
  try {
    const settings = await getMailSettings();
    if (!settings.isEnabled || !settings.smtpUser || !settings.smtpPass) {
      return; // Mail açık değilse veya şifre yoksa sessizce çık
    }

    const now = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background: #dc2626; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 22px; font-weight: bold;">⚠️ MilkIQ Sistem Hata Bildirimi</h2>
          <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Uygulamada bir istisna (exception) veya hata meydana geldi.</p>
        </div>
        
        <div style="padding: 24px; color: #1e293b;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #64748b; width: 140px;">Zaman:</td>
              <td style="padding: 10px 0; color: #0f172a;">${now}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Hata Kategorisi:</td>
              <td style="padding: 10px 0; color: #dc2626; font-weight: bold;">${category}</td>
            </tr>
            ${url ? `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #64748b;">İstek URL / Endpoint:</td>
              <td style="padding: 10px 0; font-family: monospace; color: #0284c7;">${url}</td>
            </tr>` : ''}
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #64748b;">İstemci IP & Konum:</td>
              <td style="padding: 10px 0; color: #0f172a;"><strong>${ipAddress || 'Bilinmiyor'}</strong> (${location || 'Konum alınamadı'})</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Cihaz & Tarayıcı:</td>
              <td style="padding: 10px 0; color: #0f172a;">${device || 'Bilinmiyor'}</td>
            </tr>
          </table>

          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 8px; color: #991b1b; font-size: 15px;">Hata Mesajı:</h4>
            <p style="margin: 0; color: #b91c1c; font-family: monospace; font-size: 13px; word-break: break-all;">
              ${errorMessage}
            </p>
          </div>

          ${errorStack ? `
          <div style="background: #0f172a; border-radius: 8px; padding: 14px; overflow-x: auto;">
            <h4 style="margin: 0 0 8px; color: #94a3b8; font-size: 12px; text-transform: uppercase;">Stack Trace:</h4>
            <pre style="margin: 0; color: #38bdf8; font-size: 11px; font-family: Consolas, monospace; white-space: pre-wrap; word-break: break-all;">${errorStack}</pre>
          </div>` : ''}
        </div>

        <div style="background: #f8fafc; padding: 14px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
          MilkIQ Otomatik İzleme ve Güvenlik Sistemi tarafından oluşturulmuştur.
        </div>
      </div>
    `;

    await sendEmail({
      to: settings.toEmail,
      subject: `[MilkIQ HATA] ${category}: ${errorMessage.slice(0, 50)}`,
      html,
    });
  } catch (err) {
    console.error('Hata maili gönderilirken hata oluştu:', err);
  }
}
