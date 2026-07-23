import { BaseTenderAdapter } from './base.adapter';
import { Tender, SourceType, AdapterType } from '../types/tender';

export class SamrukApiAdapter extends BaseTenderAdapter {
  protected sourceType: SourceType = 'SAMRUK_KAZYNA';
  protected adapterType: AdapterType = 'API';

  async fetchRawData(): Promise<any[]> {
    // Симуляция обращения к API Самрук-Казына (portal.sk.kz)
    return [
      {
        advertId: 99120,
        advertNumber: 'SK-2026-99120',
        titleRu: 'Услуги по автотранспортному обслуживанию и аренде спецтехники в Павлодарской области',
        organizerRu: 'АО "Павлодарэнерго"',
        organizerBin: '990340000122',
        sum: 67000000.0,
        regionNameRu: 'Павлодарская область',
        publishDate: '2026-07-23T11:30:00Z',
        endDate: '2026-08-11T16:00:00Z',
        guaranteeAmount: 670000.0,
      }
    ];
  }

  normalize(rawData: any[]): Tender[] {
    return rawData.map((raw) => ({
      id: `sk-${raw.advertId}`,
      source: 'SAMRUK_KAZYNA',
      externalId: raw.advertNumber,
      title: raw.titleRu,
      description: 'Импортировано из портала закупок АО ФНБ "Самрук-Казына" (portal.sk.kz).',
      customerName: raw.organizerRu,
      customerBin: raw.organizerBin,
      category: 'Транспорт и Логистика',
      industryTags: ['Аренда авто', 'Спецтехника', 'Энергетика'],
      procurementMethod: 'OPEN_TENDER',
      amount: raw.sum,
      currency: 'KZT',
      region: raw.regionNameRu,
      publishDate: raw.publish_date || raw.publishDate,
      deadlineDate: raw.endDate,
      applicationSecurityAmount: raw.guaranteeAmount,
      applicationSecurityPercent: 1,
      status: 'ACTIVE',
      sourceUrl: `https://portal.sk.kz/tender/${raw.advertId}`,
      aiSummary: 'Аренда спецтехники и транспортное обслуживание в Павлодаре. Необходим парк авто не старше 2020 года.',
      aiKeyRequirements: ['Наличие собственного автопарка спецтехники', 'Страхование ГПО'],
      riskScore: 30,
      riskFlags: [
        {
          id: `rf-sk-${raw.advertId}`,
          code: 'FLEET_AGE_RESTRICTION',
          severity: 'MEDIUM',
          title: 'Ограничение по возрасту техники',
          description: 'Год выпуска техники не ранее 2020 г. Проверьте свой баланс перед подачей.'
        }
      ],
      documents: [
        { id: `doc-sk-${raw.advertId}`, fileName: 'Требования_к_технике_Павлодар.pdf', fileUrl: '/docs/fleet_req.pdf', fileSize: '2.0 MB', fileType: 'pdf' }
      ],
      history: []
    }));
  }
}
