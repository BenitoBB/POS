// Types matching the Supabase database schema

export type AccountStatus = 'abierta' | 'pagada' | 'cancelada';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  label: string;
  status: AccountStatus;
  opened_at: string;
  closed_at: string | null;
  total: number;
  payment_method: string | null;
}

export interface AccountItem {
  id: string;
  account_id: string;
  product_id: string | null;
  product_name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  subtotal: number;
}

// Extended types for UI
export interface AccountWithItems extends Account {
  items: AccountItem[];
}

// Form types
export interface ProductFormData {
  name: string;
  price: number;
}

export interface AddItemData {
  product_id: string;
  product_name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
}

// Theme types
export type ThemePalette = 'orange-green' | 'dark' | 'light' | 'protanopia' | 'deuteranopia' | 'tritanopia';

export interface AppearanceSettings {
  palette: ThemePalette;
  fontSize: number; // 12-24
  fontWeight: number; // 300-800
}

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  palette: 'orange-green',
  fontSize: 16,
  fontWeight: 400,
};

// Report types
export interface SalesReport {
  totalRevenue: number;
  mostSoldProduct: { name: string; quantity: number } | null;
  leastSoldProduct: { name: string; quantity: number } | null;
  peakHour: { hour: number; count: number } | null;
  totalAccounts: number;
}
