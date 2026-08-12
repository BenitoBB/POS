'use client';

import { useState } from 'react';
import { useProducts } from '@/lib/hooks/useProducts';
import { useAddAccountItem } from '@/lib/hooks/useAccountItems';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

interface AddProductModalProps {
  accountId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddProductModal({ accountId, isOpen, onClose }: AddProductModalProps) {
  const { activeProducts, isLoading } = useProducts();
  const addItemMutation = useAddAccountItem();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredProducts = activeProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleConfirmAdd = async () => {
    if (!selectedProduct) return;

    await addItemMutation.mutateAsync({
      account_id: accountId,
      product_id: selectedProduct.id,
      product_name_snapshot: selectedProduct.name,
      unit_price_snapshot: selectedProduct.price,
      quantity,
    });

    // Reset and close
    setSelectedProduct(null);
    setQuantity(1);
    onClose();
  };

  return (
    <div className="modal-overlay z-[60]" onClick={onClose}>
      <div
        className="modal-content p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h3 className="text-lg font-bold">Agregar Producto</h3>
          <button onClick={onClose} className="btn-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
          <svg className="absolute left-3 top-3.5 text-[var(--text-muted)]" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
        </div>

        {/* Product List */}
        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
          {isLoading ? (
            <div className="text-center py-6 text-sm text-[var(--text-muted)]">Cargando productos...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-6 text-sm text-[var(--text-muted)]">
              {search ? 'No se encontraron productos' : 'No hay productos disponibles. Agrégalos en el menú de Productos.'}
            </div>
          ) : (
            filteredProducts.map((p) => {
              const isSelected = selectedProduct?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectProduct(p)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-[var(--accent)] bg-[var(--accent-glow)]'
                      : 'border-[var(--border)] bg-[var(--glass-bg)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  <span className="font-semibold text-sm">{p.name}</span>
                  <span className="font-bold font-mono text-[var(--accent)]">
                    {formatCurrency(p.price)}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Quantity and Confirm */}
        {selectedProduct && (
          <div className="space-y-4 pt-3 border-t border-[var(--border)] animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--text-muted)]">Producto seleccionado</p>
                <p className="font-bold text-sm">{selectedProduct.name}</p>
              </div>

              {/* Quantity Stepper */}
              <div className="qty-stepper">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm bg-[var(--glass-bg)] p-3 rounded-xl">
              <span className="text-[var(--text-secondary)]">Subtotal:</span>
              <span className="font-bold font-mono text-base text-[var(--accent)]">
                {formatCurrency(selectedProduct.price * quantity)}
              </span>
            </div>

            <button
              onClick={handleConfirmAdd}
              disabled={addItemMutation.isPending}
              className="btn btn-primary w-full py-3"
            >
              {addItemMutation.isPending ? 'Agregando...' : `Agregar ${quantity} a la cuenta`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
