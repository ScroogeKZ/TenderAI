'use client';

import React from 'react';
import { KanbanItem, KanbanStage } from '../lib/types/tender';
import { 
  Trash2, 
  CheckCircle, 
  Clock, 
  Send, 
  Trophy, 
  XCircle,
  UserCheck
} from 'lucide-react';

interface KanbanBoardProps {
  items: KanbanItem[];
  onUpdateStage: (itemId: string, newStage: KanbanStage) => void;
  onRemoveItem: (itemId: string) => void;
  onOpenTenderDetails: (tender: any) => void;
}

const STAGES: Array<{ id: KanbanStage; title: string; color: string; icon: any }> = [
  { id: 'UNDER_REVIEW', title: 'На рассмотрении', color: 'border-slate-700 bg-slate-900/50 text-slate-300', icon: Clock },
  { id: 'PREPARING_BID', title: 'Готовим заявку', color: 'border-blue-700/60 bg-blue-950/20 text-blue-300', icon: Send },
  { id: 'SUBMITTED', title: 'Подано в портал', color: 'border-amber-700/60 bg-amber-950/20 text-amber-300', icon: CheckCircle },
  { id: 'WON', title: 'Выиграли лот 🏆', color: 'border-emerald-700/60 bg-emerald-950/20 text-emerald-300', icon: Trophy },
  { id: 'LOST', title: 'Проиграли / Отклонено', color: 'border-rose-700/60 bg-rose-950/20 text-rose-300', icon: XCircle },
];

const TEAM_MEMBERS = [
  'Не назначен',
  'Серик А. (Главный тендерщик)',
  'Гульнара К. (Юрист)',
  'Дмитрий В. (Снабжение)',
  'Айдар Т. (Аналитик)'
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  items,
  onUpdateStage,
  onRemoveItem,
  onOpenTenderDetails
}) => {
  const totalPipelineAmount = items.reduce((acc, item) => acc + item.tender.amount, 0);
  const wonAmount = items.filter(i => i.stage === 'WON').reduce((acc, item) => acc + item.tender.amount, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Pipeline Summary Banner */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Командная воронка тендеров</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Отслеживание этапов подготовки заявок, назначения ответственных и учет результатов в KZT.
          </p>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Вся воронка ({items.length} лотов):</span>
            <span className="text-lg font-bold text-blue-400 font-mono">
              {totalPipelineAmount.toLocaleString('ru-RU')} ₸
            </span>
          </div>

          <div className="text-right border-l border-slate-800 pl-6">
            <span className="text-xs text-slate-400 block">Выиграно в портфеле:</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">
              {wonAmount.toLocaleString('ru-RU')} ₸
            </span>
          </div>
        </div>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {STAGES.map((stage) => {
          const stageItems = items.filter(item => item.stage === stage.id);
          const StageIcon = stage.icon;
          const stageTotal = stageItems.reduce((acc, i) => acc + i.tender.amount, 0);

          return (
            <div key={stage.id} className="flex flex-col rounded-2xl bg-slate-950/50 border border-slate-800/80 p-3 min-h-[500px]">
              
              {/* Column Header */}
              <div className={`p-3 rounded-xl border mb-3 flex items-center justify-between ${stage.color}`}>
                <div className="flex items-center space-x-2">
                  <StageIcon className="w-4 h-4" />
                  <span className="text-xs font-bold">{stage.title}</span>
                </div>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-900/80 border border-slate-800">
                  {stageItems.length}
                </span>
              </div>

              <p className="text-[11px] font-mono text-slate-500 mb-3 px-1">
                {stageTotal > 0 ? `${stageTotal.toLocaleString('ru-RU')} ₸` : '0 ₸'}
              </p>

              {/* Items List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageItems.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5 relative group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.tender.source === 'GOSZAKUP' ? 'ГОС' : 'СК'} #{item.tender.externalId}
                      </span>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1"
                        title="Удалить из воронки"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 
                      onClick={() => onOpenTenderDetails(item.tender)}
                      className="text-xs font-semibold text-slate-100 hover:text-blue-400 cursor-pointer transition-colors line-clamp-2"
                    >
                      {item.tender.title}
                    </h4>

                    <div className="text-[11px] font-bold text-emerald-400 font-mono">
                      {item.tender.amount.toLocaleString('ru-RU')} ₸
                    </div>

                    {/* Interactive Team Member Assignee Selector */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 flex items-center space-x-1">
                          <UserCheck className="w-3 h-3 text-blue-400" />
                          <span>Ответственный:</span>
                        </span>

                        <select
                          value={item.assignee || 'Не назначен'}
                          onChange={(e) => {
                            item.assignee = e.target.value;
                          }}
                          className="bg-slate-950 text-slate-300 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] focus:outline-none max-w-[120px] truncate"
                        >
                          {TEAM_MEMBERS.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>

                      {/* Stage Switcher */}
                      <div className="flex items-center justify-between text-[10px] pt-1">
                        <span className="text-slate-400">Этап:</span>
                        <select
                          value={item.stage}
                          onChange={(e) => onUpdateStage(item.id, e.target.value as KanbanStage)}
                          className="bg-slate-950 text-slate-300 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
                        >
                          {STAGES.map(s => (
                            <option key={s.id} value={s.id}>{s.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
