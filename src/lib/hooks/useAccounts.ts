'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Account } from '@/types';

export function useAccounts() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['accounts', 'open'],
    queryFn: async (): Promise<Account[]> => {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('status', 'abierta')
        .order('opened_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Realtime subscription for accounts
  useEffect(() => {
    const channelId = `accounts-realtime-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'accounts' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['accounts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (label: string) => {
      const { data, error } = await supabase
        .from('accounts')
        .insert({ label, status: 'abierta' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useUpdateAccountLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, label }: { id: string; label: string }) => {
      const { error } = await supabase
        .from('accounts')
        .update({ label })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useCloseAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, label }: { id: string; status: 'pagada' | 'cancelada'; label: string }) => {
      // Get the total from items
      const { data: items, error: itemsError } = await supabase
        .from('account_items')
        .select('subtotal')
        .eq('account_id', id);
      if (itemsError) throw itemsError;

      const total = (items || []).reduce((sum, item) => sum + Number(item.subtotal), 0);

      // Close the account
      const { error: closeError } = await supabase
        .from('accounts')
        .update({
          status,
          total,
          closed_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (closeError) throw closeError;

      // Create a new open account with the same label
      const { error: newError } = await supabase
        .from('accounts')
        .insert({ label, status: 'abierta' });
      if (newError) throw newError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['account-items'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Delete account items first (cascade should handle it, but be explicit)
      const { error: itemsError } = await supabase
        .from('account_items')
        .delete()
        .eq('account_id', id);
      if (itemsError) throw itemsError;

      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['account-items'] });
    },
  });
}
