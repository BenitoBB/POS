'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { AccountItem } from '@/types';
import { saveAccountItemsLocal, clearAccountItemsLocal } from '@/lib/storage';

export function useAccountItems(accountId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['account-items', accountId],
    queryFn: async (): Promise<AccountItem[]> => {
      if (!accountId) return [];
      const { data, error } = await supabase
        .from('account_items')
        .select('*')
        .eq('account_id', accountId)
        .order('id', { ascending: true });
      if (error) throw error;
      // Backup to localStorage
      if (data) saveAccountItemsLocal(accountId, data);
      return data || [];
    },
    enabled: !!accountId,
  });

  // Realtime subscription for account items
  useEffect(() => {
    if (!accountId) return;

    const channelId = `account-items-${accountId}-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'account_items',
          filter: `account_id=eq.${accountId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['account-items', accountId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [accountId, queryClient]);

  // Calculate total
  const total = (query.data || []).reduce((sum, item) => sum + Number(item.subtotal), 0);

  return { ...query, total };
}

export function useAddAccountItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      account_id: string;
      product_id: string;
      product_name_snapshot: string;
      unit_price_snapshot: number;
      quantity: number;
    }) => {
      // Check if product already in account
      const { data: existing } = await supabase
        .from('account_items')
        .select('id, quantity')
        .eq('account_id', data.account_id)
        .eq('product_id', data.product_id)
        .single();

      if (existing) {
        // Update quantity
        const { error } = await supabase
          .from('account_items')
          .update({ quantity: existing.quantity + data.quantity })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from('account_items')
          .insert({
            account_id: data.account_id,
            product_id: data.product_id,
            product_name_snapshot: data.product_name_snapshot,
            unit_price_snapshot: data.unit_price_snapshot,
            quantity: data.quantity,
          });
        if (error) throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['account-items', variables.account_id] });
    },
  });
}

export function useUpdateItemQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, quantity, accountId }: { itemId: string; quantity: number; accountId: string }) => {
      if (quantity <= 0) {
        const { error } = await supabase
          .from('account_items')
          .delete()
          .eq('id', itemId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('account_items')
          .update({ quantity })
          .eq('id', itemId);
        if (error) throw error;
      }
      return accountId;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['account-items', variables.accountId] });
    },
  });
}

export function useRemoveAccountItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, accountId }: { itemId: string; accountId: string }) => {
      const { error } = await supabase
        .from('account_items')
        .delete()
        .eq('id', itemId);
      if (error) throw error;
      clearAccountItemsLocal(accountId);
      return accountId;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['account-items', variables.accountId] });
    },
  });
}
