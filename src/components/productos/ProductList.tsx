'use client';

import { useState } from 'react';
import { useProducts, useUpdateProduct, useDeleteProduct } from '@/lib/hooks/useProducts';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';
import ProductForm from './ProductForm';

export default function ProductList() {
  const { data: products = [], isLoading, error } = useProducts();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleActive = async (product: Product) => {
    await updateMutation.mutateAsync({
      id: product.id,
      is_active: !product.is_active,
    });
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
            Catálogo de Productos
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Crea, edita o desactiva los productos disponibles en tu puesto
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setIsFormOpen(true);
          }}
          className="btn btn-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/><path d="M12 5v14"/>
          </svg>
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Buscar producto por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
        />
        <svg className="absolute left-3 top-3.5 text-[var(--text-muted)]" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
      </div>

      {/* Product Grid / Table */}
      {isLoading ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <div className="inline-block w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium">Cargando catálogo...</p>
        </div>
      ) : error ? (
        <div className="glass-card p-6 text-center text-[var(--danger)]">
          <p className="font-bold">Error al cargar productos</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{(error as Error).message}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="glass-card empty-state py-12">
          <svg className="w-12 h-12 text-[var(--text-muted)] opacity-50 mb-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m7.5 4.27 9 5.15"/>
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
          </svg>
          <p className="text-base font-semibold">
            {search ? 'No hay coincidencia' : 'No hay productos registrados'}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {search ? 'Prueba con otro término' : 'Haz clic en "Nuevo Producto" para agregar el primero'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger-children">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className={`glass-card p-5 space-y-3 flex flex-col justify-between transition-all ${
                !p.is_active ? 'opacity-50 grayscale' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`badge ${p.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {p.is_active ? 'Disponible' : 'Inactivo'}
                  </span>
                  <button
                    onClick={() => handleToggleActive(p)}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] underline"
                  >
                    {p.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
                <h3 className="font-bold text-lg text-[var(--text-primary)]">{p.name}</h3>
              </div>

              <div className="flex items-end justify-between pt-3 border-t border-[var(--border)]">
                <span className="text-2xl font-black font-mono text-[var(--accent)]">
                  {formatCurrency(p.price)}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingProduct(p);
                      setIsFormOpen(true);
                    }}
                    className="btn-icon w-8 h-8"
                    title="Editar producto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(p.id)}
                    className="btn-icon w-8 h-8 hover:text-[var(--danger)] hover:border-[var(--danger-bg)]"
                    title="Eliminar producto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-content p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[var(--danger)]">¿Eliminar Producto?</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Esta acción no se puede deshacer. Los registros históricos conservarán el nombre y precio original.
            </p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setDeleteConfirmId(null)} className="btn btn-ghost flex-1">
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleteMutation.isPending}
                className="btn btn-danger flex-1"
              >
                {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <ProductForm
        product={editingProduct}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
      />
    </div>
  );
}
