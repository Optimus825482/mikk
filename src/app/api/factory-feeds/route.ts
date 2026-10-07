import { NextResponse } from 'next/server';
import { getFactoryFeeds, addFactoryFeed, importFactoryFeedToMyFeeds } from '@/lib/storage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get('brand');
    const search = searchParams.get('q');

    let feeds = await getFactoryFeeds();

    if (brand && brand !== 'ALL') {
      feeds = feeds.filter(f => f.brand.toLowerCase() === brand.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      feeds = feeds.filter(f => 
        f.name.toLowerCase().includes(q) || 
        f.brand.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q)
      );
    }

    return NextResponse.json(feeds);
  } catch (error) {
    console.error('Factory feeds GET error:', error);
    return NextResponse.json({ error: 'Fabrika yemleri yüklenirken hata oluştu' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Özel import eylemi: Seçilen fabrika yemini çiftliğin aktif rasyon yemlerine aktarma
    if (body.action === 'import') {
      if (!body.factoryFeedId) {
        return NextResponse.json({ error: 'factoryFeedId gereklidir' }, { status: 400 });
      }
      const customPrice = body.customPrice ? Number(body.customPrice) : undefined;
      const result = await importFactoryFeedToMyFeeds(body.factoryFeedId, customPrice);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    // Yeni fabrika yemi kaydetme
    if (!body.brand || !body.name || body.protein === undefined || body.starch === undefined) {
      return NextResponse.json({ error: 'Marka, ürün adı, protein ve nişasta zorunludur' }, { status: 400 });
    }

    const newFeed = await addFactoryFeed({
      brand: body.brand,
      name: body.name,
      category: body.category || 'SUT_YEMI',
      categoryLabel: body.categoryLabel || 'Fabrika Süt Yemi',
      protein: Number(body.protein),
      starch: Number(body.starch),
      dryMatter: body.dryMatter ? Number(body.dryMatter) : 88.0,
      energyME: body.energyME ? Number(body.energyME) : 2700,
      cellulose: body.cellulose ? Number(body.cellulose) : 9.0,
      calcium: body.calcium ? Number(body.calcium) : 1.1,
      phosphorus: body.phosphorus ? Number(body.phosphorus) : 0.6,
      approxPrice: body.approxPrice ? Number(body.approxPrice) : 14.0,
      bagWeight: body.bagWeight ? Number(body.bagWeight) : 50,
      description: body.description || '',
    });

    return NextResponse.json(newFeed, { status: 201 });
  } catch (error) {
    console.error('Factory feeds POST error:', error);
    return NextResponse.json({ error: 'Fabrika yemi kaydedilemedi' }, { status: 500 });
  }
}
