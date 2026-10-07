import { NextRequest, NextResponse } from 'next/server';
import { loginWithPin, logout, isAuthenticated } from '@/lib/auth';
import { changePin } from '@/lib/storage';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  const authed = await isAuthenticated();
  return NextResponse.json({ authenticated: authed });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, pin, oldPin, newPin } = body;

    if (action === 'login') {
      const success = await loginWithPin(pin);
      if (success) {
        await logAuditEvent({
          action: 'LOGIN_SUCCESS',
          category: 'AUTH',
          level: 'INFO',
          message: 'Kullanıcı PIN kodu ile başarıyla sisteme giriş yaptı.',
          req,
        });
        return NextResponse.json({ success: true, message: 'Giriş başarılı' });
      }

      await logAuditEvent({
        action: 'LOGIN_FAILED',
        category: 'AUTH',
        level: 'WARN',
        message: 'Hatalı PIN kodu ile başarısız giriş denemesi yapıldı.',
        req,
      });
      return NextResponse.json({ success: false, error: 'Hatalı PIN kodu!' }, { status: 401 });
    }

    if (action === 'logout') {
      await logAuditEvent({
        action: 'LOGOUT',
        category: 'AUTH',
        level: 'INFO',
        message: 'Kullanıcı oturumunu sonlandırdı (Çıkış yapıldı).',
        req,
      });
      await logout();
      return NextResponse.json({ success: true });
    }

    if (action === 'change_pin') {
      const res = await changePin(oldPin, newPin);
      if (!res.success) {
        await logAuditEvent({
          action: 'PIN_CHANGE_FAILED',
          category: 'AUTH',
          level: 'WARN',
          message: `PIN kodu değiştirme başarısız: ${res.error}`,
          req,
        });
        return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      }

      await logAuditEvent({
        action: 'PIN_CHANGED',
        category: 'AUTH',
        level: 'INFO',
        message: 'Sistem giriş PIN kodu başarıyla güncellendi.',
        req,
      });
      return NextResponse.json({ success: true, message: 'PIN kodu başarıyla güncellendi' });
    }

    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
  } catch (error: any) {
    await logAuditEvent({
      action: 'AUTH_EXCEPTION',
      category: 'AUTH',
      level: 'ERROR',
      message: `Kimlik doğrulama sırasında istisna oluştu: ${error?.message}`,
      details: { stack: error?.stack },
      req,
    });
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}
