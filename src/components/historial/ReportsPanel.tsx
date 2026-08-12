'use client';

import { useReports } from '@/lib/hooks/useHistory';
import { formatCurrency, getHourLabel } from '@/lib/utils';

interface ReportsPanelProps {
  startDate?: string;
  endDate?: string;
}

export default function ReportsPanel({ startDate, endDate }: ReportsPanelProps) {
  const { data: reports, isLoading, error } = useReports({ startDate, endDate });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card animate-pulse h-28 bg-[var(--glass-bg)]"></div>
        ))}
      </div>
    );
  }

  if (error || !reports) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Revenue */}
      <div className="stat-card space-y-2">
        <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-semibold">
          <span>Ganancia Total</span>
          <div className="w-8 h-8 rounded-lg bg-[var(--success-bg)] text-[var(--success)] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" x2="12" y1="2" y2="22"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[var(--success)]">
          {formatCurrency(reports.totalRevenue)}
        </div>
        <p className="text-[11px] text-[var(--text-muted)]">
          De {reports.totalAccounts} {reports.totalAccounts === 1 ? 'cuenta pagada' : 'cuentas pagadas'}
        </p>
      </div>

      {/* Most Sold Product */}
      <div className="stat-card space-y-2">
        <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-semibold">
          <span>Producto Más Vendido</span>
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-glow)] text-[var(--accent)] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
              <polyline points="16 7 22 7 22 13"/>
            </svg>
          </div>
        </div>
        <div className="text-lg font-bold text-[var(--text-primary)] truncate">
          {reports.mostSoldProduct ? reports.mostSoldProduct.name : 'N/A'}
        </div>
        <p className="text-[11px] text-[var(--text-muted)] font-mono">
          {reports.mostSoldProduct ? `${reports.mostSoldProduct.quantity} unidades` : 'Sin ventas registradas'}
        </p>
      </div>

      {/* Least Sold Product */}
      <div className="stat-card space-y-2">
        <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-semibold">
          <span>Producto Menos Vendido</span>
          <div className="w-8 h-8 rounded-lg bg-[var(--warning-bg)] text-[var(--warning)] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/>
              <polyline points="16 17 22 17 22 11"/>
            </svg>
          </div>
        </div>
        <div className="text-lg font-bold text-[var(--text-primary)] truncate">
          {reports.leastSoldProduct ? reports.leastSoldProduct.name : 'N/A'}
        </div>
        <p className="text-[11px] text-[var(--text-muted)] font-mono">
          {reports.leastSoldProduct ? `${reports.leastSoldProduct.quantity} unidades` : 'Sin ventas registradas'}
        </p>
      </div>

      {/* Peak Hour */}
      <div className="stat-card space-y-2">
        <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-semibold">
          <span>Franja Horaria Pico</span>
          <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
        </div>
        <div className="text-lg font-bold font-mono text-[var(--text-primary)]">
          {reports.peakHour ? getHourLabel(reports.peakHour.hour) : 'N/A'}
        </div>
        <p className="text-[11px] text-[var(--text-muted)] font-mono">
          {reports.peakHour ? `${reports.peakHour.count} ordenes abiertas` : 'Sin datos suficientes'}
        </p>
      </div>
    </div>
  );
}
