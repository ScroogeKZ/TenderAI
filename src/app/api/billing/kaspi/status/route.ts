import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get('paymentId');

  if (!paymentId) {
    return NextResponse.json({ success: false, message: 'paymentId обязателен' }, { status: 400 });
  }

  // In production, queries Payment record from Prisma DB by externalTxId
  return NextResponse.json({
    success: true,
    paymentId,
    status: 'PENDING',
    amountKzt: 29900,
    plan: 'PRO',
  });
}
