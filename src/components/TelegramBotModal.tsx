'use client';

import React, { useState } from 'react';
import { TelegrafBotService } from '../lib/telegram/bot.service';
import { Send, Bot, CheckCircle2, ShieldCheck, X, ExternalLink, QrCode, Copy } from 'lucide-react';

interface TelegramBotModalProps {
  telegramChatId?: string;
  onClose: () => void;
}

export const TelegramBotModal: React.FC<TelegramBotModalProps> = ({ telegramChatId, onClose }) => {
  const [copied, setCopied] = useState(false);
  const isConnected = Boolean(telegramChatId && telegramChatId.trim().length > 0);
  const deepLink = TelegrafBotService.generateDeepLink('usr_kazit_service_101');

  const [botChat, setBotChat] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([
    {
      sender: 'bot',
      text: '🤖 <b>TenderAI Bot v1.0 (Казахстан)</b>\nСистема подписки активирована. Мгновенные уведомления о новых тендерах goszakup.gov.kz и Самрук-Казына поступают в ваш мессенджер.'
    }
  ]);
  const [testMessage, setTestMessage] = useState('');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(deepLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendTestMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testMessage.trim()) return;

    const userText = testMessage.trim();
    setBotChat(prev => [...prev, { sender: 'user', text: userText }]);
    setTestMessage('');

    setTimeout(() => {
      const parts = userText.split(' ');
      const botReply = TelegrafBotService.handleBotCommand(parts[0], parts.slice(1), {});
      setBotChat(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-sky-950/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
              <Send className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>Интеграция Telegram-Бота (@TenderAI_KZ_bot)</span>
                {isConnected ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    Подключено ({telegramChatId})
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                    Не привязан
                  </span>
                )}
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Deep Link Connection Card */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium block">Персональная ссылка привязки Telegram-аккаунта:</span>
              <p className="text-xs font-mono text-sky-300 break-all">{deepLink}</p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Скопировано!' : 'Скопировать'}</span>
              </button>

              <a
                href={deepLink}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <span>Перейти в Telegram</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Interactive Bot Chat Simulator */}
          <div className="flex flex-col h-[320px] bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {botChat.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start space-x-2.5 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-sky-400" />
                    </div>
                  )}

                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                      msg.sender === 'user'
                        ? 'bg-sky-600 text-white rounded-tr-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none space-y-2'
                    }`}
                    dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }}
                  />
                </div>
              ))}
            </div>

            <form onSubmit={handleSendTestMessage} className="p-3 border-t border-slate-800 bg-slate-900 flex items-center space-x-2">
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Попробуйте команды: /search серверы Астана или /digest..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Отправить</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
