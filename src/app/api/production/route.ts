import { NextRequest, NextResponse } from 'next/server';
import { getDailyProductions, saveDailyProduction } from '@/lib/storage';

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

    const saved = await saveDailyProduction({
      date,
      totalMilk: Number(totalMilk),
      milkingCows: Number(milkingCows),
      notes: notes || '',
    });

    return NextResponse.json(saved);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
