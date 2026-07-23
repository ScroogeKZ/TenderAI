'use client';

import React, { useState, useEffect } from 'react';
import { DataSourceStatus } from '../lib/types/tender';
import { 
  Activity, 
  RefreshCw, 
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
  const [logs, setLogs] = useState<Array<{ id: string; time: string; source: string; status: string; msg: string }>>([]);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<{ totalTendersCount: number; aiTokens24h: number; maxAiTokensQuota: number }>({
    totalTendersCount: 24900,
    aiTokens24h: 148250,
    maxAiTokensQuota: 500000
  });

  useEffect(() => {
    // Fetch metrics from backend API
    fetch('/api/admin/metrics')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.metrics) {
          setMetrics({
            totalTendersCount: data.metrics.totalTendersCount,
            aiTokens24h: data.metrics.aiTokens24h,
            maxAiTokensQuota: data.metrics.maxAiTokensQuota
          });
          if (data.metrics.logs) {
            setLogs(data.metrics.logs);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleManualSync = async (source: DataSourceStatus) => {
    setSyncingId(source.id);
    onTriggerSync(source.id);

    try {
      // API-First call to server route handler
      const response = await fetch('/api/ingestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: source.name }),
      });
      const data = await response.json();

      if (data.success && data.result) {
        onAddNewTenders(data.result.tenders || []);
        setLogs(prev => [
          { 
            id: `l-${Date.now()}`, 
            time: new Date().toLocaleTimeString('ru-RU'), 
            source: source.name, 
            status: data.result.status, 
            msg: data.result.message 
          },
          ...prev
        ]);
      }
    } catch (err: any) {
      setLogs(prev => [
        { 
          id: `l-${Date.now()}`, 
          time: new Date().toLocaleTimeString('ru-RU'), 
          source: source.name, 
          status: 'ERROR', 
          msg: `Сбой выполнения: ${err?.message || 'Сетевая ошибка'}` 
        },
        ...prev
      ]);
    } finally {
      setSyncingId(null);
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
            <span className="text-base font-bold text-amber-400 font-mono">
              {metrics.aiTokens24h.toLocaleString('ru-RU')} / {metrics.maxAiTokensQuota.toLocaleString('ru-RU')}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Всего лотов в БД</span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              {metrics.totalTendersCount.toLocaleString('ru-RU')}
            </span>
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
                <span>Запустить синк</span>
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
