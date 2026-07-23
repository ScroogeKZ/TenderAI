'use client';

import React, { useState, useMemo } from 'react';
import { Tender, KanbanItem, CompanyProfileData, DataSourceStatus } from '../lib/types/tender';
import { INITIAL_TENDERS, INITIAL_DATA_SOURCES, KZ_REGIONS, CATEGORIES } from '../lib/mockData';
import { AIService } from '../lib/services/ai.service';
import { TelegramBotService } from '../lib/services/telegram.service';
import { Navigation } from '../components/Navigation';
import { TenderCard } from '../components/TenderCard';
import { TenderDetailModal } from '../components/TenderDetailModal';
import { KanbanBoard } from '../components/KanbanBoard';
import { CompanyProfileModal } from '../components/CompanyProfileModal';
import { AdminPanel } from '../components/AdminPanel';
import { BillingModal } from '../components/BillingModal';
import { TelegramBotModal } from '../components/TelegramBotModal';

import { 
  Search, 
  Sparkles, 
  Filter, 
  SlidersHorizontal, 
  RefreshCw, 
  Building2, 
  MapPin, 
  CheckCircle2,
  TrendingUp,
  Layers,
  ArrowUpDown
} from 'lucide-react';

export default function HomePage() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'catalog' | 'kanban' | 'matching' | 'admin' | 'billing' | 'telegram'>('catalog');
  const [language, setLanguage] = useState<'RU' | 'KK'>('RU');

  // Main State
  const [tenders, setTenders] = useState<Tender[]>(INITIAL_TENDERS);
  const [dataSources, setDataSources] = useState<DataSourceStatus[]>(INITIAL_DATA_SOURCES);
  const [kanbanItems, setKanbanItems] = useState<KanbanItem[]>([]);
  
  // Selected tender for detail modal
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Все регионы');
  const [selectedCategory, setSelectedCategory] = useState('Все категории');
  const [selectedSource, setSelectedSource] = useState<'ALL' | 'GOSZAKUP' | 'SAMRUK_KAZYNA'>('ALL');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'amount_desc' | 'risk_asc' | 'match_desc'>('date');

  // Toast message state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Company Profile for Matching
  const [companyProfile, setCompanyProfile] = useState<CompanyProfileData>({
    companyName: 'ТОО "КазИТ Сервис"',
    bin: '180940004512',
    activities: 'Поставка компьютерной техники, серверного оборудования, сетевых устройств, разработка ПО и системная интеграция.',
    keywords: ['Серверы', 'Сетевое оборудование', 'ИТ-услуги', 'ПО'],
    regions: ['г. Астана', 'г. Алматы', 'Карагандинская область'],
    minAmount: 5000000,
    maxAmount: 200000000,
    contactEmail: 'tender@kazit-service.kz',
    telegramChatId: '@kazit_tender_team'
  });

  // Kanban Handlers
  const handleAddToKanban = (tender: Tender) => {
    if (kanbanItems.some(item => item.tenderId === tender.id)) return;
    const newItem: KanbanItem = {
      id: `kanban-${Date.now()}`,
      tenderId: tender.id,
      stage: 'UNDER_REVIEW',
      priority: 'MEDIUM',
      tender,
      updatedAt: new Date().toISOString()
    };
    setKanbanItems(prev => [...prev, newItem]);
    showToast(`Лот №${tender.externalId} добавлен в воронку!`);
  };

  const handleUpdateKanbanStage = (itemId: string, newStage: any) => {
    setKanbanItems(prev => prev.map(item => item.id === itemId ? { ...item, stage: newStage } : item));
    showToast('Этап в воронке обновлен!');
  };

  const handleRemoveKanbanItem = (itemId: string) => {
    setKanbanItems(prev => prev.filter(item => item.id !== itemId));
    showToast('Лот удален из воронки');
  };

  // Telegram alert trigger
  const handleSendToTelegram = (tender: Tender) => {
    TelegramBotService.sendNotification(tender, companyProfile.telegramChatId);
    showToast(`Уведомление по лоту №${tender.externalId} отправлено в Telegram!`);
  };

  // Run AI Semantic Matcher
  const matchedTenders = useMemo(() => {
    return AIService.matchCompanyProfile(companyProfile, tenders);
  }, [companyProfile, tenders]);

  // Filtered Tenders list for catalog
  const filteredTenders = useMemo(() => {
    let list = tenders;

    // 1. Natural Language / Keyword Search
    if (searchQuery.trim()) {
      list = AIService.searchSemantic(searchQuery, list);
    }

    // 2. Region Filter
    if (selectedRegion !== 'Все регионы') {
      list = list.filter(t => t.region === selectedRegion);
    }

    // 3. Category Filter
    if (selectedCategory !== 'Все категории') {
      list = list.filter(t => t.category === selectedCategory);
    }

    // 4. Source Filter
    if (selectedSource !== 'ALL') {
      list = list.filter(t => t.source === selectedSource);
    }

    // 5. Amount Filter
    if (minAmount) {
      list = list.filter(t => t.amount >= parseFloat(minAmount));
    }
    if (maxAmount) {
      list = list.filter(t => t.amount <= parseFloat(maxAmount));
    }

    // 6. Sorting
    return [...list].sort((a, b) => {
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      if (sortBy === 'risk_asc') return a.riskScore - b.riskScore;
      if (sortBy === 'match_desc') return (b.matchPercentage || 0) - (a.matchPercentage || 0);
      return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
    });
  }, [tenders, searchQuery, selectedRegion, selectedCategory, selectedSource, minAmount, maxAmount, sortBy]);

  // Overall Statistics
  const totalVolumeKzt = useMemo(() => tenders.reduce((acc, t) => acc + t.amount, 0), [tenders]);

  return (
    <div className="min-h-screen flex flex-col bg-darkbg text-slate-100">
      
      {/* Top Header & Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        kanbanCount={kanbanItems.length}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-kzblue-500 text-white font-semibold text-xs shadow-2xl shadow-blue-500/40 flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* TAB 1: CATALOG */}
        {activeTab === 'catalog' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Hero Stats & AI Search Bar Banner */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
                    {language === 'RU' ? 'Единый агрегатор тендеров Казахстана' : 'Қазақстан тендерлерінің бірыңғай агрегаторы'}
                  </h1>
                  <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    Мониторинг goszakup.gov.kz, Самрук-Казына и квазигоссектора. Семантический ИИ-поиск, авто-суммаризация ТЗ и оценка рисков.
                  </p>
                </div>

                <div className="flex items-center space-x-4 shrink-0">
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Активных лотов</span>
                    <span className="text-lg font-bold text-blue-400 font-mono">{tenders.length} лот(ов)</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Общий объем</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">
                      {(totalVolumeKzt / 1000000).toFixed(1)} млн ₸
                    </span>
                  </div>
                </div>
              </div>

              {/* Natural Language AI Search Box */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'RU' ? "Спросите ИИ-бота на естественном языке (например: 'ищу поставку серверов в Астане до 50 млн тенге')..." : "ИИ-ассистенттен табиғи тілде сұраңыз..."}
                  className="w-full pl-12 pr-28 py-4 bg-slate-950/90 border border-slate-700/80 rounded-2xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-inner transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-24 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-slate-400 hover:text-white"
                  >
                    Очистить
                  </button>
                )}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold flex items-center space-x-1">
                  <span>ИИ-Поиск</span>
                </div>
              </div>

              {/* Filter Controls Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
                
                {/* Region Selector */}
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block mb-1">Регион РК</label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {KZ_REGIONS.map(reg => (
                      <option key={reg} value={reg}>{reg}</option>
                    ))}
                  </select>
                </div>

                {/* Category Selector */}
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block mb-1">Категория</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Source Selector */}
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block mb-1">Источник</label>
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="ALL">Все площадки</option>
                    <option value="GOSZAKUP">goszakup.gov.kz</option>
                    <option value="SAMRUK_KAZYNA">portal.sk.kz (Самрук)</option>
                  </select>
                </div>

                {/* Sorting */}
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block mb-1">Сортировка</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="date">По дате публикации</option>
                    <option value="amount_desc">По убыванию суммы ₸</option>
                    <option value="risk_asc">По наименьшему риску</option>
                  </select>
                </div>

                {/* Reset Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedRegion('Все регионы');
                      setSelectedCategory('Все категории');
                      setSelectedSource('ALL');
                      setMinAmount('');
                      setMaxAmount('');
                      setSortBy('date');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Сбросить</span>
                  </button>
                </div>

              </div>

            </div>

            {/* Results Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-200">
                  Найдено тендеров: <span className="text-blue-400">{filteredTenders.length}</span>
                </h2>
                <span className="text-xs text-slate-400">
                  Обновлено 5 минут назад &bull; Источник: ЕГСЗ / Самрук-Казына
                </span>
              </div>

              {filteredTenders.length === 0 ? (
                <div className="glass-panel rounded-3xl p-12 text-center space-y-3">
                  <Search className="w-10 h-10 text-slate-600 mx-auto" />
                  <h3 className="text-base font-semibold text-slate-300">Лотов по данному запросу не найдено</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Попробуйте изменить параметры региона, категории или снизить требования к поисковому запросу.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTenders.map((tender) => (
                    <TenderCard
                      key={tender.id}
                      tender={tender}
                      onOpenDetails={(t) => setSelectedTender(t)}
                      onAddToKanban={handleAddToKanban}
                      onSendToTelegram={handleSendToTelegram}
                      isInKanban={kanbanItems.some(k => k.tenderId === tender.id)}
                      language={language}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: AI MATCHING */}
        {activeTab === 'matching' && (
          <div className="space-y-8 animate-fadeIn">
            <CompanyProfileModal
              profile={companyProfile}
              onSaveProfile={setCompanyProfile}
              onRunMatching={() => showToast('Семантический ИИ-матчинг пересчитан!')}
            />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-200 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Рекомендованные ИИ-лоты под профиль "{companyProfile.companyName}"</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchedTenders.map((tender) => (
                  <TenderCard
                    key={tender.id}
                    tender={tender}
                    onOpenDetails={(t) => setSelectedTender(t)}
                    onAddToKanban={handleAddToKanban}
                    onSendToTelegram={handleSendToTelegram}
                    isInKanban={kanbanItems.some(k => k.tenderId === tender.id)}
                    language={language}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: KANBAN WORKSPACE */}
        {activeTab === 'kanban' && (
          <KanbanBoard
            items={kanbanItems}
            onUpdateStage={handleUpdateKanbanStage}
            onRemoveItem={handleRemoveKanbanItem}
            onOpenTenderDetails={(t) => setSelectedTender(t)}
          />
        )}

        {/* TAB 4: ADMIN PANEL */}
        {activeTab === 'admin' && (
          <AdminPanel
            sources={dataSources}
            onTriggerSync={(srcId) => showToast(`Запущена синхронизация источника...`)}
            onAddNewTenders={(newItems) => {
              setTenders(prev => [...newItems, ...prev]);
              showToast(`Импортировано +${newItems.length} новых лотов!`);
            }}
          />
        )}

      </main>

      {/* MODALS */}
      {selectedTender && (
        <TenderDetailModal
          tender={selectedTender}
          onClose={() => setSelectedTender(null)}
          onAddToKanban={handleAddToKanban}
          isInKanban={kanbanItems.some(k => k.tenderId === selectedTender.id)}
        />
      )}

      {activeTab === 'billing' && (
        <BillingModal onClose={() => setActiveTab('catalog')} />
      )}

      {activeTab === 'telegram' && (
        <TelegramBotModal onClose={() => setActiveTab('catalog')} />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; 2026 TenderAI Kazakhstan. Все права защищены.
          </div>
          <div className="flex items-center space-x-4">
            <span>goszakup.gov.kz API</span>
            <span>&bull;</span>
            <span>portal.sk.kz API</span>
            <span>&bull;</span>
            <span>Kaspi Pay Integration</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
