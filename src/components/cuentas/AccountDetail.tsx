'use client';

import { useState } from 'react';
import { useAccountItems, useUpdateItemQuantity, useRemoveAccountItem } from '@/lib/hooks/useAccountItems';
import { useUpdateAccountLabel, useCloseAccount, useDeleteAccount } from '@/lib/hooks/useAccounts';
import { formatCurrency, formatTime } from '@/lib/utils';
import type { Account } from '@/types';
import AddProductModal from './AddProductModal';

interface AccountDetailProps {
  account: Account;
  onCloseDetail: () => void;
}

export default function AccountDetail({ account, onCloseDetail }: AccountDetailProps) {
  const { data: items = [], total, isLoading } = useAccountItems(account.id);
  const updateQuantityMutation = useUpdateItemQuantity();
  const removeItemMutation = useRemoveAccountItem();
  const updateLabelMutation = useUpdateAccountLabel();
  const closeAccountMutation = useCloseAccount();
  const deleteAccountMutation = useDeleteAccount();

  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelValue, setLabelValue] = useState(account.label);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'saldar' | 'cancelar' | 'eliminar' | null>(null);

  // Label edit handler
  const handleSaveLabel = async () => {
    if (!labelValue.trim()) return;
    await updateLabelMutation.mutateAsync({ id: account.id, label: labelValue.trim() });
    setIsEditingLabel(false);
  };

  // Quantity step handler
  const handleStepQuantity = async (itemId: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    await updateQuantityMutation.mutateAsync({
      itemId,
      quantity: newQty,
      accountId: account.id,
    });
  };

  // Close account handler (Saldar / Cancelar)
  const handleExecuteClose = async (status: 'pagada' | 'cancelada') => {
    await closeAccountMutation.mutateAsync({
      id: account.id,
      status,
      label: account.label,
    });
    setConfirmAction(null);
    onCloseDetail();
  };

  // Delete account handler
  const handleExecuteDelete = async () => {
    await deleteAccountMutation.mutateAsync(account.id);
    setConfirmAction(null);
    onCloseDetail();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[var(--bg-overlay)] backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={onCloseDetail}
    >
      <div
        className="w-full sm:max-w-2xl h-[90dvh] sm:h-auto sm:max-h-[85dvh] bg-[var(--bg-secondary)] border-t sm:border border-[var(--border)] rounded-t-[28px] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up sm:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TikTok / TAKO-style Bottom Sheet Drag Handle (Mobile only) */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-[var(--border-hover)] opacity-70"></div>
        </div>

        {/* Header / Account Label & Top Actions */}
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-[var(--border)] shrink-0 min-h-[64px] flex items-center">
          {isEditingLabel ? (
            <div className="w-full flex items-center gap-2 animate-fade-in">
              <input
                type="text"
                value={labelValue}
                onChange={(e) => setLabelValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveLabel()}
                className="input py-2 px-3 text-base sm:text-lg font-bold flex-1 border-[var(--accent)] bg-[var(--bg-input)]"
                placeholder="Nombre de la cuenta..."
                autoFocus
              />
              <button
                onClick={handleSaveLabel}
                disabled={updateLabelMutation.isPending}
                className="btn btn-primary py-2 px-3 sm:px-4 text-xs sm:text-sm font-bold shrink-0"
              >
                {updateLabelMutation.isPending ? '...' : 'Guardar'}
              </button>
              <button
                onClick={() => setIsEditingLabel(false)}
                className="btn-icon w-9 h-9 shrink-0"
                title="Cancelar edición"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-[11px] text-[var(--text-muted)] font-mono block">
                  Abierta a las {formatTime(account.opened_at)}
                </span>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight truncate">
                    {account.label}
                  </h2>
                  <button
                    onClick={() => {
                      setLabelValue(account.label);
                      setIsEditingLabel(true);
                    }}
                    className="btn-icon w-7 h-7 shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    title="Renombrar cuenta"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Top Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="btn btn-primary py-2 px-3 text-xs sm:text-sm font-semibold"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" /><path d="M12 5v14" />
                  </svg>
                  <span>Agregar</span>
                </button>
                <button
                  onClick={onCloseDetail}
                  className="btn-icon w-9 h-9"
                  title="Cerrar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Items List (Scrollable Area) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 min-h-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Productos en la cuenta ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </h3>
            {items.length > 0 && (
              <span className="text-xs text-[var(--accent)] font-semibold">
                Toca +/- para ajustar
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-sm text-[var(--text-muted)]">Cargando productos...</div>
          ) : items.length === 0 ? (
            <div className="empty-state py-12">
              <svg className="w-12 h-12 text-[var(--text-muted)] opacity-50 mb-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              <p className="text-sm font-medium">La cuenta está vacía</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Presiona &quot;Agregar&quot; para añadir productos</p>
            </div>
          ) : (
            <div className="space-y-2.5 stagger-children">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--border)] gap-3 hover:border-[var(--border-hover)] transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm sm:text-base text-[var(--text-primary)] truncate">
                      {item.product_name_snapshot}
                    </h4>
                    <span className="text-xs text-[var(--text-muted)] font-mono">
                      {formatCurrency(item.unit_price_snapshot)} c/u
                    </span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="qty-stepper">
                    <button
                      onClick={() => handleStepQuantity(item.id, item.quantity, -1)}
                      title="Disminuir"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => handleStepQuantity(item.id, item.quantity, 1)}
                      title="Aumentar"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal & Delete */}
                  <div className="flex items-center gap-2 sm:gap-3 text-right">
                    <span className="font-bold font-mono text-sm sm:text-base text-[var(--text-primary)] min-w-[64px]">
                      {formatCurrency(item.subtotal)}
                    </span>
                    <button
                      onClick={() => removeItemMutation.mutate({ itemId: item.id, accountId: account.id })}
                      className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors p-1"
                      title="Quitar ítem"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Total & Checkout Actions */}
        <div className="p-4 sm:p-5 border-t border-[var(--border)] bg-[var(--bg-secondary)] space-y-3 shrink-0">
          {/* Total Summary */}
          <div className="flex items-center justify-between bg-[var(--glass-bg)] px-4 py-3 rounded-xl border border-[var(--border)]">
            <div>
              <span className="text-[10px] text-[var(--text-muted)] block uppercase font-semibold">
                Total Acumulado
              </span>
              <span className="text-[11px] text-[var(--text-secondary)]">Efectivo</span>
            </div>
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[var(--accent)]">
              {formatCurrency(total)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Pagar button */}
            <button
              onClick={() => setConfirmAction('saldar')}
              disabled={items.length === 0}
              className="btn btn-success py-3 col-span-2 text-sm sm:text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Pagar cuenta</span>
            </button>

            {/* Cancelar button */}
            <button
              onClick={() => setConfirmAction('cancelar')}
              className="btn btn-ghost py-3 text-xs sm:text-sm text-[var(--danger)] hover:bg-[var(--danger-bg)] border-[var(--border)]"
            >
              <span>Cancelar</span>
            </button>
          </div>

          {/* Delete Slot link */}
          <div className="text-center pt-0.5">
            <button
              onClick={() => setConfirmAction('eliminar')}
              className="text-[11px] text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors underline"
            >
              Eliminar esta cuenta
            </button>
          </div>
        </div>

        {/* Confirmation Modal (z-[60]) */}
        {confirmAction && (
          <div className="fixed inset-0 z-[60] bg-[var(--bg-overlay)] backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setConfirmAction(null)}>
            <div className="modal-content p-6 space-y-4 max-w-sm" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold">
                {confirmAction === 'saldar' && '¿Saldar esta cuenta?'}
                {confirmAction === 'cancelar' && '¿Cancelar esta cuenta?'}
                {confirmAction === 'eliminar' && '¿Eliminar este slot de cuenta?'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {confirmAction === 'saldar' && `Se registrará la venta de ${formatCurrency(total)} pagada en efectivo. El slot "${account.label}" se reiniciará a $0.`}
                {confirmAction === 'cancelar' && `La cuenta "${account.label}" se guardará en el historial como CANCELADA ($0) y se reiniciará.`}
                {confirmAction === 'eliminar' && `Se eliminará el slot "${account.label}" de la pantalla.`}
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="btn btn-ghost flex-1 py-2 text-xs"
                >
                  Volver
                </button>
                {confirmAction === 'saldar' && (
                  <button
                    onClick={() => handleExecuteClose('pagada')}
                    disabled={closeAccountMutation.isPending}
                    className="btn btn-success flex-1 py-2 text-xs"
                  >
                    {closeAccountMutation.isPending ? 'Saldando...' : 'Saldar'}
                  </button>
                )}
                {confirmAction === 'cancelar' && (
                  <button
                    onClick={() => handleExecuteClose('cancelada')}
                    disabled={closeAccountMutation.isPending}
                    className="btn btn-danger flex-1 py-2 text-xs"
                  >
                    {closeAccountMutation.isPending ? 'Cancelando...' : 'Cancelar'}
                  </button>
                )}
                {confirmAction === 'eliminar' && (
                  <button
                    onClick={handleExecuteDelete}
                    disabled={deleteAccountMutation.isPending}
                    className="btn btn-danger flex-1 py-2 text-xs"
                  >
                    {deleteAccountMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Product Modal (z-[60]) */}
        <AddProductModal
          accountId={account.id}
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      </div>
    </div>
  );
}
