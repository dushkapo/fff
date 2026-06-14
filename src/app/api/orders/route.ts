import { NextResponse } from 'next/server';
import { orderSchema, customBouquetOrderSchema } from '@/lib/validations';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// Rate limiting: max 3 orders per IP per 5 minutes
const MAX_ORDERS = 3;
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes

// Sanitize user input for Telegram HTML messages (prevent injection)
function sanitizeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export async function POST(request: Request) {
    try {
        // Rate limiting
        const ip = getClientIp(request);

        const { allowed } = await rateLimit(`order:${ip}`, MAX_ORDERS, WINDOW_MS);
        if (!allowed) {
            return NextResponse.json(
                { error: 'Слишком много заказов. Попробуйте через 5 минут.' },
                { status: 429, headers: { 'Retry-After': '300' } }
            );
        }

        const body = await request.json();

        let message: string;
        let dbRecord: Record<string, any>;

        // Check if it's a custom bouquet order
        if (body.type === 'custom_bouquet') {
            const order = customBouquetOrderSchema.parse(body);
            const deliveryText = order.deliveryType === 'delivery' ? '🚚 Доставка' : '🏪 Самовывоз';

            dbRecord = {
                customer_name: order.customerName,
                customer_phone: order.customerPhone,
                product_name: 'Авторский букет',
                product_price: order.total,
                delivery_type: order.deliveryType,
                address: order.address || null,
                comment: order.comment || null,
                order_type: 'custom_bouquet',
                items: order.items,
            };

            message = `
🌸 <b>НОВЫЙ ЗАКАЗ — АВТОРСКИЙ БУКЕТ</b> 🌸

💐 <b>Состав букета:</b>
${sanitizeHtml(order.items)}

💰 <b>Сумма:</b> ${order.total.toLocaleString('ka-GE')} GEL

👤 <b>Клиент:</b> ${sanitizeHtml(order.customerName)}
📞 <b>Телефон:</b> ${sanitizeHtml(order.customerPhone)}
${order.address ? `📍 <b>Адрес:</b> ${sanitizeHtml(order.address)}` : ''}

${deliveryText}

${order.comment ? `💬 <b>Комментарий:</b> ${sanitizeHtml(order.comment)}` : ''}
`.trim();
        } else {
            // Regular bouquet order
            const order = orderSchema.parse(body);
            const deliveryText = order.deliveryType === 'delivery' ? '🚚 Доставка' : '🏪 Самовывоз';
            const timeText = order.timeType === 'urgent'
                ? '⚡ Срочно (в течение 2 часов)'
                : `🕐 К времени: ${sanitizeHtml(order.specificTime || '')}`;

            dbRecord = {
                customer_name: order.name,
                customer_phone: order.phone,
                product_id: order.productId,
                product_name: order.productName,
                product_price: order.productPrice,
                delivery_type: order.deliveryType,
                address: order.address || null,
                time_type: order.timeType,
                specific_time: order.specificTime || null,
                comment: order.comment || null,
                order_type: 'bouquet',
            };

            message = `
🌸 <b>НОВЫЙ ЗАКАЗ</b> 🌸

📦 <b>Букет:</b> ${sanitizeHtml(order.productName)}
💰 <b>Сумма:</b> ${order.productPrice.toLocaleString('ka-GE')} GEL

👤 <b>Клиент:</b> ${sanitizeHtml(order.name)}
📞 <b>Телефон:</b> ${sanitizeHtml(order.phone)}
${order.address ? `📍 <b>Адрес:</b> ${sanitizeHtml(order.address)}` : ''}

${deliveryText}
${timeText}

${order.comment ? `💬 <b>Комментарий:</b> ${sanitizeHtml(order.comment)}` : ''}
`.trim();
        }

        // Save order to database FIRST (even if Telegram fails, order is not lost)
        const { error: dbError } = await supabaseAdmin.from('orders').insert(dbRecord);
        if (dbError) {
            console.error('Failed to save order to DB:', dbError);
            // Don't block the order — still send to Telegram
        }

        // Send to Telegram
        const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!telegramToken || !chatId) {
            console.error('Telegram credentials not configured');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const telegramResponse = await fetch(
            `https://api.telegram.org/bot${telegramToken}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML',
                }),
                signal: controller.signal,
            }
        );

        clearTimeout(timeoutId);

        if (!telegramResponse.ok) {
            const error = await telegramResponse.text();
            console.error('Telegram API error:', error);
            return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Order API error:', error);
        return NextResponse.json(
            { error: 'Не удалось оформить заказ. Проверьте данные и попробуйте снова.' },
            { status: 400 }
        );
    }
}
