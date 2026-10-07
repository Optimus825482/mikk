import { getPrisma } from '@/lib/storage';
import { sendErrorNotificationMail } from '@/lib/mailer';
import fs from 'fs';
import path from 'path';

export interface AuditLogItem {
  id: string;
  action: string;
  category: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  details?: any;
  ipAddress?: string;
  location?: string;
  userAgent?: string;
  device?: string;
  createdAt: string;
}

// İstemci IP Adresini Güvenle Çıkar
export function extractClientIp(req?: Request | Headers): string {
  if (!req) return '127.0.0.1';
  const headers = req instanceof Request ? req.headers : req;

  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map((ip) => ip.trim());
    if (ips[0]) return ips[0];
  }

  const realIp = headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    headers.get('true-client-ip') ||
    headers.get('x-client-ip');

  if (realIp) return realIp.trim();

  return '127.0.0.1';
}

// User Agent'tan Cihaz, OS ve Tarayıcı Çözümle
export function parseDevice(ua?: string | null): string {
  if (!ua) return 'Bilinmiyor';

  let os = 'Bilinmeyen OS';
  if (/windows phone/i.test(ua)) os = 'Windows Phone';
  else if (/win/i.test(ua)) os = 'Windows';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/mac/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  let browser = 'Tarayıcı';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/opera|opr/i.test(ua)) browser = 'Opera';

  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(ua);
  const type = isMobile ? 'Mobil' : 'Masaüstü';

  return `${browser} (${os} - ${type})`;
}

// IP Adresinden Lokasyon (Şehir, Ülke) Çözümle
const locationCache = new Map<string, string>();

export async function lookupIpLocation(ip?: string): Promise<string> {
  if (!ip) return 'Bilinmiyor';
  const cleanIp = ip.replace(/^.*:/, ''); // IPv6 mapping varsa temizle

  if (
    cleanIp === '127.0.0.1' ||
    cleanIp === 'localhost' ||
    cleanIp === '::1' ||
    cleanIp.startsWith('192.168.') ||
    cleanIp.startsWith('10.') ||
    cleanIp.startsWith('172.16.') ||
    cleanIp.startsWith('172.31.')
  ) {
    return 'Yerel Ağ / Sunucu';
  }

  if (locationCache.has(cleanIp)) {
    return locationCache.get(cleanIp)!;
  }

  try {
    // 2 saniye zaman aşımı ile hızlı IP geolocation sorgusu
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`http://ip-api.com/json/${cleanIp}?fields=status,country,city`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success') {
        const loc = `${data.city || 'Bilinmeyen Şehir'}, ${data.country || 'TR'}`;
        locationCache.set(cleanIp, loc);
        return loc;
      }
    }
  } catch {
    // Geolocation başarısız olursa sunucu akışını bozmaz
  }

  return 'Konum Alınamadı';
}

// Yerel JSON Depolama için fallback dosya yolu
const DATA_FILE = path.join(process.cwd(), 'data', 'milkiq_store.json');

