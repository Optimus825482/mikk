import { NextRequest, NextResponse } from 'next/server';
import { getExpenses, addExpense, deleteExpense } from '@/lib/storage';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month') || undefined;
  const expenses = await getExpenses(month);
  return NextResponse.json(expenses);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, amount, month, description } = body;
    if (!category || amount === undefined || !month) {
      return NextResponse.json({ error: 'Kategori, tutar ve ay zorunludur' }, { status: 400 });
    }

    const newExpense = await addExpense({
      category,
      amount: Number(amount),
      month,
      description,
    });
    return NextResponse.json(newExpense, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID gereklidir' }, { status: 400 });

    const success = await deleteExpense(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
