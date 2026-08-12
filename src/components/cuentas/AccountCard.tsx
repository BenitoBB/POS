'use client';

import { useAccountItems } from '@/lib/hooks/useAccountItems';
import { formatCurrency } from '@/lib/utils';
import type { Account } from '@/types';

interface AccountCardProps {
  account: Account;
  isSelected: boolean;
  onSelect: () => void;
}

export default function AccountCard({ account, isSelected, onSelect }: AccountCardProps) {
  const { data: items = [], total } = useAccountItems(account.id);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[140px] relative overflow-hidden group ${isSelected
        ? 'border-[var(--accent)] bg-[var(--accent-glow)] shadow-lg ring-2 ring-[var(--accent)]'
        : 'border-[var(--border)] bg-[var(--glass-bg)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-hover)]'
        }`}
    >
      {/* Active Indicator Pulse */}
      {itemCount > 0 && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>
      )}

      {/* Header / Account Label */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="badge badge-success text-[10px]">Abierta</span>
        </div>
        <h3 className="text-xl font-extrabold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
          {account.label}
        </h3>
      </div>

      {/* Footer / Total & Items */}
      <div className="flex items-end justify-between mt-4 pt-3 border-t border-[var(--border)]">
        <div>
          <span className="text-[11px] text-[var(--text-muted)] block">
            {itemCount === 1 ? '1 producto' : `${itemCount} productos`}
          </span>
          <span className="text-2xl font-black font-mono tracking-tight text-[var(--text-primary)]">
            {formatCurrency(total)}
          </span>
        </div>

        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isSelected
          ? 'bg-[var(--accent)] text-white'
          : 'bg-[var(--glass-bg)] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] group-hover:bg-[var(--border)]'
          }`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </div>
    </button>
  );
}
