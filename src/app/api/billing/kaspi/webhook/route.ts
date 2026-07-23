import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { txnId, amountKzt, planId, status, customerBin } = body;

    if (status === 'SUCCESS') {
      // Log successful transaction
      console.log(`[Kaspi Pay Webhook] Успешная оплата подписки ${planId} на сумму ${amountKzt} KZT для БИН: ${customerBin}`);

      return NextResponse.json({
        success: true,
        message: 'Подписка успешно активирована',
        activeUntil: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      });
    }

    return NextResponse.json({ success: false, message: 'Статус платежа не подтвержден' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Ошибка обработки webhook' }, { status: 500 });
  }
}
