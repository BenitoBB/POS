import type { AccountItem, AppearanceSettings } from '@/types';

const STORAGE_PREFIX = 'pos_account_';
const APPEARANCE_KEY = 'pos_appearance';

// Account items backup
export function saveAccountItemsLocal(accountId: string, items: AccountItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}${accountId}`,
      JSON.stringify({ items, timestamp: Date.now() })
    );
  } catch {
    // localStorage full or unavailable
  }
}

export function getAccountItemsLocal(accountId: string): AccountItem[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(`${STORAGE_PREFIX}${accountId}`);
    if (!data) return null;
    const parsed = JSON.parse(data);
    return parsed.items || null;
  } catch {
    return null;
  }
}

export function clearAccountItemsLocal(accountId: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${accountId}`);
  } catch {
    // ignore
  }
}

// Appearance settings
export function saveAppearance(settings: AppearanceSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(APPEARANCE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function getAppearance(): AppearanceSettings | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(APPEARANCE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}
