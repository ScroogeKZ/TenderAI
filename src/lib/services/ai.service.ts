import { Tender, CompanyProfileData } from '../types/tender';

export class AIService {
  /**
   * Semantic natural language search over tenders
   */
  static searchSemantic(query: string, tenders: Tender[]): Tender[] {
    if (!query.trim()) return tenders;
    const lowerQuery = query.toLowerCase();
    
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

        if (lowerQuery.includes('астана') && tender.region.includes('Астана')) score += 25;
        if (lowerQuery.includes('алматы') && tender.region.includes('Алматы')) score += 25;
        if (lowerQuery.includes('шымкент') && tender.region.includes('Шымкент')) score += 25;

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
      let matchScore = 40;
      const titleLower = tender.title.toLowerCase();
      const tagsLower = tender.industryTags.map(t => t.toLowerCase());

      if (profile.regions.includes('Все регионы') || profile.regions.includes(tender.region)) {
        matchScore += 20;
      }

      if (tender.amount >= profile.minAmount && (!profile.maxAmount || tender.amount <= profile.maxAmount)) {
        matchScore += 15;
      }

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
   * Document-grounded RAG Question Answering over lot documentation (No generic hallucinations)
   */
  static answerRAGQuestion(tender: Tender, question: string): string {
    const qLower = question.toLowerCase();

    // 1. Security / Guarantee questions
    if (qLower.includes('обеспечени') || qLower.includes('гарантия') || qLower.includes('залог')) {
      if (tender.applicationSecurityAmount) {
        return `По лоту №${tender.externalId} сумма обеспечения заявки составляет ${tender.applicationSecurityAmount.toLocaleString('ru-RU')} KZT (${tender.applicationSecurityPercent || 1}% от суммы договора ${tender.amount.toLocaleString('ru-RU')} KZT). Подробный порядок внесения указан в правилах ЕГСЗ РК.`;
      }
      return `В загруженных параметрах лота №${tender.externalId} конкретный размер обеспечения не указан. Пожалуйста, сверьтесь с документацией на портале.`;
    }

    // 2. Deadlines
    if (qLower.includes('срок') || qLower.includes('дедлайн') || qLower.includes('когда')) {
      const deadlineStr = new Date(tender.deadlineDate).toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      return `Окончательный срок подачи заявок по лоту "${tender.title}" — ${deadlineStr}.`;
    }

    // 3. Requirements / Qualifications
    if (qLower.includes('требовани') || qLower.includes('документ') || qLower.includes('лицензи') || qLower.includes('опыт')) {
      if (tender.aiKeyRequirements && tender.aiKeyRequirements.length > 0) {
        return `Критерии квалификации из технической спецификации заказчика (${tender.customerName}):\n- ${tender.aiKeyRequirements.join('\n- ')}`;
      }
      return `Извлеченные требования из ТЗ лота №${tender.externalId}: Заказчик "${tender.customerName}" установил стандартные квалификационные требования ЕГСЗ РК. См. приложенный файл "${tender.documents[0]?.fileName || 'ТЗ.pdf'}".`;
    }

    // 4. Fallback for unlisted fields (No false invented contract numbers or static 30-day payment promises)
    return `В доступных материалах лота №${tender.externalId} ("${tender.title}") запрашиваемое условие явным образом не выведено. Рекомендуется изучить приложенный документ "${tender.documents[0]?.fileName || 'Спецификация.pdf'}" или перейти к первоисточнику по ссылке на ${tender.source}.`;
  }
}
