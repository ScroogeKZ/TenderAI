'use client';

import React, { useState } from 'react';
import { DataSourceStatus } from '../lib/types/tender';
import { GoszakupApiAdapter } from '../lib/ingestion/goszakup.adapter';
import { SamrukApiAdapter } from '../lib/ingestion/samruk.adapter';
import { 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Cpu, 
  Radio, 
  ShieldCheck,
  Clock
} from 'lucide-react';

interface AdminPanelProps {
  sources: DataSourceStatus[];
  onTriggerSync: (sourceId: string) => void;
  onAddNewTenders: (newTenders: any[]) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  sources,
  onTriggerSync,
  onAddNewTenders
}) => {
  const [logs, setLogs] = useState<Array<{ id: string; time: string; source: string; status: string; msg: string }>>([
    { id: 'l-1', time: '16:15:02', source: 'GOSZAKUP', status: 'SUCCESS', msg: 'Импортировано 14 новых объявлений по API' },
    { id: 'l-2', time: '16:00:10', source: 'SAMRUK_KAZYNA', status: 'SUCCESS', msg: 'Успешная дедупликация 8 лотов' },
    { id: 'l-3', time: '15:30:45', source: 'KAZATOMPROM', status: 'WARN', msg: 'Превышен rate-limit (429). Включен безопасный тайм-аут 60 сек.' }
  ]);

  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleManualSync = async (source: DataSourceStatus) => {
    setSyncingId(source.id);
    onTriggerSync(source.id);

    try {
      if (source.name === 'GOSZAKUP') {
        const adapter = new GoszakupApiAdapter();
        const res = await adapter.run();
        onAddNewTenders(res.tenders);
        setLogs(prev => [
          { id: `l-${Date.now()}`, time: new Date().toLocaleTimeString('ru-RU'), source: 'GOSZAKUP', status: 'SUCCESS', msg: `Ручная синхронизация: +${res.tenders.length} лот(ов)` },
          ...prev
        ]);
      } else if (source.name === 'SAMRUK_KAZYNA') {
        const adapter = new SamrukApiAdapter();
        const res = await adapter.run();
        onAddNewTenders(res.tenders);
        setLogs(prev => [
          { id: `l-${Date.now()}`, time: new Date().toLocaleTimeString('ru-RU'), source: 'SAMRUK_KAZYNA', status: 'SUCCESS', msg: `Ручная синхронизация: +${res.tenders.length} лот(ов)` },
          ...prev
        ]);
      }
    } finally {
      setTimeout(() => setSyncingId(null), 800);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Metrics Banner */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Activity className="w-6 h-6 text-blue-400" />
            <span>Административная панель и Здоровье коннекторов (Ingestion Monitoring)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Мониторинг фоновых задач парсинга, веб-сервисов ЕГСЗ РК, расхода ИИ-токенов и логов дедупликации.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">ИИ-Токены за 24ч</span>
            <span className="text-base font-bold text-amber-400 font-mono">148,250 / 500,000</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Всего лотов в БД</span>
            <span className="text-base font-bold text-emerald-400 font-mono">24,900</span>
          </div>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((src) => (
          <div key={src.id} className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
            
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    src.healthStatus === 'HEALTHY' ? 'bg-emerald-400 animate-pulse' :
                    src.healthStatus === 'DEGRADED' ? 'bg-amber-400' : 'bg-red-500'
                  }`} />
                  <h3 className="text-base font-bold text-slate-100">{src.displayName}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Тип адаптера: <span className="font-semibold text-slate-200">{src.adapterType === 'API' ? 'Официальный API' : 'Scraper Adapter'}</span> &bull; Интервал: {src.checkIntervalMins} мин
                </p>
              </div>

              <button
                onClick={() => handleManualSync(src)}
                disabled={syncingId === src.id}
                className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center space-x-1.5 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingId === src.id ? 'animate-spin' : ''}`} />
                <span>Синхронизировать</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Аптайм 24ч</span>
                <span className="font-bold text-emerald-400 font-mono">{src.successRate24h}%</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Импортировано</span>
                <span className="font-bold text-slate-200 font-mono">{src.totalIngested.toLocaleString('ru-RU')}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Статус</span>
                <span className="font-bold text-slate-300">{src.healthStatus}</span>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* System Logs Stream */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <span>Лог событий и алертов коннекторов</span>
        </h3>

        <div className="space-y-2 font-mono text-xs max-h-48 overflow-y-auto p-3 rounded-xl bg-slate-950 border border-slate-800">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center space-x-3 text-slate-300 border-b border-slate-900 pb-1.5">
              <span className="text-slate-500">[{log.time}]</span>
              <span className="text-blue-400 font-bold">[{log.source}]</span>
              <span className={log.status === 'SUCCESS' ? 'text-emerald-400' : 'text-amber-400'}>[{log.status}]</span>
              <span className="text-slate-200">{log.msg}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
