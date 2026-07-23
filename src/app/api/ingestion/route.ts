import { NextRequest, NextResponse } from 'next/server';
import { GoszakupApiAdapter } from '@/lib/ingestion/goszakup.adapter';
import { SamrukApiAdapter } from '@/lib/ingestion/samruk.adapter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source } = body;

    let result;
    if (source === 'GOSZAKUP') {
      const adapter = new GoszakupApiAdapter();
      result = await adapter.run();
    } else if (source === 'SAMRUK_KAZYNA') {
      const adapter = new SamrukApiAdapter();
      result = await adapter.run();
    } else {
      return NextResponse.json({ success: false, message: 'Неизвестный источник' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Сбой выполнения' }, { status: 500 });
  }
}
