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

export type OrderData = z.infer<typeof orderSchema>;
