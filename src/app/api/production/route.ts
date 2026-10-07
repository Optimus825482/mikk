import { NextRequest, NextResponse } from 'next/server';
import { getDailyProductions, saveDailyProduction } from '@/lib/storage';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  const list = await getDailyProductions();
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, totalMilk, milkingCows, notes } = body;
    if (!date || totalMilk === undefined || milkingCows === undefined) {
      return NextResponse.json({ error: 'Tarih, toplam süt ve inek sayısı zorunludur' }, { status: 400 });
    }

    const list = await getDailyProductions();
    const existing = list.find(p => p.date === date);
    const isUpdate = !!existing;

    const saved = await saveDailyProduction({
      date,
      totalMilk: Number(totalMilk),
      milkingCows: Number(milkingCows),
      notes: notes || '',
    });

    await logAuditEvent({
      action: isUpdate ? 'PRODUCTION_UPDATE' : 'PRODUCTION_SAVE',
      category: 'URETIM',
      level: 'INFO',
      message: `${isUpdate ? 'Mevcut günün süt üretimi güncellendi' : 'Yeni günlük süt üretimi kaydedildi'}: ${saved.date} (Toplam: ${saved.totalMilk} L, ${saved.milkingCows} İnek, Ort: ${saved.averagePerCow} L/baş)`,
      details: saved,
      req,
    });

    return NextResponse.json(saved);
  } catch (error: any) {
    await logAuditEvent({
      action: 'PRODUCTION_ERROR',
      category: 'URETIM',
      level: 'ERROR',
      message: `Süt üretimi kaydedilirken hata oluştu: ${error?.message}`,
      details: { stack: error?.stack },
      req,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
