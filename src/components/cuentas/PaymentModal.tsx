'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

interface PaymentModalProps {
  accountLabel: string;
  total: number;
  isOpen: boolean;
  isPending: boolean;
  onConfirmPay: () => Promise<void>;
  onClose: () => void;
}

export default function PaymentModal({
  accountLabel,
  total,
  isOpen,
  isPending,
  onConfirmPay,
  onClose,
}: PaymentModalProps) {
  const [paidInput, setPaidInput] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setPaidInput(total.toString());
    } else {
      setPaidInput('');
    }
  }, [isOpen, total]);

  if (!isOpen) return null;

  const paidAmount = parseFloat(paidInput) || 0;
  const change = paidAmount - total;
  const isValidPayment = paidAmount >= total;

  // Preset bill buttons relevant to Mexico / cash payments
  const commonBills = [50, 100, 200, 500, 1000];
  const quickBills = commonBills.filter((bill) => bill >= total);

  const handleQuickSelect = (amount: number) => {
    setPaidInput(amount.toString());
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-[var(--bg-overlay)] backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-[var(--bg-secondary)] border-t sm:border border-[var(--border)] rounded-t-[28px] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up sm:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle indicator */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-[var(--border-hover)] opacity-70"></div>
        </div>

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--border)] shrink-0">
          <div>
            <span className="badge badge-success text-[10px] mb-0.5">Cobro en Efectivo</span>
            <h3 className="text-xl font-black text-[var(--text-primary)]">
              Pagar {accountLabel}
            </h3>
          </div>
          <button onClick={onClose} className="btn-icon w-9 h-9" title="Cerrar">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[75dvh]">
          {/* Total Box */}
          <div className="bg-[var(--glass-bg)] p-4 rounded-2xl border border-[var(--border)] text-center space-y-1">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
              Total a Cobrar
            </span>
            <span className="text-4xl font-black font-mono tracking-tight text-[var(--accent)] block">
              {formatCurrency(total)}
            </span>
          </div>

          {/* Amount Paid Input with Numeric Keyboard */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] block">
              ¿Con cuánto paga el cliente? ($ MXN)
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                placeholder="0.00"
                value={paidInput}
                onChange={(e) => setPaidInput(e.target.value)}
                className="input py-3.5 px-4 text-2xl font-black font-mono text-center border-2 border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-glow)] bg-[var(--bg-input)]"
                autoFocus
              />
            </div>
          </div>

          {/* Quick Bill Presets */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-[var(--text-muted)] block">
              Billetes / Monto Rápido:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickSelect(total)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  paidAmount === total
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm'
                    : 'bg-[var(--glass-bg)] text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--border-hover)]'
                }`}
              >
                Exacto ({formatCurrency(total)})
              </button>
              {quickBills.map((bill) => (
                <button
                  key={bill}
                  type="button"
                  onClick={() => handleQuickSelect(bill)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    paidAmount === bill
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm'
                      : 'bg-[var(--glass-bg)] text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  ${bill}
                </button>
              ))}
            </div>
          </div>

          {/* Change Display Box */}
          <div className={`p-4 rounded-2xl border transition-all text-center ${
            isValidPayment
              ? 'bg-[var(--success-bg)] border-[var(--success)]'
              : paidAmount > 0
              ? 'bg-[var(--danger-bg)] border-[var(--danger)]'
              : 'bg-[var(--glass-bg)] border-[var(--border)]'
          }`}>
            {isValidPayment ? (
              <div className="space-y-1 animate-fade-in">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--success)] block">
                  Cambio a Entregar
                </span>
                <span className="text-3xl font-black font-mono text-[var(--success)] block">
                  {formatCurrency(change)}
                </span>
              </div>
            ) : paidAmount > 0 ? (
              <div className="space-y-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--danger)] block">
                  Pago insuficiente
                </span>
                <span className="text-sm font-bold text-[var(--danger)] block">
                  Falta: {formatCurrency(Math.abs(change))}
                </span>
              </div>
            ) : (
              <span className="text-xs font-medium text-[var(--text-muted)]">
                Ingresa el monto o selecciona un billete arriba
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-secondary)] flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost py-3.5 flex-1 font-semibold"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmPay}
            disabled={!isValidPayment || isPending}
            className="btn btn-success py-3.5 flex-1 font-bold text-base shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? 'Pagando...' : 'Confirmar Pago'}
          </button>
        </div>
      </div>
    </div>
  );
}
