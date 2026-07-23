'use client';

import React, { useState } from 'react';
import { Tender } from '../lib/types/tender';
import { AIService } from '../lib/services/ai.service';
import { 
  X, 
  Building2, 
  MapPin, 
  Calendar, 
  ShieldAlert, 
  Sparkles, 
  FileText, 
  ExternalLink,
  Bot,
  Send,
  History,
  CheckCircle2,
  AlertTriangle,
  Download,
  ShieldCheck
} from 'lucide-react';

interface TenderDetailModalProps {
  tender: Tender | null;
  onClose: () => void;
  onAddToKanban: (tender: Tender) => void;
  isInKanban: boolean;
}

export const TenderDetailModal: React.FC<TenderDetailModalProps> = ({
  tender,
  onClose,
  onAddToKanban,
  isInKanban
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'rag' | 'audit'>('overview');
  
  const [ragMessages, setRagMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Здравствуйте! Я ИИ-ассистент TenderAI по данному лоту. Отвечаю исключительно по фактам из приложенной технической спецификации и параметров Заказчика.'
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');

  if (!tender) return null;

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim()) return;

    const userText = inputQuestion.trim();
    setRagMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInputQuestion('');

    setTimeout(() => {
      const aiReply = AIService.answerRAGQuestion(tender, userText);
      setRagMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-900/90">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${
                tender.source === 'GOSZAKUP' 
                  ? 'bg-blue-900/40 text-blue-300 border-blue-700/50' 
                  : 'bg-sky-900/40 text-sky-300 border-sky-700/50'
              }`}>
                {tender.source === 'GOSZAKUP' ? 'goszakup.gov.kz' : 'portal.sk.kz'}
              </span>
              <span className="text-xs text-slate-400 font-mono">№ {tender.externalId}</span>
              <span className="px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-300">
                {tender.procurementMethod === 'OPEN_TENDER' ? 'Открытый конкурс' : 'Запрос ценовых предложений'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 leading-snug">
              {tender.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 px-6 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Условия лота</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'ai'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>ИИ-Анализ & Риски</span>
          </button>

          <button
            onClick={() => setActiveTab('rag')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'rag'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4 text-sky-400" />
            <span>RAG-Чат по документации</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'audit'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4 text-emerald-400" />
            <span>История изменений ({tender.history.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Сумма лота (KZT)</p>
                  <p className="text-2xl font-bold text-emerald-400 font-mono">
                    {tender.amount.toLocaleString('ru-RU')} ₸
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Обеспечение заявки</p>
                  <p className="text-lg font-bold text-slate-200 font-mono">
                    {tender.applicationSecurityAmount?.toLocaleString('ru-RU')} ₸ ({tender.applicationSecurityPercent || 1}%)
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Дедлайн подачи</p>
                  <p className="text-base font-bold text-amber-400">
                    {new Date(tender.deadlineDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3">
                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                  Информация о заказчике
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-xs">Наименование:</span>
                    <span className="font-medium text-slate-100">{tender.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">БИН Заказчика:</span>
                    <span className="font-mono text-slate-200">{tender.customerBin}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Регион поставки:</span>
                    <span>{tender.region}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Категория / Отрасль:</span>
                    <span>{tender.category}</span>
                  </div>
                </div>
              </div>

              {tender.description && (
                <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-2">
                    Описание предмета закупки
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{tender.description}</p>
                </div>
              )}

              <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800">
                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">
                  Вложенная конкурсная документация ({tender.documents.length})
                </h3>
                <div className="space-y-2">
                  {tender.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-200">{doc.fileName}</p>
                          <p className="text-xs text-slate-400">{doc.fileSize || 'Файл документации'}</p>
                        </div>
                      </div>
                      <a
                        href={tender.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-blue-300 flex items-center space-x-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Скачать</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: AI & RISKS */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              
              <div className="p-5 rounded-2xl bg-blue-950/20 border border-blue-900/40 space-y-3">
                <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
                  <Sparkles className="w-5 h-5" />
                  <span>Автоматическое ИИ-резюме ТЗ</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {tender.aiSummary}
                </p>

                {tender.aiKeyRequirements && (
                  <div className="pt-3 border-t border-blue-900/40">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-2">
                      Главные критерии допуска:
                    </span>
                    <ul className="space-y-1.5 text-sm text-slate-300">
                      {tender.aiKeyRequirements.map((req, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                    Предварительная оценка рисков участия
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    tender.riskScore >= 60 ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                    tender.riskScore >= 30 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    Индекс риска: {tender.riskScore}/100
                  </span>
                </div>

                {tender.riskFlags.length === 0 ? (
                  <p className="text-sm text-emerald-400 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Критичеcких системных рисков по данному лоту не обнаружено.</span>
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tender.riskFlags.map((flag) => (
                      <div key={flag.id} className="p-4 rounded-xl bg-slate-900 border border-amber-900/40 flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-amber-300">{flag.title}</h4>
                          <p className="text-xs text-slate-300 mt-1">{flag.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-[11px] text-slate-400 italic pt-2">
                  * Оценка рисков является справочным сигналом ИИ-алгоритма TenderAI и не представляет собой юридическое заключение.
                </p>
              </div>

            </div>
          )}

          {/* TAB 3: RAG CHAT (Strictly Document Grounded) */}
          {activeTab === 'rag' && (
            <div className="flex flex-col h-[400px] bg-slate-950/60 rounded-2xl border border-slate-800 overflow-hidden">
              
              <div className="px-4 py-2 bg-amber-950/40 border-b border-amber-900/40 text-[11px] text-amber-300 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Ответы формируются исключительно по загруженной конкурсной документации без вымысла юридических деталей.</span>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {ragMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start space-x-2.5 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-sky-400" />
                      </div>
                    )}

                    <div className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[80%] ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none space-y-1.5'
                    }`}>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendQuestion} className="p-3 border-t border-slate-800 bg-slate-900 flex items-center space-x-2">
                <input
                  type="text"
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  placeholder="Задайте вопрос по ТЗ, обеспечению или дедлайну..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          )}

          {/* TAB 4: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2">
                История изменений параметров лота (Audit Trail)
              </h3>

              {tender.history.length === 0 ? (
                <p className="text-xs text-slate-400">Изменений условий или сроков по данному лоту с момента импорта не зафиксировано.</p>
              ) : (
                <div className="space-y-3">
                  {tender.history.map((item) => (
                    <div key={item.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-blue-400">{item.field}:</span>{' '}
                        <span className="line-through text-slate-400">{item.oldValue || '—'}</span> &rarr;{' '}
                        <span className="text-emerald-400 font-bold">{item.newValue}</span>
                      </div>
                      <div className="text-right text-[11px] text-slate-400">
                        <span>{item.changedBy}</span> &bull; {new Date(item.timestamp).toLocaleString('ru-RU')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <a
            href={tender.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1.5"
          >
            <span>Перейти к первоисточнику ({tender.source})</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Закрыть
            </button>

            <button
              onClick={() => {
                onAddToKanban(tender);
                onClose();
              }}
              disabled={isInKanban}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              {isInKanban ? 'Уже в вашей воронке' : 'Взять лот в работу'}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
