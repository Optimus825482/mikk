import { NextRequest, NextResponse } from 'next/server';
import { updateFeed, deleteFeed } from '@/lib/storage';

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

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const success = await deleteFeed(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
