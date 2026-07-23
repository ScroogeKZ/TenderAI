'use client';

import React, { useState, useEffect } from 'react';
import { TARIFF_PLANS, KaspiPayService, KaspiQrPaymentResponse } from '../lib/services/kaspi.service';
import { Check, CreditCard, QrCode, ShieldCheck, X, AlertTriangle, RefreshCw } from 'lucide-react';

interface BillingModalProps {
  onClose: () => void;
}

export const BillingModal: React.FC<BillingModalProps> = ({ onClose }) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('PRO');
  const [paymentQr, setPaymentQr] = useState<KaspiQrPaymentResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'UNKNOWN'>('PENDING');

  const selectedPlan = TARIFF_PLANS.find(p => p.id === selectedPlanId) || TARIFF_PLANS[1];

  const handleGenerateKaspiQr = () => {
    const qrData = KaspiPayService.generateQrCode(selectedPlan.id, selectedPlan.priceKztMonth);
    setPaymentQr(qrData);
    setPaymentStatus('PENDING');
  };

  // Poll backend status API exclusively (/api/billing/kaspi/status?orderId=...)
  useEffect(() => {
    if (!paymentQr || paymentStatus === 'PAID' || paymentStatus === 'FAILED') return;

    const interval = setInterval(async () => {
      const serverStatus = await KaspiPayService.checkPaymentStatus(paymentQr.paymentId);
      if (serverStatus === 'PAID') {
        setPaymentStatus('PAID');
        clearInterval(interval);
      } else if (serverStatus === 'FAILED' || serverStatus === 'EXPIRED') {
        setPaymentStatus(serverStatus);
        clearInterval(interval);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [paymentQr, paymentStatus]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-bold text-slate-100">Тарифные планы TenderAI & Оплата Kaspi Pay</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Официальный эквайринг Kaspi Pay (KZT). Активация выполняется строго после валидации подписи вебхука сервером.
            </p>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {TARIFF_PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => {
                    setSelectedPlanId(plan.id);
                    setPaymentQr(null);
                    setPaymentStatus('PENDING');
                  }}
                  className={`p-5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between relative ${
                    isSelected
                      ? 'bg-blue-950/40 border-2 border-blue-500 shadow-xl shadow-blue-500/20'
                      : 'bg-slate-950/60 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {plan.recommended && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-kzgold-500 text-slate-950 font-bold text-[10px] uppercase">
                      Популярный
                    </span>
                  )}

                  <div>
                    <h3 className="text-sm font-bold text-slate-100 mb-1">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-xl font-extrabold text-emerald-400 font-mono">
                        {plan.priceKztMonth === 0 ? '0 ₸' : `${plan.priceKztMonth.toLocaleString('ru-RU')} ₸`}
                      </span>
                      {plan.priceKztMonth > 0 && <span className="text-xs text-slate-400">/мес</span>}
                    </div>

                    <ul className="space-y-2 text-xs text-slate-300">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    className={`w-full mt-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {isSelected ? 'Выбран' : 'Выбрать'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Payment Details & Server-Driven Status UI */}
          {selectedPlan.priceKztMonth > 0 && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-red-500 font-bold">
                  <QrCode className="w-5 h-5" />
                  <span>Оплата через Kaspi.kz (Kaspi Pay QR)</span>
                </div>
                <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                  Отсканируйте QR-код в приложении Kaspi.kz. Подписка {selectedPlan.name} активируется исключительно после получения и валидации криптографической подписи вебхука сервером.
                </p>
                <div className="text-xs font-mono text-emerald-400">
                  Сумма счета: <span className="text-lg font-bold">{selectedPlan.priceKztMonth.toLocaleString('ru-RU')} KZT</span>
                </div>
              </div>

              {!paymentQr ? (
                <button
                  onClick={handleGenerateKaspiQr}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center space-x-2 shrink-0"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Сгенерировать Kaspi QR</span>
                </button>
              ) : paymentStatus === 'PAID' ? (
                /* STATE 1: PAID (Validated by Server Webhook) */
                <div className="p-5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-center space-y-1 shrink-0 min-w-[220px]">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs font-bold text-emerald-300">Платёж подтверждён через Webhook!</p>
                  <p className="text-[10px] text-slate-400 font-mono">Заказ: {paymentQr.paymentId}</p>
                  <p className="text-[10px] text-emerald-400 font-semibold pt-1">Тариф {selectedPlan.name} активирован</p>
                </div>
              ) : paymentStatus === 'FAILED' || paymentStatus === 'EXPIRED' ? (
                /* STATE 2: FAILED / EXPIRED */
                <div className="p-5 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-center space-y-2 shrink-0 min-w-[220px]">
                  <AlertTriangle className="w-7 h-7 text-rose-400 mx-auto" />
                  <p className="text-xs font-bold text-rose-300">Ошибка или истечение счета</p>
                  <button
                    onClick={handleGenerateKaspiQr}
                    className="px-3 py-1.5 rounded-lg bg-rose-900 hover:bg-rose-800 text-white text-[11px] font-semibold flex items-center space-x-1 mx-auto"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Повторить QR</span>
                  </button>
                </div>
              ) : (
                /* STATE 3: PENDING (Server Polling Active) */
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2 shrink-0 min-w-[200px]">
                  <div className="w-32 h-32 bg-white rounded-xl p-2 mx-auto flex items-center justify-center border-2 border-red-500">
                    <QrCode className="w-24 h-24 text-slate-950" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-amber-400 font-mono animate-pulse">Ожидание вебхука от сервера Kaspi...</p>
                    <p className="text-[9px] text-slate-500 font-mono">Поллинг статуса /api/billing/kaspi/status</p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
