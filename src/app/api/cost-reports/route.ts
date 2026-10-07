import { NextRequest, NextResponse } from 'next/server';
import { getCostReports, saveCostReport, deleteCostReport } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const reports = await getCostReports();

    if (month) {
      const single = reports.find(r => r.month === month);
      return NextResponse.json(single || null);
    }

    return NextResponse.json(reports);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.month) {
      return NextResponse.json({ error: 'Ay (month) alanı zorunludur' }, { status: 400 });
    }

    const saved = await saveCostReport(body);
    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID zorunludur' }, { status: 400 });
    }

    const success = await deleteCostReport(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
