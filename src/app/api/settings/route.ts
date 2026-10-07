import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/storage';

export async function GET() {
  const settings = await getSettings();
  // Don't expose pin in raw GET if not needed, or return safe view
  return NextResponse.json({
    milkSalePrice: settings.milkSalePrice,
    proteinPerLiter: settings.proteinPerLiter,
    maintenanceProteinFactor: settings.maintenanceProteinFactor,
    defaultLiveWeight: settings.defaultLiveWeight,
    defaultTargetMilk: settings.defaultTargetMilk,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await updateSettings({
      milkSalePrice: body.milkSalePrice !== undefined ? Number(body.milkSalePrice) : undefined,
      proteinPerLiter: body.proteinPerLiter !== undefined ? Number(body.proteinPerLiter) : undefined,
      maintenanceProteinFactor: body.maintenanceProteinFactor !== undefined ? Number(body.maintenanceProteinFactor) : undefined,
      defaultLiveWeight: body.defaultLiveWeight !== undefined ? Number(body.defaultLiveWeight) : undefined,
      defaultTargetMilk: body.defaultTargetMilk !== undefined ? Number(body.defaultTargetMilk) : undefined,
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
