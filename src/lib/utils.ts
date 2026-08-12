export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateStr));
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
  }).format(new Date(dateStr));
}

export function formatTime(dateStr: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    timeStyle: 'short',
  }).format(new Date(dateStr));
}

export function getHourLabel(hour: number): string {
  const start = hour % 24;
  const end = (hour + 1) % 24;
  const fmt = (h: number) => `${h.toString().padStart(2, '0')}:00`;
  return `${fmt(start)} - ${fmt(end)}`;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getDateRange(daysBack: number): { start: string; end: string } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  if (daysBack > 0) {
    start.setDate(start.getDate() - daysBack);
  }
  start.setHours(0, 0, 0, 0);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}
