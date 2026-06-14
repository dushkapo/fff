import { z } from 'zod';

// Phone regex: Georgian format +995 XXX XXX XXX (with or without spaces)
const phoneRegex = /^\+?995\s?\d{3}\s?\d{3}\s?\d{3}$/;

export const orderSchema = z.object({
    name: z.string().min(2, 'Имя должно быть не менее 2 символов').max(100),
    phone: z.string().min(10, 'Введите корректный номер телефона').max(20)
        .regex(/^\+?[\d\s\-]{9,20}$/, 'Некорректный формат номера'),
    address: z.string().max(500).optional(),
    deliveryType: z.enum(['delivery', 'pickup']),
    timeType: z.enum(['urgent', 'specific']),
    specificTime: z.string().max(100).optional(),
    comment: z.string().max(1000).optional(),
    productId: z.union([z.string(), z.number()]).transform((val) => String(val)),
    productName: z.string().max(200),
    productPrice: z.number().positive().max(9999999),
});

// Schema for custom bouquet orders
export const customBouquetOrderSchema = z.object({
    type: z.literal('custom_bouquet'),
    customerName: z.string().min(2, 'Имя должно быть не менее 2 символов').max(100),
    customerPhone: z.string().min(10, 'Введите корректный номер телефона').max(20),
    deliveryType: z.enum(['delivery', 'pickup']),
    address: z.string().max(500).optional(),
    comment: z.string().max(1000).optional(),
    items: z.string().max(5000), // Flower list as string
    total: z.number().positive().max(9999999),
});

// Schema for shop settings update (whitelist of editable fields)
export const settingsSchema = z.object({
    shop_open: z.boolean().optional(),
    delivery_enabled: z.boolean().optional(),
    shop_name: z.string().max(200).optional(),
    hero_title: z.string().max(300).optional(),
    hero_subtitle: z.string().max(500).optional(),
    phone: z.string().max(50).optional(),
    telegram_link: z.string().max(500).optional(),
    address: z.string().max(500).optional(),
    address_link: z.string().max(1000).optional(),
    schedule: z.string().max(300).optional(),
    about_enabled: z.boolean().optional(),
    about_text: z.string().max(5000).optional(),
    schedule_enabled: z.boolean().optional(),
    delivery_price_enabled: z.boolean().optional(),
    delivery_price: z.string().max(200).optional(),
    delivery_info: z.string().max(2000).optional(),
    pickup_info: z.string().max(2000).optional(),
    payment_info: z.string().max(2000).optional(),
}).strict();

export type OrderData = z.infer<typeof orderSchema>;
export type CustomBouquetOrderData = z.infer<typeof customBouquetOrderSchema>;
export type SettingsData = z.infer<typeof settingsSchema>;
