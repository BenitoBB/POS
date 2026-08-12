'use client';

import { useState } from 'react';
import { useAccounts, useCreateAccount } from '@/lib/hooks/useAccounts';
import AccountCard from '@/components/cuentas/AccountCard';
import AccountDetail from '@/components/cuentas/AccountDetail';

export default function CuentasPage() {
  const { data: accounts = [], isLoading, error } = useAccounts();
  const createAccountMutation = useCreateAccount();
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Selected account object
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || null;

  // Add new account handler (Cuenta N)
  const handleAddAccount = async () => {
    const nextNumber = accounts.length + 1;
    const newAccount = await createAccountMutation.mutateAsync(`Cuenta ${nextNumber}`);
    if (newAccount) {
      setSelectedAccountId(newAccount.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
            Cuentas Activas
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Toca una cuenta para abrirla, agregar productos o saldar la venta
          </p>
        </div>

        {/* Add Account Button (+ Botón) */}
        <button
          onClick={handleAddAccount}
          disabled={createAccountMutation.isPending}
          className="btn btn-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/><path d="M12 5v14"/>
          </svg>
          <span>Nueva Cuenta</span>
        </button>
      </div>

      {/* Grid of Account Cards */}
      {isLoading ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <div className="inline-block w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium">Cargando cuentas...</p>
        </div>
      ) : error ? (
        <div className="glass-card p-6 text-center text-[var(--danger)]">
          <p className="font-bold">Error al cargar cuentas</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{(error as Error).message}</p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger-children">
            {accounts.map((acc) => (
              <AccountCard
                key={acc.id}
                account={acc}
                isSelected={selectedAccountId === acc.id}
                onSelect={() => setSelectedAccountId(acc.id)}
              />
            ))}
          </div>

          {accounts.length === 0 && (
            <div className="glass-card empty-state py-12">
              <p className="text-base font-semibold">No hay cuentas abiertas</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Haz clic en &quot;Nueva Cuenta&quot; para abrir una slot</p>
            </div>
          )}
        </div>
      )}

      {/* Modal / Bottom Sheet view when an account is selected */}
      {selectedAccount && (
        <AccountDetail
          account={selectedAccount}
          onCloseDetail={() => setSelectedAccountId(null)}
        />
      )}
    </div>
  );
}
