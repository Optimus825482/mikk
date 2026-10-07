import { NextRequest, NextResponse } from 'next/server';
import { 
  getActiveRation, 
  saveActiveRation, 
  getRations, 
  createSavedRation, 
  setActiveRation, 
  deleteRation 
} from '@/lib/storage';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const active = await getActiveRation();
    const list = await getRations();

    if (searchParams.get('all') === 'true') {
      return NextResponse.json({ active, list });
    }
    return NextResponse.json(active);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === 'create_new') {
      const newRation = await createSavedRation({
        title: body.title,
        liveWeight: Number(body.liveWeight || 600),
        targetMilk: Number(body.targetMilk || 25),
        items: body.items || [],
        notes: body.notes || '',
        isActive: body.isActive ?? true,
      });
      const list = await getRations();

      await logAuditEvent({
        action: 'RATION_CREATE',
        category: 'RASYON',
        level: 'INFO',
        message: `Yeni rasyon reçetesi oluşturuldu: "${newRation.title}" (Hedef: ${newRation.targetMilk}L, CA: ${newRation.liveWeight}kg, ${newRation.items?.length || 0} yem)`,
        details: newRation,
        req,
      });

      return NextResponse.json({ success: true, ration: newRation, list });
    }

    if (body.action === 'set_active') {
      const updated = await setActiveRation(body.id);
      const list = await getRations();

      await logAuditEvent({
        action: 'RATION_ACTIVATE',
        category: 'RASYON',
        level: 'INFO',
        message: `Aktif sürü rasyonu değiştirildi: "${updated?.title || body.id}"`,
        details: { rationId: body.id },
        req,
      });

      return NextResponse.json({ success: true, active: updated, list });
    }

    if (body.action === 'delete') {
      const ok = await deleteRation(body.id);
      const active = await getActiveRation();
      const list = await getRations();

      await logAuditEvent({
        action: 'RATION_DELETE',
        category: 'RASYON',
        level: 'WARN',
        message: `Rasyon kaydı silindi (ID: ${body.id})`,
        details: { rationId: body.id, success: ok },
        req,
      });

      return NextResponse.json({ success: ok, active, list });
    }

    // Default: save active ration or create new if none exists
    const saved = await saveActiveRation({
      title: body.title,
      liveWeight: Number(body.liveWeight || 600),
      targetMilk: Number(body.targetMilk || 25),
      items: body.items || [],
      notes: body.notes || '',
    });
    const list = await getRations();

    await logAuditEvent({
      action: 'RATION_SAVE',
      category: 'RASYON',
      level: 'INFO',
      message: `Aktif rasyon kaydedildi ve güncellendi: "${saved.title}" (${saved.items?.length || 0} kalem yem)`,
      details: {
        title: saved.title,
        liveWeight: saved.liveWeight,
        targetMilk: saved.targetMilk,
        itemCount: saved.items?.length || 0,
      },
      req,
    });

    return NextResponse.json({ success: true, ration: saved, list });
  } catch (error: any) {
    await logAuditEvent({
      action: 'RATION_ERROR',
      category: 'RASYON',
      level: 'ERROR',
      message: `Rasyon işlemi sırasında hata oluştu: ${error?.message}`,
      details: { stack: error?.stack },
      req,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
