import { z } from 'zod';

export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  price: z
    .number({ message: 'El precio debe ser un número' })
    .min(0, 'El precio no puede ser negativo')
    .max(99999, 'El precio es demasiado alto'),
});

export const accountLabelSchema = z.object({
  label: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
});

export const addItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z
    .number()
    .int('La cantidad debe ser un número entero')
    .min(1, 'La cantidad mínima es 1')
    .max(999, 'La cantidad máxima es 999'),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type AccountLabelValues = z.infer<typeof accountLabelSchema>;
export type AddItemValues = z.infer<typeof addItemSchema>;
