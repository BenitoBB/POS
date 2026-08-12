'use client';

import { useState } from 'react';
import { useHistory } from '@/lib/hooks/useHistory';
import type { HistoryAccount } from '@/lib/hooks/useHistory';
import { formatCurrency, formatDateTime, getDateRange } from '@/lib/utils';
import HistoryDetail from './HistoryDetail';
import ReportsPanel from './ReportsPanel';

type DateFilterOption = 'today' | '7days' | '30days' | 'all';

export default function HistoryList() {
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('today');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pagada' | 'cancelada'>('all');
  const [selectedAccount, setSelectedAccount] = useState<HistoryAccount | null>(null);

  // Compute date range
  const dateRange = (() => {
    if (dateFilter === 'today') return getDateRange(0);
    if (dateFilter === '7days') return getDateRange(7);
    if (dateFilter === '30days') return getDateRange(30);
    return { start: undefined, end: undefined };
  })();

  const { data: history = [], isLoading, error } = useHistory({
    startDate: dateRange.start,
    endDate: dateRange.end,
    status: statusFilter,
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
          Historial y Reportes
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Consulta cuentas cerradas, analiza tus ventas y métricas clave
        </p>
      </div>

      {/* Reports Metrics Panel */}
      <ReportsPanel startDate={dateRange.start} endDate={dateRange.end} />

      {/* Filters Bar */}
      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Date Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-[var(--text-muted)] font-semibold mr-1">Periodo:</span>
          {[
            { id: 'today', label: 'Hoy' },
            { id: '7days', label: 'Últimos 7 días' },
            { id: '30days', label: 'Últimos 30 días' },
            { id: 'all', label: 'Todo el historial' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setDateFilter(f.id as DateFilterOption)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                dateFilter === f.id
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[var(--text-muted)] font-semibold mr-1">Estado:</span>
          {[
            { id: 'all', label: 'Todas' },
            { id: 'pagada', label: 'Pagadas' },
            { id: 'cancelada', label: 'Canceladas' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id as 'all' | 'pagada' | 'cancelada')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === s.id
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Accounts List */}
      {isLoading ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <div className="inline-block w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium">Cargando historial...</p>
        </div>
      ) : error ? (
        <div className="glass-card p-6 text-center text-[var(--danger)]">
          <p className="font-bold">Error al cargar el historial</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{(error as Error).message}</p>
        </div>
      ) : history.length === 0 ? (
        <div className="glass-card empty-state py-12">
          <svg className="w-12 h-12 text-[var(--text-muted)] opacity-50 mb-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <p className="text-base font-semibold">Sin registros en este periodo</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Las cuentas saldadas o canceladas aparecerán aquí</p>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {history.map((acc) => {
            const isPaid = acc.status === 'pagada';
            const itemCount = (acc.account_items || []).reduce((sum, item) => sum + item.quantity, 0);

            return (
              <button
                key={acc.id}
                onClick={() => setSelectedAccount(acc)}
                className="w-full text-left glass-card p-4 flex flex-wrap items-center justify-between gap-4 hover:border-[var(--accent)] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    isPaid
                      ? 'bg-[var(--success-bg)] text-[var(--success)]'
                      : 'bg-[var(--danger-bg)] text-[var(--danger)]'
                  }`}>
                    {isPaid ? '✓' : '✕'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                        {acc.label}
                      </h3>
                      <span className={`badge text-[10px] ${isPaid ? 'badge-success' : 'badge-danger'}`}>
                        {isPaid ? 'Pagada' : 'Cancelada'}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Cerrada: {acc.closed_at ? formatDateTime(acc.closed_at) : 'N/A'} • {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 ml-auto sm:ml-0">
                  <div className="text-right">
                    <span className={`text-xl font-black font-mono ${isPaid ? 'text-[var(--success)]' : 'text-[var(--text-muted)] line-through'}`}>
                      {formatCurrency(acc.total)}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] block">Efectivo</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-[var(--glass-bg)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--text-primary)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* History Detail Modal */}
      {selectedAccount && (
        <HistoryDetail
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
        />
      )}
    </div>
  );
}
