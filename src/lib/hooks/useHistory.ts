'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { Account, AccountItem, SalesReport } from '@/types';

interface HistoryFilters {
  startDate?: string;
  endDate?: string;
  status?: 'pagada' | 'cancelada' | 'all';
}

export interface HistoryAccount extends Account {
  account_items: AccountItem[];
}

export function useHistory(filters: HistoryFilters = {}) {
  return useQuery({
    queryKey: ['history', filters],
    queryFn: async (): Promise<HistoryAccount[]> => {
      let query = supabase
        .from('accounts')
        .select('*, account_items(*)')
        .in('status', filters.status === 'all' || !filters.status
          ? ['pagada', 'cancelada']
          : [filters.status]
        )
        .order('closed_at', { ascending: false });

      if (filters.startDate) {
        query = query.gte('closed_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('closed_at', filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as HistoryAccount[];
    },
  });
}

export function useReports(filters: { startDate?: string; endDate?: string } = {}) {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: async (): Promise<SalesReport> => {
      // Get paid accounts in date range
      let query = supabase
        .from('accounts')
        .select('*, account_items(*)')
        .eq('status', 'pagada');

      if (filters.startDate) {
        query = query.gte('closed_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('closed_at', filters.endDate);
      }

      const { data: accounts, error } = await query;
      if (error) throw error;

      const paidAccounts = (accounts || []) as HistoryAccount[];

      // Total revenue
      const totalRevenue = paidAccounts.reduce((sum, acc) => sum + Number(acc.total), 0);

      // Product sales aggregation
      const productSales: Record<string, { name: string; quantity: number }> = {};
      paidAccounts.forEach((acc) => {
        (acc.account_items || []).forEach((item) => {
          const key = item.product_name_snapshot;
          if (!productSales[key]) {
            productSales[key] = { name: key, quantity: 0 };
          }
          productSales[key].quantity += item.quantity;
        });
      });

      const sortedProducts = Object.values(productSales).sort((a, b) => b.quantity - a.quantity);
      const mostSoldProduct = sortedProducts.length > 0 ? sortedProducts[0] : null;
      const leastSoldProduct = sortedProducts.length > 0 ? sortedProducts[sortedProducts.length - 1] : null;

      // Peak hour (based on opened_at)
      const hourCounts: Record<number, number> = {};
      paidAccounts.forEach((acc) => {
        const hour = new Date(acc.opened_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      let peakHour: { hour: number; count: number } | null = null;
      Object.entries(hourCounts).forEach(([hour, count]) => {
        if (!peakHour || count > peakHour.count) {
          peakHour = { hour: parseInt(hour), count };
        }
      });

      return {
        totalRevenue,
        mostSoldProduct,
        leastSoldProduct,
        peakHour,
        totalAccounts: paidAccounts.length,
      };
    },
  });
}
