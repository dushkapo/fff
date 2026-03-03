import { z } from 'zod';

export const orderSchema = z.object({
    name: z.string().min(2, 'Имя должно быть не менее 2 символов'),
    phone: z.string().min(10, 'Введите корректный номер телефона'),
    address: z.string().optional(),
    deliveryType: z.enum(['delivery', 'pickup']),
    timeType: z.enum(['urgent', 'specific']),
    specificTime: z.string().optional(),
    comment: z.string().optional(),
    productId: z.union([z.string(), z.number()]).transform((val) => String(val)),
    productName: z.string(),
    productPrice: z.number(),
});

// Schema for custom bouquet orders
export const customBouquetOrderSchema = z.object({
    type: z.literal('custom_bouquet'),
    customerName: z.string().min(2, 'Имя должно быть не менее 2 символов'),
    customerPhone: z.string().min(10, 'Введите корректный номер телефона'),
    deliveryType: z.enum(['delivery', 'pickup']),
    address: z.string().optional(),
    comment: z.string().optional(),
    items: z.string(), // Flower list as string
    total: z.number(),
});

export type OrderData = z.infer<typeof orderSchema>;
export type CustomBouquetOrderData = z.infer<typeof customBouquetOrderSchema>;
