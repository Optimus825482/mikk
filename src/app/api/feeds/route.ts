import { NextRequest, NextResponse } from 'next/server';
import { getFeeds, addFeed, resetFeedsToDefaults } from '@/lib/storage';

export async function GET() {
  const feeds = await getFeeds();
  return NextResponse.json(feeds);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === 'reset_defaults') {
      const feeds = await resetFeedsToDefaults();
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

    return NextResponse.json(newFeed, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
