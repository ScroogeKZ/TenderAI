'use client';

import React, { useState } from 'react';
import { Tender } from '../lib/types/tender';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  ShieldAlert, 
  Sparkles, 
  FileText, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Check,
  Send
} from 'lucide-react';

interface TenderCardProps {
  tender: Tender;
  onOpenDetails: (tender: Tender) => void;
  onAddToKanban: (tender: Tender) => void;
  onSendToTelegram: (tender: Tender) => void;
  isInKanban: boolean;
  language: 'RU' | 'KK';
}

export const TenderCard: React.FC<TenderCardProps> = ({
  tender,
  onOpenDetails,
  onAddToKanban,
  onSendToTelegram,
  isInKanban,
  language
}) => {
  const [showSummary, setShowSummary] = useState(false);

  // Format currency
  const formattedAmount = tender.amount.toLocaleString('ru-RU');
  
  // Calculate remaining days
  const daysLeft = Math.ceil(
    (new Date(tender.deadlineDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
  );

  // Risk Badge Color
  const getRiskBadge = (score: number) => {
    if (score >= 60) return { bg: 'bg-red-500/10 text-red-400 border-red-500/30', label: 'Высокий риск' };
    if (score >= 30) return { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30', label: 'Средний риск' };
    return { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', label: 'Низкий риск' };
  };

  const risk = getRiskBadge(tender.riskScore);

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between relative group">
      
      {/* Top Source Badge & Match percentage */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${
              tender.source === 'GOSZAKUP' 
                ? 'bg-blue-900/40 text-blue-300 border-blue-700/50' 
                : 'bg-sky-900/40 text-sky-300 border-sky-700/50'
            }`}>
              {tender.source === 'GOSZAKUP' ? 'goszakup.gov.kz' : 'portal.sk.kz'}
            </span>
            
            <span className="text-xs text-slate-400 font-mono">
              № {tender.externalId}
            </span>
          </div>

          {/* Match Badge if available */}
          {tender.matchPercentage !== undefined && (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-kzblue-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Матчинг: {tender.matchPercentage}%</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 
          onClick={() => onOpenDetails(tender)}
          className="text-base font-semibold text-slate-100 hover:text-blue-400 cursor-pointer transition-colors line-clamp-2 mb-3 leading-snug"
        >
          {tender.title}
        </h3>

        {/* Customer & Region info */}
        <div className="space-y-1.5 text-xs text-slate-300 mb-4">
          <div className="flex items-start space-x-2">
            <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <span className="line-clamp-1">{tender.customerName}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>{tender.region}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span className={daysLeft <= 3 ? 'text-amber-400 font-semibold' : ''}>
                {daysLeft > 0 ? `Осталось ${daysLeft} дн.` : 'Завершен'}
              </span>
            </div>
          </div>
        </div>

        {/* Budget & Security */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Сумма лота</p>
            <p className="text-lg font-bold text-emerald-400 font-mono">
              {formattedAmount} ₸
            </p>
          </div>
          {tender.applicationSecurityAmount && (
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Обеспечение</p>
              <p className="text-xs font-semibold text-slate-300 font-mono">
                {tender.applicationSecurityAmount.toLocaleString('ru-RU')} ₸ ({tender.applicationSecurityPercent || 1}%)
              </p>
            </div>
          )}
        </div>

        {/* AI Summary Drawer Toggle */}
        {tender.aiSummary && (
          <div className="mb-4">
            <button
              onClick={() => setShowSummary(!showSummary)}
              className="flex items-center justify-between w-full text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-950/30 hover:bg-blue-950/50 p-2 rounded-lg border border-blue-900/40 transition-all"
            >
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>ИИ-Суммаризация ТЗ</span>
              </div>
              {showSummary ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showSummary && (
              <div className="mt-2 p-3 rounded-xl bg-blue-950/20 border border-blue-900/30 text-xs text-slate-300 space-y-2 leading-relaxed animate-fadeIn">
                <p>{tender.aiSummary}</p>
                {tender.aiKeyRequirements && tender.aiKeyRequirements.length > 0 && (
                  <div className="pt-1 border-t border-blue-900/40">
                    <span className="font-semibold text-amber-300 block mb-1">Ключевые требования:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                      {tender.aiKeyRequirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer & Risk Indicator & Action Buttons */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        
        {/* Risk Badge */}
        <div className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center space-x-1.5 ${risk.bg}`}>
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{risk.label} ({tender.riskScore}%)</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-1.5">
          
          <button
            onClick={() => onSendToTelegram(tender)}
            title="Отправить в Telegram"
            className="p-2 rounded-lg bg-sky-950/40 hover:bg-sky-900/60 border border-sky-800/50 text-sky-300 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>

          <button
            onClick={() => onAddToKanban(tender)}
            disabled={isInKanban}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              isInKanban 
                ? 'bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 cursor-default'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
            }`}
          >
            {isInKanban ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>В воронке</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-3.5 h-3.5" />
                <span>В работу</span>
              </>
            )}
          </button>

        </div>
      </div>

    </div>
  );
};
