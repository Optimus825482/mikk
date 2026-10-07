import { NextRequest, NextResponse } from 'next/server';
import { getFeeds, addFeed, resetFeedsToDefaults } from '@/lib/storage';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  const feeds = await getFeeds();
  return NextResponse.json(feeds);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === 'reset_defaults') {
      const feeds = await resetFeedsToDefaults();
      await logAuditEvent({
        action: 'FEED_RESET',
        category: 'YEM',
        level: 'WARN',
        message: 'Tüm yem kataloğu varsayılan standart değerlere sıfırlandı.',
        req,
      });
      return NextResponse.json({ success: true, feeds });
    }

    const { name, type, category, maxLimitKg, dryMatter, protein, starch, unitPrice } = body;
    if (!name || !type || dryMatter === undefined || protein === undefined || starch === undefined || unitPrice === undefined) {
      return NextResponse.json({ error: 'Tüm zorunlu alanları doldurun' }, { status: 400 });
    }

    const newFeed = await addFeed({
      name,
      type,
      category: category || (type === 'KABA' ? 'KURU_OT' : 'HAZIR_YEM'),
      maxLimitKg: maxLimitKg ? Number(maxLimitKg) : undefined,
      dryMatter: Number(dryMatter),
      protein: Number(protein),
      starch: Number(starch),
      unitPrice: Number(unitPrice),
      isDefault: false,
    });

    await logAuditEvent({
      action: 'FEED_CREATE',
      category: 'YEM',
      level: 'INFO',
      message: `Yeni yem maddesi tanımlandı: "${newFeed.name}" (${newFeed.unitPrice} TL/kg, KM: %${newFeed.dryMatter}, HP: %${newFeed.protein})`,
      details: newFeed,
      req,
    });

    return NextResponse.json(newFeed, { status: 201 });
  } catch (error: any) {
    await logAuditEvent({
      action: 'FEED_CREATE_ERROR',
      category: 'YEM',
      level: 'ERROR',
      message: `Yem eklenirken hata oluştu: ${error?.message}`,
      details: { stack: error?.stack },
      req,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
