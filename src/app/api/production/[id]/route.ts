import { NextRequest, NextResponse } from 'next/server';
import { updateDailyProduction, deleteDailyProduction, getDailyProductions } from '@/lib/storage';
import { logAuditEvent } from '@/lib/audit';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { date, totalMilk, milkingCows, notes } = body;

    const result = await updateDailyProduction(id, {
      date,
      totalMilk: totalMilk !== undefined ? Number(totalMilk) : undefined,
      milkingCows: milkingCows !== undefined ? Number(milkingCows) : undefined,
      notes,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message || 'Güncelleme başarısız' }, { status: 400 });
    }

    const updated = result.production!;

    await logAuditEvent({
      action: 'PRODUCTION_UPDATE',
      category: 'URETIM',
      level: 'INFO',
      message: `Günlük süt üretim kaydı güncellendi: ${updated.date} (Toplam: ${updated.totalMilk} L, ${updated.milkingCows} İnek, Ort: ${updated.averagePerCow} L/baş)`,
      details: updated,
      req,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    await logAuditEvent({
      action: 'PRODUCTION_ERROR',
      category: 'URETIM',
      level: 'ERROR',
      message: `Süt üretimi güncellenirken hata: ${error?.message}`,
      details: { stack: error?.stack },
      req,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const all = await getDailyProductions();
    const target = all.find(p => p.id === id);

    const deleted = await deleteDailyProduction(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 });
    }

    await logAuditEvent({
      action: 'PRODUCTION_DELETE',
      category: 'URETIM',
      level: 'INFO',
      message: `Günlük süt üretim kaydı silindi: ${target?.date || id} (${target?.totalMilk || 0} Litre)`,
      details: target || { id },
      req,
    });

    return NextResponse.json({ success: true, message: 'Kayıt başarıyla silindi' });
  } catch (error: any) {
    await logAuditEvent({
      action: 'PRODUCTION_ERROR',
      category: 'URETIM',
      level: 'ERROR',
      message: `Süt üretimi silinirken hata: ${error?.message}`,
      details: { stack: error?.stack },
      req,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
