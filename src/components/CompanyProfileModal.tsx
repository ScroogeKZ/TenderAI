'use client';

import React, { useState } from 'react';
import { CompanyProfileData } from '../lib/types/tender';
import { KZ_REGIONS } from '../lib/mockData';
import { Sparkles, Building2, MapPin, Tag, Check, Save } from 'lucide-react';

interface CompanyProfileModalProps {
  profile: CompanyProfileData;
  onSaveProfile: (profile: CompanyProfileData) => void;
  onRunMatching: () => void;
}

export const CompanyProfileModal: React.FC<CompanyProfileModalProps> = ({
  profile,
  onSaveProfile,
  onRunMatching
}) => {
  const [formData, setFormData] = useState<CompanyProfileData>(profile);
  const [keywordInput, setKeywordInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return;
    if (!formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({ ...prev, keywords: [...prev.keywords, keywordInput.trim()] }));
    }
    setKeywordInput('');
  };

  const handleRemoveKeyword = (kw: string) => {
    setFormData(prev => ({ ...prev, keywords: prev.keywords.filter(k => k !== kw) }));
  };

  const handleToggleRegion = (region: string) => {
    setFormData(prev => {
      const exists = prev.regions.includes(region);
      const updated = exists ? prev.regions.filter(r => r !== region) : [...prev.regions, region];
      return { ...prev, regions: updated.length === 0 ? ['Все регионы'] : updated };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    onRunMatching();
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-6 max-w-4xl mx-auto animate-fadeIn">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <span>Профиль компании и Настройка Семантического ИИ-Матчинга</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Опишите направление вашей деятельности. ИИ-бот ежедневно анализирует новые лоты Республики Казахстан по смыслу ТЗ и проактивно рекомендует целевые тендеры.
          </p>
        </div>

        {savedSuccess && (
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center space-x-1">
            <Check className="w-4 h-4" />
            <span>Профиль сохранен!</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Company Name & BIN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Наименование организации:
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              БИН организации (РК):
            </label>
            <input
              type="text"
              value={formData.bin}
              onChange={(e) => setFormData({ ...formData, bin: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Business Activities Description (Natural Language) */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Описание видов деятельности (для естественного семантического анализа ИИ):
          </label>
          <textarea
            rows={3}
            value={formData.activities}
            onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
            placeholder="Например: Поставка серверного и сетевого оборудования, монтаж СКС, комплексная IT-инфраструктура, разработка ПО и сопровождение..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 focus:outline-none focus:border-blue-500 leading-relaxed"
          />
        </div>

        {/* Keywords */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Ключевые слова & КТРУ:
          </label>
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="Добавить тег (например: Серверы, СМР, СИЗ, Автотранспорт)..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleAddKeyword}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
            >
              Добавить
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.keywords.map((kw) => (
              <span key={kw} className="px-3 py-1 rounded-lg bg-blue-950/60 border border-blue-800/60 text-blue-300 text-xs font-medium flex items-center space-x-1.5">
                <Tag className="w-3 h-3 text-blue-400" />
                <span>{kw}</span>
                <button type="button" onClick={() => handleRemoveKeyword(kw)} className="hover:text-red-400 ml-1">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Regions */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            Предпочтительные регионы работы (РК):
          </label>
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            {KZ_REGIONS.map((reg) => {
              const selected = formData.regions.includes(reg);
              return (
                <button
                  type="button"
                  key={reg}
                  onClick={() => handleToggleRegion(reg)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selected 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {reg}
                </button>
              );
            })}
          </div>
        </div>

        {/* Budget Range (KZT) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Минимальная сумма договора (KZT):
            </label>
            <input
              type="number"
              value={formData.minAmount}
              onChange={(e) => setFormData({ ...formData, minAmount: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Максимальная сумма договора (KZT):
            </label>
            <input
              type="number"
              value={formData.maxAmount || ''}
              onChange={(e) => setFormData({ ...formData, maxAmount: parseFloat(e.target.value) || 0 })}
              placeholder="Без ограничений"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono focus:outline-none"
            />
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-kzblue-500 hover:brightness-110 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Сохранить профиль и Запустить ИИ-Матчинг</span>
          </button>
        </div>

      </form>
    </div>
  );
};
