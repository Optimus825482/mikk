import { NextRequest, NextResponse } from 'next/server';
import { getExpenses, addExpense, deleteExpense } from '@/lib/storage';
import { logAuditEvent } from '@/lib/audit';

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

    await logAuditEvent({
      action: 'EXPENSE_CREATE',
      category: 'GIDER',
      level: 'INFO',
      message: `Genel işletme gideri kaydedildi: ${newExpense.category} (${newExpense.amount} ₺ - Dönem: ${newExpense.month}${newExpense.description ? ` - ${newExpense.description}` : ''})`,
      details: newExpense,
      req,
    });

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error: any) {
    await logAuditEvent({
      action: 'EXPENSE_ERROR',
      category: 'GIDER',
      level: 'ERROR',
      message: `Gider kaydedilirken hata oluştu: ${error?.message}`,
      details: { stack: error?.stack },
      req,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID gereklidir' }, { status: 400 });

    const success = await deleteExpense(id);

    await logAuditEvent({
      action: 'EXPENSE_DELETE',
      category: 'GIDER',
      level: 'WARN',
      message: `Gider kaydı silindi (ID: ${id})`,
      details: { expenseId: id, success },
      req,
    });

    return NextResponse.json({ success });
  } catch (error: any) {
    await logAuditEvent({
      action: 'EXPENSE_DELETE_ERROR',
      category: 'GIDER',
      level: 'ERROR',
      message: `Gider silinirken hata oluştu: ${error?.message}`,
      details: { stack: error?.stack },
      req,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
