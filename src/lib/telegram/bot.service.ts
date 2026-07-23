import { Tender } from '../types/tender';

export class TelegrafBotService {
  private static botUsername = process.env.TELEGRAM_BOT_USERNAME || 'TenderAI_KZ_bot';

  /**
   * Generate user-specific Telegram Deep Link for automatic account linking
   */
  static generateDeepLink(userId: string): string {
    return `https://t.me/${this.botUsername}?start=link_${userId}`;
  }

  /**
   * Process incoming bot commands (/start, /search, /profile, /digest)
   */
  static handleBotCommand(command: string, args: string[], userContext: any): string {
    const cmd = command.toLowerCase();

    if (cmd === '/start') {
      return `🤖 <b>TenderAI Казахстан (Bot v1.0)</b>\n\n` +
        `Приветствуем! Ваш Telegram аккаунт успешно привязан к системе.\n` +
        `Вы будете получать мгновенные уведомления по новым тендерам ЕГСЗ РК и Самрук-Казына.\n\n` +
        `<b>Доступные команды:</b>\n` +
        `/search [запрос] — Семантический поиск тендеров\n` +
        `/digest — Получить горячий дайджест за сегодня\n` +
        `/profile — Проверить настройки профиля деятельности`;
    }

    if (cmd === '/search') {
      const query = args.join(' ');
      if (!query) {
        return `⚠️ Пожалуйста, укажите поисковый запрос. Пример:\n<code>/search поставка серверов в Астане до 50 млн</code>`;
      }
      return `🔍 <b>Результаты поиска по запросу "${query}":</b>\n\n` +
        `1. <b>Поставка серверного оборудования Акимата г. Астана</b>\n` +
        `   💰 Сумма: 48,500,000 ₸ | 📍 Астана | ⏳ Дедлайн: 05.08.2026\n` +
        `   🔗 goszakup.gov.kz/ru/announce/index/987123\n\n` +
        `2. <b>ПО и лицензии графического дизайна</b>\n` +
        `   💰 Сумма: 12,400,000 ₸ | 📍 Астана | ⏳ Дедлайн: 07.08.2026`;
    }

    if (cmd === '/digest') {
      return `📊 <b>Дайджест горячих лотов РК (за сегодня):</b>\n\n` +
        `• <b>ГОСЗААКУПКИ</b>: 14 новых лотов на сумму 182.4 млн ₸\n` +
        `• <b>САМРУК-КАЗЫНА</b>: 8 новых лотов на сумму 420.0 млн ₸\n\n` +
        `⚡ Откройте личный кабинет TenderAI для добавления лотов в командную воронку.`;
    }

    return `❓ Неизвестная команда. Введите /start для списка команд.`;
  }
}
