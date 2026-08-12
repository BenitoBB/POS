'use client';

import { useState, useEffect } from 'react';
import { useCreateProduct, useUpdateProduct } from '@/lib/hooks/useProducts';
import type { Product } from '@/types';

interface ProductFormProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductForm({ product, isOpen, onClose }: ProductFormProps) {
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price.toString());
    } else {
      setName('');
      setPrice('');
    }
    setErrorMsg('');
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const parsedPrice = parseFloat(price);
    if (!name.trim()) {
      setErrorMsg('El nombre es requerido.');
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setErrorMsg('El precio debe ser un número válido mayor o igual a 0.');
      return;
    }

    try {
      if (product) {
        await updateMutation.mutateAsync({
          id: product.id,
          name: name.trim(),
          price: parsedPrice,
        });
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          price: parsedPrice,
        });
      }
      onClose();
    } catch (err) {
      setErrorMsg((err as Error).message);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h3 className="text-lg font-bold">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <button onClick={onClose} className="btn-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-[var(--danger-bg)] text-[var(--danger)] text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">
              Nombre del producto *
            </label>
            <input
              type="text"
              placeholder="Ej. Torta de Pastor, Taco de Asada..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">
              Precio ($ MXN) *
            </label>
            <input
              type="number"
              step="0.50"
              min="0"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input font-mono"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button type="button" onClick={onClose} className="btn btn-ghost flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="btn btn-primary flex-1">
              {isPending ? 'Guardando...' : product ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
