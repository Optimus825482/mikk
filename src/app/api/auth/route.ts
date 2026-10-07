import { NextRequest, NextResponse } from 'next/server';
import { loginWithPin, logout, isAuthenticated } from '@/lib/auth';
import { changePin } from '@/lib/storage';

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
        return NextResponse.json({ success: true, message: 'Giriş başarılı' });
      }
      return NextResponse.json({ success: false, error: 'Hatalı PIN kodu!' }, { status: 401 });
    }

    if (action === 'logout') {
      await logout();
      return NextResponse.json({ success: true });
    }

    if (action === 'change_pin') {
      const res = await changePin(oldPin, newPin);
      if (!res.success) {
        return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: 'PIN kodu başarıyla güncellendi' });
    }

    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}
