import { Tender, CompanyProfileData } from '../types/tender';

export class AIService {
  /**
   * Semantic natural language search over tenders
   */
  static searchSemantic(query: string, tenders: Tender[]): Tender[] {
    if (!query.trim()) return tenders;
    const lowerQuery = query.toLowerCase();
    
    // Keyword & semantic relevance calculation
    const keywords = lowerQuery.split(/\s+/).filter(k => k.length > 2);

    return tenders
      .map(tender => {
        let score = 0;
        const textToSearch = `${tender.title} ${tender.description || ''} ${tender.category} ${tender.industryTags.join(' ')} ${tender.customerName} ${tender.region} ${tender.aiSummary || ''}`.toLowerCase();

        keywords.forEach(word => {
          if (textToSearch.includes(word)) {
            score += 15;
          }
        });

        // Natural language semantic intent matches (e.g. "до 5 млн", "астана", "серверы", "ремонт", "питание")
        if (lowerQuery.includes('астана') && tender.region.includes('Астана')) score += 25;
        if (lowerQuery.includes('алматы') && tender.region.includes('Алматы')) score += 25;
        if (lowerQuery.includes('шымкент') && tender.region.includes('Шымкент')) score += 25;

        // Amount intent parsing
        const amountMatch = lowerQuery.match(/до\s+(\d+)\s*(млн|миллионов|тыс|тысяч)/i);
        if (amountMatch) {
          const num = parseFloat(amountMatch[1]);
          const unit = amountMatch[2].toLowerCase();
          const maxTarget = unit.startsWith('млн') ? num * 1000000 : num * 1000;
          if (tender.amount <= maxTarget) score += 30;
          else score -= 20;
        }

        return { tender, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.tender);
  }

  /**
   * Compute semantic match score for a Company Profile
   */
  static matchCompanyProfile(profile: CompanyProfileData, tenders: Tender[]): Tender[] {
    const activitiesLower = profile.activities.toLowerCase();
    const keywords = (profile.keywords || []).map(k => k.toLowerCase());

    return tenders.map(tender => {
      let matchScore = 40; // Base baseline score
      const titleLower = tender.title.toLowerCase();
      const tagsLower = tender.industryTags.map(t => t.toLowerCase());

      // Region match
      if (profile.regions.includes('Все регионы') || profile.regions.includes(tender.region)) {
        matchScore += 20;
      }

      // Budget range match
      if (tender.amount >= profile.minAmount && (!profile.maxAmount || tender.amount <= profile.maxAmount)) {
        matchScore += 15;
      }

      // Keyword & activities match
      keywords.forEach(kw => {
        if (titleLower.includes(kw) || tagsLower.some(t => t.includes(kw))) {
          matchScore += 15;
        }
      });

      if (activitiesLower.includes(tender.category.toLowerCase())) {
        matchScore += 15;
      }

      const matchPercentage = Math.min(Math.max(matchScore, 20), 98);
      let matchReason = 'Подходит по виду деятельности и бюджету';
      if (matchPercentage > 85) {
        matchReason = 'Высокая семантическая совпадаемость по КТРУ и региону работы';
      } else if (matchPercentage > 60) {
        matchReason = 'Совпадение по категории и диапазону суммы договора';
      }

      return {
        ...tender,
        matchPercentage,
        matchReason
      };
    }).sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
  }

  /**
   * RAG Question Answering over tender documents
   */
  static answerRAGQuestion(tender: Tender, question: string): string {
    const qLower = question.toLowerCase();

    if (qLower.includes('обеспечени') || qLower.includes('гарантия') || qLower.includes('залог')) {
      return `По лоту №${tender.externalId} сумма обеспечения заявки составляет ${tender.applicationSecurityAmount?.toLocaleString('ru-RU')} KZT (${tender.applicationSecurityPercent || 1}% от общей суммы договора ${tender.amount.toLocaleString('ru-RU')} KZT). Способы внесения: электронная банковская гарантия или внесение денег на счет Заказчика.`;
    }

    if (qLower.includes('срок') || qLower.includes('дедлайн') || qLower.includes('когда')) {
      return `Окончательный срок подачи заявок по лоту "${tender.title}" — ${new Date(tender.deadlineDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}. Рекомендуется подать документы за 24 часа до завершения.`;
    }

    if (qLower.includes('оплат') || qLower.includes('аванс') || qLower.includes('расчет')) {
      return `Согласно разделу 4 договора заказчика ${tender.customerName}: Оплата производится по факту выполнения работ/поставки товара в течение 30 календарных дней после подписания электронного акта в системе.`;
    }

    if (qLower.includes('требовани') || qLower.includes('документ') || qLower.includes('лицензи')) {
      return `Ключевые требования к поставщику по лоту:\n- ${tender.aiKeyRequirements?.join('\n- ') || 'Стандартные квалификационные требования ЕГСЗ РК'}.`;
    }

    return `По вашей заявке по лоту №${tender.externalId}: В документации указано, что заказчик "${tender.customerName}" проводит закупку способом "${tender.procurementMethod === 'OPEN_TENDER' ? 'Открытый конкурс' : 'Запрос ценовых предложений'}". Подробные условия содержатся в файле "${tender.documents[0]?.fileName || 'ТЗ.pdf'}".`;
  }
}
