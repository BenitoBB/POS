'use client';

import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { HistoryAccount } from '@/lib/hooks/useHistory';

interface HistoryDetailProps {
  account: HistoryAccount;
  onClose: () => void;
}

export default function HistoryDetail({ account, onClose }: HistoryDetailProps) {
  const isPaid = account.status === 'pagada';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`badge ${isPaid ? 'badge-success' : 'badge-danger'}`}>
                {isPaid ? 'Pagada' : 'Cancelada'}
              </span>
              <span className="text-xs text-[var(--text-muted)] font-mono">
                ID: {account.id.slice(0, 8)}
              </span>
            </div>
            <h3 className="text-xl font-black text-[var(--text-primary)]">{account.label}</h3>
          </div>
          <button onClick={onClose} className="btn-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-[var(--glass-bg)] p-3 rounded-xl border border-[var(--border)]">
          <div>
            <span className="text-[var(--text-muted)] block">Hora de Apertura</span>
            <span className="font-semibold">{formatDateTime(account.opened_at)}</span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] block">Hora de Cierre</span>
            <span className="font-semibold">{account.closed_at ? formatDateTime(account.closed_at) : 'N/A'}</span>
          </div>
        </div>

        {/* Product Items Snapshot */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Detalle de Productos
          </h4>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {account.account_items.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] py-4 text-center">
                Sin productos en esta cuenta
              </p>
            ) : (
              account.account_items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--border)] text-sm"
                >
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">
                      {item.product_name_snapshot}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] font-mono">
                      {item.quantity} x {formatCurrency(item.unit_price_snapshot)}
                    </p>
                  </div>
                  <span className="font-bold font-mono text-[var(--text-primary)]">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
          <span className="text-sm font-semibold text-[var(--text-secondary)]">Total:</span>
          <span className={`text-2xl font-black font-mono ${isPaid ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
            {formatCurrency(account.total)}
          </span>
        </div>

        <button onClick={onClose} className="btn btn-primary w-full py-3">
          Cerrar
        </button>
      </div>
    </div>
  );
}
