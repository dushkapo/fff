import { NextResponse } from 'next/server';
import { orderSchema, customBouquetOrderSchema } from '@/lib/validations';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        let message: string;

        // Check if it's a custom bouquet order
        if (body.type === 'custom_bouquet') {
            const order = customBouquetOrderSchema.parse(body);
            const deliveryText = order.deliveryType === 'delivery' ? '🚚 Доставка' : '🏪 Самовывоз';

            message = `
🌸 <b>НОВЫЙ ЗАКАЗ — АВТОРСКИЙ БУКЕТ</b> 🌸

💐 <b>Состав букета:</b>
${order.items}

💰 <b>Сумма:</b> ${order.total.toLocaleString('ru-RU')} ₽

👤 <b>Клиент:</b> ${order.customerName}
📞 <b>Телефон:</b> ${order.customerPhone}
${order.address ? `📍 <b>Адрес:</b> ${order.address}` : ''}

${deliveryText}

${order.comment ? `💬 <b>Комментарий:</b> ${order.comment}` : ''}
`.trim();
        } else {
            // Regular bouquet order
            const order = orderSchema.parse(body);
            const deliveryText = order.deliveryType === 'delivery' ? '🚚 Доставка' : '🏪 Самовывоз';
            const timeText = order.timeType === 'urgent'
                ? '⚡ Срочно (в течение 2 часов)'
                : `🕐 К времени: ${order.specificTime}`;

            message = `
🌸 <b>НОВЫЙ ЗАКАЗ</b> 🌸

📦 <b>Букет:</b> ${order.productName}
💰 <b>Сумма:</b> ${order.productPrice.toLocaleString('ru-RU')} ₽

👤 <b>Клиент:</b> ${order.name}
📞 <b>Телефон:</b> ${order.phone}
${order.address ? `📍 <b>Адрес:</b> ${order.address}` : ''}

${deliveryText}
${timeText}

${order.comment ? `💬 <b>Комментарий:</b> ${order.comment}` : ''}
`.trim();
        }

        // Send to Telegram
        const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!telegramToken || !chatId) {
            console.error('Telegram credentials not configured');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

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
            }
        );

        if (!telegramResponse.ok) {
            const error = await telegramResponse.text();
            console.error('Telegram API error:', error);
            return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Order API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 400 }
        );
    }
}