// AUDIT LOG OLUŞTURUCU
export async function logAuditEvent({
  action,
  category,
  level = 'INFO',
  message,
  details,
  req,
  ip,
  userAgent,
}: {
  action: string;
  category: 'AUTH' | 'RASYON' | 'YEM' | 'GIDER' | 'URETIM' | 'AYARLAR' | 'SISTEM' | 'HATA';
  level?: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  details?: any;
  req?: Request;
  ip?: string;
  userAgent?: string;
}) {
  try {
    const clientIp = ip || extractClientIp(req);
    const ua = userAgent || (req ? req.headers.get('user-agent') || undefined : undefined);
    const device = parseDevice(ua);
    const location = await lookupIpLocation(clientIp);

    const prisma = getPrisma();
    // 1. Prisma / PostgreSQL varsa oraya yaz
    if (prisma) {
      try {
        await prisma.auditLog.create({
          data: {
            action,
            category,
            level,
            message,
            details: details ? (typeof details === 'object' ? details : { raw: details }) : undefined,
            ipAddress: clientIp,
            location,
            userAgent: ua,
            device,
          },
        });
      } catch (dbErr) {
        console.error('AuditLog veritabanına yazılamadı, yerel dosyaya yazılacak:', dbErr);
        writeLogToLocalStore({
          id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          action,
          category,
          level,
          message,
          details,
          ipAddress: clientIp,
          location,
          userAgent: ua,
          device,
          createdAt: new Date().toISOString(),
        });
      }
    } else {
      // 2. Prisma yoksa data/milkiq_store.json içine yaz
      writeLogToLocalStore({
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        action,
        category,
        level,
        message,
        details,
        ipAddress: clientIp,
        location,
        userAgent: ua,
        device,
        createdAt: new Date().toISOString(),
      });
    }

    // 3. Eğer Seviye ERROR ise doğrudan e-posta bildirimi gönder!
    if (level === 'ERROR') {
      sendErrorNotificationMail({
        errorMessage: message,
        errorStack: details?.stack || (typeof details === 'string' ? details : undefined),
        category,
        ipAddress: clientIp,
        location,
        device,
        url: req?.url,
      }).catch((mailErr) => {
        console.error('Hata maili tetiklenirken hata oluştu:', mailErr);
      });
    }
  } catch (err) {
    console.error('Audit log kaydedilemedi:', err);
  }
}

function writeLogToLocalStore(logItem: AuditLogItem) {
  try {
    if (!fs.existsSync(DATA_FILE)) return;
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const store = JSON.parse(raw);
    if (!Array.isArray(store.auditLogs)) {
      store.auditLogs = [];
    }
    store.auditLogs.unshift(logItem);
    // Son 1000 log kaydını tut
    if (store.auditLogs.length > 1000) {
      store.auditLogs = store.auditLogs.slice(0, 1000);
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Lokal audit store yazma hatası:', err);
  }
}

// LOGLARI LİSTELEME
export async function getAuditLogs({
  limit = 50,
  offset = 0,
  category,
  level,
  search,
}: {
  limit?: number;
  offset?: number;
  category?: string;
  level?: string;
  search?: string;
}) {
  const prisma = getPrisma();
  if (prisma) {
    try {
      const where: any = {};
      if (category && category !== 'ALL') where.category = category;
      if (level && level !== 'ALL') where.level = level;
      if (search) {
        where.OR = [
          { message: { contains: search, mode: 'insensitive' } },
          { action: { contains: search, mode: 'insensitive' } },
          { ipAddress: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
          { device: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.auditLog.count({ where }),
      ]);

      return { logs, total };
    } catch (err) {
      console.error('Veritabanından audit logları çekilemedi:', err);
    }
  }

  // Fallback local store
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const store = JSON.parse(raw);
      let logs: AuditLogItem[] = store.auditLogs || [];

      if (category && category !== 'ALL') {
        logs = logs.filter((l) => l.category === category);
      }
      if (level && level !== 'ALL') {
        logs = logs.filter((l) => l.level === level);
      }
      if (search) {
        const q = search.toLowerCase();
        logs = logs.filter(
          (l) =>
            l.message.toLowerCase().includes(q) ||
            l.action.toLowerCase().includes(q) ||
            (l.ipAddress && l.ipAddress.toLowerCase().includes(q)) ||
            (l.location && l.location.toLowerCase().includes(q))
        );
      }

      const total = logs.length;
      const sliced = logs.slice(offset, offset + limit);
      return { logs: sliced, total };
    }
  } catch (err) {
    console.error('Lokal audit log okuma hatası:', err);
  }

  return { logs: [], total: 0 };
}

// LOGLARI TEMİZLE
export async function clearAllAuditLogs(): Promise<boolean> {
  const prisma = getPrisma();
  if (prisma) {
    try {
      await prisma.auditLog.deleteMany({});
      return true;
    } catch (err) {
      console.error('Veritabanı audit logları silinemedi:', err);
    }
  }

  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const store = JSON.parse(raw);
      store.auditLogs = [];
      fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
      return true;
    }
  } catch (err) {
    console.error('Lokal audit logları temizleme hatası:', err);
  }

  return false;
}
