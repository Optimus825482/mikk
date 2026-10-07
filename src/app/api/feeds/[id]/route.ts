import { NextRequest, NextResponse } from 'next/server';
import { updateFeed, deleteFeed } from '@/lib/storage';
import { logAuditEvent } from '@/lib/audit';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateFeed(id, {
      name: body.name,
      type: body.type,
      category: body.category,
      maxLimitKg: body.maxLimitKg !== undefined && body.maxLimitKg !== '' ? Number(body.maxLimitKg) : undefined,
      dryMatter: Number(body.dryMatter),
      protein: Number(body.protein),
      starch: Number(body.starch),
      unitPrice: Number(body.unitPrice),
    });

    if (!updated) {
      return NextResponse.json({ error: 'Yem bulunamadı' }, { status: 404 });
    }

    await logAuditEvent({
      action: 'FEED_UPDATE',
      category: 'YEM',
      level: 'INFO',
      message: `Yem bilgileri güncellendi: "${updated.name}" (Fiyat: ${updated.unitPrice} ₺/kg, KM: %${updated.dryMatter}, HP: %${updated.protein})`,
      details: updated,
      req,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    await logAuditEvent({
      action: 'FEED_UPDATE_ERROR',
      category: 'YEM',
      level: 'ERROR',
      message: `Yem güncellenirken hata oluştu: ${error?.message}`,
      details: { stack: error?.stack },
      req,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const success = await deleteFeed(id);

    await logAuditEvent({
      action: 'FEED_DELETE',
      category: 'YEM',
      level: 'WARN',
      message: `Yem maddesi silindi (ID: ${id})`,
      details: { feedId: id, success },
      req,
    });

    return NextResponse.json({ success });
  } catch (error: any) {
    await logAuditEvent({
      action: 'FEED_DELETE_ERROR',
      category: 'YEM',
      level: 'ERROR',
      message: `Yem silinirken hata oluştu: ${error?.message}`,
      details: { stack: error?.stack },
      req,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
