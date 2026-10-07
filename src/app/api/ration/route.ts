import { NextRequest, NextResponse } from 'next/server';
import { 
  getActiveRation, 
  saveActiveRation, 
  getRations, 
  createSavedRation, 
  setActiveRation, 
  deleteRation 
} from '@/lib/storage';

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
      return NextResponse.json({ success: true, ration: newRation, list });
    }

    if (body.action === 'set_active') {
      const updated = await setActiveRation(body.id);
      const list = await getRations();
      return NextResponse.json({ success: true, active: updated, list });
    }

    if (body.action === 'delete') {
      const ok = await deleteRation(body.id);
      const active = await getActiveRation();
      const list = await getRations();
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
    return NextResponse.json({ success: true, ration: saved, list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
