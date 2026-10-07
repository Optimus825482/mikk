import { NextResponse } from 'next/server';
import { getAuditLogs, clearAllAuditLogs, logAuditEvent } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 50;
    const offset = Number(searchParams.get('offset')) || 0;
    const category = searchParams.get('category') || undefined;
    const level = searchParams.get('level') || undefined;
    const search = searchParams.get('search') || undefined;

    const result = await getAuditLogs({ limit, offset, category, level, search });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Audit logs GET hatası:', error);
    return NextResponse.json({ error: error.message || 'Loglar alınamadı' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, category = 'SISTEM', level = 'INFO', message, details } = body;

    if (!action || !message) {
      return NextResponse.json({ error: 'Action ve message zorunludur' }, { status: 400 });
    }

    await logAuditEvent({
      action,
      category,
      level,
      message,
      details,
      req: request,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Audit log POST hatası:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await clearAllAuditLogs();

    // Temizleme işlemini ilk log olarak kaydet
    await logAuditEvent({
      action: 'LOGS_CLEARED',
      category: 'AYARLAR',
      level: 'WARN',
      message: 'Tüm sistem denetim ve işlem kayıtları (Audit Logs) temizlendi.',
      req: request,
    });

    return NextResponse.json({ success: true, message: 'Tüm loglar temizlendi' });
  } catch (error: any) {
    console.error('Audit logs DELETE hatası:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
