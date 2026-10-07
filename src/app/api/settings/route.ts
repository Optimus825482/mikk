import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/storage';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  const settings = await getSettings();
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

    await logAuditEvent({
      action: 'SETTINGS_UPDATE',
      category: 'AYARLAR',
      level: 'INFO',
      message: `Sistem besleme ve fiyat parametreleri güncellendi (Süt Satış: ${updated.milkSalePrice} ₺/L, Canlı Ağırlık: ${updated.defaultLiveWeight} kg, Hedef Süt: ${updated.defaultTargetMilk} L)`,
      details: updated,
      req,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    await logAuditEvent({
      action: 'SETTINGS_ERROR',
      category: 'AYARLAR',
      level: 'ERROR',
      message: `Ayarlar güncellenirken hata oluştu: ${error?.message}`,
      details: { stack: error?.stack },
      req,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
