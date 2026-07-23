'use client';

import React from 'react';
import { 
  Search, 
  Kanban, 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  Send, 
  Activity,
  Layers,
  Globe
} from 'lucide-react';

interface NavigationProps {
  activeTab: 'catalog' | 'kanban' | 'matching' | 'admin' | 'billing' | 'telegram';
  setActiveTab: (tab: 'catalog' | 'kanban' | 'matching' | 'admin' | 'billing' | 'telegram') => void;
  language: 'RU' | 'KK';
  setLanguage: (lang: 'RU' | 'KK') => void;
  kanbanCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  kanbanCount
}) => {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('catalog')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-kzblue-500 to-amber-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-blue-400">
                  TenderAI
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-kzblue-500/20 text-kzblue-500 border border-kzblue-500/30">
                  KZ v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wide">
                {language === 'RU' ? 'Агрегатор и ИИ-Ассистент Тендеров РК' : 'ҚР Тендерлерінің ИИ-агрегаторы'}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'catalog'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>{language === 'RU' ? 'Каталог тендеров' : 'Тендерлер каталогы'}</span>
            </button>

            <button
              onClick={() => setActiveTab('matching')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'matching'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{language === 'RU' ? 'ИИ-Матчинг' : 'ИИ-Матчинг'}</span>
            </button>

            <button
              onClick={() => setActiveTab('kanban')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'kanban'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>{language === 'RU' ? 'Моя воронка' : 'Менің воронкам'}</span>
              {kanbanCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs font-bold bg-amber-500 text-slate-950 rounded-full">
                  {kanbanCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>{language === 'RU' ? 'Админ-панель' : 'Админ панелі'}</span>
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-3">
            
            {/* Telegram Bot shortcut */}
            <button
              onClick={() => setActiveTab('telegram')}
              className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 text-xs font-medium transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram Bot</span>
            </button>

            {/* Billing Button */}
            <button
              onClick={() => setActiveTab('billing')}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-kzgold-500/20 border border-amber-500/40 text-amber-300 hover:brightness-110 text-xs font-semibold transition-all"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Тариф: Pro (29 900 ₸)</span>
              <span className="sm:hidden">Pro</span>
            </button>

            {/* Language switch */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setLanguage('RU')}
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  language === 'RU' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                RU
              </button>
              <button
                onClick={() => setLanguage('KK')}
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  language === 'KK' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ҚАЗ
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
