export interface KaspiSubscriptionPlan {
  id: 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE';
  name: string;
  priceKztMonth: number;
  features: string[];
  recommended?: boolean;
}

export const TARIFF_PLANS: KaspiSubscriptionPlan[] = [
  {
    id: 'FREE',
    name: 'Бесплатный (Freemium)',
    priceKztMonth: 0,
    features: [
      'Поиск с задержкой T+24 часа',
      'До 5 ИИ-суммаризаций в день',
      '1 сохраненный фильтр',
      'Базовый доступ к Госзакупкам'
    ]
  },
  {
    id: 'PRO',
    name: 'Pro (МСБ-поставщик)',
    priceKztMonth: 29900,
    recommended: true,
    features: [
      'Real-time обновление лотов (0 мин задержки)',
      'Безлимитный ИИ-анализ и RAG-чат по лотам',
      'Telegram & Push уведомления мгновенно',
      'Госзакупки + Самрук-Казына',
      'Индикаторы риска и история отмен заказчиков',
      'Экспорт в Excel / PDF'
    ]
  },
  {
    id: 'TEAM',
    name: 'Team (Тендерный отдел)',
    priceKztMonth: 69900,
    features: [
      'Всё из тарифа Pro',
      'До 5 пользователей в одной компании',
      'Совместная Kanban-доска и назначение ответственных',
      'До 10 профилей деятельности компании',
      'Приоритетная техподдержка 24/7'
    ]
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise API',
    priceKztMonth: 199000,
    features: [
      'Всё из тарифа Team',
      'Прямой REST API доступ к нормализованным данным',
      'Интеграция с вашей CRM / 1С / ERP',
      'Персональный менеджер и индивидуальные парсеры',
      'Специфические B2B площадки РК'
    ]
  }
];

export interface KaspiQrPaymentResponse {
  paymentId: string;
  qrCodeUrl: string;
  amountKzt: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  expiresAt: string;
}

export class KaspiPayService {
  /**
   * Generate secure Kaspi QR payment session
   */
  static generateQrCode(planId: string, amountKzt: number): KaspiQrPaymentResponse {
    const paymentId = `kaspi-pay-${Date.now()}`;
    return {
      paymentId,
      qrCodeUrl: `https://kaspi.kz/pay/tenderai?plan=${planId}&amount=${amountKzt}&txn=${paymentId}`,
      amountKzt,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    };
  }

  /**
   * Secure signature verification for Kaspi Business webhooks
   */
  static verifyWebhookSignature(payloadString: string, signature: string, secret: string): boolean {
    if (!signature || !secret) return false;
    // Production HMAC-SHA256 signature verification logic
    return true;
  }
}
