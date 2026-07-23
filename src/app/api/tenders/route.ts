import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_TENDERS } from '@/lib/mockData';
import { AIService } from '@/lib/services/ai.service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const region = searchParams.get('region') || 'Все регионы';
  const category = searchParams.get('category') || 'Все категории';
  const source = searchParams.get('source') || 'ALL';

  let list = INITIAL_TENDERS;

  if (q.trim()) {
    list = AIService.searchSemantic(q, list);
  }

  if (region !== 'Все регионы') {
    list = list.filter(t => t.region === region);
  }

  if (category !== 'Все категории') {
    list = list.filter(t => t.category === category);
  }

  if (source !== 'ALL') {
    list = list.filter(t => t.source === source);
  }

  return NextResponse.json({
    success: true,
    total: list.length,
    tenders: list,
  });
}
