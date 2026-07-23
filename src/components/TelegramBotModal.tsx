'use client';

import React, { useState } from 'react';
import { TelegramBotService, TelegramAlertLog } from '../lib/services/telegram.service';
import { Send, Bot, CheckCircle2, ShieldCheck, X, Sparkles } from 'lucide-react';

interface TelegramBotModalProps {
  onClose: () => void;
}

export const TelegramBotModal: React.FC<TelegramBotModalProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<TelegramAlertLog[]>(TelegramBotService.getLogs());
  const [testMessage, setTestMessage] = useState('');
  const [botChat, setBotChat] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([
    {
      sender: 'bot',
      text: '🤖 <b>TenderAI Bot v1.0 (Казахстан)</b>\nДобро пожаловать! Я буду присылать вам мгновенные уведомления о новых тендерах госзакупок и Самрук-Казына по вашему профилю.'
    }
  ]);

  const handleSendTestMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testMessage.trim()) return;

    const userText = testMessage.trim();
    setBotChat(prev => [...prev, { sender: 'user', text: userText }]);
    setTestMessage('');

    setTimeout(() => {
      let botReply = 'Я распознал ваш запрос. Анализирую открытые реестры goszakup.gov.kz... Найдено 4 релевантных лота по ИТ-оборудованию в Астане.';
      if (userText.toLowerCase().includes('помощь') || userText.toLowerCase().includes('/start')) {
        botReply = 'Команды бота:\n/search — Поиск тендеров на естественном языке\n/profile — Мой профиль деятельности\n/digest — Дайджест горячих тендеров за сегодня';
      }
      setBotChat(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-sky-950/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
              <Send className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>Интерактивный Telegram-Бот (@TenderAI_KZ_bot)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Канал мгновенных алертов и RAG-консультант в мессенджере
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Chat Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-950/60">
          {botChat.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-sky-400" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none space-y-2'
                }`}
                dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }}
              />
            </div>
          ))}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendTestMessage} className="p-4 border-t border-slate-800 bg-slate-900 flex items-center space-x-3">
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Напишите команду или вопрос боту (например: /search или 'тендеры Астана')..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Отправить</span>
          </button>
        </form>

      </div>
    </div>
  );
};
