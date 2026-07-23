import { Tender } from '../types/tender';

export interface TelegramAlertLog {
  id: string;
  chatId: string;
  tenderId: string;
  tenderTitle: string;
  amountKzt: number;
  sentAt: string;
  status: 'DELIVERED' | 'FAILED';
}

export class TelegramBotService {
  private static mockLogs: TelegramAlertLog[] = [
    {
      id: 'tg-1',
      chatId: '@tenderai_kz_bot',
      tenderId: 't-101',
      tenderTitle: 'Поставка серверного оборудования в г. Астана',
      amountKzt: 48500000,
      sentAt: '2026-07-23T15:45:00Z',
      status: 'DELIVERED'
    },
    {
      id: 'tg-2',
      chatId: '@tenderai_kz_bot',
      tenderId: 't-103',
      tenderTitle: 'Разработка приложения Smart Almaty',
      amountKzt: 19800000,
      sentAt: '2026-07-23T14:10:00Z',
      status: 'DELIVERED'
    }
  ];

  static getLogs(): TelegramAlertLog[] {
    return this.mockLogs;
  }

  static sendNotification(tender: Tender, chatId: string = '@company_tender_team'): TelegramAlertLog {
    const log: TelegramAlertLog = {
      id: `tg-${Date.now()}`,
      chatId,
      tenderId: tender.id,
      tenderTitle: tender.title,
      amountKzt: tender.amount,
      sentAt: new Date().toISOString(),
      status: 'DELIVERED'
    };
    this.mockLogs.unshift(log);
    return log;
  }

  static formatTenderMessage(tender: Tender): string {
    return `⚡ <b>Новый релевантный лот РК!</b>\n\n` +
      `<b>📌 Наименование:</b> ${tender.title}\n` +
      `<b>🏢 Заказчик:</b> ${tender.customerName} (БИН: ${tender.customerBin})\n` +
      `<b>💰 Сумма:</b> ${tender.amount.toLocaleString('ru-RU')} KZT\n` +
      `<b>📍 Регион:</b> ${tender.region}\n` +
      `<b>⏳ Дедлайн:</b> ${new Date(tender.deadlineDate).toLocaleDateString('ru-RU')}\n\n` +
      `🤖 <b>ИИ-Суммаризация:</b> ${tender.aiSummary}\n\n` +
      `🔗 <a href="${tender.sourceUrl}">Открыть на источние (${tender.source})</a>`;
  }
}
