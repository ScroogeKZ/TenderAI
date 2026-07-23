import { BaseTenderAdapter } from './base.adapter';
import { Tender, SourceType, AdapterType } from '../types/tender';

export class GoszakupApiAdapter extends BaseTenderAdapter {
  protected sourceType: SourceType = 'GOSZAKUP';
  protected adapterType: AdapterType = 'API';

  async fetchRawData(): Promise<any[]> {
    // Симуляция обращения к API ЕГСЗ (goszakup.gov.kz/api/v3/graphql или REST)
    return [
      {
        id: 987150,
        number_anno: '987150-2026',
        name_ru: 'Поставка лицензий программного обеспечения графического дизайна для колледжей г. Астана',
        customer_name_ru: 'КГУ "Колледж общественного питания и сервиса" Акимата города Астана',
        customer_bin: '050240003412',
        total_sum: 12400000.0,
        region_ru: 'г. Астана',
        publish_date: '2026-07-23T10:00:00Z',
        end_date: '2026-08-07T18:00:00Z',
        security_sum: 372000.0,
        trade_buy_name_ru: 'Открытый конкурс',
        ref_buy_status_id: 'PUBLISHED',
      }
    ];
  }

  normalize(rawData: any[]): Tender[] {
    return rawData.map((raw) => ({
      id: `gos-${raw.id}`,
      source: 'GOSZAKUP',
      externalId: raw.number_anno,
      title: raw.name_ru,
      description: 'Автоматически импортировано из веб-сервисов ЕГСЗ goszakup.gov.kz.',
      customerName: raw.customer_name_ru,
      customerBin: raw.customer_bin,
      category: 'ИТ и ПО',
      industryTags: ['ПО', 'Лицензии', 'Образование'],
      procurementMethod: 'OPEN_TENDER',
      amount: raw.total_sum,
      currency: 'KZT',
      region: raw.region_ru,
      publishDate: raw.publish_date,
      deadlineDate: raw.end_date,
      applicationSecurityAmount: raw.security_sum,
      applicationSecurityPercent: 3,
      status: 'ACTIVE',
      sourceUrl: `https://goszakup.gov.kz/ru/announce/index/${raw.id}`,
      aiSummary: 'Лот на закупку лицензий ПО для учебных заведений Астаны. Включает техническую поддержку 12 месяцев.',
      aiKeyRequirements: ['Наличие статуса официального партнера разработчика ПО', 'Сертификат соответствия'],
      riskScore: 10,
      riskFlags: [],
      documents: [
        { id: `doc-${raw.id}-1`, fileName: 'ТЗ_Лицензии_ПО.pdf', fileUrl: '/docs/tz_software.pdf', fileSize: '1.1 MB', fileType: 'pdf' }
      ],
      history: [
        { id: `audit-${raw.id}-1`, changedBy: 'Goszakup API Adapter', field: 'status', oldValue: 'NEW', newValue: 'PUBLISHED', timestamp: new Date().toISOString() }
      ]
    }));
  }
}
